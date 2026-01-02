-- FINAL FIX: Create missing table and fix column types for Clerk authentication
-- Run this in Supabase SQL Editor

-- Step 1: Create marketplace_reports table (missing)
CREATE TABLE IF NOT EXISTS marketplace_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_reports_listing ON marketplace_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON marketplace_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON marketplace_reports(reported_by);

-- Step 2: Drop RLS policies that depend on created_by
DROP POLICY IF EXISTS "Users can create listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can view own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Public can view active listings" ON marketplace_listings;

-- Step 3: Drop foreign key constraints
ALTER TABLE marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_created_by_fkey;

ALTER TABLE marketplace_favorites 
DROP CONSTRAINT IF EXISTS marketplace_favorites_user_id_fkey;

-- Step 4: Change column types from UUID to TEXT (for Clerk user IDs)
ALTER TABLE marketplace_listings 
ALTER COLUMN created_by TYPE TEXT;

ALTER TABLE marketplace_favorites 
ALTER COLUMN user_id TYPE TEXT;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_listings_created_by ON marketplace_listings(created_by);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON marketplace_favorites(user_id);

-- Step 6: Enable RLS
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reports ENABLE ROW LEVEL SECURITY;

-- Step 7: Recreate RLS policies
CREATE POLICY "Public can view active listings" ON marketplace_listings
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view all listings" ON marketplace_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create listings" ON marketplace_listings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own listings" ON marketplace_listings
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own listings" ON marketplace_listings
  FOR DELETE
  USING (true);

CREATE POLICY "Users can manage favorites" ON marketplace_favorites
  FOR ALL
  USING (true);

CREATE POLICY "Users can create reports" ON marketplace_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view reports" ON marketplace_reports
  FOR SELECT
  USING (true);
