-- Fix song_artists permissions: add DELETE and UPDATE grants for anon
-- The original migration only granted SELECT + INSERT to anon,
-- which causes 401 errors when admin tries to update featured artists.

-- Grant full CRUD to both roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.song_artists TO anon;
GRANT ALL ON public.song_artists TO authenticated;

-- Add DELETE policy for anon (was missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='song_artists' AND policyname='song_artists_anon_delete') THEN
        CREATE POLICY "song_artists_anon_delete" ON public.song_artists FOR DELETE TO anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='song_artists' AND policyname='song_artists_anon_update') THEN
        CREATE POLICY "song_artists_anon_update" ON public.song_artists FOR UPDATE TO anon USING (true) WITH CHECK (true);
    END IF;
END $$;
