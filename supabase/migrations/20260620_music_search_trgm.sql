-- ============================================================
-- Music search: typo-tolerant song search (Streams Tier 1 #3 / F4)
-- ============================================================
-- Enables pg_trgm fuzzy matching so "amapaino" still finds "Amapiano".
-- The MusicSearchPage calls search_songs() and gracefully falls back to plain
-- ILIKE if this migration hasn't been applied, so it's safe/optional — but
-- applying it turns on real typo tolerance + faster matching.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for fast fuzzy / substring matching
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm     ON public.songs     USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_artists_name_trgm    ON public.artists   USING gin (name  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_albums_title_trgm    ON public.albums    USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_playlists_title_trgm ON public.playlists USING gin (title gin_trgm_ops);

-- Typo-tolerant song search, ranked: prefix match > similarity > popularity.
CREATE OR REPLACE FUNCTION public.search_songs(p_q text, p_limit int DEFAULT 24)
RETURNS TABLE (
  id uuid,
  title text,
  cover_url text,
  file_url text,
  duration int,
  artist_id uuid,
  album_id uuid,
  price numeric,
  artist_name text
)
LANGUAGE sql
STABLE
AS $$
  SELECT s.id, s.title, s.cover_url, s.file_url, s.duration,
         s.artist_id, s.album_id, s.price, a.name AS artist_name
  FROM public.songs s
  LEFT JOIN public.artists a ON a.id = s.artist_id
  WHERE s.title ILIKE '%' || p_q || '%'
     OR a.name  ILIKE '%' || p_q || '%'
     OR similarity(s.title, p_q) > 0.2
     OR similarity(COALESCE(a.name, ''), p_q) > 0.2
  ORDER BY
     (s.title ILIKE p_q || '%') DESC,
     GREATEST(similarity(s.title, p_q), similarity(COALESCE(a.name, ''), p_q)) DESC,
     COALESCE(s.plays, 0) DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.search_songs(text, int) TO anon, authenticated;
