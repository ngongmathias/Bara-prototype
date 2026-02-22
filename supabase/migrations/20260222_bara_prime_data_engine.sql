-- Migration: Bara Prime Data & ROI Engine
-- Description: Tracking impressions, clicks, and spend for detailed user ROI dashboards.

CREATE TABLE IF NOT EXISTS public.monetization_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'banner', 'song', 'event')),
    event_date DATE DEFAULT CURRENT_DATE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    total_spend NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, item_type, event_date)
);

-- Enable RLS
ALTER TABLE public.monetization_stats ENABLE ROW LEVEL SECURITY;

-- Allow anonymous increments via RPC only (secure pattern)
CREATE POLICY "Stats are viewable by everyone" 
ON public.monetization_stats FOR SELECT 
USING (true);

-- RPC to track interactions atomically
CREATE OR REPLACE FUNCTION track_interaction(
    p_item_id UUID,
    p_item_type TEXT,
    p_interaction_type TEXT, -- 'impression' or 'click'
    p_cost NUMERIC DEFAULT 0
) RETURNS VOID AS $$
BEGIN
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
    
    -- If it's a click with a cost, also update the main item's spend tracker if applicable
    IF p_interaction_type = 'click' AND p_cost > 0 THEN
        IF p_item_type = 'banner' THEN
            UPDATE public.sponsored_banners 
            SET current_spend = current_spend + p_cost 
            WHERE id = p_item_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
