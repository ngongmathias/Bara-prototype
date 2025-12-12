-- ============================================
-- AUTO-GENERATED RSS FEEDS SETUP
-- Zero Maintenance, Works for ANY Country!
-- ============================================

-- Step 1: Create RSS feed sources table
CREATE TABLE IF NOT EXISTS rss_feed_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  country_code TEXT,
  country_name TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  fetch_interval_minutes INTEGER DEFAULT 60,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create RSS feeds cache table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  description TEXT,
  pub_date TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL,
  country_code TEXT,
  country_name TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT,
  guid TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_rss_feed_sources_country ON rss_feed_sources(country_code);
CREATE INDEX IF NOT EXISTS idx_rss_feed_sources_active ON rss_feed_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_country ON rss_feeds(country_code);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_pub_date ON rss_feeds(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_source ON rss_feeds(source);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_guid ON rss_feeds(guid);

-- Step 4: Enable RLS
ALTER TABLE rss_feed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies
DROP POLICY IF EXISTS "Public can read active RSS sources" ON rss_feed_sources;
CREATE POLICY "Public can read active RSS sources"
  ON rss_feed_sources FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read RSS feeds" ON rss_feeds;
CREATE POLICY "Public can read RSS feeds"
  ON rss_feeds FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Service role has full access to RSS sources" ON rss_feed_sources;
CREATE POLICY "Service role has full access to RSS sources"
  ON rss_feed_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to RSS feeds" ON rss_feeds;
CREATE POLICY "Service role has full access to RSS feeds"
  ON rss_feeds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 6: Function to auto-generate Google News RSS URL
CREATE OR REPLACE FUNCTION generate_google_news_url(country_name TEXT, country_code TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Generate Google News RSS feed URL for any country
  -- Format: https://news.google.com/rss/search?q=when:24h+allinurl:nigeria&gl=NG&hl=en-NG&ceid=NG:en
  RETURN 'https://news.google.com/rss/search?q=when:24h+allinurl:' || 
         LOWER(country_name) || 
         '&gl=' || country_code || 
         '&hl=en-' || country_code || 
         '&ceid=' || country_code || ':en';
END;
$$ LANGUAGE plpgsql;

-- Step 7: Function to auto-create news source when country is added
CREATE OR REPLACE FUNCTION auto_create_news_source()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically create a Google News RSS source for the new country
  INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active)
  VALUES (
    'Google News ' || NEW.name,
    generate_google_news_url(NEW.name, NEW.code),
    NEW.code,
    NEW.name,
    'general',
    true
  )
  ON CONFLICT (url) DO NOTHING; -- Prevent duplicates
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger to auto-generate news sources
DROP TRIGGER IF EXISTS auto_news_source_trigger ON countries;
CREATE TRIGGER auto_news_source_trigger
AFTER INSERT ON countries
FOR EACH ROW
EXECUTE FUNCTION auto_create_news_source();

-- Step 9: Backfill - Create news sources for ALL existing countries
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active)
SELECT 
  'Google News ' || name,
  generate_google_news_url(name, code),
  code,
  name,
  'general',
  true
FROM countries
WHERE code IS NOT NULL
ON CONFLICT (url) DO NOTHING;

-- Step 10: Add global news sources (BBC, Reuters, etc.)
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active)
VALUES
  ('BBC Africa', 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', NULL, NULL, 'general', true),
  ('Africa News', 'https://www.africanews.com/feed/', NULL, NULL, 'general', true),
  ('AllAfrica', 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', NULL, NULL, 'general', true),
  ('Reuters Africa', 'https://www.reuters.com/world/africa/rss', NULL, NULL, 'general', true)
ON CONFLICT (url) DO NOTHING;

-- Step 11: Create function to clean old RSS feeds
CREATE OR REPLACE FUNCTION clean_old_rss_feeds()
RETURNS void AS $$
BEGIN
  DELETE FROM rss_feeds
  WHERE pub_date < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Step 12: Verify setup
SELECT 'RSS Feed Sources Created:' as status, COUNT(*) as count FROM rss_feed_sources;
SELECT 'Countries with Auto-Generated News:' as status, COUNT(DISTINCT country_code) as count FROM rss_feed_sources WHERE country_code IS NOT NULL;

-- ============================================
-- SETUP COMPLETE! 🎉
-- 
-- ✅ ZERO MAINTENANCE:
-- - News sources auto-created for ALL countries
-- - Add new country → News source auto-created
-- - Uses Google News (free, reliable)
-- 
-- Next Steps:
-- 1. Go to /admin/rss-feeds
-- 2. Click "Refresh Now"
-- 3. News will appear for ALL countries!
-- 
-- Add a new country:
-- INSERT INTO countries (name, code) VALUES ('Togo', 'TG');
-- → News source automatically created! ✅
-- ============================================
