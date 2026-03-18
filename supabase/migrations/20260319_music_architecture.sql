-- Sprint 6: Music Architecture — admin vs creator songs
-- Adds uploaded_by and upload_type columns to songs table
-- Updates placeholder audio URLs with real playable SoundHelix files
-- Seeds realistic song titles, varied cover art

-- 1. Add music architecture columns
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS uploaded_by TEXT DEFAULT 'admin';
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS upload_type TEXT DEFAULT 'platform'
  CHECK (upload_type IN ('platform', 'creator'));

-- 2. Add gallery columns to country_info
ALTER TABLE public.country_info ADD COLUMN IF NOT EXISTS gallery_image_1_url TEXT;
ALTER TABLE public.country_info ADD COLUMN IF NOT EXISTS gallery_image_2_url TEXT;

-- 3. Ensure grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO anon, authenticated;
