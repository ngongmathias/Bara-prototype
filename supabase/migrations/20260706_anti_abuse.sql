-- ============================================================
-- Phase 27.4.3 — Anti-abuse pass (server-side per-action caps)
-- ============================================================
-- The economy RPCs are callable by the tokenless anon client, so add daily
-- backstops directly inside the two value RPCs: a max XP-earned/day and max
-- coins-earned/day per user. Limits are set well above any legitimate day
-- (song-listen XP is already capped at 50/day) so only automated farming trips
-- them. Both are admin-tunable (limit.daily_xp_cap / limit.daily_coin_gain_cap).
-- ============================================================

INSERT INTO public.gamification_settings (key, value) VALUES
    ('limit.daily_xp_cap',        20000),
    ('limit.daily_coin_gain_cap', 20000)
ON CONFLICT (key) DO NOTHING;

-- Rebuild economy_add_xp with a daily XP-earned cap (keeps multiplier +
-- level-up logic from 20260705_gamification_server_hardening).
CREATE OR REPLACE FUNCTION public.economy_add_xp(p_user_id TEXT, p_amount INTEGER, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_mult       NUMERIC;
    v_old_xp     NUMERIC;
    v_old_level  INTEGER;
    v_multiplied INTEGER;
    v_new_xp     NUMERIC;
    v_new_level  INTEGER;
    v_level_up   BOOLEAN;
    v_rate       NUMERIC;
    v_bonus      NUMERIC := 0;
    v_today_xp   NUMERIC;
    v_cap        NUMERIC;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);

    -- Anti-abuse: stop earning XP past the daily cap.
    SELECT COALESCE(SUM(amount), 0) INTO v_today_xp
      FROM gamification_history
     WHERE user_id = p_user_id AND type = 'xp_gain' AND created_at >= date_trunc('day', now());
    v_cap := COALESCE((SELECT value FROM gamification_settings WHERE key = 'limit.daily_xp_cap'), 20000);
    IF v_today_xp >= v_cap THEN
        SELECT COALESCE(current_level, 1) INTO v_old_level FROM gamification_profiles WHERE user_id = p_user_id;
        RETURN jsonb_build_object('multiplied_amount', 0, 'new_level', v_old_level, 'level_up', false, 'levelup_bonus', 0);
    END IF;

    SELECT COALESCE(multiplier, 1), COALESCE(total_xp, 0), COALESCE(current_level, 1)
      INTO v_mult, v_old_xp, v_old_level
      FROM gamification_profiles WHERE user_id = p_user_id;

    v_multiplied := round(p_amount * v_mult);
    v_new_xp     := v_old_xp + v_multiplied;
    v_new_level  := economy_level_from_xp(v_new_xp);
    v_level_up   := v_new_level > v_old_level;

    IF v_level_up THEN
        SELECT value INTO v_rate FROM gamification_settings WHERE key = 'coins.levelup_per_level';
        v_rate := COALESCE(v_rate, 10);
        v_bonus := v_new_level * v_rate;
    END IF;

    UPDATE gamification_profiles
       SET total_xp = v_new_xp, current_level = v_new_level,
           bara_coins = COALESCE(bara_coins, 0) + v_bonus, updated_at = NOW()
     WHERE user_id = p_user_id;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'xp_gain', v_multiplied, p_reason);

    IF v_bonus > 0 THEN
        INSERT INTO gamification_history (user_id, type, amount, reason)
        VALUES (p_user_id, 'coin_gain', v_bonus, 'Level Up to ' || v_new_level);
    END IF;

    RETURN jsonb_build_object('multiplied_amount', v_multiplied, 'new_level', v_new_level,
        'level_up', v_level_up, 'levelup_bonus', v_bonus);
END;
$$;

-- Rebuild economy_add_coins with a daily coin-earned cap (keeps the Gold +5%
-- bonus from 20260706_prestige_perks).
CREATE OR REPLACE FUNCTION public.economy_add_coins(p_user_id TEXT, p_amount INTEGER, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new       BIGINT;
    v_level     INTEGER;
    v_pct       NUMERIC := 0;
    v_credit    INTEGER := p_amount;
    v_today     NUMERIC;
    v_cap       NUMERIC;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);

    -- Anti-abuse: stop crediting positive coin gains past the daily cap.
    IF p_amount > 0 THEN
        SELECT COALESCE(SUM(amount), 0) INTO v_today
          FROM gamification_history
         WHERE user_id = p_user_id AND type IN ('coin_gain', 'coin_purchase')
           AND created_at >= date_trunc('day', now());
        v_cap := COALESCE((SELECT value FROM gamification_settings WHERE key = 'limit.daily_coin_gain_cap'), 20000);
        IF v_today >= v_cap THEN
            SELECT COALESCE(bara_coins, 0) INTO v_new FROM gamification_profiles WHERE user_id = p_user_id;
            RETURN jsonb_build_object('success', true, 'new_balance', v_new, 'credited', 0);
        END IF;
    END IF;

    SELECT COALESCE(current_level, 1) INTO v_level FROM gamification_profiles WHERE user_id = p_user_id;

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
