-- ============================================
-- Comprehensive fix: Streams tables, RPC functions, RLS policies, 
-- missions system — all adapted for Clerk string user IDs
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ARTISTS: Add user_id column for creator portal
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'artists' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.artists ADD COLUMN user_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);
    END IF;
END $$;

-- Allow authenticated users to insert artists (for auto-creating artist profiles)
DROP POLICY IF EXISTS "Authenticated users can insert artists" ON public.artists;
CREATE POLICY "Authenticated users can insert artists" ON public.artists
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own artist profile
DROP POLICY IF EXISTS "Users can update own artist profile" ON public.artists;
CREATE POLICY "Users can update own artist profile" ON public.artists
    FOR UPDATE USING (true);

-- ============================================
-- 2. PLAY_HISTORY: Ensure table exists with TEXT user_id
-- ============================================
CREATE TABLE IF NOT EXISTS public.play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- Drop any existing UUID FK on play_history.user_id (in case it was created with auth.users ref)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'play_history' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%user_id%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.play_history DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- Ensure user_id is TEXT type
ALTER TABLE public.play_history ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

DROP POLICY IF EXISTS "Users can view own play history" ON public.play_history;
CREATE POLICY "Users can view own play history" ON public.play_history
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert play history" ON public.play_history;
CREATE POLICY "Users can insert play history" ON public.play_history
    FOR INSERT WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON public.play_history TO authenticated;
GRANT SELECT, INSERT ON public.play_history TO anon;
GRANT ALL ON public.play_history TO service_role;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_play_history_user ON public.play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_song ON public.play_history(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_recent ON public.play_history(user_id, played_at DESC);

-- ============================================
-- 3. INCREMENT_PLAY_COUNT RPC function
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

GRANT EXECUTE ON FUNCTION public.increment_play_count(UUID) TO anon, authenticated;

-- ============================================
-- 4. USER_SONG_LIKES: Fix for Clerk TEXT user IDs
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_song_likes (
    user_id TEXT NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, song_id)
);

ALTER TABLE public.user_song_likes ENABLE ROW LEVEL SECURITY;

-- Drop UUID FK constraint if exists
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'user_song_likes' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%user_id%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_song_likes DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- Ensure TEXT type
DO $$
BEGIN
    ALTER TABLE public.user_song_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL; -- already TEXT
END $$;

-- Open RLS policies (Clerk IDs, not auth.uid())
DROP POLICY IF EXISTS "Users can view their own song likes" ON public.user_song_likes;
CREATE POLICY "Users can view their own song likes" ON public.user_song_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own song likes" ON public.user_song_likes;
CREATE POLICY "Users can insert their own song likes" ON public.user_song_likes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own song likes" ON public.user_song_likes;
CREATE POLICY "Users can delete their own song likes" ON public.user_song_likes
    FOR DELETE USING (true);

GRANT SELECT, INSERT, DELETE ON public.user_song_likes TO authenticated;
GRANT SELECT ON public.user_song_likes TO anon;
GRANT ALL ON public.user_song_likes TO service_role;

-- ============================================
-- 5. USER_PLAYLIST_LIKES: Fix for Clerk TEXT user IDs
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_playlist_likes (
    user_id TEXT NOT NULL,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, playlist_id)
);

ALTER TABLE public.user_playlist_likes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'user_playlist_likes' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%user_id%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_playlist_likes DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

DO $$
BEGIN
    ALTER TABLE public.user_playlist_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Users can view their own playlist likes" ON public.user_playlist_likes;
CREATE POLICY "Users can view their own playlist likes" ON public.user_playlist_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own playlist likes" ON public.user_playlist_likes;
CREATE POLICY "Users can insert their own playlist likes" ON public.user_playlist_likes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own playlist likes" ON public.user_playlist_likes;
CREATE POLICY "Users can delete their own playlist likes" ON public.user_playlist_likes
    FOR DELETE USING (true);

GRANT SELECT, INSERT, DELETE ON public.user_playlist_likes TO authenticated;
GRANT SELECT ON public.user_playlist_likes TO anon;
GRANT ALL ON public.user_playlist_likes TO service_role;

-- ============================================
-- 6. USER_ARTIST_FOLLOWS: Fix for Clerk TEXT user IDs
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_artist_follows (
    user_id TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, artist_id)
);

ALTER TABLE public.user_artist_follows ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'user_artist_follows' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%user_id%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_artist_follows DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

DO $$
BEGIN
    ALTER TABLE public.user_artist_follows ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Users can view their own artist follows" ON public.user_artist_follows;
CREATE POLICY "Users can view their own artist follows" ON public.user_artist_follows
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own artist follows" ON public.user_artist_follows;
CREATE POLICY "Users can insert their own artist follows" ON public.user_artist_follows
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own artist follows" ON public.user_artist_follows;
CREATE POLICY "Users can delete their own artist follows" ON public.user_artist_follows
    FOR DELETE USING (true);

GRANT SELECT, INSERT, DELETE ON public.user_artist_follows TO authenticated;
GRANT SELECT ON public.user_artist_follows TO anon;
GRANT ALL ON public.user_artist_follows TO service_role;

-- ============================================
-- 7. MISSIONS SYSTEM: Fix user_id types and RLS for Clerk
-- ============================================

-- Ensure missions table exists
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    reputation_reward NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'daily',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Missions are viewable by everyone" ON public.missions;
CREATE POLICY "Missions are viewable by everyone" ON public.missions
    FOR SELECT USING (true);

GRANT SELECT ON public.missions TO anon, authenticated;
GRANT ALL ON public.missions TO service_role;

-- Fix user_missions: drop FK, change to TEXT
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    mission_id UUID REFERENCES public.missions(id) NOT NULL,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, mission_id)
);

ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Drop UUID FK if it exists
ALTER TABLE public.user_missions DROP CONSTRAINT IF EXISTS user_missions_user_id_fkey;

DO $$
BEGIN
    ALTER TABLE public.user_missions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL;
END $$;

-- Open RLS for Clerk users
DROP POLICY IF EXISTS "Users can view own mission progress" ON public.user_missions;
CREATE POLICY "Users can view own mission progress" ON public.user_missions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own mission progress" ON public.user_missions;
CREATE POLICY "Users can insert own mission progress" ON public.user_missions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own mission progress" ON public.user_missions;
CREATE POLICY "Users can update own mission progress" ON public.user_missions
    FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON public.user_missions TO authenticated;
GRANT SELECT ON public.user_missions TO anon;
GRANT ALL ON public.user_missions TO service_role;

-- Fix mission_history
CREATE TABLE IF NOT EXISTS public.mission_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    mission_id UUID REFERENCES public.missions(id) NOT NULL,
    xp_awarded INTEGER DEFAULT 0,
    coins_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mission_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mission_history DROP CONSTRAINT IF EXISTS mission_history_user_id_fkey;

DO $$
BEGIN
    ALTER TABLE public.mission_history ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Users can view own mission history" ON public.mission_history;
CREATE POLICY "Users can view own mission history" ON public.mission_history
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own mission history" ON public.mission_history;
CREATE POLICY "Users can insert own mission history" ON public.mission_history
    FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT ON public.mission_history TO authenticated;
GRANT SELECT ON public.mission_history TO anon;
GRANT ALL ON public.mission_history TO service_role;

-- Seed missions
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, reputation_reward, type, category)
VALUES
  ('daily_login', 'Daily Check-In', 'Log in to Bara Afrika today.', 1, 50, 5, 0.1, 'daily', 'general'),
  ('daily_listen', 'Music Enthusiast', 'Listen to 5 songs today.', 5, 50, 5, 0.1, 'daily', 'music'),
  ('daily_market_view', 'Window Shopper', 'View 10 marketplace listings.', 10, 30, 2, 0.05, 'daily', 'market'),
  ('daily_social_share', 'Bara Ambassador', 'Share any content to social media.', 1, 100, 10, 0.2, 'daily', 'social'),
  ('event_photo_upload', 'Event Photographer', 'Upload 3 photos to a past event gallery.', 3, 100, 15, 0.3, 'daily', 'social')
ON CONFLICT (key) DO NOTHING;

-- Daily missions reset function
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
        claimed_at = NULL,
        last_reset_at = NOW()
    FROM public.missions m
    WHERE um.mission_id = m.id
      AND um.user_id = p_user_id
      AND m.type = 'daily'
      AND (um.last_reset_at IS NULL OR um.last_reset_at::date < CURRENT_DATE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_daily_missions_for_user(TEXT) TO anon, authenticated;

-- ============================================
-- 8. Ensure core streams table grants are correct
-- ============================================
GRANT SELECT ON public.artists TO anon;
GRANT SELECT, INSERT, UPDATE ON public.artists TO authenticated;
GRANT ALL ON public.artists TO service_role;

GRANT SELECT ON public.albums TO anon;
GRANT SELECT, INSERT ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;

GRANT SELECT ON public.songs TO anon;
GRANT SELECT, INSERT ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;

GRANT SELECT ON public.playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;

GRANT SELECT ON public.playlist_songs TO anon;
GRANT SELECT, INSERT, DELETE ON public.playlist_songs TO authenticated;
GRANT ALL ON public.playlist_songs TO service_role;
