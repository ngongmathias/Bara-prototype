-- ============================================================
-- BARA AFRIKA — Sports Management Tables
-- Teams, Leagues, Tournaments, Players, Fixtures
-- Run in Supabase SQL Editor
-- ============================================================

-- Leagues / Competitions
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    logo_url TEXT,
    sport TEXT NOT NULL DEFAULT 'Football',
    country TEXT,
    region TEXT,
    season TEXT,
    tier INTEGER DEFAULT 1,
    description TEXT,
    api_league_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    logo_url TEXT,
    sport TEXT NOT NULL DEFAULT 'Football',
    league_id UUID REFERENCES public.leagues(id) ON DELETE SET NULL,
    country TEXT,
    stadium TEXT,
    founded_year INTEGER,
    description TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    api_team_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tournaments / Cups
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    sport TEXT NOT NULL DEFAULT 'Football',
    format TEXT DEFAULT 'knockout',
    start_date DATE,
    end_date DATE,
    prize_info TEXT,
    status TEXT DEFAULT 'upcoming',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tournament participants
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    group_name TEXT,
    seed INTEGER,
    UNIQUE(tournament_id, team_id)
);

-- Players
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    position TEXT,
    nationality TEXT,
    jersey_number INTEGER,
    date_of_birth DATE,
    height_cm INTEGER,
    weight_kg INTEGER,
    bio TEXT,
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Fixtures / Matches
CREATE TABLE IF NOT EXISTS public.fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE SET NULL,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    match_date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT DEFAULT 'scheduled',
    matchday INTEGER,
    api_fixture_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User team follows
CREATE TABLE IF NOT EXISTS public.user_team_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, team_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_league ON public.teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_sport ON public.teams(sport);
CREATE INDEX IF NOT EXISTS idx_leagues_sport ON public.leagues(sport);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON public.fixtures(match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_league ON public.fixtures(league_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_teams ON public.fixtures(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament ON public.tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_user_team_follows_user ON public.user_team_follows(user_id);

-- RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_team_follows ENABLE ROW LEVEL SECURITY;

-- Public read on all sports tables
CREATE POLICY "leagues_public_read" ON public.leagues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "teams_public_read" ON public.teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tournaments_public_read" ON public.tournaments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tournament_teams_public_read" ON public.tournament_teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "players_public_read" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "fixtures_public_read" ON public.fixtures FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "user_team_follows_public_read" ON public.user_team_follows FOR SELECT TO anon, authenticated USING (true);

-- Authenticated full access (admin manages these)
CREATE POLICY "leagues_auth_all" ON public.leagues FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "teams_auth_all" ON public.teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tournaments_auth_all" ON public.tournaments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tournament_teams_auth_all" ON public.tournament_teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "players_auth_all" ON public.players FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "fixtures_auth_all" ON public.fixtures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "user_team_follows_auth_all" ON public.user_team_follows FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT ON public.leagues TO anon;
GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.tournaments TO anon;
GRANT SELECT ON public.tournament_teams TO anon;
GRANT SELECT ON public.players TO anon;
GRANT SELECT ON public.fixtures TO anon;
GRANT SELECT ON public.user_team_follows TO anon;
GRANT ALL ON public.leagues TO authenticated;
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.tournaments TO authenticated;
GRANT ALL ON public.tournament_teams TO authenticated;
GRANT ALL ON public.players TO authenticated;
GRANT ALL ON public.fixtures TO authenticated;
GRANT ALL ON public.user_team_follows TO authenticated;

-- Seed some leagues
INSERT INTO public.leagues (name, short_name, sport, country, region, season, tier, description) VALUES
    ('English Premier League', 'EPL', 'Football', 'England', 'Europe', '2025-26', 1, 'Top flight English football'),
    ('La Liga', 'La Liga', 'Football', 'Spain', 'Europe', '2025-26', 1, 'Top flight Spanish football'),
    ('CAF Champions League', 'CAFCL', 'Football', 'Africa', 'Africa', '2025-26', 1, 'Top African club competition'),
    ('Rwanda Premier League', 'RPL', 'Football', 'Rwanda', 'Africa', '2025-26', 1, 'Rwandan top division'),
    ('Nigeria Professional Football League', 'NPFL', 'Football', 'Nigeria', 'Africa', '2025-26', 1, 'Nigerian top flight'),
    ('South African Premier Division', 'PSL', 'Football', 'South Africa', 'Africa', '2025-26', 1, 'South African top flight'),
    ('Africa Cup of Nations', 'AFCON', 'Football', 'Africa', 'Africa', '2025', 1, 'African national teams tournament'),
    ('NBA', 'NBA', 'Basketball', 'United States', 'North America', '2025-26', 1, 'National Basketball Association'),
    ('Six Nations', 'Six Nations', 'Rugby', 'Europe', 'Europe', '2026', 1, 'European rugby championship'),
    ('ATP Tour', 'ATP', 'Tennis', 'Global', 'Global', '2026', 1, 'Professional men''s tennis')
ON CONFLICT DO NOTHING;
