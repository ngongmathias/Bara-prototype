-- Migration: Daily Missions System
-- Description: Infrastructure for tracking recurring tasks and rewarding retention.

-- Master list of missions
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    reputation_reward NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'achievement'
    category TEXT DEFAULT 'general', -- 'music', 'market', 'social'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User mission progress
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    mission_id UUID REFERENCES public.missions(id) NOT NULL,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, mission_id)
);

-- Audit log for mission rewards
CREATE TABLE IF NOT EXISTS public.mission_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    mission_id UUID REFERENCES public.missions(id) NOT NULL,
    xp_awarded INTEGER DEFAULT 0,
    coins_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Missions are viewable by everyone" ON public.missions
    FOR SELECT USING (true);

CREATE POLICY "Users can view own mission progress" ON public.user_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mission history" ON public.mission_history
    FOR SELECT USING (auth.uid() = user_id);

-- Seed initial Daily Missions
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, reputation_reward, type, category)
VALUES 
('daily_listen', 'Music Enthusiast', 'Listen to 5 songs today.', 5, 50, 5, 0.1, 'daily', 'music'),
('daily_market_view', 'Window Shopper', 'View 10 marketplace listings.', 10, 30, 2, 0.05, 'daily', 'market'),
('daily_social_share', 'Bara Ambassador', 'Share any content to social media.', 1, 100, 10, 0.2, 'daily', 'social')
ON CONFLICT (key) DO NOTHING;
