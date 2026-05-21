-- Fix (25.5.x): country_gallery_photos (20260507) and country_key_listings
-- (20260508) were shipped with table privileges and RLS policies scoped
-- TO authenticated. BARA authenticates users with Clerk, NOT Supabase Auth, so
-- every request from the browser runs as the anon Postgres role. Net effect:
--   - INSERT/UPDATE/DELETE on the tables fail with
--       "permission denied for table ..." (SQLSTATE 42501)
--   - photo/logo uploads to the country-gallery and country-key-listing-logos
--     storage buckets are rejected by the TO authenticated storage policies
-- so admins cannot add gallery photos or key listings at all.
--
-- Exact same root cause (and fix) as 20260428_fix_blog_comments_grants.sql.
--
-- This migration:
--   (a) grants table writes to anon  — admin gating is enforced in the frontend
--       AdminAuthGuard, matching country_info / slideshow_images / etc.
--   (b) re-asserts table RLS write policies TO public
--   (c) re-asserts both storage buckets' write policies TO public
--   (d) raises the country-key-listing-logos bucket file-size limit from the
--       over-aggressive 100 KB to 5 MB, matching every other country-* bucket.
-- Idempotent: safe to re-apply. Apply 20260507 + 20260508 first if the tables
-- do not yet exist on the target database.

-- (a) Table privileges -----------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.country_gallery_photos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.country_key_listings   TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- (b) Table RLS ------------------------------------------------------------

ALTER TABLE public.country_gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_key_listings   ENABLE ROW LEVEL SECURITY;

-- Drop the TO authenticated write policies plus the public-read policies, then
-- replace with a single permissive FOR ALL policy each (read + write).
DROP POLICY IF EXISTS "Authenticated insert country gallery photos" ON public.country_gallery_photos;
DROP POLICY IF EXISTS "Authenticated update country gallery photos" ON public.country_gallery_photos;
DROP POLICY IF EXISTS "Authenticated delete country gallery photos" ON public.country_gallery_photos;
DROP POLICY IF EXISTS "Public read country gallery photos"          ON public.country_gallery_photos;
DROP POLICY IF EXISTS "Public access country gallery photos"        ON public.country_gallery_photos;
CREATE POLICY "Public access country gallery photos"
    ON public.country_gallery_photos
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated insert country key listings" ON public.country_key_listings;
DROP POLICY IF EXISTS "Authenticated update country key listings" ON public.country_key_listings;
DROP POLICY IF EXISTS "Authenticated delete country key listings" ON public.country_key_listings;
DROP POLICY IF EXISTS "Public read country key listings"          ON public.country_key_listings;
DROP POLICY IF EXISTS "Public access country key listings"        ON public.country_key_listings;
CREATE POLICY "Public access country key listings"
    ON public.country_key_listings
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- (c) Storage policies -----------------------------------------------------

DROP POLICY IF EXISTS "Public read country gallery"          ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload country gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update country gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete country gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public access country gallery"        ON storage.objects;
CREATE POLICY "Public access country gallery"
    ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'country-gallery')
    WITH CHECK (bucket_id = 'country-gallery');

DROP POLICY IF EXISTS "Public read country key listing logos"          ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload country key listing logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update country key listing logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete country key listing logos" ON storage.objects;
DROP POLICY IF EXISTS "Public access country key listing logos"        ON storage.objects;
CREATE POLICY "Public access country key listing logos"
    ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'country-key-listing-logos')
    WITH CHECK (bucket_id = 'country-key-listing-logos');

-- (d) Raise the logo bucket file-size limit --------------------------------
-- 100 KB was far too small for a normal PNG/JPEG logo. Match the 5 MB used by
-- country-gallery and the country-flags / country-leaders / etc. buckets.

UPDATE storage.buckets
   SET file_size_limit = 5242880  -- 5 MB
 WHERE id = 'country-key-listing-logos';
