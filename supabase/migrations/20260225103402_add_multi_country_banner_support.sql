-- Migration: Add multi-country support for banner ads
-- Allows one banner ad to target multiple countries (e.g., Ethiopian Airlines showing in Ethiopia, Kenya, Rwanda)

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS sponsored_banner_countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_id UUID NOT NULL REFERENCES sponsored_banners(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(banner_id, country_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_banner_countries_banner ON sponsored_banner_countries(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_countries_country ON sponsored_banner_countries(country_id);

-- Add comment
COMMENT ON TABLE sponsored_banner_countries IS 'Junction table allowing banner ads to target multiple countries';

-- Migration function to populate junction table from existing banner_country_id relationships
-- This preserves existing ads
DO $$
DECLARE
  banner_record RECORD;
BEGIN
  FOR banner_record IN 
    SELECT id, country_id 
    FROM sponsored_banners 
    WHERE country_id IS NOT NULL
  LOOP
    INSERT INTO sponsored_banner_countries (banner_id, country_id)
    VALUES (banner_record.id, banner_record.country_id)
    ON CONFLICT (banner_id, country_id) DO NOTHING;
  END LOOP;
END $$;

-- Add helpful view for easier queries
CREATE OR REPLACE VIEW sponsored_banners_with_countries AS
SELECT 
  sb.*,
  ARRAY_AGG(
    json_build_object(
      'country_id', c.id,
      'country_name', c.name,
      'country_code', c.code,
      'country_flag_url', c.flag_url
    )
  ) AS targeted_countries
FROM sponsored_banners sb
LEFT JOIN sponsored_banner_countries sbc ON sb.id = sbc.banner_id
LEFT JOIN countries c ON sbc.country_id = c.id
GROUP BY sb.id;

COMMENT ON VIEW sponsored_banners_with_countries IS 'View showing all banners with their targeted countries array';

-- Optional: Add constraint to ensure at least one country is targeted
-- (Uncomment if you want to enforce this rule)
-- CREATE OR REPLACE FUNCTION ensure_banner_has_country()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM sponsored_banner_countries WHERE banner_id = NEW.id
--   ) THEN
--     RAISE EXCEPTION 'Banner must target at least one country';
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_ensure_banner_has_country
-- AFTER INSERT OR UPDATE ON sponsored_banners
-- FOR EACH ROW
-- EXECUTE FUNCTION ensure_banner_has_country();

-- Migration complete
-- Next steps:
-- 1. Update AdminSponsoredBanners.tsx to allow selecting multiple countries
-- 2. Update TopBannerAd/BottomBannerAd to filter by selected country using the context
-- 3. Keep country_id field in sponsored_banners for backward compatibility (deprecated)
