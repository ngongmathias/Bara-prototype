-- ============================================================
-- SPRINT 7: Comprehensive Test Data Migration
-- Created: 2026-03-19
-- Purpose:
--   1. Fix ALL existing songs with working audio URLs (SoundHelix)
--   2. Add 4 new artists, 4 new albums, 13 new songs (total: 12 artists, 12 albums, ~60 songs)
--   3. Create 5 platform playlists with songs
--   4. Create podcasts tables + seed 6 podcasts with 30 episodes
--   5. Create movies tables + seed 10 movies with 6 categories
--   6. RLS policies for all new tables
-- ============================================================

-- =====================
-- PART 1: Fix existing song audio URLs
-- =====================
-- Update all songs that still have placeholder URLs
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000001';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000002';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000003';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000004';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000005';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000006';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000007';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000008';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000009';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000010';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000011';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000012';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000013';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000014';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000015';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000016';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000017';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000018';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000019';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000020';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000021';
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' WHERE id = 'c1000000-0000-0000-0000-000000000022';

-- Catch-all: any song still pointing to placeholder gets a working URL
UPDATE public.songs SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' || (abs(hashtext(id::text)) % 16 + 1)::text || '.mp3'
WHERE file_url IS NULL OR file_url = '' OR file_url = '/audio/placeholder.mp3';

-- =====================
-- PART 2: New Artists (4 new, IDs 0009-0012)
-- =====================
INSERT INTO public.artists (id, name, image_url, bio, genre, country, is_verified, monthly_listeners, banner_url)
VALUES
  ('a1000000-0000-0000-0000-000000000009', 'Fireboy DML', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', 'Nigerian Afropop singer-songwriter. Known for Peru, Bandana, and Playboy. YBNL Music signee.', 'Afropop', 'Nigeria', true, 20000000, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=400&fit=crop'),
  ('a1000000-0000-0000-0000-000000000010', 'Kabza De Small', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', 'South African DJ and record producer. Known as the King of Amapiano. Pioneer of the Amapiano genre.', 'Amapiano', 'South Africa', true, 16000000, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=400&fit=crop'),
  ('a1000000-0000-0000-0000-000000000011', 'Asa', 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', 'Nigerian-French singer-songwriter. Known for her soulful voice blending folk, jazz, and West African Highlife.', 'Highlife', 'Nigeria', true, 7000000, 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=1200&h=400&fit=crop'),
  ('a1000000-0000-0000-0000-000000000012', 'Innoss''B', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 'Congolese singer, dancer and songwriter. Known for blending Ndombolo with modern Afrobeats.', 'Ndombolo', 'DR Congo', true, 4500000, 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=400&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- PART 3: New Albums (4 new, IDs 0009-0012)
-- =====================
INSERT INTO public.albums (id, title, artist_id, cover_url, release_date, genre)
VALUES
  ('b1000000-0000-0000-0000-000000000009', 'Playboy', 'a1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', '2025-08-05', 'Afropop'),
  ('b1000000-0000-0000-0000-000000000010', 'KOA II', 'a1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', '2025-12-01', 'Amapiano'),
  ('b1000000-0000-0000-0000-000000000011', 'V', 'a1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', '2025-02-11', 'Highlife'),
  ('b1000000-0000-0000-0000-000000000012', 'Yope', 'a1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', '2025-05-20', 'Ndombolo')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- PART 4: New Songs (13 new, IDs 0023-0035)
-- =====================
INSERT INTO public.songs (id, title, artist_id, album_id, file_url, cover_url, duration, plays, genre, track_number, uploaded_by, upload_type)
VALUES
  -- Fireboy DML - Playboy
  ('c1000000-0000-0000-0000-000000000023', 'Peru', 'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', 198, 8500000, 'Afropop', 1, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000024', 'Bandana', 'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', 215, 6200000, 'Afropop', 2, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000025', 'Playboy', 'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', 230, 4100000, 'Afropop', 3, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000026', 'Sofri', 'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', 185, 3000000, 'Afropop', 4, 'admin', 'platform'),

  -- Kabza De Small - KOA II
  ('c1000000-0000-0000-0000-000000000027', 'Sponono', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', 245, 7200000, 'Amapiano', 1, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000028', 'Asibe Happy', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', 260, 5800000, 'Amapiano', 2, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000029', 'Imithandazo', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', 275, 4500000, 'Amapiano', 3, 'admin', 'platform'),

  -- Asa - V
  ('c1000000-0000-0000-0000-000000000030', 'Jailer', 'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000011', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', 220, 9500000, 'Highlife', 1, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000031', 'Be My Man', 'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000011', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', 195, 3200000, 'Highlife', 2, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000032', 'IDG', 'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000011', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', 210, 2800000, 'Highlife', 3, 'admin', 'platform'),

  -- Innoss'B - Yope
  ('c1000000-0000-0000-0000-000000000033', 'Yope', 'a1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000012', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 205, 6800000, 'Ndombolo', 1, 'admin', 'platform'),
  ('c1000000-0000-0000-0000-000000000034', 'Mabele', 'a1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000012', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 195, 3900000, 'Ndombolo', 2, 'admin', 'platform')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- PART 5: Platform Playlists (5 curated playlists)
-- =====================
INSERT INTO public.playlists (id, title, description, cover_url, is_public, created_by)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Afrobeats Essentials', 'The biggest Afrobeats hits all in one place. Updated weekly.', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', true, 'platform'),
  ('p1000000-0000-0000-0000-000000000002', 'Amapiano Heat', 'The hottest Amapiano tracks from South Africa and beyond.', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', true, 'platform'),
  ('p1000000-0000-0000-0000-000000000003', 'Chill African Vibes', 'Relax and unwind with soulful African melodies.', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', true, 'platform'),
  ('p1000000-0000-0000-0000-000000000004', 'Workout Africa', 'High-energy African beats to fuel your workout.', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', true, 'platform'),
  ('p1000000-0000-0000-0000-000000000005', 'New Releases Radar', 'Fresh tracks from Africa''s top artists. Updated daily.', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', true, 'platform')
ON CONFLICT (id) DO NOTHING;

-- Playlist Songs: Afrobeats Essentials (10 songs)
INSERT INTO public.playlist_songs (playlist_id, song_id, position) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 1),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 2),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000018', 3),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000023', 4),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000024', 5),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000033', 6),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000015', 7),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000020', 8),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 9),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 10)
ON CONFLICT (playlist_id, song_id) DO NOTHING;

-- Playlist Songs: Amapiano Heat (8 songs)
INSERT INTO public.playlist_songs (playlist_id, song_id, position) VALUES
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000027', 1),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000028', 2),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000029', 3),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000010', 4),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000011', 5),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000012', 6),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000013', 7),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000014', 8)
ON CONFLICT (playlist_id, song_id) DO NOTHING;

-- Playlist Songs: Chill African Vibes (8 songs)
INSERT INTO public.playlist_songs (playlist_id, song_id, position) VALUES
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006', 1),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000007', 2),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008', 3),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 4),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000030', 5),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000031', 6),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000016', 7),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000017', 8)
ON CONFLICT (playlist_id, song_id) DO NOTHING;

-- Playlist Songs: Workout Africa (8 songs)
INSERT INTO public.playlist_songs (playlist_id, song_id, position) VALUES
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 1),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000023', 2),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000027', 3),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000033', 4),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 5),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000018', 6),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000025', 7),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000034', 8)
ON CONFLICT (playlist_id, song_id) DO NOTHING;

-- Playlist Songs: New Releases Radar (10 songs - newest tracks)
INSERT INTO public.playlist_songs (playlist_id, song_id, position) VALUES
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000023', 1),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000024', 2),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000025', 3),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000027', 4),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000028', 5),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000030', 6),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000033', 7),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000034', 8),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000031', 9),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000032', 10)
ON CONFLICT (playlist_id, song_id) DO NOTHING;

-- =====================
-- PART 6: Podcasts Schema + Seed Data
-- =====================

-- Tables
CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    host TEXT NOT NULL,
    description TEXT,
    category TEXT,
    cover_url TEXT,
    language TEXT DEFAULT 'en',
    is_featured BOOLEAN DEFAULT false,
    subscriber_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.podcast_episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    episode_number INTEGER,
    season_number INTEGER DEFAULT 1,
    published_at TIMESTAMPTZ DEFAULT now(),
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.podcast_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, podcast_id)
);

CREATE TABLE IF NOT EXISTS public.podcast_listen_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    episode_id UUID REFERENCES public.podcast_episodes(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    listened_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_listen_history ENABLE ROW LEVEL SECURITY;

-- Public read on podcasts and episodes
CREATE POLICY IF NOT EXISTS "Podcasts are viewable by everyone" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Podcast episodes are viewable by everyone" ON public.podcast_episodes FOR SELECT USING (true);

-- Authenticated read/write on subscriptions and listen history
CREATE POLICY IF NOT EXISTS "Users can manage their subscriptions" ON public.podcast_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Users can manage their listen history" ON public.podcast_listen_history FOR ALL USING (true) WITH CHECK (true);

-- Admin full access
CREATE POLICY IF NOT EXISTS "Admins can manage podcasts" ON public.podcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admins can manage episodes" ON public.podcast_episodes FOR ALL USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT ON public.podcasts TO anon, authenticated;
GRANT SELECT ON public.podcast_episodes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcast_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcast_listen_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcast_episodes TO authenticated;

-- Seed Podcasts
INSERT INTO public.podcasts (id, title, host, description, category, cover_url, is_featured, subscriber_count)
VALUES
  ('pd100000-0000-0000-0000-000000000001', 'The African Dream', 'Amara Kone', 'Stories of founders building across the continent. From Lagos to Nairobi, hear how African entrepreneurs are reshaping industries.', 'Entrepreneurship', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=300&fit=crop', true, 12400),
  ('pd100000-0000-0000-0000-000000000002', 'Naija Tech Talk', 'Tunde Obi', 'Africa''s tech ecosystem — startups, funding & innovation. Weekly deep dives into the companies changing the continent.', 'Technology', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop', true, 8900),
  ('pd100000-0000-0000-0000-000000000003', 'Ubuntu Conversations', 'Thabo Mokoena', 'Pan-African dialogues on identity, culture & unity. Exploring what it means to be African in the modern world.', 'Culture', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&h=300&fit=crop', true, 6700),
  ('pd100000-0000-0000-0000-000000000004', 'Accra After Dark', 'Ama Serwaa', 'Mysteries and untold stories from West Africa. True crime meets investigative journalism.', 'True Crime', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=300&fit=crop', false, 15200),
  ('pd100000-0000-0000-0000-000000000005', 'Laugh Out Loud Africa', 'Basket Mouth & Friends', 'The funniest comedians on the continent. Stand-up clips, interviews, and hilarious conversations.', 'Comedy', 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=300&h=300&fit=crop', false, 21000),
  ('pd100000-0000-0000-0000-000000000006', 'The Pitch Room', 'Keza Ngowi', 'Investment, wealth & personal finance for Africans. Learn how to build generational wealth from Africa''s top financial minds.', 'Finance', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=300&fit=crop', true, 9800)
ON CONFLICT (id) DO NOTHING;

-- Seed Podcast Episodes (5 per podcast = 30 total)
INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, duration, episode_number, season_number, published_at, play_count)
VALUES
  -- The African Dream
  ('pe100000-0000-0000-0000-000000000001', 'pd100000-0000-0000-0000-000000000001', 'From Zero to Unicorn: Flutterwave''s Journey', 'How Flutterwave became Africa''s most valuable startup.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 2400, 1, 1, '2026-01-05', 4500),
  ('pe100000-0000-0000-0000-000000000002', 'pd100000-0000-0000-0000-000000000001', 'The Kigali Tech Hub Revolution', 'Rwanda is becoming Africa''s Silicon Valley. Here''s why.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 1800, 2, 1, '2026-01-12', 3200),
  ('pe100000-0000-0000-0000-000000000003', 'pd100000-0000-0000-0000-000000000001', 'Women Leading Africa''s Fintech Boom', 'Meet the women building the future of finance in Africa.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 2100, 3, 1, '2026-01-19', 2800),
  ('pe100000-0000-0000-0000-000000000004', 'pd100000-0000-0000-0000-000000000001', 'Agriculture 2.0: Tech Meets Farming', 'How AI and drones are transforming African agriculture.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 1950, 4, 1, '2026-01-26', 1900),
  ('pe100000-0000-0000-0000-000000000005', 'pd100000-0000-0000-0000-000000000001', 'Building in Africa vs Silicon Valley', 'A founder shares why they left Google to build in Lagos.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 2250, 5, 1, '2026-02-02', 2100),

  -- Naija Tech Talk
  ('pe100000-0000-0000-0000-000000000006', 'pd100000-0000-0000-0000-000000000002', 'Nigeria''s $4B Startup Ecosystem', 'Breaking down the numbers behind Nigeria''s tech boom.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 1800, 1, 1, '2026-01-07', 3800),
  ('pe100000-0000-0000-0000-000000000007', 'pd100000-0000-0000-0000-000000000002', 'Paystack to Stripe: The Acquisition Story', 'The inside story of Africa''s biggest tech acquisition.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 2100, 2, 1, '2026-01-14', 5200),
  ('pe100000-0000-0000-0000-000000000008', 'pd100000-0000-0000-0000-000000000002', 'AI in Africa: Opportunities & Challenges', 'Can Africa leapfrog into the AI revolution?', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 1950, 3, 1, '2026-01-21', 2900),
  ('pe100000-0000-0000-0000-000000000009', 'pd100000-0000-0000-0000-000000000002', 'Mobile Money: Africa''s Fintech Superpower', 'M-Pesa and beyond — how mobile money is changing lives.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 2400, 4, 1, '2026-01-28', 3100),
  ('pe100000-0000-0000-0000-000000000010', 'pd100000-0000-0000-0000-000000000002', 'Cybersecurity in Africa', 'The growing threat landscape and how Africa is responding.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 1650, 5, 1, '2026-02-04', 1800),

  -- Ubuntu Conversations
  ('pe100000-0000-0000-0000-000000000011', 'pd100000-0000-0000-0000-000000000003', 'What Does Pan-Africanism Mean in 2026?', 'A roundtable on the future of African unity.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 2700, 1, 1, '2026-01-03', 2400),
  ('pe100000-0000-0000-0000-000000000012', 'pd100000-0000-0000-0000-000000000003', 'African Languages in the Digital Age', 'Are African languages thriving or dying online?', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 1800, 2, 1, '2026-01-10', 1900),
  ('pe100000-0000-0000-0000-000000000013', 'pd100000-0000-0000-0000-000000000003', 'Afrofuturism: Imagining Africa''s Tomorrow', 'How artists and writers are reimagining the continent.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 2100, 3, 1, '2026-01-17', 2200),
  ('pe100000-0000-0000-0000-000000000014', 'pd100000-0000-0000-0000-000000000003', 'Diaspora Connections: Home Away from Home', 'Stories of Africans building community abroad.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 1950, 4, 1, '2026-01-24', 1600),
  ('pe100000-0000-0000-0000-000000000015', 'pd100000-0000-0000-0000-000000000003', 'African Fashion Goes Global', 'From Ankara to the runway — Africa''s fashion revolution.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 2250, 5, 1, '2026-01-31', 2700),

  -- Accra After Dark
  ('pe100000-0000-0000-0000-000000000016', 'pd100000-0000-0000-0000-000000000004', 'The Disappearance of the Golden Stool', 'The mysterious theft of Ghana''s most sacred artifact.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 2700, 1, 1, '2026-01-06', 6200),
  ('pe100000-0000-0000-0000-000000000017', 'pd100000-0000-0000-0000-000000000004', 'Lagos Underground: The Untold Stories', 'What happens beneath the streets of Africa''s largest city.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 2400, 2, 1, '2026-01-13', 5800),
  ('pe100000-0000-0000-0000-000000000018', 'pd100000-0000-0000-0000-000000000004', 'The Nairobi Cold Case Files', 'Reopening unsolved cases from Kenya''s capital.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 2100, 3, 1, '2026-01-20', 4900),
  ('pe100000-0000-0000-0000-000000000019', 'pd100000-0000-0000-0000-000000000004', 'Fraud Capital: The Sakawa Boys', 'Inside Ghana''s cybercrime underworld.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 2550, 4, 1, '2026-01-27', 7100),
  ('pe100000-0000-0000-0000-000000000020', 'pd100000-0000-0000-0000-000000000004', 'The Diamond Heist of Sierra Leone', 'A true story of greed, betrayal, and precious stones.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 2850, 5, 1, '2026-02-03', 5500),

  -- Laugh Out Loud Africa
  ('pe100000-0000-0000-0000-000000000021', 'pd100000-0000-0000-0000-000000000005', 'Best of Basket Mouth: Live in Lagos', 'Highlights from Basket Mouth''s sold-out Lagos show.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 3600, 1, 1, '2026-01-04', 8900),
  ('pe100000-0000-0000-0000-000000000022', 'pd100000-0000-0000-0000-000000000005', 'Trevor Noah: African Comedy Masterclass', 'An exclusive interview with South Africa''s comedy king.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 2400, 2, 1, '2026-01-11', 12000),
  ('pe100000-0000-0000-0000-000000000023', 'pd100000-0000-0000-0000-000000000005', 'Funny African Parents Stories', 'Comedians share their most hilarious family moments.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 1800, 3, 1, '2026-01-18', 7500),
  ('pe100000-0000-0000-0000-000000000024', 'pd100000-0000-0000-0000-000000000005', 'Stand-Up Spotlight: Eric Omondi', 'Kenya''s funniest man at his absolute best.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 2100, 4, 1, '2026-01-25', 6200),
  ('pe100000-0000-0000-0000-000000000025', 'pd100000-0000-0000-0000-000000000005', 'African WhatsApp Group Chat Comedy', 'What really happens in those family WhatsApp groups.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 1500, 5, 1, '2026-02-01', 9400),

  -- The Pitch Room
  ('pe100000-0000-0000-0000-000000000026', 'pd100000-0000-0000-0000-000000000006', 'How to Build Wealth in Africa', 'Practical steps for building generational wealth.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 2100, 1, 1, '2026-01-08', 4200),
  ('pe100000-0000-0000-0000-000000000027', 'pd100000-0000-0000-0000-000000000006', 'Investing in African Real Estate', 'The beginner''s guide to property investment in Africa.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 1950, 2, 1, '2026-01-15', 3600),
  ('pe100000-0000-0000-0000-000000000028', 'pd100000-0000-0000-0000-000000000006', 'Crypto in Africa: Hype or Hope?', 'Is cryptocurrency the future of African finance?', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 2400, 3, 1, '2026-01-22', 5100),
  ('pe100000-0000-0000-0000-000000000029', 'pd100000-0000-0000-0000-000000000006', 'Side Hustles That Actually Work', 'Proven side business ideas for Africans in 2026.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 1800, 4, 1, '2026-01-29', 6800),
  ('pe100000-0000-0000-0000-000000000030', 'pd100000-0000-0000-0000-000000000006', 'Tax Planning for African Entrepreneurs', 'How to legally minimize your tax burden across Africa.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 2250, 5, 1, '2026-02-05', 2900)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- PART 7: Movies Schema + Seed Data
-- =====================

CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    year INTEGER,
    duration_minutes INTEGER,
    rating DECIMAL(2,1) DEFAULT 0,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    video_url TEXT,
    director TEXT,
    cast_members TEXT[],
    country TEXT,
    language TEXT DEFAULT 'en',
    is_featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movie_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT
);
-- Add unique constraints only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movie_categories_name_key') THEN
    ALTER TABLE public.movie_categories ADD CONSTRAINT movie_categories_name_key UNIQUE (name);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movie_categories_slug_key') THEN
    ALTER TABLE public.movie_categories ADD CONSTRAINT movie_categories_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.movie_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, movie_id)
);

-- RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Movies are viewable by everyone" ON public.movies FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Movie categories are viewable by everyone" ON public.movie_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can manage their watchlist" ON public.movie_watchlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admins can manage movies" ON public.movies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admins can manage movie categories" ON public.movie_categories FOR ALL USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT ON public.movies TO anon, authenticated;
GRANT SELECT ON public.movie_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movie_watchlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movie_categories TO authenticated;

-- Seed Movie Categories
INSERT INTO public.movie_categories (id, name, slug, description, image_url) VALUES
  ('mc100000-0000-0000-0000-000000000001', 'Nollywood', 'nollywood', 'Nigeria''s vibrant film industry', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop'),
  ('mc100000-0000-0000-0000-000000000002', 'Documentaries', 'documentaries', 'Real stories from across Africa', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=250&fit=crop'),
  ('mc100000-0000-0000-0000-000000000003', 'Short Films', 'short-films', 'Powerful stories told in minutes', 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=250&fit=crop'),
  ('mc100000-0000-0000-0000-000000000004', 'Drama', 'drama', 'Emotional and thought-provoking cinema', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop'),
  ('mc100000-0000-0000-0000-000000000005', 'Comedy', 'comedy', 'Laugh-out-loud African humor', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop'),
  ('mc100000-0000-0000-0000-000000000006', 'Action', 'action', 'High-energy African action films', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Seed Movies (10 African films)
INSERT INTO public.movies (id, title, description, genre, year, duration_minutes, rating, poster_url, backdrop_url, trailer_url, director, cast_members, country, language, is_featured, is_free, view_count)
VALUES
  ('mv100000-0000-0000-0000-000000000001', 'The Woman King', 'The story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey in the 1800s with skills and fierce determination.', 'Action', 2022, 135, 4.5, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop', 'https://www.youtube.com/watch?v=3RDaPV_rJ1Y', 'Gina Prince-Bythewood', ARRAY['Viola Davis', 'Thuso Mbedu', 'Lashana Lynch', 'Sheila Atim'], 'USA/Benin', 'en', true, true, 245000),
  ('mv100000-0000-0000-0000-000000000002', 'Lionheart', 'When her father falls ill, Adaeze steps up to manage the family business in a male-dominated industry, facing corruption and sexism in Southeast Nigeria.', 'Comedy', 2018, 95, 4.2, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', NULL, 'Genevieve Nnaji', ARRAY['Genevieve Nnaji', 'Nkem Owoh', 'Pete Edochie', 'Onyeka Onwenu'], 'Nigeria', 'en', true, true, 189000),
  ('mv100000-0000-0000-0000-000000000003', 'Rafiki', 'Two young women in Nairobi find love in a society that does not accept them. A story of courage and identity in modern Kenya.', 'Drama', 2018, 83, 4.3, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', NULL, 'Wanuri Kahiu', ARRAY['Samantha Mugatsia', 'Sheila Munyiva'], 'Kenya', 'sw', false, true, 67000),
  ('mv100000-0000-0000-0000-000000000004', 'The Boy Who Harnessed the Wind', 'Against all odds, a 13-year-old boy in Malawi invents an unconventional way to save his family and village from famine.', 'Drama', 2019, 113, 4.6, 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', 'https://www.youtube.com/watch?v=OHTSxw6FrdI', 'Chiwetel Ejiofor', ARRAY['Maxwell Simba', 'Chiwetel Ejiofor', 'Aissa Maiga'], 'Malawi/UK', 'en', true, true, 312000),
  ('mv100000-0000-0000-0000-000000000005', 'Queen of Katwe', 'A Ugandan girl from the slums of Kampala discovers she has an extraordinary talent for chess, and dreams of becoming a Grandmaster.', 'Drama', 2016, 124, 4.4, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&h=600&fit=crop', 'https://www.youtube.com/watch?v=z4l3-VKmOnU', 'Mira Nair', ARRAY['Madina Nalwanga', 'David Oyelowo', 'Lupita Nyong''o'], 'Uganda/USA', 'en', true, true, 178000),
  ('mv100000-0000-0000-0000-000000000006', 'Tsotsi', 'A young South African thug steals a car only to discover a baby in the back seat. An Academy Award-winning story of redemption.', 'Drama', 2005, 94, 4.5, 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=600&fit=crop', NULL, 'Gavin Hood', ARRAY['Presley Chweneyagae', 'Terry Pheto', 'Kenneth Nkosi'], 'South Africa', 'zu', false, true, 156000),
  ('mv100000-0000-0000-0000-000000000007', 'Vaya', 'Three strangers arrive in Johannesburg from rural areas, each seeking a better life but finding the city to be full of danger and moral tests.', 'Drama', 2016, 108, 4.1, 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=600&fit=crop', NULL, 'Akin Omotoso', ARRAY['Zimkhitha Nyoka', 'Sihle Xaba', 'Phumzile Sitole'], 'South Africa', 'zu', false, true, 42000),
  ('mv100000-0000-0000-0000-000000000008', 'Atlantics', 'In a Dakar suburb, workers on a construction site have not been paid for months. When they take to the ocean, the women left behind are haunted by a mysterious fever.', 'Drama', 2019, 106, 4.3, 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=1200&h=600&fit=crop', NULL, 'Mati Diop', ARRAY['Mama Sane', 'Amadou Mbow', 'Ibrahima Traore'], 'Senegal/France', 'fr', false, true, 89000),
  ('mv100000-0000-0000-0000-000000000009', 'Timbuktu', 'In the ancient city of Timbuktu, now ruled by religious fundamentalists, quiet cattle herder Kidane lives peacefully with his family — until one day his life changes forever.', 'Drama', 2014, 97, 4.7, 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', NULL, 'Abderrahmane Sissako', ARRAY['Ibrahim Ahmed', 'Toulou Kiki', 'Abel Jafri'], 'Mali/Mauritania', 'fr', false, true, 134000),
  ('mv100000-0000-0000-0000-000000000010', 'The Burial of Kojo', 'A Ghanaian fantasy film that weaves between past and present as a young girl embarks on a magical journey to save her father.', 'Drama', 2018, 80, 4.4, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', NULL, 'Blitz Bazawule', ARRAY['Ama K. Abebrese', 'Cynthia Dankwa', 'Kobina Amissah-Sam'], 'Ghana', 'en', true, true, 98000)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- PART 8: Increment play count RPC (ensure it exists)
-- =====================
CREATE OR REPLACE FUNCTION public.increment_play_count(p_song_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.songs SET plays = COALESCE(plays, 0) + 1 WHERE id = p_song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
