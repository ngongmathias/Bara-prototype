-- Add sample marketplace listings for all categories
-- Run this in Supabase SQL Editor
-- Note: Replace 'YOUR_USER_ID' with an actual user ID from your users table
-- You can get a user ID by running: SELECT id FROM users LIMIT 1;

-- First, let's get the category IDs and a sample country ID
-- You'll need to replace these with actual IDs from your database

-- Sample listings for VEHICLES (motors)
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Toyota Camry 2020 - Excellent Condition',
  'Well-maintained Toyota Camry 2020 with low mileage. Full service history, single owner. Perfect for families.',
  25000,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'used',
  'Kigali, Rwanda',
  '{"make": "Toyota", "model": "Camry", "year": 2020, "mileage": 35000, "fuel_type": "Petrol", "transmission": "Automatic"}'::jsonb
FROM marketplace_categories WHERE slug = 'motors' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Honda Motorcycle 2022 - Like New',
  'Honda CB500X 2022 in pristine condition. Only 5000km. Perfect for city and highway riding.',
  8500,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'like-new',
  'Kigali, Rwanda',
  '{"make": "Honda", "model": "CB500X", "year": 2022, "mileage": 5000, "fuel_type": "Petrol"}'::jsonb
FROM marketplace_categories WHERE slug = 'motors' LIMIT 1;

-- Sample listings for PROPERTIES (property-sale)
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Modern 3-Bedroom Apartment for Sale',
  'Beautiful modern apartment in prime location. 3 bedrooms, 2 bathrooms, spacious living area with balcony.',
  150000,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'new',
  'Kigali, Kimihurura',
  '{"bedrooms": 3, "bathrooms": 2, "area_sqm": 120, "property_type": "Apartment", "furnished": true}'::jsonb
FROM marketplace_categories WHERE slug = 'property-sale' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Luxury Villa with Pool - Prime Location',
  'Stunning 5-bedroom villa with swimming pool, garden, and modern amenities. Gated community.',
  450000,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'new',
  'Kigali, Nyarutarama',
  '{"bedrooms": 5, "bathrooms": 4, "area_sqm": 350, "property_type": "Villa", "furnished": true, "pool": true}'::jsonb
FROM marketplace_categories WHERE slug = 'property-sale' LIMIT 1;

-- Sample listings for MOBILES & TABLETS
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'iPhone 14 Pro Max 256GB - Unlocked',
  'iPhone 14 Pro Max in excellent condition. 256GB storage, unlocked for all carriers. Includes original box and accessories.',
  1200,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'like-new',
  'Kigali, Rwanda',
  '{"brand": "Apple", "model": "iPhone 14 Pro Max", "storage": "256GB", "color": "Deep Purple", "ram": "6GB"}'::jsonb
FROM marketplace_categories WHERE slug = 'mobile-tablets' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Samsung Galaxy Tab S8 - Brand New',
  'Brand new Samsung Galaxy Tab S8 with S Pen. Perfect for work and entertainment.',
  650,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'new',
  'Kigali, Rwanda',
  '{"brand": "Samsung", "model": "Galaxy Tab S8", "storage": "128GB", "screen_size": "11 inches"}'::jsonb
FROM marketplace_categories WHERE slug = 'mobile-tablets' LIMIT 1;

-- Sample listings for JOBS
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Senior Software Engineer - Remote',
  'Join our growing tech team! Looking for experienced software engineer with React and Node.js skills. Competitive salary and benefits.',
  5000,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'new',
  'Kigali, Rwanda (Remote)',
  '{"job_type": "Full-time", "experience": "5+ years", "salary_period": "monthly", "company": "Tech Solutions Ltd"}'::jsonb
FROM marketplace_categories WHERE slug = 'jobs' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Marketing Manager - Leading Company',
  'Exciting opportunity for marketing professional. Lead our marketing team and drive growth strategies.',
  3500,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'new',
  'Kigali, Rwanda',
  '{"job_type": "Full-time", "experience": "3+ years", "salary_period": "monthly", "company": "Global Marketing Inc"}'::jsonb
FROM marketplace_categories WHERE slug = 'jobs' LIMIT 1;

-- Sample listings for FURNITURE & GARDEN
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Modern L-Shaped Sofa - Grey',
  'Comfortable L-shaped sofa in excellent condition. Grey fabric, perfect for modern living rooms.',
  800,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'used',
  'Kigali, Rwanda',
  '{"furniture_type": "Sofa", "material": "Fabric", "color": "Grey", "dimensions": "280x180cm"}'::jsonb
FROM marketplace_categories WHERE slug = 'furniture-garden' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Wooden Dining Table Set - 6 Chairs',
  'Beautiful solid wood dining table with 6 matching chairs. Perfect for family gatherings.',
  1200,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'used',
  'Kigali, Rwanda',
  '{"furniture_type": "Dining Set", "material": "Solid Wood", "color": "Brown", "seats": 6}'::jsonb
FROM marketplace_categories WHERE slug = 'furniture-garden' LIMIT 1;

-- Sample listings for ELECTRONICS & APPLIANCES
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Samsung 55" 4K Smart TV - 2023 Model',
  'Brand new Samsung 55-inch 4K Smart TV. Crystal clear picture, smart features, warranty included.',
  950,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'new',
  'Kigali, Rwanda',
  '{"brand": "Samsung", "screen_size": "55 inches", "resolution": "4K", "smart_tv": true}'::jsonb
FROM marketplace_categories WHERE slug = 'electronics' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'MacBook Pro 16" M2 - Like New',
  'MacBook Pro 16-inch with M2 chip. 16GB RAM, 512GB SSD. Perfect for professionals.',
  2400,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'like-new',
  'Kigali, Rwanda',
  '{"brand": "Apple", "model": "MacBook Pro 16", "processor": "M2", "ram": "16GB", "storage": "512GB"}'::jsonb
FROM marketplace_categories WHERE slug = 'electronics' LIMIT 1;

-- Sample listings for FASHION & BEAUTY
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Designer Handbag - Authentic',
  'Authentic designer handbag in excellent condition. Comes with authenticity certificate.',
  450,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'used',
  'Kigali, Rwanda',
  '{"brand": "Michael Kors", "color": "Black", "material": "Leather", "gender": "Women"}'::jsonb
FROM marketplace_categories WHERE slug = 'fashion' LIMIT 1;

INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Men''s Formal Shoes - Italian Leather',
  'Premium Italian leather formal shoes. Size 42, perfect for business and formal occasions.',
  120,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'new',
  'Kigali, Rwanda',
  '{"brand": "Clarks", "size": "42", "material": "Leather", "gender": "Men", "color": "Black"}'::jsonb
FROM marketplace_categories WHERE slug = 'fashion' LIMIT 1;

-- Sample listings for PETS
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Golden Retriever Puppies - Vaccinated',
  'Adorable Golden Retriever puppies ready for new homes. Fully vaccinated, health checked.',
  800,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'new',
  'Kigali, Rwanda',
  '{"pet_type": "Dog", "breed": "Golden Retriever", "age": "8 weeks", "vaccinated": true, "gender": "Mixed"}'::jsonb
FROM marketplace_categories WHERE slug = 'pets' LIMIT 1;

-- Sample listings for KIDS & BABIES
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Baby Stroller - Premium Brand',
  'High-quality baby stroller in excellent condition. Lightweight, easy to fold, includes rain cover.',
  250,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'used',
  'Kigali, Rwanda',
  '{"item_type": "Stroller", "brand": "Chicco", "age_range": "0-3 years", "color": "Grey"}'::jsonb
FROM marketplace_categories WHERE slug = 'kids-babies' LIMIT 1;

-- Sample listings for HOBBIES
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Mountain Bike - Professional Grade',
  'Professional mountain bike with full suspension. Perfect for trails and off-road adventures.',
  1500,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'used',
  'Kigali, Rwanda',
  '{"hobby_type": "Cycling", "brand": "Trek", "material": "Carbon Fiber", "size": "Large"}'::jsonb
FROM marketplace_categories WHERE slug = 'hobbies' LIMIT 1;

-- Sample listings for BUSINESS & INDUSTRIAL
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Restaurant Business for Sale - Established',
  'Profitable restaurant business in prime location. Fully equipped, trained staff, loyal customer base.',
  85000,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  true,
  'used',
  'Kigali, City Center',
  '{"business_type": "Restaurant", "established_year": 2018, "employees": 12, "reason_for_sale": "Relocation"}'::jsonb
FROM marketplace_categories WHERE slug = 'business-industrial' LIMIT 1;

-- Sample listings for SERVICES
INSERT INTO marketplace_listings (title, description, price, category_id, country_id, user_id, status, is_featured, condition, location_details, attributes)
SELECT 
  'Professional Web Development Services',
  'Expert web development services. Custom websites, e-commerce, mobile apps. Competitive rates.',
  50,
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'active',
  false,
  'new',
  'Kigali, Rwanda (Remote)',
  '{"service_type": "IT & Web", "experience": "5+ years", "availability": "Full-time", "rate_type": "hourly"}'::jsonb
FROM marketplace_categories WHERE slug = 'services' LIMIT 1;

-- Verify the listings were added
SELECT 
  ml.title,
  mc.name as category,
  ml.price,
  ml.status,
  ml.is_featured
FROM marketplace_listings ml
JOIN marketplace_categories mc ON ml.category_id = mc.id
ORDER BY mc.name, ml.created_at DESC;
