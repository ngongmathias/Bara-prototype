-- ============================================================
-- FIX: RLS policies for Streams Creator Portal (artists, songs, albums, play_history)
-- RUN THIS in Supabase SQL Editor: https://supabase.com/dashboard/project/sqxybqvrctegnejbkpwg/sql
-- This fixes "permission denied for table artists" errors when uploading music
-- ============================================================

-- Enable RLS (idempotent)
ALTER TABLE IF EXISTS public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.albums ENABLE ROW LEVEL SECURITY;

-- Create play_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE IF EXISTS public.play_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (safe if they don't exist)
DROP POLICY IF EXISTS "Artists are publicly readable" ON public.artists;
DROP POLICY IF EXISTS "Users can create their artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can update their artist profile" ON public.artists;

DROP POLICY IF EXISTS "Songs are publicly readable" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can insert songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can update songs" ON public.songs;

DROP POLICY IF EXISTS "Albums are publicly readable" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can insert albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can update albums" ON public.albums;

DROP POLICY IF EXISTS "Anyone can insert play history" ON public.play_history;
DROP POLICY IF EXISTS "Users can read play history" ON public.play_history;

-- Artists: public read, anyone can create/update (Clerk handles auth, not Supabase auth)
CREATE POLICY "Artists are publicly readable" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Users can create their artist profile" ON public.artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their artist profile" ON public.artists FOR UPDATE USING (true);

-- Songs: public read, anyone can insert/update
CREATE POLICY "Songs are publicly readable" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update songs" ON public.songs FOR UPDATE USING (true);

-- Albums: public read, anyone can insert/update
CREATE POLICY "Albums are publicly readable" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert albums" ON public.albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update albums" ON public.albums FOR UPDATE USING (true);

-- Play history: anyone can insert/read
CREATE POLICY "Anyone can insert play history" ON public.play_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read play history" ON public.play_history FOR SELECT USING (true);

-- Done! Music upload from Creator Portal should now work.
