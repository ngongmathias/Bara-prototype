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
