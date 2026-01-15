-- Add sample images to marketplace listings
-- Run this AFTER running ADD_SAMPLE_LISTINGS.sql
-- This uses placeholder images from Unsplash

-- Get listing IDs for each category to add images
-- VEHICLES - Toyota Camry
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', true, 1
FROM marketplace_listings WHERE title = 'Toyota Camry 2020 - Excellent Condition' LIMIT 1;

INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800', false, 2
FROM marketplace_listings WHERE title = 'Toyota Camry 2020 - Excellent Condition' LIMIT 1;

-- VEHICLES - Honda Motorcycle
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', true, 1
FROM marketplace_listings WHERE title = 'Honda Motorcycle 2022 - Like New' LIMIT 1;

-- PROPERTIES - Apartment
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', true, 1
FROM marketplace_listings WHERE title = 'Modern 3-Bedroom Apartment for Sale' LIMIT 1;

INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', false, 2
FROM marketplace_listings WHERE title = 'Modern 3-Bedroom Apartment for Sale' LIMIT 1;

-- PROPERTIES - Villa
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', true, 1
FROM marketplace_listings WHERE title = 'Luxury Villa with Pool - Prime Location' LIMIT 1;

INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', false, 2
FROM marketplace_listings WHERE title = 'Luxury Villa with Pool - Prime Location' LIMIT 1;

-- MOBILES - iPhone
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800', true, 1
FROM marketplace_listings WHERE title = 'iPhone 14 Pro Max 256GB - Unlocked' LIMIT 1;

-- MOBILES - Samsung Tab
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', true, 1
FROM marketplace_listings WHERE title = 'Samsung Galaxy Tab S8 - Brand New' LIMIT 1;

-- FURNITURE - Sofa
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', true, 1
FROM marketplace_listings WHERE title = 'Modern L-Shaped Sofa - Grey' LIMIT 1;

-- FURNITURE - Dining Set
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', true, 1
FROM marketplace_listings WHERE title = 'Wooden Dining Table Set - 6 Chairs' LIMIT 1;

-- ELECTRONICS - TV
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', true, 1
FROM marketplace_listings WHERE title = 'Samsung 55" 4K Smart TV - 2023 Model' LIMIT 1;

-- ELECTRONICS - MacBook
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', true, 1
FROM marketplace_listings WHERE title = 'MacBook Pro 16" M2 - Like New' LIMIT 1;

-- FASHION - Handbag
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', true, 1
FROM marketplace_listings WHERE title = 'Designer Handbag - Authentic' LIMIT 1;

-- FASHION - Shoes
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800', true, 1
FROM marketplace_listings WHERE title = 'Men''s Formal Shoes - Italian Leather' LIMIT 1;

-- PETS - Puppies
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800', true, 1
FROM marketplace_listings WHERE title = 'Golden Retriever Puppies - Vaccinated' LIMIT 1;

-- KIDS - Stroller
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', true, 1
FROM marketplace_listings WHERE title = 'Baby Stroller - Premium Brand' LIMIT 1;

-- HOBBIES - Bike
INSERT INTO marketplace_listing_images (listing_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800', true, 1
FROM marketplace_listings WHERE title = 'Mountain Bike - Professional Grade' LIMIT 1;

-- Verify images were added
SELECT 
  ml.title,
  COUNT(mli.id) as image_count,
  MAX(CASE WHEN mli.is_primary THEN mli.image_url END) as primary_image
FROM marketplace_listings ml
LEFT JOIN marketplace_listing_images mli ON ml.id = mli.listing_id
GROUP BY ml.id, ml.title
ORDER BY ml.created_at DESC;
