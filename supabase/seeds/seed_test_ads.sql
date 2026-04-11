-- Seed test ads for seller account: mathiasngongngai@gmail.com
-- Run in Supabase SQL Editor
-- First, find the user ID and category IDs

-- Step 1: Find category IDs (run this first to verify)
-- SELECT id, name, slug FROM marketplace_categories WHERE is_active = true ORDER BY display_order;

-- Step 2: Set the seller user ID (from Clerk) — update this if different
-- You can find it by running:
-- SELECT DISTINCT created_by FROM marketplace_listings LIMIT 5;
-- Or check the Clerk dashboard for mathiasngongngai@gmail.com

DO $$
DECLARE
  v_seller_id TEXT := 'user_39EUqrQ4of91lQx8RnwkSZOTiQF'; -- Update if different
  v_property_cat UUID;
  v_motors_cat UUID;
  v_jobs_cat UUID;
  v_electronics_cat UUID;
  v_fashion_cat UUID;
  v_services_cat UUID;
  v_furniture_cat UUID;
  v_pets_cat UUID;
  v_kids_cat UUID;
  v_hobbies_cat UUID;
  v_business_cat UUID;
  v_listing_id UUID;
  v_country_id UUID;
BEGIN
  -- Get Rwanda as default country
  SELECT id INTO v_country_id FROM countries WHERE code = 'RW' LIMIT 1;
  IF v_country_id IS NULL THEN
    SELECT id INTO v_country_id FROM countries LIMIT 1;
  END IF;

  -- Get category IDs
  SELECT id INTO v_property_cat FROM marketplace_categories WHERE slug LIKE '%propert%' AND is_active = true LIMIT 1;
  SELECT id INTO v_motors_cat FROM marketplace_categories WHERE slug LIKE '%motor%' AND is_active = true LIMIT 1;
  SELECT id INTO v_jobs_cat FROM marketplace_categories WHERE slug LIKE '%job%' AND is_active = true LIMIT 1;
  SELECT id INTO v_electronics_cat FROM marketplace_categories WHERE slug LIKE '%electron%' OR slug LIKE '%mobile%' AND is_active = true LIMIT 1;
  SELECT id INTO v_fashion_cat FROM marketplace_categories WHERE slug LIKE '%fashion%' AND is_active = true LIMIT 1;
  SELECT id INTO v_services_cat FROM marketplace_categories WHERE slug LIKE '%service%' AND is_active = true LIMIT 1;
  SELECT id INTO v_furniture_cat FROM marketplace_categories WHERE slug LIKE '%furniture%' OR slug LIKE '%home%' AND is_active = true LIMIT 1;
  SELECT id INTO v_pets_cat FROM marketplace_categories WHERE slug LIKE '%pet%' AND is_active = true LIMIT 1;
  SELECT id INTO v_kids_cat FROM marketplace_categories WHERE slug LIKE '%kid%' OR slug LIKE '%bab%' AND is_active = true LIMIT 1;
  SELECT id INTO v_hobbies_cat FROM marketplace_categories WHERE slug LIKE '%hobb%' AND is_active = true LIMIT 1;
  SELECT id INTO v_business_cat FROM marketplace_categories WHERE slug LIKE '%business%' AND is_active = true LIMIT 1;

  -- ============================================================
  -- 1. PROPERTY — Modern 2-Bedroom Apartment in Kigali
  -- ============================================================
  IF v_property_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Modern 2-Bedroom Apartment in Kacyiru', 'Fully furnished 2-bedroom apartment with stunning views of Kigali hills. Open plan living area, modern kitchen with granite countertops, master en-suite, guest bathroom, secure parking, 24/7 security, backup generator. Walking distance to supermarkets, restaurants, and main bus routes. Available for immediate move-in.', 450000, 'RWF', 'monthly', v_property_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kacyiru, Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    -- Another property
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Land for Sale — 500 sqm in Nyamirambo', 'Prime residential plot of 500 square meters in a quiet neighborhood of Nyamirambo. All utilities available (water, electricity). Title deed ready. Perfect for building a family home or small rental units. Negotiable price.', 25000000, 'RWF', 'negotiable', v_property_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Nyamirambo, Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 2. MOTORS — Toyota RAV4 2019
  -- ============================================================
  IF v_motors_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Toyota RAV4 2019 — Excellent Condition', 'Clean Toyota RAV4 2019 model, 45,000 km, full service history, single owner. 2.5L engine, automatic transmission, AWD. Features: leather seats, sunroof, reversing camera, Bluetooth, cruise control. Recently serviced with new tires. No accidents.', 28000, 'USD', 'negotiable', v_motors_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kimihurura, Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Honda CB500F Motorcycle 2021', 'Sporty Honda CB500F in matte black. Perfect for Kigali traffic and weekend rides. 8,000 km, garage kept. Includes extra helmet and riding gloves. Fuel efficient and reliable.', 5500, 'USD', 'fixed', v_motors_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali City Center')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 3. ELECTRONICS — iPhone 15 Pro
  -- ============================================================
  IF v_electronics_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'iPhone 15 Pro 256GB — Natural Titanium', 'Brand new iPhone 15 Pro, 256GB, Natural Titanium. Sealed box with Apple warranty. Purchased in Dubai. Dual SIM (nano + eSIM). Includes original charger and cable. Can meet in Kigali for delivery.', 1200, 'USD', 'fixed', v_electronics_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Samsung 55" 4K Smart TV — Crystal UHD', 'Samsung 55-inch Crystal UHD 4K Smart TV (2023 model). Barely used, perfect screen. Smart features: Netflix, YouTube, Disney+. Includes remote and wall mount bracket. Selling because upgrading to 65 inch.', 350, 'USD', 'negotiable', v_electronics_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'MacBook Air M2 — 256GB, Midnight', 'Apple MacBook Air M2 chip, 8GB RAM, 256GB SSD, Midnight color. Like new condition, used for 3 months. Battery health 100%. Includes original box and charger. Perfect for students and professionals.', 900, 'USD', 'fixed', v_electronics_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 4. FASHION — African Print Dress Collection
  -- ============================================================
  IF v_fashion_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Handmade African Print Maxi Dress', 'Beautiful handmade African wax print maxi dress. Available in multiple sizes (S-XXL) and 3 print patterns. High quality cotton fabric, comfortable fit. Perfect for events, church, or casual wear. Custom sizing available on request.', 35, 'USD', 'fixed', v_fashion_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Nike Air Jordan 1 Retro High — Size 42-45', 'Authentic Nike Air Jordan 1 Retro High OG. Brand new in box. Available sizes: EU 42, 43, 44, 45. Classic black/white/red colorway. Purchased from Nike store in Nairobi. Receipt available for authenticity verification.', 180, 'USD', 'fixed', v_fashion_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 5. SERVICES — Professional Photography
  -- ============================================================
  IF v_services_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, price_period, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Professional Event Photography & Videography', 'Experienced photographer offering event coverage in Kigali. Weddings, corporate events, birthdays, graduations. High-resolution photos delivered within 48 hours. Drone footage available. Portfolio available on request. Over 200 events covered.', 150, 'USD', 'fixed', 'per_project', v_services_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, price_period, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Home & Office Cleaning Service', 'Reliable and thorough cleaning service for homes and offices. Weekly, bi-weekly, or one-time deep cleaning. We bring our own supplies and equipment. Trained and vetted staff. Serving all areas of Kigali. Free quote and consultation.', 20000, 'RWF', 'fixed', 'per_hour', v_services_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 6. JOBS — Software Developer Position
  -- ============================================================
  IF v_jobs_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Senior Full-Stack Developer — Remote', 'We are hiring a Senior Full-Stack Developer to join our growing tech team. Requirements: 3+ years React/TypeScript, Node.js, PostgreSQL experience. Nice to have: AWS, mobile development. Competitive salary (800K-1.2M RWF/month), health insurance, flexible hours, remote work option. Apply with CV and portfolio.', 1200000, 'RWF', 'negotiable', v_jobs_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'company', 'active', 'Remote / Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 7. HOME & FURNITURE — L-Shaped Sofa
  -- ============================================================
  IF v_furniture_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Premium L-Shaped Sofa — Grey Fabric', 'High-quality L-shaped sectional sofa in modern grey fabric. Seats 5-6 people comfortably. Solid wood frame, foam cushions with removable washable covers. Dimensions: 280cm x 180cm. Excellent condition, only 1 year old. Delivery available in Kigali for small fee.', 450, 'USD', 'negotiable', v_furniture_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kimironko, Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Solid Wood Dining Table + 6 Chairs', 'Beautiful solid wood dining set — table (180x90cm) with 6 matching chairs. Dark walnut finish. Handcrafted locally. Minor surface scratches but overall great condition. Perfect for family dinners. Can disassemble for transport.', 300, 'USD', 'negotiable', v_furniture_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 8. PETS — Golden Retriever Puppies
  -- ============================================================
  IF v_pets_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Golden Retriever Puppies — Vaccinated & Dewormed', '3 adorable Golden Retriever puppies ready for their forever homes! Born March 15, 2026. All vaccinated and dewormed. Come with vaccination card and starter food kit. Both parents on premises. Known for their gentle temperament, great with kids. Viewing by appointment.', 500, 'USD', 'fixed', v_pets_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Rescue Cat Available for Adoption — Free', 'Sweet 2-year-old tabby cat looking for a loving home. Spayed, vaccinated, and litter trained. Very affectionate and good with other cats. Was found abandoned but now fully healthy. Free to a good home — we just want her to be happy and safe.', 0, 'RWF', 'free', v_pets_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 9. KIDS & BABIES — Baby Stroller
  -- ============================================================
  IF v_kids_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Graco Travel System — Stroller + Car Seat', 'Graco SnugRide travel system in excellent condition. Includes stroller and click-in infant car seat (0-12 months). Lightweight, one-hand fold, large storage basket. Used for only 6 months. Smoke-free and pet-free home. Includes rain cover.', 120, 'USD', 'negotiable', v_kids_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1586085735952-e7ae834f5833?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 10. HOBBIES — Mountain Bike
  -- ============================================================
  IF v_hobbies_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Trek Marlin 7 Mountain Bike — Size L', 'Trek Marlin 7 mountain bike, 2023 model, size Large (fits 178-188cm). Shimano Deore 1x10 drivetrain, hydraulic disc brakes, RockShox Judy fork. Great for Rwanda''s hilly terrain. Includes bike lock, bell, and rear rack. Well maintained.', 650, 'USD', 'negotiable', v_hobbies_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);

    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Yamaha Acoustic Guitar + Case + Tuner', 'Yamaha F310 acoustic guitar in natural finish. Perfect for beginners and intermediate players. Warm, balanced tone. Comes with padded carry case, clip-on tuner, extra strings, and picks. No cracks or buzzing. Learn to play!', 85, 'USD', 'fixed', v_hobbies_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  -- ============================================================
  -- 11. BUSINESSES — Coffee Shop for Sale
  -- ============================================================
  IF v_business_cat IS NOT NULL THEN
    INSERT INTO marketplace_listings (id, title, description, price, currency, price_type, category_id, country_id, created_by, seller_name, seller_phone, seller_email, seller_type, status, location_details)
    VALUES (gen_random_uuid(), 'Profitable Coffee Shop for Sale — Prime Location', 'Well-established coffee shop in busy Kigali neighborhood. Operating for 3 years with loyal customer base. Includes all equipment (espresso machine, grinders, fridges, furniture), trained staff, and supplier relationships. Monthly revenue: ~3M RWF. Selling due to relocation abroad. Serious inquiries only.', 15000, 'USD', 'negotiable', v_business_cat, v_country_id, v_seller_id, 'Mathias Ngong', '+250791568519', 'mathiasngongngai@gmail.com', 'individual', 'active', 'Kigali City Center')
    RETURNING id INTO v_listing_id;
    INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary) VALUES (v_listing_id, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', true);
    INSERT INTO marketplace_listing_countries (listing_id, country_id) VALUES (v_listing_id, v_country_id);
  END IF;

  RAISE NOTICE 'Test ads created successfully!';
END $$;
