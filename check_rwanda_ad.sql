-- Check if Rwanda country page ad is set up correctly
SELECT 
  ci.id,
  c.name as country_name,
  ci.ad_image_url,
  ci.ad_company_name,
  ci.ad_company_website,
  ci.ad_tagline,
  ci.ad_is_active,
  ci.ad_click_count,
  ci.ad_view_count
FROM country_info ci
JOIN countries c ON ci.country_id = c.id
WHERE c.name ILIKE '%rwanda%';

-- If ad_is_active is false or NULL, run this to activate it:
-- UPDATE country_info 
-- SET ad_is_active = true 
-- WHERE country_id = (SELECT id FROM countries WHERE name ILIKE '%rwanda%');
