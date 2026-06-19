-- ============================================================
-- Streams foundation: allow songs/albums/song_artists writes from the app
-- ============================================================
-- Diagnosis: the songs table has RLS enabled with ONLY a SELECT policy, so
-- every INSERT/UPDATE/DELETE via PostgREST is blocked — meaning neither the
-- admin (AdminSongs) nor the creator (UploadSongPage) can actually add songs;
-- only seed migrations (service_role, bypasses RLS) ever could. UploadSongPage
-- also writes songs.price, a column that was never created.
--
-- This adds the missing column and write policies, aligned with the app's
-- existing open-RLS + tokenless-anon pattern (same as missions/likes/follows
-- and the gamification fix). Admin UI remains the practical gate.
--
-- HARDENING FOLLOW-UP: once coin/real-value or moderation matters, scope these
-- writes (e.g. require the Clerk-authed client + check uploaded_by = jwt sub).
-- ============================================================

-- 1. Missing column UploadSongPage inserts
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

-- 2. songs write policies (SELECT policy already exists)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert songs" ON public.songs;
CREATE POLICY "Anyone can insert songs" ON public.songs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update songs" ON public.songs;
CREATE POLICY "Anyone can update songs" ON public.songs
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete songs" ON public.songs;
CREATE POLICY "Anyone can delete songs" ON public.songs
    FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO anon, authenticated;

-- 2b. artists: UploadSongPage auto-creates an artist row on first upload, but
--     INSERT/UPDATE were granted only to `authenticated`. The app uses the anon
--     client, so grant anon too (the INSERT policy is already WITH CHECK true).
GRANT SELECT, INSERT, UPDATE ON public.artists TO anon, authenticated;

-- 3. albums write policies (so artists can create albums for their songs)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'albums') THEN
        EXECUTE 'ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert albums" ON public.albums';
        EXECUTE 'CREATE POLICY "Anyone can insert albums" ON public.albums FOR INSERT WITH CHECK (true)';

        EXECUTE 'DROP POLICY IF EXISTS "Anyone can update albums" ON public.albums';
        EXECUTE 'CREATE POLICY "Anyone can update albums" ON public.albums FOR UPDATE USING (true)';

        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO anon, authenticated';
    END IF;
END $$;

-- 4. song_artists write policies (AdminSongs writes multi-artist credits here)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'song_artists') THEN
        EXECUTE 'ALTER TABLE public.song_artists ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS "Public can view song artists" ON public.song_artists';
        EXECUTE 'CREATE POLICY "Public can view song artists" ON public.song_artists FOR SELECT USING (true)';

        EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert song artists" ON public.song_artists';
        EXECUTE 'CREATE POLICY "Anyone can insert song artists" ON public.song_artists FOR INSERT WITH CHECK (true)';

        EXECUTE 'DROP POLICY IF EXISTS "Anyone can update song artists" ON public.song_artists';
        EXECUTE 'CREATE POLICY "Anyone can update song artists" ON public.song_artists FOR UPDATE USING (true)';

        EXECUTE 'DROP POLICY IF EXISTS "Anyone can delete song artists" ON public.song_artists';
        EXECUTE 'CREATE POLICY "Anyone can delete song artists" ON public.song_artists FOR DELETE USING (true)';

        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.song_artists TO anon, authenticated';
    END IF;
END $$;
