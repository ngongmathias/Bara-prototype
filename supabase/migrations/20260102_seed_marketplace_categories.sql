-- Seed Marketplace Categories and Subcategories
-- Based on Dubizzle.com structure

-- ============================================
-- INSERT MAIN CATEGORIES
-- ============================================
INSERT INTO marketplace_categories (name, slug, icon, description, display_order, is_active) VALUES
('Property for Sale', 'property-sale', 'home', 'Buy residential and commercial properties', 1, true),
('Property for Rent', 'property-rent', 'key', 'Rent apartments, villas, and commercial spaces', 2, true),
('Motors', 'motors', 'car', 'Buy and sell vehicles, motorcycles, and more', 3, true),
('Classifieds', 'classifieds', 'tag', 'General items, electronics, furniture, and more', 4, true),
('Jobs', 'jobs', 'briefcase', 'Find job opportunities across industries', 5, true),
('Furniture & Garden', 'furniture-garden', 'sofa', 'Home furniture and garden items', 6, true),
('Mobile & Tablets', 'mobile-tablets', 'smartphone', 'Mobile phones, tablets, and accessories', 7, true);

-- ============================================
-- INSERT SUBCATEGORIES - PROPERTY FOR SALE
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order) 
SELECT id, 'Properties for Sale', 'properties', 1 FROM marketplace_categories WHERE slug = 'property-sale';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Apartments for Sale', 'apartments', 2 FROM marketplace_categories WHERE slug = 'property-sale';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Villas for Sale', 'villas', 3 FROM marketplace_categories WHERE slug = 'property-sale';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Off Plan Properties', 'off-plan', 4 FROM marketplace_categories WHERE slug = 'property-sale';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'New Projects', 'new-projects', 5 FROM marketplace_categories WHERE slug = 'property-sale';

-- ============================================
-- INSERT SUBCATEGORIES - PROPERTY FOR RENT
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Properties for Rent', 'properties', 1 FROM marketplace_categories WHERE slug = 'property-rent';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Apartments for Rent', 'apartments', 2 FROM marketplace_categories WHERE slug = 'property-rent';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Villas for Rent', 'villas', 3 FROM marketplace_categories WHERE slug = 'property-rent';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Rooms for Rent', 'rooms', 4 FROM marketplace_categories WHERE slug = 'property-rent';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Monthly Properties for Rent', 'monthly-properties', 5 FROM marketplace_categories WHERE slug = 'property-rent';

-- ============================================
-- INSERT SUBCATEGORIES - MOTORS
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Used Cars for Sale', 'used-cars', 1 FROM marketplace_categories WHERE slug = 'motors';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'New Cars for Sale', 'new-cars', 2 FROM marketplace_categories WHERE slug = 'motors';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Export Cars for Sale', 'export-cars', 3 FROM marketplace_categories WHERE slug = 'motors';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Rental Cars', 'rental-cars', 4 FROM marketplace_categories WHERE slug = 'motors';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Motorcycles for Sale', 'motorcycles', 5 FROM marketplace_categories WHERE slug = 'motors';

-- ============================================
-- INSERT SUBCATEGORIES - CLASSIFIEDS
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Classifieds for Sale', 'general', 1 FROM marketplace_categories WHERE slug = 'classifieds';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Mobile Phones & Tablets', 'mobile-phones', 2 FROM marketplace_categories WHERE slug = 'classifieds';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Home Appliances', 'home-appliances', 3 FROM marketplace_categories WHERE slug = 'classifieds';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Furniture, Home & Garden', 'furniture', 4 FROM marketplace_categories WHERE slug = 'classifieds';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Electronics', 'electronics', 5 FROM marketplace_categories WHERE slug = 'classifieds';

-- ============================================
-- INSERT SUBCATEGORIES - JOBS
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Jobs', 'general', 1 FROM marketplace_categories WHERE slug = 'jobs';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Sales & Business Development Jobs', 'sales-business', 2 FROM marketplace_categories WHERE slug = 'jobs';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Accounting & Finance Jobs', 'accounting-finance', 3 FROM marketplace_categories WHERE slug = 'jobs';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Secretarial & Front Office Jobs', 'secretarial', 4 FROM marketplace_categories WHERE slug = 'jobs';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Driver & Delivery Jobs', 'driver-delivery', 5 FROM marketplace_categories WHERE slug = 'jobs';

-- ============================================
-- INSERT SUBCATEGORIES - FURNITURE & GARDEN
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Furniture', 'furniture', 1 FROM marketplace_categories WHERE slug = 'furniture-garden';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Home Decor', 'home-decor', 2 FROM marketplace_categories WHERE slug = 'furniture-garden';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Garden & Outdoor', 'garden-outdoor', 3 FROM marketplace_categories WHERE slug = 'furniture-garden';

-- ============================================
-- INSERT SUBCATEGORIES - MOBILE & TABLETS
-- ============================================
INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Mobile Phones', 'mobile-phones', 1 FROM marketplace_categories WHERE slug = 'mobile-tablets';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Tablets', 'tablets', 2 FROM marketplace_categories WHERE slug = 'mobile-tablets';

INSERT INTO marketplace_subcategories (category_id, name, slug, display_order)
SELECT id, 'Accessories', 'accessories', 3 FROM marketplace_categories WHERE slug = 'mobile-tablets';
