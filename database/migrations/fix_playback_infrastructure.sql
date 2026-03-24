-- ============================================================
-- BARA AFRIKA — Fix Playback Infrastructure
-- Creates missing tables and functions for music playback
-- Run in Supabase SQL Editor
-- ============================================================

-- Play History table (tracks what users listened to)
CREATE TABLE IF NOT EXISTS public.play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    played_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_play_history_user ON public.play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_song ON public.play_history(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_date ON public.play_history(played_at DESC);

ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='play_history' AND policyname='play_history_insert') THEN
        CREATE POLICY "play_history_insert" ON public.play_history FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='play_history' AND policyname='play_history_select') THEN
        CREATE POLICY "play_history_select" ON public.play_history FOR SELECT USING (true);
    END IF;
END $$;

GRANT SELECT, INSERT ON public.play_history TO anon;
GRANT ALL ON public.play_history TO authenticated;

-- User Song Likes table
CREATE TABLE IF NOT EXISTS public.user_song_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_user_song_likes_user ON public.user_song_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_song_likes_song ON public.user_song_likes(song_id);

ALTER TABLE public.user_song_likes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_song_likes' AND policyname='song_likes_insert') THEN
        CREATE POLICY "song_likes_insert" ON public.user_song_likes FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_song_likes' AND policyname='song_likes_select') THEN
        CREATE POLICY "song_likes_select" ON public.user_song_likes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_song_likes' AND policyname='song_likes_delete') THEN
        CREATE POLICY "song_likes_delete" ON public.user_song_likes FOR DELETE USING (true);
    END IF;
END $$;

GRANT SELECT, INSERT, DELETE ON public.user_song_likes TO anon;
GRANT ALL ON public.user_song_likes TO authenticated;

-- Increment play count RPC function
CREATE OR REPLACE FUNCTION public.increment_play_count(p_song_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.songs
    SET plays = COALESCE(plays, 0) + 1
    WHERE id = p_song_id;
END;
$$;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION public.increment_play_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_play_count(UUID) TO authenticated;

-- Ensure songs table has 'plays' column (may already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'songs' AND column_name = 'plays'
    ) THEN
        ALTER TABLE public.songs ADD COLUMN plays INTEGER DEFAULT 0;
    END IF;
END $$;

-- Movie watchlist table (only if movies table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='movies') THEN
        CREATE TABLE IF NOT EXISTS public.movie_watchlist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL,
            movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
            added_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(user_id, movie_id)
        );
        ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movie_watchlist' AND policyname='movie_watchlist_all') THEN
            CREATE POLICY "movie_watchlist_all" ON public.movie_watchlist FOR ALL USING (true) WITH CHECK (true);
        END IF;
        GRANT ALL ON public.movie_watchlist TO anon;
        GRANT ALL ON public.movie_watchlist TO authenticated;
    END IF;
END $$;

-- Ebook library table (only if ebooks table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ebooks') THEN
        CREATE TABLE IF NOT EXISTS public.ebook_library (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL,
            ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE,
            added_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(user_id, ebook_id)
        );
        ALTER TABLE public.ebook_library ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ebook_library' AND policyname='ebook_library_all') THEN
            CREATE POLICY "ebook_library_all" ON public.ebook_library FOR ALL USING (true) WITH CHECK (true);
        END IF;
        GRANT ALL ON public.ebook_library TO anon;
        GRANT ALL ON public.ebook_library TO authenticated;
    END IF;
END $$;

-- Playlists: ensure user_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'playlists' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.playlists ADD COLUMN user_id TEXT;
    END IF;
END $$;
