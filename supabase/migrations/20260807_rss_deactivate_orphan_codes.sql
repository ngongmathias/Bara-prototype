-- ============================================================
-- Follow-up to 20260807_fix_rss_sources.sql
--
-- After that migration ran, four active sources were still on the broken
-- `allinurl` URL pattern and returning 0 items:
--
--   UK -> Google News Black/African British   (duplicate of GB-BA)
--   BE -> Google News Black/African European  (duplicate of EU-BA)
--   BA -> Google News Black America           (duplicate of US-BA)
--   BR -> Google News Brazil                  (duplicate of BR-BA)
--
-- They were missed because the previous migration keys on country_code, and
-- these four carry legacy codes that do not exist in `countries` at all — so
-- they can never match a country page, and every article they fetch is
-- orphaned on arrival. Each already has a correctly-coded, working
-- counterpart, so they are pure noise in the source list and in the admin
-- "needs attention" count.
--
-- Written generically rather than hardcoding the four ids: any active source
-- pointing at a country code the site does not serve is dead weight, now and
-- in future.
--
-- NOTE: sources with a NULL country_code are Africa-wide feeds (BBC Africa,
-- AllAfrica, The Africa Report). Those are deliberate and must stay active —
-- they are what the pan-Africa fallback serves to thin country pages.
-- ============================================================

UPDATE public.rss_feed_sources s
   SET is_active  = false,
       updated_at = NOW()
 WHERE s.is_active = true
   AND s.country_code IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.countries c WHERE c.code = s.country_code
   );
