-- Fix RLS policies for marketplace_listing_countries table only
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can view listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Users can insert listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Users can update listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Users can delete listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Allow public read access to listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Allow inserts to listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Allow updates to listing countries" ON marketplace_listing_countries;
    DROP POLICY IF EXISTS "Allow deletes to listing countries" ON marketplace_listing_countries;
END $$;

-- Create new permissive policies
CREATE POLICY "marketplace_listing_countries_select_policy"
ON marketplace_listing_countries FOR SELECT
USING (true);

CREATE POLICY "marketplace_listing_countries_insert_policy"
ON marketplace_listing_countries FOR INSERT
WITH CHECK (true);

CREATE POLICY "marketplace_listing_countries_update_policy"
ON marketplace_listing_countries FOR UPDATE
USING (true);

CREATE POLICY "marketplace_listing_countries_delete_policy"
ON marketplace_listing_countries FOR DELETE
USING (true);

-- Ensure RLS is enabled
ALTER TABLE marketplace_listing_countries ENABLE ROW LEVEL SECURITY;
