-- ============================================================
-- BARA AFRIKA — Link Artists to User Accounts
-- Run in Supabase SQL Editor
-- ============================================================

-- Add user_id to artists table (links to Clerk user account)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Index for looking up artist by user
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id) WHERE user_id IS NOT NULL;

-- Ensure songs table has uploaded_by and upload_type (may already exist from 7.47)
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS uploaded_by TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS upload_type TEXT DEFAULT 'platform';

-- Set existing songs without uploaded_by to 'admin' / 'platform'
UPDATE public.songs SET uploaded_by = 'admin', upload_type = 'platform' WHERE uploaded_by IS NULL;
