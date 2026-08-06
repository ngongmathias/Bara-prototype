# BARA Streams — Master Completion Plan

**STATUS: All 14 phases shipped as PRs and all migrations applied to production
(2026-08-03 → 2026-08-06).** See §6 for the phase-by-phase PR list and §8 for what's
genuinely done vs. what still needs action — the migrations are applied, but the manual
QA checklist that should follow them (`PHASE_13_SECURITY_HARDENING.md` §3 /
`PHASE_14_LAUNCH_QA.md` §3) has not been run yet. Closed out 2026-08-06.

**Created:** 2026-08-03 (planning session) · **Revised:** 2026-08-03 (admin + signature-features + doc reconciliation) · **Closed out:** 2026-08-06
**Goal:** Take Streams from "wide skeleton" to a fully functional product where every user scenario is accounted for — Spotify-quality mechanics, adapted to Bara's context: free-first, self-managed by users and artists, deep shareable links into every corner of the platform, and payments deferred until DPO/MoMo approval (Phase 15 Flutterwave in `MASTER_PLAN.md`).

**How this doc relates to the others:**
- `MASTER_PLAN.md` — platform-wide single source of truth. This file is the **streams execution plan** it points to; platform rules there (black/white/grey only, mobile-first 375px, migrations are *listed for Mathias, never auto-applied*, use existing patterns `useToast`/`useShare`/shadcn) all apply to every phase below.
- `STREAMS_STANDARD.md` — the Spotify-grade **quality bar** for music (F1–F10, D1–D6) with its Tier 1–3 roadmap. This plan executes toward that bar and extends it to the other three verticals. Where this plan's audit contradicts a ✅ in the standard, this plan wins (discrepancies listed in §2b) — update the standard's statuses as phases land.
- `GAMIFICATION_GUIDE.md` — rewards reference (listening XP, missions touch the player).

---

## 1. Product Decisions (locked 2026-08-03)

These were decided explicitly and should not be re-litigated without a new decision:

| # | Decision | Call |
|---|----------|------|
| D1 | Scope | All four verticals: Music, Podcasts, Movies, Ebooks |
| D2 | Security hardening (RLS lockdown) | **Later phase, before public launch** — users are few and trusted now; visible completeness first. See §K / Phase 13. |
| D3 | What counts as a stream | **30 seconds of playback + dedupe** (max 1 count per user/device per song per short window). Anonymous plays count (free-first) but are rate-limited server-side. |
| D4 | Moderation model | **Post-publish + reports.** Instant publishing stays (self-managed spirit). Add: Report button on songs/albums/artists → admin queue, DMCA/copyright claim form, admin takedown with artist notification, **plus clearly published content guidelines** shown at upload time and linkable. |
| D5 | Movies playback | **Self-hosted video now** — real video player + Supabase storage for full films. |
| D6 | Podcast ingestion | **Self-serve episode upload** by creators (like music uploads). RSS import deliberately not chosen for now. |
| D7 | Ebook reading | **In-app PDF/EPUB reader with progress saving, free books first.** Paid books (coin prices already in schema) unlock when payments/coin security land. No raw downloads. |

Standing constraints (from earlier decisions, see memory/economy docs):
- Primary artist gets 100% of revenue; featured artists get display credit + "Featured On" only.
- Paid music stays behind `PAID_MUSIC_ENABLED = false` until coins are server-authoritative.
- Coins are currently client-mutable — nothing that grants real value may depend on them until fixed.

---

## 2. Current State (audited 2026-08-03)

Three deep code audits + live click-through on the dev build. Full details in section 4 (gap register).

| Vertical | Listener/consumer-ready | Creator-ready | Verdict |
|----------|------------------------|---------------|---------|
| **Music** | ~80% — playback, queue, search, likes, library, stats all real | ~70% — self-serve upload/albums/dashboard work | Strong skeleton; last-20% gaps: sharing/OG, persistence, broken nav links, fake-data fallbacks, play-count integrity |
| **Podcasts** | ~55% — browse works, playback is a throwaway `new Audio()` | ~5% — admin-create only; creator page queries a nonexistent column | No show/episode pages, no global-player integration, broken uploads |
| **Movies** | ~40% — beautiful browse/detail, **zero playback** | 0% — admin create/edit fails (schema mismatch), uploads target missing bucket | Core action is a dead button |
| **Ebooks** | ~50% — browse/detail solid, real storage bucket, **no reader** | ~30% — admin upload works end-to-end; no self-publish | "Read" is a dead button |

Cross-cutting themes found everywhere:
1. **Security/integrity:** catalog world-writable via anon key; plays gameable (§K / Phase 13, D2).
2. **Dead-end core actions:** watch/read/episode pages missing; several broken/inert buttons in music.
3. **Sharing half-built** despite being a Bara priority: OG previews exist ONLY for song/playlist/artist (via `middleware.ts` on Vercel — see §2b) — nothing for album/genre/podcast/movie/ebook; missing share buttons; shared songs open without queue.
4. **No persistence/resume:** player state dies on refresh; no listen/watch/read progress anywhere.
5. **Consistency debt:** 3 table-name mismatches, two migration folders, duplicate columns, mock sections, inconsistent login-gating UX.

### 2b. Corrections & discrepancies vs. earlier docs (verified 2026-08-03)

- **OG previews:** `STREAMS_STANDARD.md` F8 says "OG previews ✅" and the original audit said "none". Truth: **Vercel Edge Middleware (`middleware.ts`) already serves OG tags for `/streams/song/:id`, `/streams/playlist/:id`, `/streams/artist/:id` in production** (invisible on dev, which is why both got it wrong). Missing: album, genre, podcast show/episode, movie, ebook. §C1 = *extend* the existing middleware, not build new.
- **Radio:** `startRadio` genuinely exists and works (standard Tier 2 ✅), but the home page's "Popular radio" cards are hardcoded mocks that don't call it (`StreamsHome.tsx:663-687`) — wiring them is a quick win, not a build.
- **QueueDrawer contrast:** standard Part C claims fixed; the drawer is still light-on-dark inconsistent with the player surface (§B5).
- **`STREAMS_STANDARD.md` still-open items this plan absorbs:** gapless/crossfade/normalization (F1), offline/PWA (F5), weekly recap (F10), activity feed (F8 stretch), device-matrix + full keyboard sweep (D3/D5), claim/verify 🟡 (F9).

---

## 3. Scenario Matrix

Legend: ✅ works · 🟡 partial · ❌ missing/broken. This is the checklist "every little user scenario is accounted for" is measured against.

**Re-audited 2026-08-06 (Phase 14, launch QA)** against current code + 2 live DB checks (anon-key query, `storage.listBuckets()`) — the table below replaces the 2026-08-03 snapshot, which predated Phases 1–13. Guest rows were also spot-verified live against a local dev build (Clerk itself cannot initialize in that sandbox — production keys are domain-locked — so only signed-out flows could be click-tested; Listener/Creator/Admin rows are code-verified only, flagged below where that matters).

### Guest (not signed in)
| Scenario | Status | Notes |
|----------|--------|-------|
| Browse hub / music home / trending / genres / new releases | ✅ | Verified live — real queries throughout, empty-state fallbacks only trigger on genuinely zero rows |
| Play songs, build queue, full-screen player | ✅ | Verified live |
| Open a shared song/album/artist/playlist link | 🟡 | `SongPage.tsx` now builds a real queue on open (§B4 fixed). OG preview middleware covers song/album/artist/playlist/genre/podcast/movie — **ebook was missing, added this phase** |
| Search music | ✅ | Cross-vertical now (songs/podcasts/movies/ebooks in one search, §J1 done) — verified live. **Gap found:** no typo tolerance (`amapiano` finds results, `amapaino` returns none) — STREAMS_STANDARD F4 not fully met |
| Like / save / follow / playlist | 🟡 | No more silent no-ops — every gated action shows a prompt (verified live for song-like; rest code-verified). Two different UI patterns still coexist (dedicated nudge sheet vs. plain toast) — partially unified this phase (AlbumPage/PlaylistPage/SongContextMenu moved to the shared sheet), a few call sites may remain |
| Browse podcasts / movies / ebooks | ✅ | Verified live, real data. **Bug found + fixed this phase:** `MoviesPage.tsx` silently rendered hardcoded fake movies (fake ids, Unsplash images) whenever the real query was empty — indistinguishable from real content, clicking through 404'd. Now shows an honest "No movies yet" empty state instead |
| Play a podcast episode | ✅ | Unified into the main player (`kind: 'song'\|'episode'`) — survives navigation, no more overlap with music (§G2 fixed) |
| Watch a movie / read an ebook | ✅ | Verified live — both are real: `MovieWatchPage.tsx` (real `<video>`, resume, playback rate, fullscreen, trailer fallback), `EbookReaderPage.tsx` (real PDF.js + epub.js, both formats, resume) |
| Hit a bad URL (song/album/playlist id) | ✅ | Verified live — real "Playlist not found" state now, fake-data fallback is gone (§A2 fixed) |

### Listener (signed in — code-verified only, not live-tested)
| Scenario | Status | Notes |
|----------|--------|-------|
| Like songs, save albums, liked-songs page, library | ✅ | `user_follows` unified everywhere; playlist like persists to `user_playlist_likes` via the authenticated client, no longer local-only |
| Create playlists, add/remove songs, collaborative invites | ✅ | Shuffle/Like/More on the playlist page all have real handlers now (§A6 fixed) |
| Resume where I left off (refresh / return later) | ✅ | Queue/song/position/volume/shuffle persisted to `localStorage` and restored (§B1 fixed) — the guest pass observed a real "Jump back in" resume rail live |
| Listening stats | ✅ | Unchanged, still real |
| Follow artist → see their new releases | ✅ | Single `user_follows` table now — Library reads match writes |
| Subscribe to a podcast / resume an episode | ✅ | Real `podcast_subscriptions` CRUD + episode resume via `podcast_listen_history` (§G3/G4). Still writes via the anon-key client — explicitly deferred in Phase 13, not a new gap |
| Movie watchlist / ebook progress | ✅ | Real `movie_watchlist` CRUD (§H5) + ebook progress. Same anon-key-client caveat as above |
| Report a song/artist for copyright/abuse | ✅ | `ReportContentDialog` + `content_report_submit` RPC wired into Album/Artist/Playlist/song-menu (§F1-3 fixed) |

### Artist / Creator (code-verified only, not live-tested)
| Scenario | Status | Notes |
|----------|--------|-------|
| Become an artist (self-serve, first upload) | ✅ | Unchanged |
| Claim an existing (admin-seeded) artist profile | ✅ | `artist_claims` + `artist_claim_review` RPC (Phase 5) |
| Upload song with metadata, featured artists, lyrics | ✅ | Orphaned-file cleanup now present on partial-failure |
| Create/edit albums, order tracks | 🟡 | Real drag-reorder writes `track_number` (§E3 fixed) via the direct edit routes. **But:** the Creator Dashboard's own "My Songs" list can't show it — see bug below |
| Schedule a release / save a draft | ✅ | `status`/`release_date` wired end-to-end, enforced client-side (§E4) |
| Delete a song cleanly | ✅ | Shared `deleteSongStorageFiles` used by both creator and admin delete paths now (§E2 fixed) |
| See real stats (plays, listeners, followers) | ✅ | Followers via real `user_follows` count, no longer always-0 |
| Get verified | ✅ | Mock "$10/mo" page is gone; real verification flow only. Phase 13 also closed a dual-write gap — `is_verified` can now only change via an active admin |
| Publish a podcast / movie / ebook | 🟡 | Podcasts and ebooks: real self-serve. Movies: admin-only by design (D5) — not a gap |

**🔴 Bug found this phase (fixed):** `ArtistDashboard.tsx` selected `songs.is_premium`/`songs.boosted_until` — neither column existed on the live table (`42703`, confirmed via a direct anon-key query). Every artist's "My Songs" tab in the Creator Dashboard was rendering empty, and the Track Boost feature was dead, silently, since the error was swallowed into `data || []`. Fixed via `20260806_songs_boost_columns.sql` (adds the columns; not yet applied to production — see `STREAMS_MIGRATIONS_TRACKING.md`).

### Admin (code-verified only, not live-tested)
| Scenario | Status | Notes |
|----------|--------|-------|
| CRUD artists/songs/albums, verify artists, promo badges | ✅ | Phase 13's ownership triggers don't block the admin path (admin bypass checked first) |
| Add a movie | ✅ | `stream_url` column added (Phase 8) |
| Upload podcast covers / movie files / album covers | 🟡 | `podcasts`/`movies` buckets confirmed live. **Bug found + fixed this phase:** `music-covers` bucket never existed (confirmed via `storage.listBuckets()`) — every admin album-cover upload has been failing. Fixed via `20260806_music_covers_bucket.sql` (not yet applied to production) |
| Manage podcast episodes | ✅ | Full episode CRUD UI |
| Review content reports / DMCA claims | ✅ | `/admin/content-reports`, routed |
| Takedown with artist notification | ✅ | `content_report_review` RPC unpublishes rather than hard-deletes (Phase 6) |

---

## 4. Consolidated Gap Register

Ranked within each area. File references are as of audit date.

### A. Music — broken things (fix first, all small)
1. Context menu "Go to artist"/"Go to album" navigate to plural routes that don't exist → land on hub. `SongContextMenu.tsx:149,154` (routes are `artist/:id`, `album/:id` in `App.tsx`).
2. PlaylistPage renders hardcoded "Afrobeats Essentials" + 20 arbitrary songs for any bad/unknown id instead of 404. `PlaylistPage.tsx:99-119,278-279`. Confirmed live — shows test uploads as editorial content.
3. Followed artists split across two tables: writes go to `user_follows` (`FollowUserButton.tsx`), Library reads `user_artist_follows` (`LibraryPage.tsx:45-48`) → Library→Artists always empty. Artist dashboard queries a third, nonexistent `artist_followers` (`ArtistDashboard.tsx:162-167`) → followers stat always 0. **Pick one table, migrate, fix all three call sites.**
4. LibraryPage effect has empty deps but guards on Clerk `isLoaded` → never refetches once user resolves. `LibraryPage.tsx:29-36`.
5. ArtistPage discography cards are inert — can't open or play albums from an artist page. `ArtistPage.tsx:406-419`.
6. PlaylistPage action bar Shuffle/Like/More buttons have no onClick; page-level Like is in-memory only. `PlaylistPage.tsx:150-156,329-348`.
7. `LikedSongsPage` header uses nonexistent class `md:row`. `LikedSongsPage.tsx:102`.
8. Artist tiles / top tracks use `play(song)` not `playAlbum(...)` → no queue built, next/prev dead after. `ArtistPage.tsx:183-185,271`.
9. Mock "Popular radio" + "Featured Charts" sections on home are hardcoded and inert. `StreamsHome.tsx:663-687,710-753`. Either implement (radio = seed-based queue already exists in player!) or remove.
10. Image `onError` fallbacks point to remote Unsplash instead of local placeholder.

### B. Player completeness
1. **No persistence:** queue, current song, position, volume, shuffle/repeat, rate all lost on refresh. Persist to localStorage (debounced) + restore paused.
2. Shuffle is naive `Math.random` per step — can repeat current song; prev doesn't retrace. Implement shuffle-order array + history.
3. Queue reorder is HTML5 drag only — dead on touch. `QueueDrawer.tsx:110-119`.
4. Shared song opens with empty queue (`SongPage.tsx:64-68`) — should build context (album or artist top tracks).
5. Queue drawer is light-themed while player is dark.
6. Mobile mini-player hides volume/shuffle/repeat entirely (fine) but nav omits Stats/Trending — review nav contents.

### C. Sharing & deep links (Bara priority)
1. **Extend the existing Vercel Edge Middleware OG system** (`middleware.ts` — already covers song/playlist/artist, see §2b) to: `/streams/album/:id`, `/streams/genre/:g`, podcast show + episode pages, `/streams/movies` detail, ebook detail. Also add client-side `SEO` component on `SongPage` (in-app tab titles, and dev parity).
2. No share button on Album (`AlbumPage.tsx:199-228` action bar) or Genre pages; podcasts have no share at all.
3. Unify on the platform `useShare()` pattern (per MASTER_PLAN rule 5): canonical URL builder per entity + native share sheet + copy fallback (`ShareContext` already used by movies/ebooks — bring music pages onto it).
4. **Share cards for WhatsApp** (see §6 Signature): OG images per entity — cover art + title composited, since WhatsApp status/share is the dominant African share channel.
5. Future (nice-to-have): `?t=90` timestamp deep links into songs/episodes.

### D. Stream-count integrity (D3)
1. Count at 30s: move `trackPlay` from play-start to a 30s-elapsed trigger (player already has a 30s XP timer to piggyback on — `AudioPlayerContext.tsx:225`).
2. Server-side dedupe/rate-limit in `increment_play_count` RPC: one count per (song, user-or-device-fingerprint) per window; keep anon counting (D3) but throttle by device id + IP-ish heuristics available to the RPC.
3. Make `songs.plays` not directly writable (revoke UPDATE; RPC-only) — this piece lands with Phase K but the RPC change ships now.
4. `play_history` insert should stop accepting arbitrary `user_id`.
5. Align the three "meaningful play" definitions (count, XP, missions) on the 30s rule.

### E. Creator completeness (music)
1. **Artist claim flow:** admin-seeded artists (user_id NULL) claimable via verification-style request; UNIQUE constraint on `artists.user_id`; guard the auto-create against duplicates/races.
2. Storage hygiene: delete audio/cover objects when songs are deleted (both creator + admin paths; fix admin's wrong `tracks/` prefix — creator files live at `songs/{userId}/`); cleanup on failed uploads (upload row first as draft, or catch-and-remove).
3. Album track ordering: set `track_number` on add + drag-reorder in `EditAlbumModal`; order album pages by it.
4. Draft/publish state + scheduled releases: `status` column (draft/published), respect future `release_date`.
5. Kill or rebuild `ArtistVerificationPage` (mock $10/mo Stripe page) — it contradicts the real free doc-review flow and the DPO/MoMo direction. Route `/streams/verification` should point at the real flow.
6. Consolidate `song_artists` migration into `supabase/migrations/` (it currently lives only in hand-run `database/migrations/add_movie_crew_song_credits.sql`) and stop swallowing its errors.
7. Fix `is_verified` dual-write (admin checkbox vs RPC) — checkbox should create an audit record or be removed.
8. Boost/Promote overloads `is_premium` (also means "paid song") — separate `boosted_until` check from premium flag.
9. Dashboard: add time-range selector; fix "listening time" estimate (plays × duration is inflated); follower growth needs snapshots (later).

### F. Moderation & guidelines (D4)
1. `content_reports` table + Report action on song/album/artist/playlist (context menu + pages) with categories (copyright, inappropriate, impersonation, other).
2. Public DMCA/copyright claim form (no login required) feeding the same queue.
3. Admin queue page: review, dismiss, takedown (unpublish, not hard delete), notify artist via existing notifications.
4. **Content guidelines page** (what's allowed, copyright rules, consequences) — linked from upload pages, footer, report dialogs; short notes at upload time (D4: "include little notes making clear the guidelines").
5. Wire the sidebar footer legal links (currently `href="#"`).

### G. Podcasts
1. Show page `/streams/podcast/:id` + episode deep links (`/streams/podcast/:id/episode/:epId`) — shareable, OG'd (C1).
2. **Unify playback into AudioPlayerContext:** episodes become queueable items in the global player (type field: song|episode); kills the double-audio bug and gives persistence for free.
3. Resume: write `podcast_listen_history.progress_seconds` periodically; resume on play; "continue listening" rail.
4. Subscribe button + `podcast_subscriptions`; subscribed rail on podcasts home + library.
5. Self-serve podcaster flow (D6): "My Podcast" creator page — create show, upload episodes (audio to a new `podcasts` bucket), edit/delete; fix `UserMyPodcasts` (queries nonexistent `uploaded_by` — add the column).
6. Admin episode management UI; create `podcasts` storage bucket.
7. Replace SoundHelix seed audio eventually; mark seed shows clearly or remove at launch.

### H. Movies (D5: self-hosted)
1. Fix `AdminMovies` ⇄ schema mismatch (either add `producers/writers/actors/stream_url` columns or rewrite admin to use `cast_members/director/video_url`). Blocking: admins literally cannot add movies today.
2. Create `movies` storage bucket (posters, backdrops, trailers, full films).
3. **Video player page** `/streams/movie/:id/watch`: HTML5 video, fullscreen, seek, volume, playback speed, remember position (new `movie_watch_progress` table), auto-pause music player.
4. Wire "Watch Now" (gate: `is_free` → play; premium → "coming soon" until payments).
5. Watchlist UI on `movie_watchlist` (button on cards/detail, rail on movies home, library section).
6. Wire genre tiles, Filters, "See all", "More Info" (currently decorative).
7. Read-side fields (`producers/writers/actors`) render per whichever schema direction chosen in H1.
8. Later: subtitles tracks, series/seasons, transcode pipeline if needed.

### I. Ebooks (D7: in-app reader)
1. **Reader page** `/streams/ebook/:id/read`: PDF (pdf.js) + EPUB (epub.js), pagination, font size, progress saved to a new `ebook_reading_progress` table, resume. Free books only until payments.
2. Wire "Read Free" buttons; "Buy · N coins" shows "payments coming soon" state until DPO/MoMo + coin security (do NOT charge client-mutable coins).
3. Self-publish flow: real upload form on `UserMyEbooks` (bucket + `uploaded_by` already work) or a dedicated `/streams/ebooks/publish`; fix misrouted "Publish Your Book" CTA.
4. Increment `download_count`→ rename semantics to `read_count`.
5. Seed/import an initial free catalog (public-domain African literature) so the vertical isn't empty; remove hardcoded `FEATURED_BOOKS`/`STATIC_BOOKS` fallbacks.
6. Later: chapters/TOC, samples, multi-format per title.

### J. Search, discovery & performance
1. Cross-vertical search: extend `MusicSearchPage` (or a new unified search) to podcasts, movies, ebooks with sectioned results.
2. Pagination/infinite scroll on Trending, Artists, New Releases (currently fetch-ALL).
3. Introduce React Query across streams pages (dedupe, cache, retries); kill the ~8-query waterfall on StreamsHome and 6-query ArtistPage where joinable.
4. Consolidate the three ad-hoc search implementations on one module.
5. Local placeholder images instead of Unsplash fallbacks.

### K. Security & schema hardening (pre-launch gate — D2)
**Nothing public-launches before this phase.**
1. RLS owner-scoping on `artists/songs/albums/playlists/playlist_songs/song_artists`: writes require Clerk JWT sub = owner (pattern already proven in `artist_picks` policies). Remove anon write grants.
2. `music` bucket: anon INSERT/UPDATE/DELETE removed; writes via authed client, path-scoped to owner.
3. `increment_play_count`: finish D-series protections (revoke direct `plays` UPDATE, rate limits).
4. Migration consolidation: fold `database/migrations/*` into `supabase/migrations/`; drop dead `artists.verified`, `artists.monthly_listeners`; single canonical schema file for reference; verify prod matches.
5. Fix Clerk-vs-UUID leftovers (`20260225103403` auth.uid() policies).
6. Podcast/movie RLS: replace `USING (true)` management policies with admin/owner checks.
7. Pen-test pass: attempt anon writes against every table/bucket via REST; document results.

### L. Admin & management completeness

Admin items scattered above, consolidated + extended into a real "streams command center":

**Broken today (also listed in their vertical sections):**
1. AdminMovies create/edit fails (schema mismatch, §H1); `movies`/`podcasts`/`music-covers` buckets missing (§H2, §G6, E-album note).
2. No podcast **episode** management UI at all (§G6) — delete dialog even promises episode cleanup it can't do.
3. Admin song deletion cleans the wrong storage prefix (§E2).
4. `is_verified` writable two ways with no audit trail (§E7).

**Missing management capability (new):**
5. **Moderation queue** page: content reports + DMCA claims (from §F) with review/dismiss/takedown+notify actions and per-admin action log.
6. **AdminStreamsDashboard with real numbers:** plays today/week (post-D3 they're credible), top songs/artists, uploads per day, storage used per bucket, listener counts per vertical, seed-vs-real content split. Recharts, consistent with other admin dashboards.
7. **Content-health panel** (pattern proven by the RSS fetch-health work): dead audio URLs (external SoundHelix seeds!), songs with missing covers/durations, orphaned storage objects, albums with zero tracks, artists with no user_id (unclaimed) — each with a fix/queue action.
8. **Seed-data controls:** flag `is_seed` on seeded artists/songs/podcasts/movies; one-click hide-all-seed-content for launch (today seed and real content are indistinguishable — user test uploads appeared inside a "curated" playlist live).
9. **Bulk actions** on AdminSongs/AdminAlbums: multi-select → genre fix, takedown, badge, delete-with-storage.
10. **Artist-claim review queue** (from §E1) alongside the existing verification queue.
11. **Admin role separation** — `admin_users.role` is read but never enforced (MASTER_PLAN 27.6.2); enforce at least super_admin vs content-moderator on takedown/delete.
12. Admin audit trail for destructive actions (who deleted/took down what, when) — pairs with soft-delete/unpublish (§F3).

---

## 5. Signature Features — "splendid UX/UI" layer

The gap register makes Streams *work*; this section makes it *delightful*. Bar = `STREAMS_STANDARD.md` D1–D6 (strict black/white/grey, Comfortaa/Roboto, Apple+Stripe calm, skeletons everywhere, 44px touch targets, reduced-motion respected). Items marked ⭐ are the highest leverage for Bara's context.

**Cross-vertical**
- ⭐ **"Jump back in" universal resume rail** on the Streams hub + music home: your interrupted song queue, half-played episode, paused movie, open book — one row, four verticals. (Depends on the progress tables from §B/§G/§H/§I.)
- ⭐ **Data Saver mode** (African context: data is expensive): audio-quality selector (low/normal/high), disable autoplay images option, "wifi-only artwork" — a Streams settings sheet, persisted per device.
- ⭐ **Offline/PWA** for free content (STREAMS_STANDARD F5 leftover; MASTER_PLAN 27.6.5): installable app, cached shell, downloadable free songs/episodes for offline playback.
- ⭐ **Country charts — real, not mock:** replace the hardcoded "Featured Charts" with actual charts computed from `play_history` (Top 50 Africa, Top Songs {country} using Bara's country dimension). This is Bara's identity advantage over Spotify — lean in.
- **Cross-vertical search** with grouped sections (§J1) + trending searches.
- **Share cards:** OG image generation (cover art + entity name + Bara mark) for every shareable entity (§C4) — WhatsApp-first.
- Consistent **sign-in nudge sheet** for gated actions (one component, warm copy, not a dead button) — fixes §A silent no-ops with good UX.

**Music**
- ⭐ **Wire "Popular radio" cards to the real `startRadio`** (§2b — engine exists, cards are mock). Radio from any song/artist/genre.
- **Synced lyrics** already ship (LRC `[mm:ss]`) — add a lyrics button on the mini-player and a share-a-lyric-line card (ties into share cards).
- **Gapless + crossfade + loudness normalization** (STREAMS_STANDARD Tier 3, F1) — Web Audio API crossfade setting (0–12s).
- **Weekly recap + "Bara Wrapped"** (F10 leftover): weekly listening email/notification via the existing email queue; end-of-year shareable Wrapped cards (stats page already computes most inputs).
- **Smart queue end:** when a queue runs out, auto-continue with radio from the last song (setting, default on — engine exists).
- **Artist tipping with coins** (MASTER_PLAN 27.4.2 sink) — *after* coin security; UI stub "Support this artist" can land earlier gated off.
- **New-release notifications** already exist (trigger) — surface a "New from artists you follow" rail (Release Radar exists; make it prominent).

**Podcasts**
- Playback speed + skip-silence flags on episodes (player already supports rate 0.25–4x — expose it in podcast UI).
- Episode chapters (simple `[{t, title}]` JSON) with chapter list in full-screen player.
- "New episodes" rail from subscriptions + subscription notifications (reuse new-release trigger pattern).

**Movies**
- "Continue watching" rail with progress bars on cards (§H3 progress table).
- Trailer-on-hover / trailer button using existing `trailer_url` data even before full films upload.
- Subtitle track support (`<track>` WebVTT) — schema + player slot from day one, content later.

**Ebooks**
- Reader comfort: font size/line-height controls, sepia/night reading surface (still within the grey system), remembered per user.
- ⭐ **Quote cards:** select text → share as a designed quote card (author + cover + Bara mark) — the ebook version of share cards.
- Reading streaks/goals tie-in with existing gamification (missions already exist).

**Explicitly out (per MASTER_PLAN rules/guardrails):** emoji reaction pickers (likes only), any colored accent UI, coin cash-out, betting-adjacent features. Activity feed / friend listening (F8 stretch) and Blend-style two-person playlists stay in "later" — logged, not scheduled.

---

## 6. Execution Phases

Ordered for: visible product completeness first (D2), foundations that other phases need early, security as the launch gate. Each phase is a shippable PR-sized chunk (some split into multiple PRs).

| Phase | Name | Contents | Size | PR | Status |
|-------|------|----------|------|----|--------|
| **1** | Music: fix everything broken | Gap register §A (10 items) — routes, fake playlist 404, follows-table unification, Library refetch, discography, playlist buttons, queue-building on artist plays, mock sections resolved | M | #3 | ✅ Merged |
| **2** | Player: persistence + correctness | §B — localStorage persistence/restore, proper shuffle, touch reorder, shared-song queue context, drawer theming | M | #4 | ✅ Merged |
| **3** | Sharing & deep links | §C — OG edge function for all entities, share buttons everywhere, unified `useShare()` | M (edge fn is the meat) | #5 | ✅ Merged |
| **4** | Stream counting (D3) | §D — 30s rule, dedupe/rate-limit RPC, aligned definitions | S–M | #6 | ✅ Merged (see §8 — its RPC/grant fix didn't fully take until Phase 14 caught the gap) |
| **5** | Creator completeness | §E — claim flow, uniqueness, storage hygiene, track ordering, drafts/scheduling, verification page cleanup, `song_artists` consolidation | L | #8 | ✅ Merged |
| **6** | Moderation & guidelines (D4) | §F — reports, DMCA form, admin queue, takedown+notify, guidelines page, legal links | M | #9 | ✅ Merged |
| **7** | Podcasts to parity | §G — show/episode pages, global-player unification, resume, subscriptions, self-serve upload (D6), buckets, admin episodes | L | #10 | ✅ Merged |
| **8** | Movies to parity (D5) | §H — schema fix, buckets, video player + progress, watchlist, wired browse | L | #11 | ✅ Merged |
| **9** | Ebooks to parity (D7) | §I — reader, progress, self-publish, seed catalog | L | #12 | ✅ Merged |
| **10** | Search, discovery & perf | §J — cross-vertical search, pagination, React Query | M | #13 | ✅ Merged |
| **11** | Admin command center | §L — moderation queue, real dashboard, content health, seed controls, bulk actions, claim queue, role enforcement, audit trail | L | #14 | ✅ Merged |
| **12** | Signature experiences | §5 — resume rail, data saver, country charts, radio wiring, share/quote cards, recap/Wrapped, offline/PWA, per-vertical delight | L (split into several PRs) | #15 | ✅ Merged — not individually re-verified item-by-item, see §8 |
| **13** | Security & schema hardening | §K — the pre-launch gate | L | #16 | ✅ Merged and applied to prod (2026-08-06) — QA checklist still pending, see §8 |
| **14** | Launch QA | Re-run scenario matrix end-to-end, all ✅ or consciously deferred; STREAMS_STANDARD Part B acceptance checks; device-matrix pass (375/768/1440); empty/error-state pass; Lighthouse ≥90 a11y | M | #17 | ✅ Merged — a11y passed (92), perf did not (32, bundle-size issue), device/signed-in checks handed off, see §8 |

Suggested pairing per session: Phases 1–2 together (music feels dramatically more finished), then 3–4 (share + counting = credible public numbers), then 5–6 (creators + safety), then one vertical per session (7, 8, 9), then 10–11 (search + admin), 12 in slices whenever a phase lands early, then 13–14 as the launch gate. Some §5 quick wins (radio wiring, sign-in nudge sheet, SongPage SEO) can ride along inside Phases 1–3.

### Acceptance criteria (definition of "fully complete") — final status, 2026-08-06
- ✅ Every row in the Scenario Matrix (§3) is ✅ or explicitly deferred with a reason logged there — re-audited in full during Phase 14.
- 🟡 Every entity has a working detail page, share button + real OG preview, loading/empty/error/404 states — true for all 8 entity types as of Phase 14 (ebook OG preview was the last gap, closed then). **Mobile layout at 375/768/1440 was not re-verified live** — this sandbox can't render on real devices; see the Phase 14 handoff checklist.
- ✅ Nothing user-visible is mock/hardcoded/inert — the last known instance (`MoviesPage.tsx`'s hardcoded fallback catalog) was found and removed in Phase 14.
- 🟡 A signed-out user always gets a clear sign-in prompt on gated actions — true everywhere checked; Phase 14 unified 3 more call sites onto the shared nudge sheet but did not exhaustively grep every gated action in the codebase for a stray silent no-op.
- ✅ Play/watch/read progress survives refresh and returns — verified live for music (resume rail), code-verified for movies/podcasts/ebooks.
- 🟡 **Anon REST writes fail against every streams table and bucket — migrations applied 2026-08-06, not yet re-verified.** All 4 Phase 13/14 migrations (plus a discovered prerequisite, `20260415_collaborative_playlists.sql`) ran successfully against production. `node scripts/security_pentest_anon_writes.mjs` has not been re-run since to confirm the fix took — do that before treating this as fully closed.
- 🟡 Admin can manage every content type end-to-end without touching SQL — true in code; the `music-covers` bucket bug (Phase 14) means admin album-cover uploads were actually broken until that migration is applied too.
- 🟡 The ⭐ signature features in §5 are shipped or explicitly deferred with reasons logged — Phase 12 shipped as one PR (#15) covering this section, but Phase 14's QA pass scoped to the Scenario Matrix and STREAMS_STANDARD Part B, not an item-by-item re-check of every §5 bullet. Recommend a spot-check before treating this bullet as fully closed.

---

## 7. Known environment notes
- Dev: `npm run dev` wants port 8080 but that collides with other local projects — use `npx vite --port 8090 --strictPort`.
- Seed catalog audio = external SoundHelix MP3s (can time out); replace or accept for dev only.
- Two migration folders exist (`supabase/migrations/`, `database/migrations/`) — the latter is hand-run; Phase 5/11 consolidates.
- Clerk's production keys are domain-locked to `baraafrika.com` and refuse to initialize on `localhost` — no signed-in flow can be tested in this dev sandbox. Every phase from 5 onward that touched authenticated behavior relied on code review + live anon-key/service-role checks instead of a real signed-in browser session.

---

## 8. Closeout (2026-08-06) — what's actually done vs. what's left

All 14 phases are merged (§6). Before calling this project done, in priority order:

1. ✅ **Done 2026-08-06 — migrations applied.** `STREAMS_MIGRATIONS_TRACKING.md` rows
   10–13 (`20260806_security_hardening.sql`, `20260806_music_bucket_hardening.sql`,
   `20260806_songs_boost_columns.sql`, `20260806_music_covers_bucket.sql`) all applied
   successfully to production, after a discovered prerequisite
   (`20260415_collaborative_playlists.sql`, also never applied) was run first. **Not yet
   done:** re-run `node scripts/security_pentest_anon_writes.mjs` to confirm the
   anon-write fix took, and spot-check the Creator Dashboard "My Songs" tab + admin
   album-cover upload.
2. **Run the Phase 14 handoff checklist** (`PHASE_14_LAUNCH_QA.md` §3) against a real
   signed-in Clerk session in staging — likes/saves/follows persistence, playlist
   collaboration, podcast/movie/ebook progress, the full creator publish flow, admin
   content moderation, OS lock-screen media controls, touch drag-reorder, and the
   375/768/1440 device matrix. None of it could be exercised in this dev sandbox.
3. **Re-run Lighthouse against the real Vercel deployment.** The Phase 14 perf score
   (32, fails the ≥70 bar) was measured against a local static server; the root cause
   (a 5.5MB main JS bundle from a code-splitting misconfiguration) is real and
   independent of hosting, but the actual number in production — behind a CDN — may
   differ enough to change how urgent a dedicated bundle-splitting pass is.
4. **Known, explicitly-deferred gaps** (not blockers, logged so they don't get
   silently forgotten): search has no typo tolerance (STREAMS_STANDARD F4); a handful
   of color-contrast and touch-target a11y findings live in site-wide shared components
   (`Footer.tsx`, the ad carousel) rather than Streams-specific code; `user_album_saves`/
   `movie_watch_progress`/`podcast_listen_history`/`podcast_subscriptions`/
   `movie_watchlist` have the same open-RLS bug Phase 13 fixed elsewhere but their
   client write paths were never migrated to the authenticated client, so hardening
   them now would break those features — needs the same two-step treatment Phase 13
   gave the core tables; §5's signature features (Phase 12, PR #15) weren't
   individually re-verified during Phase 14's QA pass.

Once item 1 is done and item 2's checklist is clear, this plan can be considered fully
closed.
