-- ============================================================
-- Phase 27 gamification — COMBINED (27.2.2 + 27.3.1–27.3.6)
-- ============================================================
-- Convenience bundle: apply AFTER 20260705_economy_settings_drop_trust_rank.sql
-- and 20260705_gamification_server_hardening.sql, and BEFORE
-- 20260707_anti_abuse.sql. Contents (each was originally its own file):
--   referral_program · weekly_missions · weekly_leaderboard · streak_shield ·
--   prestige_perks · flatten_early_curve · weekly_recap_email
-- All statements are idempotent (CREATE OR REPLACE / IF NOT EXISTS / ON CONFLICT).
-- ============================================================




-- ############################################################
-- SECTION: 20260706_referral_program.sql
-- ############################################################

-- ============================================================
-- Phase 27.2.2 — Referral program end-to-end
-- ============================================================
-- Adds a stable per-user referral_code, a referrals ledger, and two
-- SECURITY DEFINER RPCs (referral_create on sign-up, referral_activate on the
-- referred user's first claimed mission) that pay both parties + milestone
-- bonuses via the Phase 27.2.1 hardened coin RPCs. All guards (self-referral,
-- one row per referred user, milestones-pay-once) are enforced server-side.
-- ============================================================

-- ------------------------------------------------------------
-- 1. referral_code on clerk_users (+ backfill + auto-generate trigger)
--    Derived from md5(clerk_user_id) so it's stable, unique-ish and NOT the
--    old user.id.slice(0,8) (which was near-identical for everyone because
--    Clerk ids share the "user_" prefix).
-- ------------------------------------------------------------
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS referral_code TEXT;

CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.referral_code IS NULL AND NEW.clerk_user_id IS NOT NULL THEN
        NEW.referral_code := upper(substr(md5(NEW.clerk_user_id), 1, 8));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON public.clerk_users;
CREATE TRIGGER trg_set_referral_code
    BEFORE INSERT OR UPDATE ON public.clerk_users
    FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- Backfill existing users.
UPDATE public.clerk_users
   SET referral_code = upper(substr(md5(clerk_user_id), 1, 8))
 WHERE referral_code IS NULL AND clerk_user_id IS NOT NULL;

-- Unique (partial — rows without a clerk id can stay null).
CREATE UNIQUE INDEX IF NOT EXISTS clerk_users_referral_code_key
    ON public.clerk_users (referral_code) WHERE referral_code IS NOT NULL;

-- ------------------------------------------------------------
-- 2. referrals ledger
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id  TEXT NOT NULL,
    referred_user_id  TEXT NOT NULL UNIQUE,   -- one referral per referred user
    code              TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending',  -- pending | activated
    created_at        timestamptz NOT NULL DEFAULT now(),
    activated_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- SELECT-only for the app clients (InvitePage reads counts). Writes go through
-- the RPCs below, consistent with the Phase 27.2.1 lockdown.
DROP POLICY IF EXISTS "referrals_select" ON public.referrals;
CREATE POLICY "referrals_select" ON public.referrals FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.referrals FROM anon, authenticated;
GRANT SELECT ON public.referrals TO anon, authenticated;
GRANT ALL ON public.referrals TO service_role;

-- ------------------------------------------------------------
-- 3. Ambassador achievement (milestone badge; coins come from the milestone).
-- ------------------------------------------------------------
INSERT INTO public.achievements (key, title, description, xp_reward, coin_reward, category)
VALUES ('ambassador', 'Ambassador', 'Referred 5 friends who joined BARA Afrika', 250, 0, 'community')
ON CONFLICT (key) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward, coin_reward = EXCLUDED.coin_reward, category = EXCLUDED.category;

-- ------------------------------------------------------------
-- 4. referral_create — called after the referred user's profile row exists.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.referral_create(p_referred_user_id TEXT, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referrer TEXT;
    v_code TEXT := upper(trim(COALESCE(p_code, '')));
BEGIN
    IF v_code = '' THEN
        RETURN jsonb_build_object('success', false, 'reason', 'no_code');
    END IF;

    SELECT clerk_user_id INTO v_referrer
      FROM clerk_users WHERE referral_code = v_code LIMIT 1;

    IF v_referrer IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'unknown_code');
    END IF;

    IF v_referrer = p_referred_user_id THEN
        RETURN jsonb_build_object('success', false, 'reason', 'self');
    END IF;

    IF EXISTS (SELECT 1 FROM referrals WHERE referred_user_id = p_referred_user_id) THEN
        RETURN jsonb_build_object('success', false, 'reason', 'already_referred');
    END IF;

    INSERT INTO referrals (referrer_user_id, referred_user_id, code, status)
    VALUES (v_referrer, p_referred_user_id, v_code, 'pending')
    ON CONFLICT (referred_user_id) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'referrer_user_id', v_referrer);
END;
$$;

-- ------------------------------------------------------------
-- 5. referral_activate — the referred user's first claimed mission activates
--    the referral: pays 25 to the friend + 50 to the referrer, then checks
--    referrer milestones (5 → +300 + Ambassador, 10 → +1,000,
--    25 → +3,000 + referral_champion theme). Idempotent (status guard + a
--    per-milestone history check so each pays once).
-- ------------------------------------------------------------
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
BEGIN
    SELECT * INTO v_ref FROM referrals
     WHERE referred_user_id = p_referred_user_id FOR UPDATE;

    IF NOT FOUND OR v_ref.status = 'activated' THEN
        RETURN jsonb_build_object('activated', false);
    END IF;

    UPDATE referrals SET status = 'activated', activated_at = NOW() WHERE id = v_ref.id;

    -- Pay both parties via the hardened coin RPC (audited as 'Referral bonus').
    PERFORM economy_add_coins(p_referred_user_id, 25, 'Referral bonus');
    PERFORM economy_add_coins(v_ref.referrer_user_id, 50, 'Referral bonus');

    SELECT count(*) INTO v_count
      FROM referrals
     WHERE referrer_user_id = v_ref.referrer_user_id AND status = 'activated';

    IF v_count = 5 THEN
        v_milestone := 5;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 5') THEN
            PERFORM economy_add_coins(v_ref.referrer_user_id, 300, 'Referral milestone: 5');
            PERFORM economy_award_achievement(v_ref.referrer_user_id, 'ambassador');
        END IF;
    ELSIF v_count = 10 THEN
        v_milestone := 10;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 10') THEN
            PERFORM economy_add_coins(v_ref.referrer_user_id, 1000, 'Referral milestone: 10');
        END IF;
    ELSIF v_count = 25 THEN
        v_milestone := 25;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 25') THEN
            PERFORM economy_add_coins(v_ref.referrer_user_id, 3000, 'Referral milestone: 25');
            INSERT INTO user_profile_themes (user_id, theme_id, is_active)
            VALUES (v_ref.referrer_user_id, 'referral_champion', false)
            ON CONFLICT (user_id, theme_id) DO NOTHING;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'activated', true,
        'friend_coins', 25,
        'referrer_coins', 50,
        'milestone', v_milestone,
        'referrer_user_id', v_ref.referrer_user_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.referral_create(TEXT, TEXT)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.referral_activate(TEXT)       TO anon, authenticated;


-- ############################################################
-- SECTION: 20260706_weekly_missions.sql
-- ############################################################

-- ============================================================
-- Phase 27.3.1 — Weekly missions
-- ============================================================
-- Three type='weekly' missions with chunky (~50-coin) rewards, plus a
-- weekly reset RPC mirroring reset_daily_missions_for_user (resets on the
-- first activity of a new ISO week — date_trunc('week') = Monday 00:00).
-- ============================================================

-- Seed the weekly missions (reputation_reward was dropped in 20260705).
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, type, category)
VALUES
    ('weekly_listen',      'Weekly Listener', 'Listen to 25 songs this week.',        25, 150, 50, 'weekly', 'music'),
    ('weekly_market_post', 'Weekly Seller',   'Post 1 marketplace ad this week.',      1, 150, 50, 'weekly', 'market'),
    ('weekly_event',       'Weekly Explorer', 'Register for 1 event this week.',       1, 150, 50, 'weekly', 'community')
ON CONFLICT (key) DO NOTHING;

-- Reset a user's weekly missions once per ISO week (Monday-anchored).
CREATE OR REPLACE FUNCTION public.reset_weekly_missions_for_user(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_missions um
    SET current_progress = 0,
        is_completed = false,
        completed_at = NULL,
        claimed_at = NULL,
        last_reset_at = NOW()
    FROM public.missions m
    WHERE um.mission_id = m.id
      AND um.user_id = p_user_id
      AND m.type = 'weekly'
      AND (um.last_reset_at IS NULL OR um.last_reset_at < date_trunc('week', NOW()));
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_weekly_missions_for_user(TEXT) TO anon, authenticated;


-- ############################################################
-- SECTION: 20260706_weekly_leaderboard.sql
-- ############################################################

-- ============================================================
-- Phase 27.3.2 — Weekly leaderboard seasons
-- ============================================================
-- Monday-anchored weekly aggregation of gamification_history, plus a helper
-- that returns last week's top 10 (for the cosmetic "champion" crown). Both are
-- read-only STABLE functions over the SELECT-able gamification tables.
-- ============================================================

-- Ranked period leaderboard: sum of gamification_history.amount for a given
-- type ('xp_gain' or 'coin_gain') since p_since, joined to current profile.
CREATE OR REPLACE FUNCTION public.leaderboard_period(p_type TEXT, p_since TIMESTAMPTZ, p_limit INTEGER)
RETURNS TABLE (
    user_id       TEXT,
    period_total  BIGINT,
    total_xp      BIGINT,
    current_level INTEGER,
    bara_coins    BIGINT,
    daily_streak  INTEGER
)
LANGUAGE sql
STABLE
AS $$
    SELECT h.user_id,
           SUM(h.amount)::bigint AS period_total,
           COALESCE(p.total_xp, 0)::bigint,
           COALESCE(p.current_level, 1),
           COALESCE(p.bara_coins, 0)::bigint,
           COALESCE(p.daily_streak, 0)
      FROM public.gamification_history h
      LEFT JOIN public.gamification_profiles p ON p.user_id = h.user_id
     WHERE h.type = p_type
       AND h.created_at >= p_since
     GROUP BY h.user_id, p.total_xp, p.current_level, p.bara_coins, p.daily_streak
     ORDER BY period_total DESC
     LIMIT p_limit;
$$;

-- Last completed ISO week's top earners by XP (for the crown marker).
CREATE OR REPLACE FUNCTION public.leaderboard_last_week_top(p_limit INTEGER)
RETURNS TABLE (user_id TEXT, weekly_xp BIGINT)
LANGUAGE sql
STABLE
AS $$
    SELECT h.user_id, SUM(h.amount)::bigint AS weekly_xp
      FROM public.gamification_history h
     WHERE h.type = 'xp_gain'
       AND h.created_at >= date_trunc('week', now()) - interval '7 days'
       AND h.created_at <  date_trunc('week', now())
     GROUP BY h.user_id
     ORDER BY weekly_xp DESC
     LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_period(TEXT, TIMESTAMPTZ, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_last_week_top(INTEGER)             TO anon, authenticated;


-- ############################################################
-- SECTION: 20260706_streak_shield.sql
-- ############################################################

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


-- ############################################################
-- SECTION: 20260706_prestige_perks.sql
-- ############################################################

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


-- ############################################################
-- SECTION: 20260706_flatten_early_curve.sql
-- ############################################################

-- ============================================================
-- Phase 27.3.5 — Flatten the early curve
-- ============================================================
-- Halve the XP thresholds for levels 2–9 so new users level up fast in week 1.
-- Levels ≥10 keep today's cumulative XP (L10 = 27,000) so nobody at L10+ ever
-- loses a level. This mirrors calculateLevel in gamificationService.ts exactly.
-- ============================================================

CREATE OR REPLACE FUNCTION public.economy_level_from_xp(p_xp NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_xp IS NULL OR p_xp < 500 THEN
        RETURN 1;
    END IF;
    IF p_xp >= 27000 THEN
        -- Unchanged (original) curve from L10 up.
        RETURN floor(power(p_xp / 1000.0, 1.0 / 1.5)) + 1;
    END IF;
    -- Below L10: halved thresholds, capped at 9.
    RETURN LEAST(9, floor(power(p_xp / 500.0, 1.0 / 1.5)) + 1);
END;
$$;


-- ############################################################
-- SECTION: 20260706_weekly_recap_email.sql
-- ############################################################

-- ============================================================
-- Phase 27.3.6 — Weekly recap email ("Your week on BARA")
-- ============================================================
-- A server-side job that, for each active user, builds the getWeeklyRecap data
-- (XP / coins / songs over the last 7 days) and INSERTs a black/white email
-- into email_queue (RULES 15–16). Scheduled weekly via pg_cron when available;
-- otherwise call enqueue_weekly_recaps() from a scheduled Edge Function / any
-- external scheduler.
-- ============================================================

-- Email preference (opt-out). Default true = receive the weekly recap.
ALTER TABLE public.clerk_users
    ADD COLUMN IF NOT EXISTS weekly_recap_emails BOOLEAN DEFAULT true;

CREATE OR REPLACE FUNCTION public.enqueue_weekly_recaps()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r         RECORD;
    v_since   TIMESTAMPTZ := now() - interval '7 days';
    v_xp      BIGINT;
    v_coins   BIGINT;
    v_listens BIGINT;
    v_html    TEXT;
    v_count   INTEGER := 0;
BEGIN
    FOR r IN
        SELECT cu.clerk_user_id, cu.email, cu.full_name
          FROM clerk_users cu
         WHERE cu.email IS NOT NULL
           AND cu.clerk_user_id IS NOT NULL
           AND COALESCE(cu.weekly_recap_emails, true) = true
           -- active in the last 7 days
           AND EXISTS (
                SELECT 1 FROM gamification_history h
                 WHERE h.user_id = cu.clerk_user_id AND h.created_at >= v_since
           )
           -- not already sent this ISO week (idempotent)
           AND NOT EXISTS (
                SELECT 1 FROM email_queue e
                 WHERE e.metadata->>'user_id' = cu.clerk_user_id
                   AND e.metadata->>'type' = 'weekly_recap'
                   AND e.created_at >= date_trunc('week', now())
           )
    LOOP
        SELECT
            COALESCE(SUM(CASE WHEN type = 'xp_gain' THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN type IN ('coin_gain', 'coin_purchase') THEN amount ELSE 0 END), 0)
          INTO v_xp, v_coins
          FROM gamification_history
         WHERE user_id = r.clerk_user_id AND created_at >= v_since;

        SELECT COUNT(*) INTO v_listens
          FROM play_history
         WHERE user_id = r.clerk_user_id AND played_at >= v_since;

        IF v_xp = 0 AND v_coins = 0 AND v_listens = 0 THEN
            CONTINUE;
        END IF;

        v_html :=
            '<div style="font-family:Arial,Helvetica,sans-serif;color:#111111;max-width:560px;margin:0 auto;padding:8px;">'
         || '<h1 style="font-size:22px;font-weight:800;margin:0 0 4px;">Your week on BARA</h1>'
         || '<p style="color:#555555;font-size:14px;margin:0 0 20px;">Hi ' || COALESCE(r.full_name, 'there')
         || ', here''s what you got up to in the last 7 days.</p>'
         || '<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px;">'
         || '<tr>'
         || '<td style="padding:14px;border:1px solid #eeeeee;text-align:center;"><div style="font-size:24px;font-weight:800;">+'
              || v_xp || '</div><div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:.05em;">XP earned</div></td>'
         || '<td style="padding:14px;border:1px solid #eeeeee;text-align:center;"><div style="font-size:24px;font-weight:800;">+'
              || v_coins || '</div><div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:.05em;">Coins earned</div></td>'
         || '<td style="padding:14px;border:1px solid #eeeeee;text-align:center;"><div style="font-size:24px;font-weight:800;">'
              || v_listens || '</div><div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:.05em;">Songs played</div></td>'
         || '</tr></table>'
         || '<a href="https://baraafrika.com/gamification" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:6px;">See your progress</a>'
         || '<p style="color:#999999;font-size:11px;margin-top:28px;border-top:1px solid #eeeeee;padding-top:16px;">'
         || 'You''re receiving this weekly recap because you''re active on BARA Afrika. '
         || '<a href="https://baraafrika.com/settings" style="color:#555555;">Manage email preferences</a>.</p>'
         || '</div>';

        INSERT INTO email_queue (to_email, subject, html_content, metadata)
        VALUES (
            r.email,
            'Your week on BARA Afrika',
            v_html,
            jsonb_build_object('type', 'weekly_recap', 'user_id', r.clerk_user_id)
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- Cron/admin only — not client-callable.
REVOKE ALL ON FUNCTION public.enqueue_weekly_recaps() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_weekly_recaps() TO service_role;

-- Schedule weekly (Mondays 08:00 UTC) if pg_cron is installed. Safe no-op
-- otherwise — enable pg_cron and re-run this block, or trigger the function
-- from a scheduled Edge Function.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        BEGIN
            PERFORM cron.unschedule('weekly-recap');
        EXCEPTION WHEN OTHERS THEN
            NULL; -- not scheduled yet
        END;
        PERFORM cron.schedule('weekly-recap', '0 8 * * 1', 'SELECT public.enqueue_weekly_recaps();');
    END IF;
END $$;
