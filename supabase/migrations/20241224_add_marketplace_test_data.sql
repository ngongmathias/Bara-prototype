-- Add test listings for marketplace
-- This creates sample listings across different categories and countries for testing

-- Motors - Cars
INSERT INTO marketplace_listings (
  title, description, price, category_id, country, city, condition,
  seller_name, seller_phone, seller_email, seller_whatsapp, status
) VALUES
(
  'Toyota Camry 2020 - Excellent Condition',
  'Well-maintained Toyota Camry 2020 with low mileage. Full service history, single owner. Features include leather seats, sunroof, navigation system, and backup camera. No accidents, clean title. Perfect for family use.',
  18500,
  (SELECT id FROM marketplace_categories WHERE slug = 'motors'),
  'United Arab Emirates',
  'Dubai',
  'used',
  'Ahmed Hassan',
  '+971501234567',
  'ahmed.hassan@example.com',
  '+971501234567',
  'active'
),
(
  'Honda Civic 2022 - Like New',
  'Almost new Honda Civic 2022 with only 5,000 km. Still under warranty. Automatic transmission, fuel efficient, modern design. Includes all original accessories and documentation.',
  22000,
  (SELECT id FROM marketplace_categories WHERE slug = 'motors'),
  'Kenya',
  'Nairobi',
  'used',
  'John Kamau',
  '+254712345678',
  'john.kamau@example.com',
  '+254712345678',
  'active'
),
(
  'Mercedes-Benz C-Class 2019',
  'Luxury sedan in pristine condition. AMG package, premium sound system, panoramic roof. Regular maintenance at authorized dealer. Perfect for business professionals.',
  35000,
  (SELECT id FROM marketplace_categories WHERE slug = 'motors'),
  'South Africa',
  'Johannesburg',
  'used',
  'David Nkosi',
  '+27823456789',
  'david.nkosi@example.com',
  '+27823456789',
  'active'
);

-- Property - Real Estate
INSERT INTO marketplace_listings (
  title, description, price, category_id, country, city, condition,
  seller_name, seller_phone, seller_email, seller_whatsapp, status
) VALUES
(
  '3 Bedroom Apartment - Marina View',
  'Spacious 3-bedroom apartment with stunning marina views. Modern kitchen, 2 bathrooms, balcony, parking space. Located in prime area with easy access to shopping and dining. Ready to move in.',
  450000,
  (SELECT id FROM marketplace_categories WHERE slug = 'property'),
  'United Arab Emirates',
  'Dubai',
  'new',
  'Sarah Al-Mansoori',
  '+971504567890',
  'sarah.mansoori@example.com',
  '+971504567890',
  'active'
),
(
  'Modern Villa - Gated Community',
  '5-bedroom villa in exclusive gated community. Private pool, garden, maid room, 3-car garage. High-end finishes throughout. Security 24/7. Perfect for families.',
  850000,
  (SELECT id FROM marketplace_categories WHERE slug = 'property'),
  'Ghana',
  'Accra',
  'new',
  'Kwame Mensah',
  '+233244567890',
  'kwame.mensah@example.com',
  '+233244567890',
  'active'
),
(
  'Commercial Office Space - City Center',
  '200 sqm office space in prime business district. Fully fitted, air-conditioned, high-speed internet ready. Includes 4 parking spaces. Ideal for corporate headquarters or startup.',
  320000,
  (SELECT id FROM marketplace_categories WHERE slug = 'property'),
  'Nigeria',
  'Lagos',
  'refurbished',
  'Chioma Okafor',
  '+234803456789',
  'chioma.okafor@example.com',
  '+234803456789',
  'active'
);

-- Electronics
INSERT INTO marketplace_listings (
  title, description, price, category_id, country, city, condition,
  seller_name, seller_phone, seller_email, seller_whatsapp, status
) VALUES
(
  'iPhone 14 Pro Max 256GB - Space Black',
  'Brand new iPhone 14 Pro Max, still sealed in box. 256GB storage, Space Black color. Includes all original accessories, charger, and 1-year Apple warranty. Perfect gift or personal use.',
  1200,
  (SELECT id FROM marketplace_categories WHERE slug = 'electronics'),
  'United Arab Emirates',
  'Dubai',
  'new',
  'Mohamed Ali',
  '+971505678901',
  'mohamed.ali@example.com',
  '+971505678901',
  'active'
),
(
  'MacBook Pro 16" M2 - Excellent Condition',
  'MacBook Pro 16" with M2 chip, 16GB RAM, 512GB SSD. Barely used, like new condition. Includes original box, charger, and carrying case. Perfect for professionals and creatives.',
  2200,
  (SELECT id FROM marketplace_categories WHERE slug = 'electronics'),
  'Kenya',
  'Nairobi',
  'used',
  'Grace Wanjiku',
  '+254723456789',
  'grace.wanjiku@example.com',
  '+254723456789',
  'active'
),
(
  'Samsung 65" 4K Smart TV',
  'Samsung 65-inch 4K QLED Smart TV. Crystal clear picture, smart features, voice control. Less than 6 months old, still under warranty. Includes wall mount and remote.',
  850,
  (SELECT id FROM marketplace_categories WHERE slug = 'electronics'),
  'South Africa',
  'Cape Town',
  'used',
  'Thabo Mokoena',
  '+27834567890',
  'thabo.mokoena@example.com',
  '+27834567890',
  'active'
);

-- Fashion
INSERT INTO marketplace_listings (
  title, description, price, category_id, country, city, condition,
  seller_name, seller_phone, seller_email, seller_whatsapp, status
) VALUES
(
  'Louis Vuitton Handbag - Authentic',
  'Authentic Louis Vuitton Neverfull MM handbag. Monogram canvas, excellent condition. Comes with dust bag and authenticity certificate. Perfect for daily use or special occasions.',
  1500,
  (SELECT id FROM marketplace_categories WHERE slug = 'fashion'),
  'United Arab Emirates',
  'Dubai',
  'used',
  'Layla Ibrahim',
  '+971506789012',
  'layla.ibrahim@example.com',
  '+971506789012',
  'active'
),
(
  'Designer Suits Collection - Men',
  'Collection of 5 premium designer suits (Hugo Boss, Armani). Sizes 40-42. Dry cleaned and in excellent condition. Perfect for business professionals. Selling as a lot.',
  2500,
  (SELECT id FROM marketplace_categories WHERE slug = 'fashion'),
  'Nigeria',
  'Lagos',
  'used',
  'Emeka Obi',
  '+234814567890',
  'emeka.obi@example.com',
  '+234814567890',
  'active'
);

-- Services
INSERT INTO marketplace_listings (
  title, description, price, category_id, country, city, condition,
  seller_name, seller_phone, seller_email, seller_whatsapp, status
) VALUES
(
  'Professional Photography Services',
  'Experienced photographer offering services for weddings, events, portraits, and commercial shoots. High-quality equipment, fast turnaround. Portfolio available upon request. Packages starting from listed price.',
  500,
  (SELECT id FROM marketplace_categories WHERE slug = 'services'),
  'Kenya',
  'Nairobi',
  'new',
  'Peter Mwangi',
  '+254734567890',
  'peter.mwangi@example.com',
  '+254734567890',
  'active'
),
(
  'Home Cleaning Service - Professional Team',
  'Professional home cleaning service with trained staff. Deep cleaning, regular maintenance, move-in/move-out cleaning. Eco-friendly products, insured team. Flexible scheduling available.',
  150,
  (SELECT id FROM marketplace_categories WHERE slug = 'services'),
  'South Africa',
  'Johannesburg',
  'new',
  'Linda Dlamini',
  '+27845678901',
  'linda.dlamini@example.com',
  '+27845678901',
  'active'
);

-- Jobs
INSERT INTO marketplace_listings (
  title, description, price, category_id, country, city, condition,
  seller_name, seller_phone, seller_email, seller_whatsapp, status
) VALUES
(
  'Senior Software Engineer - Full Stack',
  'Tech startup seeking experienced Full Stack Developer. React, Node.js, PostgreSQL required. Competitive salary, equity options, remote work flexibility. Join our growing team building innovative solutions.',
  8000,
  (SELECT id FROM marketplace_categories WHERE slug = 'jobs'),
  'United Arab Emirates',
  'Dubai',
  'new',
  'TechVentures HR',
  '+971507890123',
  'hr@techventures.example.com',
  '+971507890123',
  'active'
),
(
  'Marketing Manager - E-commerce',
  'Growing e-commerce company looking for Marketing Manager. 5+ years experience, digital marketing expertise, team leadership skills. Excellent benefits package and career growth opportunities.',
  6500,
  (SELECT id FROM marketplace_categories WHERE slug = 'jobs'),
  'Nigeria',
  'Lagos',
  'new',
  'ShopAfrica Recruitment',
  '+234825678901',
  'jobs@shopafrica.example.com',
  '+234825678901',
  'active'
);

-- Add placeholder image URLs for the listings
-- Note: These are placeholder URLs. In production, you would upload actual images to Supabase storage
DO $$
DECLARE
  listing_record RECORD;
  image_count INTEGER;
BEGIN
  FOR listing_record IN 
    SELECT id, title FROM marketplace_listings 
    WHERE NOT EXISTS (
      SELECT 1 FROM marketplace_listing_images 
      WHERE listing_id = listing_record.id
    )
  LOOP
    -- Add 1-3 placeholder images per listing
    image_count := 1 + floor(random() * 3)::int;
    
    FOR i IN 1..image_count LOOP
      INSERT INTO marketplace_listing_images (listing_id, image_url, display_order)
      VALUES (
        listing_record.id,
        'https://images.unsplash.com/photo-' || (1500000000 + floor(random() * 100000000)::bigint) || '?w=800&h=600&fit=crop',
        i - 1
      );
    END LOOP;
  END LOOP;
END $$;

-- Update view counts with random values for realism
UPDATE marketplace_listings
SET view_count = floor(random() * 500)::int
WHERE view_count = 0;
