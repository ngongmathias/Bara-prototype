-- Add missing marketplace categories
-- Run this in Supabase SQL Editor

-- First, let's see what categories currently exist
-- SELECT id, name, slug, display_order FROM marketplace_categories ORDER BY display_order;

-- Insert missing categories (only if they don't exist)
INSERT INTO marketplace_categories (name, slug, icon, description, display_order, is_active)
VALUES 
  ('Motors', 'motors', 'car', 'Cars, motorcycles, boats and auto accessories', 1, true),
  ('Properties', 'property', 'home', 'Apartments, villas, land and commercial properties', 2, true),
  ('Mobiles & Tablets', 'mobiles-tablets', 'smartphone', 'Mobile phones, tablets and accessories', 3, true),
  ('Home & Office Furniture - Decor', 'home-furniture', 'package', 'Furniture, decor and home essentials', 5, true),
  ('Electronics & Appliances', 'electronics', 'tv', 'TVs, computers, cameras and appliances', 6, true),
  ('Fashion & Beauty', 'fashion', 'shopping-bag', 'Clothing, shoes, bags and beauty products', 7, true),
  ('Services', 'services', 'wrench', 'Business, domestic and professional services', 8, true),
  ('Kids & Babies', 'kids-babies', 'baby', 'Baby products, toys and kids items', 9, true),
  ('Pets - Birds - Ornamental fish', 'pets', 'users', 'Pets, birds, fish and pet accessories', 10, true),
  ('Hobbies', 'hobbies', 'palette', 'Collectibles, sports, books and hobbies', 11, true),
  ('Business & Industrial', 'business-industrial', 'briefcase', 'Business equipment and industrial items', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- Verify the categories were added
SELECT id, name, slug, display_order, is_active FROM marketplace_categories ORDER BY display_order;
