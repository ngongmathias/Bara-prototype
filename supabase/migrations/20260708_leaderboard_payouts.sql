-- ============================================================
-- Phase 27.8.7 — Coins for weekly leaderboard ranks
-- ============================================================
-- Extends 27.3.2 (last week's top 10 currently get only the cosmetic Champ
-- crown): the last COMPLETED ISO week's top ranks now also earn coins.
-- Amounts are admin-tunable in gamification_settings; leaderboard_payouts is
-- the idempotency ledger so the RPC is safe to call repeatedly (lazy trigger
-- on first leaderboard read of a new week + optional pg_cron Monday 00:10 UTC).
-- Week anchor: date_trunc('week') = Monday 00:00, same as
-- leaderboard_last_week_top and the weekly mission reset.
-- ============================================================

-- 1. Tunable prize amounts (editable in Admin → Gamification → Economy Settings)
INSERT INTO public.gamification_settings (key, value) VALUES
    ('leaderboard.rank1_coins',    200),
    ('leaderboard.rank2_coins',    100),
    ('leaderboard.rank3_coins',     50),
    ('leaderboard.rank4to10_coins', 20)
ON CONFLICT (key) DO NOTHING;

-- 2. Idempotency ledger — one row per (week, user) ever paid.
CREATE TABLE IF NOT EXISTS public.leaderboard_payouts (
    week_start  DATE NOT NULL,          -- Monday of the week that was WON
    user_id     TEXT NOT NULL,
    rank        INTEGER NOT NULL,
    coins       INTEGER NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (week_start, user_id)
);

ALTER TABLE public.leaderboard_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaderboard_payouts_select" ON public.leaderboard_payouts;
CREATE POLICY "leaderboard_payouts_select" ON public.leaderboard_payouts FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.leaderboard_payouts FROM anon, authenticated;
GRANT SELECT ON public.leaderboard_payouts TO anon, authenticated;
GRANT ALL ON public.leaderboard_payouts TO service_role;

-- 3. The payout RPC. Pays the last completed week's top 10 via
--    economy_add_coins (so Gold bonus + daily caps + history logging apply),
--    records each payment in the ledger, and skips anything already paid.
--    Callable by the tokenless anon client (lazy trigger) — safe because the
--    ledger + advisory lock make it fully idempotent and it can only ever
--    pay the deterministic last-week winners.
CREATE OR REPLACE FUNCTION public.economy_leaderboard_payout()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_week   DATE := (date_trunc('week', now()) - interval '7 days')::date;
    v_paid   INTEGER := 0;
    v_coins  INTEGER;
    v_rank   INTEGER := 0;
    r        RECORD;
BEGIN
    -- One runner at a time (lazy trigger can fire from many clients at once).
    PERFORM pg_advisory_xact_lock(hashtext('leaderboard_payout_' || v_week::text));

    FOR r IN
        SELECT t.user_id, t.weekly_xp
          FROM public.leaderboard_last_week_top(10) t
    LOOP
        v_rank := v_rank + 1;

        CONTINUE WHEN EXISTS (
            SELECT 1 FROM leaderboard_payouts
             WHERE week_start = v_week AND user_id = r.user_id
        );

        v_coins := COALESCE((
            SELECT value::integer FROM gamification_settings
             WHERE key = CASE v_rank
                             WHEN 1 THEN 'leaderboard.rank1_coins'
                             WHEN 2 THEN 'leaderboard.rank2_coins'
                             WHEN 3 THEN 'leaderboard.rank3_coins'
                             ELSE 'leaderboard.rank4to10_coins'
                         END
        ), CASE v_rank WHEN 1 THEN 200 WHEN 2 THEN 100 WHEN 3 THEN 50 ELSE 20 END);

        CONTINUE WHEN v_coins <= 0;

        -- Ledger first — the PK is the idempotency guard.
        INSERT INTO leaderboard_payouts (week_start, user_id, rank, coins)
        VALUES (v_week, r.user_id, v_rank, v_coins)
        ON CONFLICT (week_start, user_id) DO NOTHING;

        IF NOT FOUND THEN
            CONTINUE;
        END IF;

        PERFORM economy_add_coins(
            r.user_id, v_coins,
            'Weekly leaderboard prize — rank ' || v_rank || ' (week of ' || v_week || ')'
        );
        v_paid := v_paid + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'week_start', v_week, 'paid', v_paid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.economy_leaderboard_payout() TO anon, authenticated, service_role;

-- 4. Schedule Mondays 00:10 UTC if pg_cron is installed (safe no-op otherwise
--    — the lazy client trigger covers instances without pg_cron; enable the
--    extension and re-run this block to add the belt-and-braces cron).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        BEGIN
            PERFORM cron.unschedule('leaderboard-payout');
        EXCEPTION WHEN OTHERS THEN
            NULL; -- not scheduled yet
        END;
        PERFORM cron.schedule('leaderboard-payout', '10 0 * * 1', 'SELECT public.economy_leaderboard_payout();');
    END IF;
END $$;
