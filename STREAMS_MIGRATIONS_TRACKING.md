# Streams Migrations Tracking

Every `supabase/migrations/*.sql` file added by a Streams phase PR (see `STREAMS_MASTER_PLAN.md`) is logged here as it's added. None of these are applied automatically — per standing project convention, migrations are listed for review and applied separately, never via `supabase db push`. A dedicated later phase will review this list, resolve any ordering/overlap issues, and apply everything in one pass rather than one-off per phase.

**Process:** whenever a phase branch adds a migration file, add a row below in the same commit.

| # | Phase | File | Purpose | Applied? |
|---|-------|------|---------|----------|
| 1 | 4 | `20260805_harden_play_counting.sql` | Replaces `increment_play_count` with `record_play(song_id, device_id)` — a SECURITY DEFINER RPC that verifies caller identity from the Clerk JWT, dedupes plays per (actor, song) within 60s, and revokes the direct `songs.plays` UPDATE / `play_history` INSERT grants anon and authenticated clients previously had. | No |
| 2 | 5 | `20260804_consolidate_song_artists_junction.sql` | Brings `song_artists` (+ `movies.producers/writers/actors`, `songs.producer/songwriter`) into tracked migration history. Previously only existed as a hand-run script at `database/migrations/add_movie_crew_song_credits.sql` (now deleted) — fully idempotent, safe no-op wherever already applied by hand. | No |
| 3 | 5 | `20260804_songs_draft_publish_state.sql` | Adds `songs.status` ('draft'\|'published', default 'published') and `songs.release_date` (nullable) so artists can save drafts and schedule releases. Purely additive with a backward-compatible default — existing songs are unaffected. Enforcement of "hide drafts/future-dated songs from the public" is done client-side (`src/lib/publishFilter.ts`), not via RLS. | No |
| 4 | 5 | `20260804_artist_claim_flow.sql` | Adds a UNIQUE constraint on `artists.user_id` (multiple NULLs still allowed) + `artist_claims` table + `artist_claim_review` RPC, so admin-seeded artists can be claimed via a verification-style request instead of having no path to an owner at all. **Will fail to apply if any duplicate non-null `artists.user_id` rows already exist** — check for that first (see note below). | No |
| 5 | 6 | `20260805_content_moderation.sql` | Adds `content_reports` (locked down like `verification_requests` — no direct grants, RPC-only) + `content_report_submit`/`content_reports_admin_list`/`content_report_review` RPCs. Powers the in-app Report action, the public DMCA form, and the admin moderation queue. Takedown (unpublish via `songs.status`) only works for `entity_type='song'` — depends on Phase 5's `songs.status` column (`20260804_songs_draft_publish_state.sql`). | No |

## Notes for the eventual "apply all" pass

- Apply in the order listed above (filename date order already matches dependency order across phases).
- `20260805_harden_play_counting.sql` depends on `songs` and `play_history` already existing (they do, from earlier migrations) — no new dependency risk.
- `20260804_consolidate_song_artists_junction.sql` is almost certainly already applied on the live DB by hand (the table is in active use across the app) — running it is still safe (idempotent guards throughout) but double check `song_artists` row counts before/after to confirm nothing double-applies unexpectedly.
- `20260804_songs_draft_publish_state.sql`: purely additive columns, safe to apply any time. Note the two same-day Phase 5 files (`_consolidate_song_artists_junction` and `_songs_draft_publish_state`) are independent of each other and can apply in either order.
- `20260804_artist_claim_flow.sql`: **before applying**, run `SELECT user_id, COUNT(*) FROM artists WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) > 1;` — if that returns any rows, the `ADD CONSTRAINT artists_user_id_unique UNIQUE (user_id)` statement will fail and those duplicates need manual resolution (merge or null out the extras) before this migration can land.
- `20260805_content_moderation.sql` **must apply after** Phase 5's `20260804_songs_draft_publish_state.sql` — its takedown path does `UPDATE songs SET status = 'draft'`, which needs that column to exist first. Filename order already puts it after (804 < 805), but double check if phases land out of order.
- Re-check this file at the start of every new phase for anything added since the last apply pass.
