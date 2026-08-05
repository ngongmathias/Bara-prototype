# Streams Migrations Tracking

Every `supabase/migrations/*.sql` file added by a Streams phase PR (see `STREAMS_MASTER_PLAN.md`) is logged here as it's added. None of these are applied automatically — per standing project convention, migrations are listed for review and applied separately, never via `supabase db push`. A dedicated later phase will review this list, resolve any ordering/overlap issues, and apply everything in one pass rather than one-off per phase.

**Process:** whenever a phase branch adds a migration file, add a row below in the same commit.

| # | Phase | File | Purpose | Applied? |
|---|-------|------|---------|----------|
| 1 | 4 | `20260805_harden_play_counting.sql` | Replaces `increment_play_count` with `record_play(song_id, device_id)` — a SECURITY DEFINER RPC that verifies caller identity from the Clerk JWT, dedupes plays per (actor, song) within 60s, and revokes the direct `songs.plays` UPDATE / `play_history` INSERT grants anon and authenticated clients previously had. | No |

## Notes for the eventual "apply all" pass

- Apply in the order listed above (filename date order already matches dependency order across phases).
- `20260805_harden_play_counting.sql` depends on `songs` and `play_history` already existing (they do, from earlier migrations) — no new dependency risk.
- Re-check this file at the start of every new phase for anything added since the last apply pass.
