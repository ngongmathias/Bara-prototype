-- ============================================================
-- Phase 27.2.1 — Server-side economy hardening
-- ============================================================
-- Moves every economy WRITE behind SECURITY DEFINER RPCs and locks the five
-- gamification tables to SELECT-only for the anon/authenticated clients. The
-- browser can no longer grant itself coins/XP by writing the tables directly:
-- it must go through these functions, which enforce the rules server-side
-- (non-negative balances, once/day spin with a server-owned prize table,
-- server-validated mission claims, admin-gated settings writes).
--
-- Trust model note: the app talks to Supabase through a tokenless anon client
-- (see 20260617), so these RPCs take the acting user id as a parameter rather
-- than reading it from a JWT — mirroring the existing pattern. The security win
-- is that the *shape* of every mutation is now fixed server-side and audited in
-- gamification_history; arbitrary balance writes are no longer possible.
--
-- Safe/idempotent: CREATE OR REPLACE for functions, guarded policy drops.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Level maths helper (mirror of calculateLevel in gamificationService.ts:
--    base 1000, exponent 1.5). Kept as its own function so the 27.3.5 early
--    curve change can update it in one place.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_level_from_xp(p_xp NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_xp IS NULL OR p_xp < 1000 THEN
        RETURN 1;
    END IF;
    RETURN floor(power(p_xp / 1000.0, 1.0 / 1.5)) + 1;
END;
$$;

-- ------------------------------------------------------------
-- 1. Ensure a profile exists (server-side profile creation).
--    Returns the profile row so the client getProfile() can create-on-read.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_ensure_profile(p_user_id TEXT)
RETURNS SETOF public.gamification_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_start NUMERIC;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM gamification_profiles WHERE user_id = p_user_id) THEN
        SELECT value INTO v_start FROM gamification_settings WHERE key = 'coins.starting_balance';
        v_start := COALESCE(v_start, 100);
        INSERT INTO gamification_profiles
            (user_id, total_xp, current_level, bara_coins, daily_streak, consecutive_days, multiplier, last_activity_at)
        VALUES
            (p_user_id, 0, 1, v_start, 0, 0, 1.0, NOW())
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN QUERY SELECT * FROM gamification_profiles WHERE user_id = p_user_id;
END;
$$;

-- ------------------------------------------------------------
-- 2. Add XP (applies the streak multiplier + level-up coin bonus internally,
--    using coins.levelup_per_level from gamification_settings).
--    Returns { multiplied_amount, new_level, level_up, levelup_bonus }.
-- ------------------------------------------------------------
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
BEGIN
    PERFORM economy_ensure_profile(p_user_id);

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
       SET total_xp      = v_new_xp,
           current_level = v_new_level,
           bara_coins    = COALESCE(bara_coins, 0) + v_bonus,
           updated_at    = NOW()
     WHERE user_id = p_user_id;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'xp_gain', v_multiplied, p_reason);

    IF v_bonus > 0 THEN
        INSERT INTO gamification_history (user_id, type, amount, reason)
        VALUES (p_user_id, 'coin_gain', v_bonus, 'Level Up to ' || v_new_level);
    END IF;

    RETURN jsonb_build_object(
        'multiplied_amount', v_multiplied,
        'new_level',         v_new_level,
        'level_up',          v_level_up,
        'levelup_bonus',     v_bonus
    );
END;
$$;

-- ------------------------------------------------------------
-- 3. Add coins (reward path). Logs type 'coin_purchase' to match the historical
--    GamificationService.addCoins behaviour.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_add_coins(p_user_id TEXT, p_amount INTEGER, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new BIGINT;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);

    UPDATE gamification_profiles
       SET bara_coins = COALESCE(bara_coins, 0) + p_amount,
           updated_at = NOW()
     WHERE user_id = p_user_id
    RETURNING bara_coins INTO v_new;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'coin_purchase', p_amount, p_reason);

    RETURN jsonb_build_object('success', true, 'new_balance', v_new);
END;
$$;

-- ------------------------------------------------------------
-- 4. Spend coins — fails (success:false) if the balance would go negative.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_spend_coins(p_user_id TEXT, p_amount INTEGER, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_bal BIGINT;
BEGIN
    PERFORM economy_ensure_profile(p_user_id);

    SELECT COALESCE(bara_coins, 0) INTO v_bal
      FROM gamification_profiles WHERE user_id = p_user_id
      FOR UPDATE;

    IF v_bal < p_amount THEN
        RETURN jsonb_build_object('success', false, 'new_balance', v_bal);
    END IF;

    UPDATE gamification_profiles
       SET bara_coins = v_bal - p_amount,
           updated_at = NOW()
     WHERE user_id = p_user_id;

    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'coin_spend', p_amount, p_reason);

    RETURN jsonb_build_object('success', true, 'new_balance', v_bal - p_amount);
END;
$$;

-- ------------------------------------------------------------
-- 5. Award an achievement (idempotent). Pays XP (via economy_add_xp) + coins.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_award_achievement(p_user_id TEXT, p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ach achievements%ROWTYPE;
    v_xp  JSONB := NULL;
BEGIN
    SELECT * INTO v_ach FROM achievements WHERE key = p_key;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('awarded', false);
    END IF;

    IF EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_id = v_ach.id) THEN
        RETURN jsonb_build_object('awarded', false);
    END IF;

    PERFORM economy_ensure_profile(p_user_id);

    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, v_ach.id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    IF v_ach.xp_reward > 0 THEN
        v_xp := economy_add_xp(p_user_id, v_ach.xp_reward, 'Achievement: ' || v_ach.title);
    END IF;

    IF v_ach.coin_reward > 0 THEN
        UPDATE gamification_profiles
           SET bara_coins = COALESCE(bara_coins, 0) + v_ach.coin_reward,
               updated_at = NOW()
         WHERE user_id = p_user_id;
        INSERT INTO gamification_history (user_id, type, amount, reason)
        VALUES (p_user_id, 'coin_gain', v_ach.coin_reward, 'Achievement: ' || v_ach.title);
    END IF;

    RETURN jsonb_build_object(
        'awarded',     true,
        'title',       v_ach.title,
        'description', v_ach.description,
        'xp',          v_ach.xp_reward,
        'coins',       v_ach.coin_reward,
        'xp_result',   v_xp
    );
END;
$$;

-- ------------------------------------------------------------
-- 6. Seed any missing user_missions rows for a user (server-side).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_ensure_missions(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_missions (user_id, mission_id)
    SELECT p_user_id, m.id
      FROM missions m
     WHERE NOT EXISTS (
        SELECT 1 FROM user_missions um WHERE um.user_id = p_user_id AND um.mission_id = m.id
     );
END;
$$;

-- ------------------------------------------------------------
-- 7. Track mission progress. Returns { completed } (true only when this call
--    reaches the goal — used to fire the completion celebration client-side).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_track_mission(p_user_id TEXT, p_key TEXT, p_increment INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_m   missions%ROWTYPE;
    v_um  user_missions%ROWTYPE;
    v_new INTEGER;
    v_done BOOLEAN;
BEGIN
    SELECT * INTO v_m FROM missions WHERE key = p_key;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('completed', false);
    END IF;

    SELECT * INTO v_um FROM user_missions WHERE user_id = p_user_id AND mission_id = v_m.id;

    IF FOUND AND v_um.is_completed THEN
        RETURN jsonb_build_object('completed', false);
    END IF;

    IF NOT FOUND THEN
        v_new := p_increment;
        v_done := v_new >= v_m.goal;
        INSERT INTO user_missions (user_id, mission_id, current_progress, is_completed, completed_at)
        VALUES (p_user_id, v_m.id, v_new, v_done, CASE WHEN v_done THEN NOW() ELSE NULL END)
        ON CONFLICT (user_id, mission_id) DO NOTHING;
    ELSE
        v_new := v_um.current_progress + p_increment;
        v_done := v_new >= v_m.goal;
        UPDATE user_missions
           SET current_progress = v_new,
               is_completed = v_done,
               completed_at = CASE WHEN v_done THEN NOW() ELSE completed_at END
         WHERE user_id = p_user_id AND mission_id = v_m.id;
    END IF;

    RETURN jsonb_build_object('completed', v_done);
END;
$$;

-- ------------------------------------------------------------
-- 8. Claim a mission reward — validates completed + unclaimed server-side,
--    then pays XP + coins. Returns { success, title, xp, coins, xp_result }.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_claim_mission(p_user_id TEXT, p_mission_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_um user_missions%ROWTYPE;
    v_m  missions%ROWTYPE;
    v_xp JSONB := NULL;
BEGIN
    SELECT * INTO v_um
      FROM user_missions
     WHERE user_id = p_user_id AND mission_id::text = p_mission_id
     FOR UPDATE;

    IF NOT FOUND OR NOT v_um.is_completed OR v_um.claimed_at IS NOT NULL THEN
        RETURN jsonb_build_object('success', false);
    END IF;

    SELECT * INTO v_m FROM missions WHERE id::text = p_mission_id;

    UPDATE user_missions SET claimed_at = NOW() WHERE id = v_um.id;

    IF v_m.xp_reward > 0 THEN
        v_xp := economy_add_xp(p_user_id, v_m.xp_reward, 'Mission: ' || v_m.title);
    END IF;

    IF v_m.coin_reward > 0 THEN
        UPDATE gamification_profiles
           SET bara_coins = COALESCE(bara_coins, 0) + v_m.coin_reward,
               updated_at = NOW()
         WHERE user_id = p_user_id;
        INSERT INTO gamification_history (user_id, type, amount, reason)
        VALUES (p_user_id, 'coin_gain', v_m.coin_reward, 'Mission: ' || v_m.title);
    END IF;

    RETURN jsonb_build_object(
        'success',   true,
        'title',     v_m.title,
        'xp',        v_m.xp_reward,
        'coins',     v_m.coin_reward,
        'xp_result', v_xp
    );
END;
$$;

-- ------------------------------------------------------------
-- 9. Apply a computed streak update. The client still computes the streak from
--    the user's LOCAL calendar (timezone-correct); this RPC just persists the
--    result and refreshes last_activity_at. p_changed=false → touch-only.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_apply_streak(
    p_user_id     TEXT,
    p_streak      INTEGER,
    p_multiplier  NUMERIC,
    p_changed     BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM economy_ensure_profile(p_user_id);
    IF p_changed THEN
        UPDATE gamification_profiles
           SET daily_streak      = p_streak,
               consecutive_days  = p_streak,
               multiplier        = p_multiplier,
               last_activity_at  = NOW()
         WHERE user_id = p_user_id;
    ELSE
        UPDATE gamification_profiles
           SET last_activity_at = NOW()
         WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- ------------------------------------------------------------
-- 10. Daily spin wheel — enforces once/day server-side and owns the weighted
--     prize table, so the client cannot pick its own prize. Returns the prize.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_spin_wheel(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Segment order MUST match SEGMENTS in DailySpinWheel.tsx.
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
BEGIN
    IF EXISTS (
        SELECT 1 FROM gamification_history
         WHERE user_id = p_user_id
           AND reason = 'Daily Spin Wheel'
           AND created_at >= date_trunc('day', NOW())
    ) THEN
        RETURN jsonb_build_object('success', false, 'reason', 'already_spun');
    END IF;

    PERFORM economy_ensure_profile(p_user_id);

    FOR i IN 1 .. array_length(v_probs, 1) LOOP
        v_total := v_total + v_probs[i];
    END LOOP;

    v_rand := random() * v_total;
    v_idx := array_length(v_probs, 1);  -- fallback to last segment
    FOR i IN 1 .. array_length(v_probs, 1) LOOP
        v_cum := v_cum + v_probs[i];
        IF v_rand <= v_cum THEN
            v_idx := i;
            EXIT;
        END IF;
    END LOOP;

    IF v_types[v_idx] = 'coins' THEN
        UPDATE gamification_profiles
           SET bara_coins = COALESCE(bara_coins, 0) + v_values[v_idx],
               updated_at = NOW()
         WHERE user_id = p_user_id;
        INSERT INTO gamification_history (user_id, type, amount, reason)
        VALUES (p_user_id, 'coin_gain', v_values[v_idx], 'Daily Spin Wheel');
    ELSE
        v_xp := economy_add_xp(p_user_id, v_values[v_idx], 'Daily Spin Wheel');
    END IF;

    RETURN jsonb_build_object(
        'success',   true,
        'index',     v_idx - 1,           -- 0-based for the client SEGMENTS array
        'label',     v_labels[v_idx],
        'type',      v_types[v_idx],
        'value',     v_values[v_idx],
        'xp_result', v_xp
    );
END;
$$;

-- ------------------------------------------------------------
-- 11. Admin economy override (God-Mode). Sets an absolute coin balance and
--     audits it. Kept as an absolute-set to match updateUserEconomy.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_admin_override(p_user_id TEXT, p_bara_coins BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM economy_ensure_profile(p_user_id);
    IF p_bara_coins IS NOT NULL THEN
        UPDATE gamification_profiles
           SET bara_coins = p_bara_coins,
               updated_at = NOW()
         WHERE user_id = p_user_id;
    END IF;
    INSERT INTO gamification_history (user_id, type, amount, reason)
    VALUES (p_user_id, 'admin_override', NULL, 'Admin override: coins=' || COALESCE(p_bara_coins::text, 'null'));
    RETURN jsonb_build_object('success', true);
END;
$$;

-- ------------------------------------------------------------
-- 12. Update an economy setting — gated on admin_users (active). The acting
--     admin's Clerk id is passed in (tokenless anon client has no JWT).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.economy_update_setting(p_key TEXT, p_value NUMERIC, p_admin_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'reason', 'not_admin');
    END IF;

    INSERT INTO gamification_settings (key, value, updated_at)
    VALUES (p_key, p_value, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ------------------------------------------------------------
-- 13. Grant EXECUTE on every RPC to the app clients.
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.economy_level_from_xp(NUMERIC)                      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_ensure_profile(TEXT)                        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_add_xp(TEXT, INTEGER, TEXT)                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_add_coins(TEXT, INTEGER, TEXT)              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_spend_coins(TEXT, INTEGER, TEXT)            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_award_achievement(TEXT, TEXT)               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_ensure_missions(TEXT)                       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_track_mission(TEXT, TEXT, INTEGER)          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_claim_mission(TEXT, TEXT)                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_apply_streak(TEXT, INTEGER, NUMERIC, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_spin_wheel(TEXT)                            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_admin_override(TEXT, BIGINT)                TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.economy_update_setting(TEXT, NUMERIC, TEXT)         TO anon, authenticated;

-- ============================================================
-- 14. Lock RLS — the five tables become SELECT-only for anon/authenticated.
--     All writes now go through the SECURITY DEFINER RPCs above (which run as
--     the function owner and bypass RLS). service_role keeps full access.
-- ============================================================

-- gamification_profiles ------------------------------------------------------
DROP POLICY IF EXISTS "gamification_insert" ON public.gamification_profiles;
DROP POLICY IF EXISTS "gamification_update" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.gamification_profiles;
DROP POLICY IF EXISTS "gamification_select" ON public.gamification_profiles;
CREATE POLICY "gamification_select" ON public.gamification_profiles FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.gamification_profiles FROM anon, authenticated;
GRANT SELECT ON public.gamification_profiles TO anon, authenticated;

-- gamification_history -------------------------------------------------------
DROP POLICY IF EXISTS "gamification_history_insert" ON public.gamification_history;
DROP POLICY IF EXISTS "Users can view own history" ON public.gamification_history;
DROP POLICY IF EXISTS "gamification_history_select" ON public.gamification_history;
CREATE POLICY "gamification_history_select" ON public.gamification_history FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.gamification_history FROM anon, authenticated;
GRANT SELECT ON public.gamification_history TO anon, authenticated;

-- user_missions --------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own mission progress" ON public.user_missions;
DROP POLICY IF EXISTS "Users can update own mission progress" ON public.user_missions;
DROP POLICY IF EXISTS "Users can insert own missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users can update own missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users can view own missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users can view own mission progress" ON public.user_missions;
DROP POLICY IF EXISTS "user_missions_select" ON public.user_missions;
CREATE POLICY "user_missions_select" ON public.user_missions FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.user_missions FROM anon, authenticated;
GRANT SELECT ON public.user_missions TO anon, authenticated;

-- user_achievements ----------------------------------------------------------
DROP POLICY IF EXISTS "user_achievements_insert" ON public.user_achievements;
DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "user_achievements_select" ON public.user_achievements;
CREATE POLICY "user_achievements_select" ON public.user_achievements FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.user_achievements FROM anon, authenticated;
GRANT SELECT ON public.user_achievements TO anon, authenticated;

-- gamification_settings ------------------------------------------------------
DROP POLICY IF EXISTS "Economy settings anon write" ON public.gamification_settings;
DROP POLICY IF EXISTS "Economy settings are viewable by everyone" ON public.gamification_settings;
CREATE POLICY "Economy settings are viewable by everyone" ON public.gamification_settings FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.gamification_settings FROM anon, authenticated;
GRANT SELECT ON public.gamification_settings TO anon, authenticated;
