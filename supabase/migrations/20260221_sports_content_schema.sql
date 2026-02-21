-- ============================================
-- Sports Content Schema Migration
-- Creates tables for sports news, videos, and user personalization
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Sports News table
CREATE TABLE IF NOT EXISTS public.sports_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    sport TEXT DEFAULT 'football',
    league TEXT,
    league_id INTEGER,
    author TEXT,
    source_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Sports Videos table
CREATE TABLE IF NOT EXISTS public.sports_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    sport TEXT DEFAULT 'football',
    league TEXT,
    league_id INTEGER,
    duration TEXT, -- e.g. "2:45"
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. User Favorite Teams table
CREATE TABLE IF NOT EXISTS public.user_favorite_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    team_id INTEGER NOT NULL, -- API-Football team ID
    team_name TEXT NOT NULL,
    team_logo TEXT,
    league_id INTEGER,
    league_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, team_id)
);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.sports_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_teams ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Sports News: Public read access
DROP POLICY IF EXISTS "Public can view sports news" ON public.sports_news;
CREATE POLICY "Public can view sports news" ON public.sports_news FOR SELECT USING (true);

-- Sports Videos: Public read access
DROP POLICY IF EXISTS "Public can view sports videos" ON public.sports_videos;
CREATE POLICY "Public can view sports videos" ON public.sports_videos FOR SELECT USING (true);

-- Favorite Teams: Users can manage their own
DROP POLICY IF EXISTS "Users can view favorite teams" ON public.user_favorite_teams;
CREATE POLICY "Users can view favorite teams" ON public.user_favorite_teams
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert favorite teams" ON public.user_favorite_teams;
CREATE POLICY "Users can insert favorite teams" ON public.user_favorite_teams
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete favorite teams" ON public.user_favorite_teams;
CREATE POLICY "Users can delete favorite teams" ON public.user_favorite_teams
    FOR DELETE USING (true);

-- ============================================
-- Grants
-- ============================================
GRANT ALL ON public.sports_news TO service_role;
GRANT ALL ON public.sports_videos TO service_role;
GRANT ALL ON public.user_favorite_teams TO service_role;

GRANT SELECT ON public.sports_news TO anon;
GRANT SELECT ON public.sports_videos TO anon;

GRANT SELECT ON public.sports_news TO authenticated;
GRANT SELECT ON public.sports_videos TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_favorite_teams TO authenticated;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sports_news_sport ON public.sports_news(sport);
CREATE INDEX IF NOT EXISTS idx_sports_news_league ON public.sports_news(league_id);
CREATE INDEX IF NOT EXISTS idx_sports_news_featured ON public.sports_news(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_sports_videos_sport ON public.sports_videos(sport);
CREATE INDEX IF NOT EXISTS idx_sports_videos_league ON public.sports_videos(league_id);
CREATE INDEX IF NOT EXISTS idx_favorite_teams_user ON public.user_favorite_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_teams_team ON public.user_favorite_teams(team_id);
