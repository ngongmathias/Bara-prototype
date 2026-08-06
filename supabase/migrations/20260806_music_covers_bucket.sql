-- ============================================================
-- Fix: AdminAlbums.tsx has always uploaded album covers to a `music-covers`
-- bucket that no migration ever created — every admin album cover upload
-- has been failing silently (confirmed live via storage.listBuckets(), no
-- bucket named `music-covers` exists). Found during Phase 14 launch QA.
--
-- Admin-only bucket: only AdminAlbums.tsx writes here (creator-facing album
-- cover uploads go through the `music` bucket instead) — no owner-scoped
-- path convention to match, so this is admin-write / public-read, same
-- shape as the `movies`/`podcasts` buckets before Phase 13's owner-scoping
-- (there's no owner to scope to here).
-- ============================================================

-- Depends on public.is_active_admin() from 20260806_security_hardening.sql —
-- redefined here too (idempotent, identical body) so this file has no
-- cross-migration ordering dependency, same reasoning as
-- 20260806_music_bucket_hardening.sql. Must come before the policies below
-- that reference it — CREATE POLICY resolves the function at creation time.
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND is_active = true
    )
$$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'music-covers',
    'music-covers',
    true,
    5242880, -- 5MB, cover art only
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "music_covers_public_read" ON storage.objects;
CREATE POLICY "music_covers_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'music-covers');

DROP POLICY IF EXISTS "music_covers_admin_insert" ON storage.objects;
CREATE POLICY "music_covers_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music-covers' AND public.is_active_admin());

DROP POLICY IF EXISTS "music_covers_admin_update" ON storage.objects;
CREATE POLICY "music_covers_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'music-covers' AND public.is_active_admin());

DROP POLICY IF EXISTS "music_covers_admin_delete" ON storage.objects;
CREATE POLICY "music_covers_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'music-covers' AND public.is_active_admin());
