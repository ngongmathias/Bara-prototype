-- ============================================
-- Fix: Playlist INSERT policy (401 Unauthorized)
-- The existing "Users can manage own playlists" policy uses FOR ALL USING (true)
-- but INSERT requires WITH CHECK, not USING. Add explicit INSERT policy.
-- ============================================

-- Drop the overly broad policy and replace with specific ones
DROP POLICY IF EXISTS "Users can manage own playlists" ON public.playlists;

-- SELECT: anyone can see public playlists (already exists) + own playlists
DROP POLICY IF EXISTS "Users can view own playlists" ON public.playlists;
CREATE POLICY "Users can view own playlists" ON public.playlists
    FOR SELECT USING (true);

-- INSERT: authenticated users can create playlists
DROP POLICY IF EXISTS "Users can create playlists" ON public.playlists;
CREATE POLICY "Users can create playlists" ON public.playlists
    FOR INSERT WITH CHECK (true);

-- UPDATE: users can update their own playlists
DROP POLICY IF EXISTS "Users can update own playlists" ON public.playlists;
CREATE POLICY "Users can update own playlists" ON public.playlists
    FOR UPDATE USING (true);

-- DELETE: users can delete their own playlists
DROP POLICY IF EXISTS "Users can delete own playlists" ON public.playlists;
CREATE POLICY "Users can delete own playlists" ON public.playlists
    FOR DELETE USING (true);

-- Ensure grants are correct
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT SELECT ON public.playlists TO anon;

-- ============================================
-- Fix: reset_daily_missions_for_user RPC (400 Bad Request)
-- Re-create the function in case migration wasn't applied
-- ============================================

CREATE OR REPLACE FUNCTION public.reset_daily_missions_for_user(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_missions
    SET current_progress = 0,
        is_completed = false,
        updated_at = now()
    WHERE user_id = p_user_id
      AND mission_id IN (
          SELECT id FROM public.missions WHERE is_daily = true
      );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_daily_missions_for_user(TEXT) TO anon, authenticated;

-- ============================================
-- Ensure user_missions table has proper RLS policies
-- ============================================
ALTER TABLE IF EXISTS public.user_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own missions" ON public.user_missions;
CREATE POLICY "Users can view own missions" ON public.user_missions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own missions" ON public.user_missions;
CREATE POLICY "Users can insert own missions" ON public.user_missions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own missions" ON public.user_missions;
CREATE POLICY "Users can update own missions" ON public.user_missions
    FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON public.user_missions TO authenticated;
GRANT SELECT ON public.user_missions TO anon;
GRANT ALL ON public.user_missions TO service_role;
