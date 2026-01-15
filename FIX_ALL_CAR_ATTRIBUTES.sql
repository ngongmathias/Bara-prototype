-- Fix all car listings to have complete attributes (make, model, body_type, year)
-- Run this in Supabase SQL Editor

-- Honda CR-V
UPDATE marketplace_listings
SET attributes = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(attributes, '{}'::jsonb),
        '{make}', '"Honda"'
      ),
      '{model}', '"CR-V"'
    ),
    '{body_type}', '"SUV"'
  ),
  '{year}', '2021'
)
WHERE title LIKE '%Honda CR-V%';

-- Toyota RAV4
UPDATE marketplace_listings
SET attributes = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(attributes, '{}'::jsonb),
        '{make}', '"Toyota"'
      ),
      '{model}', '"RAV4"'
    ),
    '{body_type}', '"SUV"'
  ),
  '{year}', '2020'
)
WHERE title LIKE '%Toyota RAV4%';

-- Mercedes-Benz C-Class
UPDATE marketplace_listings
SET attributes = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(attributes, '{}'::jsonb),
        '{make}', '"Mercedes-Benz"'
      ),
      '{model}', '"C-Class"'
    ),
    '{body_type}', '"Sedan"'
  ),
  '{year}', '2019'
)
WHERE title LIKE '%Mercedes-Benz%';

-- Verify all car listings now have complete attributes
SELECT 
  title,
  attributes->>'make' as make,
  attributes->>'model' as model,
  attributes->>'body_type' as body_type,
  attributes->>'year' as year,
  attributes->>'mileage' as mileage,
  attributes->>'fuel_type' as fuel_type
FROM marketplace_listings
WHERE category_id = (SELECT id FROM marketplace_categories WHERE slug = 'motors')
ORDER BY created_at DESC;
