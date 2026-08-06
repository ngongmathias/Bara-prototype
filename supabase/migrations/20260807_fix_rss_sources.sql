-- ============================================================
-- Fix RSS: repair every broken feed URL, realign orphaned articles
--
-- Three independent faults left 32 of 40 country pages with no news at all
-- (every African country included — Nigeria, Ghana, Kenya, South Africa):
--
--   A. 41 of 60 active sources used a `when:24h+allinurl:` Google News query,
--      which returns an EMPTY feed. Because an empty feed still responds 200,
--      each recorded last_fetch_status='ok' with last_fetch_items=0, so the
--      breakage was invisible in the admin panel.
--   B. Three sources filed articles under codes the site does not use
--      (US-AA, US-HBCU, BR-AFRO), so ~82 fetched articles were orphaned.
--   C. Morocco is stored under `MC` (Monaco's ISO code) and Gambia shared
--      `GA` with Gabon, so both generated the wrong Google edition.
--
-- Every URL below was verified by live fetch before being written here —
-- `node scripts/verify_rss_urls.mjs` reported 40/40 returning ~100 articles.
-- Re-run that script before changing any URL in this file.
--
-- ORDER MATTERS: country codes are corrected FIRST, then URLs are assigned by
-- code. Doing it the other way round would hand Gambia the Gabon feed.
-- ============================================================

-- 1. Realign article rows filed under codes the site never queries, so the
--    ~82 already-fetched articles appear immediately rather than waiting for
--    the next cron run.
UPDATE public.rss_feeds SET country_code = 'US-BA' WHERE country_code = 'US-AA';
UPDATE public.rss_feeds SET country_code = 'ED'    WHERE country_code = 'US-HBCU';
UPDATE public.rss_feeds SET country_code = 'BR-BA' WHERE country_code = 'BR-AFRO';

-- 2. Same realignment on the sources, so future fetches file articles under
--    the code the UI actually reads.
UPDATE public.rss_feed_sources SET country_code = 'US-BA' WHERE country_code = 'US-AA';
UPDATE public.rss_feed_sources SET country_code = 'ED'    WHERE country_code = 'US-HBCU';
UPDATE public.rss_feed_sources SET country_code = 'BR-BA' WHERE country_code = 'BR-AFRO';

-- 3. Gambia was sharing Gabon's code. `countries` already has GM for The
--    Gambia; move any Gambia-named source onto it before URLs are assigned.
UPDATE public.rss_feed_sources
   SET country_code = 'GM', country_name = 'The Gambia'
 WHERE country_code = 'GA' AND name ILIKE '%gambia%';

-- 4. Deduplicate: where a code has more than one active source, keep the most
--    recently updated and deactivate the rest. Leaving both active means
--    articles are attributed to whichever fetches first.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
           PARTITION BY country_code
           ORDER BY updated_at DESC NULLS LAST, created_at DESC
         ) AS rn
    FROM public.rss_feed_sources
   WHERE is_active = true AND country_code IS NOT NULL
)
UPDATE public.rss_feed_sources s
   SET is_active = false, updated_at = NOW()
  FROM ranked r
 WHERE s.id = r.id AND r.rn > 1;

-- 5. Now point every source at its verified URL, keyed by the corrected code.
WITH verified(country_code, url) AS (
  VALUES
  ('AO', 'https://news.google.com/rss/search?q=Angola%20news&hl=en-AO&gl=AO&ceid=AO%3Aen'),
  ('AG', 'https://news.google.com/rss/search?q=Antigua%20and%20Barbuda%20news&hl=en-AG&gl=AG&ceid=AG%3Aen'),
  ('BB', 'https://news.google.com/rss/search?q=Barbados%20news&hl=en-BB&gl=BB&ceid=BB%3Aen'),
  ('BZ', 'https://news.google.com/rss/search?q=Belize%20news&hl=en-BZ&gl=BZ&ceid=BZ%3Aen'),
  ('BJ', 'https://news.google.com/rss/search?q=Benin%20news&hl=en-BJ&gl=BJ&ceid=BJ%3Aen'),
  ('US-BA', 'https://news.google.com/rss/search?q=African%20American%20news&hl=en-US&gl=US&ceid=US%3Aen'),
  ('BR-BA', 'https://news.google.com/rss/search?q=afro-brasileiros&hl=pt-BR&gl=BR&ceid=BR%3Apt-419'),
  ('GB-BA', 'https://news.google.com/rss/search?q=Black%20British%20news&hl=en-GB&gl=GB&ceid=GB%3Aen'),
  ('EU-BA', 'https://news.google.com/rss/search?q=Black%20Europeans%20Africa%20diaspora&hl=en-GB&gl=GB&ceid=GB%3Aen'),
  ('BW', 'https://news.google.com/rss/search?q=Botswana%20news&hl=en-BW&gl=BW&ceid=BW%3Aen'),
  ('BF', 'https://news.google.com/rss/search?q=Burkina%20Faso%20news&hl=en-BF&gl=BF&ceid=BF%3Aen'),
  ('CM', 'https://news.google.com/rss/search?q=Cameroon%20news&hl=en-CM&gl=CM&ceid=CM%3Aen'),
  ('CV', 'https://news.google.com/rss/search?q=Cape%20Verde%20news&hl=en-CV&gl=CV&ceid=CV%3Aen'),
  ('DM', 'https://news.google.com/rss/search?q=Dominica%20news&hl=en-DM&gl=DM&ceid=DM%3Aen'),
  ('EG', 'https://news.google.com/rss/search?q=Egypt%20news&hl=en-EG&gl=EG&ceid=EG%3Aen'),
  ('ET', 'https://news.google.com/rss/search?q=Ethiopia%20news&hl=en-ET&gl=ET&ceid=ET%3Aen'),
  ('GA', 'https://news.google.com/rss/search?q=Gabon%20news&hl=en-GA&gl=GA&ceid=GA%3Aen'),
  ('GH', 'https://news.google.com/rss/search?q=Ghana%20news&hl=en-GH&gl=GH&ceid=GH%3Aen'),
  ('GD', 'https://news.google.com/rss/search?q=Grenada%20news&hl=en-GD&gl=GD&ceid=GD%3Aen'),
  ('HT', 'https://news.google.com/rss/search?q=Haiti%20news&hl=en-HT&gl=HT&ceid=HT%3Aen'),
  ('ED', 'https://news.google.com/rss/search?q=HBCU&hl=en-US&gl=US&ceid=US%3Aen'),
  ('JM', 'https://news.google.com/rss/search?q=Jamaica%20news&hl=en-JM&gl=JM&ceid=JM%3Aen'),
  ('KE', 'https://news.google.com/rss/search?q=Kenya%20news&hl=en-KE&gl=KE&ceid=KE%3Aen'),
  ('MW', 'https://news.google.com/rss/search?q=Malawi%20news&hl=en-MW&gl=MW&ceid=MW%3Aen'),
  ('MC', 'https://news.google.com/rss/search?q=Morocco%20news&hl=en-MA&gl=MA&ceid=MA%3Aen'),
  ('NA', 'https://news.google.com/rss/search?q=Namibia%20news&hl=en-NA&gl=NA&ceid=NA%3Aen'),
  ('NG', 'https://news.google.com/rss/search?q=Nigeria%20news&hl=en-NG&gl=NG&ceid=NG%3Aen'),
  ('RW', 'https://news.google.com/rss/search?q=Rwanda%20news&hl=en-RW&gl=RW&ceid=RW%3Aen'),
  ('LC', 'https://news.google.com/rss/search?q=Saint%20Lucia%20news&hl=en-LC&gl=LC&ceid=LC%3Aen'),
  ('VC', 'https://news.google.com/rss/search?q=Saint%20Vincent%20and%20the%20Grenadines%20news&hl=en-VC&gl=VC&ceid=VC%3Aen'),
  ('SN', 'https://news.google.com/rss/search?q=Senegal%20news&hl=en-SN&gl=SN&ceid=SN%3Aen'),
  ('SC', 'https://news.google.com/rss/search?q=Seychelles%20news&hl=en-SC&gl=SC&ceid=SC%3Aen'),
  ('ZA', 'https://news.google.com/rss/search?q=South%20Africa%20news&hl=en-ZA&gl=ZA&ceid=ZA%3Aen'),
  ('TZ', 'https://news.google.com/rss/search?q=Tanzania%20news&hl=en-TZ&gl=TZ&ceid=TZ%3Aen'),
  ('BS', 'https://news.google.com/rss/search?q=The%20Bahamas%20news&hl=en-BS&gl=BS&ceid=BS%3Aen'),
  ('GM', 'https://news.google.com/rss/search?q=The%20Gambia%20news&hl=en-GM&gl=GM&ceid=GM%3Aen'),
  ('TT', 'https://news.google.com/rss/search?q=Trinidad%20%26%20Tobago%20news&hl=en-TT&gl=TT&ceid=TT%3Aen'),
  ('UG', 'https://news.google.com/rss/search?q=Uganda%20news&hl=en-UG&gl=UG&ceid=UG%3Aen'),
  ('ZM', 'https://news.google.com/rss/search?q=Zambia%20news&hl=en-ZM&gl=ZM&ceid=ZM%3Aen'),
  ('ZW', 'https://news.google.com/rss/search?q=Zimbabwe%20news&hl=en-ZW&gl=ZW&ceid=ZW%3Aen')
)
UPDATE public.rss_feed_sources s
   SET url = v.url,
       -- Clear the stale "ok / 0 items" health so the next fetch reports truth
       last_fetch_status = NULL,
       last_fetch_items  = NULL,
       last_fetch_error  = NULL,
       updated_at        = NOW()
  FROM verified v
 WHERE s.country_code = v.country_code
   AND s.url IS DISTINCT FROM v.url;

-- 6. Keep country_name in step with the corrected codes.
UPDATE public.rss_feed_sources s
   SET country_name = c.name
  FROM public.countries c
 WHERE s.country_code = c.code
   AND s.country_name IS DISTINCT FROM c.name;

-- 7. Any active country with no source at all gets one, so a newly added
--    country page is never silently newsless.
WITH verified(country_code, url) AS (
  VALUES
  ('AO', 'https://news.google.com/rss/search?q=Angola%20news&hl=en-AO&gl=AO&ceid=AO%3Aen'),
  ('AG', 'https://news.google.com/rss/search?q=Antigua%20and%20Barbuda%20news&hl=en-AG&gl=AG&ceid=AG%3Aen'),
  ('BB', 'https://news.google.com/rss/search?q=Barbados%20news&hl=en-BB&gl=BB&ceid=BB%3Aen'),
  ('BZ', 'https://news.google.com/rss/search?q=Belize%20news&hl=en-BZ&gl=BZ&ceid=BZ%3Aen'),
  ('BJ', 'https://news.google.com/rss/search?q=Benin%20news&hl=en-BJ&gl=BJ&ceid=BJ%3Aen'),
  ('US-BA', 'https://news.google.com/rss/search?q=African%20American%20news&hl=en-US&gl=US&ceid=US%3Aen'),
  ('BR-BA', 'https://news.google.com/rss/search?q=afro-brasileiros&hl=pt-BR&gl=BR&ceid=BR%3Apt-419'),
  ('GB-BA', 'https://news.google.com/rss/search?q=Black%20British%20news&hl=en-GB&gl=GB&ceid=GB%3Aen'),
  ('EU-BA', 'https://news.google.com/rss/search?q=Black%20Europeans%20Africa%20diaspora&hl=en-GB&gl=GB&ceid=GB%3Aen'),
  ('BW', 'https://news.google.com/rss/search?q=Botswana%20news&hl=en-BW&gl=BW&ceid=BW%3Aen'),
  ('BF', 'https://news.google.com/rss/search?q=Burkina%20Faso%20news&hl=en-BF&gl=BF&ceid=BF%3Aen'),
  ('CM', 'https://news.google.com/rss/search?q=Cameroon%20news&hl=en-CM&gl=CM&ceid=CM%3Aen'),
  ('CV', 'https://news.google.com/rss/search?q=Cape%20Verde%20news&hl=en-CV&gl=CV&ceid=CV%3Aen'),
  ('DM', 'https://news.google.com/rss/search?q=Dominica%20news&hl=en-DM&gl=DM&ceid=DM%3Aen'),
  ('EG', 'https://news.google.com/rss/search?q=Egypt%20news&hl=en-EG&gl=EG&ceid=EG%3Aen'),
  ('ET', 'https://news.google.com/rss/search?q=Ethiopia%20news&hl=en-ET&gl=ET&ceid=ET%3Aen'),
  ('GA', 'https://news.google.com/rss/search?q=Gabon%20news&hl=en-GA&gl=GA&ceid=GA%3Aen'),
  ('GH', 'https://news.google.com/rss/search?q=Ghana%20news&hl=en-GH&gl=GH&ceid=GH%3Aen'),
  ('GD', 'https://news.google.com/rss/search?q=Grenada%20news&hl=en-GD&gl=GD&ceid=GD%3Aen'),
  ('HT', 'https://news.google.com/rss/search?q=Haiti%20news&hl=en-HT&gl=HT&ceid=HT%3Aen'),
  ('ED', 'https://news.google.com/rss/search?q=HBCU&hl=en-US&gl=US&ceid=US%3Aen'),
  ('JM', 'https://news.google.com/rss/search?q=Jamaica%20news&hl=en-JM&gl=JM&ceid=JM%3Aen'),
  ('KE', 'https://news.google.com/rss/search?q=Kenya%20news&hl=en-KE&gl=KE&ceid=KE%3Aen'),
  ('MW', 'https://news.google.com/rss/search?q=Malawi%20news&hl=en-MW&gl=MW&ceid=MW%3Aen'),
  ('MC', 'https://news.google.com/rss/search?q=Morocco%20news&hl=en-MA&gl=MA&ceid=MA%3Aen'),
  ('NA', 'https://news.google.com/rss/search?q=Namibia%20news&hl=en-NA&gl=NA&ceid=NA%3Aen'),
  ('NG', 'https://news.google.com/rss/search?q=Nigeria%20news&hl=en-NG&gl=NG&ceid=NG%3Aen'),
  ('RW', 'https://news.google.com/rss/search?q=Rwanda%20news&hl=en-RW&gl=RW&ceid=RW%3Aen'),
  ('LC', 'https://news.google.com/rss/search?q=Saint%20Lucia%20news&hl=en-LC&gl=LC&ceid=LC%3Aen'),
  ('VC', 'https://news.google.com/rss/search?q=Saint%20Vincent%20and%20the%20Grenadines%20news&hl=en-VC&gl=VC&ceid=VC%3Aen'),
  ('SN', 'https://news.google.com/rss/search?q=Senegal%20news&hl=en-SN&gl=SN&ceid=SN%3Aen'),
  ('SC', 'https://news.google.com/rss/search?q=Seychelles%20news&hl=en-SC&gl=SC&ceid=SC%3Aen'),
  ('ZA', 'https://news.google.com/rss/search?q=South%20Africa%20news&hl=en-ZA&gl=ZA&ceid=ZA%3Aen'),
  ('TZ', 'https://news.google.com/rss/search?q=Tanzania%20news&hl=en-TZ&gl=TZ&ceid=TZ%3Aen'),
  ('BS', 'https://news.google.com/rss/search?q=The%20Bahamas%20news&hl=en-BS&gl=BS&ceid=BS%3Aen'),
  ('GM', 'https://news.google.com/rss/search?q=The%20Gambia%20news&hl=en-GM&gl=GM&ceid=GM%3Aen'),
  ('TT', 'https://news.google.com/rss/search?q=Trinidad%20%26%20Tobago%20news&hl=en-TT&gl=TT&ceid=TT%3Aen'),
  ('UG', 'https://news.google.com/rss/search?q=Uganda%20news&hl=en-UG&gl=UG&ceid=UG%3Aen'),
  ('ZM', 'https://news.google.com/rss/search?q=Zambia%20news&hl=en-ZM&gl=ZM&ceid=ZM%3Aen'),
  ('ZW', 'https://news.google.com/rss/search?q=Zimbabwe%20news&hl=en-ZW&gl=ZW&ceid=ZW%3Aen')
)
INSERT INTO public.rss_feed_sources (name, url, country_code, country_name, is_active)
SELECT 'Google News: ' || c.name, v.url, c.code, c.name, true
  FROM public.countries c
  JOIN verified v ON v.country_code = c.code
 WHERE c.is_active = true
   AND NOT EXISTS (
     SELECT 1 FROM public.rss_feed_sources s WHERE s.country_code = c.code
   );
