-- ============================================================
-- BARA Marketplace: Complete Access Fix
-- Covers ALL marketplace tables for Clerk-authenticated apps.
-- Run this once in the Supabase SQL Editor.
-- ============================================================

-- ─────────────────────────────────────────
-- 1. marketplace_categories
-- ─────────────────────────────────────────
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON marketplace_categories;
CREATE POLICY "Allow public read access to categories"
    ON marketplace_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts to categories" ON marketplace_categories;
CREATE POLICY "Allow inserts to categories"
    ON marketplace_categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates to categories" ON marketplace_categories;
CREATE POLICY "Allow updates to categories"
    ON marketplace_categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow deletes to categories" ON marketplace_categories;
CREATE POLICY "Allow deletes to categories"
    ON marketplace_categories FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_categories TO authenticated;

-- ─────────────────────────────────────────
-- 2. marketplace_subcategories
-- ─────────────────────────────────────────
ALTER TABLE marketplace_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to subcategories" ON marketplace_subcategories;
CREATE POLICY "Allow public read access to subcategories"
    ON marketplace_subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts to subcategories" ON marketplace_subcategories;
CREATE POLICY "Allow inserts to subcategories"
    ON marketplace_subcategories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates to subcategories" ON marketplace_subcategories;
CREATE POLICY "Allow updates to subcategories"
    ON marketplace_subcategories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow deletes to subcategories" ON marketplace_subcategories;
CREATE POLICY "Allow deletes to subcategories"
    ON marketplace_subcategories FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_subcategories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_subcategories TO authenticated;

-- ─────────────────────────────────────────
-- 3. marketplace_listings
-- ─────────────────────────────────────────
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Allow public read access to listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Allow inserts to listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Allow updates to listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Allow deletes to listings" ON marketplace_listings;

CREATE POLICY "Allow public read access to listings"
    ON marketplace_listings FOR SELECT USING (true);

CREATE POLICY "Allow inserts to listings"
    ON marketplace_listings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates to listings"
    ON marketplace_listings FOR UPDATE USING (true);

CREATE POLICY "Allow deletes to listings"
    ON marketplace_listings FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO authenticated;

-- ─────────────────────────────────────────
-- 4. marketplace_listing_images
-- ─────────────────────────────────────────
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Allow public read access to listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Authenticated users can insert listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Allow inserts to listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Users can update their own listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Allow updates to listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON marketplace_listing_images;
DROP POLICY IF EXISTS "Allow deletes to listing images" ON marketplace_listing_images;

CREATE POLICY "Allow public read access to listing images"
    ON marketplace_listing_images FOR SELECT USING (true);

CREATE POLICY "Allow inserts to listing images"
    ON marketplace_listing_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates to listing images"
    ON marketplace_listing_images FOR UPDATE USING (true);

CREATE POLICY "Allow deletes to listing images"
    ON marketplace_listing_images FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_images TO authenticated;

-- ─────────────────────────────────────────
-- 5. marketplace_listing_attributes
-- ─────────────────────────────────────────
ALTER TABLE marketplace_listing_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to listing attributes" ON marketplace_listing_attributes;
CREATE POLICY "Allow public read access to listing attributes"
    ON marketplace_listing_attributes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts to listing attributes" ON marketplace_listing_attributes;
CREATE POLICY "Allow inserts to listing attributes"
    ON marketplace_listing_attributes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates to listing attributes" ON marketplace_listing_attributes;
CREATE POLICY "Allow updates to listing attributes"
    ON marketplace_listing_attributes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow deletes to listing attributes" ON marketplace_listing_attributes;
CREATE POLICY "Allow deletes to listing attributes"
    ON marketplace_listing_attributes FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_attributes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_attributes TO authenticated;

-- ─────────────────────────────────────────
-- 6. marketplace_listing_countries (if exists)
-- ─────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listing_countries') THEN
        ALTER TABLE marketplace_listing_countries ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view listing countries" ON marketplace_listing_countries;
        DROP POLICY IF EXISTS "Allow public read access to listing countries" ON marketplace_listing_countries;
        DROP POLICY IF EXISTS "Allow inserts to listing countries" ON marketplace_listing_countries;
        DROP POLICY IF EXISTS "Allow updates to listing countries" ON marketplace_listing_countries;
        DROP POLICY IF EXISTS "Allow deletes to listing countries" ON marketplace_listing_countries;

        EXECUTE 'CREATE POLICY "Allow public read access to listing countries"
            ON marketplace_listing_countries FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow inserts to listing countries"
            ON marketplace_listing_countries FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Allow updates to listing countries"
            ON marketplace_listing_countries FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "Allow deletes to listing countries"
            ON marketplace_listing_countries FOR DELETE USING (true)';

        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_countries TO anon';
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listing_countries TO authenticated';
    END IF;
END $$;

-- ─────────────────────────────────────────
-- 7. marketplace_favorites
-- ─────────────────────────────────────────
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to favorites" ON marketplace_favorites;
CREATE POLICY "Allow public read access to favorites"
    ON marketplace_favorites FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts to favorites" ON marketplace_favorites;
CREATE POLICY "Allow inserts to favorites"
    ON marketplace_favorites FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates to favorites" ON marketplace_favorites;
CREATE POLICY "Allow updates to favorites"
    ON marketplace_favorites FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow deletes to favorites" ON marketplace_favorites;
CREATE POLICY "Allow deletes to favorites"
    ON marketplace_favorites FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_favorites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_favorites TO authenticated;

-- ─────────────────────────────────────────
-- 8. marketplace_reports
-- ─────────────────────────────────────────
ALTER TABLE marketplace_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to reports" ON marketplace_reports;
CREATE POLICY "Allow public read access to reports"
    ON marketplace_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts to reports" ON marketplace_reports;
CREATE POLICY "Allow inserts to reports"
    ON marketplace_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates to reports" ON marketplace_reports;
CREATE POLICY "Allow updates to reports"
    ON marketplace_reports FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow deletes to reports" ON marketplace_reports;
CREATE POLICY "Allow deletes to reports"
    ON marketplace_reports FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_reports TO authenticated;

-- ─────────────────────────────────────────
-- 9. increment_listing_views RPC — make sure it exists and anon can call it
-- ─────────────────────────────────────────
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

GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO authenticated;

-- ─────────────────────────────────────────
-- 10. Sequence grants (needed for INSERT on UUID tables)
-- ─────────────────────────────────────────
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
