-- ============================================================
-- Phase 27.3.4 — Prestige perks
-- ============================================================
-- Gives the prestige tiers a function beyond status:
--   Bronze  (L11+) — exclusive profile theme (client-side, useProfileTheme)
--   Silver  (L21+) — 2 daily spins        (economy_spin_wheel below)
--   Gold    (L41+) — +5% coin earnings     (economy_add_coins below,
--                                            perk.gold_coin_bonus_pct)
--   Diamond (L71+) — one free ad-free week per calendar month
--                    (economy_grant_diamond_adfree)
-- ============================================================

-- Admin-tunable Gold coin bonus (percent).
INSERT INTO public.gamification_settings (key, value) VALUES ('perk.gold_coin_bonus_pct', 5)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- Silver: up to 2 spins/day. Rebuild economy_spin_wheel to read prestige.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_spin_wheel(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_probs  NUMERIC[] := ARRAY[30, 25, 20, 12, 8, 3, 1.5, 0.5];
    v_labels TEXT[]    := ARRAY['5 Coins','10 XP','10 Coins','25 XP','25 Coins','50 XP','50 Coins','100 XP'];
    v_types  TEXT[]    := ARRAY['coins','xp','coins','xp','coins','xp','coins','xp'];
    v_values INTEGER[] := ARRAY[5, 10, 10, 25, 25, 50, 50, 100];
    v_total  NUMERIC := 0;
    v_cum    NUMERIC := 0;
    v_rand   NUMERIC;
    v_idx    INTEGER;
    i        INTEGER;
    v_xp     JSONB := NULL;
    v_level  INTEGER;
    v_allowed INTEGER;
    v_today  INTEGER;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);
    SELECT COALESCE(current_level, 1) INTO v_level FROM gamification_profiles WHERE user_id = p_user_id;
    -- Silver+ (L21+) get 2 spins/day.
    v_allowed := CASE WHEN v_level >= 21 THEN 2 ELSE 1 END;

    SELECT count(*) INTO v_today
      FROM gamification_history
     WHERE user_id = p_user_id
       AND reason = 'Daily Spin Wheel'
       AND created_at >= date_trunc('day', now());

    IF v_today >= v_allowed THEN
        RETURN jsonb_build_object('success', false, 'reason', 'already_spun');
    END IF;

    FOR i IN 1 .. array_length(v_probs, 1) LOOP
        v_total := v_total + v_probs[i];
    END LOOP;

    v_rand := random() * v_total;
    v_idx := array_length(v_probs, 1);
    FOR i IN 1 .. array_length(v_probs, 1) LOOP
        v_cum := v_cum + v_probs[i];
        IF v_rand <= v_cum THEN v_idx := i; EXIT; END IF;
    END LOOP;

    IF v_types[v_idx] = 'coins' THEN
        UPDATE gamification_profiles
           SET bara_coins = COALESCE(bara_coins, 0) + v_values[v_idx], updated_at = now()
         WHERE user_id = p_user_id;
        INSERT INTO gamification_history (user_id, type, amount, reason)
        VALUES (p_user_id, 'coin_gain', v_values[v_idx], 'Daily Spin Wheel');
    ELSE
        v_xp := economy_add_xp(p_user_id, v_values[v_idx], 'Daily Spin Wheel');
    END IF;

    RETURN jsonb_build_object(
        'success', true, 'index', v_idx - 1, 'label', v_labels[v_idx],
        'type', v_types[v_idx], 'value', v_values[v_idx], 'xp_result', v_xp
    );
END;
$$;

-- ------------------------------------------------------------
-- Gold: +perk.gold_coin_bonus_pct% on positive coin earnings. Rebuild
-- economy_add_coins; returns the actual credited amount for the UI event.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_add_coins(p_user_id TEXT, p_amount INTEGER, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new     BIGINT;
    v_level   INTEGER;
    v_pct     NUMERIC := 0;
    v_credit  INTEGER := p_amount;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);
    SELECT COALESCE(current_level, 1) INTO v_level FROM gamification_profiles WHERE user_id = p_user_id;

    -- Gold+ (L41+) earn a bonus on positive coin gains.
    IF p_amount > 0 AND v_level >= 41 THEN
        SELECT value INTO v_pct FROM gamification_settings WHERE key = 'perk.gold_coin_bonus_pct';
        v_pct := COALESCE(v_pct, 5);
        v_credit := p_amount + floor(p_amount * v_pct / 100.0);
    END IF;

    UPDATE gamification_profiles
       SET bara_coins = COALESCE(bara_coins, 0) + v_credit, updated_at = now()
     WHERE user_id = p_user_id
    RETURNING bara_coins INTO v_new;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'coin_purchase', v_credit, p_reason);

    RETURN jsonb_build_object('success', true, 'new_balance', v_new, 'credited', v_credit);
END;
$$;

-- ------------------------------------------------------------
-- Diamond: one free ad-free week per calendar month (idempotent).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_grant_diamond_adfree(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_level INTEGER;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);
    SELECT COALESCE(current_level, 1) INTO v_level FROM gamification_profiles WHERE user_id = p_user_id;
    IF v_level < 71 THEN
        RETURN jsonb_build_object('granted', false);
    END IF;

    -- Once per calendar month (marker row in the audit log).
    IF EXISTS (
        SELECT 1 FROM gamification_history
         WHERE user_id = p_user_id
           AND reason = 'Diamond ad-free week'
           AND created_at >= date_trunc('month', now())
    ) THEN
        RETURN jsonb_build_object('granted', false);
    END IF;

    INSERT INTO user_ad_free (user_id, expires_at, coins_spent)
    VALUES (p_user_id, now() + interval '7 days', 0);

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'perk', NULL, 'Diamond ad-free week');

    RETURN jsonb_build_object('granted', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.economy_grant_diamond_adfree(TEXT) TO anon, authenticated;
