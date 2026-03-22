-- ============================================================
-- FIX: RLS + GRANT for Streams Creator Portal
-- RUN THIS in Supabase SQL Editor: https://supabase.com/dashboard/project/sqxybqvrctegnejbkpwg/sql
-- This fixes "permission denied for table artists" errors when uploading music.
-- Root cause: App uses Clerk auth (not Supabase auth), so all requests use the
-- anon key. We need GRANT + RLS policies that allow the anon role.
-- ============================================================

-- ========== 1. GRANT table-level permissions to anon and authenticated ==========
GRANT SELECT, INSERT, UPDATE ON public.artists TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.songs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.albums TO anon, authenticated;

-- Create play_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT ON public.play_history TO anon, authenticated;

-- Also grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ========== 2. Enable RLS (idempotent) ==========
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- ========== 3. Drop existing policies to avoid duplicates ==========
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

-- ========== 4. Create RLS policies (allow all for anon + authenticated) ==========

-- Artists
CREATE POLICY "Artists are publicly readable" ON public.artists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create their artist profile" ON public.artists FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update their artist profile" ON public.artists FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Songs
CREATE POLICY "Songs are publicly readable" ON public.songs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update songs" ON public.songs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Albums
CREATE POLICY "Albums are publicly readable" ON public.albums FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert albums" ON public.albums FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update albums" ON public.albums FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Play history
CREATE POLICY "Anyone can insert play history" ON public.play_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can read play history" ON public.play_history FOR SELECT TO anon, authenticated USING (true);

-- Done! Music upload from Creator Portal should now work.
