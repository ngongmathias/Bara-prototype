# BARA PLATFORM — SPORTS & STREAMS AUDIT PLAN

> **Purpose:** Deep audit of the Sports and Streams (Music) mini-applications to ensure all pages render correctly, data flows from APIs/Supabase, playback works, navigation is seamless, and all interactive elements function.
>
> **Referenced by:** `MASTER_PLAN.md`
>
> **Phase 1 Status:** ✅ SMOKE TEST COMPLETE (Feb 22, 2026) — All routes verified, data fetching solid. Known gap: no `/sports/news/:id` detail page (falls through to SportsHome).

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture)
2. [Streams (Music) Audit](#2-streams)
3. [Sports Audit](#3-sports)
4. [Shared Components Audit](#4-shared)
5. [Admin Panel Audit](#5-admin)
6. [Database & API Audit](#6-database)
7. [Known Issues to Investigate](#7-known-issues)

---

## 1. ARCHITECTURE OVERVIEW {#1-architecture}

### Streams (Music) Stack

| Layer | Files |
|-------|-------|
| **Pages** | `src/pages/streams/StreamsHome.tsx`, `ArtistPage.tsx`, `ArtistsPage.tsx`, `PlaylistPage.tsx`, `TrendingSongsPage.tsx`, `NewReleasesPage.tsx`, `LikedSongsPage.tsx`, `LibraryPage.tsx`, `ArtistDashboard.tsx`, `PodcastsPage.tsx` |
| **Layout** | `src/components/streams/StreamsLayout.tsx`, `StreamsSidebar.tsx` |
| **Audio Player** | `src/context/AudioPlayerContext.tsx` (global audio context) |
| **Database** | Supabase tables: `artists`, `songs`, `albums`, `playlists`, `user_song_likes`, `user_interactions` |
| **Admin** | `src/pages/admin/streams/AdminStreamsDashboard.tsx`, `AdminArtists.tsx`, `AdminSongs.tsx`, `AdminAlbums.tsx` |
| **Migration** | `supabase/migrations/20260221_streams_core_schema.sql`, `20240219_streams_user_interactions.sql`, `20260219_fix_streams_permissions.sql` |

### Sports Stack

| Layer | Files |
|-------|-------|
| **Pages** | `src/pages/sports/SportsHome.tsx`, `SportsScores.tsx`, `MatchCenter.tsx`, `TeamPage.tsx`, `LeagueTablePage.tsx`, `SportsSchedule.tsx`, `SportsStats.tsx`, `SportsTeams.tsx` |
| **Components** | `src/components/sports/SportsSubNav.tsx`, `SportsTopBanner.tsx`, `SponsorshipBanner.tsx` |
| **Config** | `src/config/sportsConfig.ts` (defines Football, NBA, NFL, Cricket, MMA, Tennis, F1) |
| **API** | External sports APIs (api-sports.io or similar) |
| **Admin** | `src/pages/admin/sports/AdminSportsDashboard.tsx`, `AdminSportsNews.tsx`, `AdminSportsVideos.tsx` |
| **Migration** | `supabase/migrations/20260221_sports_content_schema.sql` |

---

## 2. STREAMS (MUSIC) AUDIT {#2-streams}

### 2.1 Streams Home Page

| # | Check | File | Status |
|---|-------|------|--------|
| 2.1.1 | Page renders without errors | `StreamsHome.tsx` | ☐ |
| 2.1.2 | Streams layout wraps page (sidebar + main content) | `StreamsLayout.tsx` | ☐ |
| 2.1.3 | Featured/hero section displays | | ☐ |
| 2.1.4 | Trending songs section loads from Supabase | | ☐ |
| 2.1.5 | New releases section loads | | ☐ |
| 2.1.6 | Featured artists section loads | | ☐ |
| 2.1.7 | Genre/category filters work | | ☐ |
| 2.1.8 | Song card — clicking plays the song | | ☐ |
| 2.1.9 | Song card — play count displays | | ☐ |
| 2.1.10 | Song card — like/heart button works | | ☐ |
| 2.1.11 | "View All" links navigate to correct pages | | ☐ |

### 2.2 Audio Player (Global)

| # | Check | File | Status |
|---|-------|------|--------|
| 2.2.1 | Player bar renders at bottom of screen when song selected | `AudioPlayerContext.tsx` | ☐ |
| 2.2.2 | Play/pause button works | | ☐ |
| 2.2.3 | Progress bar shows current position | | ☐ |
| 2.2.4 | Progress bar — seeking (click to jump) works | | ☐ |
| 2.2.5 | Volume control works | | ☐ |
| 2.2.6 | Next/previous track buttons work | | ☐ |
| 2.2.7 | Shuffle toggle works | | ☐ |
| 2.2.8 | Repeat toggle works (off → repeat all → repeat one) | | ☐ |
| 2.2.9 | Song info (title, artist, artwork) displays in player | | ☐ |
| 2.2.10 | Player persists across page navigation | | ☐ |
| 2.2.11 | Audio continues playing when navigating to other pages | | ☐ |
| 2.2.12 | Player handles missing/broken audio URLs gracefully | | ☐ |
| 2.2.13 | Mobile — player is usable on small screens | | ☐ |

### 2.3 Artist Pages

| # | Check | File | Status |
|---|-------|------|--------|
| 2.3.1 | `/streams/artists` — artists list renders | `ArtistsPage.tsx` | ☐ |
| 2.3.2 | Artists list — loads from Supabase | | ☐ |
| 2.3.3 | Artists list — search/filter works | | ☐ |
| 2.3.4 | `/streams/artist/:id` — individual artist page loads | `ArtistPage.tsx` | ☐ |
| 2.3.5 | Artist page — bio/info displays | | ☐ |
| 2.3.6 | Artist page — songs list loads | | ☐ |
| 2.3.7 | Artist page — albums list loads | | ☐ |
| 2.3.8 | Artist page — play all button works | | ☐ |
| 2.3.9 | Artist page — follow/unfollow button works | | ☐ |
| 2.3.10 | Artist page — verified badge displays for verified artists | | ☐ |

### 2.4 Playlist Page

| # | Check | File | Status |
|---|-------|------|--------|
| 2.4.1 | `/streams/playlist/:id` — page renders | `PlaylistPage.tsx` | ☐ |
| 2.4.2 | Playlist — songs load in order | | ☐ |
| 2.4.3 | Playlist — play all button works | | ☐ |
| 2.4.4 | Playlist — individual song click plays that song | | ☐ |
| 2.4.5 | Playlist — total duration/track count displays | | ☐ |

### 2.5 Browse Pages

| # | Check | File | Status |
|---|-------|------|--------|
| 2.5.1 | `/streams/trending` — trending songs load | `TrendingSongsPage.tsx` | ☐ |
| 2.5.2 | `/streams/new-releases` — new releases load | `NewReleasesPage.tsx` | ☐ |
| 2.5.3 | `/streams/search` — search returns songs/artists | `SearchPage.tsx` | ☐ |
| 2.5.4 | `/streams/podcasts` — podcasts page renders | `PodcastsPage.tsx` | ☐ |
| 2.5.5 | Podcasts — episode list loads | | ☐ |
| 2.5.6 | Podcasts — play episode works | | ☐ |

### 2.6 User Library (Auth Required)

| # | Check | File | Status |
|---|-------|------|--------|
| 2.6.1 | `/streams/liked` — liked songs load (auth guard works) | `LikedSongsPage.tsx` | ☐ |
| 2.6.2 | Liked songs — play individual song works | | ☐ |
| 2.6.3 | Liked songs — unlike removes from list | | ☐ |
| 2.6.4 | `/streams/library` — library page renders (auth guard works) | `LibraryPage.tsx` | ☐ |
| 2.6.5 | Library — playlists, recently played, downloads sections display | | ☐ |

### 2.7 Creator Portal / Artist Dashboard (Auth Required)

| # | Check | File | Status |
|---|-------|------|--------|
| 2.7.1 | `/streams/creator` — page renders (auth guard works) | `ArtistDashboard.tsx` | ☐ |
| 2.7.2 | Dashboard — upload track form renders | | ☐ |
| 2.7.3 | Dashboard — upload track with audio file + cover art works | | ☐ |
| 2.7.4 | Dashboard — uploaded track appears in "My Tracks" list | | ☐ |
| 2.7.5 | Dashboard — play count, like count stats display | | ☐ |
| 2.7.6 | Dashboard — "Boost Now (50 Coins)" button works | | ☐ |
| 2.7.7 | Dashboard — boost deducts coins via GamificationService | | ☐ |
| 2.7.8 | Dashboard — boost tracked via MonetizationService | | ☐ |
| 2.7.9 | Dashboard — "Bara Stream Verification" card displays | | ☐ |
| 2.7.10 | Dashboard — edit track metadata works | | ☐ |
| 2.7.11 | Dashboard — delete track works | | ☐ |

### 2.8 Streams Sidebar & Layout

| # | Check | File | Status |
|---|-------|------|--------|
| 2.8.1 | Sidebar renders with navigation links | `StreamsSidebar.tsx` | ☐ |
| 2.8.2 | Sidebar — Home, Trending, New Releases, Artists links work | | ☐ |
| 2.8.3 | Sidebar — Liked Songs, Library links work (auth required) | | ☐ |
| 2.8.4 | Sidebar — Creator Portal link works | | ☐ |
| 2.8.5 | Sidebar — active link highlighting correct | | ☐ |
| 2.8.6 | Sidebar — collapses on mobile | | ☐ |
| 2.8.7 | Layout — main content scrolls independently of sidebar | | ☐ |
| 2.8.8 | Layout — player bar doesn't overlap content | | ☐ |

---

## 3. SPORTS AUDIT {#3-sports}

### 3.1 Sports Home Page

| # | Check | File | Status |
|---|-------|------|--------|
| 3.1.1 | `/sports` — page renders (defaults to football) | `SportsHome.tsx` | ☐ |
| 3.1.2 | `/sports/:sport` — switches to correct sport (football, nba, nfl, etc.) | | ☐ |
| 3.1.3 | Sports sub-navigation renders with correct tabs for each sport | `SportsSubNav.tsx` | ☐ |
| 3.1.4 | Sub-nav — sport links (Football, NBA, NFL, Cricket, etc.) switch pages | | ☐ |
| 3.1.5 | Sub-nav — hover dropdown shows leagues/teams for each sport | | ☐ |
| 3.1.6 | Sub-nav — league links navigate to table pages | | ☐ |
| 3.1.7 | Sub-nav — team links navigate to team pages | | ☐ |
| 3.1.8 | Home page — live scores section loads (if API active) | | ☐ |
| 3.1.9 | Home page — news section loads (from Supabase or RSS) | | ☐ |
| 3.1.10 | Home page — featured matches display | | ☐ |
| 3.1.11 | Top banner renders | `SportsTopBanner.tsx` | ☐ |
| 3.1.12 | Sponsorship banner renders (if configured) | `SponsorshipBanner.tsx` | ☐ |

### 3.2 Scores Page

| # | Check | File | Status |
|---|-------|------|--------|
| 3.2.1 | `/sports/scores` and `/sports/:sport/scores` — renders | `SportsScores.tsx` | ☐ |
| 3.2.2 | Live scores load from API | | ☐ |
| 3.2.3 | Score cards show teams, scores, match status | | ☐ |
| 3.2.4 | Date picker/filter works | | ☐ |
| 3.2.5 | League filter works | | ☐ |
| 3.2.6 | Clicking a match → navigates to match center | | ☐ |
| 3.2.7 | Auto-refresh for live matches (if implemented) | | ☐ |
| 3.2.8 | Empty state when no matches on selected date | | ☐ |

### 3.3 Match Center

| # | Check | File | Status |
|---|-------|------|--------|
| 3.3.1 | `/sports/game/:id` and `/sports/match/:id` — renders | `MatchCenter.tsx` | ☐ |
| 3.3.2 | Match header — teams, scores, status display | | ☐ |
| 3.3.3 | Match timeline/events (goals, cards, subs) display | | ☐ |
| 3.3.4 | Lineups tab — both team lineups display | | ☐ |
| 3.3.5 | Statistics tab — match stats display | | ☐ |
| 3.3.6 | H2H tab — head-to-head history displays | | ☐ |
| 3.3.7 | Team logos load correctly | | ☐ |
| 3.3.8 | Back navigation works | | ☐ |
| 3.3.9 | Invalid match ID — shows error, not crash | | ☐ |

### 3.4 League Table Page

| # | Check | File | Status |
|---|-------|------|--------|
| 3.4.1 | `/sports/table/:id` and `/sports/:sport/table/:id` — renders | `LeagueTablePage.tsx` | ☐ |
| 3.4.2 | Table loads standings from API | | ☐ |
| 3.4.3 | Columns: position, team, played, won, drawn, lost, GD, points | | ☐ |
| 3.4.4 | Team names clickable → navigate to team page | | ☐ |
| 3.4.5 | Season selector (if present) works | | ☐ |
| 3.4.6 | Mobile — table scrolls horizontally | | ☐ |

### 3.5 Team Page

| # | Check | File | Status |
|---|-------|------|--------|
| 3.5.1 | `/sports/team/:id` and `/sports/:sport/team/:id` — renders | `TeamPage.tsx` | ☐ |
| 3.5.2 | Team info (name, logo, country, stadium) displays | | ☐ |
| 3.5.3 | Squad/roster loads | | ☐ |
| 3.5.4 | Upcoming fixtures load | | ☐ |
| 3.5.5 | Recent results load | | ☐ |
| 3.5.6 | Team stats display | | ☐ |

### 3.6 Schedule & Fixtures

| # | Check | File | Status |
|---|-------|------|--------|
| 3.6.1 | `/sports/:sport/schedule` — renders | `SportsSchedule.tsx` | ☐ |
| 3.6.2 | `/sports/:sport/fixtures` — renders (alias for scores) | | ☐ |
| 3.6.3 | Fixtures load by date | | ☐ |
| 3.6.4 | Date navigation (prev/next day) works | | ☐ |

### 3.7 Stats & Teams Pages

| # | Check | File | Status |
|---|-------|------|--------|
| 3.7.1 | `/sports/:sport/stats` — renders | `SportsStats.tsx` | ☐ |
| 3.7.2 | Stats — player stats load | | ☐ |
| 3.7.3 | Stats — top scorers, assists, cards display | | ☐ |
| 3.7.4 | `/sports/:sport/teams` — renders | `SportsTeams.tsx` | ☐ |
| 3.7.5 | Teams — team list loads for selected league | | ☐ |
| 3.7.6 | Teams — clicking team → navigates to team page | | ☐ |

### 3.8 Sport-Specific Routes (All 7 Sports)

Verify each configured sport in `sportsConfig.ts` works:

| Sport | Slug | API ID | Home Works | Scores Works | Standings Work | Status |
|-------|------|--------|-----------|-------------|---------------|--------|
| Football | `football` | `football` | ☐ | ☐ | ☐ | ☐ |
| NBA | `nba` | `basketball` | ☐ | ☐ | ☐ | ☐ |
| NFL | `nfl` | `american-football` | ☐ | ☐ | ☐ | ☐ |
| Cricket | `cricket` | `cricket` | ☐ | ☐ | ☐ | ☐ |
| MMA | `mma` | `mma` | ☐ | ☐ | ☐ | ☐ |
| Tennis | `tennis` | `tennis` | ☐ | ☐ | ☐ | ☐ |
| F1 | `f1` | `formula-1` | ☐ | ☐ | ☐ | ☐ |

### 3.9 Fallback Routes

| # | Check | Status |
|---|-------|--------|
| 3.9.1 | `/sports/*` fallback → SportsHome (not 404) | ☐ |
| 3.9.2 | `/sports/:sport/transfers` → SportsHome (placeholder) | ☐ |
| 3.9.3 | `/sports/:sport/leagues` → SportsHome (placeholder) | ☐ |
| 3.9.4 | All placeholder routes in App.tsx render without crash | ☐ |

---

## 4. SHARED COMPONENTS AUDIT {#4-shared}

### 4.1 Sports Components

| # | Check | File | Status |
|---|-------|------|--------|
| 4.1.1 | `SportsSubNav` — sticky positioning works | `SportsSubNav.tsx` | ☐ |
| 4.1.2 | `SportsSubNav` — dropdown menus open on hover, close on mouse leave | | ☐ |
| 4.1.3 | `SportsSubNav` — league logos load from api-sports.io | | ☐ |
| 4.1.4 | `SportsTopBanner` — renders correctly | `SportsTopBanner.tsx` | ☐ |
| 4.1.5 | `SponsorshipBanner` — displays sponsored content | `SponsorshipBanner.tsx` | ☐ |

### 4.2 Streams Components

| # | Check | File | Status |
|---|-------|------|--------|
| 4.2.1 | `StreamsLayout` — wraps all streams pages | `StreamsLayout.tsx` | ☐ |
| 4.2.2 | `StreamsSidebar` — navigation links correct | `StreamsSidebar.tsx` | ☐ |
| 4.2.3 | `AudioPlayerContext` — provides play/pause/queue functions to all children | `AudioPlayerContext.tsx` | ☐ |

---

## 5. ADMIN PANEL AUDIT {#5-admin}

### 5.1 Streams Admin

| # | Check | File | Status |
|---|-------|------|--------|
| 5.1.1 | `/admin/streams` — dashboard renders with stats | `AdminStreamsDashboard.tsx` | ☐ |
| 5.1.2 | Dashboard — total artists, songs, albums, plays count | | ☐ |
| 5.1.3 | `/admin/streams/artists` — artist list renders | `AdminArtists.tsx` | ☐ |
| 5.1.4 | Artists — create new artist works | | ☐ |
| 5.1.5 | Artists — edit artist works | | ☐ |
| 5.1.6 | Artists — delete artist works | | ☐ |
| 5.1.7 | Artists — toggle verified status works | | ☐ |
| 5.1.8 | `/admin/streams/songs` — songs list renders | `AdminSongs.tsx` | ☐ |
| 5.1.9 | Songs — upload new song (audio file + metadata) works | | ☐ |
| 5.1.10 | Songs — edit song metadata works | | ☐ |
| 5.1.11 | Songs — delete song works | | ☐ |
| 5.1.12 | Songs — assign to artist works | | ☐ |
| 5.1.13 | Songs — assign to album works | | ☐ |
| 5.1.14 | `/admin/streams/albums` — album list renders | `AdminAlbums.tsx` | ☐ |
| 5.1.15 | Albums — create, edit, delete works | | ☐ |

### 5.2 Sports Admin

| # | Check | File | Status |
|---|-------|------|--------|
| 5.2.1 | `/admin/sports` — dashboard renders | `AdminSportsDashboard.tsx` | ☐ |
| 5.2.2 | Dashboard — overview stats display | | ☐ |
| 5.2.3 | `/admin/sports/news` — news list renders | `AdminSportsNews.tsx` | ☐ |
| 5.2.4 | News — create, edit, delete articles | | ☐ |
| 5.2.5 | News — articles appear on sports pages | | ☐ |
| 5.2.6 | `/admin/sports/videos` — videos list renders | `AdminSportsVideos.tsx` | ☐ |
| 5.2.7 | Videos — create, edit, delete works | | ☐ |

---

## 6. DATABASE & API AUDIT {#6-database}

### 6.1 Streams Database

| # | Check | Status |
|---|-------|--------|
| 6.1.1 | `artists` table — exists, RLS policies correct | ☐ |
| 6.1.2 | `songs` table — exists, has audio_url, cover_art_url columns | ☐ |
| 6.1.3 | `albums` table — exists with proper relations | ☐ |
| 6.1.4 | `playlists` table — exists | ☐ |
| 6.1.5 | `user_song_likes` table — exists, RLS allows user to like/unlike | ☐ |
| 6.1.6 | `user_interactions` table — tracks plays | ☐ |
| 6.1.7 | Storage bucket for audio files exists and has correct policies | ☐ |
| 6.1.8 | Storage bucket for cover art exists | ☐ |
| 6.1.9 | Seed data — at least 5-10 songs exist for demo | ☐ |
| 6.1.10 | Seed data — at least 3-5 artists exist for demo | ☐ |

### 6.2 Sports Database & API

| # | Check | Status |
|---|-------|--------|
| 6.2.1 | `sports_content` schema applied | ☐ |
| 6.2.2 | Sports news table — exists | ☐ |
| 6.2.3 | Sports videos table — exists | ☐ |
| 6.2.4 | External API key configured (api-sports.io or equivalent) | ☐ |
| 6.2.5 | API rate limits — handled gracefully (not crashing on 429) | ☐ |
| 6.2.6 | API fallback — shows cached/stored data when API is down | ☐ |
| 6.2.7 | API responses — team logos, league logos loading from CDN | ☐ |

---

## 7. KNOWN ISSUES TO INVESTIGATE {#7-known-issues}

### Streams

| # | Potential Issue | Priority | Status |
|---|----------------|----------|--------|
| 7.1 | Audio playback may not work if songs are stored as external URLs that require CORS | P0 | ☐ |
| 7.2 | Audio player context may lose state on hard page refresh | P1 | ☐ |
| 7.3 | Like count may not update in real-time without subscription | P2 | ☐ |
| 7.4 | Creator dashboard — uploaded track may not appear immediately (cache) | P2 | ☐ |
| 7.5 | Podcast page — may be placeholder with no real data source | P1 | ☐ |
| 7.6 | No queue management UI (add to queue, reorder) | P2 | ☐ |
| 7.7 | Mobile — player may overlap footer or bottom content | P1 | ☐ |
| 7.8 | Streams pages don't use the main Header — verify standalone navigation works | P1 | ☐ |

### Sports

| # | Potential Issue | Priority | Status |
|---|----------------|----------|--------|
| 7.9 | API key may be expired or rate-limited — pages show empty data | P0 | ☐ |
| 7.10 | Many sport routes are placeholder (map to `SportsHome`) — user confusion | P1 | ☐ |
| 7.11 | Sport-specific nav items (transfers, rankings, draft) have no real pages | P1 | ☐ |
| 7.12 | MMA, Tennis, F1, Cricket may have no API integration yet | P1 | ☐ |
| 7.13 | League table — NBA uses divisions/conferences, not simple table | P2 | ☐ |
| 7.14 | Match center — may not work for non-football sports | P1 | ☐ |
| 7.15 | Sports sub-nav — may overflow on mobile with many sports | P2 | ☐ |
| 7.16 | `TestSportsApi.tsx` — test page may be accessible in production | P3 | ☐ |

---

## EXECUTION ORDER

1. **Phase 1 — Smoke Test:** Load every page in each section, check for crashes/blank screens
2. **Phase 2 — Data Flow:** Verify Supabase data loads, API calls succeed, audio plays
3. **Phase 3 — Interactions:** Test every button, link, filter, search, player control
4. **Phase 4 — Edge Cases:** Empty states, error handling, missing data, broken URLs
5. **Phase 5 — Admin:** Verify all admin CRUD operations for streams and sports content
6. **Phase 6 — Mobile:** Test responsive layouts and touch interactions

---

*Document created: Feb 22, 2026*
*For Bara Afrika Platform*
