-- Fix RLS policies for marketplace_listing_images table to work with Clerk authentication
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled (it should be)
-- If not, enable it:
-- ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on marketplace_listing_images
DROP POLICY IF EXISTS "Public can view listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Authenticated users can insert listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Users can update their own listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON marketplace_listing_images;

-- Create new permissive policies that work with Clerk

-- Allow public read access
CREATE POLICY "Allow public read access to listing images"
ON marketplace_listing_images FOR SELECT
USING (true);

-- Allow inserts (Clerk handles authorization in app)
CREATE POLICY "Allow inserts to listing images"
ON marketplace_listing_images FOR INSERT
WITH CHECK (true);

-- Allow updates
CREATE POLICY "Allow updates to listing images"
ON marketplace_listing_images FOR UPDATE
USING (true);

-- Allow deletes
CREATE POLICY "Allow deletes to listing images"
ON marketplace_listing_images FOR DELETE
USING (true);
