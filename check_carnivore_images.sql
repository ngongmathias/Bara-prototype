-- Check Carnivore Restaurant images
SELECT 
  id,
  name,
  images,
  logo_url,
  CASE 
    WHEN images IS NULL THEN 'No images array'
    WHEN array_length(images, 1) IS NULL THEN 'Empty array'
    ELSE array_length(images, 1)::text || ' images'
  END as image_status
FROM businesses
WHERE name ILIKE '%carnivore%'
ORDER BY created_at DESC;

-- If you want to see the actual image URLs:
-- SELECT id, name, unnest(images) as image_url FROM businesses WHERE name ILIKE '%carnivore%';
