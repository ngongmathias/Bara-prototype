-- ============================================================
-- Movies to parity — schema fix + watch progress + storage (STREAMS_MASTER_PLAN.md §H)
--
-- H1: AdminMovies.tsx has always written to `stream_url`, `producers`,
-- `writers`, `actors` — the latter three were added by
-- 20260804_consolidate_song_artists_junction.sql, but `stream_url` was
-- never added anywhere, so every AdminMovies create/edit has been failing
-- with a schema-cache error. This is the last missing column.
-- H2: Movies has never had a storage bucket — AdminMovies.tsx's poster/
-- backdrop/trailer/movie-file uploads all target a `movies` bucket that
-- doesn't exist, so every upload has been failing too.
-- H3: New table so the watch page can resume playback where a viewer
-- left off, same pattern as podcast_listen_history.
-- ============================================================

ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS stream_url TEXT;

-- =========================
-- Watch progress (§H3) — resume + "Continue Watching"
-- =========================
CREATE TABLE IF NOT EXISTS public.movie_watch_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, movie_id)
);

ALTER TABLE public.movie_watch_progress ENABLE ROW LEVEL SECURITY;

-- Mirrors the existing permissive posture of movie_watchlist / podcast_listen_history
-- (RLS hardening is deferred to Phase 13 per STREAMS_MASTER_PLAN.md §D2/§K).
DROP POLICY IF EXISTS "Users can manage their watch progress" ON public.movie_watch_progress;
CREATE POLICY "Users can manage their watch progress" ON public.movie_watch_progress FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.movie_watch_progress TO authenticated;

-- =========================
-- Storage bucket for movie posters, backdrops, trailers and full films
-- =========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'movies',
    'movies',
    true,
    2147483648, -- 2GB per file (full films)
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'
    ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read movies bucket" ON storage.objects;
CREATE POLICY "Public read movies bucket"
    ON storage.objects FOR SELECT
    TO public USING (bucket_id = 'movies');

DROP POLICY IF EXISTS "Authenticated upload movies bucket" ON storage.objects;
CREATE POLICY "Authenticated upload movies bucket"
    ON storage.objects FOR INSERT
    TO authenticated WITH CHECK (bucket_id = 'movies');

DROP POLICY IF EXISTS "Authenticated update movies bucket" ON storage.objects;
CREATE POLICY "Authenticated update movies bucket"
    ON storage.objects FOR UPDATE
    TO authenticated USING (bucket_id = 'movies');

DROP POLICY IF EXISTS "Authenticated delete movies bucket" ON storage.objects;
CREATE POLICY "Authenticated delete movies bucket"
    ON storage.objects FOR DELETE
    TO authenticated USING (bucket_id = 'movies');
