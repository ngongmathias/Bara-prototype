-- Import Additional Rwanda Businesses and Events
-- Generated: 2025-11-13
-- 200 businesses + 100 events

-- ============================================================================
-- IMPORT ADDITIONAL BUSINESSES
-- ============================================================================

-- Business 1: Gisenyi Medical Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Medical Center', 'Gisenyi Medical Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 773367217', 'info@gisenyimedicalcenter.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.8, true, 'active', '2025-11-13T13:11:00';

-- Business 2: Kigali Academy Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Academy Group', 'Kigali Academy Group offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786657304', 'info@kigaliacademygroup.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.9, true, 'active', '2025-11-15T12:03:00';

-- Business 3: Nyanza Housing
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Housing', 'Nyanza Housing specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 785926880', 'info@nyanzahousing.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.4, false, 'active', '2025-11-07T17:43:00';

-- Business 4: Akagera Market Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Market Group', 'Akagera Market Group is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 790998089', 'info@akageramarketgroup.rw', 'www.akageramarketgroup.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.9, false, 'active', '2025-11-05T10:19:00';

-- Business 5: Kivu Health Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Health Center', 'Kivu Health Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 741733173', 'info@kivuhealthcenter.rw', 'www.kivuhealthcenter.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.1, true, 'active', '2025-11-20T12:34:00';

-- Business 6: Virunga Transit
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Transit', 'Virunga Transit offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 775001892', 'info@virungatransit.rw', 'www.virungatransit.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.8, true, 'active', '2025-11-28T19:32:00';

-- Business 7: Ruhengeri Estates
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Estates', 'Ruhengeri Estates specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 780580205', 'info@ruhengeriestates.rw', 'www.ruhengeriestates.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.6, false, 'active', '2025-11-26T21:02:00';

-- Business 8: Virunga Shop
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Shop', 'Virunga Shop is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 773102699', 'info@virungashop.rw', 'www.virungashop.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.9, true, 'active', '2025-11-14T14:20:00';

-- Business 9: Virunga Clinic
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Clinic', 'Virunga Clinic provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 736404409', 'info@virungaclinic.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.6, true, 'active', '2025-11-21T07:34:00';

-- Business 10: Huye Lodge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Lodge', 'Huye Lodge provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 736525110', 'info@huyelodge.rw', 'www.huyelodge.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.0, false, 'active', '2025-11-06T21:03:00';

-- Business 11: Butare Arena
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Arena', 'Butare Arena is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721317873', 'info@butarearena.rw', 'www.butarearena.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.9, false, 'active', '2025-11-28T23:04:00';

-- Business 12: Kivu Estates
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Estates', 'Kivu Estates specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 783087136', 'info@kivuestates.rw', 'www.kivuestates.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.5, false, 'active', '2025-11-04T15:38:00';

-- Business 13: Rubavu Kitchen
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Kitchen', 'Rubavu Kitchen offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727613926', 'info@rubavukitchen.rw', 'www.rubavukitchen.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.6, true, 'active', '2025-11-24T21:38:00';

-- Business 14: Rusizi Partners & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Partners & Co', 'Rusizi Partners & Co delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 769661845', 'info@rusizipartnersandco.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.4, true, 'active', '2025-11-09T06:57:00';

-- Business 15: Ruhengeri Innovation Hub Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Innovation Hub Kigali', 'Ruhengeri Innovation Hub Kigali drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722605388', 'info@ruhengeriinnovationhubkigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.6, false, 'active', '2025-11-23T12:59:00';

-- Business 16: Rubavu IT Solutions
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu IT Solutions', 'Rubavu IT Solutions drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 779524608', 'info@rubavuitsolutions.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.3, true, 'active', '2025-11-13T18:45:00';

-- Business 17: Rusizi Learning Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Learning Center', 'Rusizi Learning Center offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776569705', 'info@rusizilearningcenter.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.4, true, 'active', '2025-11-22T14:48:00';

-- Business 18: Huye Developers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Developers', 'Huye Developers specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 763481773', 'info@huyedevelopers.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 3.7, true, 'active', '2025-11-26T08:28:00';

-- Business 19: Kigali Grill
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Grill', 'Kigali Grill offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 760053221', 'info@kigaligrill.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.8, true, 'active', '2025-11-09T09:37:00';

-- Business 20: Akagera Learning Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Learning Center', 'Akagera Learning Center offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791371567', 'info@akageralearningcenter.rw', 'www.akageralearningcenter.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.3, true, 'active', '2025-11-06T17:01:00';

-- Business 21: Huye Innovation Hub
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Innovation Hub', 'Huye Innovation Hub drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781359951', 'info@huyeinnovationhub.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.8, true, 'active', '2025-11-10T00:22:00';

-- Business 22: Butare Medical Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Medical Center', 'Butare Medical Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 788152490', 'info@butaremedicalcenter.rw', 'www.butaremedicalcenter.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.1, true, 'active', '2025-11-10T08:19:00';

-- Business 23: Rusizi Grand Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Grand Hotel', 'Rusizi Grand Hotel provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 783383318', 'info@rusizigrandhotel.rw', 'www.rusizigrandhotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.9, true, 'active', '2025-11-01T12:06:00';

-- Business 24: Ruhengeri Dental Care
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Dental Care', 'Ruhengeri Dental Care provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 770557739', 'info@ruhengeridentalcare.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.7, true, 'active', '2025-11-02T22:33:00';

-- Business 25: Kigali Associates
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Associates', 'Kigali Associates delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 788811348', 'info@kigaliassociates.rw', 'www.kigaliassociates.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.3, false, 'active', '2025-11-01T07:19:00';

-- Business 26: Rubavu Learning Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Learning Center', 'Rubavu Learning Center offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 725418798', 'info@rubavulearningcenter.rw', 'www.rubavulearningcenter.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.8, true, 'active', '2025-11-15T15:07:00';

-- Business 27: Muhanga Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Group', 'Muhanga Group delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776975301', 'info@muhangagroup.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.6, true, 'active', '2025-11-11T15:01:00';

-- Business 28: Huye Market
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Market', 'Huye Market is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 788571701', 'info@huyemarket.rw', 'www.huyemarket.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.7, true, 'active', '2025-11-09T06:36:00';

-- Business 29: Musanze Digital
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Digital', 'Musanze Digital drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 772412615', 'info@musanzedigital.rw', 'www.musanzedigital.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.9, true, 'active', '2025-11-02T13:43:00';

-- Business 30: Butare Market
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Market', 'Butare Market is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 745532038', 'info@butaremarket.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.4, true, 'active', '2025-11-26T13:52:00';

-- Business 31: Butare Tech & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Tech & Co', 'Butare Tech & Co drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 746924295', 'info@butaretechandco.rw', 'www.butaretechandco.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.2, true, 'active', '2025-11-06T09:50:00';

-- Business 32: Ruhengeri Trading Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Trading Group', 'Ruhengeri Trading Group is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 726588831', 'info@ruhengeritradinggroup.rw', 'www.ruhengeritradinggroup.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.9, false, 'active', '2025-11-26T21:27:00';

-- Business 33: Kivu Transit
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Transit', 'Kivu Transit offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 790107340', 'info@kivutransit.rw', 'www.kivutransit.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.8, true, 'active', '2025-11-21T13:08:00';

-- Business 34: Huye Cafe
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Cafe', 'Huye Cafe offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 741327088', 'info@huyecafe.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.7, false, 'active', '2025-11-14T06:52:00';

-- Business 35: Muhanga Logistics
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Logistics', 'Muhanga Logistics offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 778903579', 'info@muhangalogistics.rw', 'www.muhangalogistics.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.0, true, 'active', '2025-11-17T19:18:00';

-- Business 36: Kivu Emporium
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Emporium', 'Kivu Emporium is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 792699797', 'info@kivuemporium.rw', 'www.kivuemporium.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.3, false, 'active', '2025-11-20T17:40:00';

-- Business 37: Kivu Cafe Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Cafe Kigali', 'Kivu Cafe Kigali offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 777629609', 'info@kivucafekigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.5, false, 'active', '2025-11-04T06:47:00';

-- Business 38: Rwanda Grill
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Grill', 'Rwanda Grill offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 741385104', 'info@rwandagrill.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 5.0, true, 'active', '2025-11-09T05:38:00';

-- Business 39: Gisenyi Tech Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Tech Kigali', 'Gisenyi Tech Kigali drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776818795', 'info@gisenyitechkigali.rw', 'www.gisenyitechkigali.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 3.8, true, 'active', '2025-11-05T10:23:00';

-- Business 40: Virunga Medical Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Medical Center', 'Virunga Medical Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 766910065', 'info@virungamedicalcenter.rw', 'www.virungamedicalcenter.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.5, true, 'active', '2025-11-17T15:01:00';

-- Business 41: Huye Guest House Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Guest House Kigali', 'Huye Guest House Kigali provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 779559251', 'info@huyeguesthousekigali.rw', 'www.huyeguesthousekigali.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.6, true, 'active', '2025-11-03T01:45:00';

-- Business 42: Kivu Studio
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Studio', 'Kivu Studio is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730175201', 'info@kivustudio.rw', 'www.kivustudio.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.5, false, 'active', '2025-11-18T08:02:00';

-- Business 43: Virunga Club Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Club Group', 'Virunga Club Group is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 799013700', 'info@virungaclubgroup.rw', 'www.virungaclubgroup.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.0, true, 'active', '2025-11-25T13:55:00';

-- Business 44: Rwanda Tavern
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Tavern', 'Rwanda Tavern offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 743090857', 'info@rwandatavern.rw', 'www.rwandatavern.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.4, true, 'active', '2025-11-12T12:33:00';

-- Business 45: Huye Clinic
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Clinic', 'Huye Clinic provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 757690997', 'info@huyeclinic.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.4, true, 'active', '2025-11-10T05:13:00';

-- Business 46: Nyanza Clinic
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Clinic', 'Nyanza Clinic provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 734983705', 'info@nyanzaclinic.rw', 'www.nyanzaclinic.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.3, true, 'active', '2025-11-08T06:33:00';

-- Business 47: Kivu Learning Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Learning Center', 'Kivu Learning Center offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794891788', 'info@kivulearningcenter.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.5, true, 'active', '2025-11-01T21:02:00';

-- Business 48: Muhanga Dental Care
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Dental Care', 'Muhanga Dental Care provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 746302332', 'info@muhangadentalcare.rw', 'www.muhangadentalcare.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.1, true, 'active', '2025-11-11T23:29:00';

-- Business 49: Akagera Consulting & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Consulting & Co', 'Akagera Consulting & Co delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 740379701', 'info@akageraconsultingandco.rw', 'www.akageraconsultingandco.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.6, true, 'active', '2025-11-17T21:13:00';

-- Business 50: Gisenyi Grand Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Grand Hotel', 'Gisenyi Grand Hotel provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 734227062', 'info@gisenyigrandhotel.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.5, true, 'active', '2025-11-08T21:14:00';

-- Business 51: Kivu Academy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Academy', 'Kivu Academy offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 767019692', 'info@kivuacademy.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 5.0, true, 'active', '2025-11-22T19:32:00';

-- Business 52: Huye Transport
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Transport', 'Huye Transport offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 789042742', 'info@huyetransport.rw', 'www.huyetransport.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.6, true, 'active', '2025-11-03T01:42:00';

-- Business 53: Rubavu Properties
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Properties', 'Rubavu Properties specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786182959', 'info@rubavuproperties.rw', 'www.rubavuproperties.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.1, false, 'active', '2025-11-03T06:34:00';

-- Business 54: Kigali Market
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Market', 'Kigali Market is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 774406945', 'info@kigalimarket.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.6, false, 'active', '2025-11-10T03:59:00';

-- Business 55: Gisenyi Shop Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Shop Rwanda', 'Gisenyi Shop Rwanda is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 732568471', 'info@gisenyishoprwanda.rw', 'www.gisenyishoprwanda.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.6, false, 'active', '2025-11-28T17:50:00';

-- Business 56: Kivu College
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu College', 'Kivu College offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729014889', 'info@kivucollege.rw', 'www.kivucollege.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.8, false, 'active', '2025-11-26T06:56:00';

-- Business 57: Nyanza Lodge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Lodge', 'Nyanza Lodge provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 768121481', 'info@nyanzalodge.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.6, true, 'active', '2025-11-07T09:13:00';

-- Business 58: Akagera Boutique
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Boutique', 'Akagera Boutique is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 744754765', 'info@akageraboutique.rw', 'www.akageraboutique.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.6, true, 'active', '2025-11-01T11:56:00';

-- Business 59: Butare Dental Care
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Dental Care', 'Butare Dental Care provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 764690426', 'info@butaredentalcare.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.2, false, 'active', '2025-11-28T21:32:00';

-- Business 60: Musanze Transit Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Transit Group', 'Musanze Transit Group offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727829264', 'info@musanzetransitgroup.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.1, true, 'active', '2025-11-26T16:47:00';

-- Business 61: Akagera Guest House
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Guest House', 'Akagera Guest House provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 772454511', 'info@akageraguesthouse.rw', 'www.akageraguesthouse.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.3, false, 'active', '2025-11-01T08:45:00';

-- Business 62: Virunga Realty & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Realty & Co', 'Virunga Realty & Co specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 741998937', 'info@virungarealtyandco.rw', 'www.virungarealtyandco.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.0, false, 'active', '2025-11-24T11:41:00';

-- Business 63: Butare Innovation Hub
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Innovation Hub', 'Butare Innovation Hub drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 768834741', 'info@butareinnovationhub.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.6, true, 'active', '2025-11-26T13:24:00';

-- Business 64: Kivu Express
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Express', 'Kivu Express offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776905788', 'info@kivuexpress.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.7, false, 'active', '2025-11-07T14:30:00';

-- Business 65: Rubavu Realty
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Realty', 'Rubavu Realty specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 761089816', 'info@rubavurealty.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.1, false, 'active', '2025-11-15T05:26:00';

-- Business 66: Ruhengeri Consulting
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Consulting', 'Ruhengeri Consulting delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 782447610', 'info@ruhengericonsulting.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.7, false, 'active', '2025-11-19T10:15:00';

-- Business 67: Virunga Realty Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Realty Ltd', 'Virunga Realty Ltd specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 775956459', 'info@virungarealtyltd.rw', 'www.virungarealtyltd.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.9, true, 'active', '2025-11-14T01:58:00';

-- Business 68: Muhanga Kitchen
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Kitchen', 'Muhanga Kitchen offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 774066244', 'info@muhangakitchen.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.1, true, 'active', '2025-11-08T05:40:00';

-- Business 69: Rusizi Cafe
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Cafe', 'Rusizi Cafe offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 789774098', 'info@rusizicafe.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.8, true, 'active', '2025-11-06T09:15:00';

-- Business 70: Ruhengeri Transport
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Transport', 'Ruhengeri Transport offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 756196562', 'info@ruhengeritransport.rw', 'www.ruhengeritransport.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.1, true, 'active', '2025-11-10T23:12:00';

-- Business 71: Huye Suites
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Suites', 'Huye Suites provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 742410507', 'info@huyesuites.rw', 'www.huyesuites.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.7, true, 'active', '2025-11-04T22:52:00';

-- Business 72: Muhanga Trading Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Trading Ltd', 'Muhanga Trading Ltd is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791579825', 'info@muhangatradingltd.rw', 'www.muhangatradingltd.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.6, true, 'active', '2025-11-13T20:19:00';

-- Business 73: Virunga Institute Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Institute Ltd', 'Virunga Institute Ltd offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 773690636', 'info@virungainstituteltd.rw', 'www.virungainstituteltd.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.9, true, 'active', '2025-11-17T16:40:00';

-- Business 74: Rusizi Consulting
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Consulting', 'Rusizi Consulting delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 763914963', 'info@rusiziconsulting.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.5, true, 'active', '2025-11-10T03:35:00';

-- Business 75: Rubavu Movers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Movers', 'Rubavu Movers offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730559701', 'info@rubavumovers.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.7, true, 'active', '2025-11-05T11:55:00';

-- Business 76: Nyanza Learning Center Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Learning Center Group', 'Nyanza Learning Center Group offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 775737394', 'info@nyanzalearningcentergroup.rw', 'www.nyanzalearningcentergroup.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.8, true, 'active', '2025-11-18T09:13:00';

-- Business 77: Nyanza Associates
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Associates', 'Nyanza Associates delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 757633774', 'info@nyanzaassociates.rw', 'www.nyanzaassociates.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.8, true, 'active', '2025-11-07T13:12:00';

-- Business 78: Nyanza Academy Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Academy Rwanda', 'Nyanza Academy Rwanda offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 761208269', 'info@nyanzaacademyrwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.3, true, 'active', '2025-11-16T18:47:00';

-- Business 79: Rubavu Inn
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Inn', 'Rubavu Inn provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722774264', 'info@rubavuinn.rw', 'www.rubavuinn.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.7, false, 'active', '2025-11-27T19:30:00';

-- Business 80: Butare Dining
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Dining', 'Butare Dining offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 763256221', 'info@butaredining.rw', 'www.butaredining.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.6, false, 'active', '2025-11-11T06:08:00';

-- Business 81: Ruhengeri Grill
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Grill', 'Ruhengeri Grill offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 775835188', 'info@ruhengerigrill.rw', 'www.ruhengerigrill.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.5, true, 'active', '2025-11-28T05:06:00';

-- Business 82: Ruhengeri Guest House
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Guest House', 'Ruhengeri Guest House provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 741153151', 'info@ruhengeriguesthouse.rw', 'www.ruhengeriguesthouse.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.9, false, 'active', '2025-11-06T01:01:00';

-- Business 83: Rubavu Services Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Services Group', 'Rubavu Services Group delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 772245614', 'info@rubavuservicesgroup.rw', 'www.rubavuservicesgroup.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.5, true, 'active', '2025-11-24T10:47:00';

-- Business 84: Butare Training Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Training Center', 'Butare Training Center offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 764405266', 'info@butaretrainingcenter.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.9, false, 'active', '2025-11-03T13:48:00';

-- Business 85: Huye Guest House
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Guest House', 'Huye Guest House provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 764584082', 'info@huyeguesthouse.rw', 'www.huyeguesthouse.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.8, true, 'active', '2025-11-21T06:50:00';

-- Business 86: Rwanda Logistics
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Logistics', 'Rwanda Logistics offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 736163921', 'info@rwandalogistics.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.3, true, 'active', '2025-11-06T16:37:00';

-- Business 87: Rusizi Properties
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Properties', 'Rusizi Properties specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 768423246', 'info@rusiziproperties.rw', 'www.rusiziproperties.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.2, true, 'active', '2025-11-02T19:57:00';

-- Business 88: Musanze Health Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Health Center', 'Musanze Health Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 749298925', 'info@musanzehealthcenter.rw', 'www.musanzehealthcenter.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.9, true, 'active', '2025-11-07T09:56:00';

-- Business 89: Virunga Transport
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Transport', 'Virunga Transport offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776547593', 'info@virungatransport.rw', 'www.virungatransport.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.4, true, 'active', '2025-11-07T11:51:00';

-- Business 90: Butare Health Center Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Health Center Group', 'Butare Health Center Group provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 779757243', 'info@butarehealthcentergroup.rw', 'www.butarehealthcentergroup.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.8, true, 'active', '2025-11-03T05:09:00';

-- Business 91: Rwanda Bistro
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Bistro', 'Rwanda Bistro offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 744620579', 'info@rwandabistro.rw', 'www.rwandabistro.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.4, true, 'active', '2025-11-26T02:42:00';

-- Business 92: Nyanza Developers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Developers', 'Nyanza Developers specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 782612849', 'info@nyanzadevelopers.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 5.0, true, 'active', '2025-11-20T12:43:00';

-- Business 93: Virunga Market
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Market', 'Virunga Market is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 743504231', 'info@virungamarket.rw', 'www.virungamarket.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.2, false, 'active', '2025-11-07T04:21:00';

-- Business 94: Gisenyi Arena Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Arena Ltd', 'Gisenyi Arena Ltd is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 784138689', 'info@gisenyiarenaltd.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.2, true, 'active', '2025-11-23T15:43:00';

-- Business 95: Butare Pharmacy Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Pharmacy Group', 'Butare Pharmacy Group provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 762729073', 'info@butarepharmacygroup.rw', 'www.butarepharmacygroup.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.0, false, 'active', '2025-11-14T01:56:00';

-- Business 96: Rusizi Transit
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Transit', 'Rusizi Transit offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797767799', 'info@rusizitransit.rw', 'www.rusizitransit.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.1, true, 'active', '2025-11-20T10:08:00';

-- Business 97: Rwanda Medical Center Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Medical Center Rwanda', 'Rwanda Medical Center Rwanda provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 790141964', 'info@rwandamedicalcenterrwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.5, true, 'active', '2025-11-06T02:04:00';

-- Business 98: Rusizi Express
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Express', 'Rusizi Express offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 745558964', 'info@rusiziexpress.rw', 'www.rusiziexpress.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.4, true, 'active', '2025-11-10T06:21:00';

-- Business 99: Butare Transit
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Transit', 'Butare Transit offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 732420259', 'info@butaretransit.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.7, true, 'active', '2025-11-01T13:25:00';

-- Business 100: Nyanza Arena & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Arena & Co', 'Nyanza Arena & Co is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 784685124', 'info@nyanzaarenaandco.rw', 'www.nyanzaarenaandco.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.7, true, 'active', '2025-11-03T23:53:00';

-- Business 101: Butare Academy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Academy', 'Butare Academy offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722740209', 'info@butareacademy.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.0, true, 'active', '2025-11-05T19:19:00';

-- Business 102: Gisenyi Clinic Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Clinic Ltd', 'Gisenyi Clinic Ltd provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721991273', 'info@gisenyiclinicltd.rw', 'www.gisenyiclinicltd.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.5, false, 'active', '2025-11-02T03:02:00';

-- Business 103: Rwanda Lodge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Lodge', 'Rwanda Lodge provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721547618', 'info@rwandalodge.rw', 'www.rwandalodge.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.0, true, 'active', '2025-11-03T01:17:00';

-- Business 104: Ruhengeri Properties
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Properties', 'Ruhengeri Properties specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 773112314', 'info@ruhengeriproperties.rw', 'www.ruhengeriproperties.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.9, true, 'active', '2025-11-18T17:01:00';

-- Business 105: Kigali Grand Hotel
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Grand Hotel', 'Kigali Grand Hotel provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 766615994', 'info@kigaligrandhotel.rw', 'www.kigaligrandhotel.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.0, true, 'active', '2025-11-04T03:24:00';

-- Business 106: Musanze Tech
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Tech', 'Musanze Tech drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 743421702', 'info@musanzetech.rw', 'www.musanzetech.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.9, true, 'active', '2025-11-10T08:55:00';

-- Business 107: Ruhengeri Services
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Services', 'Ruhengeri Services delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 766487115', 'info@ruhengeriservices.rw', 'www.ruhengeriservices.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.6, true, 'active', '2025-11-04T23:40:00';

-- Business 108: Muhanga Resort
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Resort', 'Muhanga Resort provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730030495', 'info@muhangaresort.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.9, true, 'active', '2025-11-15T21:39:00';

-- Business 109: Musanze Lodge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Lodge', 'Musanze Lodge provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730054028', 'info@musanzelodge.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.0, true, 'active', '2025-11-11T23:24:00';

-- Business 110: Virunga Gallery
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Gallery', 'Virunga Gallery is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 745163140', 'info@virungagallery.rw', 'www.virungagallery.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.0, true, 'active', '2025-11-19T16:05:00';

-- Business 111: Huye Solutions
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Solutions', 'Huye Solutions delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 752999347', 'info@huyesolutions.rw', 'www.huyesolutions.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.0, true, 'active', '2025-11-09T08:15:00';

-- Business 112: Akagera Software House & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Software House & Co', 'Akagera Software House & Co drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 722408764', 'info@akagerasoftwarehouseandco.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 3.5, true, 'active', '2025-11-18T14:40:00';

-- Business 113: Virunga Pharmacy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Pharmacy', 'Virunga Pharmacy provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 763705281', 'info@virungapharmacy.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.6, true, 'active', '2025-11-13T01:53:00';

-- Business 114: Nyanza Logistics
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Logistics', 'Nyanza Logistics offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776043775', 'info@nyanzalogistics.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.7, true, 'active', '2025-11-24T20:52:00';

-- Business 115: Akagera Institute Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Institute Kigali', 'Akagera Institute Kigali offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 751587951', 'info@akagerainstitutekigali.rw', 'www.akagerainstitutekigali.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.7, true, 'active', '2025-11-22T20:04:00';

-- Business 116: Akagera Lounge Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Lounge Group', 'Akagera Lounge Group is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 783070297', 'info@akageraloungegroup.rw', 'www.akageraloungegroup.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.7, false, 'active', '2025-11-07T02:40:00';

-- Business 117: Musanze Tavern
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Tavern', 'Musanze Tavern offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 735338651', 'info@musanzetavern.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.5, true, 'active', '2025-11-22T04:50:00';

-- Business 118: Akagera Lodge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Lodge', 'Akagera Lodge provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721569816', 'info@akageralodge.rw', 'www.akageralodge.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.2, true, 'active', '2025-11-03T02:18:00';

-- Business 119: Rusizi Inn
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Inn', 'Rusizi Inn provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 742474987', 'info@rusiziinn.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.5, false, 'active', '2025-11-20T11:48:00';

-- Business 120: Rwanda Arena
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Arena', 'Rwanda Arena is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729172818', 'info@rwandaarena.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.4, true, 'active', '2025-11-09T17:18:00';

-- Business 121: Rwanda Store
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Store', 'Rwanda Store is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 731941944', 'info@rwandastore.rw', 'www.rwandastore.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.9, false, 'active', '2025-11-06T03:37:00';

-- Business 122: Gisenyi Health Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Health Center', 'Gisenyi Health Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 724886889', 'info@gisenyihealthcenter.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.5, false, 'active', '2025-11-03T18:26:00';

-- Business 123: Ruhengeri Estates Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Ruhengeri Estates Ltd', 'Ruhengeri Estates Ltd specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 773275375', 'info@ruhengeriestatesltd.rw', 'www.ruhengeriestatesltd.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.6, true, 'active', '2025-11-27T04:14:00';

-- Business 124: Akagera Movers Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Movers Group', 'Akagera Movers Group offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 759288188', 'info@akageramoversgroup.rw', 'www.akageramoversgroup.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.5, false, 'active', '2025-11-08T22:35:00';

-- Business 125: Huye Movers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Movers', 'Huye Movers offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 748973010', 'info@huyemovers.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.7, true, 'active', '2025-11-18T08:20:00';

-- Business 126: Rubavu Pharmacy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Pharmacy', 'Rubavu Pharmacy provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 769441466', 'info@rubavupharmacy.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.8, false, 'active', '2025-11-07T21:04:00';

-- Business 127: Akagera Health Center Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Health Center Group', 'Akagera Health Center Group provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 787338066', 'info@akagerahealthcentergroup.rw', 'www.akagerahealthcentergroup.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.6, false, 'active', '2025-11-11T05:27:00';

-- Business 128: Butare Housing
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Housing', 'Butare Housing specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781482365', 'info@butarehousing.rw', 'www.butarehousing.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.0, true, 'active', '2025-11-03T23:48:00';

-- Business 129: Virunga Theater
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Theater', 'Virunga Theater is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794339034', 'info@virungatheater.rw', 'www.virungatheater.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.2, true, 'active', '2025-11-07T12:31:00';

-- Business 130: Virunga Studio
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Studio', 'Virunga Studio is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 734329441', 'info@virungastudio.rw', 'www.virungastudio.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.7, false, 'active', '2025-11-04T12:56:00';

-- Business 131: Butare Partners Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Partners Kigali', 'Butare Partners Kigali delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 735993598', 'info@butarepartnerskigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.4, true, 'active', '2025-11-15T14:53:00';

-- Business 132: Kivu Express & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Express & Co', 'Kivu Express & Co offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 796792111', 'info@kivuexpressandco.rw', 'www.kivuexpressandco.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.7, true, 'active', '2025-11-02T13:47:00';

-- Business 133: Nyanza Trading Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Trading Kigali', 'Nyanza Trading Kigali is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 772613806', 'info@nyanzatradingkigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.6, true, 'active', '2025-11-20T14:14:00';

-- Business 134: Rubavu Realty Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Realty Rwanda', 'Rubavu Realty Rwanda specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 742570163', 'info@rubavurealtyrwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 3.8, true, 'active', '2025-11-11T12:40:00';

-- Business 135: Rwanda Dining
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Dining', 'Rwanda Dining offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 760680052', 'info@rwandadining.rw', 'www.rwandadining.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.9, true, 'active', '2025-11-13T04:15:00';

-- Business 136: Nyanza Theater
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Theater', 'Nyanza Theater is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 750736240', 'info@nyanzatheater.rw', 'www.nyanzatheater.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.8, true, 'active', '2025-11-17T21:25:00';

-- Business 137: Kigali Transport
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Transport', 'Kigali Transport offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 769324409', 'info@kigalitransport.rw', 'www.kigalitransport.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.6, true, 'active', '2025-11-10T10:50:00';

-- Business 138: Huye Logistics
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Logistics', 'Huye Logistics offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 752145248', 'info@huyelogistics.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.9, true, 'active', '2025-11-25T22:13:00';

-- Business 139: Rwanda Club
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rwanda Club', 'Rwanda Club is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 764407651', 'info@rwandaclub.rw', 'www.rwandaclub.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.8, false, 'active', '2025-11-08T04:53:00';

-- Business 140: Nyanza Boutique
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Boutique', 'Nyanza Boutique is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 758945414', 'info@nyanzaboutique.rw', 'www.nyanzaboutique.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.9, true, 'active', '2025-11-25T11:51:00';

-- Business 141: Butare Realty
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Realty', 'Butare Realty specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 778749680', 'info@butarerealty.rw', 'www.butarerealty.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.2, true, 'active', '2025-11-14T08:03:00';

-- Business 142: Akagera Lodge Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Lodge Kigali', 'Akagera Lodge Kigali provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 783833033', 'info@akageralodgekigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.0, true, 'active', '2025-11-09T04:55:00';

-- Business 143: Akagera Inn
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Inn', 'Akagera Inn provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 735502482', 'info@akagerainn.rw', 'www.akagerainn.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 3.8, true, 'active', '2025-11-10T03:10:00';

-- Business 144: Musanze Estates
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Estates', 'Musanze Estates specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 772906679', 'info@musanzeestates.rw', 'www.musanzeestates.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 3.9, true, 'active', '2025-11-23T07:58:00';

-- Business 145: Nyanza Pharmacy
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Pharmacy', 'Nyanza Pharmacy provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 721765405', 'info@nyanzapharmacy.rw', 'www.nyanzapharmacy.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.8, false, 'active', '2025-11-21T03:41:00';

-- Business 146: Rubavu Grill
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Grill', 'Rubavu Grill offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 792496117', 'info@rubavugrill.rw', 'www.rubavugrill.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.6, true, 'active', '2025-11-14T17:39:00';

-- Business 147: Huye Express & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Express & Co', 'Huye Express & Co offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 769145469', 'info@huyeexpressandco.rw', 'www.huyeexpressandco.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.8, false, 'active', '2025-11-21T14:36:00';

-- Business 148: Rubavu Trading
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Trading', 'Rubavu Trading is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 744143681', 'info@rubavutrading.rw', 'www.rubavutrading.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 3.9, true, 'active', '2025-11-19T01:39:00';

-- Business 149: Huye Properties
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Properties', 'Huye Properties specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797041161', 'info@huyeproperties.rw', 'www.huyeproperties.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.7, true, 'active', '2025-11-16T05:23:00';

-- Business 150: Rubavu Solutions
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Solutions', 'Rubavu Solutions delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 757566915', 'info@rubavusolutions.rw', 'www.rubavusolutions.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.9, false, 'active', '2025-11-18T11:08:00';

-- Business 151: Huye Solutions Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Solutions Kigali', 'Huye Solutions Kigali delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 720760887', 'info@huyesolutionskigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 5.0, true, 'active', '2025-11-26T17:34:00';

-- Business 152: Gisenyi Theater & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Theater & Co', 'Gisenyi Theater & Co is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 723567065', 'info@gisenyitheaterandco.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.2, false, 'active', '2025-11-22T02:11:00';

-- Business 153: Musanze Digital Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Digital Kigali', 'Musanze Digital Kigali drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 765949617', 'info@musanzedigitalkigali.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.7, true, 'active', '2025-11-19T13:20:00';

-- Business 154: Akagera Bistro
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Bistro', 'Akagera Bistro offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 748182549', 'info@akagerabistro.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.8, true, 'active', '2025-11-07T18:59:00';

-- Business 155: Kigali Realty Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Realty Kigali', 'Kigali Realty Kigali specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 743241296', 'info@kigalirealtykigali.rw', 'www.kigalirealtykigali.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.5, true, 'active', '2025-11-02T20:44:00';

-- Business 156: Kigali Pharmacy & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Pharmacy & Co', 'Kigali Pharmacy & Co provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 735432266', 'info@kigalipharmacyandco.rw', 'www.kigalipharmacyandco.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.5, true, 'active', '2025-11-03T09:40:00';

-- Business 157: Akagera Medical Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Medical Center', 'Akagera Medical Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 776039393', 'info@akageramedicalcenter.rw', NULL, (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.7, false, 'active', '2025-11-09T06:41:00';

-- Business 158: Muhanga Bistro
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Bistro', 'Muhanga Bistro offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 780187920', 'info@muhangabistro.rw', 'www.muhangabistro.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.3, true, 'active', '2025-11-07T02:42:00';

-- Business 159: Musanze Solutions
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Solutions', 'Musanze Solutions delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Kimihurura, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 767560903', 'info@musanzesolutions.rw', 'www.musanzesolutions.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.2, true, 'active', '2025-11-11T05:23:00';

-- Business 160: Akagera Grill Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Grill Ltd', 'Akagera Grill Ltd offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727555932', 'info@akageragrillltd.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.7, true, 'active', '2025-11-03T05:37:00';

-- Business 161: Muhanga Lounge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Lounge', 'Muhanga Lounge is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729706201', 'info@muhangalounge.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.0, false, 'active', '2025-11-11T10:51:00';

-- Business 162: Virunga Club
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Club', 'Virunga Club is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 785431469', 'info@virungaclub.rw', 'www.virungaclub.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.4, true, 'active', '2025-11-05T13:54:00';

-- Business 163: Rubavu Resort Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Resort Rwanda', 'Rubavu Resort Rwanda provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 766709817', 'info@rubavuresortrwanda.rw', 'www.rubavuresortrwanda.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.2, false, 'active', '2025-11-13T07:02:00';

-- Business 164: Akagera Grill
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Akagera Grill', 'Akagera Grill offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 739514200', 'info@akageragrill.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.7, true, 'active', '2025-11-19T00:40:00';

-- Business 165: Kivu Brasserie
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Brasserie', 'Kivu Brasserie offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 765481030', 'info@kivubrasserie.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.8, false, 'active', '2025-11-04T07:02:00';

-- Business 166: Rusizi Developers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Developers', 'Rusizi Developers specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 752964814', 'info@rusizidevelopers.rw', 'www.rusizidevelopers.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 5.0, true, 'active', '2025-11-02T09:40:00';

-- Business 167: Gisenyi Institute
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Institute', 'Gisenyi Institute offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 753332834', 'info@gisenyiinstitute.rw', 'www.gisenyiinstitute.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.5, true, 'active', '2025-11-02T23:48:00';

-- Business 168: Rusizi Boutique
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Boutique', 'Rusizi Boutique is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Kibagabaga, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781419681', 'info@rusiziboutique.rw', 'www.rusiziboutique.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.0, true, 'active', '2025-11-22T22:07:00';

-- Business 169: Nyanza Solutions
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Solutions', 'Nyanza Solutions delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 737401331', 'info@nyanzasolutions.rw', 'www.nyanzasolutions.rw', (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 4.8, true, 'active', '2025-11-06T18:56:00';

-- Business 170: Kivu Logistics Ltd
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Logistics Ltd', 'Kivu Logistics Ltd offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 745538111', 'info@kivulogisticsltd.rw', 'www.kivulogisticsltd.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.4, true, 'active', '2025-11-03T15:35:00';

-- Business 171: Gisenyi Transport Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Transport Group', 'Gisenyi Transport Group offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 753158404', 'info@gisenyitransportgroup.rw', 'www.gisenyitransportgroup.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.9, true, 'active', '2025-11-19T17:06:00';

-- Business 172: Muhanga Tavern
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Tavern', 'Muhanga Tavern offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730035803', 'info@muhangatavern.rw', 'www.muhangatavern.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.7, true, 'active', '2025-11-03T07:52:00';

-- Business 173: Musanze Medical Center Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Medical Center Kigali', 'Musanze Medical Center Kigali provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 726252235', 'info@musanzemedicalcenterkigali.rw', 'www.musanzemedicalcenterkigali.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.0, true, 'active', '2025-11-10T20:44:00';

-- Business 174: Rubavu Housing Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rubavu Housing Rwanda', 'Rubavu Housing Rwanda specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 797870554', 'info@rubavuhousingrwanda.rw', NULL, (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.0, false, 'active', '2025-11-03T11:20:00';

-- Business 175: Gisenyi Gallery
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Gallery', 'Gisenyi Gallery is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 725041117', 'info@gisenyigallery.rw', 'www.gisenyigallery.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.4, true, 'active', '2025-11-26T07:54:00';

-- Business 176: Nyanza Movers & Co
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Movers & Co', 'Nyanza Movers & Co offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 741044296', 'info@nyanzamoversandco.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.8, false, 'active', '2025-11-01T06:39:00';

-- Business 177: Nyanza Tech
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza Tech', 'Nyanza Tech drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 769584830', 'info@nyanzatech.rw', NULL, (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.5, false, 'active', '2025-11-16T23:34:00';

-- Business 178: Kigali Transit
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Transit', 'Kigali Transit offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 743860853', 'info@kigalitransit.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.8, true, 'active', '2025-11-07T01:00:00';

-- Business 179: Musanze Market
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Market', 'Musanze Market is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 786429789', 'info@musanzemarket.rw', NULL, (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.6, false, 'active', '2025-11-02T12:34:00';

-- Business 180: Rusizi Clinic
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Rusizi Clinic', 'Rusizi Clinic provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 759491560', 'info@rusiziclinic.rw', 'www.rusiziclinic.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 3.6, true, 'active', '2025-11-13T17:29:00';

-- Business 181: Gisenyi Tech Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Tech Group', 'Gisenyi Tech Group drives innovation in Rwanda''s tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 756268309', 'info@gisenyitechgroup.rw', 'www.gisenyitechgroup.rw', (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 4.1, true, 'active', '2025-11-08T12:07:00';

-- Business 182: Muhanga Training Center Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Training Center Rwanda', 'Muhanga Training Center Rwanda offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 791422600', 'info@muhangatrainingcenterrwanda.rw', 'www.muhangatrainingcenterrwanda.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 3.7, true, 'active', '2025-11-06T01:23:00';

-- Business 183: Muhanga Mart
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Mart', 'Muhanga Mart is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 727770948', 'info@muhangamart.rw', 'www.muhangamart.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.4, true, 'active', '2025-11-14T13:00:00';

-- Business 184: Kigali Transit Group
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Transit Group', 'Kigali Transit Group offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 730813240', 'info@kigalitransitgroup.rw', 'www.kigalitransitgroup.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.3, true, 'active', '2025-11-26T07:23:00';

-- Business 185: Musanze Emporium
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Emporium', 'Musanze Emporium is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.', 'Gikondo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729427422', 'info@musanzeemporium.rw', 'www.musanzeemporium.rw', (SELECT id FROM categories WHERE name = 'Retail' LIMIT 1), 4.5, true, 'active', '2025-11-01T20:02:00';

-- Business 186: Virunga Tavern
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Tavern', 'Virunga Tavern offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Remera, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 729969386', 'info@virungatavern.rw', NULL, (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 4.9, true, 'active', '2025-11-22T23:50:00';

-- Business 187: Butare Consulting
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Consulting', 'Butare Consulting delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 766267395', 'info@butareconsulting.rw', NULL, (SELECT id FROM categories WHERE name = 'Services' LIMIT 1), 3.8, true, 'active', '2025-11-12T16:03:00';

-- Business 188: Muhanga School Rwanda
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga School Rwanda', 'Muhanga School Rwanda offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 753816597', 'info@muhangaschoolrwanda.rw', 'www.muhangaschoolrwanda.rw', (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.7, false, 'active', '2025-11-23T04:38:00';

-- Business 189: Gisenyi Lounge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Lounge', 'Gisenyi Lounge is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 755141540', 'info@gisenyilounge.rw', 'www.gisenyilounge.rw', (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.5, true, 'active', '2025-11-16T07:15:00';

-- Business 190: Kigali Health Center
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kigali Health Center', 'Kigali Health Center provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794355801', 'info@kigalihealthcenter.rw', 'www.kigalihealthcenter.rw', (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1), 4.4, true, 'active', '2025-11-22T22:44:00';

-- Business 191: Virunga Lounge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Virunga Lounge', 'Virunga Lounge is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 755412393', 'info@virungalounge.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 3.9, false, 'active', '2025-11-01T07:59:00';

-- Business 192: Gisenyi Movers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Movers', 'Gisenyi Movers offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Nyarutarama, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 773838340', 'info@gisenyimovers.rw', NULL, (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 4.9, true, 'active', '2025-11-24T07:12:00';

-- Business 193: Huye Brasserie
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Huye Brasserie', 'Huye Brasserie offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 737670191', 'info@huyebrasserie.rw', 'www.huyebrasserie.rw', (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1), 3.7, false, 'active', '2025-11-02T06:44:00';

-- Business 194: Gisenyi Lodge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Gisenyi Lodge', 'Gisenyi Lodge provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.', 'Kacyiru, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 751080937', 'info@gisenyilodge.rw', 'www.gisenyilodge.rw', (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1), 4.9, true, 'active', '2025-11-22T22:53:00';

-- Business 195: Kivu Realty
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Kivu Realty', 'Kivu Realty specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyarugenge, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 763686114', 'info@kivurealty.rw', 'www.kivurealty.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.0, true, 'active', '2025-11-18T22:23:00';

-- Business 196: Nyanza College
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Nyanza College', 'Nyanza College offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 794091197', 'info@nyanzacollege.rw', NULL, (SELECT id FROM categories WHERE name = 'Education' LIMIT 1), 4.3, true, 'active', '2025-11-28T05:31:00';

-- Business 197: Butare Properties
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Properties', 'Butare Properties specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 732822307', 'info@butareproperties.rw', 'www.butareproperties.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 4.6, false, 'active', '2025-11-25T00:19:00';

-- Business 198: Butare Movers
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Butare Movers', 'Butare Movers offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs.', 'Kicukiro, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 781137698', 'info@butaremovers.rw', 'www.butaremovers.rw', (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1), 3.6, true, 'active', '2025-11-14T19:52:00';

-- Business 199: Muhanga Housing Kigali
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Muhanga Housing Kigali', 'Muhanga Housing Kigali specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.', 'Nyabugogo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 762701294', 'info@muhangahousingkigali.rw', 'www.muhangahousingkigali.rw', (SELECT id FROM categories WHERE name = 'Real Estate' LIMIT 1), 3.6, true, 'active', '2025-11-08T03:52:00';

-- Business 200: Musanze Lounge
INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)
SELECT 'Musanze Lounge', 'Musanze Lounge is Kigali''s premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.', 'Gasabo, Kigali', 
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  '+250 758720669', 'info@musanzelounge.rw', NULL, (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 4.5, true, 'active', '2025-11-10T09:09:00';


-- Total: 200 additional businesses imported

-- ============================================================================
-- IMPORT ADDITIONAL EVENTS
-- ============================================================================

-- Event 1: Rwanda Health Club Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Health Club Night', 'Join us for Rwanda Health Club Night at Kigali Conference Centre. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-27T14:00:00', '2025-12-27T16:00:00',
  'Kigali Conference Centre', 'Kigali Conference Centre, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Innovation Rwanda', 'https://sinc.events/event/49', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-22T18:03:00';

-- Event 2: Exhibition: Entrepreneurship
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Exhibition: Entrepreneurship', 'Join us for Exhibition: Entrepreneurship at The Retreat. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-30T10:00:00', '2025-12-30T12:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Impact Rwanda', 'https://sinc.events/event/50', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-19T15:05:00';

-- Event 3: Kigali Health Exhibition
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Health Exhibition', 'Join us for Kigali Health Exhibition at Papyrus Restaurant. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-04T18:00:00', '2025-12-04T23:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Rwanda Tech Community', 'https://sinc.events/event/51', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-20T14:40:00';

-- Event 4: Rwanda Coffee Networking
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Coffee Networking', 'Join us for Rwanda Coffee Networking at Century Cinema. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-27T18:00:00', '2026-02-27T20:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Rwanda Tech Community', 'https://sinc.events/event/52', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-18T05:21:00';

-- Event 5: Rwanda Community DJ Set
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Community DJ Set', 'Join us for Rwanda Community DJ Set at Serena Hotel Kigali. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-07T18:00:00', '2026-01-07T23:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Community Connect', 'https://sinc.events/event/53', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-03T19:06:00';

-- Event 6: Sustainability BBQ
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Sustainability BBQ', 'Join us for Sustainability BBQ at Century Cinema. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-15T17:00:00', '2026-02-15T23:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Kigali Events', 'https://sinc.events/event/54', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-02T01:48:00';

-- Event 7: Digital Fitness Challenge 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Digital Fitness Challenge 2026', 'Join us for Digital Fitness Challenge 2026 at Lemigo Hotel. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-08T10:00:00', '2026-01-08T16:00:00',
  'Lemigo Hotel', 'Lemigo Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Innovation Rwanda', 'https://sinc.events/event/55', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-17T04:38:00';

-- Event 8: Dance Party
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Dance Party', 'Join us for Dance Party at Inema Arts Center. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-07T19:00:00', '2026-02-08T01:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Impact Rwanda', 'https://sinc.events/event/56', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-17T19:07:00';

-- Event 9: Blockchain Masterclass 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Blockchain Masterclass 2025', 'Join us for Blockchain Masterclass 2025 at Century Cinema. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-18T18:00:00', '2026-02-18T21:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Kigali Events', 'https://sinc.events/event/57', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-23T15:29:00';

-- Event 10: Rwanda Leadership Community Event
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Leadership Community Event', 'Join us for Rwanda Leadership Community Event at Norrsken House Kigali. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-23T19:00:00', '2026-01-23T21:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Kigali Social Club', 'https://sinc.events/event/58', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-04T16:47:00';

-- Event 11: Meditation Concert 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Meditation Concert 2025', 'Join us for Meditation Concert 2025 at Kigali Marriott Hotel. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-26T14:00:00', '2026-01-26T16:00:00',
  'Kigali Marriott Hotel', 'Kigali Marriott Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Arts Collective Rwanda', 'https://sinc.events/event/59', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-01T16:46:00';

-- Event 12: Kigali Wine Meetup
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Wine Meetup', 'Join us for Kigali Wine Meetup at Inema Arts Center. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-16T18:00:00', '2025-12-17T00:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Innovation Rwanda', 'https://sinc.events/event/60', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-21T05:33:00';

-- Event 13: Innovation DJ Set
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Innovation DJ Set', 'Join us for Innovation DJ Set at Century Cinema. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-09T17:00:00', '2025-12-09T21:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Creative Hub', 'https://sinc.events/event/61', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-08T12:07:00';

-- Event 14: Conference: Business
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Conference: Business', 'Join us for Conference: Business at Papyrus Restaurant. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-19T21:00:00', '2026-02-19T23:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Rwanda Business Forum', 'https://sinc.events/event/62', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-01T13:01:00';

-- Event 15: Rwanda Charity Pitch Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Charity Pitch Night', 'Join us for Rwanda Charity Pitch Night at Lemigo Hotel. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-21T10:00:00', '2025-12-21T12:00:00',
  'Lemigo Hotel', 'Lemigo Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Rwanda Business Forum', 'https://sinc.events/event/63', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-28T09:57:00';

-- Event 16: Kigali Charity DJ Set
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Charity DJ Set', 'Join us for Kigali Charity DJ Set at Impact Hub Kigali. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-10T20:00:00', '2025-12-10T22:00:00',
  'Impact Hub Kigali', 'Impact Hub Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Rwanda Tech Community', 'https://sinc.events/event/64', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-28T17:06:00';

-- Event 17: Kigali Digital Celebration
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Digital Celebration', 'Join us for Kigali Digital Celebration at Kigali Conference Centre. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-14T20:00:00', '2025-12-15T02:00:00',
  'Kigali Conference Centre', 'Kigali Conference Centre, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Kigali Events', 'https://sinc.events/event/65', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-07T16:56:00';

-- Event 18: Kigali Education Acoustic Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Education Acoustic Night', 'Join us for Kigali Education Acoustic Night at Kigali Arena. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-23T20:00:00', '2026-02-23T23:00:00',
  'Kigali Arena', 'Kigali Arena, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Impact Rwanda', 'https://sinc.events/event/66', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-17T03:49:00';

-- Event 19: Rwanda Community Wine Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Community Wine Night', 'Join us for Rwanda Community Wine Night at Inema Arts Center. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-27T19:00:00', '2026-02-28T00:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Business Forum', 'https://sinc.events/event/67', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-15T06:49:00';

-- Event 20: Rwanda Meditation Tutorial
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Meditation Tutorial', 'Join us for Rwanda Meditation Tutorial at Radisson Blu Hotel. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-12T18:00:00', '2026-01-12T22:00:00',
  'Radisson Blu Hotel', 'Radisson Blu Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Rwanda Business Forum', 'https://sinc.events/event/68', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-14T14:12:00';

-- Event 21: Rwanda Youth Club Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Youth Club Night', 'Join us for Rwanda Youth Club Night at Heaven Restaurant. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-15T20:00:00', '2025-12-16T01:00:00',
  'Heaven Restaurant', 'Heaven Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Innovation Rwanda', 'https://sinc.events/event/69', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-14T04:19:00';

-- Event 22: Rwanda AI Seminar
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda AI Seminar', 'Join us for Rwanda AI Seminar at Kigali Arena. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-09T18:00:00', '2025-12-09T20:00:00',
  'Kigali Arena', 'Kigali Arena, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Kigali Social Club', 'https://sinc.events/event/70', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-26T11:54:00';

-- Event 23: Kigali Social Impact Band Performance
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Social Impact Band Performance', 'Join us for Kigali Social Impact Band Performance at kLab Rwanda. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-19T10:00:00', '2025-12-19T13:00:00',
  'kLab Rwanda', 'kLab Rwanda, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Impact Rwanda', 'https://sinc.events/event/71', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-07T17:57:00';

-- Event 24: Yoga Yoga Session 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Yoga Yoga Session 2025', 'Join us for Yoga Yoga Session 2025 at Serena Hotel Kigali. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-14T10:00:00', '2026-01-14T13:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Innovation Rwanda', 'https://sinc.events/event/72', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-02T16:26:00';

-- Event 25: Wine Night: Social Impact
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Wine Night: Social Impact', 'Join us for Wine Night: Social Impact at Papyrus Restaurant. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-26T17:00:00', '2026-01-26T19:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Kigali Social Club', 'https://sinc.events/event/73', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-16T17:17:00';

-- Event 26: Health Tasting 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Health Tasting 2025', 'Join us for Health Tasting 2025 at Lemigo Hotel. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-24T21:00:00', '2026-02-25T03:00:00',
  'Lemigo Hotel', 'Lemigo Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Business Forum', 'https://sinc.events/event/74', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-05T23:27:00';

-- Event 27: Rwanda Health Art Show
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Health Art Show', 'Join us for Rwanda Health Art Show at Inema Arts Center. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-11T14:00:00', '2026-01-11T18:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Arts Collective Rwanda', 'https://sinc.events/event/75', 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-09T13:34:00';

-- Event 28: Rwanda Sustainability Performance
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Sustainability Performance', 'Join us for Rwanda Sustainability Performance at Norrsken House Kigali. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-07T20:00:00', '2025-12-08T02:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Creative Hub', 'https://sinc.events/event/76', 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-22T16:52:00';

-- Event 29: Kigali Coffee Jam Session
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Coffee Jam Session', 'Join us for Kigali Coffee Jam Session at The Retreat. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-27T18:00:00', '2025-12-27T22:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Innovation Rwanda', 'https://sinc.events/event/77', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-03T11:20:00';

-- Event 30: Food Festival: Dance
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Food Festival: Dance', 'Join us for Food Festival: Dance at Ivuka Arts Center. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-07T18:00:00', '2026-01-07T23:00:00',
  'Ivuka Arts Center', 'Ivuka Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Business Forum', 'https://sinc.events/event/78', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-23T08:24:00';

-- Event 31: Charity Course
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Charity Course', 'Join us for Charity Course at Norrsken House Kigali. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-12T18:00:00', '2025-12-12T20:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Rwanda Business Forum', 'https://sinc.events/event/79', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-08T15:24:00';

-- Event 32: Concert: Art
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Concert: Art', 'Join us for Concert: Art at The Retreat. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-25T17:00:00', '2026-02-25T19:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Rwanda Business Forum', 'https://sinc.events/event/80', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-16T07:52:00';

-- Event 33: Rwanda Charity Seminar
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Charity Seminar', 'Join us for Rwanda Charity Seminar at Radisson Blu Hotel. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-21T10:00:00', '2026-01-21T16:00:00',
  'Radisson Blu Hotel', 'Radisson Blu Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Kigali Events', 'https://sinc.events/event/81', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-23T00:17:00';

-- Event 34: AI DJ Night 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'AI DJ Night 2026', 'Join us for AI DJ Night 2026 at kLab Rwanda. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-29T17:00:00', '2026-01-29T23:00:00',
  'kLab Rwanda', 'kLab Rwanda, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Rwanda Business Forum', 'https://sinc.events/event/82', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-25T19:48:00';

-- Event 35: Kigali Fitness Tournament
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Fitness Tournament', 'Join us for Kigali Fitness Tournament at Kigali Marriott Hotel. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-08T20:00:00', '2026-02-09T02:00:00',
  'Kigali Marriott Hotel', 'Kigali Marriott Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Impact Rwanda', 'https://sinc.events/event/83', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-06T14:04:00';

-- Event 36: Kigali Fitness Fitness Challenge
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Fitness Fitness Challenge', 'Join us for Kigali Fitness Fitness Challenge at Ivuka Arts Center. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-10T20:00:00', '2025-12-11T01:00:00',
  'Ivuka Arts Center', 'Ivuka Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Rwanda Business Forum', 'https://sinc.events/event/84', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-17T11:07:00';

-- Event 37: Competition: Art
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Competition: Art', 'Join us for Competition: Art at Heaven Restaurant. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-21T17:00:00', '2025-12-21T21:00:00',
  'Heaven Restaurant', 'Heaven Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Rwanda Youth Network', 'https://sinc.events/event/85', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-10T09:32:00';

-- Event 38: Marketing Summit 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Marketing Summit 2026', 'Join us for Marketing Summit 2026 at Inema Arts Center. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-18T18:00:00', '2026-01-19T00:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Rwanda Tech Community', 'https://sinc.events/event/86', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-03T09:31:00';

-- Event 39: Wellness Exhibition
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Wellness Exhibition', 'Join us for Wellness Exhibition at Impact Hub Kigali. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-14T17:00:00', '2026-02-14T23:00:00',
  'Impact Hub Kigali', 'Impact Hub Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Impact Rwanda', 'https://sinc.events/event/87', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-03T06:13:00';

-- Event 40: Meditation Food Festival 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Meditation Food Festival 2025', 'Join us for Meditation Food Festival 2025 at The Retreat. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-09T17:00:00', '2026-01-09T19:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Impact Rwanda', 'https://sinc.events/event/88', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-17T18:55:00';

-- Event 41: Performance: Fashion
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Performance: Fashion', 'Join us for Performance: Fashion at Serena Hotel Kigali. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-06T21:00:00', '2026-01-06T23:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Rwanda Youth Network', 'https://sinc.events/event/89', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-03T07:23:00';

-- Event 42: Rwanda Finance Acoustic Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Finance Acoustic Night', 'Join us for Rwanda Finance Acoustic Night at kLab Rwanda. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-16T20:00:00', '2025-12-16T22:00:00',
  'kLab Rwanda', 'kLab Rwanda, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Innovation Rwanda', 'https://sinc.events/event/90', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-24T15:13:00';

-- Event 43: Acoustic Night: Wellness
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Acoustic Night: Wellness', 'Join us for Acoustic Night: Wellness at Norrsken House Kigali. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-06T14:00:00', '2026-01-06T19:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Kigali Social Club', 'https://sinc.events/event/91', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-23T22:42:00';

-- Event 44: Leadership Food Festival 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Leadership Food Festival 2025', 'Join us for Leadership Food Festival 2025 at Radisson Blu Hotel. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-01T21:00:00', '2026-01-01T23:00:00',
  'Radisson Blu Hotel', 'Radisson Blu Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Youth Network', 'https://sinc.events/event/92', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-17T05:36:00';

-- Event 45: Marketing Fitness Challenge
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Marketing Fitness Challenge', 'Join us for Marketing Fitness Challenge at Norrsken House Kigali. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-16T10:00:00', '2025-12-16T15:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Arts Collective Rwanda', 'https://sinc.events/event/93', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-12T13:44:00';

-- Event 46: Meditation Club Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Meditation Club Night', 'Join us for Meditation Club Night at Ivuka Arts Center. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-03T21:00:00', '2026-01-04T01:00:00',
  'Ivuka Arts Center', 'Ivuka Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Rwanda Youth Network', 'https://sinc.events/event/94', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-24T01:59:00';

-- Event 47: Concert: Sustainability
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Concert: Sustainability', 'Join us for Concert: Sustainability at Kigali Arena. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-06T14:00:00', '2025-12-06T17:00:00',
  'Kigali Arena', 'Kigali Arena, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Rwanda Tech Community', 'https://sinc.events/event/95', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-13T02:39:00';

-- Event 48: Rwanda Music Bootcamp
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Music Bootcamp', 'Join us for Rwanda Music Bootcamp at Inema Arts Center. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-12T19:00:00', '2026-02-13T01:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Community Connect', 'https://sinc.events/event/96', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-09T17:54:00';

-- Event 49: Finance Music Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Finance Music Festival', 'Join us for Finance Music Festival at Kigali Arena. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-06T14:00:00', '2026-01-06T17:00:00',
  'Kigali Arena', 'Kigali Arena, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Rwanda Tech Community', 'https://sinc.events/event/97', 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-08T04:47:00';

-- Event 50: Seminar: Fitness
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Seminar: Fitness', 'Join us for Seminar: Fitness at Century Cinema. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-01T21:00:00', '2025-12-02T03:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Community Connect', 'https://sinc.events/event/98', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-13T14:21:00';

-- Event 51: Entrepreneurship Marathon 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Entrepreneurship Marathon 2025', 'Join us for Entrepreneurship Marathon 2025 at Heaven Restaurant. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-03T17:00:00', '2026-02-03T22:00:00',
  'Heaven Restaurant', 'Heaven Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Kigali Events', 'https://sinc.events/event/99', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-15T11:49:00';

-- Event 52: Meditation Rave
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Meditation Rave', 'Join us for Meditation Rave at Papyrus Restaurant. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-25T21:00:00', '2025-12-26T03:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Kigali Social Club', 'https://sinc.events/event/100', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-24T21:39:00';

-- Event 53: Yoga Session: Digital
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Yoga Session: Digital', 'Join us for Yoga Session: Digital at Lemigo Hotel. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-24T18:00:00', '2025-12-24T21:00:00',
  'Lemigo Hotel', 'Lemigo Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Impact Rwanda', 'https://sinc.events/event/101', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-16T17:56:00';

-- Event 54: Rwanda Innovation Cooking Class
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Innovation Cooking Class', 'Join us for Rwanda Innovation Cooking Class at Radisson Blu Hotel. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-13T17:00:00', '2026-01-13T20:00:00',
  'Radisson Blu Hotel', 'Radisson Blu Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Tech Community', 'https://sinc.events/event/102', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-24T00:02:00';

-- Event 55: Meditation Festival 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Meditation Festival 2026', 'Join us for Meditation Festival 2026 at Serena Hotel Kigali. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-19T17:00:00', '2025-12-19T21:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Kigali Social Club', 'https://sinc.events/event/103', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-19T15:51:00';

-- Event 56: Kigali Business Wine Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Business Wine Night', 'Join us for Kigali Business Wine Night at kLab Rwanda. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-08T10:00:00', '2025-12-08T15:00:00',
  'kLab Rwanda', 'kLab Rwanda, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Arts Collective Rwanda', 'https://sinc.events/event/104', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-27T01:02:00';

-- Event 57: Tech Night Out
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Tech Night Out', 'Join us for Tech Night Out at Inema Arts Center. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-25T14:00:00', '2026-02-25T18:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Kigali Events', 'https://sinc.events/event/105', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-11T18:18:00';

-- Event 58: Wellness Seminar 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Wellness Seminar 2026', 'Join us for Wellness Seminar 2026 at Norrsken House Kigali. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-26T10:00:00', '2026-02-26T14:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Rwanda Tech Community', 'https://sinc.events/event/106', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-16T06:41:00';

-- Event 59: Kigali Sports Concert
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Sports Concert', 'Join us for Kigali Sports Concert at Papyrus Restaurant. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-27T10:00:00', '2025-12-27T15:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Innovation Rwanda', 'https://sinc.events/event/107', 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-21T22:33:00';

-- Event 60: Leadership Performance
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Leadership Performance', 'Join us for Leadership Performance at Inema Arts Center. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-09T18:00:00', '2025-12-09T22:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Innovation Rwanda', 'https://sinc.events/event/108', 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-27T15:33:00';

-- Event 61: Rwanda Charity BBQ
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Charity BBQ', 'Join us for Rwanda Charity BBQ at The Retreat. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-10T19:00:00', '2026-02-10T22:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Kigali Social Club', 'https://sinc.events/event/109', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-19T07:34:00';

-- Event 62: Rwanda Innovation Performance
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Innovation Performance', 'Join us for Rwanda Innovation Performance at Century Cinema. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-06T19:00:00', '2026-01-06T22:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Rwanda Tech Community', 'https://sinc.events/event/110', 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-17T00:57:00';

-- Event 63: Kigali Entrepreneurship Tutorial
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Entrepreneurship Tutorial', 'Join us for Kigali Entrepreneurship Tutorial at Kigali Golf Club. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-05T10:00:00', '2026-01-05T13:00:00',
  'Kigali Golf Club', 'Kigali Golf Club, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Arts Collective Rwanda', 'https://sinc.events/event/111', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-08T14:01:00';

-- Event 64: Fashion Training
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Fashion Training', 'Join us for Fashion Training at Kigali Marriott Hotel. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-20T20:00:00', '2025-12-20T22:00:00',
  'Kigali Marriott Hotel', 'Kigali Marriott Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Rwanda Business Forum', 'https://sinc.events/event/112', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-09T20:40:00';

-- Event 65: Kigali Dance Celebration
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Dance Celebration', 'Join us for Kigali Dance Celebration at Kigali Arena. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-11T21:00:00', '2026-02-12T02:00:00',
  'Kigali Arena', 'Kigali Arena, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Community Connect', 'https://sinc.events/event/113', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-03T11:16:00';

-- Event 66: Tournament: Charity
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Tournament: Charity', 'Join us for Tournament: Charity at The Retreat. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-08T21:00:00', '2026-01-09T00:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Innovation Rwanda', 'https://sinc.events/event/114', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-26T01:06:00';

-- Event 67: Marketing Forum 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Marketing Forum 2025', 'Join us for Marketing Forum 2025 at Serena Hotel Kigali. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-11T17:00:00', '2026-02-11T21:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Rwanda Business Forum', 'https://sinc.events/event/115', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-08T03:58:00';

-- Event 68: Blockchain Concert 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Blockchain Concert 2026', 'Join us for Blockchain Concert 2026 at The Retreat. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-11T19:00:00', '2026-01-11T23:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Arts Collective Rwanda', 'https://sinc.events/event/116', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-14T14:57:00';

-- Event 69: Kigali Fitness BBQ
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Fitness BBQ', 'Join us for Kigali Fitness BBQ at Norrsken House Kigali. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-19T20:00:00', '2026-01-19T22:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Kigali Events', 'https://sinc.events/event/117', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-23T15:27:00';

-- Event 70: Kigali Blockchain Marathon
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Blockchain Marathon', 'Join us for Kigali Blockchain Marathon at Norrsken House Kigali. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-28T17:00:00', '2026-01-28T22:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Rwanda Youth Network', 'https://sinc.events/event/118', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-11T13:44:00';

-- Event 71: Kigali Fashion Pitch Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Fashion Pitch Night', 'Join us for Kigali Fashion Pitch Night at The Retreat. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-02T14:00:00', '2026-01-02T17:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Kigali Events', 'https://sinc.events/event/119', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-25T09:21:00';

-- Event 72: Rwanda Marketing Theater
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Marketing Theater', 'Join us for Rwanda Marketing Theater at Papyrus Restaurant. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-21T19:00:00', '2026-02-21T23:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Kigali Social Club', 'https://sinc.events/event/120', 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-19T06:33:00';

-- Event 73: Fitness Fundraiser 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Fitness Fundraiser 2025', 'Join us for Fitness Fundraiser 2025 at Inema Arts Center. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-24T19:00:00', '2025-12-24T22:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Rwanda Tech Community', 'https://sinc.events/event/121', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-07T12:26:00';

-- Event 74: Seminar: Startup
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Seminar: Startup', 'Join us for Seminar: Startup at Inema Arts Center. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-11T20:00:00', '2025-12-11T23:00:00',
  'Inema Arts Center', 'Inema Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Community Connect', 'https://sinc.events/event/122', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-15T02:03:00';

-- Event 75: Education Seminar 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Education Seminar 2025', 'Join us for Education Seminar 2025 at Norrsken House Kigali. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-30T17:00:00', '2025-12-30T19:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Arts Collective Rwanda', 'https://sinc.events/event/123', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 100, true, 'upcoming', '2025-11-20T02:35:00';

-- Event 76: Kigali Art Brunch
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Art Brunch', 'Join us for Kigali Art Brunch at Impact Hub Kigali. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-07T21:00:00', '2026-01-08T00:00:00',
  'Impact Hub Kigali', 'Impact Hub Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Business Forum', 'https://sinc.events/event/124', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-01T10:35:00';

-- Event 77: Marketing Brunch 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Marketing Brunch 2026', 'Join us for Marketing Brunch 2026 at Norrsken House Kigali. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-20T20:00:00', '2026-02-20T23:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Impact Rwanda', 'https://sinc.events/event/125', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-22T13:50:00';

-- Event 78: Concert: Charity
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Concert: Charity', 'Join us for Concert: Charity at Radisson Blu Hotel. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-21T21:00:00', '2025-12-22T02:00:00',
  'Radisson Blu Hotel', 'Radisson Blu Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Kigali Social Club', 'https://sinc.events/event/126', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-27T02:15:00';

-- Event 79: Kigali Art Workshop
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Art Workshop', 'Join us for Kigali Art Workshop at Impact Hub Kigali. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-24T21:00:00', '2025-12-25T00:00:00',
  'Impact Hub Kigali', 'Impact Hub Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Kigali Social Club', 'https://sinc.events/event/127', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-07T00:39:00';

-- Event 80: Rwanda Digital Charity Event
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Digital Charity Event', 'Join us for Rwanda Digital Charity Event at Kigali Golf Club. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-06T18:00:00', '2025-12-06T22:00:00',
  'Kigali Golf Club', 'Kigali Golf Club, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Kigali Social Club', 'https://sinc.events/event/128', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-12T12:31:00';

-- Event 81: Rwanda Culture Conference
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Culture Conference', 'Join us for Rwanda Culture Conference at Century Cinema. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-31T19:00:00', '2026-01-01T01:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Innovation Rwanda', 'https://sinc.events/event/129', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-21T14:39:00';

-- Event 82: Education Concert 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Education Concert 2025', 'Join us for Education Concert 2025 at The Retreat. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-05T21:00:00', '2026-02-06T02:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Impact Rwanda', 'https://sinc.events/event/130', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-01T16:47:00';

-- Event 83: Entrepreneurship Masterclass
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Entrepreneurship Masterclass', 'Join us for Entrepreneurship Masterclass at Papyrus Restaurant. This education & workshops event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-16T10:00:00', '2026-02-16T12:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Education & Workshops', 'Community Connect', 'https://sinc.events/event/131', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', ARRAY['education', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-05T02:42:00';

-- Event 84: Rwanda Yoga Acoustic Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Yoga Acoustic Night', 'Join us for Rwanda Yoga Acoustic Night at Ivuka Arts Center. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-09T21:00:00', '2026-02-10T00:00:00',
  'Ivuka Arts Center', 'Ivuka Arts Center, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Impact Rwanda', 'https://sinc.events/event/132', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-22T20:05:00';

-- Event 85: Kigali Finance Marathon
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Finance Marathon', 'Join us for Kigali Finance Marathon at Kigali Golf Club. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-29T14:00:00', '2026-01-29T18:00:00',
  'Kigali Golf Club', 'Kigali Golf Club, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Kigali Social Club', 'https://sinc.events/event/133', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-26T02:33:00';

-- Event 86: Yoga Summit
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Yoga Summit', 'Join us for Yoga Summit at Serena Hotel Kigali. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-30T19:00:00', '2025-12-31T01:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Innovation Rwanda', 'https://sinc.events/event/134', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 50, true, 'upcoming', '2025-11-20T14:17:00';

-- Event 87: Kigali Finance Acoustic Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Finance Acoustic Night', 'Join us for Kigali Finance Acoustic Night at Kigali Marriott Hotel. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-04T21:00:00', '2026-02-05T01:00:00',
  'Kigali Marriott Hotel', 'Kigali Marriott Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Kigali Social Club', 'https://sinc.events/event/135', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-25T08:51:00';

-- Event 88: Yoga Celebration 2025
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Yoga Celebration 2025', 'Join us for Yoga Celebration 2025 at Serena Hotel Kigali. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-26T19:00:00', '2025-12-27T01:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Kigali Events', 'https://sinc.events/event/136', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-22T15:48:00';

-- Event 89: Education Cooking Class
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Education Cooking Class', 'Join us for Education Cooking Class at Century Cinema. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-25T20:00:00', '2026-01-25T22:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Rwanda Youth Network', 'https://sinc.events/event/137', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-18T14:55:00';

-- Event 90: Rwanda Digital Fitness Challenge
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Digital Fitness Challenge', 'Join us for Rwanda Digital Fitness Challenge at kLab Rwanda. This sports & fitness event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-10T17:00:00', '2026-02-10T23:00:00',
  'kLab Rwanda', 'kLab Rwanda, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Sports & Fitness', 'Community Connect', 'https://sinc.events/event/138', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', ARRAY['sports', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-24T00:18:00';

-- Event 91: Wine Night: Business
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Wine Night: Business', 'Join us for Wine Night: Business at Radisson Blu Hotel. This food & drink event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-27T10:00:00', '2026-01-27T16:00:00',
  'Radisson Blu Hotel', 'Radisson Blu Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Food & Drink', 'Creative Hub', 'https://sinc.events/event/139', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['food', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-01T10:53:00';

-- Event 92: Rwanda Digital Theater
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Digital Theater', 'Join us for Rwanda Digital Theater at Papyrus Restaurant. This arts & culture event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-17T14:00:00', '2026-02-17T20:00:00',
  'Papyrus Restaurant', 'Papyrus Restaurant, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Arts & Culture', 'Rwanda Business Forum', 'https://sinc.events/event/140', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['arts', 'kigali', 'rwanda', 'event'], 250, true, 'upcoming', '2025-11-22T14:24:00';

-- Event 93: Rwanda Finance Summit
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Finance Summit', 'Join us for Rwanda Finance Summit at Lemigo Hotel. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-07T20:00:00', '2026-02-07T22:00:00',
  'Lemigo Hotel', 'Lemigo Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Rwanda Youth Network', 'https://sinc.events/event/141', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 150, true, 'upcoming', '2025-11-11T17:31:00';

-- Event 94: Entrepreneurship Live Music
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Entrepreneurship Live Music', 'Join us for Entrepreneurship Live Music at Century Cinema. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-27T19:00:00', '2026-02-27T22:00:00',
  'Century Cinema', 'Century Cinema, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Rwanda Business Forum', 'https://sinc.events/event/142', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-04T11:39:00';

-- Event 95: Rwanda Music Acoustic Night
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rwanda Music Acoustic Night', 'Join us for Rwanda Music Acoustic Night at Kigali Marriott Hotel. This music & concerts event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-21T21:00:00', '2025-12-22T01:00:00',
  'Kigali Marriott Hotel', 'Kigali Marriott Hotel, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Music & Concerts', 'Kigali Social Club', 'https://sinc.events/event/143', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', ARRAY['music', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-04T15:49:00';

-- Event 96: Kigali Social Impact Community Event
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Social Impact Community Event', 'Join us for Kigali Social Impact Community Event at The Retreat. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2025-12-26T17:00:00', '2025-12-26T23:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Rwanda Tech Community', 'https://sinc.events/event/144', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-20T02:14:00';

-- Event 97: AI Social Gathering 2026
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'AI Social Gathering 2026', 'Join us for AI Social Gathering 2026 at Norrsken House Kigali. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-11T14:00:00', '2026-02-11T17:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Rwanda Youth Network', 'https://sinc.events/event/145', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 75, true, 'upcoming', '2025-11-02T16:37:00';

-- Event 98: Yoga Charity Event
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Yoga Charity Event', 'Join us for Yoga Charity Event at The Retreat. This community & social event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-30T20:00:00', '2026-01-31T02:00:00',
  'The Retreat', 'The Retreat, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Community & Social', 'Creative Hub', 'https://sinc.events/event/146', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', ARRAY['community', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-13T17:41:00';

-- Event 99: Kigali Youth Rave
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kigali Youth Rave', 'Join us for Kigali Youth Rave at Serena Hotel Kigali. This nightlife & parties event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-02-15T19:00:00', '2026-02-16T01:00:00',
  'Serena Hotel Kigali', 'Serena Hotel Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Nightlife & Parties', 'Creative Hub', 'https://sinc.events/event/147', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', ARRAY['nightlife', 'kigali', 'rwanda', 'event'], 200, true, 'upcoming', '2025-11-23T21:42:00';

-- Event 100: Meetup: Digital
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Meetup: Digital', 'Join us for Meetup: Digital at Norrsken House Kigali. This business & networking event brings together enthusiasts and professionals for an unforgettable experience. Don''t miss this opportunity to connect, learn, and enjoy!', 
  '2026-01-20T17:00:00', '2026-01-20T21:00:00',
  'Norrsken House Kigali', 'Norrsken House Kigali, Kigali, Rwanda',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),
  'Business & Networking', 'Kigali Events', 'https://sinc.events/event/148', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', ARRAY['business', 'kigali', 'rwanda', 'event'], 300, true, 'upcoming', '2025-11-20T08:22:00';


-- Total: 100 additional events imported

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check totals
SELECT 
  'Businesses' as type,
  COUNT(*) as total
FROM businesses 
WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda')

UNION ALL

SELECT 
  'Events' as type,
  COUNT(*) as total
FROM events 
WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');
