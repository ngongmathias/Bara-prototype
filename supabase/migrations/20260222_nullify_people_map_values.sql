-- Migration to nullify people groups map coordinates in country_info
-- This targets entries linked to 'global_africa' diaspora/people groups

UPDATE public.country_info ci
SET latitude = NULL,
    longitude = NULL
FROM public.global_africa ga
WHERE ci.country_id = ga.id
  AND (
    ga.name ILIKE '%American%'
    OR ga.name ILIKE '%British%'
    OR ga.name ILIKE '%European%'
    OR ga.name ILIKE '%Brazilians%'
    OR ga.name ILIKE '%HBCU%'
    OR ga.name ILIKE '%Diaspora%'
  );

COMMENT ON COLUMN public.country_info.latitude IS 'Nullified for diaspora groups during technical update 20260222';
COMMENT ON COLUMN public.country_info.longitude IS 'Nullified for diaspora groups during technical update 20260222';
