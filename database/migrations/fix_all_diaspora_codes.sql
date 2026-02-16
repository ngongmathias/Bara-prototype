-- COMPREHENSIVE FIX FOR DIASPORA COMMUNITIES
-- This script does two things:
-- 1. Updates the `countries` table to use the correct custom codes (e.g. EU-BA) instead of standard country codes (e.g. BE).
-- 2. Ensures the `rss_feed_sources` table has entries for these new codes.

-- PART 1: Fix Country Codes
-- We update by NAME to ensure we target the correct rows.

-- A. Black/African Europeans -> EU-BA
UPDATE countries 
SET code = 'EU-BA' 
WHERE name = 'Black/African Europeans' AND code != 'EU-BA';

-- B. Black/African British -> GB-BA
UPDATE countries 
SET code = 'GB-BA' 
WHERE name = 'Black/African British' AND code != 'GB-BA';

-- C. Black/African Americans -> US-BA
UPDATE countries 
SET code = 'US-BA' 
WHERE name = 'Black/African Americans' AND code != 'US-BA';

-- D. Black/African Brazilians -> BR-BA
UPDATE countries 
SET code = 'BR-BA' 
WHERE name = 'Black/African Brazilians' AND code != 'BR-BA';


-- PART 2: Ensure RSS Sources Exist for these New Codes
-- We insert the source if it doesn't exist, or update it if it does.

-- A. EU-BA
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
ON CONFLICT (url) DO UPDATE SET country_code = 'EU-BA', is_active = true;

-- B. GB-BA
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES (
    'Google News: Black British', 
    'https://news.google.com/rss/search?q=Black+British+OR+African+British&hl=en-GB&gl=GB&ceid=GB:en', 
    'GB-BA', 
    'Black/African British', 
    'general', 
    true, 
    120
)
ON CONFLICT (url) DO UPDATE SET country_code = 'GB-BA', is_active = true;

-- C. US-BA
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES (
    'Google News: African Americans', 
    'https://news.google.com/rss/search?q=African+American+news&hl=en-US&gl=US&ceid=US:en', 
    'US-BA', 
    'Black/African Americans', 
    'general', 
    true, 
    120
)
ON CONFLICT (url) DO UPDATE SET country_code = 'US-BA', is_active = true;

-- D. BR-BA
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES (
    'Google News: Afro-Brazilians', 
    'https://news.google.com/rss/search?q=Afro-Brazilian+news&hl=pt-BR&gl=BR&ceid=BR:pt-419', 
    'BR-BA', 
    'Black/African Brazilians', 
    'general', 
    true, 
    120
)
ON CONFLICT (url) DO UPDATE SET country_code = 'BR-BA', is_active = true;

-- Verify the changes
SELECT name, code FROM countries WHERE name LIKE 'Black/African%';
