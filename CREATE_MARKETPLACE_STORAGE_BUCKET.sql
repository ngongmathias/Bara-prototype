-- Create storage bucket for marketplace listing images
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-listings',
  'marketplace-listings',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access for marketplace listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-listings');

CREATE POLICY "Authenticated users can upload marketplace listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-listings' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own marketplace listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'marketplace-listings'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own marketplace listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace-listings'
  AND auth.role() = 'authenticated'
);
