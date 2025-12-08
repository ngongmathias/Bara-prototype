-- Create RSS feeds cache table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  description TEXT,
  pub_date TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL,
  country_code TEXT,
  country_name TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT,
  guid TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rss_feeds_country ON rss_feeds(country_code);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_pub_date ON rss_feeds(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_source ON rss_feeds(source);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_created_at ON rss_feeds(created_at DESC);

-- Create RSS feed sources configuration table
CREATE TABLE IF NOT EXISTS rss_feed_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Insert default African news RSS sources
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category) VALUES
  ('BBC Africa', 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', NULL, 'Africa', 'General'),
  ('AllAfrica News', 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', NULL, 'Africa', 'General'),
  ('Africa News', 'https://www.africanews.com/feed/', NULL, 'Africa', 'General'),
  ('The Africa Report', 'https://www.theafricareport.com/feed/', NULL, 'Africa', 'Business'),
  ('African Business', 'https://african.business/feed/', NULL, 'Africa', 'Business')
ON CONFLICT (url) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "RSS feeds are viewable by everyone" ON rss_feeds
  FOR SELECT USING (true);

CREATE POLICY "RSS feed sources are viewable by everyone" ON rss_feed_sources
  FOR SELECT USING (true);

-- Admin policies for insert/update/delete
CREATE POLICY "Admins can insert RSS feeds" ON rss_feeds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update RSS feeds" ON rss_feeds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete RSS feeds" ON rss_feeds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Similar policies for rss_feed_sources
CREATE POLICY "Admins can insert RSS feed sources" ON rss_feed_sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update RSS feed sources" ON rss_feed_sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete RSS feed sources" ON rss_feed_sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rss_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_rss_feeds_timestamp
  BEFORE UPDATE ON rss_feeds
  FOR EACH ROW
  EXECUTE FUNCTION update_rss_feeds_updated_at();

CREATE TRIGGER update_rss_feed_sources_timestamp
  BEFORE UPDATE ON rss_feed_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_rss_feeds_updated_at();
