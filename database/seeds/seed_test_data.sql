-- ============================================================
-- BARA AFRIKA — Test Data Seed
-- Comprehensive test data for QA testing (Phase 8.1)
-- Run AFTER fix_playback_infrastructure.sql
-- ============================================================

-- Platform playlists (Made For You section)
INSERT INTO public.playlists (title, description, cover_url, created_by, is_public, user_id)
VALUES
    ('Afrobeats Essentials', 'The biggest Afrobeats hits from across the continent', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80', 'platform', true, null),
    ('Amapiano Heat', 'The hottest Amapiano tracks from South Africa and beyond', 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&q=80', 'platform', true, null),
    ('Chill African Vibes', 'Relax with smooth African sounds — neo-soul, acoustic, and downtempo', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80', 'platform', true, null),
    ('Workout Africa', 'High-energy African hits to power your workout', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&q=80', 'platform', true, null),
    ('New Releases Radar', 'Fresh drops from this week — discover new African music', 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&q=80', 'platform', true, null)
ON CONFLICT DO NOTHING;

-- Add songs to platform playlists (distribute existing songs)
DO $$
DECLARE
    playlist_rec RECORD;
    song_rec RECORD;
    pos INTEGER;
BEGIN
    FOR playlist_rec IN SELECT id FROM public.playlists WHERE created_by = 'platform' LIMIT 5
    LOOP
        pos := 0;
        FOR song_rec IN SELECT id FROM public.songs ORDER BY random() LIMIT 10
        LOOP
            pos := pos + 1;
            INSERT INTO public.playlist_songs (playlist_id, song_id, position)
            VALUES (playlist_rec.id, song_rec.id, pos)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Update songs with realistic titles (replace generic "Track N" names)
DO $$
DECLARE
    titles TEXT[] := ARRAY[
        'Water', 'Fall', 'Kilometre', 'Sponono', 'Drive',
        'Love Nwantiti', 'Essence', 'Peru', 'Calm Down', 'Monalisa',
        'Last Last', 'Ke Star', 'Jerusalema', 'John Vuli Gate', 'Amanikiniki',
        'Infinity', 'Buga', 'Finesse', 'Loaded', 'Aya Nakamura',
        'Soweto Baby', 'Gidi Up', 'Adore You', 'Nkosazana', 'Osama'
    ];
    song_rec RECORD;
    i INTEGER := 1;
BEGIN
    FOR song_rec IN SELECT id FROM public.songs WHERE title LIKE 'Track %' ORDER BY id LIMIT 25
    LOOP
        UPDATE public.songs SET title = titles[i] WHERE id = song_rec.id;
        i := i + 1;
        IF i > array_length(titles, 1) THEN EXIT; END IF;
    END LOOP;
END $$;

-- Distribute different SoundHelix tracks across songs (16 unique tracks)
DO $$
DECLARE
    song_rec RECORD;
    track_num INTEGER := 1;
BEGIN
    FOR song_rec IN SELECT id FROM public.songs ORDER BY id
    LOOP
        UPDATE public.songs
        SET file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' || track_num || '.mp3'
        WHERE id = song_rec.id;
        track_num := track_num + 1;
        IF track_num > 16 THEN track_num := 1; END IF;
    END LOOP;
END $$;

-- Distribute varied cover art (12 unique images)
DO $$
DECLARE
    covers TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
        'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&q=80',
        'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=500&q=80',
        'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&q=80',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80',
        'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=500&q=80',
        'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=500&q=80'
    ];
    song_rec RECORD;
    i INTEGER := 1;
BEGIN
    FOR song_rec IN SELECT id FROM public.songs ORDER BY id
    LOOP
        UPDATE public.songs SET cover_url = covers[i] WHERE id = song_rec.id;
        i := i + 1;
        IF i > array_length(covers, 1) THEN i := 1; END IF;
    END LOOP;
END $$;

-- Set varied durations (120-300 seconds)
UPDATE public.songs SET duration = 120 + floor(random() * 180)::int WHERE duration IS NULL OR duration < 60;

-- Ensure all songs have genre tags
DO $$
DECLARE
    genres TEXT[] := ARRAY['Afrobeats', 'Amapiano', 'Afropop', 'Highlife', 'Bongo Flava', 'Afro-Soul', 'Gqom', 'Kwaito'];
    song_rec RECORD;
    i INTEGER := 1;
BEGIN
    FOR song_rec IN SELECT id FROM public.songs WHERE genre IS NULL OR genre = '' ORDER BY id
    LOOP
        UPDATE public.songs SET genre = genres[i] WHERE id = song_rec.id;
        i := i + 1;
        IF i > array_length(genres, 1) THEN i := 1; END IF;
    END LOOP;
END $$;

-- Blog posts seeding skipped here — blog_posts uses UUID FKs to blog_authors
-- and blog_categories tables. Use INSERT_SAMPLE_BLOG_DATA.sql instead.
