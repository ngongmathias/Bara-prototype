-- Fix Storage RLS Policies for Anonymous Access
-- This script creates permissive RLS policies that allow anonymous users to upload/manage files
-- Run this in your Supabase SQL Editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous uploads to business-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to business-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to sponsored-banners" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for business-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for business-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for sponsored-banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous deletes from business-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous deletes from business-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous deletes from sponsored-banners" ON storage.objects;

-- Business Images Bucket Policies
CREATE POLICY "Allow anonymous uploads to business-images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'business-images');

CREATE POLICY "Public read access for business-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

CREATE POLICY "Allow anonymous deletes from business-images"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'business-images');

-- Business Logos Bucket Policies
CREATE POLICY "Allow anonymous uploads to business-logos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Public read access for business-logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-logos');

CREATE POLICY "Allow anonymous deletes from business-logos"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'business-logos');

-- Sponsored Banners Bucket Policies
CREATE POLICY "Allow anonymous uploads to sponsored-banners"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'sponsored-banners');

CREATE POLICY "Public read access for sponsored-banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sponsored-banners');

CREATE POLICY "Allow anonymous deletes from sponsored-banners"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'sponsored-banners');

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
