-- Import Ghana Events from Beyond The Return
-- Generated: 2024-11-29
-- 34 events from Ghana

-- ============================================================================
-- IMPORT GHANA EVENTS
-- ============================================================================

-- Event 1: The Creative Arts Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'The Creative Arts Festival', 'The Creative Arts Festival is poised to become the largest arts festival for children in Ghana, dedicated to fostering innovative ideas and creativity among our youth. This initiative promotes cultural values and showcases Ghana''s creative arts industry on a global stage.', 
  '2024-12-27T13:00:00', '2024-12-27T19:00:00',
  'Kumasi Cultural Centre', 'Kumasi Cultural Centre, Kumasi, Ghana',
  (SELECT id FROM cities WHERE name = 'Kumasi' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'Ghana National Association for Teachers', NULL, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], 100, true, 'upcoming', '2024-11-03T16:44:00';

-- Event 2: African Food Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'African Food Festival', 'Food Festival to celebrate our farmers and to promote ''eat Ghana wear Ghana'' and also to bring all Africans in Ghana to showcase their country dishes to promote African dishes as a whole.', 
  '2024-12-01T20:00:00', '2024-12-01T23:00:00',
  'Bunso Eco Park', 'Bunso Eco Park, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Food & Drink', 'Ghana Food Association', NULL, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['Food', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-23T20:57:00';

-- Event 3: Cultural Oneness Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Cultural Oneness Festival', 'Cultural Oneness Festival is to strengthen the underlying Kinship and cultural bonds between Africans in the continent and people of African descent in the diaspora; highlight their common origins while celebrating their diversity.', 
  '2024-12-17T18:00:00', '2024-12-18T02:00:00',
  'Jubilee Park Tamale', 'Jubilee Park Tamale, Tamale, Ghana',
  (SELECT id FROM cities WHERE name = 'Tamale' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'Taste of Afrika', NULL, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-08T21:43:00';

-- Event 4: Water Polo in Ghana
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Water Polo in Ghana', 'Come and witness a day of friendly matches between Ghana''s top youth and senior Water Polo athletes as they prepare for their 4th Annual League. Come meet the team and cheer on the world famous ''Black Star Polo'' program!', 
  '2024-12-04T12:00:00', '2024-12-04T15:00:00',
  'Splash Social Center, Spintex', 'Splash Social Center, Spintex, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Sports & Fitness', 'Black Star Polo', NULL, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', ARRAY['Sports', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-18T19:16:00';

-- Event 5: Diaspora in Ghana: Roots & Resettlement Brunch
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Diaspora in Ghana: Roots & Resettlement Brunch', 'Get ready for another unforgettable experience at Diaspora in Ghana Brunch. The community will come together to share insights, forge connections, and build lifelong connections with other diasporas in various stages of moving to Ghana.', 
  '2024-12-12T17:00:00', '2024-12-12T22:00:00',
  'Jo-Anne''s Cafe, Afrikiko', 'Jo-Anne''s Cafe, Afrikiko, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'African Diaspora Group', NULL, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-17T10:28:00';

-- Event 6: Divination Ahoto Retreats
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Divination Ahoto Retreats', 'Ahoto Healing Home Retreats offers transformative experiences grounded in self-healing and ancient ancestral wisdom. Engage in holistic activities like KraYoga, African Breathwork Rituals, Meditation, and nature therapy.', 
  '2024-12-26T17:00:00', '2024-12-26T22:00:00',
  'Ahoto Healing and Wellness Home', 'Ahoto Healing and Wellness Home, Prampram, Ghana',
  (SELECT id FROM cities WHERE name = 'Prampram' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Education & Workshops', 'Ahoto Healing Home', NULL, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', ARRAY['Education', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-14T12:13:00';

-- Event 7: African Tea Traditions: Tea Tasting and Herbal Blending
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'African Tea Traditions: Tea Tasting and Herbal Blending', 'Join us for the Aguma Tea African Tea Experience where tea enthusiasts and wellness seekers can explore the rich world of African Herbal tea. Enjoy live herbal tea demonstrations and tasting sessions.', 
  '2024-12-05T19:00:00', '2024-12-06T02:00:00',
  'Talkative Mon Stadio''s', 'Talkative Mon Stadio''s, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Food & Drink', 'Aguma Tea', NULL, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', ARRAY['Food', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-21T15:00:00';

-- Event 8: EarlyFest - Early Childhood Education Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'EarlyFest - Early Childhood Education Festival', 'EarlyFest is an annual event that seeks to bring early years educators, school children, parents and other stakeholders in the sector to share knowledge, ideas, network and socialize.', 
  '2024-12-09T10:00:00', '2024-12-09T12:00:00',
  'Efua Sutherland Children''s Park', 'Efua Sutherland Children''s Park, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Education & Workshops', 'Early Childhood Education Ghana', NULL, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', ARRAY['Education', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-11T12:45:00';

-- Event 9: Diaspora Citizenship Ceremony
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Diaspora Citizenship Ceremony', 'The President of Ghana H.E Nana Addo Dankwa Akufo-Addo will honor some members of the diaspora community with Ghanaian citizenship. These are persons who have demonstrated a steadfast commitment to Ghana.', 
  '2024-12-19T10:00:00', '2024-12-19T17:00:00',
  'Government House', 'Government House, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Community & Social', 'Government of Ghana', NULL, 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', ARRAY['Community', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-23T11:12:00';

-- Event 10: Anwamoo Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Anwamoo Festival', 'Anwamoo festival is a social event which brings people from diverse backgrounds to socialize, network while they enjoy the local delicacy anwamoo.', 
  '2024-12-24T14:00:00', '2024-12-24T20:00:00',
  'Legon City Mall', 'Legon City Mall, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Food & Drink', 'Anwamoo Cultural Group', NULL, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['Food', 'Ghana', 'December', 'BeyondTheReturn'], 100, true, 'upcoming', '2024-11-28T12:42:00';

-- Event 11: Gold Statement
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Gold Statement', 'Gold Statement is an annual exhibition, conference and jewellery show that brings all stakeholders together to deliberate on the promotion of value addition to Ghana''s sustainably mined precious minerals.', 
  '2024-12-14T18:00:00', '2024-12-14T23:00:00',
  'Lancaster Hotel and Marriott Hotel', 'Lancaster Hotel and Marriott Hotel, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'Rapport Services', NULL, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-03T11:48:00';

-- Event 12: Four Play
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Four Play', 'In an attempt to get her divorced parents on the cordial side, Faith lodges them into the same hotel suite when they travel for her wedding. Things take a dramatic turn when the butler witnesses their raw angst.', 
  '2024-12-07T20:00:00', '2024-12-07T22:00:00',
  'National Theatre', 'National Theatre, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'Roverman Productions', NULL, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-12T21:24:00';

-- Event 13: Rhythms on Da Runway
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Rhythms on Da Runway', 'Biggest night of music and fashion in Ghana. This event brings together the finest in the orange economy in Ghana and the African diaspora.', 
  '2024-12-21T11:00:00', '2024-12-21T19:00:00',
  'Grand Arena', 'Grand Arena, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Music & Concerts', 'Nineteen57 Africa', NULL, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', ARRAY['Music', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-17T22:21:00';

-- Event 14: Kids in Tourism Festival
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Kids in Tourism Festival', 'An annual tourism and cultural event that brings together children in the basic school levels to introduce them to Ghana''s rich cultural heritage through dancing, recitals, poetry, drama, music, and fashion.', 
  '2024-12-24T17:00:00', '2024-12-25T01:00:00',
  'Various Locations', 'Various Locations, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Community & Social', 'Kids in Tourism Ghana', NULL, 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', ARRAY['Community', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-12T13:23:00';

-- Event 15: Afropiano Rave
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Afropiano Rave', 'Afropiano Rave is a vibrant outdoor event celebrating the beauty of Laboma Beach in Accra, Ghana. Our goal this year is to promote tourism, showcase local talent, and foster community engagement.', 
  '2024-12-17T16:00:00', '2024-12-17T19:00:00',
  'Laboma Beach', 'Laboma Beach, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Music & Concerts', 'Grant Multimedia', NULL, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', ARRAY['Music', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-04T19:47:00';

-- Event 16: A Day at Bisa Aberwa Museum
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'A Day at Bisa Aberwa Museum', 'Discover a captivating collection of over 2,200 artifacts from across Africa, each telling the powerful story of our shared history as Black people. From mesmerizing paintings to intricate carvings and sculptures.', 
  '2024-12-11T14:00:00', '2024-12-11T17:00:00',
  'Bisa Aberwa Museum', 'Bisa Aberwa Museum, Sekondi, Ghana',
  (SELECT id FROM cities WHERE name = 'Sekondi' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'Bisa Aberwa Museum', NULL, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-07T12:21:00';

-- Event 17: Brunch and Beyond: Real Estate Networking
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Brunch and Beyond: Real Estate Networking', 'Brunch & Beyond is the perfect opportunity to connect with like-minded Diasporas in the real estate industry from around the world. Whether you are a seasoned investor or simply interested in the industry, this event promises valuable insights.', 
  '2024-12-22T20:00:00', '2024-12-22T22:00:00',
  'Luxury Hotel Accra', 'Luxury Hotel Accra, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'Akweya Properties', NULL, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 50, true, 'upcoming', '2024-11-22T19:30:00';

-- Event 18: Inspiration Weekend: Month Long Events
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Inspiration Weekend: Month Long Events', 'Be a part of our philanthropic and community service projects, sporting events, business and technology conference, Cash Prize Pitch Competition, festival, as well as investment opportunities to empower the youth.', 
  '2024-12-15T13:00:00', '2024-12-15T21:00:00',
  'Multiple Venues', 'Multiple Venues, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Community & Social', 'Free Inspiration', NULL, 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', ARRAY['Community', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-15T10:44:00';

-- Event 19: Black Star Polo All Star Matches
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Black Star Polo All Star Matches', 'Come and witness a day of friendly matches between Ghana''s top youth and senior Water Polo athletes as they prepare for their 4th Annual League in the new year.', 
  '2024-12-23T16:00:00', '2024-12-23T19:00:00',
  'Splash Social Center, Spintex', 'Splash Social Center, Spintex, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Sports & Fitness', 'Black Star Polo', NULL, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', ARRAY['Sports', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-06T14:25:00';

-- Event 20: Invest in Ghana 2024: Real Estate Investment Event
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Invest in Ghana 2024: Real Estate Investment Event', 'An Exclusive Real Estate Investment Event & Homebuyer Workshop hosted by Akweya Properties! Join us for an opportunity to explore real estate investment properties in Ghana.', 
  '2024-12-16T10:00:00', '2024-12-16T15:00:00',
  'Conference Center', 'Conference Center, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'Akweya Properties', NULL, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 200, true, 'upcoming', '2024-11-28T17:32:00';

-- Event 21: Connect the Dots Networking Extravaganza
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Connect the Dots Networking Extravaganza', 'This is an empowering event designed to help you achieve your professional and business goals in Ghana. Attendees will have the chance to introduce themselves, share their skills and services, and express their needs.', 
  '2024-12-01T12:00:00', '2024-12-01T15:00:00',
  'Conference Hall', 'Conference Hall, Kumasi, Ghana',
  (SELECT id FROM cities WHERE name = 'Kumasi' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'On Our Watch Global', NULL, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-19T11:52:00';

-- Event 22: Highlife Jam
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Highlife Jam', 'A selection of Ghanaian highlife music from the 60''s, 70''s and 80''s. Experience the golden era of Ghanaian music.', 
  '2024-12-10T11:00:00', '2024-12-10T15:00:00',
  'Folksplace, National Theatre', 'Folksplace, National Theatre, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Music & Concerts', 'National Theatre Ghana', NULL, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', ARRAY['Music', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-22T22:27:00';

-- Event 23: Poetic Palette
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Poetic Palette', 'Poetic Palette is an enchanting Christmas event that seeks to fuse the rich flavours of Ghanaian cuisine with the evocative power of Poetry. This event offers an immersive cultural and sensory experience.', 
  '2024-12-16T14:00:00', '2024-12-16T22:00:00',
  'Accra Tourist Information Centre', 'Accra Tourist Information Centre, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'Ashong Programs', NULL, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-15T20:26:00';

-- Event 24: Esoyor (Dance Performance)
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Esoyor (Dance Performance)', 'An afro contemporary dance piece that explores the insane energies, confrontations and rewards of a dance artist before reaching his/her peak.', 
  '2024-12-24T13:00:00', '2024-12-24T18:00:00',
  'Dance Hall, National Theatre', 'Dance Hall, National Theatre, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'National Theatre Ghana', NULL, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-05T17:40:00';

-- Event 25: Plantbased Vegan Market
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Plantbased Vegan Market', 'The Plantbased Vegan Market is an exciting three-day event that brings together plant-based and vegan producers from across Africa. This market will showcase a diverse range of vegan products, from food and cosmetics to supplements.', 
  '2024-12-24T13:00:00', '2024-12-24T17:00:00',
  'Center for National Culture (Arts Center)', 'Center for National Culture (Arts Center), Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Food & Drink', 'Plantbased Vegan Market Initiative', NULL, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['Food', 'Ghana', 'December', 'BeyondTheReturn'], NULL, true, 'upcoming', '2024-11-07T11:41:00';

-- Event 26: Bride of the Gods (Drama)
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Bride of the Gods (Drama)', 'One day, a high priest catches the only daughter who is betrothed to the gods of their land, in an uncompromising position with Subinzali, his head servant. A dramatic tale of love and tradition.', 
  '2024-12-01T16:00:00', '2024-12-01T21:00:00',
  'Folksplace, National Theatre', 'Folksplace, National Theatre, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Arts & Culture', 'National Theatre Ghana', NULL, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800', ARRAY['Arts', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-02T22:21:00';

-- Event 27: Murder Mystery Dinner
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Murder Mystery Dinner', 'Murder Mystery Dinner: This year, let''s celebrate Ghana dressed in cultural attire for a night of mystery, culinary, and murder enigma. Whilst enjoying a 3-course meal you will have an immersive experience.', 
  '2024-12-17T13:00:00', '2024-12-17T20:00:00',
  'Crescendo Foods in West Land', 'Crescendo Foods in West Land, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Food & Drink', 'Crescendo Foods', NULL, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', ARRAY['Food', 'Ghana', 'December', 'BeyondTheReturn'], 1000, true, 'upcoming', '2024-11-17T18:43:00';

-- Event 28: Mayekoo Beach Please
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Mayekoo Beach Please', 'Mayekoo Beach Please is a social impact and environmental sustainability initiative that brings together local communities and volunteers to remove plastic waste and debris from the beach.', 
  '2024-12-03T13:00:00', '2024-12-03T18:00:00',
  'Labadi / Laboma Beach', 'Labadi / Laboma Beach, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Community & Social', 'Mayekoo', NULL, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', ARRAY['Community', 'Ghana', 'December', 'BeyondTheReturn'], 200, true, 'upcoming', '2024-11-19T13:19:00';

-- Event 29: A Journey to Womb Wealth and Wellness
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'A Journey to Womb Wealth and Wellness', 'Travel Deeper Inc. is hosting its annual event focused on connecting Black women across the global diaspora and raising awareness about women''s health, including uterine fibroids.', 
  '2024-12-18T11:00:00', '2024-12-18T15:00:00',
  'Wellness Center Osu', 'Wellness Center Osu, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Education & Workshops', 'Travel Deeper Inc', NULL, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', ARRAY['Education', 'Ghana', 'December', 'BeyondTheReturn'], 50, true, 'upcoming', '2024-11-08T13:07:00';

-- Event 30: Christmas Village
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Christmas Village', 'Ghud Park at Accra Mall is hosting the Christmas Village. This exciting event will feature a variety of activities, including performances, exhibitions, movie nights, skating activities, and a kids'' playground.', 
  '2024-12-13T12:00:00', '2024-12-13T14:00:00',
  'Accra Mall Ghud Park', 'Accra Mall Ghud Park, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Community & Social', 'Ghud Park', NULL, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', ARRAY['Community', 'Ghana', 'December', 'BeyondTheReturn'], 200, true, 'upcoming', '2024-11-13T15:13:00';

-- Event 31: Ghana Property & Lifestyle Expo
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Ghana Property & Lifestyle Expo', 'The Ghana Property and Lifestyle Expo is an immersive and dynamic event that aims to showcase the best of Ghana''s real estate and lifestyle offerings. Spanning over several days, this expo brings together developers, investors, and homeowners.', 
  '2024-12-17T12:00:00', '2024-12-17T15:00:00',
  'Alisa Hotel', 'Alisa Hotel, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'OnPoint Property', NULL, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 500, true, 'upcoming', '2024-11-27T14:23:00';

-- Event 32: Polo Beach Club
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Polo Beach Club', 'Polo Beach Club is December''s ultimate hotspot, transforming into the perfect place for relaxation and excitement. By day, indulge in exquisite meals with stunning beachfront views. By night, enjoy star-studded parties with world-class DJs.', 
  '2024-12-25T13:00:00', '2024-12-25T20:00:00',
  'Polo Beach Club, La', 'Polo Beach Club, La, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Nightlife & Parties', 'Obago Unlimited', NULL, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', ARRAY['Nightlife', 'Ghana', 'December', 'BeyondTheReturn'], 100, true, 'upcoming', '2024-11-21T15:26:00';

-- Event 33: MoneyHub Business Summit
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'MoneyHub Business Summit', 'A networking event that brings stakeholders together to set agenda for the new year while fostering strategic partnerships.', 
  '2024-12-17T10:00:00', '2024-12-17T12:00:00',
  'Accra City Hotel', 'Accra City Hotel, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Business & Networking', 'MoneyHub', NULL, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', ARRAY['Business', 'Ghana', 'December', 'BeyondTheReturn'], 200, true, 'upcoming', '2024-11-14T10:12:00';

-- Event 34: Mixed Bag (Music)
INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)
SELECT 'Mixed Bag (Music)', 'A night of Western and African classical music. Experience the fusion of cultures through beautiful musical performances.', 
  '2024-12-20T16:00:00', '2024-12-20T19:00:00',
  'Folksplace, National Theatre', 'Folksplace, National Theatre, Accra, Ghana',
  (SELECT id FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  'Music & Concerts', 'National Theatre Ghana', NULL, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', ARRAY['Music', 'Ghana', 'December', 'BeyondTheReturn'], 200, true, 'upcoming', '2024-11-27T15:04:00';


-- Total: 34 Ghana events imported

-- ============================================================================
-- CREATE GHANA CITIES IF THEY DON'T EXIST
-- ============================================================================

-- City: Sekondi
INSERT INTO cities (name, country_id, created_at)
SELECT 'Sekondi', 
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE name = 'Sekondi' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana')
);

-- City: Prampram
INSERT INTO cities (name, country_id, created_at)
SELECT 'Prampram', 
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE name = 'Prampram' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana')
);

-- City: Accra
INSERT INTO cities (name, country_id, created_at)
SELECT 'Accra', 
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE name = 'Accra' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana')
);

-- City: Kumasi
INSERT INTO cities (name, country_id, created_at)
SELECT 'Kumasi', 
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE name = 'Kumasi' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana')
);

-- City: Tamale
INSERT INTO cities (name, country_id, created_at)
SELECT 'Tamale', 
  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE name = 'Tamale' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana')
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check totals by country
SELECT 
  c.name as country,
  COUNT(e.id) as total_events
FROM events e
JOIN countries c ON e.country_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- Check total businesses
SELECT COUNT(*) as total_businesses FROM businesses;

-- Grand totals
SELECT 
  (SELECT COUNT(*) FROM businesses) as businesses,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM businesses) + (SELECT COUNT(*) FROM events) as total_records;
