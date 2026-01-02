-- Fix created_by field to support Clerk user IDs (text format)
-- Clerk user IDs are strings like "user_31sUuNERsOYL1svijRI7Q4JN178"

-- Drop the foreign key constraint to auth.users
ALTER TABLE marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_created_by_fkey;

-- Change created_by from UUID to TEXT
ALTER TABLE marketplace_listings 
ALTER COLUMN created_by TYPE TEXT;

-- Do the same for favorites table
ALTER TABLE marketplace_favorites 
DROP CONSTRAINT IF EXISTS marketplace_favorites_user_id_fkey;

ALTER TABLE marketplace_favorites 
ALTER COLUMN user_id TYPE TEXT;

-- Do the same for reports table
ALTER TABLE marketplace_reports 
DROP CONSTRAINT IF EXISTS marketplace_reports_reported_by_fkey;

ALTER TABLE marketplace_reports 
ALTER COLUMN reported_by TYPE TEXT;

-- Add indexes for the text fields
CREATE INDEX IF NOT EXISTS idx_listings_created_by ON marketplace_listings(created_by);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON marketplace_reports(reported_by);
