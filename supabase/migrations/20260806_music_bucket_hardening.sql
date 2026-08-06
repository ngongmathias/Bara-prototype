-- ============================================================
-- Music storage bucket hardening — STREAMS_MASTER_PLAN.md §K2 (Phase 13)
--
-- 20260619_streams_music_bucket.sql created the `music` bucket with its own
-- "HARDENING FOLLOW-UP" comment admitting the write policies were wide open
-- (`TO anon, authenticated`, no path scoping) as a temporary measure until
-- the app's upload call sites moved to the authenticated Clerk-JWT client.
-- That migration is now done (same PR as this file) — this closes the loop.
--
-- Every legitimate write already puts the caller's own Clerk user id in the
-- path (`songs/<user_id>/...`, `covers/<user_id>/...`, `artists/<user_id>/...`
-- — see UploadSongPage/EditSongModal/EditAlbumModal/EditArtistProfileModal).
-- Admin writes use flat, unscoped paths (`tracks/<random>`, `covers/<random>`)
-- and are covered by the admin bypass instead of path matching.
--
-- Depends on public.clerk_user_id() / public.is_active_admin() from
-- 20260806_security_hardening.sql — redefined here too (idempotent,
-- identical body) so this file has no cross-migration ordering dependency
-- regardless of how the two same-day files sort.
-- ============================================================

CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = public.clerk_user_id() AND is_active = true
    )
$$;

DROP POLICY IF EXISTS "Authenticated users can upload music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete music" ON storage.objects;

CREATE POLICY "music_owner_or_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'music'
    AND (public.is_active_admin() OR (storage.foldername(name))[2] = public.clerk_user_id())
);

CREATE POLICY "music_owner_or_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'music'
    AND (public.is_active_admin() OR (storage.foldername(name))[2] = public.clerk_user_id())
);

CREATE POLICY "music_owner_or_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'music'
    AND (public.is_active_admin() OR (storage.foldername(name))[2] = public.clerk_user_id())
);

-- Public read is untouched (streaming/cover art must stay open) — no policy
-- change needed for SELECT, it was never part of the anon-write problem.
