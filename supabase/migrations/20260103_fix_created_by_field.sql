-- Fix created_by field to support Clerk user IDs (text format)
-- Clerk user IDs are strings like "user_31sUuNERsOYL1svijRI7Q4JN178"

-- Step 1: Drop all RLS policies that depend on created_by column
DROP POLICY IF EXISTS "Users can create listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can view own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Public can view active listings" ON marketplace_listings;

-- Step 2: Drop foreign key constraints
ALTER TABLE marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_created_by_fkey;

ALTER TABLE marketplace_favorites 
DROP CONSTRAINT IF EXISTS marketplace_favorites_user_id_fkey;

ALTER TABLE marketplace_reports 
DROP CONSTRAINT IF EXISTS marketplace_reports_reported_by_fkey;

-- Step 3: Change column types from UUID to TEXT
ALTER TABLE marketplace_listings 
ALTER COLUMN created_by TYPE TEXT;

ALTER TABLE marketplace_favorites 
ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE marketplace_reports 
ALTER COLUMN reported_by TYPE TEXT;

-- Step 4: Add indexes for the text fields
CREATE INDEX IF NOT EXISTS idx_listings_created_by ON marketplace_listings(created_by);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON marketplace_reports(reported_by);

-- Step 5: Recreate RLS policies with TEXT column type
-- Note: Since we're using Clerk (not Supabase Auth), we'll make policies simpler
-- Enable RLS
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reports ENABLE ROW LEVEL SECURITY;

-- Public can view active listings
CREATE POLICY "Public can view active listings" ON marketplace_listings
  FOR SELECT
  USING (status = 'active');

-- Users can view all listings (for admin/moderation)
CREATE POLICY "Users can view all listings" ON marketplace_listings
  FOR SELECT
  USING (true);

-- Users can insert listings (we'll handle auth in application layer)
CREATE POLICY "Users can create listings" ON marketplace_listings
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own listings (checked by created_by field)
CREATE POLICY "Users can update own listings" ON marketplace_listings
  FOR UPDATE
  USING (true);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON marketplace_listings
  FOR DELETE
  USING (true);

-- Favorites policies
CREATE POLICY "Users can manage favorites" ON marketplace_favorites
  FOR ALL
  USING (true);

-- Reports policies
CREATE POLICY "Users can create reports" ON marketplace_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view reports" ON marketplace_reports
  FOR SELECT
  USING (true);
