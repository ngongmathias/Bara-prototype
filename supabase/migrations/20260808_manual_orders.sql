-- ============================================================
-- Manual orders — "reserve now, settle offline" until Phase 15
-- ============================================================
-- There is no payment processing yet (Phase 15 / Flutterwave). Buyers already
-- settle by MoMo or cash, which is normal here — what was broken is that a
-- request went into a void:
--
--   * Marketplace "Buy Now" inserted a marketplace_transactions row from the
--     browser and notified NOBODY. No notification, no email, no trigger.
--     Zero transactions have ever been created against 61 active listings.
--   * The advertise checkout persisted nothing at all.
--   * 10 event registrations have sat 'pending' since February 2026 with no
--     organizer confirmation — the same silent stall, already in production.
--
-- This migration makes every money request durable, attributable and *visible
-- to someone who can act on it*, using the shape Phase 15 will extend rather
-- than replace.
--
-- CONVERGENCE WITH PHASE 15 (MASTER_PLAN_ARCHIVE_2 §15):
--   15.6 "Transaction status expansion" specifies exactly these columns on
--   marketplace_transactions: payment_reference, payment_method, payment_status,
--   commission_amount. They are added here with those names, so the Phase 15
--   migration becomes additive instead of a rename.
--   15.4 "Webhook handler" will call marketplace_order_set_payment() — the same
--   function a seller calls by hand today. The seam does not move.
--
-- IDENTITY: these RPCs read the caller from the verified Clerk JWT
-- (request.jwt.claims->>'sub'), following 20260807_create_marketplace_listing_rpc
-- rather than the older p_user_id-argument pattern, which any caller can spoof.
-- Clients must therefore call them through useAuthedSupabase().getClient().
--
-- NOT APPLIED AUTOMATICALLY — run in the Supabase SQL editor (MASTER_PLAN rule 6).
-- ============================================================

SET lock_timeout = '5s';  -- fail fast rather than freezing the site behind a lock

-- ------------------------------------------------------------
-- 0. Shared helpers (redefined so this file has no apply-order dependency)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users
         WHERE user_id = public.clerk_user_id() AND is_active = true
    );
$$;

-- ============================================================
-- 1. Payment columns on marketplace_transactions (Phase 15 task 15.6)
-- ============================================================
-- `status` stays the FULFILMENT lifecycle (pending_seller -> confirmed ->
-- completed). `payment_status` is a separate axis: has the money arrived?
-- Keeping them apart is what lets Phase 15 flip payment automatically without
-- touching fulfilment, and matches the vocabulary event_registrations already
-- uses (payment_status / payment_method).
ALTER TABLE public.marketplace_transactions
    ADD COLUMN IF NOT EXISTS payment_status    TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS payment_method    TEXT NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS payment_reference TEXT,
    ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS paid_at           TIMESTAMPTZ;

DO $$
BEGIN
    -- 'pending'  — reserved, money not yet received
    -- 'confirmed'— seller (or, later, the payment webhook) confirmed receipt
    -- 'refunded' / 'failed' — reserved for Phase 15; harmless to allow now
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'marketplace_transactions_payment_status_check'
    ) THEN
        ALTER TABLE public.marketplace_transactions
            ADD CONSTRAINT marketplace_transactions_payment_status_check
            CHECK (payment_status IN ('pending','confirmed','refunded','failed'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mkt_tx_seller_pending
    ON public.marketplace_transactions (seller_user_id, payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_buyer
    ON public.marketplace_transactions (buyer_user_id, created_at DESC);

-- ============================================================
-- 2. marketplace_reserve — the buyer's request, made durable and visible
-- ============================================================
-- Replaces the browser-side INSERT in BuyNowModal.tsx. Besides notifying the
-- seller (the actual bug), moving this server-side closes the anon INSERT
-- exposure on marketplace_transactions noted in HANDOFF_2026-08-08.
CREATE OR REPLACE FUNCTION public.marketplace_reserve(
    p_listing_id UUID,
    p_variant_id UUID,
    p_quantity   INTEGER,
    p_message    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_buyer     TEXT;
    v_listing   marketplace_listings%ROWTYPE;
    v_unit      NUMERIC(12,2);
    v_qty       INTEGER;
    v_total     NUMERIC(12,2);
    v_tx_id     UUID;
    v_buyer_name TEXT;
BEGIN
    v_buyer := public.clerk_user_id();
    IF v_buyer IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_signed_in');
    END IF;

    SELECT * INTO v_listing FROM marketplace_listings WHERE id = p_listing_id;
    IF NOT FOUND OR v_listing.status <> 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'listing_unavailable');
    END IF;

    IF v_listing.created_by = v_buyer THEN
        RETURN jsonb_build_object('success', false, 'error', 'own_listing');
    END IF;

    v_qty := GREATEST(COALESCE(p_quantity, 1), 1);

    -- Price is taken from the database, never from the client, so a tampered
    -- request cannot reserve a $900 phone for $1.
    v_unit := COALESCE(
        (SELECT price_override FROM marketplace_listing_variants WHERE id = p_variant_id),
        v_listing.price,
        0
    );
    v_total := v_unit * v_qty;

    -- One live reservation per buyer per listing: re-tapping Reserve should not
    -- spam the seller with duplicates.
    SELECT id INTO v_tx_id
      FROM marketplace_transactions
     WHERE listing_id = p_listing_id
       AND buyer_user_id = v_buyer
       AND status = 'pending_seller'
     LIMIT 1;

    IF v_tx_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'id', v_tx_id, 'already_reserved', true);
    END IF;

    INSERT INTO marketplace_transactions (
        listing_id, variant_id, buyer_user_id, seller_user_id,
        status, quantity, amount, currency, buyer_message,
        payment_status, payment_method
    ) VALUES (
        p_listing_id, p_variant_id, v_buyer, v_listing.created_by,
        'pending_seller', v_qty, v_total, COALESCE(v_listing.currency, 'USD'),
        NULLIF(TRIM(COALESCE(p_message, '')), ''),
        'pending', 'manual'
    )
    RETURNING id INTO v_tx_id;

    SELECT COALESCE(NULLIF(TRIM(full_name), ''), username, 'A buyer')
      INTO v_buyer_name
      FROM clerk_users WHERE clerk_user_id = v_buyer;

    -- THE FIX: tell the seller. This is what never happened before.
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        v_listing.created_by,
        'success',
        'New order: ' || v_listing.title,
        COALESCE(v_buyer_name, 'A buyer') || ' reserved ' || v_qty || ' × "' || v_listing.title ||
        '" for ' || COALESCE(v_listing.currency, 'USD') || ' ' || v_total ||
        '. Agree payment with them, then mark it paid.',
        '/marketplace/my-ads'
    );

    -- ...and email them, since a seller may not have the app open. Queued, never
    -- sent from the client (MASTER_PLAN rule 15).
    INSERT INTO email_queue (to_email, subject, html_content, metadata)
    SELECT
        v_listing.seller_email,
        'New order for "' || v_listing.title || '" on BARA',
        '<p>' || COALESCE(v_buyer_name, 'A buyer') || ' reserved <strong>' || v_qty ||
        ' × ' || v_listing.title || '</strong> for ' || COALESCE(v_listing.currency, 'USD') ||
        ' ' || v_total || '.</p><p>Contact them to arrange payment, then mark the order as paid on BARA.</p>',
        jsonb_build_object('type', 'order_placed', 'transaction_id', v_tx_id, 'listing_id', p_listing_id)
    WHERE COALESCE(TRIM(v_listing.seller_email), '') <> '';

    RETURN jsonb_build_object(
        'success', true,
        'id', v_tx_id,
        'amount', v_total,
        'currency', COALESCE(v_listing.currency, 'USD')
    );
END;
$$;

-- ============================================================
-- 3. marketplace_order_set_payment — the seam Phase 15 reuses
-- ============================================================
-- Today a seller taps "Mark as paid" and this runs. When Flutterwave lands, the
-- webhook handler (task 15.4) calls this same function with a payment_reference
-- and the flow is otherwise identical.
CREATE OR REPLACE FUNCTION public.marketplace_order_set_payment(
    p_transaction_id UUID,
    p_payment_status TEXT,
    p_reference      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller TEXT;
    v_tx     marketplace_transactions%ROWTYPE;
    v_title  TEXT;
BEGIN
    v_caller := public.clerk_user_id();
    IF v_caller IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_signed_in');
    END IF;

    IF p_payment_status NOT IN ('pending','confirmed','refunded','failed') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_status');
    END IF;

    SELECT * INTO v_tx FROM marketplace_transactions WHERE id = p_transaction_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;

    -- Only the seller of record, or an active admin, may settle an order.
    IF v_tx.seller_user_id <> v_caller AND NOT public.is_active_admin() THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authorized');
    END IF;

    UPDATE marketplace_transactions
       SET payment_status    = p_payment_status,
           payment_reference = COALESCE(p_reference, payment_reference),
           paid_at           = CASE WHEN p_payment_status = 'confirmed' THEN now() ELSE paid_at END,
           -- Confirming payment also advances fulfilment out of 'pending_seller',
           -- so the buyer isn't left reading "Awaiting seller" after they've paid.
           status            = CASE WHEN p_payment_status = 'confirmed' AND status = 'pending_seller'
                                    THEN 'confirmed' ELSE status END,
           confirmed_at      = CASE WHEN p_payment_status = 'confirmed'
                                    THEN COALESCE(confirmed_at, now()) ELSE confirmed_at END,
           updated_at        = now()
     WHERE id = p_transaction_id;

    IF p_payment_status = 'confirmed' THEN
        SELECT title INTO v_title FROM marketplace_listings WHERE id = v_tx.listing_id;

        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            v_tx.buyer_user_id,
            'success',
            'Payment confirmed',
            'The seller confirmed payment for "' || COALESCE(v_title, 'your order') || '".',
            '/marketplace/my-purchases'
        );

        INSERT INTO email_queue (to_email, subject, html_content, metadata)
        SELECT
            cu.email,
            'Payment confirmed for "' || COALESCE(v_title, 'your order') || '"',
            '<p>The seller has confirmed payment for <strong>' || COALESCE(v_title, 'your order') ||
            '</strong>.</p><p>Arrange collection or delivery with them directly.</p>',
            jsonb_build_object('type', 'order_confirmed', 'transaction_id', p_transaction_id)
          FROM clerk_users cu
         WHERE cu.clerk_user_id = v_tx.buyer_user_id
           AND COALESCE(TRIM(cu.email), '') <> '';
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 4. advertising_requests — stop losing advertise enquiries entirely
-- ============================================================
CREATE TABLE IF NOT EXISTS public.advertising_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL,
    plan          TEXT NOT NULL,
    monthly_usd   NUMERIC(10,2) NOT NULL DEFAULT 0,
    daily_budget  NUMERIC(10,2),
    bid_per_click NUMERIC(10,2),
    contact_email TEXT,
    contact_phone TEXT,
    note          TEXT,
    status        TEXT NOT NULL DEFAULT 'pending_payment'
        CHECK (status IN ('pending_payment','active','declined','expired','cancelled')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advertising_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advertising_requests_select_own" ON public.advertising_requests;
CREATE POLICY "advertising_requests_select_own" ON public.advertising_requests
    FOR SELECT USING (user_id = public.clerk_user_id() OR public.is_active_admin());

-- RPC-only, like verification_requests: no direct client writes.
REVOKE INSERT, UPDATE, DELETE ON public.advertising_requests FROM anon, authenticated;
GRANT SELECT ON public.advertising_requests TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.advertising_request_submit(
    p_plan          TEXT,
    p_monthly_usd   NUMERIC,
    p_daily_budget  NUMERIC,
    p_bid_per_click NUMERIC,
    p_contact_email TEXT,
    p_contact_phone TEXT,
    p_note          TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user TEXT;
    v_id   UUID;
BEGIN
    v_user := public.clerk_user_id();
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_signed_in');
    END IF;

    -- Don't stack duplicate open enquiries from the same person.
    SELECT id INTO v_id FROM advertising_requests
     WHERE user_id = v_user AND status = 'pending_payment' LIMIT 1;
    IF v_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'id', v_id, 'already_requested', true);
    END IF;

    INSERT INTO advertising_requests (
        user_id, plan, monthly_usd, daily_budget, bid_per_click,
        contact_email, contact_phone, note
    ) VALUES (
        v_user, p_plan, COALESCE(p_monthly_usd, 0), p_daily_budget, p_bid_per_click,
        p_contact_email, p_contact_phone, NULLIF(TRIM(COALESCE(p_note, '')), '')
    )
    RETURNING id INTO v_id;

    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT a.user_id, 'info',
           'New advertising request: ' || p_plan,
           'Someone requested the ' || p_plan || ' advertising plan ($' ||
           COALESCE(p_monthly_usd, 0) || '/month). Contact them to complete payment.',
           '/admin/packages'
      FROM admin_users a
     WHERE a.is_active = true;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- ============================================================
-- 5. Organizer notification on event registration
-- ============================================================
-- The buyer-facing emails already exist (handle_event_registration_email).
-- What's missing is the other half — nobody tells the ORGANIZER that someone
-- reserved a paid spot, which is why 10 registrations have sat pending since
-- February with confirmed_at never set on a single row.
--
-- IMPORTANT: only 4 of ~1670 events have created_by_user_id set. The rest are
-- admin-seeded or scraped and have NO owner at all — and every one of those 10
-- stuck registrations is on such an event. A notification to the organizer alone
-- would therefore go nowhere for ~99.8% of events, reproducing the exact bug this
-- is meant to fix. So: notify the organizer when there is one, otherwise fall
-- back to the admin team, who are the de facto organizer for seeded events.
CREATE OR REPLACE FUNCTION public.notify_organizer_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event  events%ROWTYPE;
    v_owner  TEXT;
    v_msg    TEXT;
BEGIN
    IF NEW.payment_status <> 'pending' THEN
        RETURN NEW;  -- free/auto-confirmed registrations need no chasing
    END IF;

    SELECT * INTO v_event FROM events WHERE id = NEW.event_id;
    IF NOT FOUND THEN RETURN NEW; END IF;

    -- created_by_user_id is the Clerk id of the event's creator. organizer_id is
    -- deliberately NOT used as a fallback: it is a UUID foreign key, not a Clerk
    -- id, so writing it into notifications.user_id would create rows no one can
    -- ever read.
    v_owner := NULLIF(TRIM(COALESCE(v_event.created_by_user_id, '')), '');

    v_msg := COALESCE(NEW.user_name, 'Someone') || ' reserved ' || NEW.quantity ||
             ' ticket(s) for "' || COALESCE(v_event.title, 'an event') ||
             '" and needs payment confirming.';

    IF v_owner IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (v_owner, 'info',
                'Ticket reserved: ' || COALESCE(v_event.title, 'your event'),
                v_msg, '/users/organizer/registrations');
    ELSE
        -- Ownerless (seeded/scraped) event — the team is the organizer.
        INSERT INTO notifications (user_id, type, title, message, link)
        SELECT a.user_id, 'info',
               'Ticket reserved on an unowned event',
               v_msg, '/admin/events'
          FROM admin_users a
         WHERE a.is_active = true;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_organizer_on_registration ON public.event_registrations;
CREATE TRIGGER trg_notify_organizer_on_registration
    AFTER INSERT ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.notify_organizer_on_registration();

-- ============================================================
-- 6. Grants
-- ============================================================
GRANT EXECUTE ON FUNCTION public.marketplace_reserve(UUID, UUID, INTEGER, TEXT)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_order_set_payment(UUID, TEXT, TEXT)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.advertising_request_submit(TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clerk_user_id()  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO anon, authenticated;

-- Deliberately NOT callable by anon: every one of these acts on behalf of a
-- signed-in person, and identity comes from the JWT. An anon caller has no
-- 'sub' claim and would only ever get 'not_signed_in' back.
--
-- NOTE: revoking FROM PUBLIC is the part that matters. Postgres grants EXECUTE
-- on every new function to PUBLIC by default and anon inherits it from there,
-- so "REVOKE ... FROM anon" alone is a silent no-op — verified live against this
-- very migration. See 20260808_manual_orders_revoke_fix.sql.
REVOKE EXECUTE ON FUNCTION public.marketplace_reserve(UUID, UUID, INTEGER, TEXT)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.marketplace_order_set_payment(UUID, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.advertising_request_submit(TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon;

-- Close the browser-side INSERT path that BuyNowModal used to use; reservations
-- now only happen through marketplace_reserve above.
REVOKE INSERT ON public.marketplace_transactions FROM anon;
