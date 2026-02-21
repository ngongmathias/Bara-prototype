-- Add streak tracking to gamification profiles
ALTER TABLE public.gamification_profiles 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiplier FLOAT DEFAULT 1.0;

-- Function to handle daily streak logic on login or activity
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_act TIMESTAMP WITH TIME ZONE;
    days_diff INTEGER;
BEGIN
    last_act := OLD.last_activity_at;
    days_diff := DATE_PART('day', NOW() - last_act);

    IF days_diff = 1 THEN
        -- Incremented consecutive days
        NEW.consecutive_days := OLD.consecutive_days + 1;
    ELSIF days_diff > 1 THEN
        -- Streak broken
        NEW.consecutive_days := 1;
    ELSE
        -- Same day activity, keep current streak
        NEW.consecutive_days := OLD.consecutive_days;
    END IF;

    -- Update multiplier based on streak (MIT-level psychology: higher streak = higher reward)
    IF NEW.consecutive_days >= 30 THEN
        NEW.multiplier := 2.0;
    ELSIF NEW.consecutive_days >= 7 THEN
        NEW.multiplier := 1.5;
    ELSIF NEW.consecutive_days >= 3 THEN
        NEW.multiplier := 1.2;
    ELSE
        NEW.multiplier := 1.0;
    END IF;

    NEW.last_activity_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for streak updates will be called when we update updated_at or total_xp
-- but let's keep it simple and call it from the service for now to avoid side-effect loops.
