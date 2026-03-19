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

-- === DONE ===
-- After running this, execute: node scripts/create-tables.mjs
-- to seed podcast and movie data.
