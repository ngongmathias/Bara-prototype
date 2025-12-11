-- Create RSS feed sources table
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

-- Create RSS feeds cache table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rss_feed_sources_country ON rss_feed_sources(country_code);
CREATE INDEX IF NOT EXISTS idx_rss_feed_sources_active ON rss_feed_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_country ON rss_feeds(country_code);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_pub_date ON rss_feeds(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_source ON rss_feeds(source);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_guid ON rss_feeds(guid);

-- Enable RLS
ALTER TABLE rss_feed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Public can read active RSS sources"
  ON rss_feed_sources FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can read RSS feeds"
  ON rss_feeds FOR SELECT
  TO public
  USING (true);

-- Service role has full access
CREATE POLICY "Service role has full access to RSS sources"
  ON rss_feed_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to RSS feeds"
  ON rss_feeds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert RSS feed sources for African countries
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES
  -- Benin News Sources
  ('Benin Web TV', 'https://www.beninwebtv.com/feed/', 'BJ', 'Benin', 'general', true, 60),
  ('La Nouvelle Tribune', 'https://lanouvelletribune.info/feed/', 'BJ', 'Benin', 'general', true, 60),
  
  -- Nigeria News Sources
  ('Punch Nigeria', 'https://punchng.com/feed/', 'NG', 'Nigeria', 'general', true, 60),
  ('Premium Times', 'https://www.premiumtimesng.com/feed', 'NG', 'Nigeria', 'general', true, 60),
  ('The Guardian Nigeria', 'https://guardian.ng/feed/', 'NG', 'Nigeria', 'general', true, 60),
  
  -- Kenya News Sources
  ('Daily Nation', 'https://nation.africa/kenya/rss', 'KE', 'Kenya', 'general', true, 60),
  ('The Star Kenya', 'https://www.the-star.co.ke/feed', 'KE', 'Kenya', 'general', true, 60),
  
  -- South Africa News Sources
  ('News24', 'https://feeds.news24.com/articles/news24/TopStories/rss', 'ZA', 'South Africa', 'general', true, 60),
  ('IOL', 'https://www.iol.co.za/rss/south-africa', 'ZA', 'South Africa', 'general', true, 60),
  
  -- Ghana News Sources
  ('GhanaWeb', 'https://www.ghanaweb.com/GhanaHomePage/rss/news.xml', 'GH', 'Ghana', 'general', true, 60),
  ('Graphic Online', 'https://www.graphic.com.gh/rss/news.xml', 'GH', 'Ghana', 'general', true, 60),
  
  -- Ethiopia News Sources
  ('Ethiopian Monitor', 'https://ethiopianmonitor.com/feed/', 'ET', 'Ethiopia', 'general', true, 60),
  ('Addis Standard', 'https://addisstandard.com/feed/', 'ET', 'Ethiopia', 'general', true, 60),
  
  -- Tanzania News Sources
  ('The Citizen Tanzania', 'https://www.thecitizen.co.tz/tanzania/rss', 'TZ', 'Tanzania', 'general', true, 60),
  
  -- Uganda News Sources
  ('Daily Monitor', 'https://www.monitor.co.ug/uganda/rss', 'UG', 'Uganda', 'general', true, 60),
  ('New Vision', 'https://www.newvision.co.ug/rss', 'UG', 'Uganda', 'general', true, 60),
  
  -- Rwanda News Sources
  ('The New Times', 'https://www.newtimes.co.rw/rss', 'RW', 'Rwanda', 'general', true, 60),
  
  -- Senegal News Sources
  ('Seneweb', 'https://www.seneweb.com/rss', 'SN', 'Senegal', 'general', true, 60),
  
  -- Cameroon News Sources
  ('Cameroon Tribune', 'https://www.cameroon-tribune.cm/rss', 'CM', 'Cameroon', 'general', true, 60),
  
  -- Ivory Coast News Sources
  ('Abidjan.net', 'https://news.abidjan.net/rss', 'CI', 'Ivory Coast', 'general', true, 60),
  
  -- General African News
  ('BBC Africa', 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', NULL, NULL, 'general', true, 60),
  ('Africa News', 'https://www.africanews.com/feed/', NULL, NULL, 'general', true, 60),
  ('AllAfrica', 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', NULL, NULL, 'general', true, 60)
ON CONFLICT (url) DO NOTHING;

-- Create function to clean old RSS feeds (keep last 30 days)
CREATE OR REPLACE FUNCTION clean_old_rss_feeds()
RETURNS void AS $$
BEGIN
  DELETE FROM rss_feeds
  WHERE pub_date < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE rss_feed_sources IS 'RSS feed sources for news aggregation';
COMMENT ON TABLE rss_feeds IS 'Cached RSS feed items';
