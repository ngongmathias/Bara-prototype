-- Create marketplace_listing_countries junction table for multi-country support
CREATE TABLE IF NOT EXISTS marketplace_listing_countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, country_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_countries_listing_id 
  ON marketplace_listing_countries(listing_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_countries_country_id 
  ON marketplace_listing_countries(country_id);

-- Add condition column to marketplace_listings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' 
    AND column_name = 'condition'
  ) THEN
    ALTER TABLE marketplace_listings 
    ADD COLUMN condition VARCHAR(20) CHECK (condition IN ('new', 'used', 'like-new'));
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE marketplace_listing_countries ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_listing_countries
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
      AND marketplace_listings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own listing countries"
  ON marketplace_listing_countries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_listing_countries.listing_id
      AND marketplace_listings.created_by = auth.uid()
    )
  );

-- Migrate existing listings to use the junction table
-- This will copy the country_id from marketplace_listings to the junction table
INSERT INTO marketplace_listing_countries (listing_id, country_id)
SELECT id, country_id 
FROM marketplace_listings 
WHERE country_id IS NOT NULL
ON CONFLICT (listing_id, country_id) DO NOTHING;

COMMENT ON TABLE marketplace_listing_countries IS 'Junction table for marketplace listings and countries - supports multi-country targeting';
COMMENT ON COLUMN marketplace_listing_countries.listing_id IS 'Reference to the marketplace listing';
COMMENT ON COLUMN marketplace_listing_countries.country_id IS 'Reference to the country where this listing should appear';
