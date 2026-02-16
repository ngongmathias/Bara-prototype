-- Fix EU-BA (Black/African Europeans) RSS Source

-- 1. Ensure the source exists and is active. Update URL if needed.
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
ON CONFLICT (url) DO UPDATE 
SET 
    is_active = true,
    country_code = 'EU-BA', -- Ensure code maps correctly
    last_fetched_at = NULL; -- Reset fetch time to force immediate update

-- 2. Clean up potentially stale feeds for this country code
-- DELETE FROM rss_feeds WHERE country_code = 'EU-BA'; 
-- (Commented out to avoid wiping history if it exists, refresh will overwrite/upsert)
