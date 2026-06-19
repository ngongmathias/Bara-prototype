-- ============================================================
-- Streams foundation: the 'music' storage bucket (Pre-Launch Blocker 7A-1.5)
-- ============================================================
-- UploadSongPage uploads both audio and cover art to a bucket named 'music'
-- (supabase.storage.from('music')), but no migration ever created it. Without
-- the bucket + policies, every song upload fails, so Streams has no content.
-- This provisions it idempotently (public read; write open to the app's
-- tokenless anon client, matching how AdminSongs + UploadSongPage talk to
-- Supabase today).
--
-- HARDENING FOLLOW-UP: anon write on a public bucket means anyone with the
-- (public) anon key could upload. Before/at launch, switch the two upload call
-- sites to the Clerk-authed client (createAuthenticatedSupabaseClient) and
-- restrict these policies to `authenticated`, or move to signed uploads.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music',
  'music',
  true,
  104857600, -- 100 MB (audio files can be large)
  ARRAY[
    -- audio
    'audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg',
    'audio/aac','audio/mp4','audio/x-m4a','audio/flac','audio/webm',
    -- cover art
    'image/jpeg','image/jpg','image/png','image/webp','image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (so the player can stream and show cover art)
DROP POLICY IF EXISTS "Public read access for music" ON storage.objects;
CREATE POLICY "Public read access for music"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'music');

-- Authenticated upload / update / delete (admin gating happens in the app)
DROP POLICY IF EXISTS "Authenticated users can upload music" ON storage.objects;
CREATE POLICY "Authenticated users can upload music"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'music');

DROP POLICY IF EXISTS "Authenticated users can update music" ON storage.objects;
CREATE POLICY "Authenticated users can update music"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'music');

DROP POLICY IF EXISTS "Authenticated users can delete music" ON storage.objects;
CREATE POLICY "Authenticated users can delete music"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'music');
