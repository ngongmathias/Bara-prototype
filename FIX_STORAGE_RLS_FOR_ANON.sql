-- Fix Storage RLS Policies to Allow Anonymous Access
-- Since you're using Clerk authentication, users appear as 'anon' to Supabase
-- This adds policies for anonymous users alongside your existing authenticated policies

-- Drop existing anon policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous users to upload business images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to delete business images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to update business images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to upload business logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to delete business logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to update business logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to upload sponsored banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to delete sponsored banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to update sponsored banners" ON storage.objects;

-- Business Images - Add anon policies
CREATE POLICY "Allow anonymous users to upload business images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'business-images');

CREATE POLICY "Allow anonymous users to delete business images"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'business-images');

CREATE POLICY "Allow anonymous users to update business images"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'business-images');

-- Business Logos - Add anon policies
CREATE POLICY "Allow anonymous users to upload business logos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Allow anonymous users to delete business logos"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'business-logos');

CREATE POLICY "Allow anonymous users to update business logos"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'business-logos');

-- Sponsored Banners - Add anon policies
CREATE POLICY "Allow anonymous users to upload sponsored banners"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'sponsored-banners');

CREATE POLICY "Allow anonymous users to delete sponsored banners"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'sponsored-banners');

CREATE POLICY "Allow anonymous users to update sponsored banners"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'sponsored-banners');

-- Verify all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
