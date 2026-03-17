-- ============================================================
-- SEED DATA: Streams (Artists, Albums, Songs)
-- Created: 2026-03-17
-- Purpose: Populate Streams pages with sample African music data
-- ============================================================

-- Add columns FIRST (before inserts that reference them)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'monthly_listeners') THEN
    ALTER TABLE public.artists ADD COLUMN monthly_listeners INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'genre') THEN
    ALTER TABLE public.artists ADD COLUMN genre TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'country') THEN
    ALTER TABLE public.artists ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'is_verified') THEN
    ALTER TABLE public.artists ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'banner_url') THEN
    ALTER TABLE public.artists ADD COLUMN banner_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'songs' AND column_name = 'genre') THEN
    ALTER TABLE public.songs ADD COLUMN genre TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'songs' AND column_name = 'track_number') THEN
    ALTER TABLE public.songs ADD COLUMN track_number INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'albums' AND column_name = 'genre') THEN
    ALTER TABLE public.albums ADD COLUMN genre TEXT;
  END IF;
END $$;

-- Insert Artists
INSERT INTO public.artists (id, name, image_url, bio, genre, country, is_verified, monthly_listeners)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Burna Boy', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', 'Grammy-winning Afrobeats artist from Nigeria. Known for blending Afrobeats, dancehall, reggae, and pop.', 'Afrobeats', 'Nigeria', true, 25000000),
  ('a1000000-0000-0000-0000-000000000002', 'Tems', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 'Nigerian singer, songwriter and producer. Known for her unique blend of R&B and Afrobeats.', 'Afro-R&B', 'Nigeria', true, 18000000),
  ('a1000000-0000-0000-0000-000000000003', 'Diamond Platnumz', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop', 'Tanzanian bongo flava recording artist, dancer and businessman.', 'Bongo Flava', 'Tanzania', true, 12000000),
  ('a1000000-0000-0000-0000-000000000004', 'Sauti Sol', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', 'Kenyan afro-pop band known for their harmonies and energetic performances.', 'Afro-Pop', 'Kenya', true, 8000000),
  ('a1000000-0000-0000-0000-000000000005', 'Meddy', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', 'Rwandan singer-songwriter known for romantic ballads and Afrobeat fusion.', 'Afrobeats', 'Rwanda', true, 3500000),
  ('a1000000-0000-0000-0000-000000000006', 'Yemi Alade', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', 'Nigerian Afropop singer known as Mama Africa. Multi-award winning artist.', 'Afropop', 'Nigeria', true, 15000000),
  ('a1000000-0000-0000-0000-000000000007', 'Angelique Kidjo', 'https://images.unsplash.com/photo-1446057032654-9d8885e49ac0?w=300&h=300&fit=crop', 'Beninese singer-songwriter and activist. Multiple Grammy Award winner.', 'World Music', 'Benin', true, 5000000),
  ('a1000000-0000-0000-0000-000000000008', 'Bruce Melodie', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', 'Rwandan artist known for his distinctive voice and Afrobeats style.', 'Afrobeats', 'Rwanda', true, 2800000)
ON CONFLICT (id) DO NOTHING;

-- Insert Albums
INSERT INTO public.albums (id, title, artist_id, cover_url, release_date, genre)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Love, Damini', 'a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', '2025-07-08', 'Afrobeats'),
  ('b1000000-0000-0000-0000-000000000002', 'African Giant', 'a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', '2024-07-26', 'Afrobeats'),
  ('b1000000-0000-0000-0000-000000000003', 'Born in the Wild', 'a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', '2025-06-07', 'Afro-R&B'),
  ('b1000000-0000-0000-0000-000000000004', 'A Boy from Tandale', 'a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop', '2024-03-15', 'Bongo Flava'),
  ('b1000000-0000-0000-0000-000000000005', 'Midnight Train', 'a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', '2024-06-21', 'Afro-Pop'),
  ('b1000000-0000-0000-0000-000000000006', 'Adi Truth', 'a1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', '2025-02-14', 'Afrobeats'),
  ('b1000000-0000-0000-0000-000000000007', 'Woman of Steel', 'a1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', '2024-08-30', 'Afropop'),
  ('b1000000-0000-0000-0000-000000000008', 'Katharsis', 'a1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1446057032654-9d8885e49ac0?w=300&h=300&fit=crop', '2025-01-20', 'Afrobeats')
ON CONFLICT (id) DO NOTHING;

-- Insert Songs (using placeholder audio URLs — replace with real Supabase storage URLs later)
INSERT INTO public.songs (id, title, artist_id, album_id, file_url, cover_url, duration, plays, genre, track_number)
VALUES
  -- Burna Boy - Love, Damini
  ('c1000000-0000-0000-0000-000000000001', 'Last Last', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', 215, 1200000, 'Afrobeats', 1),
  ('c1000000-0000-0000-0000-000000000002', 'It''s Plenty', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', 198, 950000, 'Afrobeats', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Common Person', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', 240, 870000, 'Afrobeats', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Anybody', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', 183, 2100000, 'Afrobeats', 1),
  ('c1000000-0000-0000-0000-000000000005', 'On The Low', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', 222, 1800000, 'Afrobeats', 2),

  -- Tems - Born in the Wild
  ('c1000000-0000-0000-0000-000000000006', 'Me & U', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 195, 3200000, 'Afro-R&B', 1),
  ('c1000000-0000-0000-0000-000000000007', 'Love Me JeJe', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 210, 2800000, 'Afro-R&B', 2),
  ('c1000000-0000-0000-0000-000000000008', 'Free Mind', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 188, 4500000, 'Afro-R&B', 3),
  ('c1000000-0000-0000-0000-000000000009', 'Higher', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 175, 2100000, 'Afro-R&B', 4),

  -- Diamond Platnumz
  ('c1000000-0000-0000-0000-000000000010', 'Jeje', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop', 230, 1500000, 'Bongo Flava', 1),
  ('c1000000-0000-0000-0000-000000000011', 'Waah', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop', 205, 1300000, 'Bongo Flava', 2),
  ('c1000000-0000-0000-0000-000000000012', 'Iyo', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop', 195, 1100000, 'Bongo Flava', 3),

  -- Sauti Sol
  ('c1000000-0000-0000-0000-000000000013', 'Suzanna', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', 248, 900000, 'Afro-Pop', 1),
  ('c1000000-0000-0000-0000-000000000014', 'Midnight Train', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', 220, 750000, 'Afro-Pop', 2),

  -- Meddy (Rwanda)
  ('c1000000-0000-0000-0000-000000000015', 'Adi', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000006', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', 236, 650000, 'Afrobeats', 1),
  ('c1000000-0000-0000-0000-000000000016', 'Slowly', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000006', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', 210, 580000, 'Afrobeats', 2),
  ('c1000000-0000-0000-0000-000000000017', 'Ntakibazo', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000006', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', 198, 520000, 'Afrobeats', 3),

  -- Yemi Alade
  ('c1000000-0000-0000-0000-000000000018', 'Johnny', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', 218, 5500000, 'Afropop', 1),
  ('c1000000-0000-0000-0000-000000000019', 'Shekere', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', 195, 1200000, 'Afropop', 2),

  -- Bruce Melodie (Rwanda)
  ('c1000000-0000-0000-0000-000000000020', 'Katerina', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1446057032654-9d8885e49ac0?w=300&h=300&fit=crop', 225, 480000, 'Afrobeats', 1),
  ('c1000000-0000-0000-0000-000000000021', 'A Mama', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1446057032654-9d8885e49ac0?w=300&h=300&fit=crop', 200, 420000, 'Afrobeats', 2),
  ('c1000000-0000-0000-0000-000000000022', 'Ikinyambo', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', '/audio/placeholder.mp3', 'https://images.unsplash.com/photo-1446057032654-9d8885e49ac0?w=300&h=300&fit=crop', 185, 380000, 'Afrobeats', 3)
ON CONFLICT (id) DO NOTHING;

-- (Column additions moved to top of file)
