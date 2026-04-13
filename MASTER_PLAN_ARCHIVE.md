# BARA AFRIKA — MASTER PLAN ARCHIVE

> **This file contains the full detail of completed Phases 1–14.** Preserved for historical reference. The active plan lives in `MASTER_PLAN.md`.
>
> Archived on: April 13, 2026

---

## DOCUMENT INDEX (Original)

| # | Document | File | Purpose | Status |
|---|----------|------|---------|--------|
| 1 | **Master Plan** | `MASTER_PLAN.md` | Single source of truth | Active |
| 2 | **DPO Compliance** | `compliance/` (10 files) | Rwanda Data Protection compliance | Active |

> **Note:** 74 obsolete `.md` files were removed on 2026-03-17. `STREAMS_SPORTS_BUILD_PLAN.md` was merged into this document on 2026-04-02.

---

## ORIGINAL WORKSTREAM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│  SPRINT 1 (Week 1)         SPRINT 2 (Week 2)                   │
│  Platform Foundation       Streams Overhaul                     │
│  SPRINT 3 (Week 3)         SPRINT 4 (Week 4)                   │
│  Sports + Mini-Apps        Polish & Compliance                  │
│  PENDING: User Profile decisions, BARA Coins full review        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: STABILIZE (Weeks 1–2) — ✅ COMPLETE (Feb 22, 2026)

| Priority | Task | Status | Notes |
|----------|------|--------|-------|
| P0 | Audit all public pages — fix crashes, dead links, broken buttons | ✅ Done | Fixed 7 dead buttons, added missing `/writeareview` route |
| P0 | Audit user dashboard — all nav links, forms, data loading | ✅ Done | Fixed 4 dead links, wired `UserDashboardHome` |
| P0 | Verify Resend API key + webhook + edge function deployed | ✅ Done | 7 email templates confirmed |
| P0 | Test all 8 existing email triggers end-to-end | ✅ Done | All paths verified |
| P0 | Fix email queue — update row status after send | ✅ Done | Added Supabase client to edge function |
| P1 | Fix dark-mode remnants in Streams pages | ✅ Done | Found in StreamsHome, ArtistPage, ArtistsPage |
| P1 | Fix mobile nav — hamburger menu items don't close after click | ✅ Done | Added setIsMenuOpen(false) |
| P2 | Remove console.log statements in production code | ✅ Done | Cleaned up 23 debug logs |

---

## Phase 2: HARDEN (Week 3) — ✅ COMPLETE (Feb 22, 2026)

| Priority | Task | Status | Notes |
|----------|------|--------|-------|
| P0 | Audit all Supabase RLS policies | ✅ Done | 11 tables had RLS disabled |
| P0 | Verify Clerk JWT → Supabase RLS integration | ✅ Done | JWT template `supabase` confirmed |
| P0 | Create migration: `20260222_rls_hardening.sql` | ✅ Done | |
| P1 | Rate limiting on public API routes | ☐ Deferred | Will revisit with Clerk rate limiting |
| P1 | Input sanitization audit — XSS prevention | ✅ Done | Added DOMPurify for blog HTML |

---

## Phase 3: ENRICH (Weeks 4–5) — ✅ COMPLETE (Feb 22, 2026)

| Priority | Task | Status |
|----------|------|--------|
| P0 | Gamification integration — hook coin/XP awards to real actions | ✅ Done |
| P0 | Daily missions system — 4 rotating daily tasks | ✅ Done |
| P1 | Streak tracking — login streak counter | ✅ Done |
| P1 | Spin wheel — daily chance to win coins | ✅ Done |
| P1 | Coin store — spend coins on themes, badges, boosts | ✅ Done |
| P1 | Leaderboard — top earners by XP, coins, streaks | ✅ Done |

---

## Phase 4: EXPAND (Weeks 5–6) — ✅ COMPLETE (Feb 22, 2026)

| Priority | Task | Status |
|----------|------|--------|
| P0 | Real-time messaging — inbox + chat | ✅ Done |
| P0 | Banner ad system — request + admin approval | ✅ Done |
| P1 | User profile themes — purchasable with coins | ✅ Done |
| P1 | Sports predictions — predict outcomes, earn coins | ✅ Done |
| P1 | Artist boost — spend coins to promote | ✅ Done |
| P2 | Ad-free browsing — purchasable perk | ✅ Done |

---

## Phase 5: LAUNCH PREP — ✅ COMPLETE (Feb 22, 2026)

| Task | Status |
|------|--------|
| Domain + DNS configuration | ✅ Done |
| Production environment variables | ✅ Done |
| Supabase production project setup | ✅ Done |
| SEO meta tags on all public pages | ✅ Done |
| Sitemap generation | ✅ Done |
| Social share cards (Open Graph) | ✅ Done |

---

## Phase 6: POST-LAUNCH MONITORING — ✅ COMPLETE (Feb 22, 2026)

| Task | Status |
|------|--------|
| Monitor error logs daily | ✅ Done |
| Supabase usage dashboard check | ✅ Done |
| User feedback collection mechanism | ✅ Done |

---

## Phase 7: DETAILED IMPLEMENTATION LOG

| # | Description | Priority | Sprint | Status |
|---|-------------|----------|--------|--------|
| 7.1 | **Header redesign** — New nav order. Mobile hamburger with Framer Motion slide-in | P0 | 1 | ✅ Done (Mar 1) |
| 7.2 | **Footer cleanup** — Moved "Advertise" and "Write a Review" to footer. Amazon-style sections | P0 | 1 | ✅ Done (Mar 1) |
| 7.3 | **Fix: Header + Footer icons and nav links** — Replaced dead ReactIcons with lucide-react. Fixed 4 broken nav links | P0 | 1 | ✅ Done (Mar 1) |
| 7.4 | **Streams: Dark→White theme** — All 12 Streams pages + layout + sidebar + GlobalPlayer converted | P0 | 2 | ✅ Done (Mar 1) |
| 7.5 | **Streams Hub** — `StreamsHub.tsx` landing page for `/streams` with cards for Music/Movies/Ebooks/Podcasts/Gaming | P0 | 2 | ✅ Done (Mar 1) |
| 7.6 | **BARA Sports infrastructure** — Full ESPN-style redesign: multi-sport support, live score ticker, admin pages | P0 | 3 | ✅ Done (Mar 1) |
| 7.7 | **Artist Page enhancements** — Customizable banner image, "Artist Picks" featured tracks | P1 | 2 | ✅ Done (Mar 1) |
| 7.8 | **BARA News** — Promoted to full mini-app at `/news`. RSS aggregation from African news sources | P1 | 3 | ✅ Done (Mar 1) |
| 7.9 | **BARA Global fixes** — Admin→user data display, maps replaced with photo gallery, expandable text | P0 | 3 | ✅ Done (Mar 1) |
| 7.10 | **BARA Listings fix** — All categories showing (removed `.slice(0,12)`), deduplication by slug | P0 | 3 | ✅ Done (Mar 1) |
| 7.11 | **BARA Events fixes** — Full flyer display (h-48→h-64), venue in grid, "Copy Link" share | P1 | 3 | ✅ Done (Mar 1) |
| 7.12 | **BARA Blog improvements** — Share buttons, like/heart button, category dropdown | P1 | 3 | ✅ Done (Mar 1) |
| 7.13 | **Footer redesign** — Amazon-style organized layout with sections | P1 | 1 | ✅ Done (Mar 1) |
| 7.14 | **Admin sidebar** — Clean sidebar navigation for all 30+ admin pages | P1 | 4 | ✅ Done (Mar 1) |
| 7.15 | **Admin Dashboard analytics** — Real-time stats: Songs, Artists, Playlists, Blog, Marketplace, News, Countries, Users, Gamification, Coins | P0 | 4 | ✅ Done (Mar 1) |
| 7.16 | **"Discover More on BARA"** — Reusable component added to Blog, Streams, Sports, Listings, Global, Dashboard | P1 | 1 | ✅ Done (Mar 1) |
| 7.17 | **Admin Songs — full CRUD** — Table with search+sort, create/edit form, file upload to Supabase Storage | P0 | 4 | ✅ Done (Mar 1) |
| 7.18 | **Admin Artists — full CRUD** — Table with search, image upload, genre, country, bio, verified toggle | P0 | 4 | ✅ Done (Mar 1) |
| 7.19 | **Admin Albums — full CRUD** — Table with search, cover art upload, song assignment UI | P0 | 4 | ✅ Done (Mar 1) |
| 7.20 | **Country defaults** — Country selector defaults to Rwanda, language to English | P0 | 1 | ✅ Done (Mar 1) |
| 7.21 | **Seed data** — 12 artists, 12 albums, 47 songs with genre, duration, cover art | P0 | 2 | ✅ Done (Mar 1) |
| 7.22 | **Mobile nav** — Bottom navigation bar: Home, Events, Streams, Marketplace, Profile | P0 | 1 | ✅ Done (Mar 2) |
| 7.23 | **BARA Global gallery** — Photo gallery replacing non-working maps | P0 | 3 | ✅ Done (Mar 2) |
| 7.24 | **Mega-menu** — Dropdown mega-menu for mini-apps navigation | P0 | 1 | ✅ Done (Mar 2) |
| 7.25 | **Admin Events Enhanced** — Full featured admin: list, create/edit, approve/reject/feature, attendees, CSV | P0 | 4 | ✅ Done (Mar 3) |
| 7.26 | **Admin Marketplace** — List with search/filter, approve/reject, seller info, bulk actions | P0 | 4 | ✅ Done (Mar 3) |
| 7.27 | **Admin Users** — User management: search, filter, edit role, suspend/reactivate | P0 | 4 | ✅ Done (Mar 3) |
| 7.28 | **Admin Country Info** — CRUD for BARA Global country entries | P0 | 4 | ✅ Done (Mar 3) |
| 7.29 | **Marketplace partner storefront** — `/marketplace/store/:slug` with banner, logo, trust badges, ads grid | P0 | 4 | ✅ Done (Mar 3) |
| 7.30 | **Marketplace: seller profile auto-creation** — Auto-create `marketplace_partners` row on first ad post | P0 | 4 | ✅ Done (Mar 3) |
| 7.31 | **Event RSVP** — Going/Interested buttons, attendee count, `event_rsvps` table | P1 | 4 | ✅ Done (Mar 3) |
| 7.32 | **Blog comments** — Threaded comments with reply, like, report | P1 | 4 | ✅ Done (Mar 3) |
| 7.33 | **DPO Compliance** — 10 files in `compliance/` directory | P1 | 4 | ✅ Done (Mar 4) |
| 7.34 | **BARA Gaming** — Placeholder at `/streams/gaming` | P2 | — | ✅ Done (Mar 4) |
| 7.35 | **RSS News fix** — HTML tag stripping in news content | P0 | 3 | ✅ Done (Mar 10) |
| 7.36 | **Marketplace favorites** — Heart/save button, `marketplace_favorites` table | P1 | — | ✅ Done (Mar 10) |
| 7.37 | **Admin Playlists** — CRUD with drag-to-reorder song selection | P0 | 4 | ✅ Done (Mar 10) |
| 7.38 | **Supabase: Edge Function deployment** — Fixed bundle size, deployed `send-email` | P0 | 4 | ✅ Done (Mar 10) |
| 7.39 | **Supabase: RLS policy audit round 2** — 6 more tables with missing policies | P0 | 5 | ✅ Done (Mar 17) |
| 7.40 | **Supabase: clerk_users sync** — Clerk webhook → Supabase upsert | P0 | 5 | ✅ Done (Mar 17) |
| 7.41 | **Supabase: user_missions PATCH 400** — Added missing columns + grants | P0 | 5 | ✅ Done (Mar 18) |
| 7.42 | **Clerk: Production keys** — Must switch to production keys before launch | P1 | Pre-launch | ☐ |
| 7.43 | **Streams Nav Tabs** — Sticky pill-style content-type tabs in StreamsLayout | P0 | 4 | ✅ Done (Mar 18) |
| 7.44 | **BARA Global: Map coordinates** — Maps center on stored coordinates | P0 | 6 | ✅ Done (Mar 18) |
| 7.45 | **BARA Global: People group gallery images** — Seeded cultural images for 6 entries | P0 | 6 | ✅ Done (Mar 18) |
| 7.46 | **Supabase: country_info 406 fixed** — Changed `.single()` to `.maybeSingle()` | P0 | 6 | ✅ Done (Mar 18) |
| 7.47 | **Streams: Music architecture** — `uploaded_by` and `upload_type` columns added | P0 | 6 | ✅ Done (Mar 18) |
| 7.48 | **Streams: Seed realistic dummy music** — 47 songs with real MP3 URLs and names | P0 | 6 | ✅ Done (Mar 18) |
| 7.49 | **Streams: Songs playback fix** — 3 root causes fixed in AudioPlayerContext | P0 | 7 | ✅ Done (Mar 31) |
| 7.50 | **Streams: Movies & Podcasts admin pages** — Need CRUD + dashboard metrics | P0 | 7 | ☐ |
| 7.51 | **Emails audit & setup** — Full audit of @baraafrika.com emails, SPF/DKIM/DMARC | P0 | 7 | ☐ |
| 7.52 | **Translation / i18n** — Google Translate widget, 18 languages | P1 | 7 | ✅ Done (Mar 31) |
| 7.53 | **Search genre cards — remove colors** — Neutral gray monochrome | P1 | — | ✅ Done (Mar 31) |
| 7.54 | **Films: Director, Producer, Writer, Actors display** | P1 | — | ✅ Done (Mar 31) |
| 7.55 | **Multi-artist credits** — ft. display, Featured On section, dashboard stats | P0 | — | ✅ Done (Mar 31) |
| 7.56 | **Music share link mobile visibility** | P1 | — | ✅ Done (Mar 31) |
| 7.57 | **BARA copyright fix** — "Bara" → "BARA" | P1 | — | ✅ Done (Mar 31) |
| 7.58 | **Home page BARA flip card redesign** — 3D flip with framer-motion | P1 | — | ✅ Done (Mar 31) |
| 7.59 | **Sports API — deferred** — api-sports.io Pro plan too expensive | P2 | — | ⏸️ Deferred |
| 7.60 | **Google Translate widget UI fix** | P1 | — | ✅ Done (Apr 2) |
| 7.61 | **Full-screen player redesign** — Portal-based, mobile-first, ambient glow | P1 | — | ✅ Done (Apr 3) |
| 7.62 | **song_artists RLS permissions fix** | P0 | — | ✅ Done (Apr 3) |
| 7.63 | **Producer & Songwriter pages** — New routes with credits/discography | P1 | — | ✅ Done (Apr 3) |
| 7.64 | **BARA Streams branding headers + featured artists display** | P1 | — | ✅ Done (Apr 3) |
| 7.65 | **Blog: Add 22 new categories** — Migration after deduplication | P0 | — | ✅ Done (Apr 5) |
| 7.66 | **Blog: Submission-only model** — Contributor guidelines page | P0 | — | ✅ Done (Apr 5) |
| 7.67 | **Streams Music: Freemium model** — Price column, purchased_songs table, 25s preview | P0 | — | ✅ Done (Apr 5) |
| 7.68 | **Streams Music: Freemium coin deduction** — Full purchase flow with GamificationService | P0 | — | ✅ Done (Apr 8) |

---

### Phase 7 — Sprint Checklists, Test Scripts & Build Plans

> The following sections contain the detailed sprint checklists (7A–7F), test account setup, test data seeding plans, manual test scripts, and build plans for podcasts, movies, ebooks. These were part of Sprint 7 planning (March 19, 2026) and Phase 8 (March 17, 2026).

<details>
<summary>7A. Platform-Wide Priorities (click to expand)</summary>

#### 0.1 Navigation Bar Redesign (P0)
| Task | Priority | Status |
|------|----------|--------|
| Redesign Header component with new nav order | P0 | ✅ Done (7.1) |
| Implement dropdown/mega-menu for mini-apps | P0 | ✅ Done (7.24) |
| Move "Advertise" and "Write a Review" to footer | P0 | ✅ Done (7.2) |
| Country selector — default to Rwanda | P0 | ✅ Done (7.20) |
| Language selector — default to English | P0 | ✅ Done (7.52) |
| Coins balance display in nav | P1 | ✅ Done (Phase 3) |
| Profile icon/link in nav | P1 | ✅ Done (7.1) |
| Mobile nav — clean hamburger or bottom tabs | P0 | ✅ Done (7.1) |
| Test on mobile, tablet, laptop, desktop | P0 | ☐ |

#### 0.2 Cross-Device UI Testing (P0)
| Task | Priority | Status |
|------|----------|--------|
| Establish device test matrix | P0 | ☐ |
| Test every page on mobile viewport (375px) | P0 | ☐ |
| Test every page on tablet viewport (768px) | P0 | ☐ |
| Test every page on desktop viewport (1440px) | P0 | ☐ |
| Fix: Admin side content cut off on smaller devices | P0 | ☐ |
| Fix: User side content cut off depending on device | P0 | ☐ |

#### 0.3 "Discover More on BARA" (P1) ✅ DONE
| Task | Status |
|------|--------|
| Verify `DiscoverMore.tsx` exists and is reusable | ✅ Done (7.16) |
| Add to all major pages | ✅ Done (7.16) |
| `exclude` prop hides current section | ✅ Done |

#### 0.4 Footer Cleanup (P1) ✅ DONE
| Task | Status |
|------|--------|
| Restructure footer (About, Mini-Apps, Support, Legal) | ✅ Done (7.13) |
| Move "Advertise" + "Write a Review" to footer | ✅ Done (7.2) |

#### 0.5 Home Page — BARA Tile Flip (P1) ✅ DONE
| Task | Status |
|------|--------|
| 3D flip animation on main BARA tile | ✅ Done (7.58) |

</details>

<details>
<summary>7B. BARA Streams — Redesign (click to expand)</summary>

#### 1.0 Theme Change: Dark → White (P0) ✅ DONE
#### 1.1 Streams Hub Homepage (P0) ✅ DONE
#### 1.2 Artist Page Enhancements (P1) ✅ DONE

#### 1.3 Mimic Spotify Functionality (P1)
| Task | Priority | Status |
|------|----------|--------|
| Smooth page transitions | P2 | ☐ |
| "Now Playing" full-screen view on mobile | P1 | ☐ |
| Queue management UI | P2 | ☐ |
| Hover-to-play on song cards | P2 | ☐ |
| Song progress in mini-player | P0 | ✅ Exists |
| Volume control in player | P1 | ☐ |

#### 1.4 Seed Data (P0) ✅ DONE
#### 1.5 Storage Buckets (P0)
| Task | Status |
|------|--------|
| Verify `audio-files` and `cover-art` buckets exist | ☐ |
| Create buckets + RLS policies if missing | ☐ |
| Test upload from UploadSongPage | ☐ |

</details>

<details>
<summary>7C. BARA Sports — Testing & Fixes (click to expand)</summary>

#### Sports Infrastructure — ⏸️ DEFERRED (Mar 31)
> api-sports.io requires Pro plan ($10/mo minimum). Revisit when platform has revenue.

| Task | Priority | Status |
|------|----------|--------|
| Verify `VITE_API_FOOTBALL_KEY` is active | P0 | ⏸️ Deferred |
| Verify sports tables exist | P0 | ☐ |
| Seed sample sports news | P1 | ☐ |
| "API suspended" fallback UI | P0 | ☐ |
| `/admin/sports` — dashboard renders | P0 | ☐ |
| `/admin/sports/news` — CRUD works | P0 | ☐ |
| `/admin/sports/videos` — CRUD works | P0 | ☐ |

</details>

<details>
<summary>7D. Other Platform Items (click to expand)</summary>

- BARA News ✅ DONE (7.8)
- BARA Global Fixes ✅ DONE (7.9, 7.23, 7.45)
- BARA Listings ✅ DONE (7.10)
- BARA Events Fixes ✅ DONE (7.11)
- BARA Blog ✅ DONE (7.12)
- Admin Dashboard Analytics ✅ DONE (7.15)
- **User Profile** — Needs Team Decision (public/opt-in/private, follow system)

</details>

<details>
<summary>7E. BARA Coins / Gamification — Needs Team Meeting (click to expand)</summary>

**What exists:** Coin balance ✅, Daily missions ✅, Leaderboard ✅, Coin Store ✅, Spin wheel ✅, Profile themes ✅, Sports predictions ✅, Artist boost ✅, Ad-free browsing ✅

| Topic | Current State | Meeting Direction |
|-------|--------------|-------------------|
| Earn | XP + Coins from daily missions, login streak, spin wheel | Review earn rates |
| Share | Not implemented | Can users send coins? |
| Redeem | Coin Store has packages, boosts, themes, ad-free | Needs tier-based rewards |
| Leaderboard | XP/Coins/Streak tabs | Add time filters |
| Direct Purchase | Currently grants free coins | Needs payment integration |

**⚠️ ACTION: Schedule dedicated BARA Coins meeting.**

</details>

<details>
<summary>7F. Emails & DPO Compliance (click to expand)</summary>

#### Emails (7.51)
| Task | Priority | Status |
|------|----------|--------|
| Audit current Resend "from" address | P1 | ☐ |
| List all email addresses BARA needs | P1 | ☐ |
| Confirm domain DNS for Resend | P0 | ☐ |

#### DPO Compliance (7.33) — Gaps
| # | Gap | Fix |
|---|-----|-----|
| D1 | Privacy Policy doesn't mention api-sports.io | Add to vendor list |
| D2 | No mention of sports predictions / coin betting data | Add to "Content you submit" |
| D3 | DPO Submission Pack has placeholder fields | Manual |
| D4 | No Data Flow Diagram (DFD) | Create DFD |
| D5 | Retention periods not defined for play_history, sports_predictions | Add retention policy |

</details>

### Phase 7 — Files Reference

<details>
<summary>Key files affected by Phase 7 work (click to expand)</summary>

**Streams Pages (13 files):** StreamsHome, ArtistPage, ArtistsPage, ArtistDashboard, ArtistVerificationPage, CreateAlbumPage, LibraryPage, LikedSongsPage, NewReleasesPage, PlaylistPage, PodcastsPage, TrendingSongsPage, UploadSongPage

**Sports Pages (11 files):** SportsHome, SportsScores, SportsSchedule, SportsStats, SportsTeams, SportsNewsList, SportsNewsDetail, SportsPredictions, MatchCenter, TeamPage, LeagueTablePage

**Key Platform Files:** Header.tsx, Footer.tsx, DiscoverMore.tsx, StreamsLayout.tsx, StreamsSidebar.tsx, AudioPlayerContext.tsx, GoogleTranslate.tsx, sportsApi.ts

**DPO Compliance:** 10 files in `compliance/`

</details>

---

## SPRINT 7: TEST DATA & SCRIPTS — March 19, 2026

### S7.1 Test Accounts Setup
| Account | Email | Role |
|---------|-------|------|
| Test Artist | mathiasngongngai@gmail.com | Verified Artist |
| Test User 1 | mathiasngongbi@gmail.com | Regular User |
| Test User 2 | mathiasjunior@gmail.com | Regular User |

### S7.2 Music / Streams — Test Data Seeding
Target: 12 artists, 12 albums, 60 songs, 5 platform playlists, 50 play history entries, 10 liked songs.

### S7.3 Music / Streams — Manual Test Script (35 checks)
Covers: Basic Playback (9), Queue & Albums (5), Playlists (5), Likes & History (5), Recommendations (3), Artist Pages (5), Gamification (3).

### S7.4 Sports — Test Script (17 checks)
Covers: Sports Home (4), Scores & Fixtures (4), Sports News (3), Admin Sports (3), Edge Cases (3).

### S7.5 Podcasts — Build Plan
DB tables: `podcasts`, `podcast_episodes`, `podcast_subscriptions`, `podcast_listen_history`. 6 podcasts × 5 episodes = 30 episodes. Admin page + PodcastsPage update needed.

### S7.6 Movies — Build Plan
DB tables: `movies`, `movie_categories`, `movie_watchlist`. 10 movies, 6 categories. Admin page + MoviesPage update needed.

### S7.7 Cross-Cutting Test Checklist (12 checks)
Anonymous + authenticated rendering, responsive tests, console errors, network errors, GlobalPlayer overlap, navigation, admin dashboard counts, gamification, landing page tiles, RSS News.

### S7.8 Implementation Order
1. Seed music test data → 2. Fix song playback → 3. Wire Daily Mix → 4. Podcast DB + seed → 5. Update PodcastsPage → 6. Movie DB + seed → 7. Update MoviesPage → 8. Admin pages → 9. Dashboard metrics → 10. Verify Sports API → 11. Run full test script → 12. Fix failures

---

## PHASE 8: TESTING, COINS DESIGN & QA — March 17, 2026

### 8.1 Test Accounts & Real-Life Testing
Same 3 accounts as S7.1. SQL migrations needed for seed data.

### 8.2 QA Testing Process (Mandatory Before Every Push)
1. Build check (`npm run build`) → 2. Browser preview → 3. Click-through test → 4. Screenshot review → 5. Mobile check (375px) → 6. Console check → 7. Cross-page check → 8. Edge cases

### 8.3 BARA Coins System Design (Engineer's Proposal)

**Earning:**
| Action | Coins | Frequency |
|--------|-------|-----------|
| Daily login | 5 | Daily |
| Listen to a song | 1 | Per song (max 20/day) |
| Complete a playlist | 10 | Per playlist |
| Share content | 3 | Per share (max 10/day) |
| Write a blog post | 15 | Per post |
| Create an event | 10 | Per event |
| Leave a review | 5 | Per review |
| Refer a friend | 50 | Per referral |
| 7-day streak | 25 | Weekly bonus |
| 30-day streak | 100 | Monthly bonus |
| Complete daily missions (all 4) | 20 | Daily bonus |
| First marketplace purchase | 30 | One-time |
| Verify artist account | 100 | One-time |

**Spending:**
| Item | Cost |
|------|------|
| Custom profile badge | 50-200 |
| Profile theme/color | 100 |
| Highlight ad (7 days) | 150 |
| Featured event slot | 200 |
| Ad-free browsing (30 days) | 500 |
| Exclusive content access | 50-300 |
| Gift coins to another user | Any |
| Redeem for cash (min 1000) | 1000 = $1 |

**Engagement:** Leaderboard, Prestige tiers (Bronze→Diamond), Streak protection, Seasonal challenges, Direct purchase ($1 = 1000 coins).

> ⏳ This proposal needs team discussion.

### 8.4 BARA Movies — Full Implementation Plan
Phase A (Data Layer) → Phase B (UI & Features) → Phase C (Content Pipeline)

### 8.5 BARA Ebooks — Full Implementation Plan
Phase A (Data Layer) → Phase B (UI & Features) → Phase C (Content Pipeline)

### 8.6 User Profiles Clarification
Recommendation: Private by default, opt-in public. No DMs initially — Phase 9 feature. Following artists already implemented; following users later.

---

## PHASE 9: PLATFORM MATURITY & CREATOR ECONOMY — March 23, 2026

### 9.1 Song/Track Ownership — Link Every Track to an Account
| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.1.1 | Add `user_id` to `artists` table | P0 | ☐ |
| 9.1.2 | Admin songs auto-set `uploaded_by` | P0 | ☐ |
| 9.1.3 | Admin artists "Link to User Account" field | P1 | ☐ |
| 9.1.4 | Creator Portal auto-link | P0 | ☐ |
| 9.1.5 | Ownership badge display | P2 | ☐ |
| 9.1.6 | DB CHECK constraint — no ownerless songs | P1 | ☐ |

### 9.2 Universal File Upload — No URL Inputs for Media
**Rule: ALL media across ALL admin pages must use file upload to Supabase Storage.**

| # | Task | Page | Priority | Status |
|---|------|------|----------|--------|
| 9.2.1 | Movies poster & backdrop | AdminMovies | P0 | ☐ |
| 9.2.2 | Movies trailer upload | AdminMovies | P0 | ☐ |
| 9.2.3 | Movies full movie upload | AdminMovies | P0 | ☐ |
| 9.2.4 | Podcasts cover image | AdminPodcasts | P0 | ☐ |
| 9.2.5 | Podcasts episode audio | AdminPodcasts | P0 | ☐ |
| 9.2.6 | Ebooks cover + file | AdminEbooks | P0 | ☐ |
| 9.2.7 | Blog post images audit | AdminBlogEditor | P1 | ☐ |
| 9.2.8 | Events flyer audit | AdminEventsEnhanced | P1 | ☐ |
| 9.2.9 | Artists profile image | AdminArtists | P1 | ☐ |
| 9.2.10 | Albums cover art | AdminAlbums | P1 | ☐ |
| 9.2.11 | Country Info gallery | AdminCountryInfo | P2 | ☐ |

### 9.3 Country & Language Dropdowns
| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.3.1 | Shared `COUNTRIES` constant | P1 | ☐ |
| 9.3.2 | Shared `LANGUAGES` constant | P1 | ☐ |
| 9.3.3–9.3.7 | Convert all admin forms to dropdowns | P1-P2 | ☐ |

### 9.4 Sports — Full Team, League & Tournament Management
Admin pages (9.4.1–9.4.6), DB tables (teams, leagues, tournaments, fixtures, players), Fan features (9.4.7–9.4.16). See original MASTER_PLAN for full detail.

### 9.5 Admin Ebooks Page
| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.5.1 | Create AdminEbooks.tsx | P0 | ☐ |
| 9.5.2 | CRUD for ebooks | P0 | ☐ |
| 9.5.3 | Category management | P1 | ☐ |
| 9.5.4 | Feature/unfeature, free/paid toggle | P1 | ☐ |
| 9.5.5 | Dashboard metrics | P1 | ☐ |
| 9.5.6 | Storage bucket `ebooks` | P0 | ☐ |
| 9.5.7 | Create DB tables if needed | P0 | ☐ |

### 9.6 User Dashboard — Creator Management
Sections: My Music (9.6.1), My Podcasts (9.6.2), My Ebooks (9.6.3), Creator Analytics (9.6.4, paid plan), Revenue Dashboard (9.6.5). Free & Paid content model: Music 15%, Podcasts 15%, Ebooks 20% commission.

### 9.7 Search Optimization
Music search (9.7.1), Podcast search (9.7.2), Ebook search (9.7.3), Unified Streams search (9.7.4), Search suggestions (9.7.5), Empty state (9.7.6).

### 9.8 Event Flyer Image Display — A4/Portrait Optimization
Change EventCard from `h-72` to `aspect-[3/4]` (9.8.1–9.8.4).

### 9.9 User Dashboard — Missing Features
My Playlists (9.9.2), My Blog Posts (9.9.3), My Reviews (9.9.4), Notification Center (9.9.5), Saved/Favorites (9.9.6), Activity Feed (9.9.7), Account Settings (9.9.8), Support/Help (9.9.9), Referral Stats (9.9.10).

### 9.10 Translation / i18n
Options: Weglot (~€15-49/mo), i18next+DeepL ($0-6/mo), AI batch translate (free), Crowdin ($0-40/mo), Keep Google Translate (free). Current: Option E (English default + Google Translate). Recommended next: Option C (AI bulk translate).

### 9.11 Implementation Priority
Batch 1: File upload, AdminEbooks, Track ownership, Dropdowns → Batch 2: Creator dashboard, Search → Batch 3: Sports admin + fan features → Batch 4: Event flyer, Dashboard features, Translation.

---

## PHASE 10 — BLOG, ADMIN UX & PLATFORM POLISH (April 6, 2026)

### 10.1 Blog — "Write Your Article" Button ✅ DONE
### 10.2 Admin Blog — Sidebar Disappears ✅ DONE
### 10.3 Admin Blog — UI & Status Fixes ✅ DONE
### 10.4 Likes & Saves — Connect to User Dashboard
- [x] Saved Articles tab
- [x] Marketplace Favorites tab
- [ ] Blog post likes — needs `blog_post_likes` DB table
- [ ] Event saves — needs `event_bookmarks` table
- [ ] Business listing saves — needs `listing_bookmarks` table

### 10.5 Bara Coins — Richer Navbar Dropdown ✅ DONE
### 10.6 Blog Submission — DB Migration ✅ DONE
### 10.7 User Blog Management ✅ DONE
### 10.8 Admin Blog — Default Filter Fix ✅ DONE

---

## PHASE 11 — MARKETPLACE PARTNER & TRUST OVERHAUL (April 6, 2026)

### 11.1 Data Layer ✅ DONE
Migration `marketplace_phase11_partner_and_trust.sql` — partners, members, ratings, leads, offers, saved searches tables.

### 11.2 Terminology Rename ✅ DONE
"listing" → "ad" in all user-facing text. 26 files updated.

### 11.3 Trust Infrastructure ✅ DONE
Verification badges, star ratings, response time, storefront links, lead recording, Make-an-Offer.

### 11.4 Partner Storefront Page ✅ DONE
### 11.5 Saved Searches ✅ DONE

### 11.6 Remaining Work (Backlog)
- [ ] Card grid trust badges
- [ ] Partner dashboard (`/marketplace/partner/dashboard`)
- [ ] Admin verification console
- [ ] Bulk CSV upload
- [ ] Lead inbox UI
- [ ] Seller ratings UI
- [ ] Saved searches management
- [ ] Email alerts cron for saved searches
- [ ] Response-time computation
- [ ] Video ad support
- [ ] Slug-based ad URLs
- [ ] Fraud detection rules
- [ ] Storefront editor + discoverability (13.6) ✅ DONE
- [ ] Report This Ad admin (13.8) ✅ DONE

---

## Phase 11.7 — Marketplace Structural Refactor (PLANNED, awaiting sign-off)

### 11.7.1 SQL Migrations (blocking)
- [ ] `marketplace_phase11_7_lead_types.sql` — lead_type enum, meta jsonb, seen_at, responded_at
- [ ] `marketplace_phase11_7_partner_verification.sql` — verification doc/review fields

### 11.7.2 Extract Shared Listing Primitives
Keep 11 distinct detail pages. Extract shared components: LeadRecorder, ContactActionButtons, SellerTrustCard, ListingGallery, OfferModal, ShareButton, RelatedListings, ListingBreadcrumbs, ViewCounter.

### 11.7.3 Category-Specific Primary CTAs
property → Request Viewing, motors → Book Test Drive, jobs → Apply Now, services → Book Appointment.

### 11.7.4 Seller Partner Dashboard
Tabs: Storefront editor, Leads inbox, Offers inbox, Team.

### 11.7.5 Admin Marketplace Tabs
Partners, Leads, Offers, Bulk Upload.

### 11.7.6 Posting Form Unification
Port logic from PostListing.tsx into CategoryPostForm.tsx. Delete PostListing.tsx (2,446 LOC removed).

---

## Phase 12 — Universal Share & Dynamic OG Previews (DONE, April 9, 2026)

### 12.1 ShareContext + ShareDialog ✅ DONE
### 12.2 Vercel Edge Middleware for OG tags ✅ DONE
### 12.3 Movies & Ebooks Detail Pages ✅ DONE
### 12.3.1 Events 1000-row Limit Fix ✅ DONE
### 12.4 Marketplace Lead/Offer NOT NULL Fixes ✅ DONE
### 12.5 Navigation Link Additions ✅ DONE

---

## Phase 13 — Events Performance, Marketplace UX & Terminology (April 10, 2026)

### 13.1 Events Server-Side Pagination (P0) ✅ DONE
### 13.2 Category-Aware Post Form (P0) — PARTIAL ✅
- [x] Category-specific value field + image requirements
- [ ] Category-specific required fields prominence
- [ ] Use CategoryPostForm as single posting form (delete PostListing.tsx)

### 13.3 Category-Specific Detail Page Feature Parity (P0) ✅ DONE
### 13.4 Terminology "listing" → "ad" (P1) ✅ DONE
### 13.5 Post-Creation Email Improvement (P1) ✅ DONE
### 13.6 Storefront Discoverability + Editing (P1) ✅ DONE
### 13.7 Favorites Discoverability (P1) — PARTIAL ✅
- [x] Heart icon in marketplace header
- [ ] Favorites count badge
- [ ] "My Favorites" link in user dashboard

### 13.8 Reactive Moderation Model (P1) ✅ DONE
### 13.9 Mark as Sold (P2) ✅ DONE

---

## Phase 14 — Marketplace Deep Features (COMPLETE, April 11, 2026)

### 14.1 Category Pricing Thoroughness (P0) ✅
### 14.2 Sign-In vs Sign-Up UX (P0) ✅
### 14.3 Storefront Brand Naming Clarity (P1) ✅
### 14.4 Country Selection Simplification (P1) ✅
### 14.5 Multi-Variant Listings (P1) ✅
### 14.6 Real-Time Purchase Confirmation (P1) ✅
### 14.7 Shopping Cart (P2) ✅
### 14.8 Comments & Ratings on Marketplace Items (P2) ✅
### 14.9 Bug Fix Round (April 12, 2026) ✅
RLS policies, storefront slug, variant UX, pricing options, post notice, seller name search, duplicate Properties, test ads seed, i18n English default.

---

## ORIGINAL CHANGELOG

*Master Plan created: Feb 22, 2026*
*Updated: March 23, 2026 — Phase 9 added.*
*Updated: March 31, 2026 — Items 7.49, 7.52–7.58 completed. Sports API deferred.*
*Updated: April 2, 2026 — Merged STREAMS_SPORTS_BUILD_PLAN.md into this document.*
*Updated: April 6, 2026 — Phase 10 added (10.1–10.8). Open items summary added.*
*Updated: April 8, 2026 — Item 7.68 added (music freemium coin deduction).*
*Updated: April 6, 2026 — Phase 11 added (marketplace partner & trust overhaul).*
*Updated: April 9, 2026 — Universal ShareDialog + Vercel Edge middleware for OG previews.*
*Updated: April 9, 2026 — Phase 12 documented. Phase 11.7 added.*
*Updated: April 10, 2026 — Marketplace listing→ad rename (26 files). Events 1000-row fix.*
*Updated: April 10, 2026 — Phase 13 added. All 7 tasks completed.*
*Updated: April 10, 2026 (late) — Phase 14 PLANNED: 8 marketplace deep features.*
*Updated: April 11, 2026 — Phase 14 COMPLETE. Admin events bulk actions. Instagram link.*
*Updated: April 12, 2026 — Phase 14.9 bug fix round.*

---

*End of Archive — For active work, see `MASTER_PLAN.md`*
