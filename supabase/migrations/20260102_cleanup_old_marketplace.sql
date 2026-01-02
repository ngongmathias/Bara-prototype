-- Cleanup Old Marketplace Tables
-- Run this BEFORE the new marketplace schema migration

-- Drop all old marketplace tables if they exist
-- Order matters due to foreign key constraints

DROP TABLE IF EXISTS marketplace_user_favorites CASCADE;
DROP TABLE IF EXISTS marketplace_featured_pricing CASCADE;
DROP TABLE IF EXISTS marketplace_admin_actions CASCADE;
DROP TABLE IF EXISTS marketplace_listing_attributes CASCADE;
DROP TABLE IF EXISTS marketplace_listing_images CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;
DROP TABLE IF EXISTS marketplace_subcategories CASCADE;
DROP TABLE IF EXISTS marketplace_categories CASCADE;

-- Drop any old functions
DROP FUNCTION IF EXISTS increment_marketplace_listing_views(UUID);
DROP FUNCTION IF EXISTS update_marketplace_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Old marketplace tables dropped successfully. You can now run the new schema migration.';
END $$;
