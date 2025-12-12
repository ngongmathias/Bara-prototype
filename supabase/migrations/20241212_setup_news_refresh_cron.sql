-- ============================================
-- AUTO-REFRESH NEWS FEEDS CRON JOB
-- Runs every 6 hours automatically
-- ============================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION trigger_news_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  service_key TEXT;
  response TEXT;
BEGIN
  -- Get the Supabase project URL and service key from environment
  -- These will be set in Supabase dashboard
  function_url := current_setting('app.supabase_url', true) || '/functions/v1/refresh-news-feeds';
  service_key := current_setting('app.supabase_service_key', true);
  
  -- Call the Edge Function using http extension
  -- Note: This requires the http extension to be enabled
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  
  RAISE NOTICE 'News refresh triggered at %', NOW();
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger news refresh: %', SQLERRM;
END;
$$;

-- Schedule the cron job to run every 6 hours
-- Runs at: 00:00, 06:00, 12:00, 18:00 UTC daily
SELECT cron.schedule(
  'refresh-news-feeds-every-6-hours',
  '0 */6 * * *',  -- Every 6 hours
  $$SELECT trigger_news_refresh();$$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'refresh-news-feeds-every-6-hours';

-- ============================================
-- MANUAL TESTING (Optional)
-- ============================================
-- To test the function manually:
-- SELECT trigger_news_refresh();

-- To see all scheduled cron jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('refresh-news-feeds-every-6-hours');

-- ============================================
-- NOTES:
-- ============================================
-- 1. This cron job runs every 6 hours automatically
-- 2. No manual "Refresh Now" clicks needed
-- 3. News stays fresh 24/7
-- 4. Safe and reliable
-- 5. Zero maintenance required
