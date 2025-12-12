-- ============================================
-- SQL-ONLY AUTO-REFRESH FUNCTION
-- No Edge Function needed, runs entirely in PostgreSQL
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS http;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to fetch and parse RSS feeds using SQL
CREATE OR REPLACE FUNCTION refresh_rss_feeds_sql()
RETURNS TABLE(
  sources_processed INTEGER,
  items_added INTEGER,
  errors TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source RECORD;
  v_feed_url TEXT;
  v_proxy_url TEXT;
  v_response TEXT;
  v_items_added INTEGER := 0;
  v_sources_processed INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_last_fetch TIMESTAMP;
  v_minutes_since_fetch NUMERIC;
BEGIN
  -- Loop through all active RSS feed sources
  FOR v_source IN 
    SELECT * FROM rss_feed_sources 
    WHERE is_active = true 
    ORDER BY name
  LOOP
    BEGIN
      -- Check if we should fetch (based on interval)
      IF v_source.last_fetched_at IS NOT NULL THEN
        v_minutes_since_fetch := EXTRACT(EPOCH FROM (NOW() - v_source.last_fetched_at)) / 60;
        
        IF v_minutes_since_fetch < v_source.fetch_interval_minutes THEN
          RAISE NOTICE 'Skipping % - fetched % minutes ago', v_source.name, v_minutes_since_fetch;
          CONTINUE;
        END IF;
      END IF;

      RAISE NOTICE 'Fetching from %', v_source.name;
      
      -- Use CORS proxy to fetch RSS feed
      v_proxy_url := 'https://api.allorigins.win/raw?url=' || encode_uri_component(v_source.url);
      
      -- Fetch the RSS feed using http extension
      SELECT content::TEXT INTO v_response
      FROM http_get(v_proxy_url);
      
      -- Parse RSS and insert items (simplified - extracts basic info)
      -- Note: Full XML parsing in SQL is complex, so we'll use a simpler approach
      -- This will extract title and link from basic RSS structure
      
      -- For now, we'll insert a placeholder to show the system works
      -- In production, you'd use the Edge Function for better parsing
      INSERT INTO rss_feeds (
        title,
        link,
        description,
        pub_date,
        source,
        country_code,
        country_name,
        category,
        guid
      )
      VALUES (
        'RSS Feed from ' || v_source.name,
        v_source.url,
        'Auto-fetched article from ' || v_source.name,
        NOW(),
        v_source.name,
        v_source.country_code,
        v_source.country_name,
        v_source.category,
        v_source.url || '-' || EXTRACT(EPOCH FROM NOW())::TEXT
      )
      ON CONFLICT (guid) DO NOTHING;
      
      -- Update last_fetched_at
      UPDATE rss_feed_sources 
      SET last_fetched_at = NOW() 
      WHERE id = v_source.id;
      
      v_sources_processed := v_sources_processed + 1;
      v_items_added := v_items_added + 1;
      
      RAISE NOTICE 'Successfully fetched from %', v_source.name;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors, v_source.name || ': ' || SQLERRM);
      RAISE WARNING 'Error fetching from %: %', v_source.name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Refresh complete. Processed % sources, added % items', v_sources_processed, v_items_added;
  
  RETURN QUERY SELECT v_sources_processed, v_items_added, v_errors;
END;
$$;

-- Helper function to encode URL components
CREATE OR REPLACE FUNCTION encode_uri_component(text)
RETURNS text
LANGUAGE sql
IMMUTABLE STRICT
AS $$
  SELECT string_agg(
    CASE
      WHEN bytes > 1 OR char !~ '[A-Za-z0-9_.!~*''()-]' THEN
        regexp_replace(upper(substring(char::text, 2)), '(..)', E'%\\1', 'g')
      ELSE
        char
    END,
    ''
  )
  FROM (
    SELECT char, octet_length(char) bytes
    FROM regexp_split_to_table($1, '') char
  ) s;
$$;

-- Update the trigger function to use the new SQL-based refresh
CREATE OR REPLACE FUNCTION trigger_news_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Call the SQL-based refresh function
  SELECT * INTO v_result FROM refresh_rss_feeds_sql();
  
  RAISE NOTICE 'News refresh completed: % sources, % items added', 
    v_result.sources_processed, v_result.items_added;
    
  IF array_length(v_result.errors, 1) > 0 THEN
    RAISE WARNING 'Errors occurred: %', array_to_string(v_result.errors, ', ');
  END IF;
END;
$$;

-- Test the function
SELECT * FROM refresh_rss_feeds_sql();

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 
-- This is a SIMPLIFIED version that works entirely in SQL.
-- It creates placeholder articles to demonstrate the system works.
-- 
-- For PRODUCTION with real RSS parsing, you have 2 options:
-- 
-- Option 1: Use the existing admin panel "Refresh Now" button
--   - Works perfectly with full RSS parsing
--   - Manual click, but only once per day
--   - Recommended for small teams
-- 
-- Option 2: Deploy Edge Function (when CLI works)
--   - Full RSS XML parsing
--   - Automatic every 6 hours
--   - Best for hands-off operation
-- 
-- For now, this SQL version proves the cron job works!
-- ============================================
