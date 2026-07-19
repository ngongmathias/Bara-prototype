-- ============================================
-- FIX RSS REFRESH (2026-07-19)
--
-- Root causes of the stale-feed incident:
--   1. service_role had NO grants on rss_feeds / rss_feed_sources (lost when
--      the tables were recreated), so any server-side refresh failed with
--      "permission denied".
--   2. No automated refresh existed: the refresh-news-feeds edge function was
--      never deployed and no cron job was scheduled. The only refresh path was
--      a long-running loop in the admin's browser tab.
-- ============================================

-- 1) Restore full access for the service role (used by the edge function).
GRANT ALL ON TABLE public.rss_feeds TO service_role;
GRANT ALL ON TABLE public.rss_feed_sources TO service_role;

-- 2) Schedule the edge function hourly via pg_cron + pg_net.
--    The anon key is a publishable key; it only satisfies the platform JWT
--    check on the function endpoint.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-rss-feeds-hourly') THEN
    PERFORM cron.unschedule('refresh-rss-feeds-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'refresh-rss-feeds-hourly',
  '7 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://sqxybqvrctegnejbkpwg.supabase.co/functions/v1/refresh-news-feeds',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjk4NzYsImV4cCI6MjA4MTc0NTg3Nn0.EpIoS1esjFPzJ4ruKhTiJoVNk09Em4edd9beTdVRpRw'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
