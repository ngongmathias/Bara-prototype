-- Add missing marketplace categories
-- Run this in Supabase SQL Editor
-- This adds 5 new categories to your existing 7 categories

-- Insert only the missing categories (won't duplicate existing ones)
INSERT INTO marketplace_categories (name, slug, icon, description, display_order, is_active)
VALUES 
  ('Electronics & Appliances', 'electronics', 'tv', 'TVs, computers, cameras and appliances', 8, true),
  ('Fashion & Beauty', 'fashion', 'shopping-bag', 'Clothing, shoes, bags and beauty products', 9, true),
  ('Services', 'services', 'wrench', 'Business, domestic and professional services', 10, true),
  ('Kids & Babies', 'kids-babies', 'baby', 'Baby products, toys and kids items', 11, true),
  ('Pets & Animals', 'pets', 'users', 'Pets, birds, fish and pet accessories', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- Verify all 12 categories now exist
SELECT id, name, slug, display_order, is_active FROM marketplace_categories ORDER BY display_order;
