-- Add All Missing RSS Sources Dynamically
-- This script finds any active country in the 'countries' table that does NOT have a corresponding entry in 'rss_feed_sources'
-- It automatically constructs a Google News RSS URL for them.

INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
SELECT 
    'Google News: ' || c.name, -- Name: e.g., "Google News: Ghana"
    'https://news.google.com/rss/search?q=' || replace(c.name, ' ', '+') || '+news&hl=en', -- URL: e.g., https://news.google.com/rss/search?q=Ghana+news&hl=en
    c.code, 
    c.name, 
    'general', 
    true, 
    120
FROM countries c
WHERE c.is_active = true 
  AND NOT EXISTS (
      SELECT 1 
      FROM rss_feed_sources r 
      WHERE r.country_code = c.code
  );

-- Also, specifically force update the 'EU-BA' one again just in case, ensuring the URL is correct
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES (
    'Google News: Black Europeans', 
    'https://news.google.com/rss/search?q=Black+European+OR+African+diaspora+Europe&hl=en&gl=DE&ceid=DE:en', 
    'EU-BA', 
    'Black/African Europeans', 
    'general', 
    true, 
    120
)
ON CONFLICT (url) 
DO UPDATE SET 
    country_code = 'EU-BA',
    is_active = true,
    last_fetched_at = NULL; 

-- Note: The ON CONFLICT clause above depends on your constraints. 
-- If 'url' is the unique constraint, the previous script worked. 
-- If you want to be safe, just running the SELECT insert above covers the gaps.
