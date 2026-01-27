-- Create storage buckets for business images and logos
-- Run this in Supabase SQL Editor

-- Create business-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-images',
  'business-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create business-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-logos',
  'business-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR business-images BUCKET
-- ============================================

-- Allow public read access
CREATE POLICY "Public read access for business images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete business images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-images');

-- ============================================
-- RLS POLICIES FOR business-logos BUCKET
-- ============================================

-- Allow public read access
CREATE POLICY "Public read access for business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-logos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload business logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-logos');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update business logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-logos');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete business logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-logos');
