-- Add New Business Categories to Bara
-- Categories to add: Furniture, Textiles, Guest house, Hospitality, Multipurpose, Sports, Gaming, Lounge, Specialist, Butcher, Boutique
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

-- Furniture
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Furniture', 'furniture', 'Furniture stores and suppliers')
ON CONFLICT (name) DO NOTHING;

-- Textiles
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Textiles', 'textiles', 'Textile shops and fabric stores')
ON CONFLICT (name) DO NOTHING;

-- Guest house
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Guest House', 'guest-house', 'Guest houses and bed & breakfast accommodations')
ON CONFLICT (name) DO NOTHING;

-- Hospitality
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Hospitality', 'hospitality', 'Hospitality businesses and services')
ON CONFLICT (name) DO NOTHING;

-- Multipurpose
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Multipurpose', 'multipurpose', 'Multipurpose venues and facilities')
ON CONFLICT (name) DO NOTHING;

-- Sports
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Sports', 'sports', 'Sports facilities, gyms, and athletic centers')
ON CONFLICT (name) DO NOTHING;

-- Gaming
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Gaming', 'gaming', 'Gaming lounges and entertainment centers')
ON CONFLICT (name) DO NOTHING;

-- Lounge
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Lounge', 'lounge', 'Lounges and relaxation spaces')
ON CONFLICT (name) DO NOTHING;

-- Specialist
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Specialist', 'specialist', 'Specialist services and consultants')
ON CONFLICT (name) DO NOTHING;

-- Butcher
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Butcher', 'butcher', 'Butcheries and meat shops')
ON CONFLICT (name) DO NOTHING;

-- Boutique
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Boutique', 'boutique', 'Boutiques and specialty retail stores')
ON CONFLICT (name) DO NOTHING;

-- Verify the new categories were added
SELECT name, slug, description FROM categories 
WHERE name IN ('Furniture', 'Textiles', 'Guest House', 'Hospitality', 'Multipurpose', 'Sports', 'Gaming', 'Lounge', 'Specialist', 'Butcher', 'Boutique')
ORDER BY name;
