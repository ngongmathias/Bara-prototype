-- =====================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/sqxybqvrctegnejbkpwg/sql
-- =====================================================

-- === PODCASTS ===
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

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_listen_history ENABLE ROW LEVEL SECURITY;

-- Podcast RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcasts' AND policyname='Podcasts are viewable by everyone') THEN
    CREATE POLICY "Podcasts are viewable by everyone" ON public.podcasts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcast_episodes' AND policyname='Podcast episodes are viewable by everyone') THEN
    CREATE POLICY "Podcast episodes are viewable by everyone" ON public.podcast_episodes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcast_subscriptions' AND policyname='Users can manage their subscriptions') THEN
    CREATE POLICY "Users can manage their subscriptions" ON public.podcast_subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcast_listen_history' AND policyname='Users can manage their listen history') THEN
    CREATE POLICY "Users can manage their listen history" ON public.podcast_listen_history FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT ON public.podcasts TO anon, authenticated;
GRANT SELECT ON public.podcast_episodes TO anon, authenticated;
GRANT ALL ON public.podcast_subscriptions TO authenticated;
GRANT ALL ON public.podcast_listen_history TO authenticated;
GRANT ALL ON public.podcasts TO authenticated;
GRANT ALL ON public.podcast_episodes TO authenticated;

-- === MOVIES ===
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
  stream_url TEXT,
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

DO $$ BEGIN
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

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY;

-- Movie RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movies' AND policyname='Movies are viewable by everyone') THEN
    CREATE POLICY "Movies are viewable by everyone" ON public.movies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movie_categories' AND policyname='Movie categories are viewable by everyone') THEN
    CREATE POLICY "Movie categories are viewable by everyone" ON public.movie_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movie_watchlist' AND policyname='Users can manage their watchlist') THEN
    CREATE POLICY "Users can manage their watchlist" ON public.movie_watchlist FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT ON public.movies TO anon, authenticated;
GRANT SELECT ON public.movie_categories TO anon, authenticated;
GRANT ALL ON public.movie_watchlist TO authenticated;
GRANT ALL ON public.movies TO authenticated;
GRANT ALL ON public.movie_categories TO authenticated;

-- === SEED DATA ===

-- Seed Podcasts
INSERT INTO public.podcasts (title, host, description, category, cover_url, language, is_featured, subscriber_count) VALUES
('The African Dream', 'Amara Kone', 'Stories of founders building across the continent — from Lagos to Nairobi to Kigali.', 'Entrepreneurship', 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop', 'en', true, 12400),
('Naija Tech Talk', 'Tunde Obi', 'Africa''s tech ecosystem — startups, funding rounds, and the engineers building the future.', 'Technology', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop', 'en', true, 8900),
('Ubuntu Conversations', 'Thabo Mokoena', 'Pan-African dialogues on identity, culture, unity, and what it means to be African today.', 'Culture', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop', 'en', false, 6700),
('Accra After Dark', 'Ama Serwaa', 'Mysteries and untold stories from West Africa — true crime, cold cases, and urban legends.', 'True Crime', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=400&fit=crop', 'en', true, 15200),
('Laugh Out Loud Africa', 'Basket Mouth & Friends', 'The funniest comedians on the continent share stories, jokes, and behind-the-scenes moments.', 'Comedy', 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=400&fit=crop', 'en', false, 21000),
('The Pitch Room', 'Keza Ngowi', 'Investment, wealth building, and personal finance strategies tailored for Africans.', 'Finance', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop', 'en', true, 9800)
ON CONFLICT DO NOTHING;

-- Seed Podcast Episodes (5 per podcast, using SoundHelix for audio)
DO $$
DECLARE
  p RECORD;
  ep_num INTEGER;
  helix_idx INTEGER;
BEGIN
  helix_idx := 1;
  FOR p IN SELECT id, title FROM public.podcasts ORDER BY title LOOP
    FOR ep_num IN 1..5 LOOP
      INSERT INTO public.podcast_episodes (podcast_id, title, description, audio_url, duration, episode_number, season_number, play_count, published_at)
      VALUES (
        p.id,
        'Episode ' || ep_num || ': ' || CASE ep_num
          WHEN 1 THEN 'Getting Started'
          WHEN 2 THEN 'Deep Dive'
          WHEN 3 THEN 'Expert Interview'
          WHEN 4 THEN 'Listener Q&A'
          WHEN 5 THEN 'Season Finale'
        END,
        'Episode ' || ep_num || ' of ' || p.title,
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' || helix_idx || '.mp3',
        1200 + (ep_num * 300),
        ep_num,
        1,
        (random() * 5000)::int,
        now() - (interval '7 days' * (6 - ep_num))
      ) ON CONFLICT DO NOTHING;
      helix_idx := (helix_idx % 16) + 1;
    END LOOP;
  END LOOP;
END $$;

-- Seed Movie Categories
INSERT INTO public.movie_categories (name, slug, description, image_url) VALUES
('Nollywood', 'nollywood', 'Nigeria''s vibrant film industry', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop'),
('Documentaries', 'documentaries', 'Real stories from across Africa', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=250&fit=crop'),
('Short Films', 'short-films', 'Powerful stories told in minutes', 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=250&fit=crop'),
('Drama', 'drama', 'Emotional cinema from the continent', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop'),
('Comedy', 'comedy', 'African humor at its finest', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop'),
('Action', 'action', 'High-energy African films', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop')
ON CONFLICT (name) DO NOTHING;

-- Seed Movies
INSERT INTO public.movies (title, description, genre, year, duration_minutes, rating, poster_url, backdrop_url, director, cast_members, country, language, is_featured, is_free, view_count) VALUES
('The Woman King', 'The story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey in the 1800s.', 'Action', 2022, 135, 4.5, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop', 'Gina Prince-Bythewood', ARRAY['Viola Davis','Thuso Mbedu','Lashana Lynch'], 'USA/Benin', 'en', true, true, 245000),
('Lionheart', 'When her father falls ill, Adaeze steps up to manage the family bus company in a male-dominated industry in southeastern Nigeria.', 'Comedy', 2018, 95, 4.2, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', 'Genevieve Nnaji', ARRAY['Genevieve Nnaji','Nkem Owoh'], 'Nigeria', 'en', true, true, 189000),
('Rafiki', 'Two young women in Nairobi discover love in a society that refuses to accept them, navigating family and societal expectations.', 'Drama', 2018, 83, 4.3, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', 'Wanuri Kahiu', ARRAY['Samantha Mugatsia','Sheila Munyiva'], 'Kenya', 'sw', true, true, 67000),
('The Boy Who Harnessed the Wind', 'A 13-year-old boy in Malawi invents an unconventional way to save his family and village from famine.', 'Drama', 2019, 113, 4.6, 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', 'Chiwetel Ejiofor', ARRAY['Maxwell Simba','Chiwetel Ejiofor'], 'Malawi/UK', 'en', true, true, 312000),
('Citation', 'A postgraduate student takes on the academic establishment when she reports a beloved professor for sexual assault.', 'Drama', 2020, 165, 4.2, 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=600&fit=crop', 'Kunle Afolayan', ARRAY['Temi Otedola','Jimmy Jean-Louis'], 'Nigeria', 'en', false, true, 156000),
('Atlantics', 'In a suburb of Dakar, workers on a construction site have not been paid for months. One night, they decide to leave by sea.', 'Romance', 2019, 106, 4.3, 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=1200&h=600&fit=crop', 'Mati Diop', ARRAY['Mama Sane','Ibrahima Traore'], 'Senegal/France', 'fr', false, true, 89000),
('Milkmaid', 'Two sisters are separated when Boko Haram attacks their village; one escapes while the other is taken captive.', 'Drama', 2020, 130, 4.1, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&h=600&fit=crop', 'Desmond Ovbiagele', ARRAY['Anthonieta Kalunta','Maryam Booth'], 'Nigeria', 'en', false, true, 45000),
('Vaya', 'Three strangers from rural areas arrive in Johannesburg, each with their own desperate mission, and their fates intertwine.', 'Thriller', 2016, 109, 4.4, 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200&h=600&fit=crop', 'Akin Omotoso', ARRAY['Zimkhitha Nyoka','Sihle Xaba'], 'South Africa', 'zu', false, false, 34000),
('Eyimofe (This Is My Desire)', 'Two Lagosians — a factory technician and a hairdresser — each strive to leave Nigeria for a better life in Europe.', 'Drama', 2020, 116, 4.5, 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=600&fit=crop', 'Arie Esiri & Chuko Esiri', ARRAY['Jude Akuwudike','Temi Ami-Williams'], 'Nigeria', 'en', false, true, 28000),
('Sew the Winter to My Skin', 'Based on the true story of John Kepe, a Robin Hood figure in 1950s apartheid South Africa hunted by farmers and police.', 'Action', 2018, 100, 4.0, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', 'Jahmil X.T. Qubeka', ARRAY['Ezra Mabengeza','Kandyse McClure'], 'South Africa', 'af', false, false, 19000)
ON CONFLICT DO NOTHING;

-- === DONE ===
-- All tables created and seed data inserted.
-- The podcasts/movies pages will now show real data from Supabase.
