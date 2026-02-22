-- Fix: Gamification tables use UUID for user_id but Clerk IDs are TEXT strings
-- like 'user_39EUqrQ4of91lQx8RnwkSZOTiQF'. This migration converts them to TEXT.

-- 1. gamification_profiles: Drop FK constraint, change type
ALTER TABLE public.gamification_profiles
  DROP CONSTRAINT IF EXISTS gamification_profiles_pkey CASCADE;

ALTER TABLE public.gamification_profiles
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.gamification_profiles
  ADD PRIMARY KEY (user_id);

-- Add missing columns that the service expects
ALTER TABLE public.gamification_profiles
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS multiplier NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS trust_rank NUMERIC DEFAULT 1.0;

-- 2. gamification_history: Drop FK, change type
ALTER TABLE public.gamification_history
  DROP CONSTRAINT IF EXISTS gamification_history_user_id_fkey;

ALTER TABLE public.gamification_history
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Make amount nullable (admin_override entries may not have amount)
ALTER TABLE public.gamification_history
  ALTER COLUMN amount DROP NOT NULL;

-- 3. user_achievements: Drop FK, change type
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

ALTER TABLE public.user_achievements
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Drop and recreate unique constraint
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_achievement_id_key;
ALTER TABLE public.user_achievements
  ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);

-- 4. user_missions: Drop FK, change type
ALTER TABLE public.user_missions
  DROP CONSTRAINT IF EXISTS user_missions_user_id_fkey;

ALTER TABLE public.user_missions
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Drop and recreate unique constraint
ALTER TABLE public.user_missions
  DROP CONSTRAINT IF EXISTS user_missions_user_id_mission_id_key;
ALTER TABLE public.user_missions
  ADD CONSTRAINT user_missions_user_id_mission_id_key UNIQUE (user_id, mission_id);

-- 5. mission_history: Drop FK, change type
ALTER TABLE public.mission_history
  DROP CONSTRAINT IF EXISTS mission_history_user_id_fkey;

ALTER TABLE public.mission_history
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 6. Fix RLS policies to use open access (since we don't use Supabase Auth, we use Clerk)
-- Drop old policies that reference auth.uid()
DROP POLICY IF EXISTS "Users can update own profile" ON public.gamification_profiles;
DROP POLICY IF EXISTS "Users can view own history" ON public.gamification_history;
DROP POLICY IF EXISTS "Users can view own mission progress" ON public.user_missions;
DROP POLICY IF EXISTS "Users can view own mission history" ON public.mission_history;

-- Recreate with open access (Clerk handles auth on the client side)
CREATE POLICY "Anyone can read gamification profiles" ON public.gamification_profiles
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gamification profiles" ON public.gamification_profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gamification profiles" ON public.gamification_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can read gamification history" ON public.gamification_history
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gamification history" ON public.gamification_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read user missions" ON public.user_missions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user missions" ON public.user_missions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user missions" ON public.user_missions
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can read mission history" ON public.mission_history
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert mission history" ON public.mission_history
  FOR INSERT WITH CHECK (true);

-- 7. Fix email_queue RLS: allow anon/authenticated to insert (for triggers)
DROP POLICY IF EXISTS "Anyone can insert email_queue" ON public.email_queue;
CREATE POLICY "Anyone can insert email_queue" ON public.email_queue
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read email_queue" ON public.email_queue;
CREATE POLICY "Anyone can read email_queue" ON public.email_queue
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can update email_queue" ON public.email_queue;
CREATE POLICY "Anyone can update email_queue" ON public.email_queue
  FOR UPDATE USING (true);

-- 8. Create a database webhook trigger to call send-email edge function
-- when new rows are inserted into email_queue
-- Note: Supabase Database Webhooks must be configured in the Dashboard
-- under Database > Webhooks, pointing to the send-email edge function.
-- This trigger function will call the edge function via pg_net if available.

-- Create the email processing function that calls the edge function
CREATE OR REPLACE FUNCTION public.process_email_queue()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only process pending emails
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Get the edge function URL from vault or hardcode
  edge_function_url := 'https://sqxybqvrctegnejbkpwg.supabase.co/functions/v1/send-email';
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- If pg_net extension is available, make HTTP call
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

-- 9. Create user_verifications table (was missing entirely)
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  verification_type TEXT NOT NULL, -- 'email', 'phone', 'business'
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
