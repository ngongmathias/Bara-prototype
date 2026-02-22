-- Migration to nullify people groups map coordinates to ensure data accuracy for the base table
-- This affects the 'global_africa' table which represents the diaspora/people groups data

UPDATE public.global_africa
SET latitude = NULL,
    longitude = NULL;

COMMENT ON COLUMN public.global_africa.latitude IS 'Nullified during technical update 20260222';
COMMENT ON COLUMN public.global_africa.longitude IS 'Nullified during technical update 20260222';
