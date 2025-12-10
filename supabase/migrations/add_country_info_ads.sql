-- Migration: Add advertisement fields to country_info table
-- This allows each country to have a dedicated ad managed directly in country info
-- Replaces the need for show_on_country_detail toggle in sponsored_banners

-- Add advertisement fields
ALTER TABLE country_info 
ADD COLUMN IF NOT EXISTS ad_image_url TEXT,
ADD COLUMN IF NOT EXISTS ad_company_name TEXT,
ADD COLUMN IF NOT EXISTS ad_company_website TEXT,
ADD COLUMN IF NOT EXISTS ad_tagline TEXT,
ADD COLUMN IF NOT EXISTS ad_is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ad_click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ad_view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ad_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ad_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraint to ensure country_id is unique (one country_info per country)
ALTER TABLE country_info 
ADD CONSTRAINT country_info_country_id_unique UNIQUE (country_id);

-- Add index for faster ad queries
CREATE INDEX IF NOT EXISTS idx_country_info_ad_active ON country_info(ad_is_active) WHERE ad_is_active = true;

-- Add comment explaining the architecture
COMMENT ON COLUMN country_info.ad_image_url IS 'Country page advertisement image (recommended: 600x600px square format)';
COMMENT ON COLUMN country_info.ad_company_name IS 'Company/organization name for the country page ad';
COMMENT ON COLUMN country_info.ad_company_website IS 'Website URL for the country page ad';
COMMENT ON COLUMN country_info.ad_tagline IS 'Short tagline for the country page ad (optional)';
COMMENT ON COLUMN country_info.ad_is_active IS 'Whether the country page ad is currently active and should be displayed';

-- Create trigger to update ad_updated_at on changes
CREATE OR REPLACE FUNCTION update_country_info_ad_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.ad_image_url IS DISTINCT FROM OLD.ad_image_url) OR
     (NEW.ad_company_name IS DISTINCT FROM OLD.ad_company_name) OR
     (NEW.ad_company_website IS DISTINCT FROM OLD.ad_company_website) OR
     (NEW.ad_tagline IS DISTINCT FROM OLD.ad_tagline) OR
     (NEW.ad_is_active IS DISTINCT FROM OLD.ad_is_active) THEN
    NEW.ad_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_country_info_ad_timestamp
BEFORE UPDATE ON country_info
FOR EACH ROW
EXECUTE FUNCTION update_country_info_ad_timestamp();

-- Migration complete
-- Next steps:
-- 1. Update AdminCountryInfo.tsx to include ad management section
-- 2. Update CountryDetailPage.tsx to fetch and display country info ads
-- 3. Deprecate show_on_country_detail toggle in sponsored_banners admin (keep field for backward compatibility)
