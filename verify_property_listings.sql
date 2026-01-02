-- Check property listings with the actual category IDs
SELECT 
  ml.id,
  ml.title,
  ml.price,
  ml.currency,
  ml.category_id,
  mc.name as category,
  mc.slug as category_slug,
  c.name as country,
  ml.status
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
JOIN countries c ON ml.country_id = c.id
WHERE mc.id IN ('828e45d2-429d-445f-81ae-eef45e026db9', 'ed07d3a6-dbb2-4c31-9297-ce6e71b8f35f')
  AND c.name = 'Rwanda';
