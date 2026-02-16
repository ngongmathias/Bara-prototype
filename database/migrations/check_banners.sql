-- Check if we have any active sponsored banners
SELECT * FROM sponsored_banners WHERE is_active = true;

-- Check if we have any paid banners
SELECT * FROM sponsored_banners WHERE payment_status = 'paid';

-- Insert a dummy banner if none exist (for testing)
INSERT INTO sponsored_banners (
  country_id, 
  company_name, 
  company_website, 
  banner_image_url, 
  banner_alt_text, 
  is_active, 
  payment_status, 
  show_on_country_detail,
  display_on_top
) 
SELECT 
  id as country_id,
  'Test Company',
  'https://example.com',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'Test Banner',
  true,
  'paid',
  true,
  true
FROM countries 
WHERE name = 'Rwanda' OR code = 'RW'
LIMIT 1
ON CONFLICT DO NOTHING;
