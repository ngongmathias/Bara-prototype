-- Per-source fetch health, recorded by the refresh-news-feeds edge function on
-- every run so dead feeds (e.g. a source that discontinued its RSS) surface in
-- the admin UI instead of failing silently.
ALTER TABLE public.rss_feed_sources
  ADD COLUMN IF NOT EXISTS last_fetch_status TEXT,          -- 'ok' | 'error'
  ADD COLUMN IF NOT EXISTS last_fetch_error TEXT,           -- error message when status = 'error'
  ADD COLUMN IF NOT EXISTS last_fetch_items INTEGER;        -- items parsed on the last successful fetch
