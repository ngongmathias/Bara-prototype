-- ============================================================
-- Switch African country feeds from Google News to AllAfrica
--
-- WHY: Google News blocks Supabase Edge Function datacenter IPs outright.
-- Measured on a full refresh — all 44 Google News sources returned HTTP 503
-- while all 5 direct-outlet sources (BBC Africa, AllAfrica, African Business,
-- Africa News, The Africa Report) returned 200 with items. A perfect split by
-- domain, not by request rate: the same URLs return 100+ items from a
-- residential IP with either a bot or a browser User-Agent. Lowering
-- concurrency and adding backoff did not help, because it is an IP block, not
-- throttling.
--
-- Routing through the rss2json proxy did work, but its free tier starts
-- returning HTTP 403 after roughly ten requests — not enough for 44 sources.
--
-- AllAfrica serves per-country RSS directly, permits server-side fetching,
-- and is already one of the sources that succeeds from the edge function
-- today. Every URL below was verified by live fetch:
-- `node scripts/verify_allafrica_urls.mjs` reported 24/24 returning items.
--
-- Non-African pages (Caribbean and diaspora codes) keep their Google News
-- feeds — they are unaffected by this migration and most already hold
-- articles. The proxy fallback in the edge function still covers them, and
-- the pan-Africa fallback in getRSSFeeds backs up anything thin.
-- ============================================================

WITH verified(country_code, url) AS (
  VALUES
  ('AO', 'https://allafrica.com/tools/headlines/rdf/angola/headlines.rdf'),
  ('BJ', 'https://allafrica.com/tools/headlines/rdf/benin/headlines.rdf'),
  ('BW', 'https://allafrica.com/tools/headlines/rdf/botswana/headlines.rdf'),
  ('BF', 'https://allafrica.com/tools/headlines/rdf/burkinafaso/headlines.rdf'),
  ('CM', 'https://allafrica.com/tools/headlines/rdf/cameroon/headlines.rdf'),
  ('CV', 'https://allafrica.com/tools/headlines/rdf/capeverde/headlines.rdf'),
  ('EG', 'https://allafrica.com/tools/headlines/rdf/egypt/headlines.rdf'),
  ('ET', 'https://allafrica.com/tools/headlines/rdf/ethiopia/headlines.rdf'),
  ('GA', 'https://allafrica.com/tools/headlines/rdf/gabon/headlines.rdf'),
  ('GH', 'https://allafrica.com/tools/headlines/rdf/ghana/headlines.rdf'),
  ('GM', 'https://allafrica.com/tools/headlines/rdf/gambia/headlines.rdf'),
  ('KE', 'https://allafrica.com/tools/headlines/rdf/kenya/headlines.rdf'),
  ('MW', 'https://allafrica.com/tools/headlines/rdf/malawi/headlines.rdf'),
  ('MC', 'https://allafrica.com/tools/headlines/rdf/morocco/headlines.rdf'),
  ('NA', 'https://allafrica.com/tools/headlines/rdf/namibia/headlines.rdf'),
  ('NG', 'https://allafrica.com/tools/headlines/rdf/nigeria/headlines.rdf'),
  ('RW', 'https://allafrica.com/tools/headlines/rdf/rwanda/headlines.rdf'),
  ('SN', 'https://allafrica.com/tools/headlines/rdf/senegal/headlines.rdf'),
  ('SC', 'https://allafrica.com/tools/headlines/rdf/seychelles/headlines.rdf'),
  ('ZA', 'https://allafrica.com/tools/headlines/rdf/southafrica/headlines.rdf'),
  ('TZ', 'https://allafrica.com/tools/headlines/rdf/tanzania/headlines.rdf'),
  ('UG', 'https://allafrica.com/tools/headlines/rdf/uganda/headlines.rdf'),
  ('ZM', 'https://allafrica.com/tools/headlines/rdf/zambia/headlines.rdf'),
  ('ZW', 'https://allafrica.com/tools/headlines/rdf/zimbabwe/headlines.rdf')
)
UPDATE public.rss_feed_sources s
   SET url               = v.url,
       name              = 'AllAfrica: ' || COALESCE(s.country_name, s.country_code),
       -- Clear stale health so the next run reports the truth rather than
       -- the old Google News 503.
       last_fetch_status = NULL,
       last_fetch_items  = NULL,
       last_fetch_error  = NULL,
       updated_at        = NOW()
  FROM verified v
 WHERE s.country_code = v.country_code
   AND s.is_active = true
   AND s.url IS DISTINCT FROM v.url
   -- Never create a duplicate URL; the column is UNIQUE.
   AND NOT EXISTS (
     SELECT 1 FROM public.rss_feed_sources o WHERE o.url = v.url AND o.id <> s.id
   );
