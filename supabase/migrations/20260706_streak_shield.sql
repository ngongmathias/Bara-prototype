-- ============================================================
-- Phase 27.3.3 — Streak Shield
-- ============================================================
-- A shield forgives exactly one missed day so the streak survives. Every user
-- gets 1 free shield to start and 1 more each calendar month (capped at 3);
-- extra shields are buyable for coins (cost.streak_shield, admin-tunable).
-- All mutations go through SECURITY DEFINER RPCs (Phase 27.2.1 model).
-- ============================================================

ALTER TABLE public.gamification_profiles
    ADD COLUMN IF NOT EXISTS streak_shields INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_shield_grant_at TIMESTAMP WITH TIME ZONE;

-- Admin-tunable shield price.
INSERT INTO public.gamification_settings (key, value) VALUES ('cost.streak_shield', 50)
ON CONFLICT (key) DO NOTHING;

-- Monthly free shield top-up (idempotent per calendar month, capped at 3).
CREATE OR REPLACE FUNCTION public.economy_grant_monthly_shield(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_last TIMESTAMP WITH TIME ZONE;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);
    SELECT last_shield_grant_at INTO v_last FROM gamification_profiles WHERE user_id = p_user_id;

    IF v_last IS NULL OR date_trunc('month', v_last) < date_trunc('month', now()) THEN
        UPDATE gamification_profiles
           SET streak_shields = LEAST(COALESCE(streak_shields, 0) + 1, 3),
               last_shield_grant_at = now(),
               updated_at = now()
         WHERE user_id = p_user_id;
        RETURN jsonb_build_object('granted', true);
    END IF;
    RETURN jsonb_build_object('granted', false);
END;
$$;

-- Consume one shield (called when exactly one day was missed). Atomic.
CREATE OR REPLACE FUNCTION public.economy_consume_shield(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_shields INTEGER;
BEGIN
    SELECT COALESCE(streak_shields, 0) INTO v_shields
      FROM gamification_profiles WHERE user_id = p_user_id FOR UPDATE;

    IF COALESCE(v_shields, 0) < 1 THEN
        RETURN jsonb_build_object('consumed', false);
    END IF;

    UPDATE gamification_profiles
       SET streak_shields = v_shields - 1, updated_at = now()
     WHERE user_id = p_user_id;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'shield_used', NULL, 'Streak Shield used');

    RETURN jsonb_build_object('consumed', true, 'shields', v_shields - 1);
END;
$$;

-- Buy a shield for coins (cost.streak_shield). Fails if the balance is short.
CREATE OR REPLACE FUNCTION public.economy_buy_shield(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cost    NUMERIC;
    v_bal     BIGINT;
    v_shields INTEGER;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);

    SELECT value INTO v_cost FROM gamification_settings WHERE key = 'cost.streak_shield';
    v_cost := COALESCE(v_cost, 50);

    SELECT COALESCE(bara_coins, 0) INTO v_bal
      FROM gamification_profiles WHERE user_id = p_user_id FOR UPDATE;

    IF v_bal < v_cost THEN
        RETURN jsonb_build_object('success', false, 'reason', 'insufficient', 'cost', v_cost);
    END IF;

    UPDATE gamification_profiles
       SET bara_coins = v_bal - v_cost,
           streak_shields = COALESCE(streak_shields, 0) + 1,
           updated_at = now()
     WHERE user_id = p_user_id
    RETURNING streak_shields INTO v_shields;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'coin_spend', v_cost, 'Streak Shield');

    RETURN jsonb_build_object('success', true, 'shields', v_shields, 'cost', v_cost);
END;
$$;

GRANT EXECUTE ON FUNCTION public.economy_grant_monthly_shield(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_consume_shield(TEXT)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_buy_shield(TEXT)           TO anon, authenticated;
