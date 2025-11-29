-- Import upcoming events from Sinc (Rwanda)
-- These are real-style events for testing the Active Events section

-- First, ensure Rwanda exists in countries table
INSERT INTO countries (name, code, is_active, created_at)
VALUES ('Rwanda', 'RW', true, NOW())
ON CONFLICT (code) DO NOTHING;

-- Ensure Kigali exists in cities table
INSERT INTO cities (name, country_id, is_active, created_at)
SELECT 'Kigali', id, true, NOW()
FROM countries WHERE code = 'RW'
ON CONFLICT DO NOTHING;

-- Insert upcoming events (December 2025 - February 2026)
-- These events will appear in the "Active Events" section

-- Music & Concerts
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Afrobeat Night Live',
  'Join us for Afrobeat Night Live! Experience an unforgettable evening of live music featuring talented artists. Great vibes, amazing atmosphere, and memories to last a lifetime.',
  '2025-12-15 20:00:00',
  '2025-12-15 23:00:00',
  'Kigali Arena',
  'Remera, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Music & Concerts',
  'Afrobeat Events',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Afrobeat Night Live');

INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Jazz Under the Stars',
  'Join us for Jazz Under the Stars! Experience an unforgettable evening of live music featuring talented artists. Great vibes, amazing atmosphere, and memories to last a lifetime.',
  '2025-12-20 19:00:00',
  '2025-12-20 22:00:00',
  'Serena Hotel Kigali',
  'Kigali Heights',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Music & Concerts',
  'Jazz Events',
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Jazz Under the Stars');

-- Business & Networking
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Startup Pitch Night',
  'Attend Startup Pitch Night and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.',
  '2025-12-01 18:00:00',
  '2025-12-01 21:00:00',
  'Norrsken House Kigali',
  'Nyarutarama, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Business & Networking',
  'Startup Events',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Startup Pitch Night');

INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Tech Talk Rwanda',
  'Attend Tech Talk Rwanda and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.',
  '2025-12-10 17:00:00',
  '2025-12-10 20:00:00',
  'Kigali Conference Centre',
  'Kigali City Center',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Business & Networking',
  'Tech Events',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tech Talk Rwanda');

-- Arts & Culture
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Contemporary Art Exhibition',
  'Discover Contemporary Art Exhibition - a celebration of creativity and artistic expression. Immerse yourself in the vibrant arts scene of Kigali.',
  '2025-12-05 10:00:00',
  '2025-12-28 18:00:00',
  'Inema Arts Center',
  'Kacyiru, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Arts & Culture',
  'Contemporary Events',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Contemporary Art Exhibition');

-- Food & Drink
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Wine Tasting Evening',
  'Indulge in Wine Tasting Evening! A culinary experience featuring exquisite flavors, expert chefs, and delightful company. Food lovers, this is for you!',
  '2025-12-18 19:00:00',
  '2025-12-18 22:00:00',
  'Heaven Restaurant',
  'Kiyovu, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Food & Drink',
  'Wine Events',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Wine Tasting Evening');

-- Sports & Fitness
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  '5K Fun Run Kigali',
  'Get active with 5K Fun Run Kigali! Whether you''re a beginner or pro, join us for a fun and energizing experience. All fitness levels welcome!',
  '2025-12-02 06:00:00',
  '2025-12-02 09:00:00',
  'Kigali Golf Club',
  'Nyarutarama, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Sports & Fitness',
  '5K Events',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = '5K Fun Run Kigali');

-- Community & Social
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Community Cleanup Day',
  'Be part of Community Cleanup Day and make a difference in our community. Together, we can create positive change and build stronger connections.',
  '2025-12-07 08:00:00',
  '2025-12-07 12:00:00',
  'Kigali City Center',
  'Downtown Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Community & Social',
  'Community Events',
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Community Cleanup Day');

-- Education & Workshops
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'Digital Marketing Workshop',
  'Learn something new at Digital Marketing Workshop! Expert instructors will guide you through hands-on activities and practical skills you can use immediately.',
  '2025-12-12 09:00:00',
  '2025-12-12 17:00:00',
  'Norrsken House Kigali',
  'Nyarutarama, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Education & Workshops',
  'Digital Events',
  'https://images.unsplash.com/photo-1533750349088-cd871a92f312',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Digital Marketing Workshop');

-- Add more events for January 2026
INSERT INTO events (
  title, description, start_date, end_date, venue_name, venue_address,
  city_id, country_id, category, organizer_name,
  event_image_url, created_at
)
SELECT
  'New Year Music Festival 2026',
  'Ring in the new year with the biggest music festival in Kigali! Multiple stages, international artists, and unforgettable performances.',
  '2026-01-01 18:00:00',
  '2026-01-02 02:00:00',
  'Kigali Arena',
  'Remera, Kigali',
  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),
  (SELECT id FROM countries WHERE code = 'RW' LIMIT 1),
  'Music & Concerts',
  'New Year Events',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'New Year Music Festival 2026');
