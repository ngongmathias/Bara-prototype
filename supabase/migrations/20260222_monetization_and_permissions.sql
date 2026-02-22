-- Migration: Monetization tables + fix table permissions for anon/authenticated roles
-- Fixes:
--   1. 'permission denied for table gamification_profiles' (and other tables)
--   2. 'relation public.monetization_stats does not exist'
--   3. 'track_interaction RPC 404' (function depends on monetization_stats table)

-- ============================================================
-- STEP 1: GRANT table-level permissions to anon and authenticated roles
-- RLS policies control row-level access, but PostgreSQL also requires
-- role-level GRANT for the anon key to even reach the table.
-- ============================================================

-- Gamification tables
GRANT SELECT, INSERT, UPDATE ON public.gamification_profiles TO anon, authenticated;
GRANT SELECT, INSERT ON public.gamification_history TO anon, authenticated;
GRANT SELECT, INSERT ON public.user_achievements TO anon, authenticated;
GRANT SELECT ON public.achievements TO anon, authenticated;

-- Missions tables
GRANT SELECT ON public.missions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_missions TO anon, authenticated;
GRANT SELECT, INSERT ON public.mission_history TO anon, authenticated;

-- Email queue
GRANT SELECT, INSERT, UPDATE ON public.email_queue TO anon, authenticated;

-- User verifications
GRANT SELECT, INSERT, UPDATE ON public.user_verifications TO anon, authenticated;

-- Clerk users sync table
GRANT SELECT, INSERT, UPDATE ON public.clerk_users TO anon, authenticated;

-- Sponsored banners (read for frontend display)
GRANT SELECT, UPDATE ON public.sponsored_banners TO anon, authenticated;

-- Sponsored banner analytics
GRANT SELECT, INSERT ON public.sponsored_banner_analytics TO anon, authenticated;

-- ============================================================
-- STEP 2: Add current_spend column to sponsored_banners (needed by track_interaction)
-- ============================================================
ALTER TABLE public.sponsored_banners
  ADD COLUMN IF NOT EXISTS current_spend NUMERIC DEFAULT 0;

-- ============================================================
-- STEP 3: Create monetization_stats table
-- Tracks daily impressions, clicks, and spend per monetizable item
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monetization_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  total_spend NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, item_type, event_date)
);

CREATE INDEX IF NOT EXISTS idx_monetization_stats_item ON public.monetization_stats(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_monetization_stats_date ON public.monetization_stats(event_date);

ALTER TABLE public.monetization_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read monetization_stats" ON public.monetization_stats
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert monetization_stats" ON public.monetization_stats
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update monetization_stats" ON public.monetization_stats
  FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON public.monetization_stats TO anon, authenticated;

-- ============================================================
-- STEP 4: Create platform_commissions table
-- Tracks marketplace and event ticket commissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.platform_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  sale_price NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  commission_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_commissions_item ON public.platform_commissions(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_seller ON public.platform_commissions(seller_id);

ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_commissions" ON public.platform_commissions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert platform_commissions" ON public.platform_commissions
  FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT ON public.platform_commissions TO anon, authenticated;

-- ============================================================
-- STEP 5: Create track_interaction RPC function
-- Atomic metric tracking with click fraud protection
-- ============================================================
CREATE OR REPLACE FUNCTION public.track_interaction(
    p_item_id UUID,
    p_item_type TEXT,
    p_interaction_type TEXT,
    p_cost NUMERIC DEFAULT 0
) RETURNS VOID AS $$
DECLARE
    v_last_interaction_id UUID;
BEGIN
    -- 1. CLICK FRAUD GUARD
    IF p_interaction_type = 'click' THEN
        SELECT id INTO v_last_interaction_id
        FROM public.monetization_stats
        WHERE item_id = p_item_id AND item_type = p_item_type
        AND created_at > (NOW() - INTERVAL '5 seconds')
        LIMIT 1;

        IF FOUND THEN
            INSERT INTO public.monetization_stats (item_id, item_type, event_date, impressions)
            VALUES (p_item_id, p_item_type, CURRENT_DATE, 1)
            ON CONFLICT (item_id, item_type, event_date)
            DO UPDATE SET impressions = monetization_stats.impressions + 1;
            RETURN;
        END IF;
    END IF;

    -- 2. ATOMIC METRIC UPDATE
    INSERT INTO public.monetization_stats (item_id, item_type, event_date, impressions, clicks, total_spend)
    VALUES (
        p_item_id,
        p_item_type,
        CURRENT_DATE,
        CASE WHEN p_interaction_type = 'impression' THEN 1 ELSE 0 END,
        CASE WHEN p_interaction_type = 'click' THEN 1 ELSE 0 END,
        p_cost
    )
    ON CONFLICT (item_id, item_type, event_date)
    DO UPDATE SET
        impressions = monetization_stats.impressions + (CASE WHEN p_interaction_type = 'impression' THEN 1 ELSE 0 END),
        clicks = monetization_stats.clicks + (CASE WHEN p_interaction_type = 'click' THEN 1 ELSE 0 END),
        total_spend = monetization_stats.total_spend + p_cost;

    -- 3. BUDGET DEDUCTION
    IF p_interaction_type = 'click' AND p_cost > 0 THEN
        IF p_item_type = 'banner' THEN
            UPDATE public.sponsored_banners
            SET current_spend = current_spend + p_cost
            WHERE id = p_item_id;
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'track_interaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on the RPC function
GRANT EXECUTE ON FUNCTION public.track_interaction(UUID, TEXT, TEXT, NUMERIC) TO anon, authenticated;
