-- ============================================================
-- Draft/publish state + scheduled releases for songs
-- (STREAMS_MASTER_PLAN.md §E4)
--
-- Everything uploads and goes live instantly today — there's no way for an
-- artist to save a draft or schedule a release for later. Adds the columns;
-- default keeps every existing song exactly as visible as it is today.
-- ============================================================

ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS release_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_songs_status ON public.songs(status);

COMMENT ON COLUMN public.songs.status IS 'draft = only visible to the owning artist; published = normal visibility (still gated by release_date)';
COMMENT ON COLUMN public.songs.release_date IS 'NULL = publish immediately once status=published; future timestamp = stays hidden from public listings client-side until this passes';
