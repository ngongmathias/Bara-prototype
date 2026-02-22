-- Fix: Gamification tables use UUID for user_id but Clerk IDs are TEXT strings
-- like 'user_39EUqrQ4of91lQx8RnwkSZOTiQF'. This migration converts them to TEXT.
-- IMPORTANT: All RLS policies referencing user_id must be dropped BEFORE altering column types.
-- NOTE: DROP POLICY IF EXISTS requires the TABLE to exist, so we create missing tables first.

-- ============================================================
-- STEP 1: CREATE MISSING TABLES (missions, user_missions, mission_history)
-- Must come BEFORE DROP POLICY because PostgreSQL requires the table to exist
-- even when using DROP POLICY IF EXISTS.
-- ============================================================

-- missions: master list of all available missions
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  goal INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  reputation_reward INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'weekly', 'achievement')),
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_missions: per-user mission progress
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- mission_history: log of completed missions
CREATE TABLE IF NOT EXISTS public.mission_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  mission_key TEXT,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_history ENABLE ROW LEVEL SECURITY;

-- Seed default missions if table is empty
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, reputation_reward, type, category)
SELECT * FROM (VALUES
  ('daily_login', 'Daily Login', 'Log in to Bara Afrika today', 1, 10, 5, 0, 'daily', 'engagement'),
  ('listen_song', 'Music Lover', 'Listen to 3 songs on Streams', 3, 20, 10, 0, 'daily', 'streams'),
  ('post_listing', 'Marketplace Maven', 'Post a listing on the Marketplace', 1, 50, 25, 1, 'daily', 'marketplace'),
  ('write_review', 'Critic', 'Write a business review', 1, 30, 15, 1, 'daily', 'community'),
  ('attend_event', 'Event Explorer', 'Register for an event', 1, 40, 20, 0, 'weekly', 'events'),
  ('refer_friend', 'Ambassador', 'Refer a friend to Bara Afrika', 1, 100, 50, 2, 'weekly', 'growth'),
  ('week_streak_7', '7-Day Streak', 'Maintain a 7-day login streak', 7, 200, 100, 5, 'achievement', 'engagement')
) AS v(key, title, description, goal, xp_reward, coin_reward, reputation_reward, type, category)
WHERE NOT EXISTS (SELECT 1 FROM public.missions LIMIT 1);

-- ============================================================
-- STEP 2: DROP ALL RLS POLICIES that reference user_id columns
-- (Tables now guaranteed to exist from STEP 1 above)
-- ============================================================

-- gamification_profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Anyone can read gamification profiles" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Anyone can insert gamification profiles" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Anyone can update gamification profiles" ON public.gamification_profiles;

-- gamification_history policies
DROP POLICY IF EXISTS "Users can view own history" ON public.gamification_history;
DROP POLICY IF EXISTS "Anyone can read gamification history" ON public.gamification_history;
DROP POLICY IF EXISTS "Anyone can insert gamification history" ON public.gamification_history;

-- user_achievements policies
DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Anyone can read user achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Anyone can insert user achievements" ON public.user_achievements;

-- user_missions policies
DROP POLICY IF EXISTS "Users can view own mission progress" ON public.user_missions;
DROP POLICY IF EXISTS "Anyone can read user missions" ON public.user_missions;
DROP POLICY IF EXISTS "Anyone can insert user missions" ON public.user_missions;
DROP POLICY IF EXISTS "Anyone can update user missions" ON public.user_missions;

-- mission_history policies
DROP POLICY IF EXISTS "Users can view own mission history" ON public.mission_history;
DROP POLICY IF EXISTS "Anyone can read mission history" ON public.mission_history;
DROP POLICY IF EXISTS "Anyone can insert mission history" ON public.mission_history;

-- ============================================================
-- STEP 3: DROP FK CONSTRAINTS and ALTER COLUMN TYPES
-- ============================================================

-- gamification_profiles
ALTER TABLE public.gamification_profiles
  DROP CONSTRAINT IF EXISTS gamification_profiles_pkey CASCADE;
ALTER TABLE public.gamification_profiles
  DROP CONSTRAINT IF EXISTS gamification_profiles_user_id_fkey CASCADE;
ALTER TABLE public.gamification_profiles
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.gamification_profiles
  ADD PRIMARY KEY (user_id);

-- Add missing columns that the service expects
ALTER TABLE public.gamification_profiles
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS multiplier NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS trust_rank NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- gamification_history
ALTER TABLE public.gamification_history
  DROP CONSTRAINT IF EXISTS gamification_history_user_id_fkey CASCADE;
ALTER TABLE public.gamification_history
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.gamification_history
  ALTER COLUMN amount DROP NOT NULL;

-- user_achievements
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey CASCADE;
ALTER TABLE public.user_achievements
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_achievement_id_key;
ALTER TABLE public.user_achievements
  ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);

-- ============================================================
-- STEP 4: RECREATE RLS POLICIES with open access (Clerk handles auth)
-- ============================================================

-- gamification_profiles
CREATE POLICY "Anyone can read gamification profiles" ON public.gamification_profiles
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gamification profiles" ON public.gamification_profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gamification profiles" ON public.gamification_profiles
  FOR UPDATE USING (true);

-- gamification_history
CREATE POLICY "Anyone can read gamification history" ON public.gamification_history
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gamification history" ON public.gamification_history
  FOR INSERT WITH CHECK (true);

-- user_achievements
CREATE POLICY "Anyone can read user achievements" ON public.user_achievements
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- user_missions
CREATE POLICY "Anyone can read user missions" ON public.user_missions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user missions" ON public.user_missions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user missions" ON public.user_missions
  FOR UPDATE USING (true);

-- mission_history
CREATE POLICY "Anyone can read mission history" ON public.mission_history
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert mission history" ON public.mission_history
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- STEP 5: Fix email_queue RLS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert email_queue" ON public.email_queue;
DROP POLICY IF EXISTS "Anyone can read email_queue" ON public.email_queue;
DROP POLICY IF EXISTS "Anyone can update email_queue" ON public.email_queue;

CREATE POLICY "Anyone can insert email_queue" ON public.email_queue
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read email_queue" ON public.email_queue
  FOR SELECT USING (true);
CREATE POLICY "Anyone can update email_queue" ON public.email_queue
  FOR UPDATE USING (true);

-- ============================================================
-- STEP 6: RLS policy for missions master table (user_missions/mission_history already in STEP 4)
-- ============================================================
CREATE POLICY "Anyone can read missions" ON public.missions
  FOR SELECT USING (true);

-- ============================================================
-- STEP 7: Email queue processing trigger (uses pg_net if available)
-- NOTE: The service_role_key is read from Supabase Vault.
-- You must store it first via the Supabase Dashboard → Vault,
-- or run: SELECT vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_email_queue()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  v_service_role_key TEXT;
BEGIN
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  edge_function_url := 'https://sqxybqvrctegnejbkpwg.supabase.co/functions/v1/send-email';

  -- Try reading the key from Supabase Vault first
  BEGIN
    SELECT decrypted_secret INTO v_service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_service_role_key := NULL;
  END;

  -- Fallback: try the old current_setting approach
  IF v_service_role_key IS NULL THEN
    v_service_role_key := current_setting('app.settings.service_role_key', true);
  END IF;

  IF v_service_role_key IS NULL OR v_service_role_key = '' THEN
    RAISE WARNING 'process_email_queue: no service_role_key found in Vault or app.settings';
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'type', 'INSERT',
        'table', 'email_queue'
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'process_email_queue failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_process_email_queue ON public.email_queue;
CREATE TRIGGER tr_process_email_queue
AFTER INSERT ON public.email_queue
FOR EACH ROW EXECUTE FUNCTION public.process_email_queue();

-- ============================================================
-- STEP 8: Create user_verifications table (was missing entirely)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  verification_type TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verification_type)
);

ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verifications" ON public.user_verifications
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert verifications" ON public.user_verifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update verifications" ON public.user_verifications
  FOR UPDATE USING (true);

-- ============================================================
-- STEP 9: Create clerk_users table (syncs Clerk user data for DB-level lookups)
-- Used by email functions to resolve user_id → email
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clerk_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clerk_users_clerk_user_id ON public.clerk_users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_clerk_users_email ON public.clerk_users(email);

ALTER TABLE public.clerk_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clerk_users" ON public.clerk_users
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clerk_users" ON public.clerk_users
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clerk_users" ON public.clerk_users
  FOR UPDATE USING (true);
