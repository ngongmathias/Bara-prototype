# BARA AFRIKA — FULL PLATFORM BUILD, TEST & DPO PLAN

**Created:** 2026-03-17
**Updated:** 2026-03-31 (incorporates team meeting notes from March 1, 2026 + Mar 31 sprint work)
**Scope:** Streams, Sports, platform-wide UX changes, gamification review, cross-device testing, DPO compliance.

---

## TEAM MEETING REMARKS — March 1, 2026

> **Developer overall feedback: "Back end is SOLID!"**

The following directives come directly from the March 1 meeting. Every item below is mapped to an actionable work item in the plan.

---

## PHASE 0: PLATFORM-WIDE PRIORITIES (From Meeting — Do First)

These are cross-cutting changes that affect every page and must be done before deep-diving into individual mini-apps.

### 0.1 Navigation Bar Redesign (P0) ⚡ TEAM PRIORITY
**Current:** Cluttered top nav with various items.
**Required order:** BARA Global, BARA Events, BARA Streams, BARA Listings, BARA Marketplace, BARA Sports, BARA Blog, BARA Communities, BARA Tools, Language, Profile, Coins
**Additional:**
- Move "Advertise" and "Write a Review" to footer/site map area (About BARA)
- Only keep in nav: Mini-Apps, Language, Country, Coins, Profile
- Country defaults to Rwanda
- Language defaults to English
- **Reference: WeChat interface** for clean, minimal nav

| Task | Priority | Status |
|------|----------|--------|
| Redesign Header component with new nav order | P0 | ☐ |
| Implement dropdown/mega-menu for mini-apps | P0 | ☐ |
| Move "Advertise" and "Write a Review" to footer | P0 | ☐ |
| Country selector — default to Rwanda | P0 | ☐ |
| Language selector — default to English | P0 | ☐ |
| Coins balance display in nav (existing — verify) | P1 | ☐ |
| Profile icon/link in nav | P1 | ☐ |
| Mobile nav — clean hamburger or bottom tabs | P0 | ☐ |
| Test on mobile, tablet, laptop, desktop | P0 | ☐ |

### 0.2 Cross-Device UI Testing (P0) ⚡ TEAM PRIORITY
> **"Testing is a HUGE deal, let's be thorough and communicate regularly about testing"**

| Task | Priority | Status |
|------|----------|--------|
| Establish device test matrix (iPhone, Android, iPad, laptop, desktop) | P0 | ☐ |
| Test every page on mobile viewport (375px) | P0 | ☐ |
| Test every page on tablet viewport (768px) | P0 | ☐ |
| Test every page on desktop viewport (1440px) | P0 | ☐ |
| Fix: Admin side content getting cut off on smaller devices | P0 | ☐ |
| Fix: User side content getting cut off depending on device | P0 | ☐ |
| Document all device-specific bugs found | P0 | ☐ |

### 0.3 "Discover More on BARA" — Platform-Wide (P1)
> **"This prompted navigation should be on each page, towards the bottom"**

Currently exists on Events and Marketplace pages. Must be added to ALL pages.

| Task | Priority | Status |
|------|----------|--------|
| Verify `DiscoverMore.tsx` component exists and is reusable | P0 | ☐ |
| Add to: Blog pages | P1 | ☐ |
| Add to: Streams pages | P1 | ☐ |
| Add to: Sports pages | P1 | ☐ |
| Add to: Listings pages | P1 | ☐ |
| Add to: BARA Global pages | P1 | ☐ |
| Add to: User Dashboard | P2 | ☐ |
| Ensure `exclude` prop hides the current section | P1 | ☐ |

### 0.4 Footer Cleanup (P1)
> **"This area is a bit messy... give relevant feedback to improve navigation and engagement — reference Amazon page"**

| Task | Priority | Status |
|------|----------|--------|
| Restructure footer with clear sections (About, Mini-Apps, Support, Legal) | P1 | ☐ |
| Move "Advertise With Us" to footer | P0 | ☐ |
| Move "Write a Review" link to footer | P0 | ☐ |
| Add all mini-app links to footer | P1 | ☐ |
| Amazon-style organized footer layout | P1 | ☐ |

### 0.5 Home Page — BARA Tile Flip (P1) ✅ DONE (Mar 31)
> **"BARA Main Tile should be interactive — when clicked, it flips and shows the meaning of Bara"**

| Task | Priority | Status |
|------|----------|--------|
| Add CSS 3D flip animation to main BARA tile on homepage | P1 | ✅ Done |
| Front: Language meanings grid (Swahili, Hausa, Yoruba, Amharic, Zulu, Arabic) | P1 | ✅ Done |
| Back: unified BARA message — "The Swahili word for continent, mainland..." + "One land \| One people \| One future" | P1 | ✅ Done |
| Click to flip, click again to flip back | P1 | ✅ Done |

---

## PHASE 1: BARA STREAMS — MAJOR REDESIGN (From Meeting)

### 1.0 Theme Change: Dark → White (P0) ⚡ TEAM PRIORITY
> **"Make theme white as the rest of the site"**

Currently all Streams pages use dark Spotify-style theme (`bg-[#121212]`, white text). Must switch to white/light theme matching the rest of the platform.

| Task | Priority | Status |
|------|----------|--------|
| Update `StreamsLayout.tsx` — remove dark background | P0 | ☐ |
| Update `StreamsSidebar.tsx` — light theme | P0 | ☐ |
| Update `StreamsHome.tsx` — white background, dark text | P0 | ☐ |
| Update `ArtistsPage.tsx` — white theme | P0 | ☐ |
| Update `ArtistPage.tsx` — white theme | P0 | ☐ |
| Update `TrendingSongsPage.tsx` — white theme | P0 | ☐ |
| Update `NewReleasesPage.tsx` — white theme | P0 | ☐ |
| Update `LikedSongsPage.tsx` — white theme (keep gradient accent) | P0 | ☐ |
| Update `LibraryPage.tsx` — white theme | P0 | ☐ |
| Update `PlaylistPage.tsx` — white theme | P0 | ☐ |
| Update `PodcastsPage.tsx` — white theme | P0 | ☐ |
| Update `ArtistDashboard.tsx` — white theme | P0 | ☐ |
| Update `UploadSongPage.tsx` — white theme | P0 | ☐ |
| Update Audio Player bar — white theme with accent colors | P0 | ☐ |
| Test: ensure all text is readable on white background | P0 | ☐ |

### 1.1 Streams Hub Homepage (P0) ⚡ NEW
> **"Homepage to choose type of stream (Music, Movies, Ebooks, Podcast, Gaming, etc)"**

The current StreamsHome goes straight to music. Need a hub page first.

| Task | Priority | Status |
|------|----------|--------|
| Create `StreamsHub.tsx` — landing page with category cards | P0 | ☐ |
| Categories: Music, Movies, Ebooks, Podcast, Gaming (+ more TBD) | P0 | ☐ |
| Music card → current StreamsHome (renamed to `StreamsMusicHome.tsx`) | P0 | ☐ |
| Movies card → placeholder "Coming Soon" page | P1 | ☐ |
| Ebooks card → placeholder "Coming Soon" page | P1 | ☐ |
| Podcast card → existing PodcastsPage | P1 | ☐ |
| Gaming card → placeholder "Coming Soon" page | P1 | ☐ |
| Update routes: `/streams` → StreamsHub, `/streams/music` → StreamsMusicHome | P0 | ☐ |
| Each category has distinct icon/visual | P1 | ☐ |

### 1.2 Artist Page Enhancements (P1) ⚡ NEW
> **"Add an Artist customized banner area"**
> **"Add Artist picks so we see what the artist likes and wants to highlight"**

| Task | Priority | Status |
|------|----------|--------|
| Add customizable banner image to artist profile (DB column + upload) | P1 | ☐ |
| Display banner at top of `/streams/artist/:id` page | P1 | ☐ |
| Add "Artist Picks" section — songs/albums the artist wants to highlight | P1 | ☐ |
| Add `artist_picks` table or JSON column to store picks | P1 | ☐ |
| Admin/Creator can set banner and picks | P2 | ☐ |

### 1.3 Mimic Spotify Functionality (P1)
> **"Mimic Spotify functionality closer on all points"**

| Task | Priority | Status |
|------|----------|--------|
| Smooth page transitions between Streams pages | P2 | ☐ |
| "Now Playing" full-screen view on mobile | P1 | ☐ |
| Queue management UI (view queue, reorder, remove) | P2 | ☐ |
| Hover-to-play on song cards | P2 | ☐ |
| Song progress in mini-player | P0 | ☐ — Exists |
| Volume control in player | P1 | ☐ |

### 1.4 Seed Data (P0)
Without seed data, every Streams page shows empty.

| Task | Status |
|------|--------|
| Seed 5-8 African artists with images + banner images | ☐ |
| Seed 2-3 albums per artist | ☐ |
| Seed 3-5 songs per album with real/sample audio URLs | ☐ |
| Seed some "Artist Picks" data | ☐ |
| Verify songs appear on StreamsHome, TrendingSongsPage, NewReleasesPage | ☐ |

### 1.5 Storage Buckets (P0)
| Task | Status |
|------|--------|
| Verify `audio-files` bucket exists in Supabase Storage | ☐ |
| Verify `cover-art` bucket exists in Supabase Storage | ☐ |
| Create buckets + RLS policies if missing | ☐ |
| Test upload from UploadSongPage | ☐ |

### 1.6 Streams Page-by-Page Testing
*(Same detailed checklists as before — Audio Player, Artists, Playlists, Browse, Library, Creator Portal, Layout/Sidebar — all still apply, but now on WHITE theme)*

| Section | # Tests | Priority |
|---------|---------|----------|
| StreamsHub (new) | 5 | P0 |
| StreamsMusicHome | 10 | P0 |
| Audio Player (Global) | 14 | P0 |
| Artists Pages | 8 + 2 new (banner, picks) | P0 |
| Playlist Pages | 6 | P0 |
| Browse Pages | 4 | P1 |
| User Library | 6 | P0 |
| Creator Portal | 10 | P1 |
| Layout & Sidebar | 5 | P0 |

---

## PHASE 2: BARA SPORTS — TESTING & FIXES

### 2.1 Sports Infrastructure — ⏸️ DEFERRED (Mar 31)
> **Note:** api-sports.io requires Pro plan ($10/mo minimum) for live data. Too expensive for current stage. Sports page works with Supabase-backed content (manual news/videos). Revisit when platform has revenue.

| Task | Priority | Status |
|------|----------|--------|
| Verify `VITE_API_FOOTBALL_KEY` is set and active | P0 | ⏸️ Deferred |
| Verify `sports_news` table exists in production | P0 | ☐ |
| Verify `sports_videos` table exists | P1 | ☐ |
| Verify `sports_predictions` table exists | P1 | ☐ |
| Create missing tables if needed | P0 | ☐ |
| Seed 5-10 sample sports news articles | P1 | ☐ |
| If API expired: add "API suspended" fallback UI on all pages | P0 | ☐ |

### 2.2 Sports Page-by-Page Testing
| Section | Key Tests | Priority |
|---------|-----------|----------|
| SportsHome (`/sports`, `/sports/:sport`) | Renders, sport switching, news/videos load | P0 |
| Scores (`/sports/scores`) | Date picker, fixtures load, match cards | P0 |
| Schedule (`/sports/:sport/schedule`) | Date tabs, grouped fixtures | P0 |
| Stats (`/sports/:sport/stats`) | League filter, top scorers | P1 |
| Teams (`/sports/:sport/teams`) | Team list, search, navigation | P1 |
| News (`/sports/news`) | Article list, detail page, sharing | P0 |
| Predictions (`/sports/predictions`) | Auth guard, betting flow, leaderboard | P1 |
| All 8 sport slugs | Football, Athletics, NBA, NFL, Cricket, MMA, Tennis, F1 | P1 |
| Fallback routes | Unknown paths → SportsHome | P0 |

### 2.3 Sports Admin
| Task | Priority | Status |
|------|----------|--------|
| `/admin/sports` — dashboard renders | P0 | ☐ |
| `/admin/sports/news` — CRUD works | P0 | ☐ |
| `/admin/sports/videos` — CRUD works | P0 | ☐ |
| Articles from admin appear on user-facing pages | P1 | ☐ |

---

## PHASE 3: OTHER PLATFORM ITEMS (From Meeting)

### 3.1 BARA News — Mini-App (P1) ⚡ NEW
> **"BARA News should be a mini-app like the rest and have its own tab"**
> **"RSS feed should NOT have HTML display — check for all countries"**

| Task | Priority | Status |
|------|----------|--------|
| Promote BARA News to full mini-app with own route (`/news`) | P1 | ☐ |
| Add "BARA News" tab in navigation | P1 | ☐ |
| Fix RSS feed stripping — remove raw HTML from all country feeds | P0 | ☐ |
| Test RSS display for every country that has news configured | P0 | ☐ |

### 3.2 BARA Global Fixes (P0)
> **"Not seeing ALL info from Admin to User side... screen cuts some bits off"**
> **"Map feature NOT working on people group pages — remove maps entirely"**
> **"Country about info limited by characters — add Read More dropdown"**

| Task | Priority | Status |
|------|----------|--------|
| Fix admin→user data display — all content visible on all devices | P0 | ☐ |
| Remove ALL map components from people group pages | P0 | ☐ |
| Replace maps with image gallery (uploadable images + descriptions) | P1 | ☐ |
| Country "About" info: add "Read More" expandable text (no character truncation) | P0 | ☐ |
| Add more searchable terms within country text content | P1 | ☐ |

### 3.3 BARA Listings (P0)
> **"All Categories are not showing... adjust and make sure no repeat categories"**

| Task | Priority | Status |
|------|----------|--------|
| Audit all marketplace categories — ensure none are missing | P0 | ☐ |
| Remove any duplicate categories | P0 | ☐ |
| Test category navigation end-to-end | P0 | ☐ |

### 3.4 BARA Events Fixes (P1)
> **"Adjust event preview display to see whole flyer"**
> **"Venue should show in Grid View"**
> **"Add copy link option for share event"**

| Task | Priority | Status |
|------|----------|--------|
| Event card in grid view — show full flyer image (not cropped) | P1 | ☐ |
| Event card — show venue alongside city/country | P1 | ☐ |
| Share event — add "Copy Link" option | P1 | ☐ |
| Verify share link goes to the specific event page | P0 | ☐ |

### 3.5 BARA Blog (P1)
> **"Add share buttons, like button, analytics, reduce category dropdown"**

| Task | Priority | Status |
|------|----------|--------|
| Add share buttons to blog posts (Facebook, Twitter/X, copy link) | P1 | ☐ |
| Add like/heart button to blog posts | P1 | ☐ |
| Verify blog analytics are working | P1 | ☐ |
| Category selector — convert to dropdown for easier selection | P1 | ☐ |

### 3.6 User Profile (P1) — Needs Team Decision
> **"What information is ideal to be displayed in User profile?"**
> **"Can other users see each other's profile?"**
> **"Will there be a way for them to connect with each other?"**

| Decision Needed | Options |
|----------------|---------|
| Public profile visibility | A) Fully public B) Opt-in C) Private only |
| Profile info displayed | Name, avatar, country, joined date, badges, activity stats |
| User-to-user connection | A) Follow system B) Friend requests C) None for now |
| **⚠️ Requires team discussion before implementation** | |

### 3.7 Admin Dashboard Analytics (P0)
> **"Make sure analytics here are working in real time and accurate"**

| Task | Priority | Status |
|------|----------|--------|
| Verify admin dashboard stats fetch real-time data | P0 | ☐ |
| Check: user count, event count, listing count, revenue metrics | P0 | ☐ |
| Fix any hardcoded/stale values | P0 | ☐ |
| Test auto-refresh of analytics | P1 | ☐ |

---

## PHASE 4: BARA COINS / GAMIFICATION — SEPARATE MEETING REQUIRED

> **"This VERY important aspect needs review between us as a specific meeting."**
> **"Let us set a date for this plz"**

### What exists:
- Coin balance in Header ✅
- Daily missions system ✅
- Leaderboard page ✅
- Coin Store page ✅
- Daily spin wheel ✅
- Profile themes purchasable with coins ✅
- Sports predictions with coin bets ✅
- Artist boost with coins ✅
- Ad-free browsing with coins ✅

### What the meeting wants reviewed:
| Topic | Current State | Meeting Direction |
|-------|--------------|-------------------|
| **Earn** | XP + Coins from daily missions, login streak, spin wheel | Review: Are earn rates balanced? |
| **Share** | Not implemented | NEW: Can users send coins to each other? |
| **Redeem** | Coin Store has packages, boosts, themes, ad-free | Meeting: "Items/services based on Client advertising value (TBC)" |
| **BARA Coin Store** | Exists at `/store` — 4 coin packs | Meeting: "Shows what is on offer at different levels of Coins for redemption" — needs tier-based rewards |
| **Leaderboard** | Exists at `/leaderboard` — XP, Coins, Streak tabs | Meeting: "Most Coins this week, month, etc" — add time filters |
| **Direct Purchase** | Currently grants free coins (launch mode) | Meeting: "If you can't earn fast enough, buy them directly" — needs Stripe/Paystack |

**⚠️ ACTION: Schedule dedicated BARA Coins meeting before implementing changes.**

---

## PHASE 5: EMAILS

> **"HelloBARA@baraafrika.com (example), etc — which emails do we have so far?"**

### Current email infrastructure:
- **Sending:** Resend via Supabase Edge Function
- **Templates:** 10 email templates (welcome, event reminders, password reset, etc.)
- **From address:** Needs confirmation — likely `noreply@baraafrika.com` or similar

| Task | Priority | Status |
|------|----------|--------|
| Audit current Resend "from" address configuration | P1 | ☐ |
| List all email addresses BARA needs (support, hello, noreply, etc.) | P1 | ☐ |
| Confirm domain DNS is set up for Resend (not sandbox) | P0 | ☐ |
| Document which emails send from which address | P1 | ☐ |

---

## PHASE 6: DPO COMPLIANCE

The `compliance/` folder has 10 documents. Gap analysis:

### What's covered ✅
- Data Controller registration form guidance
- Cross-border storage/transfer authorization (Supabase, Clerk, Resend)
- Privacy Policy draft (covers account, content, usage data)
- Breach Response Playbook, Cookie Notice, Terms of Service drafts

### What's missing ⚠️
| # | Gap | Fix |
|---|-----|-----|
| D1 | Privacy Policy doesn't mention **api-sports.io** | Add to vendor list + privacy policy |
| D2 | No mention of **sports predictions / coin betting** data | Add to "Content you submit" section |
| D3 | DPO Submission Pack has `[placeholder]` fields | Manual — outside code scope |
| D4 | No Data Flow Diagram (DFD) PDF | Create DFD: User → Clerk → Supabase → api-sports.io |
| D5 | Retention periods not defined for play_history, sports_predictions | Add retention policy section |

---

## EXECUTION ORDER (Revised)

```
SPRINT 1 — Platform Foundation (Week 1)
├── 0.1  Navigation bar redesign (P0 — affects every page)
├── 0.4  Footer cleanup (move Advertise + Write a Review down)
├── 0.2  Cross-device testing setup + first pass
└── 0.3  Add "Discover More" to all pages

SPRINT 2 — Streams Overhaul (Week 2)
├── 1.0  Switch ALL Streams pages to white theme
├── 1.1  Build StreamsHub landing page (Music/Movies/Ebooks/Podcast/Gaming)
├── 1.2  Artist banner + Artist picks features
├── 1.4  Seed Streams data
├── 1.5  Verify/create storage buckets
└── 1.6  Full Streams testing on white theme

SPRINT 3 — Sports + Other Mini-Apps (Week 3)
├── 2.1  Sports infrastructure (tables, API key)
├── 2.2  Full Sports page testing
├── 3.1  BARA News mini-app + RSS HTML fix
├── 3.2  BARA Global fixes (maps removal, gallery, Read More)
├── 3.3  Listings category audit
├── 3.4  Events fixes (flyer display, venue, share link)
└── 3.5  Blog features (share, like, analytics, dropdown categories)

SPRINT 4 — Polish & Compliance (Week 4)
├── 0.5  Home tile flip animation
├── 3.7  Admin analytics verification
├── 5.0  Email audit
├── 6.0  DPO compliance updates
├── Full cross-device testing pass (all pages, all viewports)
└── Final deployment

PENDING — Requires Team Meetings First
├── 3.6  User Profile decisions (visibility, connections)
├── 4.0  BARA Coins full review (Earn/Share/Redeem + Stripe)
```

---

## FILES REFERENCE

### Streams Pages (13 files — all need white theme)
- `src/pages/streams/StreamsHome.tsx` → rename to `StreamsMusicHome.tsx`
- `src/pages/streams/ArtistPage.tsx`
- `src/pages/streams/ArtistsPage.tsx`
- `src/pages/streams/ArtistDashboard.tsx`
- `src/pages/streams/ArtistVerificationPage.tsx`
- `src/pages/streams/CreateAlbumPage.tsx`
- `src/pages/streams/LibraryPage.tsx`
- `src/pages/streams/LikedSongsPage.tsx`
- `src/pages/streams/NewReleasesPage.tsx`
- `src/pages/streams/PlaylistPage.tsx`
- `src/pages/streams/PodcastsPage.tsx`
- `src/pages/streams/TrendingSongsPage.tsx`
- `src/pages/streams/UploadSongPage.tsx`
- **NEW:** `src/pages/streams/StreamsHub.tsx` (to create)

### Sports Pages (11 files)
- `src/pages/sports/SportsHome.tsx`
- `src/pages/sports/SportsScores.tsx`
- `src/pages/sports/SportsSchedule.tsx`
- `src/pages/sports/SportsStats.tsx`
- `src/pages/sports/SportsTeams.tsx`
- `src/pages/sports/SportsNewsList.tsx`
- `src/pages/sports/SportsNewsDetail.tsx`
- `src/pages/sports/SportsPredictions.tsx`
- `src/pages/sports/MatchCenter.tsx`
- `src/pages/sports/TeamPage.tsx`
- `src/pages/sports/LeagueTablePage.tsx`

### Key Platform Files (affected by meeting changes)
- `src/components/layout/Header.tsx` — **NAV BAR REDESIGN**
- `src/components/layout/Footer.tsx` — **FOOTER CLEANUP**
- `src/components/DiscoverMore.tsx` — **ADD TO ALL PAGES**
- `src/components/streams/StreamsLayout.tsx` — **WHITE THEME**
- `src/components/streams/StreamsSidebar.tsx` — **WHITE THEME**
- `src/context/AudioPlayerContext.tsx` — global audio player
- `src/services/sportsApi.ts` — Sports API wrapper

### DPO Compliance (10 files in `compliance/`)
- `compliance/DPO_SUBMISSION_PACK.md` — master submission guide
- `compliance/RW_DPO_COMPLIANCE_SUMMARY.md`
- `compliance/PRIVACY_POLICY_DRAFT.md` — needs Sports API + predictions additions
- + 7 more supporting documents

---

---

## COMPLETED — March 31, 2026 Sprint

| # | Item | Files Changed | Status |
|---|------|---------------|--------|
| A | **Search genre cards — remove colors** — Neutral gray monochrome cards | `SearchPage.tsx` | ✅ Done |
| B | **Global player not playing — fixed** — URL validation, auto-skip on error, 15s canplay timeout | `AudioPlayerContext.tsx` | ✅ Done |
| C | **Film crew credits display** — Director, Producer(s), Writer, Actors on hero + cards | `MoviesPage.tsx` | ✅ Done |
| D | **Multi-artist credits** — GlobalPlayer shows "ft." artists, ArtistPage "Featured On" section, ArtistDashboard "Featured Streams" stat | `GlobalPlayer.tsx`, `ArtistPage.tsx`, `ArtistDashboard.tsx` | ✅ Done |
| E | **Music share link mobile** — Removed `hidden md:block` from share button | `GlobalPlayer.tsx` | ✅ Done |
| F | **BARA copyright fix** — "Bara" → "BARA" in locale files + HTML title | `en.json`, `pt.json`, `index.html` | ✅ Done |
| G | **Home page flip card redesign** — Single large card with language meanings grid + unified BARA message | `BaraMeaningTiles.tsx` | ✅ Done |
| H | **Translation — Google Translate widget** — Replaced i18next LanguageSwitcher, 18 languages, real-time full-page translation | `Header.tsx`, `GoogleTranslate.tsx`, `index.html` | ✅ Done |
| I | **Sports API — deferred** — Pro plan $10/mo too expensive for now | — | ⏸️ Deferred |

---

*Plan created: March 17, 2026*
*Updated with team meeting notes: March 17, 2026*
*Updated: March 31, 2026 — 8 items completed, Sports API deferred*
*For Bara Afrika Platform — baraafrika.com*
