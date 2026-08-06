-- ============================================================
-- Security hardening — STREAMS_MASTER_PLAN.md §K1/§K3/§K5/§K6 (Phase 13)
--
-- §K3 addendum: while wiring up the songs grants below, found that
-- 20260805_harden_play_counting.sql's REVOKE UPDATE (plays) never actually
-- took effect (a standing table-wide grant from an earlier migration made
-- the column-level revoke a no-op) — verified live, then fixed for real in
-- the dedicated block near the bottom of this file.
--
-- Ground truth (live pen-test against the anon key, see
-- scripts/security_pentest_anon_writes.mjs and the Phase 13 PR description):
-- artists, albums, songs, playlists, playlist_songs and song_artists were
-- all writable by anyone holding the anon key shipped in the browser bundle
-- — no login required. Root cause is layered:
--   1. `anon` was directly GRANTed INSERT/UPDATE/DELETE on these tables by
--      several historical migrations (each fixing a "why doesn't this
--      work" bug by making the table fully open instead of authenticating
--      the request).
--   2. Every RLS policy on these tables' write commands is `USING (true)` /
--      `WITH CHECK (true)` — permissive, not ownership-scoped.
--   3. user_song_likes / user_playlist_likes have the same `USING (true)`
--      problem for a different reason: the tables store Clerk TEXT ids, but
--      Supabase's `auth.uid()` never resolves for Clerk-authenticated
--      requests, so an earlier fix for "likes are broken" replaced a
--      permanently-failing `auth.uid() = user_id` check with `true` instead
--      of the correct `jwt.claims->>'sub' = user_id` check (§K5).
--
-- This migration cannot land until every write call site sends a Clerk
-- Supabase-JWT (via useAuthedSupabase / createAuthenticatedSupabaseClient)
-- instead of the anon-key client — otherwise every creator/admin write
-- breaks at the same time RLS starts enforcing ownership. That client-side
-- migration was done first, across every creator and admin write path, in
-- the same PR as this file. See the PR description for the manual QA
-- checklist to run against a staging Clerk session before this is applied
-- to production.
--
-- Scope: artists, albums, songs, playlists, playlist_songs, song_artists,
-- podcasts, podcast_episodes, movies, user_song_likes, user_playlist_likes,
-- plus user_artist_follows (same bug, no client writes it today — free fix).
--
-- Explicitly deferred (same USING(true) bug, but nothing migrated their
-- client write paths to the authenticated client yet, so hardening them now
-- would silently break Library/watch-progress features):
--   user_album_saves, movie_watch_progress, podcast_listen_history,
--   podcast_subscriptions, movie_watchlist.
-- Also out of scope: ebooks (not named in §K), the gamification/missions
-- tables (separate system, separately flagged as needing a coins-integrity
-- pass before coins carry real cash value), and folding the ~40 files under
-- database/migrations/ into supabase/migrations/ (§K4) — this repo's Streams
-- work only touches the Streams-relevant subset of those, which is already
-- superseded by the schema below.
-- ============================================================

-- ---------- Helpers ----------
-- Clerk issues the Supabase-compatible JWT; PostgREST exposes its claims via
-- `request.jwt.claims`. This is the same extraction every working owner-
-- scoped policy in this codebase already uses (e.g. 20260415_artist_picks.sql,
-- 20260415_collaborative_playlists.sql) — pulled into a helper here purely to
-- avoid retyping and mistyping it across ~20 policies below.
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

-- ---------- Drop every existing policy on the tables we're hardening ----------
-- Blanket wipe rather than naming each historical policy: this codebase has
-- ~10 migrations that each added/renamed policies on these same tables, and
-- Postgres OR's every matching policy together — missing even one old
-- `USING (true)` policy would leave the table just as open as before.
DO $$
DECLARE
    t TEXT;
    pol RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'artists', 'albums', 'songs', 'playlists', 'playlist_songs', 'song_artists',
        'podcasts', 'podcast_episodes', 'movies',
        'user_song_likes', 'user_playlist_likes', 'user_artist_follows'
    ] LOOP
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- ---------- artists ----------
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artists_public_read" ON public.artists FOR SELECT USING (true);

CREATE POLICY "artists_owner_or_admin_insert" ON public.artists FOR INSERT
    WITH CHECK (user_id = public.clerk_user_id() OR public.is_active_admin());

CREATE POLICY "artists_owner_or_admin_update" ON public.artists FOR UPDATE
    USING (user_id = public.clerk_user_id() OR public.is_active_admin())
    WITH CHECK (user_id = public.clerk_user_id() OR public.is_active_admin());

CREATE POLICY "artists_owner_or_admin_delete" ON public.artists FOR DELETE
    USING (user_id = public.clerk_user_id() OR public.is_active_admin());

-- Bonus finding while wiring this up: RLS ownership only gates *whether* a
-- row can be updated, not *which columns* — an artist's own owner-scoped
-- UPDATE could otherwise flip their own is_verified to true, bypassing the
-- audited verification_admin_review flow entirely. AdminArtists.tsx already
-- excludes is_verified from its own update payload for the same reason —
-- this closes the same hole at the database level so it can't be done via a
-- raw REST call either.
CREATE OR REPLACE FUNCTION public.protect_artist_verification()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NOT public.is_active_admin() THEN
        NEW.is_verified := OLD.is_verified;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_artist_verification_trigger ON public.artists;
CREATE TRIGGER protect_artist_verification_trigger
    BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION public.protect_artist_verification();

-- ---------- albums ----------
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "albums_public_read" ON public.albums FOR SELECT USING (true);

CREATE POLICY "albums_owner_or_admin_insert" ON public.albums FOR INSERT
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    );

CREATE POLICY "albums_owner_or_admin_update" ON public.albums FOR UPDATE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    )
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    );

CREATE POLICY "albums_owner_or_admin_delete" ON public.albums FOR DELETE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    );

-- ---------- songs ----------
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "songs_public_read" ON public.songs FOR SELECT USING (true);

CREATE POLICY "songs_owner_or_admin_insert" ON public.songs FOR INSERT
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    );

CREATE POLICY "songs_owner_or_admin_update" ON public.songs FOR UPDATE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    )
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    );

CREATE POLICY "songs_owner_or_admin_delete" ON public.songs FOR DELETE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = public.clerk_user_id())
    );

-- Same class of bug as artists.is_verified: featured_badge ('platform_pick' /
-- 'editors_choice') is only ever set by AdminSongs.tsx's promote button, but
-- an owner's own owner-scoped UPDATE could otherwise self-award it.
CREATE OR REPLACE FUNCTION public.protect_song_featured_badge()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NEW.featured_badge IS DISTINCT FROM OLD.featured_badge AND NOT public.is_active_admin() THEN
        NEW.featured_badge := OLD.featured_badge;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_song_featured_badge_trigger ON public.songs;
CREATE TRIGGER protect_song_featured_badge_trigger
    BEFORE UPDATE ON public.songs
    FOR EACH ROW EXECUTE FUNCTION public.protect_song_featured_badge();

-- ---------- song_artists (primary + featured credits) ----------
ALTER TABLE public.song_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "song_artists_public_read" ON public.song_artists FOR SELECT USING (true);

CREATE POLICY "song_artists_owner_or_admin_insert" ON public.song_artists FOR INSERT
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (
            SELECT 1 FROM public.songs s JOIN public.artists a ON a.id = s.artist_id
            WHERE s.id = song_id AND a.user_id = public.clerk_user_id()
        )
    );

CREATE POLICY "song_artists_owner_or_admin_update" ON public.song_artists FOR UPDATE
    USING (
        public.is_active_admin()
        OR EXISTS (
            SELECT 1 FROM public.songs s JOIN public.artists a ON a.id = s.artist_id
            WHERE s.id = song_id AND a.user_id = public.clerk_user_id()
        )
    )
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (
            SELECT 1 FROM public.songs s JOIN public.artists a ON a.id = s.artist_id
            WHERE s.id = song_id AND a.user_id = public.clerk_user_id()
        )
    );

CREATE POLICY "song_artists_owner_or_admin_delete" ON public.song_artists FOR DELETE
    USING (
        public.is_active_admin()
        OR EXISTS (
            SELECT 1 FROM public.songs s JOIN public.artists a ON a.id = s.artist_id
            WHERE s.id = song_id AND a.user_id = public.clerk_user_id()
        )
    );

-- ---------- playlists ----------
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists_public_read" ON public.playlists FOR SELECT USING (true);

CREATE POLICY "playlists_owner_or_admin_insert" ON public.playlists FOR INSERT
    WITH CHECK (created_by = public.clerk_user_id() OR public.is_active_admin());

CREATE POLICY "playlists_owner_or_admin_update" ON public.playlists FOR UPDATE
    USING (created_by = public.clerk_user_id() OR public.is_active_admin())
    WITH CHECK (created_by = public.clerk_user_id() OR public.is_active_admin());

CREATE POLICY "playlists_owner_or_admin_delete" ON public.playlists FOR DELETE
    USING (created_by = public.clerk_user_id() OR public.is_active_admin());

-- ---------- playlist_songs ----------
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlist_songs_public_read" ON public.playlist_songs FOR SELECT USING (true);

CREATE POLICY "playlist_songs_owner_or_admin_insert" ON public.playlist_songs FOR INSERT
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND created_by = public.clerk_user_id())
    );

-- Re-added verbatim from 20260415_collaborative_playlists.sql — collaborators
-- on a collaborative playlist can add songs without owning the playlist. The
-- blanket policy wipe above would otherwise silently drop this capability.
CREATE POLICY "collab_add_songs" ON public.playlist_songs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_id
            AND p.is_collaborative = true
            AND (
                p.created_by = public.clerk_user_id()
                OR EXISTS (
                    SELECT 1 FROM public.playlist_collaborators pc
                    WHERE pc.playlist_id = p.id AND pc.user_id = public.clerk_user_id()
                )
            )
        )
    );

CREATE POLICY "playlist_songs_owner_or_admin_delete" ON public.playlist_songs FOR DELETE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND created_by = public.clerk_user_id())
    );

-- ---------- podcasts ----------
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "podcasts_public_read" ON public.podcasts FOR SELECT USING (true);

CREATE POLICY "podcasts_owner_or_admin_insert" ON public.podcasts FOR INSERT
    WITH CHECK (uploaded_by = public.clerk_user_id() OR public.is_active_admin());

CREATE POLICY "podcasts_owner_or_admin_update" ON public.podcasts FOR UPDATE
    USING (uploaded_by = public.clerk_user_id() OR public.is_active_admin())
    WITH CHECK (uploaded_by = public.clerk_user_id() OR public.is_active_admin());

CREATE POLICY "podcasts_owner_or_admin_delete" ON public.podcasts FOR DELETE
    USING (uploaded_by = public.clerk_user_id() OR public.is_active_admin());

-- ---------- podcast_episodes ----------
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "podcast_episodes_public_read" ON public.podcast_episodes FOR SELECT USING (true);

CREATE POLICY "podcast_episodes_owner_or_admin_insert" ON public.podcast_episodes FOR INSERT
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND uploaded_by = public.clerk_user_id())
    );

CREATE POLICY "podcast_episodes_owner_or_admin_update" ON public.podcast_episodes FOR UPDATE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND uploaded_by = public.clerk_user_id())
    )
    WITH CHECK (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND uploaded_by = public.clerk_user_id())
    );

CREATE POLICY "podcast_episodes_owner_or_admin_delete" ON public.podcast_episodes FOR DELETE
    USING (
        public.is_active_admin()
        OR EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND uploaded_by = public.clerk_user_id())
    );

-- ---------- movies (admin-only catalog, no creator self-serve) ----------
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movies_public_read" ON public.movies FOR SELECT USING (true);
CREATE POLICY "movies_admin_insert" ON public.movies FOR INSERT WITH CHECK (public.is_active_admin());
CREATE POLICY "movies_admin_update" ON public.movies FOR UPDATE USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "movies_admin_delete" ON public.movies FOR DELETE USING (public.is_active_admin());

-- ---------- user_song_likes / user_playlist_likes (§K5) ----------
-- The Clerk-vs-auth.uid() bug: these were `USING (true)` because
-- `auth.uid() = user_id` can never match a Clerk TEXT id, so any
-- authenticated request could like/unlike on behalf of *any* user_id, not
-- just their own. Fixed by checking the Clerk sub directly, like every
-- other owner-scoped policy in this migration.
ALTER TABLE public.user_song_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_song_likes_public_read" ON public.user_song_likes FOR SELECT USING (true);
CREATE POLICY "user_song_likes_own_insert" ON public.user_song_likes FOR INSERT WITH CHECK (user_id = public.clerk_user_id());
CREATE POLICY "user_song_likes_own_delete" ON public.user_song_likes FOR DELETE USING (user_id = public.clerk_user_id());

ALTER TABLE public.user_playlist_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_playlist_likes_public_read" ON public.user_playlist_likes FOR SELECT USING (true);
CREATE POLICY "user_playlist_likes_own_insert" ON public.user_playlist_likes FOR INSERT WITH CHECK (user_id = public.clerk_user_id());
CREATE POLICY "user_playlist_likes_own_delete" ON public.user_playlist_likes FOR DELETE USING (user_id = public.clerk_user_id());

-- Same bug, no client writes this table today (follow-artist isn't wired up
-- yet) — hardening it now costs nothing and closes it before it's used.
ALTER TABLE public.user_artist_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_artist_follows_public_read" ON public.user_artist_follows FOR SELECT USING (true);
CREATE POLICY "user_artist_follows_own_insert" ON public.user_artist_follows FOR INSERT WITH CHECK (user_id = public.clerk_user_id());
CREATE POLICY "user_artist_follows_own_delete" ON public.user_artist_follows FOR DELETE USING (user_id = public.clerk_user_id());

-- ---------- Grants: close the anon table-level hole, not just RLS ----------
-- RLS alone would already block anon (it has no JWT sub, so every owner
-- check above evaluates to false/NULL) — this is defense in depth so the
-- anon key can't attempt writes on these tables at all, matching the
-- pen-test's original ask of "close it at the grant layer too".
REVOKE INSERT, UPDATE, DELETE ON
    public.artists, public.albums, public.songs,
    public.playlists, public.playlist_songs, public.song_artists,
    public.podcasts, public.podcast_episodes, public.movies,
    public.user_song_likes, public.user_playlist_likes, public.user_artist_follows
FROM anon;

-- `songs` is deliberately excluded from the blanket grant below — see the
-- dedicated block further down for why (§K3 / songs.plays).
GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.artists, public.albums,
    public.playlists, public.playlist_songs, public.song_artists,
    public.podcasts, public.podcast_episodes, public.movies,
    public.user_song_likes, public.user_playlist_likes, public.user_artist_follows
TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.songs TO authenticated;

-- ---------- §K3 follow-up: songs.plays was still directly writable ----------
-- 20260805_harden_play_counting.sql did `REVOKE UPDATE (plays) ON songs FROM
-- anon, authenticated`, believing that closed direct writes to the play
-- counter. It didn't: 20260619_streams_songs_write_rls.sql had already
-- GRANTed table-wide UPDATE on songs to anon/authenticated, and Postgres
-- documents that a column-level REVOKE can never narrow a standing
-- table-wide grant — the table-wide grant alone satisfies the privilege
-- check for every column, `plays` included. Verified live before writing
-- this: an anon PostgREST call could still set an arbitrary songs.plays
-- value. The only real fix is revoking the table-wide UPDATE outright and
-- re-granting UPDATE on an explicit column list that excludes `plays`.
--
-- IMPORTANT: when a future migration adds a new songs column that should be
-- directly writable by owners/admins (not just via a SECURITY DEFINER RPC
-- like record_play), add it to this list — anything left out here will
-- silently fail to update for authenticated clients, the same way `plays`
-- now silently fails on purpose.
-- (Practical example of "add it to this list": 20260806_songs_boost_columns.sql
-- adds is_premium/boosted_until and grants UPDATE on just those two columns
-- in its own file, rather than editing the list below — avoids a fragile
-- same-day apply-order dependency, since that migration must run whether
-- this file has already applied or not.)
REVOKE UPDATE ON public.songs FROM anon, authenticated;
GRANT UPDATE (
    album_id, artist_id, cover_url, description, duration, featured_badge,
    file_url, genre, is_explicit, lyrics, price, producer, release_date,
    rights_accepted_at, songwriter, status, title, track_number,
    upload_type, uploaded_by
) ON public.songs TO authenticated;
