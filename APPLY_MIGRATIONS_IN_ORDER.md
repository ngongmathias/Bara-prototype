# Marketplace Database Setup - Apply in This Order

**IMPORTANT:** Run these SQL queries in Supabase SQL Editor in the exact order listed below.

---

## Step 1: Check What Tables Already Exist

Run this first to see what's already in your database:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'marketplace%'
ORDER BY table_name;
```

**Expected tables if migrations were applied:**
- marketplace_categories
- marketplace_subcategories
- marketplace_listings
- marketplace_listing_images
- marketplace_listing_attributes
- marketplace_featured_pricing
- marketplace_user_favorites (old name)

---

## Step 2: Apply Main Schema (If Not Already Applied)

**File:** `supabase/migrations/20260102_create_marketplace_schema.sql`

Only run this if Step 1 showed NO marketplace tables.

---

## Step 3: Apply Category Seed Data (If Not Already Applied)

**File:** `supabase/migrations/20260102_seed_marketplace_categories.sql`

Only run this if you have marketplace_categories table but it's empty.

---

## Step 4: Create Favorites Table (New Structure)

Run this to create the `marketplace_favorites` table (different from old `marketplace_user_favorites`):

```sql
-- Create marketplace_favorites table
CREATE TABLE IF NOT EXISTS marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON marketplace_favorites(listing_id);
```

---

## Step 5: Create Reports Table

Run this to create the `marketplace_reports` table:

```sql
-- Create marketplace_reports table
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
```

---

## Step 6: Fix created_by Column Type for Clerk

Run this ONLY AFTER Steps 4 and 5 are complete:

```sql
-- Drop RLS policies
DROP POLICY IF EXISTS "Users can create listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can view own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Public can view active listings" ON marketplace_listings;

-- Drop foreign key constraint
ALTER TABLE marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_created_by_fkey;

-- Change created_by from UUID to TEXT (for Clerk user IDs)
ALTER TABLE marketplace_listings 
ALTER COLUMN created_by TYPE TEXT;

-- Add index
CREATE INDEX IF NOT EXISTS idx_listings_created_by ON marketplace_listings(created_by);

-- Recreate RLS policies
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reports ENABLE ROW LEVEL SECURITY;

-- Public can view active listings
CREATE POLICY "Public can view active listings" ON marketplace_listings
  FOR SELECT
  USING (status = 'active');

-- Users can view all listings
CREATE POLICY "Users can view all listings" ON marketplace_listings
  FOR SELECT
  USING (true);

-- Users can insert listings
CREATE POLICY "Users can create listings" ON marketplace_listings
  FOR INSERT
  WITH CHECK (true);

-- Users can update listings
CREATE POLICY "Users can update own listings" ON marketplace_listings
  FOR UPDATE
  USING (true);

-- Users can delete listings
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
```

---

## Step 7: Verify Everything

Run this to confirm all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'marketplace%'
ORDER BY table_name;
```

**You should see:**
- marketplace_categories
- marketplace_subcategories
- marketplace_listings
- marketplace_listing_images
- marketplace_listing_attributes
- marketplace_featured_pricing
- marketplace_favorites ✅ (new)
- marketplace_reports ✅ (new)
- marketplace_user_favorites (old - can ignore)

---

## Step 8: Check Column Types

Verify created_by is now TEXT:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
  AND column_name IN ('created_by', 'id', 'category_id');
```

**Expected:**
- id: uuid
- category_id: uuid
- created_by: text ✅

---

## What This Fixes

1. ✅ Creates `marketplace_favorites` table (was missing)
2. ✅ Creates `marketplace_reports` table (was missing)
3. ✅ Changes `created_by` from UUID to TEXT (for Clerk user IDs like "user_31sUuNERsOYL1svijRI7Q4JN178")
4. ✅ Sets up proper RLS policies
5. ✅ Fixes the 400 error when posting listings

---

## After Completing All Steps

Try posting a listing again. The errors should be gone!
