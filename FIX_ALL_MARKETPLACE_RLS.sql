-- Fix RLS policies for ALL marketplace tables to work with Clerk authentication
-- Run this in Supabase SQL Editor

-- ============================================
-- marketplace_listings table
-- ============================================
DROP POLICY IF EXISTS "Public can view active listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON marketplace_listings;

CREATE POLICY "Allow public read access to listings"
ON marketplace_listings FOR SELECT
USING (true);

CREATE POLICY "Allow inserts to listings"
ON marketplace_listings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow updates to listings"
ON marketplace_listings FOR UPDATE
USING (true);

CREATE POLICY "Allow deletes to listings"
ON marketplace_listings FOR DELETE
USING (true);

-- ============================================
-- marketplace_listing_countries table
-- ============================================
DROP POLICY IF EXISTS "Public can view listing countries" ON marketplace_listing_countries;
DROP POLICY IF EXISTS "Users can insert listing countries" ON marketplace_listing_countries;
DROP POLICY IF EXISTS "Users can update listing countries" ON marketplace_listing_countries;
DROP POLICY IF EXISTS "Users can delete listing countries" ON marketplace_listing_countries;

CREATE POLICY "Allow public read access to listing countries"
ON marketplace_listing_countries FOR SELECT
USING (true);

CREATE POLICY "Allow inserts to listing countries"
ON marketplace_listing_countries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow updates to listing countries"
ON marketplace_listing_countries FOR UPDATE
USING (true);

CREATE POLICY "Allow deletes to listing countries"
ON marketplace_listing_countries FOR DELETE
USING (true);

-- ============================================
-- Verify RLS is enabled on all tables
-- ============================================
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_countries ENABLE ROW LEVEL SECURITY;
