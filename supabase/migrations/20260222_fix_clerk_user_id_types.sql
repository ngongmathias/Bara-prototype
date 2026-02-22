-- Fix: Gamification tables use UUID for user_id but Clerk IDs are TEXT strings
-- like 'user_39EUqrQ4of91lQx8RnwkSZOTiQF'. This migration converts them to TEXT.
-- IMPORTANT: All RLS policies referencing user_id must be dropped BEFORE altering column types.

-- ============================================================
-- STEP 1: DROP ALL RLS POLICIES that reference user_id columns
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
-- STEP 2: DROP FK CONSTRAINTS and ALTER COLUMN TYPES
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

-- user_missions
ALTER TABLE public.user_missions
  DROP CONSTRAINT IF EXISTS user_missions_user_id_fkey CASCADE;
ALTER TABLE public.user_missions
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.user_missions
  DROP CONSTRAINT IF EXISTS user_missions_user_id_mission_id_key;
ALTER TABLE public.user_missions
  ADD CONSTRAINT user_missions_user_id_mission_id_key UNIQUE (user_id, mission_id);

-- mission_history
ALTER TABLE public.mission_history
  DROP CONSTRAINT IF EXISTS mission_history_user_id_fkey CASCADE;
ALTER TABLE public.mission_history
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================================
-- STEP 3: RECREATE RLS POLICIES with open access (Clerk handles auth)
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
-- STEP 4: Fix email_queue RLS
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
-- STEP 5: Email queue processing trigger (uses pg_net if available)
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_email_queue()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  edge_function_url := 'https://sqxybqvrctegnejbkpwg.supabase.co/functions/v1/send-email';
  service_role_key := current_setting('app.settings.service_role_key', true);

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
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
-- STEP 6: Create user_verifications table (was missing entirely)
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
