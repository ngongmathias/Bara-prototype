-- Add body_type to existing car listings
-- Run this in Supabase SQL Editor

-- Update Toyota Camry with body_type
UPDATE marketplace_listings
SET attributes = attributes || '{"body_type": "Sedan"}'::jsonb
WHERE title = 'Toyota Camry 2020 - Excellent Condition';

-- Update Honda CR-V with body_type
UPDATE marketplace_listings
SET attributes = attributes || '{"body_type": "SUV"}'::jsonb
WHERE title LIKE '%Honda CR-V%';

-- Update Toyota RAV4 with body_type
UPDATE marketplace_listings
SET attributes = attributes || '{"body_type": "SUV"}'::jsonb
WHERE title LIKE '%Toyota RAV4%';

-- Update Mercedes-Benz with body_type
UPDATE marketplace_listings
SET attributes = attributes || '{"body_type": "Sedan"}'::jsonb
WHERE title LIKE '%Mercedes-Benz%';

-- Verify the updates
SELECT 
  title,
  attributes->>'make' as make,
  attributes->>'model' as model,
  attributes->>'body_type' as body_type,
  attributes->>'year' as year
FROM marketplace_listings
WHERE attributes->>'make' IS NOT NULL
ORDER BY created_at DESC;
