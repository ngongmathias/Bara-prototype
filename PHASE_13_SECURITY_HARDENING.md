# Phase 13 — Security Hardening (§K)

Pre-launch security gate for Streams. Nothing here is applied to production yet — this
documents what was found, what changed, and the manual QA to run in a real signed-in
Clerk session before anyone runs the two new migrations against production.

## 1. What the live pen-test found (before this PR)

`scripts/security_pentest_anon_writes.mjs` attempts real INSERT/UPDATE/DELETE against
production tables and the `music` storage bucket using only the **anon key** — the same
key that ships in the browser bundle, available to anyone without signing in. Every
successful write is cleaned up immediately (via the anon client, then a service-role
safety net regardless of whether that worked).

Result, run immediately before this PR's migrations were written:

| Table / bucket | Insert | Update | Delete |
|---|---|---|---|
| `artists` | ALLOWED | ALLOWED | blocked (unrelated FK, not RLS) |
| `albums` | ALLOWED | ALLOWED | ALLOWED |
| `songs` | ALLOWED | ALLOWED | ALLOWED |
| `playlists` | ALLOWED | ALLOWED | ALLOWED |
| `song_artists` | ALLOWED | ALLOWED | ALLOWED |
| `podcasts` | blocked (42501) | n/a | n/a |
| `movies` | blocked (42501) | n/a | n/a |
| `music` bucket | ALLOWED (upload) | — | ALLOWED (delete) |

In plain terms: anyone with the public anon key — no login, no account — could create,
edit, or delete any artist, album, song, playlist, or song credit, and upload or delete
files in the `music` bucket. `podcasts`/`movies` were already not directly anon-writable
(no anon-level grant existed for them), so they were not exposed the same way, but their
RLS policies were still fully permissive for *authenticated* writes (any signed-in user
could edit/delete any podcast or movie, not just their own) — same underlying bug class.

A separate, unrelated-looking bug in `user_song_likes`/`user_playlist_likes` was also
present: their RLS checked `auth.uid() = user_id`, but Clerk-issued sessions never
populate Supabase's `auth.uid()`, so an earlier fix for "likes are broken" replaced the
permanently-failing check with `USING (true)` instead of the correct one — meaning any
authenticated request could like/unlike songs or playlists *as any other user*, not just
themselves.

A third, independently-discovered issue while wiring up `songs`' grants: a 2026-08-05
migration (`20260805_harden_play_counting.sql`) believed it had revoked direct
`UPDATE` access to `songs.plays` for anon/authenticated. It hadn't — a standing
table-wide `UPDATE` grant from an earlier migration made that column-specific revoke a
no-op (Postgres: a table-wide grant can't be narrowed by revoking a specific column
afterward). Verified live: an anon PostgREST call could still overwrite any song's play
count directly. See §3.

## 2. What changed

**Client-side (already merged in this PR, safe on its own):** every creator- and
admin-facing write path that touches `artists`/`albums`/`songs`/`playlists`/
`playlist_songs`/`song_artists`/`podcasts`/`podcast_episodes`/`movies` now sends a
Clerk-issued Supabase JWT (via the new `useAuthedSupabase()` hook, or the existing
`getToken`/`createAuthenticatedSupabaseClient` pattern) instead of the anon-key client.
This alone changes nothing about what's *allowed* — it's the prerequisite for the
database changes below to not break the app the moment they land.

**Database (two new migrations, not yet applied — see `STREAMS_MIGRATIONS_TRACKING.md`
rows 10–11):**

- `20260806_security_hardening.sql` — replaces every permissive `USING (true)` /
  `WITH CHECK (true)` write policy on the tables above with an **owner-or-active-admin**
  check (ownership traced through `artists.user_id` → `songs.artist_id`/`albums.artist_id`,
  `playlists.created_by`, `podcasts.uploaded_by`). Fixes the `user_song_likes`/
  `user_playlist_likes` Clerk-id bug (plus `user_artist_follows`, same bug, currently
  unused). Adds admin-only policies to `movies`. Adds two triggers so an owner's own
  legitimate UPDATE can't be used to self-grant `artists.is_verified` or
  `songs.featured_badge` — both are admin-only in intent but weren't enforced at the
  column level before. Revokes the anon write grants outright (defense in depth beyond
  RLS). Also fixes the `songs.plays` grant gap for real, by revoking table-wide UPDATE
  and re-granting it on an explicit column list that excludes `plays`.
- `20260806_music_bucket_hardening.sql` — the `music` storage bucket's write policies
  go from "any signed-in user, any path" to owner-or-admin, matched against the path
  convention every upload already uses (`<folder>/<own-clerk-user-id>/...`).

**Explicitly not touched in this PR** (same bug class, but nothing migrated their client
write paths to the authenticated client yet — hardening the RLS now would silently break
those features): `user_album_saves`, `movie_watch_progress`, `podcast_listen_history`,
`podcast_subscriptions`, `movie_watchlist`. Flagging these as the next thing to do once
their client call sites are migrated the same way this PR migrated Streams' core tables.
Also not touched: `ebooks` (not named in §K), gamification/missions tables (separate
system, separately flagged elsewhere as needing a coins-integrity pass), and folding the
~40 files under `database/migrations/` into `supabase/migrations/` (§K4) — out of scope
for a Streams-focused pass.

## 3. Manual QA checklist — run before applying either migration to production

The dev environment this PR was written in can't complete a real Clerk sign-in, so none
of this was tested against a live authenticated session. Run through this in staging (or
production with a throwaway/test account) with a **real signed-in Clerk session** before
applying `20260806_security_hardening.sql` / `20260806_music_bucket_hardening.sql`:

**As a regular signed-in user (not admin):**
1. Upload a new song (with cover art) via Upload Music — should succeed, appear in "My
   Music", and the cover/audio should play back.
2. Create an album, add one of your own tracks to it via Edit Album — should succeed.
3. Edit your artist profile (bio, photo) — should succeed; confirm you **cannot** flip
   your own verified badge (there shouldn't even be a control for it in the UI, but if
   you inspect network requests, a raw `PATCH .../artists?id=eq.<yours>` with
   `is_verified: true` should silently not change the value).
4. Create a playlist, add songs to it (via the "+" button and via the song context menu's
   "Add to playlist"), like/unlike a song, like/unlike a playlist, delete the playlist —
   all should succeed.
5. Create a podcast show and add an episode — should succeed.
6. Attempt to edit or delete **someone else's** song/album/artist/playlist by guessing an
   id in a direct REST call (or via browser devtools) — should now fail where it
   previously would have silently succeeded.

**As an admin:**
7. In Admin → Songs/Albums/Artists/Podcasts/Movies: create, edit, and delete an item you
   don't personally own — all should still succeed (admin bypass).
8. Toggle a song's featured badge (Promote button) and an artist's verified status via the
   verification queue — both should still work for admins specifically.
9. Run a bulk action (bulk genre/badge/takedown/delete on Admin → Songs) — should still
   succeed.

**Anon (signed out) — should now fail everywhere it previously succeeded:**
10. Re-run `node scripts/security_pentest_anon_writes.mjs` (needs `VITE_SUPABASE_URL`,
    `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_SERVICE_ROLE_KEY` in the environment) against
    the target database. Every row should now read `BLOCKED` for insert/update/delete,
    and the `music` bucket row should read `BLOCKED` for upload/delete.

**Play count integrity:**
11. Play a song as a signed-out visitor and as a signed-in user — the play count should
    still increment (via the existing `record_play` RPC, untouched by this PR).
12. Attempt a raw anon `PATCH` to `songs?id=eq.<any-song>` setting `plays` to an arbitrary
    number — should now fail (previously succeeded; see §1).

If anything in the regular-user or admin sections fails, do **not** proceed — it means a
write path was missed in the client-side migration and needs fixing before the RLS
migration can safely apply. If anything in the anon section still succeeds, the
migration didn't apply cleanly (check `pg_policies` for that table for a leftover
permissive policy — the migration is written as a full policy wipe followed by a
clean rebuild, so a partial apply is the most likely cause).

## 4. Reversibility

Both migrations are additive policy/grant changes with no data loss risk. If something
breaks in production after applying, the fastest rollback is re-running the relevant
`DROP POLICY` statements from this PR's migrations and re-creating the old permissive
`USING (true)` policies from git history (`20260303_fix_all_streams_and_missions.sql` /
`20260619_streams_songs_write_rls.sql` / `20260621_playlist_songs_anon_write.sql` /
`20260619_streams_music_bucket.sql`) as a stopgap while the real client-side issue is
found — but check server logs for which write path is failing first, since the client
migration in this same PR should make that unnecessary.
