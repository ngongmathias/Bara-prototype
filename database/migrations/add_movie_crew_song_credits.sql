-- ============================================================
-- BARA AFRIKA — Movie Crew + Song Credits
-- Adds producer/writer/actors to movies
-- Adds multi-artist support (featuring) + producer/songwriter to songs
-- Run in Supabase SQL Editor
-- ============================================================

-- === MOVIES: Add crew fields ===
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='movies' AND column_name='producers') THEN
        ALTER TABLE public.movies ADD COLUMN producers TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='movies' AND column_name='writers') THEN
        ALTER TABLE public.movies ADD COLUMN writers TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='movies' AND column_name='actors') THEN
        ALTER TABLE public.movies ADD COLUMN actors TEXT;
    END IF;
END $$;

-- === SONGS: Add producer and songwriter fields ===
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='songs' AND column_name='producer') THEN
        ALTER TABLE public.songs ADD COLUMN producer TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='songs' AND column_name='songwriter') THEN
        ALTER TABLE public.songs ADD COLUMN songwriter TEXT;
    END IF;
END $$;

-- === SONG ARTISTS: Junction table for multi-artist support ===
-- Supports: primary artist, featured artist, producer, songwriter roles
CREATE TABLE IF NOT EXISTS public.song_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'primary',  -- primary, featured, producer, songwriter
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(song_id, artist_id, role)
);

CREATE INDEX IF NOT EXISTS idx_song_artists_song ON public.song_artists(song_id);
CREATE INDEX IF NOT EXISTS idx_song_artists_artist ON public.song_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_artists_role ON public.song_artists(role);

ALTER TABLE public.song_artists ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='song_artists' AND policyname='song_artists_public_read') THEN
        CREATE POLICY "song_artists_public_read" ON public.song_artists FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='song_artists' AND policyname='song_artists_auth_all') THEN
        CREATE POLICY "song_artists_auth_all" ON public.song_artists FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='song_artists' AND policyname='song_artists_anon_insert') THEN
        CREATE POLICY "song_artists_anon_insert" ON public.song_artists FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

GRANT SELECT, INSERT ON public.song_artists TO anon;
GRANT ALL ON public.song_artists TO authenticated;

-- Migrate existing artist_id relationships into song_artists junction table
-- (Only for songs that have an artist_id but no entry in song_artists yet)
INSERT INTO public.song_artists (song_id, artist_id, role, display_order)
SELECT s.id, s.artist_id, 'primary', 0
FROM public.songs s
WHERE s.artist_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.song_artists sa
    WHERE sa.song_id = s.id AND sa.artist_id = s.artist_id AND sa.role = 'primary'
  )
ON CONFLICT DO NOTHING;
