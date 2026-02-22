-- Migration: Premium Songs Infrastructure
-- Description: Adding boosting capabilities to the Streams vertical.

ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_songs_premium ON public.songs(is_premium) WHERE is_premium = true;

COMMENT ON COLUMN public.songs.is_premium IS 'Indicates if the artist has paid for top placement/trending status';
COMMENT ON COLUMN public.songs.boosted_until IS 'Timestamp when the song boost expires';
