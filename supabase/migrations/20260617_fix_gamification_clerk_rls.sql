-- ============================================================
-- Migration: Fix BARA Coins / XP / Streak system for Clerk
-- ============================================================
-- Root cause this fixes:
--   The 20260412 migration tightened gamification_profiles RLS to require the
--   Clerk JWT (request.jwt.claims->>'sub'), but GamificationService talks to
--   Supabase through the tokenless anon client. Result: every profile
--   SELECT/INSERT/UPDATE was silently blocked, so coins, XP and streaks never
--   persisted, and the daily_login mission (tracked after the null-profile
--   guard in checkDailyStreak) never fired.
--
--   This migration aligns gamification_profiles, user_achievements and
--   gamification_history with the same Clerk-TEXT id + open-RLS pattern already
--   used by user_missions, user_song_likes, marketplace_favorites, etc., so the
--   anon client works again.
--
--   NOTE (security): open RLS lets the client write its own profile directly.
--   That matches the rest of the app today and coins carry no real-money value
--   yet. Before coins become spendable for real value, move all coin/XP
--   mutations behind SECURITY DEFINER RPCs (server-authoritative) and restore
--   strict RLS. Tracked as the gamification hardening follow-up.
-- ============================================================

-- ------------------------------------------------------------
-- 1. gamification_profiles: Clerk TEXT user_id + required columns
-- ------------------------------------------------------------

-- Drop the auth.users FK (Clerk ids are not UUIDs in auth.users)
ALTER TABLE public.gamification_profiles
    DROP CONSTRAINT IF EXISTS gamification_profiles_user_id_fkey;

-- Convert user_id to TEXT if it isn't already
DO $$
BEGIN
    ALTER TABLE public.gamification_profiles ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL; -- already TEXT
END $$;

-- Ensure every column the service reads/writes exists
ALTER TABLE public.gamification_profiles
    ADD COLUMN IF NOT EXISTS total_xp BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS bara_coins BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS multiplier FLOAT DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS trust_rank NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Keep the legacy daily_streak column in sync with consecutive_days for any
-- existing rows (Header + LeaderboardPage read daily_streak).
UPDATE public.gamification_profiles
SET daily_streak = consecutive_days
WHERE COALESCE(daily_streak, 0) <> COALESCE(consecutive_days, 0);

ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;

-- Replace JWT-bound policies with open policies (anon client compatible)
DROP POLICY IF EXISTS "gamification_select" ON public.gamification_profiles;
DROP POLICY IF EXISTS "gamification_insert" ON public.gamification_profiles;
DROP POLICY IF EXISTS "gamification_update" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.gamification_profiles;

CREATE POLICY "gamification_select" ON public.gamification_profiles
    FOR SELECT USING (true);
CREATE POLICY "gamification_insert" ON public.gamification_profiles
    FOR INSERT WITH CHECK (true);
CREATE POLICY "gamification_update" ON public.gamification_profiles
    FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON public.gamification_profiles TO anon, authenticated;
GRANT ALL ON public.gamification_profiles TO service_role;

-- ------------------------------------------------------------
-- 2. user_achievements: Clerk TEXT user_id + open RLS
-- ------------------------------------------------------------
ALTER TABLE public.user_achievements
    DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

DO $$
BEGIN
    ALTER TABLE public.user_achievements ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL;
END $$;

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "user_achievements_select" ON public.user_achievements;
DROP POLICY IF EXISTS "user_achievements_insert" ON public.user_achievements;

CREATE POLICY "user_achievements_select" ON public.user_achievements
    FOR SELECT USING (true);
CREATE POLICY "user_achievements_insert" ON public.user_achievements
    FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT ON public.user_achievements TO anon, authenticated;
GRANT ALL ON public.user_achievements TO service_role;

-- ------------------------------------------------------------
-- 3. gamification_history: Clerk TEXT user_id + open RLS
--    (admin economy dashboard reads this for coin-sink/spend totals)
-- ------------------------------------------------------------
ALTER TABLE public.gamification_history
    DROP CONSTRAINT IF EXISTS gamification_history_user_id_fkey;

DO $$
BEGIN
    ALTER TABLE public.gamification_history ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL;
END $$;

-- amount can be NULL for admin_override rows the service inserts
ALTER TABLE public.gamification_history ALTER COLUMN amount DROP NOT NULL;

ALTER TABLE public.gamification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own history" ON public.gamification_history;
DROP POLICY IF EXISTS "gamification_history_select" ON public.gamification_history;
DROP POLICY IF EXISTS "gamification_history_insert" ON public.gamification_history;

CREATE POLICY "gamification_history_select" ON public.gamification_history
    FOR SELECT USING (true);
CREATE POLICY "gamification_history_insert" ON public.gamification_history
    FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT ON public.gamification_history TO anon, authenticated;
GRANT ALL ON public.gamification_history TO service_role;

CREATE INDEX IF NOT EXISTS idx_gamification_history_user ON public.gamification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_history_type ON public.gamification_history(type);
CREATE INDEX IF NOT EXISTS idx_gamification_history_created ON public.gamification_history(created_at DESC);

-- ------------------------------------------------------------
-- 4. Restore a correct reset_daily_missions_for_user
--    (the 20260318 version referenced missions.is_daily and
--     user_missions.updated_at, neither of which exist)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reset_daily_missions_for_user(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
      AND m.type = 'daily'
      AND (um.last_reset_at IS NULL OR um.last_reset_at::date < CURRENT_DATE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_daily_missions_for_user(TEXT) TO anon, authenticated;
