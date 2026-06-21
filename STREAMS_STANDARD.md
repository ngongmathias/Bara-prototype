# BARA STREAMS — Spotify-Grade Standard & Audit

> The bar: BARA Streams (music) should feel like a 2025 top-tier streaming app
> (Spotify / Apple Music / YouTube Music / Audiomack) in **functionality** and
> **interaction quality**, expressed through BARA's design system
> (**black / white / grey only**, Comfortaa headings, Roboto body, Apple+Stripe
> calm). This doc defines what that means, how to verify it, and where we stand.
>
> Legend: ✅ done · 🟡 partial · ❌ missing · ⬜ verify (needs device/manual test)

---

## PART A — THE STANDARD (what "Spotify-grade" means)

### Functionality

| # | Capability | Bar to clear |
|---|-----------|--------------|
| F1 | **Playback engine** | Instant play, accurate seek, shuffle/repeat-one/repeat-all, variable speed; **gapless** between tracks; optional **crossfade**; loudness **normalization**; resilient to network errors (retry, skip dead track, clear buffering states) |
| F2 | **OS / device integration** | **Media Session API**: lock-screen + notification + hardware-key controls, artwork, position state; uninterrupted **background audio**; (stretch) cast/"Connect to device" |
| F3 | **Queue** | See now-playing + up-next; **drag-to-reorder**; **remove**; **clear**; **add-to-queue** & **play-next** from any song; autoplay/"continue listening" when queue ends; play history |
| F4 | **Search** | **Instant typeahead** as you type; scoped results (Top / Songs / Artists / Albums / Playlists); **typo tolerance**; **recent searches**; rich, never-blank "no results" state |
| F5 | **Library** | Liked Songs; playlists (create / edit / reorder / **collaborative**); followed artists; **saved albums**; recently played; (stretch) **offline downloads** |
| F6 | **Discovery / personalization** | Personalized Home; **named daily mixes** ("Made for You"); **Release Radar**; genre/mood browse; **radio / infinite autoplay** from any song/artist; "Fans also like" |
| F7 | **Now Playing** | Immersive full-screen + persistent mini-player; **time-synced lyrics** (karaoke); queue/up-next; go-to-artist / go-to-album; one-tap **share card** with art |
| F8 | **Social** | Follow artists & users; collaborative playlists; share with **rich link previews (OG)**; (stretch) friend/activity feed |
| F9 | **Creator** | Verified badges everywhere the artist name appears; artist pages; creator dashboard + analytics; upload (audio/cover/lyrics); album creation; claim/verify flow |
| F10 | **Engagement** | Listening stats; achievements; **notifications for new releases** from followed artists; weekly recap |

### Design / UX

| # | Dimension | Bar to clear |
|---|-----------|--------------|
| D1 | **Visual system** | Strict black/white/grey; one consistent card system, type scale, spacing rhythm; dark, focused player surface; no stray accent colours |
| D2 | **Motion** | Route transitions; press (`active:scale`) + hover affordances on every control; **skeleton** loaders (never spinners-only); scroll-reveal; playing equalizer micro-interaction |
| D3 | **Responsive** | Mobile-first 375px → desktop two-column Now Playing; touch targets ≥ 44px; bottom-sheet/drawer patterns on mobile; mobile bottom-nav |
| D4 | **States** | Distinct loading / empty (with helpful CTA) / error (graceful, no white screen) / offline states everywhere |
| D5 | **Accessibility** | Full keyboard control + visible focus rings; ARIA on icon-only buttons; WCAG-AA contrast; honours `prefers-reduced-motion` |
| D6 | **Performance** | Lazy images; **route code-split** for /streams; **virtualised** long track lists; fast first interaction; no audio jank on navigation |

---

## PART B — HOW TO VERIFY (acceptance checks)

- **Playback (F1):** play an album end-to-end — no silence gap between tracks (gapless); kill network mid-track → graceful buffering + recovery; toggle speed/shuffle/repeat and confirm behaviour.
- **OS integration (F2):** start a song, lock the phone → artwork + title + play/pause/next on the lock screen; press a hardware/headset play button → it controls BARA. (Chrome devtools → "Media" panel shows the session.)
- **Queue (F3):** open queue → drag a track to reorder (persists); remove a track; clear queue; "Add to queue"/"Play next" from a song's context menu lands correctly; let queue run out → autoplay continues.
- **Search (F4):** type "maty" → results appear within ~150ms, grouped; type a typo ("amapaino") → still finds Amapiano; focus empty search → recent searches; nonsense query → helpful "no results".
- **Library (F5):** like a song → appears in Liked instantly and persists across reload/device; create playlist, add songs, reorder; follow artist → shows in library.
- **Discovery (F6):** Home shows personalised rows; open a daily mix; "Start radio" from a song → infinite, coherent queue.
- **Now Playing (F7):** open full-screen → lyrics scroll in time with playback; share → preview card renders in WhatsApp/X.
- **Design/States (D1–D4):** grep for non-grey Tailwind colour classes (must be zero); throttle network → skeletons; empty library/playlist → CTA; force a fetch error → toast, not blank.
- **A11y/Perf (D5–D6):** tab through the player (focus visible, all reachable); Lighthouse on /streams ≥ 90 a11y, ≥ 70 perf; scroll a 500-song playlist → smooth (virtualised).

---

## PART C — CURRENT-STATE AUDIT (2026-06-20)

### Functionality

| # | Status | Notes (files) |
|---|--------|---------------|
| F1 Playback | 🟡 | Solid basics in `AudioPlayerContext` (play/seek/shuffle/repeat/rate/sleep-timer, error+timeout handling). **Missing: gapless, crossfade, loudness normalization.** |
| F2 OS integration | ✅ | **Media Session API wired** (`AudioPlayerContext`): metadata + artwork, play/pause/next/prev/seek action handlers (via ref, never stale), playbackState, and lock-screen position state. Cast/"Connect to device" remains a stretch. |
| F3 Queue | ✅ | `QueueDrawer` rebuilt: real **drag-to-reorder**, per-track **remove**, **clear**, now-playing + up-next. Context gained `removeFromQueue`/`reorderQueue`/`clearQueue` (index-safe). Add-to-queue / play-next already in `SongContextMenu`. Contrast bug fixed (clean light drawer). Mobile touch-drag is a later polish. |
| F4 Search | ✅ | Dedicated `MusicSearchPage` at `/streams/search`: instant debounced typeahead, results grouped (Songs / Artists / Albums / Playlists), recent searches (localStorage), rich no-results state. **Typo tolerance** via `search_songs` pg_trgm RPC (graceful ILIKE fallback if the migration isn't applied). |
| F5 Library | 🟡 | Liked ✅, playlists + collaborative ✅, recently played ✅, follow-artist ✅. **No saved-albums, no offline.** |
| F6 Discovery | ✅ | Personalised Home ✅, Release Radar ✅, genre browse ✅, "Fans also like" ✅, radio/infinite autoplay ✅, **named daily mixes ✅ (new — `buildDailyMixes` clusters listening history by top genres + top artist into titled "Daily Mix N" cards on the home, click to play)**. |
| F7 Now Playing | ✅ | `FullScreenPlayer` is strong (immersive, grey ambient, queue, go-to-artist/album, share). **Time-synced (karaoke) lyrics ✅ (new — `parseLyrics` reads LRC-style `[mm:ss]`/`[mm:ss.xx]` tags, highlights + auto-scrolls the active line off `progress`, tap a line to seek, "SYNCED" badge; gracefully falls back to plain `<pre>` text when a song has no timestamps).** |
| F8 Social | 🟡 | Follow ✅, collaborative playlists ✅, share ✅, OG previews ✅. **No activity feed.** |
| F9 Creator | ✅ | Verified badges (new), artist pages, dashboard+analytics, upload (audio/cover/lyrics), album creation. Claim/verify 🟡. |
| F10 Engagement | ✅ | Listening stats ✅, achievements ✅, **new-release notifications ✅ (new — `tr_notify_new_song` trigger fans a `new_song_from_artist` notification to followers via user_follows + user_artist_follows; resilient + anti-spam guarded; surfaces live via the existing bell/realtime)**. Weekly recap still pending. |

### Design / UX

| # | Status | Notes |
|---|--------|-------|
| D1 Visual system | ✅ | Streams is now **strictly black/white/grey** (verified: zero colour classes in `src/{pages,components}/streams`). Consistent cards/type. |
| D2 Motion | ✅ | Framer route transitions, press/hover states, skeletons, scroll-reveal, equalizer animation. |
| D3 Responsive | ⬜ | Desktop two-column Now Playing ✅; **needs real 375/768/1440 device pass**; mobile bottom-nav for Streams not confirmed. |
| D4 States | 🟡 | Loading/empty/error mostly present; **QueueDrawer contrast bug**; offline state absent. |
| D5 Accessibility | 🟡 | Keyboard shortcuts ✅ + ARIA on many buttons; **full keyboard/focus/contrast/reduced-motion pass not done.** |
| D6 Performance | 🟡 | Lazy images ✅; **route code-split ✅ (all `/streams` pages are `React.lazy` behind a `<Suspense>` boundary — each builds as its own on-demand chunk)**; **long-list virtualisation ✅ for the canonical long lists (LikedSongsPage + PlaylistPage use `useWindowVirtualizer`)**. Remaining: device-matrix pass, possibly virtualise ArtistPage discography / search results. |

---

## PART D — PRIORITISED GAP ROADMAP (to reach the bar)

**Tier 1 — makes it feel like a real app (do first)**
1. ~~**Media Session API** (F2)~~ ✅ **Done Jun 20** — lock-screen/notification/hardware controls + artwork + position state in `AudioPlayerContext`.
2. ~~**Finish the Queue** (F3)~~ ✅ **Done Jun 20** — drag-to-reorder, remove, clear; contrast fixed; add-to-queue/play-next already in the context menu.
3. ~~**Dedicated music Search** (F4)~~ ✅ **Done Jun 20** — instant typeahead, grouped results, recent searches, typo tolerance (pg_trgm RPC + ILIKE fallback). **Tier 1 complete.**

**Tier 2 — depth & stickiness**
4. ~~**Radio / infinite autoplay** (F6)~~ ✅ **Done Jun 21** — `startRadio` (genre+artist seed, infinite auto-extend); entry points in song context menu + ArtistPage. ← Tier 2 started
5. ~~**Named daily mixes** (F6)~~ ✅ **Done Jun 21** — `buildDailyMixes` builds titled mixes from history (top genres + top artist) on the music home.
6. ~~**New-release notifications** from followed artists (F10)~~ ✅ **Done Jun 21** — `tr_notify_new_song` trigger (`20260621_new_release_notifications.sql`). Apply in SQL Editor.
7. ~~**Time-synced lyrics** (F7)~~ ✅ **Done Jun 21** — `parseLyrics` parses LRC `[mm:ss]` tags in `FullScreenPlayer`; active line highlights + auto-scrolls off `progress` (respects reduced-motion), tap-to-seek, "SYNCED" badge; plain-text fallback intact. Upload form documents the optional format. **Tier 2 complete.**

**Tier 3 — polish & scale**
8. **Gapless + crossfade + normalization** (F1).
9. **Saved albums** + **offline/PWA** (F5).
10. **Performance**: ~~code-split /streams~~ ✅ **Done Jun 21** (all pages `React.lazy` + `<Suspense>`), ~~virtualise long lists~~ ✅ **Done Jun 21** (`useWindowVirtualizer` on LikedSongsPage + PlaylistPage via `@tanstack/react-virtual`); **a11y pass** + **device matrix pass** (D3/D5/D6) still pending.

---

*Maintained alongside MASTER_PLAN Phase 17 / 25.2.3. Update statuses as items land.*
