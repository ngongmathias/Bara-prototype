-- ============================================================
-- Phase 27.8 — COMBINED migration (Marlon meeting decisions, Jul 6 2026)
-- ============================================================
-- Run AFTER 20260706_phase27_gamification.sql and 20260707_anti_abuse.sql.
-- Combines the six 20260708_* files into one, plus Section 7 (full economy
-- tunability: referral + spin amounts as settings, editable mission/
-- achievement rewards). Safe to re-run (idempotent DDL throughout).
-- ============================================================


-- ############################################################
-- SECTION: 20260708_username_unique_index.sql
-- ############################################################

-- Phase 27.8.1 — Auto-proposed usernames: global, case-insensitive uniqueness.
-- Sign-up derives a username from first + last name (client appends the
-- smallest free numeric suffix on collision); this index is the authoritative
-- guard so races and the profile-settings edit path can never create
-- case-insensitive duplicates.

-- 1) Resolve any existing case-insensitive duplicates by appending the
--    smallest free numeric suffix to all but the oldest row, so the unique
--    index below can be created.
DO $$
DECLARE
    dup RECORD;
    candidate TEXT;
    n INT;
BEGIN
    FOR dup IN
        SELECT id, username
        FROM (
            SELECT id, username,
                   ROW_NUMBER() OVER (PARTITION BY lower(username) ORDER BY created_at NULLS LAST, id) AS rn
            FROM clerk_users
            WHERE username IS NOT NULL AND username <> ''
        ) t
        WHERE t.rn > 1
    LOOP
        n := 2;
        LOOP
            candidate := lower(dup.username) || n::text;
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM clerk_users WHERE lower(username) = candidate
            );
            n := n + 1;
        END LOOP;
        UPDATE clerk_users SET username = candidate WHERE id = dup.id;
    END LOOP;
END $$;

-- 2) The guard itself. Partial so legacy rows with no username are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS clerk_users_username_lower_unique
    ON clerk_users (lower(username))
    WHERE username IS NOT NULL AND username <> '';

-- ############################################################
-- SECTION: 20260708_content_rights_acceptance.sql
-- ############################################################

-- Phase 27.8.8 — Legal language for music uploads.
-- Stores when the uploader accepted the rights/ownership declaration
-- ("I confirm I own all rights to this content or am licensed to distribute
-- it, and I accept the BARA Afrika Content Terms" — /content-terms).
-- NULL on legacy rows uploaded before the checkbox existed.

ALTER TABLE public.songs
    ADD COLUMN IF NOT EXISTS rights_accepted_at timestamptz;

-- Album creation is a separate flow with the same declaration.
ALTER TABLE public.albums
    ADD COLUMN IF NOT EXISTS rights_accepted_at timestamptz;

-- ############################################################
-- SECTION: 20260708_leaderboard_payouts.sql
-- ############################################################

-- ============================================================
-- Phase 27.8.7 — Coins for weekly leaderboard ranks
-- ============================================================
-- Extends 27.3.2 (last week's top 10 currently get only the cosmetic Champ
-- crown): the last COMPLETED ISO week's top ranks now also earn coins.
-- Amounts are admin-tunable in gamification_settings; leaderboard_payouts is
-- the idempotency ledger so the RPC is safe to call repeatedly (lazy trigger
-- on first leaderboard read of a new week + optional pg_cron Monday 00:10 UTC).
-- Week anchor: date_trunc('week') = Monday 00:00, same as
-- leaderboard_last_week_top and the weekly mission reset.
-- ============================================================

-- 1. Tunable prize amounts (editable in Admin → Gamification → Economy Settings)
INSERT INTO public.gamification_settings (key, value) VALUES
    ('leaderboard.rank1_coins',    200),
    ('leaderboard.rank2_coins',    100),
    ('leaderboard.rank3_coins',     50),
    ('leaderboard.rank4to10_coins', 20)
ON CONFLICT (key) DO NOTHING;

-- 2. Idempotency ledger — one row per (week, user) ever paid.
CREATE TABLE IF NOT EXISTS public.leaderboard_payouts (
    week_start  DATE NOT NULL,          -- Monday of the week that was WON
    user_id     TEXT NOT NULL,
    rank        INTEGER NOT NULL,
    coins       INTEGER NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (week_start, user_id)
);

ALTER TABLE public.leaderboard_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaderboard_payouts_select" ON public.leaderboard_payouts;
CREATE POLICY "leaderboard_payouts_select" ON public.leaderboard_payouts FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.leaderboard_payouts FROM anon, authenticated;
GRANT SELECT ON public.leaderboard_payouts TO anon, authenticated;
GRANT ALL ON public.leaderboard_payouts TO service_role;

-- 3. The payout RPC. Pays the last completed week's top 10 via
--    economy_add_coins (so Gold bonus + daily caps + history logging apply),
--    records each payment in the ledger, and skips anything already paid.
--    Callable by the tokenless anon client (lazy trigger) — safe because the
--    ledger + advisory lock make it fully idempotent and it can only ever
--    pay the deterministic last-week winners.
CREATE OR REPLACE FUNCTION public.economy_leaderboard_payout()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_week   DATE := (date_trunc('week', now()) - interval '7 days')::date;
    v_paid   INTEGER := 0;
    v_coins  INTEGER;
    v_rank   INTEGER := 0;
    r        RECORD;
BEGIN
    -- One runner at a time (lazy trigger can fire from many clients at once).
    PERFORM pg_advisory_xact_lock(hashtext('leaderboard_payout_' || v_week::text));

    FOR r IN
        SELECT t.user_id, t.weekly_xp
          FROM public.leaderboard_last_week_top(10) t
    LOOP
        v_rank := v_rank + 1;

        CONTINUE WHEN EXISTS (
            SELECT 1 FROM leaderboard_payouts
             WHERE week_start = v_week AND user_id = r.user_id
        );

        v_coins := COALESCE((
            SELECT value::integer FROM gamification_settings
             WHERE key = CASE v_rank
                             WHEN 1 THEN 'leaderboard.rank1_coins'
                             WHEN 2 THEN 'leaderboard.rank2_coins'
                             WHEN 3 THEN 'leaderboard.rank3_coins'
                             ELSE 'leaderboard.rank4to10_coins'
                         END
        ), CASE v_rank WHEN 1 THEN 200 WHEN 2 THEN 100 WHEN 3 THEN 50 ELSE 20 END);

        CONTINUE WHEN v_coins <= 0;

        -- Ledger first — the PK is the idempotency guard.
        INSERT INTO leaderboard_payouts (week_start, user_id, rank, coins)
        VALUES (v_week, r.user_id, v_rank, v_coins)
        ON CONFLICT (week_start, user_id) DO NOTHING;

        IF NOT FOUND THEN
            CONTINUE;
        END IF;

        PERFORM economy_add_coins(
            r.user_id, v_coins,
            'Weekly leaderboard prize — rank ' || v_rank || ' (week of ' || v_week || ')'
        );
        v_paid := v_paid + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'week_start', v_week, 'paid', v_paid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.economy_leaderboard_payout() TO anon, authenticated, service_role;

-- 4. Schedule Mondays 00:10 UTC if pg_cron is installed (safe no-op otherwise
--    — the lazy client trigger covers instances without pg_cron; enable the
--    extension and re-run this block to add the belt-and-braces cron).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        BEGIN
            PERFORM cron.unschedule('leaderboard-payout');
        EXCEPTION WHEN OTHERS THEN
            NULL; -- not scheduled yet
        END;
        PERFORM cron.schedule('leaderboard-payout', '10 0 * * 1', 'SELECT public.economy_leaderboard_payout();');
    END IF;
END $$;

-- ############################################################
-- SECTION: 20260708_coins_barter.sql
-- ############################################################

-- ============================================================
-- Phase 27.8.3 — Coins-as-barter option on marketplace listings
-- ============================================================
-- Merchant opt-in, per product: a seller may offer an ad for coins instead
-- of, or alongside, cash. NOT a currency — no cash-out, no exchange rate.
-- Decided Jul 6 (Mathias): the seller RECEIVES the buyer's coins — a
-- buyer→seller transfer, coins stay in circulation.
-- ============================================================

-- 1. Listing fields (seller sets the coin amount when opting in)
ALTER TABLE public.marketplace_listings
    ADD COLUMN IF NOT EXISTS accepts_coins BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.marketplace_listings
    ADD COLUMN IF NOT EXISTS coin_price INTEGER;

-- 2. Transfer ledger — the idempotency guard: one transfer per (buyer, ref),
--    so a double-clicked "Buy with Coins" can never double-spend.
CREATE TABLE IF NOT EXISTS public.coin_transfers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id TEXT NOT NULL,
    to_user_id   TEXT NOT NULL,
    amount       INTEGER NOT NULL CHECK (amount > 0),
    reason       TEXT,
    ref_id       TEXT,                -- e.g. the marketplace listing id
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS coin_transfers_from_ref_unique
    ON public.coin_transfers (from_user_id, ref_id)
    WHERE ref_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coin_transfers_to_user ON public.coin_transfers (to_user_id);

ALTER TABLE public.coin_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coin_transfers_select" ON public.coin_transfers;
CREATE POLICY "coin_transfers_select" ON public.coin_transfers FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.coin_transfers FROM anon, authenticated;
GRANT SELECT ON public.coin_transfers TO anon, authenticated;
GRANT ALL ON public.coin_transfers TO service_role;

-- 3. The transfer RPC — same SECURITY DEFINER pattern as the 20260705
--    hardening RPCs. Atomic buyer→seller move: rejects self-transfer and
--    insufficient balance, respects the seller's daily coin-gain cap
--    (limit.daily_coin_gain_cap), writes BOTH sides to gamification_history,
--    notifies both parties, and is idempotent per (buyer, ref_id).
--    No Gold bonus on transfers — this moves existing coins, it doesn't mint.
CREATE OR REPLACE FUNCTION public.economy_transfer_coins(
    p_from_user TEXT,
    p_to_user   TEXT,
    p_amount    INTEGER,
    p_reason    TEXT,
    p_ref_id    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_bal      BIGINT;
    v_today    NUMERIC;
    v_cap      NUMERIC;
    v_from_new BIGINT;
    v_to_new   BIGINT;
BEGIN
    IF p_from_user IS NULL OR p_to_user IS NULL OR COALESCE(p_amount, 0) <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid');
    END IF;
    IF p_from_user = p_to_user THEN
        RETURN jsonb_build_object('success', false, 'error', 'self_transfer');
    END IF;

    PERFORM economy_ensure_profile(p_from_user);
    PERFORM economy_ensure_profile(p_to_user);

    -- Idempotency: an existing transfer for this (buyer, ref) is a replay.
    IF p_ref_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM coin_transfers
         WHERE from_user_id = p_from_user AND ref_id = p_ref_id
    ) THEN
        SELECT COALESCE(bara_coins, 0) INTO v_from_new
          FROM gamification_profiles WHERE user_id = p_from_user;
        RETURN jsonb_build_object('success', true, 'already_paid', true, 'from_balance', v_from_new);
    END IF;

    -- Lock both wallets in a deterministic order (avoids deadlocks between
    -- concurrent opposite-direction transfers).
    PERFORM 1 FROM gamification_profiles
     WHERE user_id IN (p_from_user, p_to_user)
     ORDER BY user_id
       FOR UPDATE;

    SELECT COALESCE(bara_coins, 0) INTO v_bal
      FROM gamification_profiles WHERE user_id = p_from_user;
    IF v_bal < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'insufficient', 'balance', v_bal);
    END IF;

    -- Seller-side daily coin-gain cap: reject rather than partially credit
    -- (a partial credit would silently burn the buyer's coins).
    SELECT COALESCE(SUM(amount), 0) INTO v_today
      FROM gamification_history
     WHERE user_id = p_to_user AND type IN ('coin_gain', 'coin_purchase')
       AND created_at >= date_trunc('day', now());
    v_cap := COALESCE((SELECT value FROM gamification_settings WHERE key = 'limit.daily_coin_gain_cap'), 20000);
    IF v_today + p_amount > v_cap THEN
        RETURN jsonb_build_object('success', false, 'error', 'seller_daily_cap');
    END IF;

    -- Ledger row first — its unique index is the race-proof idempotency guard.
    INSERT INTO coin_transfers (from_user_id, to_user_id, amount, reason, ref_id)
    VALUES (p_from_user, p_to_user, p_amount, p_reason, p_ref_id)
    ON CONFLICT (from_user_id, ref_id) WHERE ref_id IS NOT NULL DO NOTHING;
    IF p_ref_id IS NOT NULL AND NOT FOUND THEN
        SELECT COALESCE(bara_coins, 0) INTO v_from_new
          FROM gamification_profiles WHERE user_id = p_from_user;
        RETURN jsonb_build_object('success', true, 'already_paid', true, 'from_balance', v_from_new);
    END IF;

    UPDATE gamification_profiles
       SET bara_coins = v_bal - p_amount, updated_at = now()
     WHERE user_id = p_from_user
    RETURNING bara_coins INTO v_from_new;

    UPDATE gamification_profiles
       SET bara_coins = COALESCE(bara_coins, 0) + p_amount, updated_at = now()
     WHERE user_id = p_to_user
    RETURNING bara_coins INTO v_to_new;

    INSERT INTO gamification_history (user_id, type, amount, reason) VALUES
        (p_from_user, 'coin_spend', p_amount, p_reason),
        (p_to_user,   'coin_gain',  p_amount, p_reason);

    -- Both parties get an in-app notification (realtime bell).
    INSERT INTO notifications (user_id, type, title, message, link) VALUES
        (p_to_user, 'coins_earned', 'You received ' || p_amount || ' BARA Coins',
         COALESCE(p_reason, 'A buyer paid for your ad with coins.'),
         CASE WHEN p_ref_id IS NOT NULL THEN '/marketplace/ad/' || p_ref_id ELSE NULL END),
        (p_from_user, 'success', 'Payment sent — ' || p_amount || ' BARA Coins',
         COALESCE(p_reason, 'Your coin payment went through.'),
         CASE WHEN p_ref_id IS NOT NULL THEN '/marketplace/ad/' || p_ref_id ELSE NULL END);

    RETURN jsonb_build_object('success', true, 'from_balance', v_from_new, 'to_balance', v_to_new);
END;
$$;

GRANT EXECUTE ON FUNCTION public.economy_transfer_coins(TEXT, TEXT, INTEGER, TEXT, TEXT) TO anon, authenticated, service_role;

-- ############################################################
-- SECTION: 20260708_verification_requests.sql
-- ############################################################

-- ============================================================
-- Phase 27.8.2 — Account verification for businesses & artists
-- ============================================================
-- Verification = a form + uploaded documents, reviewed by an admin.
-- The app talks to Supabase with the tokenless anon client, so auth.uid()
-- RLS is unavailable — ALL access to verification_requests goes through
-- SECURITY DEFINER RPCs (same pattern as the economy hardening): the table
-- itself is fully revoked from anon/authenticated, and admin operations are
-- gated on admin_users inside the functions.
-- ============================================================

-- 1. The requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id  TEXT NOT NULL,
    account_type   TEXT NOT NULL CHECK (account_type IN ('business', 'artist')),
    status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted      JSONB NOT NULL DEFAULT '{}'::jsonb,  -- form fields (name, country, contact, …)
    doc_paths      TEXT[] NOT NULL DEFAULT '{}',        -- storage paths in verification-docs
    reviewer_notes TEXT,
    reviewed_by    TEXT,
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON public.verification_requests (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_pending ON public.verification_requests (created_at) WHERE status = 'pending';

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
-- No direct client access at all — RPCs only (they run as the definer).
REVOKE ALL ON public.verification_requests FROM anon, authenticated;
GRANT ALL ON public.verification_requests TO service_role;

-- 2. Private storage bucket for the documents. NOT public: no public URLs.
--    Owners upload from the form; admins read via short-lived signed URLs.
--    NOTE (same caveat as the 'music' bucket): the app's tokenless anon client
--    needs INSERT to upload and SELECT to create signed URLs, so those are
--    granted at bucket level and REAL privacy comes from the bucket being
--    non-public + unguessable paths. Before real launch, move doc reads to a
--    Clerk-authed client or an Edge Function and drop the anon SELECT policy.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-docs',
    'verification-docs',
    false,                -- private: nothing is served publicly
    20971520,             -- 20 MB per document
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO UPDATE
   SET public = false,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "verification docs upload" ON storage.objects;
CREATE POLICY "verification docs upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'verification-docs');

DROP POLICY IF EXISTS "verification docs read" ON storage.objects;
CREATE POLICY "verification docs read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'verification-docs');

-- 3. Submit a request (owner path). One live pending request per
--    (user, account_type); resubmission allowed after rejection.
CREATE OR REPLACE FUNCTION public.verification_submit(
    p_user_id      TEXT,
    p_account_type TEXT,
    p_submitted    JSONB,
    p_doc_paths    TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_user_id IS NULL OR p_account_type NOT IN ('business', 'artist') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid');
    END IF;

    IF EXISTS (
        SELECT 1 FROM verification_requests
         WHERE clerk_user_id = p_user_id AND account_type = p_account_type
           AND status = 'pending'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_pending');
    END IF;

    IF EXISTS (
        SELECT 1 FROM verification_requests
         WHERE clerk_user_id = p_user_id AND account_type = p_account_type
           AND status = 'approved'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_verified');
    END IF;

    INSERT INTO verification_requests (clerk_user_id, account_type, submitted, doc_paths)
    VALUES (p_user_id, p_account_type, COALESCE(p_submitted, '{}'::jsonb), COALESCE(p_doc_paths, '{}'))
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 4. The owner's own requests (status page + nudge suppression).
CREATE OR REPLACE FUNCTION public.verification_my_requests(p_user_id TEXT)
RETURNS TABLE (id UUID, account_type TEXT, status TEXT, reviewer_notes TEXT, created_at TIMESTAMPTZ, reviewed_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id, account_type, status, reviewer_notes, created_at, reviewed_at
      FROM verification_requests
     WHERE clerk_user_id = p_user_id
     ORDER BY created_at DESC;
$$;

-- 5. Admin queue — full rows, gated on admin_users.
CREATE OR REPLACE FUNCTION public.verification_admin_list(p_admin_id TEXT, p_status TEXT DEFAULT NULL)
RETURNS SETOF verification_requests
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN;
    END IF;
    RETURN QUERY
        SELECT * FROM verification_requests
         WHERE p_status IS NULL OR status = p_status
         ORDER BY created_at ASC;
END;
$$;

-- 6. Admin review: approve/reject with a note. Approval also flips the
--    existing verified flag the UI already renders — artists.is_verified for
--    artists, marketplace_partners.verification_level for businesses — and
--    notifies the requester.
CREATE OR REPLACE FUNCTION public.verification_admin_review(
    p_admin_id   TEXT,
    p_request_id UUID,
    p_approve    BOOLEAN,
    p_notes      TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req verification_requests%ROWTYPE;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;

    SELECT * INTO v_req FROM verification_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;
    IF v_req.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_reviewed');
    END IF;

    UPDATE verification_requests
       SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
           reviewer_notes = p_notes,
           reviewed_by = p_admin_id,
           reviewed_at = now(),
           updated_at = now()
     WHERE id = p_request_id;

    IF p_approve THEN
        IF v_req.account_type = 'artist' THEN
            UPDATE artists SET is_verified = true WHERE user_id = v_req.clerk_user_id;
        ELSE
            UPDATE marketplace_partners
               SET verification_level = 'business_verified'
             WHERE owner_user_id = v_req.clerk_user_id;
        END IF;
    END IF;

    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        v_req.clerk_user_id,
        CASE WHEN p_approve THEN 'success' ELSE 'info' END,
        CASE WHEN p_approve THEN 'Your account is verified!' ELSE 'Verification request update' END,
        CASE WHEN p_approve
             THEN 'Your ' || v_req.account_type || ' verification was approved. Your verified badge is now live.'
             ELSE COALESCE('Your verification request was not approved. ' || NULLIF(p_notes, ''),
                           'Your verification request was not approved. You can submit a new request with updated documents.')
        END,
        '/verify-account'
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verification_submit(TEXT, TEXT, JSONB, TEXT[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verification_my_requests(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verification_admin_list(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verification_admin_review(TEXT, UUID, BOOLEAN, TEXT) TO anon, authenticated;

-- ############################################################
-- SECTION: 20260708_business_packages.sql
-- ############################################################

-- ============================================================
-- Phase 27.8.4 — Paid ad/service packages for businesses (scaffold)
-- ============================================================
-- Phase 15 (Flutterwave) is not integrated, so this is the STRUCTURE, not
-- the charge: admin-managed packages, a public "Advertise with us" page, and
-- pending_payment subscriptions fulfilled manually by the team. Feature hooks
-- (posting quotas, featured placement) are recorded in `features` jsonb only —
-- enforcement comes with Phase 15.
-- ============================================================

-- 1. Packages (admin CRUD via gated RPC below; public read for the pricing page)
CREATE TABLE IF NOT EXISTS public.business_packages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    price_usd   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    period      TEXT NOT NULL DEFAULT 'month' CHECK (period IN ('month', 'year', 'one_time')),
    features    JSONB NOT NULL DEFAULT '[]'::jsonb,   -- e.g. ["10 ads/month", "Featured placement"]
    active      BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_packages_select" ON public.business_packages;
CREATE POLICY "business_packages_select" ON public.business_packages FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.business_packages FROM anon, authenticated;
GRANT SELECT ON public.business_packages TO anon, authenticated;
GRANT ALL ON public.business_packages TO service_role;

-- 2. Subscriptions (created pending_payment from the public page; the team
--    completes payment manually and an admin flips the status)
CREATE TABLE IF NOT EXISTS public.business_package_subscriptions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL,
    package_id    UUID NOT NULL REFERENCES public.business_packages(id),
    status        TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'active', 'expired', 'cancelled')),
    starts_at     TIMESTAMPTZ,
    ends_at       TIMESTAMPTZ,
    contact_email TEXT,
    contact_phone TEXT,
    note          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bps_user ON public.business_package_subscriptions (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_bps_pending ON public.business_package_subscriptions (created_at) WHERE status = 'pending_payment';

ALTER TABLE public.business_package_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bps_select" ON public.business_package_subscriptions;
CREATE POLICY "bps_select" ON public.business_package_subscriptions FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.business_package_subscriptions FROM anon, authenticated;
GRANT SELECT ON public.business_package_subscriptions TO anon, authenticated;
GRANT ALL ON public.business_package_subscriptions TO service_role;

-- 3. Admin CRUD RPC (create/update; deactivating = active=false, never delete)
CREATE OR REPLACE FUNCTION public.business_package_upsert(
    p_admin_id    TEXT,
    p_id          UUID,          -- NULL to create
    p_name        TEXT,
    p_description TEXT,
    p_price_usd   NUMERIC,
    p_period      TEXT,
    p_features    JSONB,
    p_active      BOOLEAN,
    p_sort_order  INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;
    IF p_name IS NULL OR p_period NOT IN ('month', 'year', 'one_time') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid');
    END IF;

    IF p_id IS NULL THEN
        INSERT INTO business_packages (name, description, price_usd, period, features, active, sort_order)
        VALUES (p_name, p_description, COALESCE(p_price_usd, 0), p_period,
                COALESCE(p_features, '[]'::jsonb), COALESCE(p_active, true), COALESCE(p_sort_order, 0))
        RETURNING id INTO v_id;
    ELSE
        UPDATE business_packages
           SET name = p_name, description = p_description, price_usd = COALESCE(p_price_usd, 0),
               period = p_period, features = COALESCE(p_features, '[]'::jsonb),
               active = COALESCE(p_active, true), sort_order = COALESCE(p_sort_order, 0),
               updated_at = now()
         WHERE id = p_id
        RETURNING id INTO v_id;
        IF v_id IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', 'not_found');
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 4. Public subscribe RPC — creates the pending_payment subscription and
--    notifies every active admin ("manual fulfillment until Phase 15").
CREATE OR REPLACE FUNCTION public.business_package_subscribe(
    p_user_id       TEXT,
    p_package_id    UUID,
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
    v_pkg business_packages%ROWTYPE;
    v_id  UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_signed_in');
    END IF;

    SELECT * INTO v_pkg FROM business_packages WHERE id = p_package_id AND active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'package_not_found');
    END IF;

    IF EXISTS (
        SELECT 1 FROM business_package_subscriptions
         WHERE clerk_user_id = p_user_id AND package_id = p_package_id
           AND status IN ('pending_payment', 'active')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_subscribed');
    END IF;

    INSERT INTO business_package_subscriptions (clerk_user_id, package_id, contact_email, contact_phone, note)
    VALUES (p_user_id, p_package_id, p_contact_email, p_contact_phone, p_note)
    RETURNING id INTO v_id;

    -- Tell the team there's a manual sale to complete.
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT a.user_id, 'info',
           'New package request: ' || v_pkg.name,
           'A business requested the "' || v_pkg.name || '" package ($' || v_pkg.price_usd || '/' || v_pkg.period || '). Contact them to complete payment.',
           '/admin/packages'
      FROM admin_users a
     WHERE a.is_active = true;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 5. Admin: flip a subscription's status after manual payment / expiry.
CREATE OR REPLACE FUNCTION public.business_package_set_subscription_status(
    p_admin_id TEXT,
    p_sub_id   UUID,
    p_status   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sub business_package_subscriptions%ROWTYPE;
    v_pkg business_packages%ROWTYPE;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;
    IF p_status NOT IN ('pending_payment', 'active', 'expired', 'cancelled') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_status');
    END IF;

    SELECT * INTO v_sub FROM business_package_subscriptions WHERE id = p_sub_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;

    UPDATE business_package_subscriptions
       SET status = p_status,
           starts_at = CASE WHEN p_status = 'active' AND starts_at IS NULL THEN now() ELSE starts_at END,
           ends_at = CASE
                        WHEN p_status = 'active' AND ends_at IS NULL THEN
                            (SELECT CASE period WHEN 'month' THEN now() + interval '1 month'
                                                WHEN 'year'  THEN now() + interval '1 year'
                                                ELSE NULL END
                               FROM business_packages WHERE id = v_sub.package_id)
                        ELSE ends_at
                     END,
           updated_at = now()
     WHERE id = p_sub_id;

    IF p_status = 'active' THEN
        SELECT * INTO v_pkg FROM business_packages WHERE id = v_sub.package_id;
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (v_sub.clerk_user_id, 'success', 'Your package is active!',
                'Your "' || COALESCE(v_pkg.name, 'business') || '" package is now active. Thanks for advertising with BARA Afrika.',
                '/packages');
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.business_package_upsert(TEXT, UUID, TEXT, TEXT, NUMERIC, TEXT, JSONB, BOOLEAN, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.business_package_subscribe(TEXT, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.business_package_set_subscription_status(TEXT, UUID, TEXT) TO anon, authenticated;

-- Starter packages (edit or deactivate in Admin → Packages; pricing TBD by team)
INSERT INTO public.business_packages (name, description, price_usd, period, features, sort_order)
SELECT * FROM (VALUES
    ('Starter', 'Get your business seen on BARA Afrika.', 19.00::numeric, 'month',
     '["10 marketplace ads per month", "Storefront badge", "Email support"]'::jsonb, 1),
    ('Growth', 'More reach for growing businesses.', 49.00::numeric, 'month',
     '["30 marketplace ads per month", "Featured placement on category pages", "Storefront promotion", "Priority support"]'::jsonb, 2),
    ('Premium', 'Maximum visibility across the platform.', 99.00::numeric, 'month',
     '["Unlimited marketplace ads", "Homepage featured slots", "Banner placement", "Dedicated account manager"]'::jsonb, 3)
) AS seed(name, description, price_usd, period, features, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.business_packages);

-- ############################################################
-- SECTION 7: Every earn/spend amount admin-tunable (user request Jul 6)
-- ############################################################
-- Closes the last hardcoded amounts in the economy so the AdminGamification
-- Economy Settings panel controls EVERY faucet and sink:
--   7a. referral bonuses + milestone bonuses  -> gamification_settings keys
--   7b. sign-up XP bonus, streak XP multipliers, profile-theme prices
--       -> gamification_settings keys (read client-side)
--   7c. mission & achievement rewards         -> admin-gated update RPCs
--       (claim RPCs already read rewards from the tables, so edits are live)
-- The daily spin's prize table intentionally stays fixed for now (team call).
-- ============================================================

-- ------------------------------------------------------------
-- 7a. Referral amounts - settings keys + referral_activate reads them.
-- ------------------------------------------------------------
INSERT INTO public.gamification_settings (key, value) VALUES
    ('referral.friend_coins',       25),
    ('referral.referrer_coins',     50),
    ('referral.milestone5_coins',  300),
    ('referral.milestone10_coins', 1000),
    ('referral.milestone25_coins', 3000)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.referral_activate(p_referred_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref referrals%ROWTYPE;
    v_count INTEGER;
    v_milestone INTEGER := NULL;
    v_friend   INTEGER;
    v_referrer INTEGER;
    v_bonus    INTEGER;
BEGIN
    SELECT * INTO v_ref FROM referrals
     WHERE referred_user_id = p_referred_user_id FOR UPDATE;

    IF NOT FOUND OR v_ref.status = 'activated' THEN
        RETURN jsonb_build_object('activated', false);
    END IF;

    UPDATE referrals SET status = 'activated', activated_at = NOW() WHERE id = v_ref.id;

    -- Amounts are admin-tunable (Economy Settings -> Referrals).
    v_friend   := COALESCE((SELECT value::integer FROM gamification_settings WHERE key = 'referral.friend_coins'), 25);
    v_referrer := COALESCE((SELECT value::integer FROM gamification_settings WHERE key = 'referral.referrer_coins'), 50);

    IF v_friend > 0 THEN
        PERFORM economy_add_coins(p_referred_user_id, v_friend, 'Referral bonus');
    END IF;
    IF v_referrer > 0 THEN
        PERFORM economy_add_coins(v_ref.referrer_user_id, v_referrer, 'Referral bonus');
    END IF;

    SELECT count(*) INTO v_count
      FROM referrals
     WHERE referrer_user_id = v_ref.referrer_user_id AND status = 'activated';

    IF v_count = 5 THEN
        v_milestone := 5;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 5') THEN
            v_bonus := COALESCE((SELECT value::integer FROM gamification_settings WHERE key = 'referral.milestone5_coins'), 300);
            IF v_bonus > 0 THEN
                PERFORM economy_add_coins(v_ref.referrer_user_id, v_bonus, 'Referral milestone: 5');
            END IF;
            PERFORM economy_award_achievement(v_ref.referrer_user_id, 'ambassador');
        END IF;
    ELSIF v_count = 10 THEN
        v_milestone := 10;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 10') THEN
            v_bonus := COALESCE((SELECT value::integer FROM gamification_settings WHERE key = 'referral.milestone10_coins'), 1000);
            IF v_bonus > 0 THEN
                PERFORM economy_add_coins(v_ref.referrer_user_id, v_bonus, 'Referral milestone: 10');
            END IF;
        END IF;
    ELSIF v_count = 25 THEN
        v_milestone := 25;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 25') THEN
            v_bonus := COALESCE((SELECT value::integer FROM gamification_settings WHERE key = 'referral.milestone25_coins'), 3000);
            IF v_bonus > 0 THEN
                PERFORM economy_add_coins(v_ref.referrer_user_id, v_bonus, 'Referral milestone: 25');
            END IF;
            INSERT INTO user_profile_themes (user_id, theme_id, is_active)
            VALUES (v_ref.referrer_user_id, 'referral_champion', false)
            ON CONFLICT (user_id, theme_id) DO NOTHING;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'activated', true,
        'friend_coins', v_friend,
        'referrer_coins', v_referrer,
        'milestone', v_milestone,
        'referrer_user_id', v_ref.referrer_user_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.referral_activate(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------
-- 7b. Sign-up XP bonus, streak XP multipliers, and profile-theme prices.
--     These are read client-side (gamificationService / useProfileTheme):
--     - xp.signup: XP granted right after the profile row is created
--       (0 = disabled, the historical behavior)
--     - streak.multiplier_*: the XP multiplier reached at 3/7/30-day streaks
--     - cost.theme_*: coin price of each purchasable profile theme
-- ------------------------------------------------------------
INSERT INTO public.gamification_settings (key, value) VALUES
    ('xp.signup',                 0),
    ('streak.multiplier_3day',  1.2),
    ('streak.multiplier_7day',  1.5),
    ('streak.multiplier_30day',   2),
    ('cost.theme_sunset',        30),
    ('cost.theme_ocean',         30),
    ('cost.theme_forest',        30),
    ('cost.theme_midnight',      50),
    ('cost.theme_gold',          75),
    ('cost.theme_neon',          75),
    ('cost.theme_african',      100)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 7c. Mission & achievement rewards - admin-gated update RPCs. The claim
--     RPCs (economy_claim_mission / economy_award_achievement) already read
--     xp_reward/coin_reward from these tables, so edits apply immediately.
--     Direct writes are revoked so only admins (via RPC) can change rewards.
-- ------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE ON public.missions FROM anon, authenticated;
GRANT SELECT ON public.missions TO anon, authenticated;
GRANT ALL ON public.missions TO service_role;

REVOKE INSERT, UPDATE, DELETE ON public.achievements FROM anon, authenticated;
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT ALL ON public.achievements TO service_role;

CREATE OR REPLACE FUNCTION public.economy_update_mission(
    p_admin_id   TEXT,
    p_mission_id UUID,
    p_xp         INTEGER,
    p_coins      INTEGER,
    p_goal       INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;

    UPDATE missions
       SET xp_reward   = COALESCE(p_xp, xp_reward),
           coin_reward = COALESCE(p_coins, coin_reward),
           goal        = GREATEST(COALESCE(p_goal, goal), 1)
     WHERE id = p_mission_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;
    RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_update_achievement(
    p_admin_id       TEXT,
    p_achievement_id UUID,
    p_xp             INTEGER,
    p_coins          INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;

    UPDATE achievements
       SET xp_reward   = COALESCE(p_xp, xp_reward),
           coin_reward = COALESCE(p_coins, coin_reward)
     WHERE id = p_achievement_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;
    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.economy_update_mission(TEXT, UUID, INTEGER, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_update_achievement(TEXT, UUID, INTEGER, INTEGER)      TO anon, authenticated;
