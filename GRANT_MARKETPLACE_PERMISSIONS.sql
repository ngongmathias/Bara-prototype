-- Grant permissions to anon and authenticated roles for marketplace tables
-- Run this in Supabase SQL Editor

-- Grant permissions on marketplace_listings
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO authenticated;

-- Grant permissions on marketplace_listing_images
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_images TO authenticated;

-- Grant permissions on marketplace_listing_countries
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_countries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_countries TO authenticated;

-- Grant usage on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
