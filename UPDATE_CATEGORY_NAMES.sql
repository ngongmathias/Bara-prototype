-- Update category names to match Dubizzle naming convention
-- Run this in Supabase SQL Editor

-- Update existing categories with new names
UPDATE marketplace_categories SET name = 'Vehicles' WHERE slug = 'motors';
UPDATE marketplace_categories SET name = 'Properties' WHERE slug = 'property-sale';
UPDATE marketplace_categories SET name = 'Properties' WHERE slug = 'property-rent';
UPDATE marketplace_categories SET name = 'Mobiles & Tablets' WHERE slug = 'mobile-tablets';
UPDATE marketplace_categories SET name = 'Jobs' WHERE slug = 'jobs';
UPDATE marketplace_categories SET name = 'Home & Office Furniture - Decor' WHERE slug = 'furniture-garden';
UPDATE marketplace_categories SET name = 'Electronics & Appliances' WHERE slug = 'electronics';
UPDATE marketplace_categories SET name = 'Fashion & Beauty' WHERE slug = 'fashion';
UPDATE marketplace_categories SET name = 'Pets - Birds - Ornamental fish' WHERE slug = 'pets';
UPDATE marketplace_categories SET name = 'Kids & Babies' WHERE slug = 'kids-babies';
UPDATE marketplace_categories SET name = 'Services' WHERE slug = 'services';

-- Add missing categories
INSERT INTO marketplace_categories (name, slug, icon, description, display_order, is_active)
VALUES 
  ('Hobbies', 'hobbies', 'palette', 'Antiques, collectibles, sports and hobbies', 13, true),
  ('Businesses & Industrial', 'business-industrial', 'briefcase', 'Business equipment and industrial items', 14, true)
ON CONFLICT (slug) DO NOTHING;

-- Remove the old classifieds category if it exists (we don't need it anymore)
DELETE FROM marketplace_categories WHERE slug = 'classifieds';

-- Verify all categories
SELECT id, name, slug, display_order, is_active FROM marketplace_categories ORDER BY display_order;
