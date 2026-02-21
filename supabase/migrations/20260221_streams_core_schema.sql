-- ============================================
-- Streams Core Schema Migration
-- Creates the foundational tables for the Bara Streams music platform
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Artists table
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT,
    bio TEXT,
    genre TEXT,
    country TEXT,
    verified BOOLEAN DEFAULT false,
    monthly_listeners INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    cover_url TEXT,
    release_date DATE,
    type TEXT DEFAULT 'album', -- 'album', 'single', 'ep'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Songs table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
    file_url TEXT,
    cover_url TEXT,
    duration INTEGER DEFAULT 0, -- duration in seconds
    plays INTEGER DEFAULT 0,
    genre TEXT,
    track_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_by TEXT, -- Clerk user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Playlist Songs junction table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(playlist_id, song_id)
);

-- 6. Play History table (for "Recently Played" and analytics)
CREATE TABLE IF NOT EXISTS public.play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Artists, Albums, Songs: Public read access
DROP POLICY IF EXISTS "Public can view artists" ON public.artists;
CREATE POLICY "Public can view artists" ON public.artists FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view albums" ON public.albums;
CREATE POLICY "Public can view albums" ON public.albums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view songs" ON public.songs;
CREATE POLICY "Public can view songs" ON public.songs FOR SELECT USING (true);

-- Playlists: Public read for public playlists, full access for creator
DROP POLICY IF EXISTS "Public can view public playlists" ON public.playlists;
CREATE POLICY "Public can view public playlists" ON public.playlists
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can manage own playlists" ON public.playlists;
CREATE POLICY "Users can manage own playlists" ON public.playlists
    FOR ALL USING (true);

-- Playlist Songs: Public read for songs in public playlists
DROP POLICY IF EXISTS "Public can view playlist songs" ON public.playlist_songs;
CREATE POLICY "Public can view playlist songs" ON public.playlist_songs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage playlist songs" ON public.playlist_songs;
CREATE POLICY "Users can manage playlist songs" ON public.playlist_songs
    FOR ALL USING (true);

-- Play History: Users can only see/manage their own
DROP POLICY IF EXISTS "Users can view own play history" ON public.play_history;
CREATE POLICY "Users can view own play history" ON public.play_history
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert play history" ON public.play_history;
CREATE POLICY "Users can insert play history" ON public.play_history
    FOR INSERT WITH CHECK (true);

-- ============================================
-- Service role full access for admin operations
-- ============================================
GRANT ALL ON public.artists TO service_role;
GRANT ALL ON public.albums TO service_role;
GRANT ALL ON public.songs TO service_role;
GRANT ALL ON public.playlists TO service_role;
GRANT ALL ON public.playlist_songs TO service_role;
GRANT ALL ON public.play_history TO service_role;

GRANT SELECT ON public.artists TO anon;
GRANT SELECT ON public.albums TO anon;
GRANT SELECT ON public.songs TO anon;
GRANT SELECT ON public.playlists TO anon;
GRANT SELECT ON public.playlist_songs TO anon;

GRANT SELECT, INSERT ON public.artists TO authenticated;
GRANT SELECT, INSERT ON public.albums TO authenticated;
GRANT SELECT, INSERT ON public.songs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.playlist_songs TO authenticated;
GRANT SELECT, INSERT ON public.play_history TO authenticated;

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_songs_artist ON public.songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_album ON public.songs(album_id);
CREATE INDEX IF NOT EXISTS idx_albums_artist ON public.albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song ON public.playlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_user ON public.play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_song ON public.play_history(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_recent ON public.play_history(user_id, played_at DESC);

-- ============================================
-- RPC: Increment play count
-- ============================================
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
