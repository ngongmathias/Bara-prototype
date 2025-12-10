-- Verification Query: Check if multi-country banner setup is working
-- Run this to confirm everything is set up correctly

-- 1. Check if junction table exists
SELECT 
  'Junction table exists' as status,
  COUNT(*) as row_count
FROM sponsored_banner_countries;

-- 2. Check if indexes exist
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename = 'sponsored_banner_countries';

-- 3. Check if view exists
SELECT 
  'View exists' as status,
  COUNT(*) as banner_count
FROM sponsored_banners_with_countries;

-- 4. Sample query: Show banners with their countries
SELECT 
  sb.company_name,
  sb.is_active,
  ARRAY_AGG(c.name) as targeted_countries,
  COUNT(sbc.country_id) as country_count
FROM sponsored_banners sb
LEFT JOIN sponsored_banner_countries sbc ON sb.id = sbc.banner_id
LEFT JOIN countries c ON sbc.country_id = c.id
GROUP BY sb.id, sb.company_name, sb.is_active
ORDER BY sb.created_at DESC
LIMIT 10;

-- ✅ If all these queries run successfully, your multi-country setup is working!
