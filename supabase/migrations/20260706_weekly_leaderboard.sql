-- ============================================================
-- Phase 27.3.2 — Weekly leaderboard seasons
-- ============================================================
-- Monday-anchored weekly aggregation of gamification_history, plus a helper
-- that returns last week's top 10 (for the cosmetic "champion" crown). Both are
-- read-only STABLE functions over the SELECT-able gamification tables.
-- ============================================================

-- Ranked period leaderboard: sum of gamification_history.amount for a given
-- type ('xp_gain' or 'coin_gain') since p_since, joined to current profile.
CREATE OR REPLACE FUNCTION public.leaderboard_period(p_type TEXT, p_since TIMESTAMPTZ, p_limit INTEGER)
RETURNS TABLE (
    user_id       TEXT,
    period_total  BIGINT,
    total_xp      BIGINT,
    current_level INTEGER,
    bara_coins    BIGINT,
    daily_streak  INTEGER
)
LANGUAGE sql
STABLE
AS $$
    SELECT h.user_id,
           SUM(h.amount)::bigint AS period_total,
           COALESCE(p.total_xp, 0)::bigint,
           COALESCE(p.current_level, 1),
           COALESCE(p.bara_coins, 0)::bigint,
           COALESCE(p.daily_streak, 0)
      FROM public.gamification_history h
      LEFT JOIN public.gamification_profiles p ON p.user_id = h.user_id
     WHERE h.type = p_type
       AND h.created_at >= p_since
     GROUP BY h.user_id, p.total_xp, p.current_level, p.bara_coins, p.daily_streak
     ORDER BY period_total DESC
     LIMIT p_limit;
$$;

-- Last completed ISO week's top earners by XP (for the crown marker).
CREATE OR REPLACE FUNCTION public.leaderboard_last_week_top(p_limit INTEGER)
RETURNS TABLE (user_id TEXT, weekly_xp BIGINT)
LANGUAGE sql
STABLE
AS $$
    SELECT h.user_id, SUM(h.amount)::bigint AS weekly_xp
      FROM public.gamification_history h
     WHERE h.type = 'xp_gain'
       AND h.created_at >= date_trunc('week', now()) - interval '7 days'
       AND h.created_at <  date_trunc('week', now())
     GROUP BY h.user_id
     ORDER BY weekly_xp DESC
     LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_period(TEXT, TIMESTAMPTZ, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_last_week_top(INTEGER)             TO anon, authenticated;
