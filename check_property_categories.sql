-- Check property category slugs
SELECT id, name, slug, is_active 
FROM marketplace_categories 
WHERE slug LIKE 'property%';

-- Check property listings with category info
SELECT 
  ml.id,
  ml.title,
  mc.name as category,
  mc.slug as category_slug,
  c.name as country
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
JOIN countries c ON ml.country_id = c.id
WHERE mc.slug LIKE 'property%' AND c.name = 'Rwanda';
