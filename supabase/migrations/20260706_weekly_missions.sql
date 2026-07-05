-- ============================================================
-- Phase 27.3.1 — Weekly missions
-- ============================================================
-- Three type='weekly' missions with chunky (~50-coin) rewards, plus a
-- weekly reset RPC mirroring reset_daily_missions_for_user (resets on the
-- first activity of a new ISO week — date_trunc('week') = Monday 00:00).
-- ============================================================

-- Seed the weekly missions (reputation_reward was dropped in 20260705).
INSERT INTO public.missions (key, title, description, goal, xp_reward, coin_reward, type, category)
VALUES
    ('weekly_listen',      'Weekly Listener', 'Listen to 25 songs this week.',        25, 150, 50, 'weekly', 'music'),
    ('weekly_market_post', 'Weekly Seller',   'Post 1 marketplace ad this week.',      1, 150, 50, 'weekly', 'market'),
    ('weekly_event',       'Weekly Explorer', 'Register for 1 event this week.',       1, 150, 50, 'weekly', 'community')
ON CONFLICT (key) DO NOTHING;

-- Reset a user's weekly missions once per ISO week (Monday-anchored).
CREATE OR REPLACE FUNCTION public.reset_weekly_missions_for_user(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_missions um
    SET current_progress = 0,
        is_completed = false,
        completed_at = NULL,
        claimed_at = NULL,
        last_reset_at = NOW()
    FROM public.missions m
    WHERE um.mission_id = m.id
      AND um.user_id = p_user_id
      AND m.type = 'weekly'
      AND (um.last_reset_at IS NULL OR um.last_reset_at < date_trunc('week', NOW()));
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_weekly_missions_for_user(TEXT) TO anon, authenticated;
