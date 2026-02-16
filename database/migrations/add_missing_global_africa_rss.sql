-- Add Missing RSS Feed Sources for Global Africa Communities & potentially missing countries
-- Comparing all communities in global_africa table with existing RSS sources
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

-- 1. Missing Global Africa Communities
-- African Americans (US-AA), HBCUs (US-HBCU), Brazil (BR-AFRO)

INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES
  -- African Americans
  ('Google News: African Americans', 'https://news.google.com/rss/search?q=African+American+community\u0026hl=en-US\u0026gl=US\u0026ceid=US:en', 'US-AA', 'African Americans', 'general', true, 120),
  
  -- HBCUs
  ('Google News: HBCUs', 'https://news.google.com/rss/search?q=HBCU+OR+Historically+Black+Colleges\u0026hl=en-US\u0026gl=US\u0026ceid=US:en', 'US-HBCU', 'HBCUs (USA)', 'general', true, 120),
  
  -- Brazil (Afro-Brazilian)
  ('Google News: Brazil Afro', 'https://news.google.com/rss/search?q=Brazil+Afro-Brazilian\u0026hl=pt-BR\u0026gl=BR\u0026ceid=BR:pt-419', 'BR-AFRO', 'Brazil', 'general', true, 120)
ON CONFLICT (url) DO NOTHING;

-- 2. Ensure St. Vincent & Barbados are in rss_feed_sources (they were in a previous file, but let's be safe)
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES
  ('Google News: Saint Vincent', 'https://news.google.com/rss/search?q=Saint+Vincent+Grenadines\u0026hl=en\u0026gl=VC\u0026ceid=VC:en', 'VC', 'Saint Vincent and the Grenadines', 'general', true, 120),
  ('Google News: Barbados', 'https://news.google.com/rss/search?q=Barbados+news\u0026hl=en\u0026gl=BB\u0026ceid=BB:en', 'BB', 'Barbados', 'general', true, 120)
ON CONFLICT (url) DO NOTHING;

-- 3. Trigger a refresh of RSS feeds (if function exists)
-- This will try to fetch the latest news immediately
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_rss_feeds') THEN
    PERFORM refresh_rss_feeds();
  END IF;
END $$;
