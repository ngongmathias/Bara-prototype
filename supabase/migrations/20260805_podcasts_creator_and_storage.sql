-- ============================================================
-- Podcasts to parity — schema + storage (STREAMS_MASTER_PLAN.md §G)
--
-- podcasts/podcast_episodes/podcast_subscriptions/podcast_listen_history
-- already exist (20260319_sprint7_test_data.sql) but podcasts has no
-- ownership column at all — UserMyPodcasts.tsx has been querying a
-- nonexistent `uploaded_by` column since it was written (always 400s,
-- silently swallowed, so "My Podcasts" has been permanently empty).
-- Also creates the `podcasts` storage bucket, which nothing did before —
-- AdminPodcasts create UI had no file destination for audio uploads.
-- ============================================================

ALTER TABLE public.podcasts
  ADD COLUMN IF NOT EXISTS uploaded_by TEXT,
  ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_podcasts_uploaded_by ON public.podcasts(uploaded_by);

-- Every existing (pre-this-migration) row is seed/demo content — mark it so
-- the UI can badge it clearly instead of it being indistinguishable from a
-- real creator's show (STREAMS_MASTER_PLAN.md §G7 / §L8).
UPDATE public.podcasts SET is_seed = true WHERE uploaded_by IS NULL;

COMMENT ON COLUMN public.podcasts.uploaded_by IS 'Clerk user id of the creator who self-published this show; NULL for admin/seed-created shows';
COMMENT ON COLUMN public.podcasts.is_seed IS 'True for demo/seed content shown at launch so it can be badged or hidden later (§L8 seed-data controls)';

-- Episodes need the same ownership signal for the creator UI to know which
-- episodes belong to "my" shows without a join on every render.
ALTER TABLE public.podcast_episodes
  ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

CREATE INDEX IF NOT EXISTS idx_podcast_episodes_uploaded_by ON public.podcast_episodes(uploaded_by);

UPDATE public.podcast_episodes pe
   SET uploaded_by = p.uploaded_by
  FROM public.podcasts p
 WHERE pe.podcast_id = p.id AND pe.uploaded_by IS NULL AND p.uploaded_by IS NOT NULL;

-- =========================
-- Resume playback + play counting (§G2/§G3)
-- =========================
-- One row per (user, episode) so progress can be upserted on every save
-- instead of accumulating duplicate rows per listen session.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'podcast_listen_history_user_episode_key'
    ) THEN
        ALTER TABLE public.podcast_listen_history
            ADD CONSTRAINT podcast_listen_history_user_episode_key UNIQUE (user_id, episode_id);
    END IF;
END $$;

-- Mirrors the permissive posture of the rest of podcasts (RLS hardening is
-- deferred to Phase 13 per STREAMS_MASTER_PLAN.md §D2) — just needs an
-- atomic increment so concurrent listeners don't clobber each other's count.
CREATE OR REPLACE FUNCTION public.record_episode_play(p_episode_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.podcast_episodes SET play_count = play_count + 1 WHERE id = p_episode_id;
$$;

GRANT EXECUTE ON FUNCTION public.record_episode_play(UUID) TO anon, authenticated;

-- =========================
-- Storage bucket for podcast audio + cover art
-- =========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'podcasts',
    'podcasts',
    true,
    104857600, -- 100 MB per file (episodes run long)
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/m4a', 'audio/x-m4a'
    ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read podcasts bucket" ON storage.objects;
CREATE POLICY "Public read podcasts bucket"
    ON storage.objects FOR SELECT
    TO public USING (bucket_id = 'podcasts');

DROP POLICY IF EXISTS "Authenticated upload podcasts bucket" ON storage.objects;
CREATE POLICY "Authenticated upload podcasts bucket"
    ON storage.objects FOR INSERT
    TO authenticated WITH CHECK (bucket_id = 'podcasts');

DROP POLICY IF EXISTS "Authenticated update podcasts bucket" ON storage.objects;
CREATE POLICY "Authenticated update podcasts bucket"
    ON storage.objects FOR UPDATE
    TO authenticated USING (bucket_id = 'podcasts');

DROP POLICY IF EXISTS "Authenticated delete podcasts bucket" ON storage.objects;
CREATE POLICY "Authenticated delete podcasts bucket"
    ON storage.objects FOR DELETE
    TO authenticated USING (bucket_id = 'podcasts');
