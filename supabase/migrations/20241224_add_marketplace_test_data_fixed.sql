-- Add test listings for marketplace (corrected column names)
-- This creates sample listings across different categories and countries for testing

-- Motors - Cars
INSERT INTO marketplace_listings (
  user_id, title,description, price, category_id, country_name, condition,
  contact_phone, contact_email, status
) VALUES
(
  'test_user_1',
  'Toyota Camry 2020 - Excellent Condition',
  'Well-maintained Toyota Camry 2020 with low mileage. Full service history, single owner. Features include leather seats, sunroof, navigation system, and backup camera. No accidents, clean title. Perfect for family use.',
  18500,
  (SELECT id FROM marketplace_categories WHERE slug = 'motors'),
  'United Arab Emirates',
  'used',
  '+971501234567',
  'ahmed.hassan@example.com',
  'active'
),
(
  'test_user_2',
  'Honda Civic 2022 - Like New',
  'Almost new Honda Civic 2022 with only 5,000 km. Still under warranty. Automatic transmission, fuel efficient, modern design. Includes all original accessories and documentation.',
  22000,
  (SELECT id FROM marketplace_categories WHERE slug = 'motors'),
  'Kenya',
  'used',
  '+254712345678',
  'john.kamau@example.com',
  'active'
),
(
  'test_user_3',
  'Mercedes-Benz C-Class 2019',
  'Luxury sedan in pristine condition. AMG package, premium sound system, panoramic roof. Regular maintenance at authorized dealer. Perfect for business professionals.',
  35000,
  (SELECT id FROM marketplace_categories WHERE slug = 'motors'),
  'South Africa',
  'used',
  '+27823456789',
  'david.nkosi@example.com',
  'active'
);

-- Property - Real Estate
INSERT INTO marketplace_listings (
  user_id, title, description, price, category_id, country_name, condition,
  contact_phone, contact_email, status
) VALUES
(
  'test_user_4',
  '3 Bedroom Apartment - Marina View',
  'Spacious 3-bedroom apartment with stunning marina views. Modern kitchen, 2 bathrooms, balcony, parking space. Located in prime area with easy access to shopping and dining. Ready to move in.',
  450000,
  (SELECT id FROM marketplace_categories WHERE slug = 'property'),
  'United Arab Emirates',
  'new',
  '+971504567890',
  'sarah.mansoori@example.com',
  'active'
),
(
  'test_user_5',
  'Modern Villa - Gated Community',
  '5-bedroom villa in exclusive gated community. Private pool, garden, maid room, 3-car garage. High-end finishes throughout. Security 24/7. Perfect for families.',
  850000,
  (SELECT id FROM marketplace_categories WHERE slug = 'property'),
  'Ghana',
  'new',
  '+233244567890',
  'kwame.mensah@example.com',
  'active'
),
(
  'test_user_6',
  'Commercial Office Space - City Center',
  '200 sqm office space in prime business district. Fully fitted, air-conditioned, high-speed internet ready. Includes 4 parking spaces. Ideal for corporate headquarters or startup.',
  320000,
  (SELECT id FROM marketplace_categories WHERE slug = 'property'),
  'Nigeria',
  'used',
  '+234803456789',
  'chioma.okafor@example.com',
  'active'
);

-- Electronics
INSERT INTO marketplace_listings (
  user_id, title, description, price, category_id, country_name, condition,
  contact_phone, contact_email, status
) VALUES
(
  'test_user_7',
  'iPhone 14 Pro Max 256GB - Space Black',
  'Brand new iPhone 14 Pro Max, still sealed in box. 256GB storage, Space Black color. Includes all original accessories, charger, and 1-year Apple warranty. Perfect gift or personal use.',
  1200,
  (SELECT id FROM marketplace_categories WHERE slug = 'electronics'),
  'United Arab Emirates',
  'new',
  '+971505678901',
  'mohamed.ali@example.com',
  'active'
),
(
  'test_user_8',
  'MacBook Pro 16" M2 - Excellent Condition',
  'MacBook Pro 16" with M2 chip, 16GB RAM, 512GB SSD. Barely used, like new condition. Includes original box, charger, and carrying case. Perfect for professionals and creatives.',
  2200,
  (SELECT id FROM marketplace_categories WHERE slug = 'electronics'),
  'Kenya',
  'used',
  '+254723456789',
  'grace.wanjiku@example.com',
  'active'
),
(
  'test_user_9',
  'Samsung 65" 4K Smart TV',
  'Samsung 65-inch 4K QLED Smart TV. Crystal clear picture, smart features, voice control. Less than 6 months old, still under warranty. Includes wall mount and remote.',
  850,
  (SELECT id FROM marketplace_categories WHERE slug = 'electronics'),
  'South Africa',
  'used',
  '+27834567890',
  'thabo.mokoena@example.com',
  'active'
);

-- Fashion
INSERT INTO marketplace_listings (
  user_id, title, description, price, category_id, country_name, condition,
  contact_phone, contact_email, status
) VALUES
(
  'test_user_10',
  'Louis Vuitton Handbag - Authentic',
  'Authentic Louis Vuitton Neverfull MM handbag. Monogram canvas, excellent condition. Comes with dust bag and authenticity certificate. Perfect for daily use or special occasions.',
  1500,
  (SELECT id FROM marketplace_categories WHERE slug = 'fashion'),
  'United Arab Emirates',
  'used',
  '+971506789012',
  'layla.ibrahim@example.com',
  'active'
),
(
  'test_user_11',
  'Designer Suits Collection - Men',
  'Collection of 5 premium designer suits (Hugo Boss, Armani). Sizes 40-42. Dry cleaned and in excellent condition. Perfect for business professionals. Selling as a lot.',
  2500,
  (SELECT id FROM marketplace_categories WHERE slug = 'fashion'),
  'Nigeria',
  'used',
  '+234814567890',
  'emeka.obi@example.com',
  'active'
);

-- Services
INSERT INTO marketplace_listings (
  user_id, title, description, price, category_id, country_name, condition,
  contact_phone, contact_email, status
) VALUES
(
  'test_user_12',
  'Professional Photography Services',
  'Experienced photographer offering services for weddings, events, portraits, and commercial shoots. High-quality equipment, fast turnaround. Portfolio available upon request. Packages starting from listed price.',
  500,
  (SELECT id FROM marketplace_categories WHERE slug = 'services'),
  'Kenya',
  'new',
  '+254734567890',
  'peter.mwangi@example.com',
  'active'
),
(
  'test_user_13',
  'Home Cleaning Service - Professional Team',
  'Professional home cleaning service with trained staff. Deep cleaning, regular maintenance, move-in/move-out cleaning. Eco-friendly products, insured team. Flexible scheduling available.',
  150,
  (SELECT id FROM marketplace_categories WHERE slug = 'services'),
  'South Africa',
  'new',
  '+27845678901',
  'linda.dlamini@example.com',
  'active'
);

-- Jobs
INSERT INTO marketplace_listings (
  user_id, title, description, price, category_id, country_name, condition,
  contact_phone, contact_email, status
) VALUES
(
  'test_user_14',
  'Senior Software Engineer - Full Stack',
  'Tech startup seeking experienced Full Stack Developer. React, Node.js, PostgreSQL required. Competitive salary, equity options, remote work flexibility. Join our growing team building innovative solutions.',
  8000,
  (SELECT id FROM marketplace_categories WHERE slug = 'jobs'),
  'United Arab Emirates',
  'new',
  '+971507890123',
  'hr@techventures.example.com',
  'active'
),
(
  'test_user_15',
  'Marketing Manager - E-commerce',
  'Growing e-commerce company looking for Marketing Manager. 5+ years experience, digital marketing expertise, team leadership skills. Excellent benefits package and career growth opportunities.',
  6500,
  (SELECT id FROM marketplace_categories WHERE slug = 'jobs'),
  'Nigeria',
  'new',
  '+234825678901',
  'jobs@shopafrica.example.com',
  'active'
);

-- Add placeholder image URLs for the listings
DO $$
DECLARE
  listing_id_var UUID;
  image_count INTEGER;
BEGIN
  FOR listing_id_var IN 
    SELECT id FROM marketplace_listings 
    WHERE NOT EXISTS (
      SELECT 1 FROM marketplace_listing_images 
      WHERE listing_id = marketplace_listings.id
    )
  LOOP
    -- Add 2-4 placeholder images per listing
    image_count := 2 + floor(random() * 3)::int;
    
    FOR i IN 1..image_count LOOP
      INSERT INTO marketplace_listing_images (listing_id, image_url, sort_order)
      VALUES (
        listing_id_var,
        'https://images.unsplash.com/photo-' || (1500000000 + floor(random() * 100000000)::bigint) || '?w=800&h=600&fit=crop',
        i - 1
      );
    END LOOP;
  END LOOP;
END $$;

-- Update view counts with random values for realism
UPDATE marketplace_listings
SET views_count = floor(random() * 500)::int
WHERE views_count = 0;
