-- Create gamification profiles for users
CREATE TABLE IF NOT EXISTS public.gamification_profiles (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    total_xp BIGINT DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    bara_coins BIGINT DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements directory (master list)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g. 'first_listen', 'top_poster'
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    category TEXT DEFAULT 'general', -- 'music', 'sports', 'market', 'community'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (earned by users)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- XP and Coin history (audit log)
CREATE TABLE IF NOT EXISTS public.gamification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, -- 'xp_gain', 'coin_gain', 'coin_spend'
    amount INTEGER NOT NULL,
    reason TEXT, -- e.g. 'song_listen', 'listing_boost', 'purchase'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Any authenticated user can read any profile, but only owner can update (usually via edge function/trigger)
CREATE POLICY "Public profiles are viewable by everyone" ON public.gamification_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.gamification_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements: Viewable by everyone
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

-- User Achievements: Viewable by everyone, only system can insert
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements
    FOR SELECT USING (true);

-- History: Only owner can view
CREATE POLICY "Users can view own history" ON public.gamification_history
    FOR SELECT USING (auth.uid() = user_id);

-- Trigger to create profile on signup (handled by existing signup trigger if applicable, or new one here)
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.gamification_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_gamification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_gamification();

-- Seed some initial achievements
INSERT INTO public.achievements (key, title, description, xp_reward, coin_reward, category)
VALUES 
('early_adopter', 'Early Adopter', 'Joined Bara Afrika during the prototype phase.', 1000, 50, 'general'),
('first_listen', 'Music Explorer', 'Listened to your first track on Bara Streams.', 50, 5, 'music'),
('playlist_creator', 'Curator', 'Created your first public playlist.', 100, 10, 'music'),
('market_entry', 'Entrepreneur', 'Posted your first listing in the marketplace.', 200, 20, 'market'),
('event_goer', 'Socialite', 'Purchased your first event ticket.', 500, 25, 'general')
ON CONFLICT (key) DO NOTHING;
