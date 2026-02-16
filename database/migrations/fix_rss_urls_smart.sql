-- SMART FIX FOR RSS URLS
-- Why this is needed: 
-- You have duplicate entries for some countries (one corrupted with `\u0026`, one correct).
-- The simple update failed because it tried to create a duplicate.

-- 1. DELETE any corrupted row if a clean version ALREADY exists
-- (This removes the duplicate)
DELETE FROM rss_feed_sources
WHERE url LIKE '%\u0026%'
  AND EXISTS (
      SELECT 1 
      FROM rss_feed_sources clean 
      WHERE clean.url = REPLACE(rss_feed_sources.url, '\u0026', '&')
  );

-- 2. UPDATE any remaining corrupted rows
-- (These are safe to update because no clean version exists)
UPDATE rss_feed_sources
SET url = REPLACE(url, '\u0026', '&')
WHERE url LIKE '%\u0026%';

-- 3. Just in case, do the same for equals checks (\u003d)
DELETE FROM rss_feed_sources
WHERE url LIKE '%\u003d%'
  AND EXISTS (
      SELECT 1 
      FROM rss_feed_sources clean 
      WHERE clean.url = REPLACE(rss_feed_sources.url, '\u003d', '=')
  );

UPDATE rss_feed_sources
SET url = REPLACE(url, '\u003d', '=')
WHERE url LIKE '%\u003d%';

-- 4. Verify the fix for Saint Vincent
SELECT name, url FROM rss_feed_sources WHERE country_code = 'VC';
