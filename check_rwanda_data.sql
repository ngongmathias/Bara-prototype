-- Check if Rwanda exists in countries table
SELECT id, name, code FROM countries WHERE name = 'Rwanda';

-- Check marketplace categories
SELECT id, name, slug FROM marketplace_categories WHERE is_active = true;

-- Check marketplace subcategories
SELECT id, name, slug, category_id FROM marketplace_subcategories WHERE is_active = true;

-- Check Rwanda listings
SELECT 
  ml.id,
  ml.title,
  ml.price,
  ml.currency,
  mc.name as category,
  mc.slug as category_slug,
  ms.name as subcategory,
  c.name as country,
  ml.location_details,
  ml.status
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
JOIN countries c ON ml.country_id = c.id
LEFT JOIN marketplace_subcategories ms ON ml.subcategory_id = ms.id
WHERE c.name = 'Rwanda'
ORDER BY ml.created_at DESC;

-- Count listings by category for Rwanda
SELECT 
  mc.name as category,
  COUNT(*) as listing_count
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
JOIN countries c ON ml.country_id = c.id
WHERE c.name = 'Rwanda'
GROUP BY mc.name;
