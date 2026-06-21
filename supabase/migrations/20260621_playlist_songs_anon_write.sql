-- ============================================
-- Allow anon client to add/remove playlist songs (Create Playlist → Add Songs)
-- The Streams app writes with the tokenless anon client, but an earlier migration
-- only granted INSERT/DELETE on playlist_songs to `authenticated`, so adding a
-- song to a freshly created playlist silently failed. Grant anon the same writes
-- (RLS is already open — USING/ WITH CHECK true). Idempotent: safe to re-run.
-- Run this in your Supabase SQL Editor.
-- ============================================

-- Ensure open RLS policies exist (no-ops if already present)
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view playlist songs" ON public.playlist_songs;
CREATE POLICY "Public can view playlist songs" ON public.playlist_songs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add playlist songs" ON public.playlist_songs;
CREATE POLICY "Anyone can add playlist songs" ON public.playlist_songs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can remove playlist songs" ON public.playlist_songs;
CREATE POLICY "Anyone can remove playlist songs" ON public.playlist_songs
    FOR DELETE USING (true);

-- Grant the anon role the writes the client actually performs
GRANT SELECT, INSERT, DELETE ON public.playlist_songs TO anon;
GRANT SELECT, INSERT, DELETE ON public.playlist_songs TO authenticated;
GRANT ALL ON public.playlist_songs TO service_role;

-- Playlists themselves are created with the anon client too — make sure anon can
-- insert/update them (covers the "Create Playlist" step before songs are added).
DROP POLICY IF EXISTS "Anyone can create playlists" ON public.playlists;
CREATE POLICY "Anyone can create playlists" ON public.playlists
    FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;
