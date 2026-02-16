-- Fix JSON-escaped characters in RSS URLs
-- Some URLs were inserted with '\u0026' instead of '&', breaking the query parameters.

-- 1. Fix Ampersands (\u0026 -> &)
UPDATE rss_feed_sources
SET url = REPLACE(url, '\u0026', '&')
WHERE url LIKE '%\u0026%';

-- 2. Fix Equals signs (\u003d -> =) just in case
UPDATE rss_feed_sources
SET url = REPLACE(url, '\u003d', '=')
WHERE url LIKE '%\u003d%';

-- 3. Verify the fix for Saint Vincent
SELECT name, url FROM rss_feed_sources WHERE country_code = 'VC';
