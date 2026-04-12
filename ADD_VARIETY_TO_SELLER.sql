-- Add variety of test listings to mathiasngongngai@gmail.com seller account
-- Clerk User ID: user_39F89D6dX01nG31j8rAUyLYa3IG
-- Run this in Supabase SQL Editor

-- MOTORS: Toyota RAV4 2022
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id, 
  created_by, seller_name, seller_email, seller_phone, 
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'Toyota RAV4 2022 - Hybrid AWD',
  'Excellent condition Toyota RAV4 Hybrid with all-wheel drive. Low mileage, full service history. Loaded with features including leather seats, sunroof, and advanced safety systems.',
  38000,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  true,
  'like-new',
  'Kigali, Rwanda',
  jsonb_build_object(
    'make', 'Toyota',
    'model', 'RAV4',
    'year', 2022,
    'mileage', 15000,
    'fuel_type', 'Hybrid',
    'transmission', 'Automatic',
    'color', 'Silver',
    'features', ARRAY['Leather Seats', 'Sunroof', 'AWD', 'Backup Camera', 'Bluetooth']
  )
FROM marketplace_categories WHERE slug = 'motors' LIMIT 1;

-- PROPERTY: Modern Apartment
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'Luxury 2-Bedroom Apartment - Kimihurura',
  'Beautiful modern apartment in prime Kimihurura location. Features include spacious living room, modern kitchen, 2 bathrooms, balcony with city views. Secure building with parking.',
  120000,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  true,
  'new',
  'Kigali, Kimihurura',
  jsonb_build_object(
    'bedrooms', 2,
    'bathrooms', 2,
    'area_sqm', 95,
    'property_type', 'Apartment',
    'furnished', true,
    'parking', true,
    'floor', 3
  )
FROM marketplace_categories WHERE slug = 'property-sale' LIMIT 1;

-- ELECTRONICS: MacBook Pro
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'MacBook Pro 16" M2 Pro - 512GB SSD',
  'Powerful MacBook Pro with M2 Pro chip, 16GB RAM, 512GB SSD. Perfect for creative professionals. Includes original charger and box. AppleCare+ until 2025.',
  2400,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  true,
  'like-new',
  'Kigali, Rwanda',
  jsonb_build_object(
    'brand', 'Apple',
    'model', 'MacBook Pro 16"',
    'processor', 'M2 Pro',
    'ram', '16GB',
    'storage', '512GB SSD',
    'screen_size', '16 inch',
    'color', 'Space Gray'
  )
FROM marketplace_categories WHERE slug = 'computers-laptops' LIMIT 1;

-- FASHION: Designer Handbag
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'Louis Vuitton Neverfull MM - Authentic',
  'Authentic Louis Vuitton Neverfull MM in monogram canvas. Excellent condition, gently used. Comes with dust bag and authenticity card. Classic and timeless piece.',
  1200,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  false,
  'used',
  'Kigali, Rwanda',
  jsonb_build_object(
    'brand', 'Louis Vuitton',
    'category', 'Handbag',
    'size', 'MM',
    'color', 'Monogram',
    'material', 'Canvas',
    'gender', 'Women'
  )
FROM marketplace_categories WHERE slug = 'fashion-accessories' LIMIT 1;

-- FURNITURE: Dining Set
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'Modern Glass Dining Table + 6 Chairs',
  'Elegant modern dining set with tempered glass top and chrome legs. Includes 6 comfortable upholstered chairs. Perfect for contemporary homes. Seats 6-8 people.',
  850,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  false,
  'like-new',
  'Kigali, Rwanda',
  jsonb_build_object(
    'material', 'Glass & Chrome',
    'seats', 6,
    'style', 'Modern',
    'color', 'Clear/Silver',
    'dimensions', '180cm x 90cm'
  )
FROM marketplace_categories WHERE slug = 'home-office-furniture-decor' LIMIT 1;

-- MOBILE: iPhone 15 Pro
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'iPhone 15 Pro 256GB - Titanium Blue',
  'Brand new iPhone 15 Pro in stunning Titanium Blue. 256GB storage, unlocked for all carriers. Includes all original accessories and 1-year Apple warranty.',
  1100,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  true,
  'new',
  'Kigali, Rwanda',
  jsonb_build_object(
    'brand', 'Apple',
    'model', 'iPhone 15 Pro',
    'storage', '256GB',
    'color', 'Titanium Blue',
    'ram', '8GB',
    'condition', 'Brand New'
  )
FROM marketplace_categories WHERE slug = 'mobile-tablets' LIMIT 1;

-- HOBBIES: Gaming Console
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'PlayStation 5 Digital Edition + 3 Games',
  'PS5 Digital Edition in excellent condition. Includes 3 popular games (FIFA 24, Spider-Man 2, God of War). Extra DualSense controller included. Perfect working condition.',
  550,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  false,
  'used',
  'Kigali, Rwanda',
  jsonb_build_object(
    'brand', 'Sony',
    'model', 'PlayStation 5 Digital',
    'storage', '825GB',
    'includes', ARRAY['Console', '2 Controllers', '3 Games', 'Cables'],
    'games', ARRAY['FIFA 24', 'Spider-Man 2', 'God of War']
  )
FROM marketplace_categories WHERE slug = 'hobbies-sports-kids' LIMIT 1;

-- SERVICES: Web Development
INSERT INTO marketplace_listings (
  title, description, price, currency, category_id, country_id,
  created_by, seller_name, seller_email, seller_phone,
  status, is_featured, condition, location_details, attributes
)
SELECT 
  'Professional Web Development Services',
  'Full-stack web development services for businesses and startups. Specializing in React, Node.js, and modern web technologies. Portfolio available upon request. Competitive rates.',
  50,
  'USD',
  id,
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'user_39F89D6dX01nG31j8rAUyLYa3IG',
  'Mathias Ngong',
  'mathiasngongngai@gmail.com',
  '+250788123456',
  'active',
  false,
  'new',
  'Kigali, Rwanda (Remote Available)',
  jsonb_build_object(
    'service_type', 'Web Development',
    'rate_type', 'Per Hour',
    'technologies', ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    'experience_years', 5,
    'remote_available', true
  )
FROM marketplace_categories WHERE slug = 'services' LIMIT 1;

-- Add images for the listings (you'll need to add actual image URLs later)
-- This is just a placeholder structure
