-- Fix marketplace RLS policies and add subcategory support
-- Run this in Supabase SQL Editor

-- 1. Fix marketplace_listing_countries RLS policy (causing 401 error)
DROP POLICY IF EXISTS "Allow public read access to listing countries" ON marketplace_listing_countries;
CREATE POLICY "Allow public read access to listing countries"
ON marketplace_listing_countries FOR SELECT
TO public
USING (true);

-- 2. Ensure marketplace_listings has subcategory_id column
-- (It already exists based on your schema output, but let's verify)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' 
    AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE marketplace_listings ADD COLUMN subcategory_id UUID REFERENCES marketplace_subcategories(id);
  END IF;
END $$;

-- 3. Create subcategories for Motors category
-- First, get the Motors category ID and create subcategories
DO $$
DECLARE
  motors_category_id UUID;
BEGIN
  -- Get Motors category ID
  SELECT id INTO motors_category_id FROM marketplace_categories WHERE slug = 'motors';
  
  IF motors_category_id IS NOT NULL THEN
    -- Insert subcategories if they don't exist
    INSERT INTO marketplace_subcategories (category_id, name, slug, display_order, is_active)
    VALUES 
      (motors_category_id, 'Cars for Sale', 'cars-for-sale', 1, true),
      (motors_category_id, 'Cars for Rent', 'cars-for-rent', 2, true),
      (motors_category_id, 'Motorcycles', 'motorcycles', 3, true),
      (motors_category_id, 'Boats', 'boats', 4, true),
      (motors_category_id, 'Auto Accessories', 'auto-accessories', 5, true),
      (motors_category_id, 'Auto Parts', 'auto-parts', 6, true)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;
END $$;

-- 4. Create subcategories for Property for Sale category
DO $$
DECLARE
  property_category_id UUID;
BEGIN
  SELECT id INTO property_category_id FROM marketplace_categories WHERE slug = 'property-sale';
  
  IF property_category_id IS NOT NULL THEN
    INSERT INTO marketplace_subcategories (category_id, name, slug, display_order, is_active)
    VALUES 
      (property_category_id, 'Apartments for Sale', 'apartments-for-sale', 1, true),
      (property_category_id, 'Villas for Sale', 'villas-for-sale', 2, true),
      (property_category_id, 'Houses for Sale', 'houses-for-sale', 3, true),
      (property_category_id, 'Land for Sale', 'land-for-sale', 4, true),
      (property_category_id, 'Commercial for Sale', 'commercial-for-sale', 5, true)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;
END $$;

-- 5. Update existing sample listings to have subcategories
-- Update Toyota Camry to "Cars for Sale"
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'cars-for-sale' LIMIT 1
)
WHERE title = 'Toyota Camry 2020 - Excellent Condition';

-- Update Honda Motorcycle to "Motorcycles"
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'motorcycles' LIMIT 1
)
WHERE title = 'Honda Motorcycle 2022 - Like New';

-- Update Apartment to "Apartments for Sale"
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'apartments-for-sale' LIMIT 1
)
WHERE title = 'Modern 3-Bedroom Apartment for Sale';

-- Update Villa to "Villas for Sale"
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'villas-for-sale' LIMIT 1
)
WHERE title = 'Luxury Villa with Pool - Prime Location';

-- 6. Verify the changes
SELECT 
  ml.title,
  mc.name as category,
  ms.name as subcategory,
  ml.attributes->>'make' as make,
  ml.attributes->>'brand' as brand
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
LEFT JOIN marketplace_subcategories ms ON ml.subcategory_id = ms.id
ORDER BY mc.name, ml.created_at DESC
LIMIT 20;
