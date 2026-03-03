-- Migration: Fix Missions System
-- Fixes: FK constraint (Clerk IDs are TEXT not UUID), missing RLS write policies,
--        missing daily_login mission, daily reset function

-- 1. Drop the FK constraint on user_missions.user_id so we can use Clerk string IDs
--    (The original migration referenced auth.users(id) which is UUID, but this app uses Clerk IDs)
ALTER TABLE public.user_missions DROP CONSTRAINT IF EXISTS user_missions_user_id_fkey;
ALTER TABLE public.user_missions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Also fix mission_history FK
ALTER TABLE public.mission_history DROP CONSTRAINT IF EXISTS mission_history_user_id_fkey;
ALTER TABLE public.mission_history ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 2. Add missing RLS policies for INSERT and UPDATE on user_missions
--    (Original migration only had SELECT policies)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_missions' AND policyname = 'Users can insert own mission progress'
    ) THEN
        CREATE POLICY "Users can insert own mission progress" ON public.user_missions
            FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_missions' AND policyname = 'Users can update own mission progress'
    ) THEN
        CREATE POLICY "Users can update own mission progress" ON public.user_missions
            FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mission_history' AND policyname = 'Users can insert own mission history'
    ) THEN
        CREATE POLICY "Users can insert own mission history" ON public.mission_history
            FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

-- 3. Seed missing missions
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, reputation_reward, type, category)
VALUES
  ('daily_login', 'Daily Check-In', 'Log in to Bara Afrika today.', 1, 50, 5, 0.1, 'daily', 'general'),
  ('event_photo_upload', 'Event Photographer', 'Upload 3 photos to a past event gallery.', 3, 100, 15, 0.3, 'daily', 'social')
ON CONFLICT (key) DO NOTHING;

-- 4. Create a function to reset daily missions (call via cron or on first access of the day)
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
      AND um.last_reset_at::date < CURRENT_DATE;
END;
$$;

-- Grant execute to anon/authenticated so the client can call it
GRANT EXECUTE ON FUNCTION public.reset_daily_missions_for_user(TEXT) TO anon, authenticated;
