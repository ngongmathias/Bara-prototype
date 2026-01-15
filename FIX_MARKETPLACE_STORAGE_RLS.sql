-- Fix RLS policies for marketplace-listings bucket to work with Clerk authentication
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access for marketplace listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload marketplace listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own marketplace listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own marketplace listing images" ON storage.objects;

-- Create new policies that allow public uploads
-- Since we're using Clerk (not Supabase Auth), we can't use auth.role()

-- Allow public read access
CREATE POLICY "Public read access for marketplace listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-listings');

-- Allow anyone to upload (we'll handle authorization in the app layer with Clerk)
CREATE POLICY "Allow uploads to marketplace listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'marketplace-listings');

-- Allow updates to marketplace listing images
CREATE POLICY "Allow updates to marketplace listing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'marketplace-listings');

-- Allow deletes to marketplace listing images
CREATE POLICY "Allow deletes to marketplace listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'marketplace-listings');
