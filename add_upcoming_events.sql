-- Add some upcoming events for testing Active Events section
-- These events will have future dates

INSERT INTO events (
  title,
  description,
  start_date,
  end_date,
  venue_name,
  venue_address,
  city_id,
  country_id,
  category_id,
  organizer_name,
  event_image_url,
  is_active,
  created_at,
  updated_at
) VALUES
-- Music Events (Future)
(
  'Summer Music Festival 2025',
  'Join us for an amazing summer music festival featuring top artists from around the world.',
  '2025-07-15 18:00:00',
  '2025-07-17 23:00:00',
  'National Stadium',
  'Independence Avenue, Accra',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'music' LIMIT 1),
  'EventPro Ghana',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
  true,
  NOW(),
  NOW()
),
(
  'Jazz Night Under the Stars',
  'An elegant evening of smooth jazz with renowned local and international artists.',
  '2025-06-20 19:00:00',
  '2025-06-20 23:30:00',
  'Alliance Française',
  'Liberation Road, Accra',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'music' LIMIT 1),
  'Jazz Society Ghana',
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f',
  true,
  NOW(),
  NOW()
),
-- Arts & Culture Events (Future)
(
  'Contemporary Art Exhibition 2025',
  'Showcasing the best contemporary art from emerging African artists.',
  '2025-06-01 10:00:00',
  '2025-06-30 18:00:00',
  'Nubuke Foundation',
  'Nubuke Lane, East Legon',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'arts-culture' LIMIT 1),
  'Nubuke Foundation',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
  true,
  NOW(),
  NOW()
),
-- Food & Drink Events (Future)
(
  'Ghana Food Festival 2025',
  'Celebrate Ghanaian cuisine with food stalls, cooking demonstrations, and live entertainment.',
  '2025-08-10 11:00:00',
  '2025-08-12 20:00:00',
  'Accra International Conference Centre',
  'Castle Road, Ridge',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'food-drink' LIMIT 1),
  'Ghana Tourism Authority',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  true,
  NOW(),
  NOW()
),
-- Technology Events (Future)
(
  'Tech Summit Ghana 2025',
  'The largest technology conference in West Africa. Connect with innovators and investors.',
  '2025-09-15 09:00:00',
  '2025-09-17 18:00:00',
  'Kempinski Hotel Gold Coast City',
  'Gamel Abdul Nasser Avenue',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'technology' LIMIT 1),
  'Ghana Tech Hub',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
  true,
  NOW(),
  NOW()
),
-- Sports Events (Future)
(
  'Accra Marathon 2025',
  'Annual marathon through the streets of Accra. 5K, 10K, and full marathon options available.',
  '2025-10-05 06:00:00',
  '2025-10-05 12:00:00',
  'Independence Square',
  'High Street, Accra',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'sports-fitness' LIMIT 1),
  'Accra Sports Council',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3',
  true,
  NOW(),
  NOW()
),
-- Business Events (Future)
(
  'Ghana Business Summit 2025',
  'Connect with business leaders and explore investment opportunities in Ghana.',
  '2025-11-20 08:00:00',
  '2025-11-22 17:00:00',
  'Movenpick Ambassador Hotel',
  'Independence Avenue',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'business-networking' LIMIT 1),
  'Ghana Chamber of Commerce',
  'https://images.unsplash.com/photo-1511578314322-379afb476865',
  true,
  NOW(),
  NOW()
),
-- Wellness Events (Future)
(
  'Yoga & Wellness Retreat',
  'A weekend of yoga, meditation, and wellness activities by the beach.',
  '2025-07-25 08:00:00',
  '2025-07-27 18:00:00',
  'Labadi Beach Hotel',
  'Labadi Road',
  (SELECT id FROM cities WHERE name = 'Accra' LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  (SELECT id FROM event_categories WHERE slug = 'health-wellness' LIMIT 1),
  'Wellness Ghana',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
  true,
  NOW(),
  NOW()
);
