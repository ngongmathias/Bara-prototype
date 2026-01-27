-- Fix RLS policies for business storage buckets
-- This script drops existing policies and recreates them properly

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Public read access for business images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update business images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete business images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access for business logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update business logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete business logos" ON storage.objects;

-- ============================================
-- ENABLE RLS ON storage.objects (if not already enabled)
-- ============================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE PERMISSIVE POLICIES FOR business-images
-- ============================================

-- Allow anyone (authenticated or not) to read
CREATE POLICY "Anyone can read business images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert business images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-images')
WITH CHECK (bucket_id = 'business-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete business images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-images');

-- ============================================
-- CREATE PERMISSIVE POLICIES FOR business-logos
-- ============================================

-- Allow anyone to read
CREATE POLICY "Anyone can read business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-logos');

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert business logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-logos');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update business logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-logos')
WITH CHECK (bucket_id = 'business-logos');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete business logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-logos');

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check if policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND (policyname LIKE '%business-images%' OR policyname LIKE '%business-logos%')
ORDER BY policyname;
