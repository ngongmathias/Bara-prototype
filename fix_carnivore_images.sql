-- Step 1: Check current image URLs for Carnivore Restaurant
SELECT 
  id,
  name,
  images,
  logo_url,
  array_length(images, 1) as image_count
FROM businesses
WHERE name ILIKE '%carnivore%';

-- Step 2: Check if the URLs are accessible
-- Copy one of the URLs from the result above and paste it in your browser
-- If it returns 404 or 403, the images don't exist or aren't accessible

-- Step 3: Clear broken images (run this if URLs are broken)
-- UPDATE businesses
-- SET images = NULL
-- WHERE name ILIKE '%carnivore%';

-- After clearing, you can re-upload via the admin panel
