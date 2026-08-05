-- ============================================================
-- Ebooks to parity — reading progress + read-count semantics (STREAMS_MASTER_PLAN.md §I)
--
-- I1: New table so the in-app reader (PDF via react-pdf, EPUB via
-- react-reader/epub.js) can resume where a reader left off, same pattern
-- as podcast_listen_history / movie_watch_progress.
-- I4: D7 explicitly rules out raw downloads ("no raw downloads" — books
-- are read in-app only), so `download_count` has been measuring something
-- that no longer happens. Renamed to `read_count` and repointed at the
-- reader page opening a book, not a file download.
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ebooks' AND column_name='download_count')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ebooks' AND column_name='read_count') THEN
        ALTER TABLE public.ebooks RENAME COLUMN download_count TO read_count;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_ebooks_download_count')
       AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_ebooks_read_count') THEN
        ALTER INDEX public.idx_ebooks_download_count RENAME TO idx_ebooks_read_count;
    END IF;
END $$;

-- =========================
-- Reading progress (§I1) — resume + future "Continue Reading" rail
-- =========================
CREATE TABLE IF NOT EXISTS public.ebook_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE,
    format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf' | 'epub'
    location TEXT, -- PDF: page number as text; EPUB: epub.js CFI string
    progress_percent NUMERIC(5,2) DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, ebook_id)
);

ALTER TABLE public.ebook_reading_progress ENABLE ROW LEVEL SECURITY;

-- Mirrors the existing permissive posture of movie_watch_progress /
-- podcast_listen_history (RLS hardening deferred to Phase 13 per §D2/§K).
DROP POLICY IF EXISTS "Users can manage their reading progress" ON public.ebook_reading_progress;
CREATE POLICY "Users can manage their reading progress" ON public.ebook_reading_progress FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebook_reading_progress TO authenticated;

-- Atomic increment, callable by anon too — free books can be read signed-out
-- (parity with anonymous song plays), same pattern as record_episode_play.
CREATE OR REPLACE FUNCTION public.record_ebook_read(p_ebook_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.ebooks SET read_count = read_count + 1 WHERE id = p_ebook_id;
$$;

GRANT EXECUTE ON FUNCTION public.record_ebook_read(UUID) TO anon, authenticated;
