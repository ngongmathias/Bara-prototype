# BARA Streams — Master Completion Plan

**Created:** 2026-08-03 (planning session)
**Goal:** Take Streams from "wide skeleton" to a fully functional product where every user scenario is accounted for — Spotify-quality mechanics, adapted to Bara's context: free-first, self-managed by users and artists, deep shareable links into every corner of the platform, and payments deferred until DPO/MoMo approval.
**Companion docs:** `GAMIFICATION_GUIDE.md` (rewards system), this file (streams).

---

## 1. Product Decisions (locked 2026-08-03)

These were decided explicitly and should not be re-litigated without a new decision:

| # | Decision | Call |
|---|----------|------|
| D1 | Scope | All four verticals: Music, Podcasts, Movies, Ebooks |
| D2 | Security hardening (RLS lockdown) | **Later phase, before public launch** — users are few and trusted now; visible completeness first. See Phase K. |
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
1. **Security/integrity:** catalog world-writable via anon key; plays gameable (Phase K, D2).
2. **Dead-end core actions:** watch/read/episode pages missing; several broken/inert buttons in music.
3. **Sharing half-built** despite being a Bara priority: no OG previews anywhere (SPA), missing share buttons, shared songs open without queue.
4. **No persistence/resume:** player state dies on refresh; no listen/watch/read progress anywhere.
5. **Consistency debt:** 3 table-name mismatches, two migration folders, duplicate columns, mock sections, inconsistent login-gating UX.

---

## 3. Scenario Matrix

Legend: ✅ works · 🟡 partial · ❌ missing/broken. This is the checklist "every little user scenario is accounted for" is measured against.

### Guest (not signed in)
| Scenario | Status | Notes |
|----------|--------|-------|
| Browse hub / music home / trending / genres / new releases | ✅ | |
| Play songs, build queue, full-screen player | ✅ | |
| Open a shared song/album/artist/playlist link | 🟡 | Opens, but no OG preview anywhere; song opens without queue context |
| Search music | ✅ | Music only — other verticals unsearchable |
| Like / save / follow / playlist | ❌ | Silent no-op on most pages (no sign-in prompt) — must become a consistent sign-in CTA |
| Browse podcasts / movies / ebooks | ✅ | |
| Play a podcast episode | 🟡 | Plays, but dies on navigation; can overlap music |
| Watch a movie / read an ebook | ❌ | Dead buttons |
| Hit a bad URL (song/album/playlist id) | 🟡 | Song/album 404 fine; playlist shows fake data |

### Listener (signed in)
| Scenario | Status | Notes |
|----------|--------|-------|
| Like songs, save albums, liked-songs page, library | 🟡 | Works, but followed artists never appear in Library (table mismatch); playlist "like" is local-only |
| Create playlists, add/remove songs, collaborative invites | 🟡 | Works via modals; playlist-page action buttons (shuffle/like/more) inert |
| Resume where I left off (refresh / return later) | ❌ | No player persistence, no listen progress |
| Listening stats | ✅ | |
| Follow artist → see their new releases | 🟡 | Release Radar works (`user_follows`); Library reads wrong table |
| Subscribe to a podcast / resume an episode | ❌ | Tables exist, no UI, never written |
| Movie watchlist / ebook progress | ❌ | Watchlist table exists, no UI |
| Report a song/artist for copyright/abuse | ❌ | No mechanism (D4) |

### Artist / Creator
| Scenario | Status | Notes |
|----------|--------|-------|
| Become an artist (self-serve, first upload) | ✅ | Auto-creates artist row |
| Claim an existing (admin-seeded) artist profile | ❌ | Impossible today → duplicate artists (visible live on home page) |
| Upload song with metadata, featured artists, lyrics | ✅ | Client-side validation only; orphaned files on partial failure |
| Create/edit albums, order tracks | 🟡 | CRUD works; **no track ordering** (`track_number` never set) |
| Schedule a release / save a draft | ❌ | Everything is public instantly (release_date ignored) |
| Delete a song cleanly | 🟡 | DB cascades fine; storage files orphaned forever |
| See real stats (plays, listeners, followers) | 🟡 | Plays/listeners real; **followers always 0** (wrong table name) |
| Get verified | 🟡 | Real doc-review flow works; a contradictory mock "$10/mo" page also exists and must die |
| Publish a podcast / movie / ebook | ❌ | No self-serve for any non-music vertical (CTAs misroute to music dashboard) |

### Admin
| Scenario | Status | Notes |
|----------|--------|-------|
| CRUD artists/songs/albums, verify artists, promo badges | ✅ | |
| Add a movie | ❌ | Insert fails — code writes columns the table doesn't have |
| Upload podcast covers / movie files / album covers | ❌ | `podcasts`, `movies`, `music-covers` buckets don't exist |
| Manage podcast episodes | ❌ | No episode UI at all |
| Review content reports / DMCA claims | ❌ | No intake exists (D4) |
| Takedown with artist notification | ❌ | Delete-only, silent |

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
1. **No OG/link previews for anything** — helmet-only SPA meta is invisible to WhatsApp/FB scrapers, and `SongPage` doesn't even render `SEO`. Needs a server-side answer: Supabase Edge Function (or Vercel middleware) that serves crawler-targeted OG HTML for `/streams/song/:id`, `/album/:id`, `/artist/:id`, `/playlist/:id`, podcast/movie/ebook pages. This is the single highest-leverage share feature.
2. No share button on Album (`AlbumPage.tsx:199-228` action bar) or Genre pages; podcasts have no share at all.
3. Unify a `useShare()` helper: canonical URL builder per entity + native share sheet + copy fallback (exists partially in `ShareContext` used by movies/ebooks).
4. Future (nice-to-have): `?t=90` timestamp deep links into songs/episodes.

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

---

## 5. Execution Phases

Ordered for: visible product completeness first (D2), foundations that other phases need early, security as the launch gate. Each phase is a shippable PR-sized chunk (some split into multiple PRs).

| Phase | Name | Contents | Size |
|-------|------|----------|------|
| **1** | Music: fix everything broken | Gap register §A (10 items) — routes, fake playlist 404, follows-table unification, Library refetch, discography, playlist buttons, queue-building on artist plays, mock sections resolved | M |
| **2** | Player: persistence + correctness | §B — localStorage persistence/restore, proper shuffle, touch reorder, shared-song queue context, drawer theming | M |
| **3** | Sharing & deep links | §C — OG edge function for all entities, share buttons everywhere, unified `useShare()` | M (edge fn is the meat) |
| **4** | Stream counting (D3) | §D — 30s rule, dedupe/rate-limit RPC, aligned definitions | S–M |
| **5** | Creator completeness | §E — claim flow, uniqueness, storage hygiene, track ordering, drafts/scheduling, verification page cleanup, `song_artists` consolidation | L |
| **6** | Moderation & guidelines (D4) | §F — reports, DMCA form, admin queue, takedown+notify, guidelines page, legal links | M |
| **7** | Podcasts to parity | §G — show/episode pages, global-player unification, resume, subscriptions, self-serve upload (D6), buckets, admin episodes | L |
| **8** | Movies to parity (D5) | §H — schema fix, buckets, video player + progress, watchlist, wired browse | L |
| **9** | Ebooks to parity (D7) | §I — reader, progress, self-publish, seed catalog | L |
| **10** | Search, discovery & perf | §J — cross-vertical search, pagination, React Query | M |
| **11** | Security & schema hardening | §K — the pre-launch gate | L |
| **12** | Launch QA | Re-run this scenario matrix end-to-end, all ✅ or consciously deferred; mobile pass; empty/error-state pass | M |

Suggested pairing per session: Phases 1–2 together (music feels dramatically more finished), then 3–4 (share + counting = credible public numbers), then 5–6 (creators + safety), then one vertical per session (7, 8, 9), then 10, then 11–12 as the launch gate.

### Acceptance criteria (definition of "fully complete")
- Every row in the Scenario Matrix (§3) is ✅ or explicitly deferred with a reason logged here.
- Every entity (song, album, artist, playlist, podcast show, episode, movie, ebook) has: a working detail page, a share button producing a deep link with a real OG preview, sane loading/empty/error/404 states, and mobile layout.
- Nothing user-visible is mock/hardcoded/inert.
- A signed-out user always gets a clear sign-in prompt (never a silent no-op) on gated actions.
- Play/watch/read progress survives refresh and returns.
- Anon REST writes fail against every streams table and bucket (Phase 11).

---

## 6. Known environment notes
- Dev: `npm run dev` wants port 8080 but that collides with other local projects — use `npx vite --port 8090 --strictPort`.
- Seed catalog audio = external SoundHelix MP3s (can time out); replace or accept for dev only.
- Two migration folders exist (`supabase/migrations/`, `database/migrations/`) — the latter is hand-run; Phase 5/11 consolidates.
