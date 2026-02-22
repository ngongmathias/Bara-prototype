-- Migration: TrustRank Infrastructure
-- Description: Adding reputation-based multipliers to the economy.

ALTER TABLE public.gamification_profiles 
ADD COLUMN IF NOT EXISTS trust_rank NUMERIC DEFAULT 1.0;

COMMENT ON COLUMN public.gamification_profiles.trust_rank IS 'Multiplier for ad quality and reward velocity. Increases with positive transactions.';
