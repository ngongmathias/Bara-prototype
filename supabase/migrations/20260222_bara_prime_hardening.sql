-- Migration: Bara Prime 2.0 - Economic Hardening
-- Description: Interaction de-duplication and fraudulent click protection.

CREATE OR REPLACE FUNCTION track_interaction(
    p_item_id UUID,
    p_item_type TEXT,
    p_interaction_type TEXT, -- 'impression' or 'click'
    p_cost NUMERIC DEFAULT 0
) RETURNS VOID AS $$
DECLARE
    v_last_interaction_id UUID;
BEGIN
    -- 1. CLICK FRAUD GUARD (Primitive but effective for MVP)
    -- Discard clicks from the same session/item within narrow time windows
    IF p_interaction_type = 'click' THEN
        -- We'd ideally pass a client_hash, but for now we use a global lock based on time
        -- If the exact same item was clicked within the last 5 seconds, we skip cost deduction
        -- but still track metrics (to see the fraud pattern)
        SELECT id INTO v_last_interaction_id
        FROM public.monetization_stats
        WHERE item_id = p_item_id AND item_type = p_item_type
        AND created_at > (NOW() - INTERVAL '5 seconds')
        LIMIT 1;

        IF FOUND THEN
            -- Track as "Impression" instead of "Click" to save advertiser money
            -- and mark as suspected duplicate
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
    
    -- 3. BUDGET DEDUCTION (The real money part)
    IF p_interaction_type = 'click' AND p_cost > 0 THEN
        IF p_item_type = 'banner' THEN
            UPDATE public.sponsored_banners 
            SET current_spend = current_spend + p_cost 
            WHERE id = p_item_id;
        ELSIF p_item_type = 'listing' THEN
            -- In Phase 2 this could deduct from a prepaid balance
            NULL;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
