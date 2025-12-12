-- ============================================
-- FIX RSS FEEDS PERMISSIONS
-- Allow admin users to manage RSS feeds
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can read RSS feeds" ON rss_feeds;
DROP POLICY IF EXISTS "Public can read active RSS sources" ON rss_feed_sources;
DROP POLICY IF EXISTS "Service role has full access to RSS sources" ON rss_feed_sources;
DROP POLICY IF EXISTS "Service role has full access to RSS feeds" ON rss_feeds;

-- ============================================
-- RSS FEED SOURCES POLICIES
-- ============================================

-- Public can read active sources
CREATE POLICY "Anyone can read active RSS sources"
  ON rss_feed_sources FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all sources
CREATE POLICY "Authenticated users can read all RSS sources"
  ON rss_feed_sources FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert/update/delete sources
CREATE POLICY "Authenticated users can manage RSS sources"
  ON rss_feed_sources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role full access to RSS sources"
  ON rss_feed_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RSS FEEDS POLICIES
-- ============================================

-- Public can read all feeds
CREATE POLICY "Anyone can read RSS feeds"
  ON rss_feeds FOR SELECT
  USING (true);

-- Authenticated users can insert/update/delete feeds
CREATE POLICY "Authenticated users can manage RSS feeds"
  ON rss_feeds FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role full access to RSS feeds"
  ON rss_feeds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check RSS feed sources policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'rss_feed_sources'
ORDER BY policyname;

-- Check RSS feeds policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'rss_feeds'
ORDER BY policyname;

-- ============================================
-- SUCCESS!
-- Now authenticated admin users can:
-- ✅ Read RSS sources and feeds
-- ✅ Insert new RSS feeds
-- ✅ Update last_fetched_at timestamps
-- ✅ Manage RSS sources
-- ============================================
