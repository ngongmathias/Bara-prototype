-- Seed Dummy Marketplace Listings for Rwanda
-- For testing marketplace layouts and functionality

-- Get Rwanda country ID
DO $$
DECLARE
  rwanda_id UUID;
  motors_cat_id UUID;
  property_sale_cat_id UUID;
  property_rent_cat_id UUID;
  jobs_cat_id UUID;
  classifieds_cat_id UUID;
  
  used_cars_subcat_id UUID;
  apartments_sale_subcat_id UUID;
  villas_sale_subcat_id UUID;
  apartments_rent_subcat_id UUID;
  sales_jobs_subcat_id UUID;
  electronics_subcat_id UUID;
BEGIN
  -- Get Rwanda ID
  SELECT id INTO rwanda_id FROM countries WHERE name = 'Rwanda' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO motors_cat_id FROM marketplace_categories WHERE slug = 'motors';
  SELECT id INTO property_sale_cat_id FROM marketplace_categories WHERE slug = 'property-sale';
  SELECT id INTO property_rent_cat_id FROM marketplace_categories WHERE slug = 'property-rent';
  SELECT id INTO jobs_cat_id FROM marketplace_categories WHERE slug = 'jobs';
  SELECT id INTO classifieds_cat_id FROM marketplace_categories WHERE slug = 'classifieds';
  
  -- Get subcategory IDs
  SELECT id INTO used_cars_subcat_id FROM marketplace_subcategories WHERE slug = 'used-cars' AND category_id = motors_cat_id;
  SELECT id INTO apartments_sale_subcat_id FROM marketplace_subcategories WHERE slug = 'apartments' AND category_id = property_sale_cat_id;
  SELECT id INTO villas_sale_subcat_id FROM marketplace_subcategories WHERE slug = 'villas' AND category_id = property_sale_cat_id;
  SELECT id INTO apartments_rent_subcat_id FROM marketplace_subcategories WHERE slug = 'apartments' AND category_id = property_rent_cat_id;
  SELECT id INTO sales_jobs_subcat_id FROM marketplace_subcategories WHERE slug = 'sales-business' AND category_id = jobs_cat_id;
  SELECT id INTO electronics_subcat_id FROM marketplace_subcategories WHERE slug = 'electronics' AND category_id = classifieds_cat_id;

  -- ============================================
  -- MOTORS - Used Cars
  -- ============================================
  
  -- Toyota RAV4 2020
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    motors_cat_id, used_cars_subcat_id, rwanda_id,
    'Toyota RAV4 2020 - Excellent Condition',
    'Well maintained Toyota RAV4 2020 model. Full service history, single owner. Perfect for family use.',
    28000, 'USD', 'negotiable',
    'John Mugisha', 'john.mugisha@email.com', '+250788123456', 'individual',
    'Kigali, Kicukiro', 'active', true
  );
  
  -- Add attributes for Toyota RAV4
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'make', 'Toyota' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'model', 'RAV4' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'year', '2020' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'kilometers', '45000' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'transmission', 'automatic' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'fuel_type', 'Petrol' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'color', 'Silver' FROM marketplace_listings WHERE title LIKE 'Toyota RAV4 2020%' LIMIT 1;

  -- Mercedes-Benz C-Class 2019
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    motors_cat_id, used_cars_subcat_id, rwanda_id,
    'Mercedes-Benz C-Class 2019 - Luxury Sedan',
    'Premium Mercedes-Benz C-Class in pristine condition. Leather interior, sunroof, all features working perfectly.',
    35000, 'USD', 'fixed',
    'Elite Motors Rwanda', 'sales@elitemotors.rw', '+250788234567', 'dealer',
    'Kigali, Gasabo', 'active', false
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'make', 'Mercedes-Benz' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'model', 'C-Class' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'year', '2019' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'kilometers', '32000' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'transmission', 'automatic' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'fuel_type', 'Petrol' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'color', 'Black' FROM marketplace_listings WHERE title LIKE 'Mercedes-Benz C-Class%' LIMIT 1;

  -- Honda CR-V 2021
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    motors_cat_id, used_cars_subcat_id, rwanda_id,
    'Honda CR-V 2021 - Low Mileage',
    'Almost new Honda CR-V with only 15,000 km. Still under warranty. Perfect condition.',
    32000, 'USD', 'negotiable',
    'Patrick Nkusi', 'p.nkusi@email.com', '+250788345678', 'individual',
    'Kigali, Nyarugenge', 'active', false
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'make', 'Honda' FROM marketplace_listings WHERE title LIKE 'Honda CR-V%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'model', 'CR-V' FROM marketplace_listings WHERE title LIKE 'Honda CR-V%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'year', '2021' FROM marketplace_listings WHERE title LIKE 'Honda CR-V%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'kilometers', '15000' FROM marketplace_listings WHERE title LIKE 'Honda CR-V%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'transmission', 'automatic' FROM marketplace_listings WHERE title LIKE 'Honda CR-V%' LIMIT 1;

  -- ============================================
  -- PROPERTY FOR SALE - Apartments
  -- ============================================
  
  -- Modern 3BR Apartment
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    property_sale_cat_id, apartments_sale_subcat_id, rwanda_id,
    'Modern 3 Bedroom Apartment in Kigali Heights',
    'Spacious 3-bedroom apartment with stunning city views. Modern kitchen, master ensuite, secure parking. Prime location.',
    180000, 'USD', 'negotiable',
    'Kigali Properties Ltd', 'info@kigaliproperties.rw', '+250788456789', 'agent',
    'Kigali, Kicukiro - Kigali Heights', 'active', true
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'property_type', 'apartment' FROM marketplace_listings WHERE title LIKE '%3 Bedroom Apartment%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'bedrooms', '3' FROM marketplace_listings WHERE title LIKE '%3 Bedroom Apartment%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'bathrooms', '2' FROM marketplace_listings WHERE title LIKE '%3 Bedroom Apartment%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'sqft', '1500' FROM marketplace_listings WHERE title LIKE '%3 Bedroom Apartment%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'furnished', 'semi' FROM marketplace_listings WHERE title LIKE '%3 Bedroom Apartment%' LIMIT 1;

  -- Luxury Villa
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    property_sale_cat_id, villas_sale_subcat_id, rwanda_id,
    'Luxury 5 Bedroom Villa with Pool',
    'Stunning villa in exclusive neighborhood. 5 bedrooms, 4 bathrooms, swimming pool, garden, staff quarters.',
    450000, 'USD', 'fixed',
    'Premium Estates Rwanda', 'sales@premiumestates.rw', '+250788567890', 'agent',
    'Kigali, Gasabo - Nyarutarama', 'active', true
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'property_type', 'villa' FROM marketplace_listings WHERE title LIKE '%5 Bedroom Villa%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'bedrooms', '5' FROM marketplace_listings WHERE title LIKE '%5 Bedroom Villa%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'bathrooms', '4' FROM marketplace_listings WHERE title LIKE '%5 Bedroom Villa%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'sqft', '4000' FROM marketplace_listings WHERE title LIKE '%5 Bedroom Villa%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'furnished', 'yes' FROM marketplace_listings WHERE title LIKE '%5 Bedroom Villa%' LIMIT 1;

  -- ============================================
  -- PROPERTY FOR RENT - Apartments
  -- ============================================
  
  -- 2BR Apartment for Rent
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    property_rent_cat_id, apartments_rent_subcat_id, rwanda_id,
    '2 Bedroom Furnished Apartment for Rent',
    'Fully furnished 2-bedroom apartment. Modern amenities, secure building, backup generator.',
    800, 'USD', 'monthly',
    'City Rentals', 'rentals@cityrw.com', '+250788678901', 'agent',
    'Kigali, Kicukiro - Gikondo', 'active', false
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'property_type', 'apartment' FROM marketplace_listings WHERE title LIKE '%2 Bedroom Furnished%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'bedrooms', '2' FROM marketplace_listings WHERE title LIKE '%2 Bedroom Furnished%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'bathrooms', '1' FROM marketplace_listings WHERE title LIKE '%2 Bedroom Furnished%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'furnished', 'yes' FROM marketplace_listings WHERE title LIKE '%2 Bedroom Furnished%' LIMIT 1;

  -- ============================================
  -- JOBS
  -- ============================================
  
  -- Sales Manager Position
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    jobs_cat_id, sales_jobs_subcat_id, rwanda_id,
    'Sales Manager - Tech Company',
    'Leading tech company seeking experienced Sales Manager. 5+ years experience required. Competitive salary and benefits.',
    0, 'USD', 'negotiable',
    'TechCorp Rwanda', 'hr@techcorp.rw', '+250788789012', 'company',
    'Kigali, Gasabo', 'active', false
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'job_type', 'Sales Manager' FROM marketplace_listings WHERE title LIKE 'Sales Manager%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'employment_type', 'full-time' FROM marketplace_listings WHERE title LIKE 'Sales Manager%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'experience_required', '5+ years' FROM marketplace_listings WHERE title LIKE 'Sales Manager%' LIMIT 1;

  -- ============================================
  -- CLASSIFIEDS - Electronics
  -- ============================================
  
  -- iPhone 13 Pro
  INSERT INTO marketplace_listings (
    category_id, subcategory_id, country_id, title, description, price, currency, price_type,
    seller_name, seller_email, seller_phone, seller_type, location_details, status, is_featured
  ) VALUES (
    classifieds_cat_id, electronics_subcat_id, rwanda_id,
    'iPhone 13 Pro 256GB - Like New',
    'iPhone 13 Pro in excellent condition. 256GB storage, all accessories included. No scratches.',
    850, 'USD', 'negotiable',
    'Alice Uwase', 'alice.uwase@email.com', '+250788890123', 'individual',
    'Kigali, Nyarugenge', 'active', false
  );
  
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'brand', 'Apple' FROM marketplace_listings WHERE title LIKE 'iPhone 13 Pro%' LIMIT 1;
  INSERT INTO marketplace_listing_attributes (listing_id, attribute_key, attribute_value)
  SELECT id, 'condition', 'like-new' FROM marketplace_listings WHERE title LIKE 'iPhone 13 Pro%' LIMIT 1;

END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Dummy marketplace listings for Rwanda created successfully!';
END $$;
