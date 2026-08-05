# Streams Migrations Tracking

Every `supabase/migrations/*.sql` file added by a Streams phase PR (see `STREAMS_MASTER_PLAN.md`) is logged here as it's added. None of these are applied automatically — per standing project convention, migrations are listed for review and applied separately, never via `supabase db push`. A dedicated later phase will review this list, resolve any ordering/overlap issues, and apply everything in one pass rather than one-off per phase.

**Process:** whenever a phase branch adds a migration file, add a row below in the same commit.

| # | Phase | File | Purpose | Applied? |
|---|-------|------|---------|----------|
| 1 | 4 | `20260805_harden_play_counting.sql` | Replaces `increment_play_count` with `record_play(song_id, device_id)` — a SECURITY DEFINER RPC that verifies caller identity from the Clerk JWT, dedupes plays per (actor, song) within 60s, and revokes the direct `songs.plays` UPDATE / `play_history` INSERT grants anon and authenticated clients previously had. | No |
| 2 | 6 | `20260805_content_moderation.sql` | Adds `content_reports` (locked down like `verification_requests` — no direct grants, RPC-only) + `content_report_submit`/`content_reports_admin_list`/`content_report_review` RPCs. Powers the in-app Report action, the public DMCA form, and the admin moderation queue. Takedown (unpublish via `songs.status`) only works for `entity_type='song'` — depends on Phase 5's `songs.status` column (`20260804_songs_draft_publish_state.sql`). | No |

## Notes for the eventual "apply all" pass

- Apply in the order listed above (filename date order already matches dependency order across phases).
- `20260805_harden_play_counting.sql` depends on `songs` and `play_history` already existing (they do, from earlier migrations) — no new dependency risk.
- `20260805_content_moderation.sql` **must apply after** Phase 5's `20260804_songs_draft_publish_state.sql` — its takedown path does `UPDATE songs SET status = 'draft'`, which needs that column to exist first. Filename order already puts it after (804 < 805), but double check if phases land out of order.
- Re-check this file at the start of every new phase for anything added since the last apply pass.
