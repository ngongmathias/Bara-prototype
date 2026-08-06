# Phase 14 — Launch QA

Automated subset of STREAMS_MASTER_PLAN.md's launch-QA gate, done without a live Clerk
session (this dev sandbox's Clerk keys are domain-locked to production and refuse to
initialize on localhost — confirmed via a console error, not an assumption). Covers what
could be verified by reading code, querying the live database read-only, live-testing
guest/signed-out flows in a real browser, and running Lighthouse against both a dev and a
production build. Everything that genuinely needs a signed-in session, a real device, or
OS-level integration is listed in §3 as a handoff checklist.

## 1. What changed this phase

Re-audited every row of the Scenario Matrix (STREAMS_MASTER_PLAN.md §3) against current
code — see that file for the full updated table. Highlights: most of the 2026-08-03
snapshot's ❌/🟡 rows are now ✅, confirming Phases 1–13 landed as intended. Three new,
previously-undetected bugs were found and fixed:

1. **`ArtistDashboard.tsx` queried two columns that don't exist** (`songs.is_premium`,
   `songs.boosted_until`) — confirmed live via a direct anon-key query (`42703: column
   does not exist`). This silently emptied every artist's "My Songs" tab and killed the
   Track Boost feature. Fixed: `supabase/migrations/20260806_songs_boost_columns.sql`
   adds the columns (not yet applied to production).
2. **The `music-covers` storage bucket never existed** — confirmed live via
   `storage.listBuckets()`. Every admin album-cover upload (`AdminAlbums.tsx`) has been
   failing silently. Fixed: `supabase/migrations/20260806_music_covers_bucket.sql`
   creates it with admin-write/public-read policies (not yet applied to production).
3. **`MoviesPage.tsx` showed hardcoded fake movies** (fake ids, Unsplash stock images)
   whenever the real `movies` query returned zero rows or errored — indistinguishable
   from real content, and clicking through led to a "not found" page since the ids
   weren't real. Fixed in code: removed the fallback, added an honest "No movies yet"
   empty state.

Two smaller gaps also fixed:
- **Ebook detail pages had no OG/share preview** — `middleware.ts` covered every other
  entity type but never ebooks. Added the missing route + preview builder.
- **Sign-in gating used two different UI patterns** (a dedicated nudge sheet vs. a plain
  toast) for the same class of action. Unified `AlbumPage.tsx`, `PlaylistPage.tsx`, and
  `SongContextMenu.tsx` onto the shared `useSignInNudge()` sheet, matching
  `AudioPlayerContext`/`MovieDetailPage`/`PodcastShowPage`, which already used it.

**Found but explicitly not fixed (documented, not silently dropped):**
- **No typo tolerance in search** — STREAMS_STANDARD's F4 acceptance check says a typo
  like "amapaino" should still surface "Amapiano" results. Verified live: it doesn't
  (exact-substring `ilike` matching only). Fixing this well (trigram/fuzzy search) is a
  real feature addition, not a QA-pass fix — flagged for a future phase, not attempted
  here.
- **Design-system color audit**: grepped every non-grey Tailwind color class across
  `src/pages/streams/` and `src/components/streams/` — **zero hits**, the core Streams
  surface is fully monochrome per STREAMS_STANDARD's D1–D4. The only non-grey usage found
  is a handful of semantic red delete-icon classes in the shared `/user/*` creator
  dashboard pages (`UserMyMusic.tsx` etc.), which live outside `/streams` routes proper
  and predate this design system — left as-is pending a product decision on whether
  that shared dashboard shell is in scope for the same rule.
- **Bundle size**: production build's main JS chunk is 5.5MB (1.45MB gzipped) — Vite
  warned during the build that several modules are both lazy- and statically-imported
  from different places, which defeats code-splitting and forces them into the main
  bundle. This is a real, measurable finding (independent of any hardware/environment
  effects) but fixing it is a cross-cutting performance project, not a QA-pass fix.

## 2. Lighthouse results (`/streams`)

Ran twice: once against the Vite dev server (misleading — dev-mode serves unbundled
modules and produced nonsense 100+ second paint times, a well-known false signal, not
reported further) and once against a production build (`vite build` + static serve),
which is the meaningful number:

| Category | Score | Bar (STREAMS_STANDARD D5-D6) | Result |
|---|---|---|---|
| Accessibility | **92** | ≥ 90 | ✅ Pass |
| Performance | **32** | ≥ 70 | ❌ Fail |

**Accessibility (92, passes)** — two audit types still flagged, neither blocking the bar:
- `color-contrast`: 3 genuine findings inside `StreamsHub.tsx` (fixed this phase — bumped
  `text-gray-500`/`text-gray-400` to `text-gray-600`/`text-gray-700` on the "Coming Soon"
  badge and two description strings). A 4th flagged element (the "BARA Streams" hero
  label) sits over a blurred, low-opacity gradient background — likely a contrast-checker
  sampling artifact from the blur/blend layering rather than a real problem; worth a
  manual visual check rather than a blind CSS change. The remaining flagged elements are
  all in the site-wide `Footer.tsx` (copyright line, "Follow us:", a "Show All N
  Locations" link) — real findings, but outside `/streams` and shared by every page on
  the site, so left for a site-wide a11y pass rather than folded into a Streams-scoped PR.
- `target-size`: every flagged element is an 8×8px carousel dot in the site-wide
  `TopBannerAd` component (ad carousel), not Streams-specific — same reasoning, left for
  a site-wide pass.

**Performance (32, fails)** — root cause is bundle size, not runtime logic: the main JS
chunk is 5.5MB uncompressed / 1.45MB gzipped, and Lighthouse's own `unused-javascript`
audit estimates ~1.1MB of it is unused per-page. This single number should also be
retested against the actual Vercel deployment before treating it as final — this sandbox
has no way to verify how much of the gap is genuine bundle bloat vs. this specific test
environment's hardware/network being slower than production's CDN-fronted static hosting.
Recommend a dedicated bundle-splitting pass (fixing the mixed lazy/static import pattern
Vite warned about at build time) before re-measuring.

## 3. Handoff checklist — needs a real signed-in session, a real device, or a real deploy

None of this could be verified in this sandbox. Run through it before calling Phase 14
(and therefore the whole Streams project) done:

**Signed-in flows (blocked here by Clerk's domain lock, not by the code):**
- [ ] Like/unlike songs and playlists, save/unsave albums — confirm they persist across a
      refresh and appear correctly in Library.
- [ ] Create a playlist, add/remove songs, generate a collaborative invite link, join via
      that link as a second account, add songs as the collaborator.
- [ ] Follow an artist, confirm they appear in Library and their new releases surface in
      Release Radar / Jump Back In.
- [ ] Subscribe to a podcast, resume an episode after leaving and returning.
- [ ] Add a movie to your watchlist, resume a partially-watched movie.
- [ ] Resume an ebook from where you left off, across both PDF and EPUB titles.
- [ ] Report a song, album, artist, or playlist — confirm it reaches the admin queue.
- [ ] Full creator flow: upload a song, create an album, order its tracks via drag,
      schedule a release for a future date and confirm it stays hidden until then, save a
      draft and confirm only you can see it, delete a song and confirm no orphaned files
      remain in storage.
- [ ] Creator Dashboard "My Songs" tab — **specifically re-check this one**, since it was
      broken by the `is_premium`/`boosted_until` bug until this phase's migration is
      applied. Confirm songs actually list, and that Track Boost (spend coins → promote a
      song 24h) works end-to-end.
- [ ] Self-serve podcast/ebook publishing end-to-end (show + episode; book upload).
- [ ] Admin: add a movie, upload a podcast cover / movie file / **album cover
      specifically** (was broken — depends on this phase's `music-covers` bucket
      migration being applied first), manage podcast episodes, review a content report
      and take one down, confirm the reported user/content owner gets notified.

**OS-level integration (needs a real device/browser, not headless Chrome):**
- [ ] Lock-screen media controls: start a song, lock the phone, confirm artwork/title/
      play-pause/next appear on the lock screen and a hardware/headset button controls
      playback (Chrome DevTools → Media panel can also show the session on desktop).
- [ ] Touch drag-to-reorder in the queue and in playlist/album track ordering — verify on
      an actual touchscreen, not a mouse-emulated one.
- [ ] Gapless playback across an album — listen for any silence gap between tracks.
- [ ] Kill network mid-track — confirm graceful buffering + recovery, not a hard stop.

**Device matrix (375 / 768 / 1440px):**
- [ ] Full visual pass at all three breakpoints across: Streams hub, music home, an
      artist page, an album page, a playlist page, the full-screen player, movies browse
      + detail + watch, ebooks browse + reader, podcasts browse + show + episode player,
      search results, and the Creator Dashboard.
- [ ] Scroll a 500+ song playlist and confirm it stays smooth (virtualization check) —
      `PlaylistPage.tsx` uses `@tanstack/react-virtual`, but this needs a playlist that
      large to actually exercise it; none of the seed data is that big.

**Production-environment re-checks (this sandbox can't reach them):**
- [ ] Re-run Lighthouse (`npx lighthouse https://<production-url>/streams --only-categories=accessibility,performance`)
      against the real Vercel deployment — the 32 perf score above was measured against a
      local static server, not the CDN-fronted production URL, and may look meaningfully
      different there.
- [ ] Share a song/album/artist/playlist/podcast/movie/ebook link in WhatsApp, X, and
      Facebook Messenger and confirm each renders a real OG preview card (the `middleware.ts`
      logic was read and looks correct for all seven entity types now, but was never
      exercised against a real crawler request).
- [ ] Re-run `node scripts/security_pentest_anon_writes.mjs` once Phase 13's two
      migrations are applied to production, per `PHASE_13_SECURITY_HARDENING.md`.
