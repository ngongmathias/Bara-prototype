-- ============================================
-- Migration: Fix ALL Supabase 400/401 errors
-- Date: March 19, 2026
-- ============================================

-- ISSUE 1: playlists INSERT 401
-- Root cause: anon role only has SELECT on playlists table.
-- The app uses Supabase anon key (no Clerk→Supabase JWT bridge),
-- so all requests come as anon role.
GRANT INSERT, UPDATE, DELETE ON public.playlists TO anon;

-- ISSUE 2: reset_daily_missions_for_user returns 400
-- Root cause: function body references um.last_reset_at which doesn't exist.
-- Also referenced is_daily which doesn't exist (column is type='daily').
-- Also user_missions lacks last_reset_at and updated_at columns.
-- Fix: add missing columns + rewrite function.

-- Add missing columns to user_missions
ALTER TABLE public.user_missions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.user_missions ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMPTZ;
ALTER TABLE public.user_missions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Rewrite the function with correct column references
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
        last_reset_at = NOW(),
        updated_at = NOW()
    FROM public.missions m
    WHERE um.mission_id = m.id
      AND um.user_id = p_user_id
      AND m.type = 'daily'
      AND (um.last_reset_at IS NULL OR um.last_reset_at::date < CURRENT_DATE);
END;
$$;

-- Ensure function is callable by all roles
GRANT EXECUTE ON FUNCTION public.reset_daily_missions_for_user(TEXT) TO anon, authenticated, service_role;

-- ISSUE 3: user_missions PATCH 400
-- Root cause: client sends completed_at in UPDATE but column didn't exist.
-- Fixed above by adding the column. Also ensure grants are correct.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_missions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_missions TO authenticated;
GRANT ALL ON public.user_missions TO service_role;

-- Also grant on missions table for lookups
GRANT SELECT ON public.missions TO anon;
GRANT SELECT ON public.missions TO authenticated;
