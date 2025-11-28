-- Import Rwanda Businesses and Sinc Events
-- Generated: 2025-11-28 23:41:41

-- ============================================================================
-- STEP 1: Get Rwanda and Kigali IDs (run this first to get the IDs)
-- ============================================================================

-- Get Rwanda country ID
SELECT id, name FROM countries WHERE name = 'Rwanda';

-- Get or create Kigali city
-- If Kigali doesn't exist, create it (replace 'RWANDA_ID_HERE' with actual ID from above)
-- INSERT INTO cities (id, name, country_id, description)
-- VALUES (gen_random_uuid(), 'Kigali', 'RWANDA_ID_HERE', 'Capital city of Rwanda')
-- ON CONFLICT (name, country_id) DO NOTHING;

SELECT id, name FROM cities WHERE name = 'Kigali';

-- ============================================================================
-- STEP 2: Create Categories
-- ============================================================================

-- Business Categories
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Education', 'education', 'Education businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Entertainment', 'entertainment', 'Entertainment businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Transportation', 'transportation', 'Transportation businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Restaurant', 'restaurant', 'Restaurant businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Technology', 'technology', 'Technology businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Retail', 'retail', 'Retail businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Healthcare', 'healthcare', 'Healthcare businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Hotel', 'hotel', 'Hotel businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Real Estate', 'real-estate', 'Real Estate businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Services', 'services', 'Services businesses in Rwanda')
ON CONFLICT (name) DO NOTHING;


-- Event Categories
INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Education & Workshops', 'education-and-workshops', 'Education & Workshops events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Business & Networking', 'business-and-networking', 'Business & Networking events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Community & Social', 'community-and-social', 'Community & Social events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Arts & Culture', 'arts-and-culture', 'Arts & Culture events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Sports & Fitness', 'sports-and-fitness', 'Sports & Fitness events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Nightlife & Parties', 'nightlife-and-parties', 'Nightlife & Parties events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Food & Drink', 'food-and-drink', 'Food & Drink events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO event_categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Music & Concerts', 'music-and-concerts', 'Music & Concerts events')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 3: Import Businesses
-- Replace 'RWANDA_ID' and 'KIGALI_ID' with actual IDs from STEP 1
-- ============================================================================

-- Business 1: Kigali Fusion Restaurant
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Fusion Restaurant', 'Kigali Fusion Restaurant offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786774429', 'info@kigalifusionrestaurant.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.9, true, 'active';

-- Business 2: Heaven Restaurant
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Heaven Restaurant', 'Heaven Restaurant offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730421412', 'info@heavenrestaurant.rw', 'www.heavenrestaurant.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 5.0, true, 'active';

-- Business 3: Repub Lounge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Repub Lounge', 'Repub Lounge offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794929924', 'info@republounge.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.7, true, 'active';

-- Business 4: Pili Pili Restaurant
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Pili Pili Restaurant', 'Pili Pili Restaurant offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722341063', 'info@pilipilirestaurant.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.3, true, 'active';

-- Business 5: The Hut
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'The Hut', 'The Hut offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 784605807', 'info@thehut.rw', 'www.thehut.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.8, false, 'active';

-- Business 6: Khana Khazana
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Khana Khazana', 'Khana Khazana offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781077283', 'info@khanakhazana.rw', 'www.khanakhazana.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.6, true, 'active';

-- Business 7: Poivre Noir
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Poivre Noir', 'Poivre Noir offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721045070', 'info@poivrenoir.rw', 'www.poivrenoir.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.9, true, 'active';

-- Business 8: Bamboo Restaurant
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Bamboo Restaurant', 'Bamboo Restaurant offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786003332', 'info@bamboorestaurant.rw', 'www.bamboorestaurant.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.5, true, 'active';

-- Business 9: Sole Luna
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Sole Luna', 'Sole Luna offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730476559', 'info@soleluna.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.7, true, 'active';

-- Business 10: Zaaffran Indian Restaurant
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Zaaffran Indian Restaurant', 'Zaaffran Indian Restaurant offers authentic Rwandan and international cuisine in a modern setting. Experience the best dining in Kigali with our carefully curated menu and excellent service.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 731135925', 'info@zaaffranindianrestaurant.rw', 'www.zaaffranindianrestaurant.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.4, true, 'active';

-- Business 11: Serena Hotel Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Serena Hotel Kigali', 'Serena Hotel Kigali provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 724210371', 'info@serenahotelkigali.rw', 'www.serenahotelkigali.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.8, true, 'active';

-- Business 12: Radisson Blu Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Radisson Blu Hotel', 'Radisson Blu Hotel provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 784097624', 'info@radissonbluhotel.rw', 'www.radissonbluhotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.9, true, 'active';

-- Business 13: Kigali Marriott Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Marriott Hotel', 'Kigali Marriott Hotel provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738417476', 'info@kigalimarriotthotel.rw', 'www.kigalimarriotthotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.7, true, 'active';

-- Business 14: The Retreat
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'The Retreat', 'The Retreat provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 734955285', 'info@theretreat.rw', 'www.theretreat.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.9, true, 'active';

-- Business 15: Hotel des Mille Collines
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Hotel des Mille Collines', 'Hotel des Mille Collines provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 737117483', 'info@hoteldesmillecollines.rw', 'www.hoteldesmillecollines.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.6, true, 'active';

-- Business 16: Park Inn by Radisson
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Park Inn by Radisson', 'Park Inn by Radisson provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786637836', 'info@parkinnbyradisson.rw', 'www.parkinnbyradisson.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.3, true, 'active';

-- Business 17: Lemigo Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Lemigo Hotel', 'Lemigo Hotel provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794635881', 'info@lemigohotel.rw', 'www.lemigohotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.5, true, 'active';

-- Business 18: Ubumwe Grande Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Ubumwe Grande Hotel', 'Ubumwe Grande Hotel provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 728937239', 'info@ubumwegrandehotel.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.6, true, 'active';

-- Business 19: Step Town Motel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Step Town Motel', 'Step Town Motel provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 736168108', 'info@steptownmotel.rw', 'www.steptownmotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.8, false, 'active';

-- Business 20: Gorillas Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Gorillas Hotel', 'Gorillas Hotel provides luxury accommodation in the heart of Kigali. Enjoy world-class amenities, comfortable rooms, and exceptional hospitality during your stay in Rwanda.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797648381', 'info@gorillashotel.rw', 'www.gorillashotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.4, true, 'active';

-- Business 21: Simba Supermarket
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Simba Supermarket', 'Simba Supermarket is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 792081760', 'info@simbasupermarket.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.8, false, 'active';

-- Business 22: Nakumatt
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Nakumatt', 'Nakumatt is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 788562236', 'info@nakumatt.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.5, true, 'active';

-- Business 23: Kigali City Market
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali City Market', 'Kigali City Market is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 795292893', 'info@kigalicitymarket.rw', 'www.kigalicitymarket.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.9, false, 'active';

-- Business 24: UTC Mall
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'UTC Mall', 'UTC Mall is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786387320', 'info@utcmall.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.4, true, 'active';

-- Business 25: Kigali Heights
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Heights', 'Kigali Heights is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738110083', 'info@kigaliheights.rw', 'www.kigaliheights.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.7, false, 'active';

-- Business 26: MTN Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'MTN Center', 'MTN Center is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kigali City Center, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791742462', 'info@mtncenter.rw', 'www.mtncenter.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.7, true, 'active';

-- Business 27: Fashion House Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Fashion House Rwanda', 'Fashion House Rwanda is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787867270', 'info@fashionhouserwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.8, true, 'active';

-- Business 28: Bourbon Coffee
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Bourbon Coffee', 'Bourbon Coffee is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 795252701', 'info@bourboncoffee.rw', 'www.bourboncoffee.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.7, true, 'active';

-- Business 29: Inzora Rooftop Cafe
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Inzora Rooftop Cafe', 'Inzora Rooftop Cafe is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Kigali City Center, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787642027', 'info@inzorarooftopcafe.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.3, true, 'active';

-- Business 30: Question Coffee
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Question Coffee', 'Question Coffee is your one-stop shop for quality products in Kigali. We offer a wide range of goods from groceries to electronics, all at competitive prices.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738565664', 'info@questioncoffee.rw', 'www.questioncoffee.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.4, true, 'active';

-- Business 31: Bank of Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Bank of Kigali', 'Bank of Kigali delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 720362641', 'info@bankofkigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.8, true, 'active';

-- Business 32: Equity Bank Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Equity Bank Rwanda', 'Equity Bank Rwanda delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794881626', 'info@equitybankrwanda.rw', 'www.equitybankrwanda.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.9, true, 'active';

-- Business 33: MTN Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'MTN Rwanda', 'MTN Rwanda delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 736468074', 'info@mtnrwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.9, true, 'active';

-- Business 34: Airtel Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Airtel Rwanda', 'Airtel Rwanda delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794047023', 'info@airtelrwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.5, false, 'active';

-- Business 35: Kigali Car Hire
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Car Hire', 'Kigali Car Hire delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 735194741', 'info@kigalicarhire.rw', 'www.kigalicarhire.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.0, true, 'active';

-- Business 36: Rwanda Tours
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Tours', 'Rwanda Tours delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 783201211', 'info@rwandatours.rw', 'www.rwandatours.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.2, false, 'active';

-- Business 37: Virunga Express
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Virunga Express', 'Virunga Express delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727328337', 'info@virungaexpress.rw', 'www.virungaexpress.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.6, false, 'active';

-- Business 38: Horizon Express
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Horizon Express', 'Horizon Express delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738412723', 'info@horizonexpress.rw', 'www.horizonexpress.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.7, true, 'active';

-- Business 39: Kigali Properties Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Properties Ltd', 'Kigali Properties Ltd delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797135688', 'info@kigalipropertiesltd.rw', 'www.kigalipropertiesltd.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 5.0, true, 'active';

-- Business 40: Rwanda Real Estate
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Real Estate', 'Rwanda Real Estate delivers professional services to individuals and businesses across Rwanda. Trust us for reliable, efficient, and customer-focused solutions.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 792450980', 'info@rwandarealestate.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.8, true, 'active';

-- Business 41: King Faisal Hospital
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'King Faisal Hospital', 'King Faisal Hospital provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 780384747', 'info@kingfaisalhospital.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.5, false, 'active';

-- Business 42: Kigali University Teaching Hospital
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali University Teaching Hospital', 'Kigali University Teaching Hospital provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787665107', 'info@kigaliuniversityteachinghospital.rw', 'www.kigaliuniversityteachinghospital.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.7, true, 'active';

-- Business 43: Polyclinique du Plateau
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Polyclinique du Plateau', 'Polyclinique du Plateau provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722851527', 'info@polycliniqueduplateau.rw', 'www.polycliniqueduplateau.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.7, true, 'active';

-- Business 44: Rwanda Military Hospital
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Military Hospital', 'Rwanda Military Hospital provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727914509', 'info@rwandamilitaryhospital.rw', 'www.rwandamilitaryhospital.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.8, true, 'active';

-- Business 45: Kibagabaga Hospital
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kibagabaga Hospital', 'Kibagabaga Hospital provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 739100101', 'info@kibagabagahospital.rw', 'www.kibagabagahospital.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.2, false, 'active';

-- Business 46: Muhima Hospital
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Muhima Hospital', 'Muhima Hospital provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791709272', 'info@muhimahospital.rw', 'www.muhimahospital.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.7, true, 'active';

-- Business 47: Kigali Health Institute
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Health Institute', 'Kigali Health Institute provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 782525216', 'info@kigalihealthinstitute.rw', 'www.kigalihealthinstitute.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 5.0, false, 'active';

-- Business 48: Dental Clinic Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Dental Clinic Kigali', 'Dental Clinic Kigali provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722472536', 'info@dentalclinickigali.rw', 'www.dentalclinickigali.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.4, true, 'active';

-- Business 49: Vision City Clinic
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Vision City Clinic', 'Vision City Clinic provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 798170025', 'info@visioncityclinic.rw', 'www.visioncityclinic.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 5.0, true, 'active';

-- Business 50: Mediplan Clinic
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Mediplan Clinic', 'Mediplan Clinic provides comprehensive healthcare services with modern facilities and experienced medical professionals. Your health is our priority.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786199732', 'info@mediplanclinic.rw', 'www.mediplanclinic.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.8, true, 'active';

-- Business 51: University of Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'University of Rwanda', 'University of Rwanda offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730811490', 'info@universityofrwanda.rw', 'www.universityofrwanda.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.7, true, 'active';

-- Business 52: AUCA
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'AUCA', 'AUCA offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797788157', 'info@auca.rw', 'www.auca.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.3, true, 'active';

-- Business 53: Kigali Independent University
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Independent University', 'Kigali Independent University offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 788314803', 'info@kigaliindependentuniversity.rw', 'www.kigaliindependentuniversity.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.6, true, 'active';

-- Business 54: Carnegie Mellon University Africa
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Carnegie Mellon University Africa', 'Carnegie Mellon University Africa offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729991805', 'info@carnegiemellonuniversityafrica.rw', 'www.carnegiemellonuniversityafrica.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.8, true, 'active';

-- Business 55: ALU Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'ALU Rwanda', 'ALU Rwanda offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 792807830', 'info@alurwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.7, false, 'active';

-- Business 56: Green Hills Academy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Green Hills Academy', 'Green Hills Academy offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 783904470', 'info@greenhillsacademy.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.6, false, 'active';

-- Business 57: Kigali International School
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali International School', 'Kigali International School offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 726555585', 'info@kigaliinternationalschool.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.3, true, 'active';

-- Business 58: Ecole Belge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Ecole Belge', 'Ecole Belge offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738891535', 'info@ecolebelge.rw', 'www.ecolebelge.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.9, true, 'active';

-- Business 59: FAWE Girls School
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'FAWE Girls School', 'FAWE Girls School offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738254837', 'info@fawegirlsschool.rw', 'www.fawegirlsschool.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.4, true, 'active';

-- Business 60: Lycée de Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Lycée de Kigali', 'Lycée de Kigali offers quality education with experienced faculty and modern facilities. We prepare students for success in a global environment.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 784207798', 'info@lycéedekigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 5.0, false, 'active';

-- Business 61: Kigali Arena
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Arena', 'Kigali Arena is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 795642079', 'info@kigaliarena.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.3, true, 'active';

-- Business 62: Century Cinema
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Century Cinema', 'Century Cinema is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721452961', 'info@centurycinema.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.7, true, 'active';

-- Business 63: Inema Arts Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Inema Arts Center', 'Inema Arts Center is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721204130', 'info@inemaartscenter.rw', 'www.inemaartscenter.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.1, true, 'active';

-- Business 64: Ivuka Arts Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Ivuka Arts Center', 'Ivuka Arts Center is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 790855651', 'info@ivukaartscenter.rw', 'www.ivukaartscenter.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.5, false, 'active';

-- Business 65: Kigali Golf Club
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Golf Club', 'Kigali Golf Club is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 723509745', 'info@kigaligolfclub.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.3, false, 'active';

-- Business 66: Heaven Night Club
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Heaven Night Club', 'Heaven Night Club is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 789187207', 'info@heavennightclub.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.1, true, 'active';

-- Business 67: B-Club
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'B-Club', 'B-Club is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727340467', 'info@b-club.rw', 'www.b-club.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.6, true, 'active';

-- Business 68: Cadillac Night Club
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Cadillac Night Club', 'Cadillac Night Club is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 782732742', 'info@cadillacnightclub.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.1, true, 'active';

-- Business 69: Sundowner's Bar
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Sundowner''s Bar', 'Sundowner''s Bar is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Kigali City Center, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729113800', 'info@sundowner''sbar.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.8, true, 'active';

-- Business 70: Papyrus Restaurant & Bar
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Papyrus Restaurant & Bar', 'Papyrus Restaurant & Bar is Kigali''s premier entertainment destination. Enjoy live music, events, and unforgettable experiences in a vibrant atmosphere.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786877467', 'info@papyrusrestaurant&bar.rw', 'www.papyrusrestaurant&bar.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.4, true, 'active';

-- Business 71: kLab Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'kLab Rwanda', 'kLab Rwanda drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797710811', 'info@klabrwanda.rw', 'www.klabrwanda.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.6, true, 'active';

-- Business 72: Norrsken House Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Norrsken House Kigali', 'Norrsken House Kigali drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 738333935', 'info@norrskenhousekigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 3.8, true, 'active';

-- Business 73: Carnegie Mellon Rwanda ICT
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Carnegie Mellon Rwanda ICT', 'Carnegie Mellon Rwanda ICT drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 723174103', 'info@carnegiemellonrwandaict.rw', 'www.carnegiemellonrwandaict.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.9, true, 'active';

-- Business 74: Rwanda Coding Academy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Coding Academy', 'Rwanda Coding Academy drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781932895', 'info@rwandacodingacademy.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 3.8, true, 'active';

-- Business 75: Digital Opportunity Trust
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Digital Opportunity Trust', 'Digital Opportunity Trust drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 790177226', 'info@digitalopportunitytrust.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 3.5, true, 'active';

-- Business 76: Think Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Think Rwanda', 'Think Rwanda drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 789738498', 'info@thinkrwanda.rw', 'www.thinkrwanda.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.8, true, 'active';

-- Business 77: Irembo
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Irembo', 'Irembo drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722564054', 'info@irembo.rw', 'www.irembo.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 3.7, true, 'active';

-- Business 78: Mergims
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Mergims', 'Mergims drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kigali City Center, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 793333410', 'info@mergims.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.8, true, 'active';

-- Business 79: AC Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'AC Group', 'AC Group drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791638483', 'info@acgroup.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.7, true, 'active';

-- Business 80: Awesomity Lab
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Awesomity Lab', 'Awesomity Lab drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 799454854', 'info@awesomitylab.rw', 'www.awesomitylab.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.4, true, 'active';

-- Business 81: Kigali Properties
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Properties', 'Kigali Properties specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727273461', 'info@kigaliproperties.rw', 'www.kigaliproperties.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.9, true, 'active';

-- Business 82: Rwanda Housing Authority
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Housing Authority', 'Rwanda Housing Authority specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794260637', 'info@rwandahousingauthority.rw', 'www.rwandahousingauthority.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.3, true, 'active';

-- Business 83: Horizon Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Horizon Group', 'Horizon Group specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 733548960', 'info@horizongroup.rw', 'www.horizongroup.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 3.8, true, 'active';

-- Business 84: Crystal Ventures Real Estate
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Crystal Ventures Real Estate', 'Crystal Ventures Real Estate specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 723858545', 'info@crystalventuresrealestate.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.2, true, 'active';

-- Business 85: Prime Holdings
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Prime Holdings', 'Prime Holdings specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 731016195', 'info@primeholdings.rw', 'www.primeholdings.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.9, true, 'active';

-- Business 86: Akweya Properties Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Akweya Properties Rwanda', 'Akweya Properties Rwanda specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 793991144', 'info@akweyapropertiesrwanda.rw', 'www.akweyapropertiesrwanda.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.5, true, 'active';

-- Business 87: E. Wells Realty Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'E. Wells Realty Rwanda', 'E. Wells Realty Rwanda specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 733338279', 'info@e.wellsrealtyrwanda.rw', 'www.e.wellsrealtyrwanda.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 3.6, false, 'active';

-- Business 88: OnPoint Property Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'OnPoint Property Rwanda', 'OnPoint Property Rwanda specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787962340', 'info@onpointpropertyrwanda.rw', 'www.onpointpropertyrwanda.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.2, true, 'active';

-- Business 89: Shelter Afrique Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Shelter Afrique Rwanda', 'Shelter Afrique Rwanda specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787026841', 'info@shelterafriquerwanda.rw', 'www.shelterafriquerwanda.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 5.0, true, 'active';

-- Business 90: Rwanda Realty
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Realty', 'Rwanda Realty specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with us.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 784906453', 'info@rwandarealty.rw', 'www.rwandarealty.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.2, false, 'active';

-- Business 91: Rwanda Car Rental
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Car Rental', 'Rwanda Car Rental offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 737596708', 'info@rwandacarrental.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.0, true, 'active';

-- Business 92: Kigali Cabs
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Kigali Cabs', 'Kigali Cabs offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786817195', 'info@kigalicabs.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.8, true, 'active';

-- Business 93: Yego Cab
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Yego Cab', 'Yego Cab offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730171520', 'info@yegocab.rw', 'www.yegocab.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.9, false, 'active';

-- Business 94: Move Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Move Rwanda', 'Move Rwanda offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kigali City Center, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727980568', 'info@moverwanda.rw', 'www.moverwanda.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.7, true, 'active';

-- Business 95: Virunga Express Bus
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Virunga Express Bus', 'Virunga Express Bus offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781847610', 'info@virungaexpressbus.rw', 'www.virungaexpressbus.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.1, false, 'active';

-- Business 96: Horizon Express
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Horizon Express', 'Horizon Express offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791453896', 'info@horizonexpress.rw', 'www.horizonexpress.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.6, true, 'active';

-- Business 97: Volcano Express
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Volcano Express', 'Volcano Express offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727874781', 'info@volcanoexpress.rw', 'www.volcanoexpress.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.4, true, 'active';

-- Business 98: Rwanda Tours & Safaris
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Rwanda Tours & Safaris', 'Rwanda Tours & Safaris offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kigali City Center, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 726647124', 'info@rwandatours&safaris.rw', 'www.rwandatours&safaris.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.9, true, 'active';

-- Business 99: Akagera Aviation
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'Akagera Aviation', 'Akagera Aviation offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721091597', 'info@akageraaviation.rw', 'www.akageraaviation.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.0, true, 'active';

-- Business 100: RwandAir
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)
SELECT 'RwandAir', 'RwandAir offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787625352', 'info@rwandair.rw', 'www.rwandair.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.4, false, 'active';


-- Total: 100 businesses imported

-- ============================================================================
-- STEP 4: Import Events
-- ============================================================================

-- Event 1: Tech Talk
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Tech Talk', 'Attend Tech Talk and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.', 
  '2025-11-29T22:00:00.380918', '2025-11-30T01:00:00.380918',
  'Kigali Conference Centre', 'Kigali City Center',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Tech Events', 'https://sinc.events/event/27', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming';

-- Event 2: Coding Bootcamp
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Coding Bootcamp', 'Learn something new at Coding Bootcamp! Expert instructors will guide you through hands-on activities and practical skills you can use immediately.', 
  '2025-12-02T20:00:00.380918', '2025-12-02T23:00:00.380918',
  'Norrsken House Kigali', 'Nyarutarama, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Coding Events', 'https://sinc.events/event/44', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 500, true, 'upcoming';

-- Event 3: Sunset Cocktails
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Sunset Cocktails', 'Sunset Cocktails is back! Get ready for an epic night of dancing, drinks, and entertainment. Dress to impress and bring your party spirit!', 
  '2025-12-03T17:00:00.380918', '2025-12-03T20:00:00.380918',
  'Kigali Conference Centre', 'Kigali City Center',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Sunset Events', 'https://sinc.events/event/12', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming';

-- Event 4: Chef's Table Experience
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Chef''s Table Experience', 'Indulge in Chef''s Table Experience! A culinary experience featuring exquisite flavors, expert chefs, and delightful company. Food lovers, this is for you!', 
  '2025-12-03T18:00:00.380918', '2025-12-03T21:00:00.380918',
  'Century Cinema', 'Kigali City Tower',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Chef''s Events', 'https://sinc.events/event/23', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 500, true, 'upcoming';

-- Event 5: Wine Tasting Evening
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Wine Tasting Evening', 'Indulge in Wine Tasting Evening! A culinary experience featuring exquisite flavors, expert chefs, and delightful company. Food lovers, this is for you!', 
  '2025-12-04T21:00:00.380918', '2025-12-05T00:00:00.380918',
  'B-Club', 'Kimihurura, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Wine Events', 'https://sinc.events/event/19', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming';

-- Event 6: Afrobeat Night Live
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Afrobeat Night Live', 'Join us for Afrobeat Night Live! Experience an unforgettable evening of live music featuring talented artists. Great vibes, amazing atmosphere, and memories to last a lifetime.', 
  '2025-12-05T17:00:00.380918', '2025-12-05T20:00:00.380918',
  'Heaven Restaurant', 'Kiyovu, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Afrobeat Events', 'https://sinc.events/event/1', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming';

-- Event 7: Morning Yoga Session
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Morning Yoga Session', 'Get active with Morning Yoga Session! Whether you''re a beginner or pro, join us for a fun and energizing experience. All fitness levels welcome!', 
  '2025-12-05T22:00:00.380918', '2025-12-06T01:00:00.380918',
  'Century Cinema', 'Kigali City Tower',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Morning Events', 'https://sinc.events/event/31', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming';

-- Event 8: Business Networking Mixer
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Business Networking Mixer', 'Attend Business Networking Mixer and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.', 
  '2025-12-08T21:00:00.380918', '2025-12-09T00:00:00.380918',
  'Kigali Arena', 'Remera, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Business Events', 'https://sinc.events/event/26', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming';

-- Event 9: Rooftop Party
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Rooftop Party', 'Rooftop Party is back! Get ready for an epic night of dancing, drinks, and entertainment. Dress to impress and bring your party spirit!', 
  '2025-12-09T20:00:00.380918', '2025-12-09T23:00:00.380918',
  'Norrsken House Kigali', 'Nyarutarama, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Rooftop Events', 'https://sinc.events/event/8', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming';

-- Event 10: Startup Pitch Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Startup Pitch Night', 'Attend Startup Pitch Night and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.', 
  '2025-12-18T19:00:00.380918', '2025-12-18T22:00:00.380918',
  'Inema Arts Center', 'Kacyiru, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Startup Events', 'https://sinc.events/event/25', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 500, true, 'upcoming';

-- Event 11: VIP Lounge Experience
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'VIP Lounge Experience', 'VIP Lounge Experience is back! Get ready for an epic night of dancing, drinks, and entertainment. Dress to impress and bring your party spirit!', 
  '2025-12-20T17:00:00.380918', '2025-12-20T20:00:00.380918',
  'Kigali Arena', 'Remera, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'VIP Events', 'https://sinc.events/event/11', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming';

-- Event 12: 5K Fun Run
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT '5K Fun Run', 'Get active with 5K Fun Run! Whether you''re a beginner or pro, join us for a fun and energizing experience. All fitness levels welcome!', 
  '2025-12-21T18:00:00.380918', '2025-12-21T21:00:00.380918',
  'Lemigo Hotel', 'Kimihurura, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', '5K Events', 'https://sinc.events/event/32', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming';

-- Event 13: Film Screening
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Film Screening', 'Discover Film Screening - a celebration of creativity and artistic expression. Immerse yourself in the vibrant arts scene of Kigali.', 
  '2025-12-21T19:00:00.380918', '2025-12-21T22:00:00.380918',
  'Inema Arts Center', 'Kacyiru, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Film Events', 'https://sinc.events/event/18', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming';

-- Event 14: Culinary Workshop
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Culinary Workshop', 'Indulge in Culinary Workshop! A culinary experience featuring exquisite flavors, expert chefs, and delightful company. Food lovers, this is for you!', 
  '2025-12-21T21:00:00.380918', '2025-12-22T00:00:00.380918',
  'Kigali Conference Centre', 'Kigali City Center',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Culinary Events', 'https://sinc.events/event/20', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming';

-- Event 15: Jazz Under the Stars
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Jazz Under the Stars', 'Join us for Jazz Under the Stars! Experience an unforgettable evening of live music featuring talented artists. Great vibes, amazing atmosphere, and memories to last a lifetime.', 
  '2025-12-24T17:00:00.380918', '2025-12-24T20:00:00.380918',
  'B-Club', 'Kimihurura, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Jazz Events', 'https://sinc.events/event/2', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming';

-- Event 16: Book Club Meeting
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Book Club Meeting', 'Be part of Book Club Meeting and make a difference in our community. Together, we can create positive change and build stronger connections.', 
  '2025-12-28T19:00:00.380918', '2025-12-28T22:00:00.380918',
  'B-Club', 'Kimihurura, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Book Events', 'https://sinc.events/event/39', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 500, true, 'upcoming';

-- Event 17: Kigali Music Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Kigali Music Festival', 'Join us for Kigali Music Festival! Experience an unforgettable evening of live music featuring talented artists. Great vibes, amazing atmosphere, and memories to last a lifetime.', 
  '2025-12-29T19:00:00.380918', '2025-12-29T22:00:00.380918',
  'Norrsken House Kigali', 'Nyarutarama, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Kigali Events', 'https://sinc.events/event/3', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming';

-- Event 18: Theatre Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Theatre Night', 'Discover Theatre Night - a celebration of creativity and artistic expression. Immerse yourself in the vibrant arts scene of Kigali.', 
  '2025-12-31T22:00:00.380918', '2026-01-01T01:00:00.380918',
  'Kigali Conference Centre', 'Kigali City Center',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Theatre Events', 'https://sinc.events/event/16', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming';

-- Event 19: Social Impact Summit
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Social Impact Summit', 'Be part of Social Impact Summit and make a difference in our community. Together, we can create positive change and build stronger connections.', 
  '2026-01-07T21:00:00.380918', '2026-01-08T00:00:00.380918',
  'Kigali Arena', 'Remera, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Social Events', 'https://sinc.events/event/42', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming';

-- Event 20: Investment Forum
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)
SELECT 'Investment Forum', 'Attend Investment Forum and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.', 
  '2026-01-09T19:00:00.380918', '2026-01-09T22:00:00.380918',
  'Heaven Restaurant', 'Kiyovu, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Investment Events', 'https://sinc.events/event/29', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming';


-- Total: 48 events imported

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count imported businesses
SELECT COUNT(*) as total_businesses FROM businesses WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');

-- Count imported events
SELECT COUNT(*) as total_events FROM events WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');

-- View sample businesses
SELECT name, address, phone FROM businesses WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda') LIMIT 10;

-- View upcoming events
SELECT title, start_date, venue_name FROM events WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda') AND start_date > NOW() ORDER BY start_date LIMIT 10;
