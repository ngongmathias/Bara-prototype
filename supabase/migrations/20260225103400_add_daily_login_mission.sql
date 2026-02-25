-- Add daily_login mission to the missions table
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, reputation_reward, type, category)
VALUES (
    'daily_login', 
    'Daily Check-in', 
    'Log in to Bara today.', 
    1, -- goal
    20, -- xp_reward
    10, -- coin_reward
    0.05, -- reputation_reward
    'daily', 
    'social'
) ON CONFLICT (key) DO NOTHING;
