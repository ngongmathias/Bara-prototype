# Supabase SQL Scripts - Run in SQL Editor

## Script 1: Multi-Country Support & Condition Field

```sql
-- Add condition column to marketplace_listings if it doesn't exist
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'used' CHECK (condition IN ('new', 'used', 'like-new', 'good', 'fair'));

-- Create marketplace_listing_countries junction table
CREATE TABLE IF NOT EXISTS marketplace_listing_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, country_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_countries_listing_id 
  ON marketplace_listing_countries(listing_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_countries_country_id 
  ON marketplace_listing_countries(country_id);

-- Enable RLS
ALTER TABLE marketplace_listing_countries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_listing_countries
CREATE POLICY "Anyone can view listing countries"
  ON marketplace_listing_countries FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert listing countries"
  ON marketplace_listing_countries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing countries"
  ON marketplace_listing_countries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_listing_countries.listing_id
      AND marketplace_listings.created_by = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own listing countries"
  ON marketplace_listing_countries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_listing_countries.listing_id
      AND marketplace_listings.created_by = auth.uid()::text
    )
  );

-- Migrate existing data: Copy country_id to junction table
INSERT INTO marketplace_listing_countries (listing_id, country_id)
SELECT id, country_id 
FROM marketplace_listings 
WHERE country_id IS NOT NULL
ON CONFLICT (listing_id, country_id) DO NOTHING;

COMMENT ON TABLE marketplace_listing_countries IS 'Junction table for marketplace listings and countries (many-to-many)';
```

## Script 2: View Count Functions & Additional Columns

```sql
-- Add seller_website column if it doesn't exist
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS seller_website TEXT;

-- Add click_count column if it doesn't exist
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Function to increment listing view count
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = listing_id;
END;
$$;

-- Function to increment listing click count
CREATE OR REPLACE FUNCTION increment_listing_clicks(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_listings
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = listing_id;
END;
$$;

-- Create indexes for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_views_count 
  ON marketplace_listings(views_count DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at 
  ON marketplace_listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price 
  ON marketplace_listings(price);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_condition 
  ON marketplace_listings(condition);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_is_featured 
  ON marketplace_listings(is_featured) WHERE is_featured = true;

COMMENT ON FUNCTION increment_listing_views IS 'Increments the view count for a marketplace listing';
COMMENT ON FUNCTION increment_listing_clicks IS 'Increments the click count for a marketplace listing';
```

## Script 3: Marketplace Listing Images Table (if not exists)

```sql
-- Create marketplace_listing_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_images_listing_id 
  ON marketplace_listing_images(listing_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_images_display_order 
  ON marketplace_listing_images(listing_id, display_order);

-- Enable RLS
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view listing images"
  ON marketplace_listing_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert listing images"
  ON marketplace_listing_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing images"
  ON marketplace_listing_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_listing_images.listing_id
      AND marketplace_listings.created_by = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own listing images"
  ON marketplace_listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_listing_images.listing_id
      AND marketplace_listings.created_by = auth.uid()::text
    )
  );

COMMENT ON TABLE marketplace_listing_images IS 'Stores multiple images for marketplace listings';
```

## How to Run:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a **New Query**
4. Copy and paste **Script 1** first
5. Click **Run**
6. Repeat for **Script 2** and **Script 3**

## Verification:

After running, verify with:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('marketplace_listing_countries', 'marketplace_listing_images');

-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
AND column_name IN ('condition', 'seller_website', 'click_count');

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('increment_listing_views', 'increment_listing_clicks');
```
