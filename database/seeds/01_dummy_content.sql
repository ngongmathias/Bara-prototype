-- Seed Data for Bara Prototype (Streams & Sports)
-- This script repopulates the database with dummy content for UI testing.

-- 1. CLEANUP (Optional - be careful in production, but okay for prototype)
-- TRUNCATE songs, albums, artists, sports_news, sports_videos, matches, teams, leagues CASCADE;

-- 2. SEED STREAMS (Music)
WITH new_artists AS (
  INSERT INTO artists (name, bio, image_url, is_verified) VALUES
  ('Burna Boy', 'The African Giant.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80', true),
  ('Tyla', 'Amapiano pop sensation.', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&q=80', true),
  ('Davido', 'Afrobeats legend.', 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=500&q=80', true),
  ('Kabza De Small', 'King of Amapiano.', 'https://images.unsplash.com/photo-1549833284-6a7df0b72665?w=500&q=80', true),
  ('Black Coffee', 'International DJ and Producer.', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&q=80', true)
  RETURNING id, name
),
new_albums AS (
  INSERT INTO albums (artist_id, title, cover_url, release_date, genre)
  SELECT id, name || ' - Greatest Hits', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80', NOW(), 'Afrobeats'
  FROM new_artists
  RETURNING id, artist_id
)
INSERT INTO songs (artist_id, album_id, title, file_url, cover_url, duration, plays)
SELECT 
  na.artist_id, 
  na.id, 
  'Track ' || floor(random() * 10 + 1)::text || ' - ' || (SELECT name FROM new_artists WHERE id = na.artist_id), 
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' || floor(random() * 16 + 1)::text || '.mp3',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
  180 + floor(random() * 60)::int,
  floor(random() * 1000000)::int
FROM new_albums na
CROSS JOIN generate_series(1, 5); -- 5 songs per album

-- 3. SEED SPORTS NEWS
INSERT INTO sports_news (title, category, image_url, author, content) VALUES
('Mamelodi Sundowns clinch 7th consecutive PSL title', 'PSL', 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=800&q=80', 'Staff Reporter', 'The Brazilians have done it again...'),
('Springboks announce squad for upcoming Rugby Championship', 'Rugby', 'https://images.unsplash.com/photo-1533561334057-79754f9a5620?w=800&q=80', 'Rugby Desk', 'Rassie Erasmus has selected...'),
('Bafana Bafana rise in latest FIFA rankings', 'Football', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', 'Soccer Laduma', 'Hugo Broos men have moved up...'),
('Proteas women beat Australia in historic T20 victory', 'Cricket', 'https://images.unsplash.com/photo-1531415074968-bc2366c912da?w=800&q=80', 'Cricket SA', 'Laura Wolvaardt scored a matching winning...'),
('Dricus du Plessis to defend UFC title in South Africa?', 'UFC', 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80', 'MMA Junkie', 'Dana White hints at Cape Town event...'),
('Kaizer Chiefs appoint new head coach from Tunisia', 'PSL', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80', 'KickOff', 'Nasreddine Nabi is the new man in charge...'),
('Orlando Pirates win Nedbank Cup final', 'PSL', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80', 'Sowetan Live', 'Relebohile Mofokeng scored the winner...'),
('Formula 1 considering return to Kyalami', 'Motorsport', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', 'F1 News', 'Lewis Hamilton pushes for African GP...'),
('Caster Semenya wins legal battle', 'Athletics', 'https://images.unsplash.com/photo-1552674605-5d28c4e1902c?w=800&q=80', 'News24', 'European Court of Human Rights rules in favor...'),
('Siya Kolisi returns to Sharks from Racing 92', 'Rugby', 'https://images.unsplash.com/photo-1628891892233-04286161836f?w=800&q=80', 'Shark Tank', 'The captain is back in Durban...');

-- 4. SEED SPORTS VIDEOS
INSERT INTO sports_videos (title, video_url, duration, league, is_live) VALUES
('Match Highlights: Chiefs vs Pirates', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', '10:24', 'Betway Premiership', false),
('Rassie Erasmus Press Conference', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', '15:30', 'International Rugby', true),
('Goal of the Month: Gaston Sirino', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', '03:12', 'Betway Premiership', false),
('UFC 305 Embedded: Vlog Series', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', '09:45', 'UFC', false),
('Bafana Bafana Training Session', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', '05:00', 'WC Qualifiers', false);

-- 5. SEED LEAGUES & MATCHES (For Ticker)
WITH new_leagues AS (
  INSERT INTO leagues (name, type) VALUES ('Betway Premiership', 'league'), ('English Premier League', 'league') RETURNING id, name
),
new_teams AS (
  INSERT INTO teams (name, short_name, league_id)
  SELECT 'Mamelodi Sundowns', 'MAM', id FROM new_leagues WHERE name = 'Betway Premiership'
  UNION ALL
  SELECT 'Orlando Pirates', 'ORL', id FROM new_leagues WHERE name = 'Betway Premiership'
  UNION ALL
  SELECT 'Kaizer Chiefs', 'KAI', id FROM new_leagues WHERE name = 'Betway Premiership'
  UNION ALL
  SELECT 'Manchester City', 'MCI', id FROM new_leagues WHERE name = 'English Premier League'
  UNION ALL
  SELECT 'Arsenal', 'ARS', id FROM new_leagues WHERE name = 'English Premier League'
  RETURNING id, name, short_name, league_id
)
INSERT INTO matches (league_id, home_team_id, away_team_id, match_date, status, home_score, away_score, minute)
SELECT 
   l.id,
   (SELECT id FROM new_teams WHERE name = 'Mamelodi Sundowns'),
   (SELECT id FROM new_teams WHERE name = 'Orlando Pirates'),
   NOW(),
   'LIVE',
   1,
   1,
   '67'''
FROM new_leagues l WHERE l.name = 'Betway Premiership'
UNION ALL
SELECT 
   l.id,
   (SELECT id FROM new_teams WHERE name = 'Manchester City'),
   (SELECT id FROM new_teams WHERE name = 'Arsenal'),
   NOW(),
   'FT',
   3,
   1,
   'FT'
FROM new_leagues l WHERE l.name = 'English Premier League';
