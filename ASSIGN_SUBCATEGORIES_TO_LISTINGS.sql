-- Assign subcategories to all existing listings based on their titles and attributes
-- Run this in Supabase SQL Editor

-- Motors - Cars for Sale
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'cars-for-sale' LIMIT 1
)
WHERE title LIKE '%Toyota Camry%' 
   OR title LIKE '%Honda CR-V%'
   OR title LIKE '%Toyota RAV4%'
   OR title LIKE '%Mercedes-Benz%'
   OR (attributes->>'make' IS NOT NULL AND title NOT LIKE '%Motorcycle%');

-- Motors - Motorcycles
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'motorcycles' LIMIT 1
)
WHERE title LIKE '%Motorcycle%' OR title LIKE '%Bike%' AND attributes->>'make' IS NOT NULL;

-- Properties - Apartments for Sale
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'apartments-for-sale' LIMIT 1
)
WHERE title LIKE '%Apartment%' AND title LIKE '%Sale%';

-- Properties - Apartments for Rent
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'apartments-for-rent' LIMIT 1
)
WHERE title LIKE '%Apartment%' AND title LIKE '%Rent%';

-- Properties - Villas for Sale
UPDATE marketplace_listings
SET subcategory_id = (
  SELECT id FROM marketplace_subcategories 
  WHERE slug = 'villas-for-sale' LIMIT 1
)
WHERE title LIKE '%Villa%';

-- Verify all listings now have subcategories where applicable
SELECT 
  ml.title,
  mc.name as category,
  mc.slug as category_slug,
  ms.name as subcategory,
  ms.slug as subcategory_slug,
  ml.attributes->>'make' as make,
  ml.attributes->>'brand' as brand,
  ml.attributes->>'body_type' as body_type
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
LEFT JOIN marketplace_subcategories ms ON ml.subcategory_id = ms.id
ORDER BY mc.name, ml.created_at DESC;
