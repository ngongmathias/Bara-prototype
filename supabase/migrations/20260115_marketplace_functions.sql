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

-- Add click_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' 
    AND column_name = 'click_count'
  ) THEN
    ALTER TABLE marketplace_listings 
    ADD COLUMN click_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add seller_website column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' 
    AND column_name = 'seller_website'
  ) THEN
    ALTER TABLE marketplace_listings 
    ADD COLUMN seller_website TEXT;
  END IF;
END $$;

-- Create index on views_count for sorting
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_views_count 
  ON marketplace_listings(views_count DESC);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at 
  ON marketplace_listings(created_at DESC);

-- Create index on price for filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price 
  ON marketplace_listings(price);

COMMENT ON FUNCTION increment_listing_views IS 'Increments the view count for a marketplace listing';
COMMENT ON FUNCTION increment_listing_clicks IS 'Increments the click count for a marketplace listing';
