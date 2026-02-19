-- Fix Permissions for Streams Platform
-- Run this in your Supabase SQL Editor

-- 1. Grant permissions for artists
GRANT SELECT ON public.artists TO anon;
GRANT SELECT ON public.artists TO authenticated;
GRANT ALL ON public.artists TO service_role;

-- 2. Grant permissions for albums
GRANT SELECT ON public.albums TO anon;
GRANT SELECT ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;

-- 3. Grant permissions for songs
GRANT SELECT ON public.songs TO anon;
GRANT SELECT ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;

-- 4. Ensure RLS is enabled (should be, but just in case)
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- 5. Re-apply Public Read Policies (to be safe)
DROP POLICY IF EXISTS "Public can view artists" ON public.artists;
CREATE POLICY "Public can view artists" ON public.artists FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view albums" ON public.albums;
CREATE POLICY "Public can view albums" ON public.albums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view songs" ON public.songs;
CREATE POLICY "Public can view songs" ON public.songs FOR SELECT USING (true);
