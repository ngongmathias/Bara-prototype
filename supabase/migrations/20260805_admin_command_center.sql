-- ============================================================
-- Admin command center — seed flags + audit trail (STREAMS_MASTER_PLAN.md §L)
--
-- L8: podcasts already got is_seed in Phase 7 (20260805_podcasts_creator_
-- and_storage.sql). Movies/songs/artists/albums never did, even though
-- every one of them has demo content seeded by migration alongside real
-- user content, indistinguishable in the UI today. Backfilled by exact
-- UUID prefix — every seed row across this project uses a fixed, easily
-- identifiable prefix ('a1000000-' artists, 'b1000000-' albums,
-- 'c1000000-' songs, 'mv100000-' movies), so this can't false-positive
-- against real gen_random_uuid() rows.
-- L12: admin_activity_log already exists (20241211_create_admin_users_
-- secure.sql) but its only INSERT policy is `TO service_role` — no admin
-- action taken from the client (which authenticates as `authenticated`,
-- not service_role) could ever actually write to it. `log_admin_action`
-- closes that gap the same way every other sensitive write in this app
-- does: a SECURITY DEFINER RPC that verifies the caller itself rather
-- than trusting a client-supplied admin_user_id.
-- ============================================================

ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT false;

UPDATE public.movies SET is_seed = true WHERE id::text LIKE 'mv100000-%' AND is_seed = false;
UPDATE public.artists SET is_seed = true WHERE id::text LIKE 'a1000000-%' AND is_seed = false;
UPDATE public.albums SET is_seed = true WHERE id::text LIKE 'b1000000-%' AND is_seed = false;
UPDATE public.songs SET is_seed = true WHERE id::text LIKE 'c1000000-%' AND is_seed = false;

CREATE INDEX IF NOT EXISTS idx_movies_is_seed ON public.movies(is_seed) WHERE is_seed = true;
CREATE INDEX IF NOT EXISTS idx_songs_is_seed ON public.songs(is_seed) WHERE is_seed = true;
CREATE INDEX IF NOT EXISTS idx_artists_is_seed ON public.artists(is_seed) WHERE is_seed = true;
CREATE INDEX IF NOT EXISTS idx_albums_is_seed ON public.albums(is_seed) WHERE is_seed = true;

-- =========================
-- Admin action audit trail (§L12)
-- =========================
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_target_user_id TEXT DEFAULT NULL,
    p_target_email TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id TEXT;
    v_admin RECORD;
BEGIN
    v_caller_id := current_setting('request.jwt.claims', true)::json->>'sub';
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT user_id, email INTO v_admin
    FROM public.admin_users
    WHERE user_id = v_caller_id AND is_active = true;

    IF v_admin IS NULL THEN
        RAISE EXCEPTION 'Not an active admin';
    END IF;

    INSERT INTO public.admin_activity_log (admin_user_id, admin_email, action, target_user_id, target_email, details)
    VALUES (v_admin.user_id, v_admin.email, p_action, p_target_user_id, p_target_email, p_details);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, TEXT, JSONB) TO authenticated;
