-- ============================================================
-- Phase 27.3.5 — Flatten the early curve
-- ============================================================
-- Halve the XP thresholds for levels 2–9 so new users level up fast in week 1.
-- Levels ≥10 keep today's cumulative XP (L10 = 27,000) so nobody at L10+ ever
-- loses a level. This mirrors calculateLevel in gamificationService.ts exactly.
-- ============================================================

CREATE OR REPLACE FUNCTION public.economy_level_from_xp(p_xp NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_xp IS NULL OR p_xp < 500 THEN
        RETURN 1;
    END IF;
    IF p_xp >= 27000 THEN
        -- Unchanged (original) curve from L10 up.
        RETURN floor(power(p_xp / 1000.0, 1.0 / 1.5)) + 1;
    END IF;
    -- Below L10: halved thresholds, capped at 9.
    RETURN LEAST(9, floor(power(p_xp / 500.0, 1.0 / 1.5)) + 1);
END;
$$;
