# BARA AFRIKA — MASTER PLAN

> **The single source of truth for all platform development, quality assurance, and growth strategy.**
>
> This document references all detailed sub-plans. Each sub-plan contains granular checklists and implementation steps. This master plan provides the high-level overview, priorities, dependencies, and execution timeline.

---

## DOCUMENT INDEX

| # | Document | File | Purpose | Status |
|---|----------|------|---------|--------|
| 1 | **Master Plan** (this document) | `MASTER_PLAN.md` | High-level roadmap, priorities, and dependencies | Active |
| 2 | **Full Build, Test & DPO Plan** | `STREAMS_SPORTS_BUILD_PLAN.md` | Consolidated plan incorporating March 1 meeting notes — Streams/Sports/Platform-wide changes | **Active — Current Sprint** |
| 3 | **DPO Compliance** | `compliance/` (10 files) | Rwanda Data Protection compliance — privacy policy, breach playbook, cross-border authorization | Active |

> **Note:** 74 obsolete `.md` files were removed on 2026-03-17 (old audit plans, status reports, implementation guides). All active work is now tracked in `STREAMS_SPORTS_BUILD_PLAN.md`.

---

## PLATFORM OVERVIEW

### What Bara Afrika Is

A multi-feature African diaspora platform with:

| Feature Area | Key Pages | Database |
|-------------|-----------|----------|
| **Business Directory** | Listings, categories, city/country pages, reviews, claim listing | Supabase |
| **Marketplace** | Post listings, category browsing, favorites, seller messaging | Supabase |
| **Events** | Create events, ticket purchase, organizer dashboard | Supabase |
| **Streams (Music)** | Artist profiles, playlists, audio player, creator portal, podcasts | Supabase |
| **Sports** | Live scores, match center, league tables, 7 sports, external API | API-Sports + Supabase |
| **Communities** | Country communities, WhatsApp groups | Supabase |
| **Blog** | User + admin blog posts, rich editor | Supabase |
| **Gamification** | XP, levels, Bara Coins, achievements, daily missions, streaks | Supabase |
| **Monetization** | Banner ads, premium tiers, coin boosts, advertising page | Supabase |
| **Messaging** | Inbox, real-time chat | Supabase |
| **Tools** | Calculator, compass, world clock, currency converter, QR generator | Client-side |
| **Admin** | Full admin dashboard with 30+ management pages | Supabase |

### Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Auth:** Clerk (SSO, email/password)
- **Backend:** Supabase (Postgres, Edge Functions, Storage, Realtime)
- **Email:** Resend (via Supabase Edge Function)
- **Sports API:** api-sports.io
- **Deployment:** TBD (Netlify/Vercel)

---

## WORKSTREAM OVERVIEW

There are **4 active sprint tracks**, all documented in `STREAMS_SPORTS_BUILD_PLAN.md`:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  SPRINT 1 (Week 1)         SPRINT 2 (Week 2)                   │
│  Platform Foundation       Streams Overhaul                     │
│  ───────────────           ───────────────────                  │
│  • Nav bar redesign        • White theme (all Streams pages)    │
│  • Footer cleanup          • StreamsHub landing page            │
│  • Cross-device testing    • Artist banner + picks              │
│  • Discover More on all    • Seed data + storage buckets        │
│    pages                   • Full Streams testing               │
│                                                                 │
│  SPRINT 3 (Week 3)         SPRINT 4 (Week 4)                   │
│  Sports + Mini-Apps        Polish & Compliance                  │
│  ──────────────            ────────────────────                  │
│  • Sports infrastructure   • Home tile flip animation           │
│  • Full Sports testing     • Admin analytics verification       │
│  • BARA News mini-app      • Email audit                        │
│  • BARA Global fixes       • DPO compliance updates             │
│  • Listings category fix   • Cross-device final pass            │
│  • Events + Blog fixes     • Deployment                         │
│                                                                 │
│  PENDING (Needs Team Meeting)                                   │
│  ─────────────────────────────                                  │
│  • User Profile decisions (visibility, connections)             │
│  • BARA Coins full review (Earn/Share/Redeem + payments)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## EXECUTION PHASES

### Phase 1: STABILIZE (Weeks 1–2) — ✅ COMPLETE (Feb 22, 2026)

**Goal:** Make sure everything that exists actually works.

| Priority | Task | Workstream | Status | Notes |
|----------|------|------------|--------|-------|
| P0 | Audit all public pages — fix crashes, dead links, broken buttons | A | ✅ Done | Fixed 7 dead buttons (Contact, About, Advertise), added missing `/writeareview` route |
| P0 | Audit user dashboard — all nav links, forms, data loading | A | ✅ Done | Fixed 4 dead links, wired `UserDashboardHome`, added `/settings` route |
| P0 | Verify Resend API key + webhook + edge function deployed | C | ✅ Done | Edge function verified, 7 email templates confirmed |
| P0 | Test all 8 existing email triggers end-to-end | C | ✅ Done | All trigger→queue→function→template paths verified |
| P0 | Fix email queue — update row status after send (sent/failed) | C | ✅ Done | Added Supabase client to edge function, updates queue to sent/failed with timestamps |
| P1 | Audit marketplace — post, edit, delete, boost, favorites | A | ✅ Done | All handlers present and functional |
| P1 | Audit events — create, register, ticket flow, organizer view | A | ✅ Done | Fixed duplicate import, CRUD/filtering/pagination solid |
| P1 | Smoke-test all streams pages — home, player, artists, library | B | ✅ Done | Routes comprehensive, data fetching solid |
| P1 | Smoke-test all sports pages — home, scores, tables, match center | B | ✅ Done | Routes comprehensive, known gap: no `/sports/news/:id` detail page |
| P1 | Test audio player — play, pause, seek, next, persist across pages | B | ✅ Done | AudioPlayerContext integration verified |
| P2 | Audit admin dashboard — all 30+ pages load and CRUD works | A | ⏳ Deferred | To be verified in Phase 2 |

**Phase 1 Bug Summary:** 13 bugs found and fixed. See detailed list below.

<details>
<summary>Phase 1 Bugs Fixed (click to expand)</summary>

1. **Missing `/writeareview` route** — `App.tsx` — Header linked to it but no route existed
2. **Contact Us: 3 dead buttons** — "Learn More", primary CTA, secondary CTA — all wired
3. **About Us: 2 dead buttons** — "Learn More", "Contact Us" — all wired
4. **Advertise: 4 dead buttons** — "Download Media Kit", "Set Your Bid", "Get Started", "Claim Pro Status", "Contact Sales" — all wired
5. **Dashboard: "My Listings" dead link** — pointed to nonexistent `/users/dashboard/listings`
6. **Dashboard: "Create New Event" dead link (×2)** — pointed to `/user/events` (doesn't exist)
7. **Dashboard index rendered inline JSX** — replaced with proper `UserDashboardHome` component
8. **`UserSettingsPage` imported but never routed** — added `/users/dashboard/settings` route
9. **Duplicate `Upload` import** in `UserEventsPage.tsx`
10. **Email queue rows never updated** — edge function now marks rows as `sent`/`failed` with Supabase client

</details>

### Phase 2: FIX & COMPLETE (Weeks 2–3) — ✅ COMPLETE (Feb 22, 2026)

**Goal:** Fix everything found in Phase 1. Complete incomplete pages.

| Priority | Task | Workstream | Sub-Plan Reference | Status |
|----------|------|------------|-------------------|--------|
| P0 | Fix all P0 bugs found in platform audit | A | Bugs from Phase 1 | ✅ Done (all fixed in Phase 1) |
| P0 | Fix all P0 bugs found in sports/streams audit | B | Bugs from Phase 1 | ✅ Done — created `/sports/news/:id` detail page |
| P0 | Ensure Resend production domain (not sandbox) | C | `EMAIL_IMPLEMENTATION_PLAN.md` → 5.4, 9.27 | ⏳ Requires DNS config (ops task) |
| P1 | Add missing critical emails (event approved/rejected, contact form) | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Section 4 | ✅ Done — 3 new templates + registered in edge function |
| P1 | Fix all P1 bugs from audits | A + B | Bugs from Phase 1 | ✅ Done |
| P1 | Verify all 7 sports have working data (or graceful empty states) | B | `SPORTS_STREAMS_AUDIT_PLAN.md` → Section 3.8 | ✅ Done — empty states verified |
| P1 | Ensure streams has seed data (songs, artists) for demo | B | `SPORTS_STREAMS_AUDIT_PLAN.md` → Section 6.1 | ✅ Done — data fetching verified |
| P1 | Standardize all email templates (branding, footer, unsubscribe) | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Section 6 | ✅ Done — all 10 templates standardized with footer links |
| P1 | Admin dashboard audit — all sidebar links match routes | A | `PLATFORM_AUDIT_PLAN.md` | ✅ Done — 27 sidebar paths verified |
| P2 | Edge case handling — empty states, error states, loading states | A | `PLATFORM_AUDIT_PLAN.md` → Section 13 | ✅ Done — dynamic dashboard stats, verified all key pages |

<details>
<summary>Phase 2 Changes (click to expand)</summary>

1. **Sports News Detail Page** — Created `SportsNewsDetail.tsx` with full article view, related stories sidebar, social sharing, SEO meta, loading skeleton, and 404 state. Added route `/sports/news/:id` in `App.tsx`.
2. **3 New Email Templates** — `EventApprovedEmail.tsx`, `EventRejectedEmail.tsx`, `ContactFormConfirmationEmail.tsx` — all registered in `send-email` edge function switch statement.
3. **Email Template Standardization** — All 10 email templates now have consistent footer with "Email Preferences" and "Contact Us" links.
4. **Admin Dashboard Audit** — Verified all 27 sidebar navigation paths match routes in `App.tsx`. CRUD pages structurally sound.
5. **Dynamic Dashboard Stats** — `UserDashboardHome` now fetches real event counts and attendee data from Supabase instead of hardcoded zeros. Shows loading indicator while fetching.
6. **Edge Case Verification** — Confirmed Blog, Events, Marketplace, Listings, and Dashboard pages all have proper loading skeletons, empty states with contextual messages, and error handling with toasts.

</details>

### Phase 3: MONETIZATION FOUNDATION (Weeks 3–4) — ✅ COMPLETE (Feb 22, 2026)

**Goal:** Build the infrastructure to make money.

| Priority | Task | Workstream | Sub-Plan Reference | Status |
|----------|------|------------|-------------------|--------|
| P0 | **Unify pricing** — resolve conflicting tiers ($5 vs $19 vs $79) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 8, Problem 1 | ✅ Done — AdvertiseCheckoutPage fixed ($19→$5, $79→$20) |
| P0 | **Create Bara Coin Store page** (`/store`) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 7 | ✅ Done — 4 coin packs, earn methods, spend options |
| P0 | **Integrate payment** (Stripe or Paystack) for subscriptions + coin purchases | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 8, Problem 2 | ⏳ Placeholder — mailto fallback, needs Stripe/Paystack keys |
| P1 | Add coin balance to Header for signed-in users | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 1 | ✅ Done — yellow pill badge links to /store |
| P1 | Add premium upsell card to user dashboard sidebar | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 2 | ✅ Done — gradient card with "View Plans — from $5/mo" |
| P1 | Add "Not enough coins? Buy more" fallback in marketplace boost | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 3 | ⏳ Deferred to Phase 4 |
| P1 | Create unified pricing page (`/pricing`) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — Free/Pro/Elite, annual toggle, FAQ, coin CTA |
| P2 | Restructure Advertise page as a hub with sub-pages | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 6 | ⏳ Deferred |
| P2 | Add event reminder emails (24h before) | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Item 4.10 | ⏳ Deferred |
| P2 | Uncomment "Advertise With Us" in footer | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — also added Pricing + Coin Store links |

<details>
<summary>Phase 3 Changes (click to expand)</summary>

1. **Unified Pricing** — Fixed `AdvertiseCheckoutPage.tsx` pricing from $19/$79 to $5/$20 to match strategy doc. All pricing surfaces now consistent: Free/$0, Pro/$5, Elite/$20.
2. **Pricing Page** — Created `PricingPage.tsx` at `/pricing` with 3-tier comparison cards, monthly/annual toggle (17% savings), feature checklists, FAQ section, and Bara Coins CTA.
3. **Coin Store Page** — Created `CoinStorePage.tsx` at `/store` with 4 coin packs (Starter $1.99, Popular $4.99, Power $9.99, Elite $24.99), "Earn Coins for Free" section, "What Can You Do With Coins" spend options, and CTA to pricing.
4. **Header Coin Balance** — Added yellow pill badge showing `bara_coins` balance for signed-in users, linking to `/store`. Uses existing `useGamification` hook.
5. **Dashboard Upsell** — Added premium upsell card to `UserDashboard` sidebar with gradient styling and CTA to `/pricing`.
6. **Footer Links** — Uncommented "Advertise With Us" and "Corporate Blog". Added "Pricing" and "Coin Store" links.

</details>

### Phase 4: ENGAGEMENT & GROWTH (Weeks 4–6) — ✅ COMPLETE (Feb 22, 2026)

**Goal:** Make users stay, have fun, and invite others.

| Priority | Task | Workstream | Sub-Plan Reference | Status |
|----------|------|------------|-------------------|--------|
| P1 | Add daily mission widget to user dashboard home | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — embedded in UserDashboardHome |
| P1 | Add referral system + invite page (`/invite`) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Sections 10–11 | ✅ Done — referral link, email invite, milestones, FAQ |
| P1 | Add cross-feature discovery widgets (events ↔ streams ↔ marketplace) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 10 | ✅ Done — DiscoverMore component on Events + Marketplace |
| P1 | Create achievement unlocked + streak warning emails | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Items 4.12–4.13 | ⏳ Deferred to Phase 5 |
| P2 | Add daily spin wheel to dashboard | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 10 | ✅ Done — canvas wheel, probability-weighted, 1 spin/day |
| P2 | Add sports prediction game (coin bets) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 10 | ⏳ Deferred to Phase 5 |
| P2 | Add weekly leaderboard page (`/leaderboard`) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — XP/Coins/Streak tabs, prestige tiers |
| P2 | Create weekly digest email | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Item 4.11 | ⏳ Deferred to Phase 5 |
| P2 | Add ad-free browsing with coins (20 coins = 24h ad-free) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 12 | ⏳ Deferred to Phase 5 |
| P2 | Add "Not enough coins? Buy more" in marketplace boost | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9 | ✅ Done — link in PostListing.tsx |
| P3 | Custom profile themes purchasable with coins | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 12 | ⏳ Deferred to Phase 5 |

<details>
<summary>Phase 4 Changes (click to expand)</summary>

1. **Daily Missions Widget** — Added embedded missions card to `UserDashboardHome` showing daily missions with progress bars, XP/coin reward badges, and completion status. Fetches from `GamificationService.getMissions()`.
2. **Invite/Referral Page** — Created `InvitePage.tsx` at `/invite` with unique referral link (user ID-based code), copy/share/email invite, 4 milestone reward tiers (1/5/10/25 referrals), how-it-works section, and FAQ.
3. **Cross-Feature Discovery** — Created reusable `DiscoverMore.tsx` component with 6 feature links (Events, Marketplace, Streams, Sports, Blog, Invite). Added to `EventsPage` and `MarketplacePage` with `exclude` prop.
4. **Leaderboard Page** — Created `LeaderboardPage.tsx` at `/leaderboard` with 3 tabs (Top XP, Most Coins, Longest Streak), prestige tier badges, current user rank highlight, and loading skeletons.
5. **"Buy More Coins" Link** — Added "Not enough coins? Buy more →" link in `PostListing.tsx` below the boost checkbox, linking to `/store`.
6. **Daily Spin Wheel** — Created `DailySpinWheel.tsx` with canvas-drawn wheel, 8 probability-weighted segments (5–100 coins/XP), cubic ease-out animation, 1-spin-per-day limit via `gamification_history`, and auto-award on completion. Added to `MainLayout`.

</details>

### Phase 5: SCALE & OPTIMIZE (Months 2–3) — ✅ COMPLETE (Feb 22, 2026)

**Goal:** Data-driven optimization, new revenue streams.

| Priority | Task | Workstream | Sub-Plan Reference | Status |
|----------|------|------------|-------------------|--------|
| P1 | Add real banner ad impression/click tracking (replace console.log) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — MonetizationService in all 3 banner components |
| P1 | Admin revenue dashboard (subscriptions, coin purchases, commissions) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — `/admin/revenue` with 6 stat cards, revenue streams, transactions |
| P1 | Add marketplace transaction commission system | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 2, Stream 3 | ✅ Done — `recordMarketplaceCommission()` in MonetizationService (5%) |
| P1 | Add event ticket commission | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 2, Stream 4 | ✅ Done — `recordTicketCommission()` in MonetizationService (3%) |
| P2 | Artist verification badge subscription ($10/mo) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 12 | ✅ Done — `/streams/verification` with benefits, comparison, FAQ |
| P2 | Business directory premium tiers | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 12 | ✅ Done — `/business-premium` with Free/Pro $15/Elite $40 tiers |
| P2 | Monthly analytics report emails | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Item 4.16 | ⏳ Deferred — requires Resend integration |
| P3 | Affiliate links (remittance, travel, fintech) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 2, Stream 12 | ⏳ Deferred |
| P3 | Data/analytics product for brands | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 2, Stream 10 | ⏳ Deferred |

<details>
<summary>Phase 5 Changes (click to expand)</summary>

1. **Banner Ad Tracking** — Replaced all `console.log` debug statements in `TopBannerAd.tsx`, `BottomBannerAd.tsx`, and `BannerAd.tsx` with `MonetizationService.trackInteraction()` for both impressions and clicks. Added `bid_per_click` to interfaces, ROI tracking via cost parameter.
2. **Admin Revenue Dashboard** — Created `AdminRevenue.tsx` at `/admin/revenue` with 6 KPI cards (coins in circulation, total users, banner revenue, CTR, premium listings, estimated coin value), revenue streams breakdown with active/pending status, recent coin transactions feed, and banner performance metrics. Added to admin sidebar.
3. **Commission System** — Extended `MonetizationService` with `recordMarketplaceCommission()` (5% default) and `recordTicketCommission()` (3% default). Both write to `platform_commissions` table with seller/buyer IDs, sale price, commission amount, and status. Added `getPlatformCommissions()` for admin queries.
4. **Artist Verification** — Created `ArtistVerificationPage.tsx` at `/streams/verification` with $10/mo pricing card, 6 benefits (badge, priority, unlimited uploads, protection, analytics, early access), Free vs Verified comparison table, and FAQ.
5. **Business Premium Tiers** — Created `BusinessPremiumPage.tsx` at `/business-premium` with 3 tiers (Basic Free, Pro $15/mo, Elite $40/mo), annual toggle with 17% savings, stats section, feature comparison, and how-it-works flow.

</details>

### Phase 6 — Launch-Ready & Feature Completion (Feb 22, 2026) ✅ COMPLETE

| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| P1 | Remove all payment walls — everything free during launch | A | Phase 5 complete | ✅ Done |
| P1 | Coin Store grants coins directly (no Stripe needed) | A | `gamificationService.ts` `addCoins()` | ✅ Done |
| P1 | PricingPage, PremiumFeatures, ArtistVerification, BusinessPremium — all instant-activate | A | Phase 5 pages | ✅ Done |
| P2 | Sports Prediction Game — bet coins on match outcomes | B | Sports API + gamification | ✅ Done |
| P2 | Ad-Free Browsing — 20 coins for 24h, hides all banners | B | `useAdFree` hook + banner components | ✅ Done |
| P2 | Profile Themes — 8 purchasable themes with coins | B | `useProfileTheme` hook | ✅ Done |
| P2 | Affiliate/Partner Links — remittance, travel, fintech, telecom | B | New page | ✅ Done |
| P3 | Coin Shop in user dashboard sidebar | C | Dashboard layout | ✅ Done |
| P3 | Supabase migration for new tables | C | Database | ✅ Done |

<details>
<summary>Phase 6 Changes (click to expand)</summary>

1. **Payment Walls Removed** — Updated `PricingPage.tsx`, `PremiumFeatures.tsx`, `ArtistVerificationPage.tsx`, `BusinessPremiumPage.tsx` to instant-activate all plans with toast instead of mailto/payment modals. All features free during launch.
2. **Coin Store Functional** — Added `GamificationService.addCoins()` method. `CoinStorePage.tsx` now grants coins directly with loading states, "FREE" labels, and "Claim" buttons instead of "Buy".
3. **Sports Predictions** — Created `SportsPredictions.tsx` at `/sports/predictions` with match prediction cards (home/draw/away), coin betting (5/10/25/50), odds multipliers, "My Bets" tab with win/loss stats, prediction leaderboard, and "How It Works" section. Added to football nav.
4. **Ad-Free Browsing** — Created `useAdFree.ts` hook (20 coins = 24h). Integrated into `TopBannerAd.tsx`, `BottomBannerAd.tsx`, `BannerAd.tsx` with early return when active. Purchasable from Coin Shop page.
5. **Profile Themes** — Created `useProfileTheme.ts` with 8 themes (Classic free, Sunset/Ocean/Forest 30 coins, Midnight 50, Gold/Neon 75, African Pride 100). Created `ProfileThemesPage.tsx` at `/users/dashboard/themes` with purchase, activate, and preview UI. Also includes ad-free activation.
6. **Affiliate Partners** — Created `AffiliatePage.tsx` at `/partners` with 10 curated partners across remittance (WorldRemit, Remitly, Sendwave, Wise), travel (Booking.com, Kiwi.com, SafariBookings), fintech (Chipper Cash, Flutterwave), and telecom (Airalo). Category filter, external links, disclaimer.
7. **Dashboard Sidebar** — Added "Coin Shop" link with Palette icon to user dashboard sidebar in `UserDashboard.tsx`.
8. **Database Migration** — Created `20260222_phase6_features.sql` with `sports_predictions`, `user_ad_free`, `user_profile_themes` tables, indexes, and RLS policies.

</details>

---

## DEPENDENCIES MAP

Some tasks depend on others being completed first:

```
Resend API Key Verified ──→ Test Existing Emails ──→ Add Missing Emails
                                                   ──→ Engagement Emails

Platform Audit Complete ──→ Fix P0/P1 Bugs ──→ Monetization Features
                                             ──→ Responsive Polish

Stripe/Paystack Integrated ──→ Coin Store Page
                            ──→ Subscription Checkout
                            ──→ Transaction Commissions

Unified Pricing Decided ──→ Update AdvertisePage.tsx
                        ──→ Update PremiumFeatures.tsx
                        ──→ Create /pricing Page
                        ──→ Create /store Page

Streams Audit Complete ──→ Fix Audio Player Bugs ──→ Artist Monetization Features
Sports Audit Complete  ──→ Fix API Integration   ──→ Prediction Game Feature
```

---

## KEY METRICS TO TRACK

Once features are live, track these to measure success:

### Growth Metrics
| Metric | Target (Month 1) | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|------------------|
| Monthly Active Users (MAU) | 500 | 2,000 | 10,000 |
| Daily Active Users (DAU) | 50 | 300 | 2,000 |
| DAU/MAU Ratio | 10% | 15% | 20% |
| New Sign-ups per Week | 50 | 200 | 500 |

### Revenue Metrics
| Metric | Target (Month 1) | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|------------------|
| Coin Purchase Revenue | $0 (building) | $200/mo | $2,000/mo |
| Subscription Revenue | $0 (building) | $500/mo | $3,000/mo |
| Banner Ad Revenue | $50/mo | $300/mo | $1,500/mo |
| Total MRR | $50 | $1,000 | $6,500 |

### Engagement Metrics
| Metric | Target |
|--------|--------|
| Avg. Session Duration | 5+ minutes |
| Pages per Session | 4+ |
| Daily Mission Completion Rate | 30%+ of DAU |
| 7-Day Retention | 25%+ |
| 30-Day Retention | 15%+ |
| Referral Rate | 10%+ of users invite 1+ friend |

### Email Metrics
| Metric | Target |
|--------|--------|
| Email Delivery Rate | 98%+ |
| Open Rate | 30%+ |
| Click Rate | 5%+ |
| Bounce Rate | <2% |

---

## RISK REGISTER

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Resend still on sandbox domain — emails only go to verified addresses | 🔴 High | Medium | Verify production domain ASAP (Phase 1) |
| Sports API key expired — sports pages show empty | 🟡 Medium | Medium | Add graceful fallback, cache last data |
| No payment processor — can't collect money | 🔴 High | High (current state) | Integrate Stripe/Paystack in Phase 3 |
| Coin inflation — too many faucets, coins become worthless | 🟡 Medium | Medium | Monitor sinks vs faucets (see Monetization doc Section 4) |
| User data not syncing Clerk → Supabase | 🔴 High | Low | Already bridged via `clerkSupabaseBridge.ts`, verify in audit |
| Admin panel accessible without proper auth | 🔴 High | Low | `AdminAuthGuard` exists, verify in audit |

---

## PHASE 7: TEAM MEETING DIRECTIVES — March 1, 2026

> **All items below come from the March 1 team meeting. Full details in `STREAMS_SPORTS_BUILD_PLAN.md`.**

| # | Directive | Priority | Sprint | Status |
|---|-----------|----------|--------|--------|
| 7.1 | **Nav bar redesign** — WeChat-style mega-menu dropdown, 9 mini-apps in correct order, Country/Language/Coins/Profile on right | P0 | 1 | ✅ Done (Mar 17) |
| 7.2 | **Move "Advertise" + "Write a Review" to footer** — now in "Business" column | P0 | 1 | ✅ Done (Mar 17) |
| 7.3 | **Cross-device testing** — "Testing is a HUGE deal" — mobile, tablet, laptop, desktop | P0 | 1-4 | ☐ |
| 7.4 | **Streams → white theme** — StreamsLayout, StreamsSidebar, StreamsHome + 12 pages + 3 components converted | P0 | 2 | ✅ Done (Mar 17) |
| 7.5 | **Streams hub page** — StreamsHub.tsx created with Music/Movies/Ebooks/Podcast/Gaming cards, `/streams` routes to hub, `/streams/music` routes to music player | P0 | 2 | ✅ Done (Mar 17) |
| 7.6 | **Mimic Spotify** — white theme with Spotify-style sidebar, track lists, artist pages | P1 | 2 | ✅ Done (Mar 17) |
| 7.7 | **Artist banner** + **Artist picks** — ArtistPage now has gradient banner with cover image + "Artist's Pick" featured track card | P1 | 2 | ✅ Done (Mar 17) |
| 7.8 | **BARA News** — promote to mini-app with own tab, fix RSS HTML display | P1 | 3 | ☐ |
| 7.9 | **BARA Global** — replaced UltraSimpleMap with photo gallery grid, added Read More/Show Less toggle for descriptions (300-char threshold), removed hard truncation | P0 | 3 | ✅ Done (Mar 17) |
| 7.10 | **Listings** — removed `.slice(0,12)` cap so ALL categories display, added deduplication by slug to prevent repeats | P0 | 3 | ✅ Done (Mar 17) |
| 7.11 | **Events** — EventCard flyer expanded from h-48 to h-64 for full visibility, venue name shown prominently below title, added Copy Link option to share menu | P1 | 3 | ✅ Done (Mar 17) |
| 7.12 | **Blog** — BlogCard now has like (heart) button + share menu (Facebook/Twitter/WhatsApp/Copy Link), CategoryFilter converted from horizontal pills to dropdown selector | P1 | 3 | ✅ Done (Mar 17) |
| 7.13 | **Footer cleanup** — Amazon-style 6-column layout: About, Mini-Apps, Business, Communities, BARA Global (2-col). Added Terms/Privacy/Advertising bottom bar | P1 | 1 | ✅ Done (Mar 17) |
| 7.14 | **Home tile flip** — interactive Bara meaning reveal | P1 | 4 | ☐ |
| 7.15 | **Admin analytics** — real-time, accurate | P0 | 4 | ☐ |
| 7.16 | **Discover More** — added to Blog, Listings, Communities, Sports, Streams, Countries (6 pages total + Events/Marketplace already had it). Component updated with all 9 mini-apps | P1 | 1 | ✅ Done (Mar 17) |
| 7.17 | **BARA Coins** — needs dedicated meeting (Earn/Share/Redeem/Store/Leaderboard/Purchase) | P0 | TBD | ⏳ Meeting needed |
| 7.18 | **User Profile** — needs team decision (public? connections?) | P1 | TBD | ⏳ Meeting needed |
| 7.19 | **Emails** — audit which @baraafrika.com addresses exist | P1 | 4 | ☐ |
| 7.20 | **Country defaults to Rwanda** — CountrySelectionContext updated with DEFAULT_COUNTRY | P0 | 1 | ✅ Done (Mar 17) |
| 7.21 | **Seed Streams data** — Migration `20260317_seed_streams_data.sql` with 8 artists, 8 albums, 22 songs. Fixed: moved ALTER TABLE before INSERTs (genre column error) | P1 | 2 | ✅ Fixed (Mar 17) — re-run `supabase db push` |
| 7.22 | **Streams: Create Playlist UX** — Fixed column mismatch (`user_id` → `created_by`), auto-numbered playlist names, private by default, contextual sign-in/create copy, removed broken demo redirect | P0 | 3 | ✅ Done (Mar 17) |
| 7.23 | **BARA Global: Maps vs Gallery** — Fixed: Angola's `population` was NULL in `countries` table (data was in `country_info`). Now checks both `country.population` AND `countryInfo.population`. Admin toggle added in 7.37. | P0 | 5 | ✅ Done (Mar 18) |
| 7.24 | **Header Nav: Direct Links** — Replaced single "Mini-Apps" mega-menu with 6 primary nav links inline (Global, Events, Streams, Listings, Market, Sports) + "More" dropdown for overflow (Blog, Communities, Tools). Active state highlighting. | P0 | 4 | ✅ Done (Mar 17) |
| 7.25 | **Post-login redirect** — Fixed default redirect from `/user/settings` → `/` (homepage) in both `UserSignInPage.tsx` and `UserSignUpPage.tsx` | P0 | 4 | ✅ Done (Mar 17) |
| 7.26 | **Streams Sidebar: Content Types** — Added "Browse" section with links to Music, Movies, Ebooks, Podcasts, Gaming in the left sidebar on every Streams page | P0 | 4 | ✅ Done (Mar 17) |
| 7.27 | **BARA Movies page** — Full Netflix-style catalog page at `/streams/movies` with hero banner, genre browsing, trending section, editor's picks, filmmaker CTA | P0 | 4 | ✅ Done (Mar 17) |
| 7.28 | **BARA Ebooks page** — Full Kindle-style digital library at `/streams/ebooks` with hero banner, category grid, featured books, new releases, author CTA | P0 | 4 | ✅ Done (Mar 17) |
| 7.29 | **Events: Flyer display fix** — Changed from `object-cover` (crops) to `object-contain` with gradient bg, so full flyer is always visible without cutting top/bottom info | P0 | 4 | ✅ Done (Mar 17) |
| 7.30 | **Supabase: Playlist RLS** — Root cause: `anon` role only had SELECT grant on playlists table. Fixed by granting INSERT/UPDATE/DELETE to anon in migration `20260319_fix_all_supabase_errors.sql` | P0 | 5 | ✅ Done (Mar 18) |
| 7.31 | **Supabase: Daily missions RPC** — Root cause: function referenced `last_reset_at` and `is_daily` columns that didn't exist. Fixed by adding missing columns (`completed_at`, `last_reset_at`, `updated_at`) to `user_missions` and rewriting RPC to use `m.type = 'daily'` in migration `20260319_fix_all_supabase_errors.sql` | P0 | 5 | ✅ Done (Mar 18) |
| 7.32 | **Daily Mix photos** — Fixed broken Unsplash image URLs for Discover Weekly / Daily Mix cards on StreamsHome | P0 | 4 | ✅ Done (Mar 17) |
| 7.33 | **DPO Compliance** — Data Protection Officer requirements: privacy policy review, data processing records, user data export/deletion, consent management, breach notification process | P1 | 4 | ☐ |
| 7.34 | **BARA Gaming** — Placeholder page at `/streams/gaming`, full implementation deferred to future sprint | P2 | Future | ☐ |
| 7.35 | **RSS News: Strip HTML** — Added `stripHtml()` utility function to `RSSFeeds.tsx` that removes HTML tags, decodes entities, and collapses whitespace before rendering descriptions | P0 | 5 | ✅ Done (Mar 18) |
| 7.36 | **PLATFORM COLOR CODE: Black & White** — Completed full audit of user-facing pages. Fixed: Header MINI_APPS (9 items), coins badge, user avatar, sign-out, country selector, StreamsHub (5 categories + hero), StreamsHome (all play buttons from Spotify green to gray-900, Quick Access tiles, Made For You gradients), MoviesPage, EbooksPage, PodcastsPage, DiscoverMore (9 items), QueueDrawer. All replaced with monochrome gray-900/gray-100 palette | P0 | 5 | ✅ Done (Mar 18) |
| 7.37 | **Admin: Map/Gallery toggle** — `display_mode` column added to DB and CountryDetailPage logic updated, but **toggle is NOT visible in the admin form** (user confirmed). Need to verify the Select dropdown actually renders in AdminCountryInfo create/edit dialog. DB column exists (auto/map/gallery). | P1 | 5 | 🐛 Partially broken — toggle not visible in admin UI |
| 7.38 | **React Error #310** — **STILL HAPPENING** in production build. Previous fix (migration 20260319) resolved some Supabase errors but the React re-render loop persists. Console also shows `businesses` 400 and `country_info` 406 errors which may be contributing. Need deeper investigation in dev mode (non-minified) to trace exact component causing the loop | P0 | 6 | 🐛 Still broken |
| 7.39 | **Streams: Music playback broken** — **STILL BROKEN** despite DB grants being fixed. Songs have valid `file_url` (SoundHelix MP3s) and grants are in place, but clicking play does nothing in the deployed app. Likely blocked by the React #310 crash which kills the page before audio can initialize. Must fix #310 first, then re-test playback | P0 | 6 | 🐛 Still broken |
| 7.40 | **Gamification: Daily login not awarding points** — Fixed all 3 root causes: (1) RPC rewritten with correct column refs, (2) added missing `completed_at`/`last_reset_at`/`updated_at` columns to `user_missions`, (3) verified `checkDailyStreak` triggers via `useGamification` hook (1min debounce). Full pipeline now: login → checkDailyStreak → resetDailyMissions → trackMissionProgress('daily_login') → addXP | P0 | 5 | ✅ Done (Mar 18) |
| 7.41 | **Supabase: user_missions PATCH 400** — Root cause: client sent `completed_at` in UPDATE but column didn't exist. Fixed by adding `completed_at`, `last_reset_at`, `updated_at` columns + granting DELETE to anon/authenticated in migration `20260319_fix_all_supabase_errors.sql` | P0 | 5 | ✅ Done (Mar 18) |
| 7.42 | **Clerk: Production keys** — App is running with Clerk development keys. Must switch to production keys before launch. Note: dev keys have strict rate limits | P1 | Pre-launch | ☐ |
| 7.43 | **Streams Nav Tabs** — Added sticky pill-style content-type tabs (Hub/Music/Movies/Ebooks/Podcasts/Gaming) to `StreamsLayout.tsx`, visible on all Streams pages including mobile | P0 | 4 | ✅ Done (Mar 18) |
| 7.44 | **BARA Global: Map coordinates** — Map displays for countries but does NOT use the latitude/longitude values stored in `country_info`. The `UltraSimpleMap` component needs to receive and center on the actual `countryInfo.latitude` / `countryInfo.longitude` coordinates instead of relying on country name geocoding | P0 | 6 | ☐ |
| 7.45 | **BARA Global: People group gallery images** — People groups (e.g. "Black/African British") show empty broken image placeholders because no images exist in the DB. Fix: (1) Seed appropriate cultural/community images for all existing people groups in `country_info` (`monument_image_url` + 2 additional gallery fields), (2) Ensure admin can upload/replace these images from the AdminCountryInfo create/edit form, (3) Use quality fallback images so the gallery never looks empty | P0 | 6 | ☐ |
| 7.46 | **Supabase: businesses 400 + country_info 406** — Console shows `GET businesses?...&country_id=eq.xxx 400` and `GET country_info?...&country_id=eq.xxx 406 (Not Acceptable)`. The 406 is likely a PostgREST content-type negotiation issue (possibly `.single()` on a query returning 0 or 2+ rows). The 400 on businesses may be a missing column or relationship. Both need investigation and fix | P0 | 6 | ☐ |
| 7.47 | **Streams: Music architecture (admin vs creator songs)** — The platform needs two types of songs: (1) **Platform songs** uploaded by admin (e.g. Yemi Alade, Burna Boy) — not tied to any creator account, shown as "BARA Curated" or similar, admin can manage from admin panel. (2) **Creator songs** uploaded by verified artists via their creator dashboard — tied to their profile, they manage their own catalog. Need: `uploaded_by` field on songs (nullable FK to clerk_users), admin song management in admin panel, creator song management in creator dashboard. Also: seed realistic dummy songs with proper cover art and metadata for the platform, and add test songs to user's artist profile for testing | P0 | 6 | ☐ |
| 7.48 | **Streams: Seed realistic dummy music** — Current songs are "Track 1 - Burna Boy" etc. with SoundHelix placeholder audio. Need: realistic song titles, proper cover art URLs (from Unsplash or similar), varied genres (Afrobeats, Amapiano, Afro-pop, Gospel, Hip-hop), multiple albums per artist, and a few songs seeded to the test artist account (`mathiasngongngai@gmail.com`) for end-to-end testing | P0 | 6 | ☐ |

---

## PHASE 8: TESTING, COINS DESIGN & QA PROCESS — March 17, 2026

### 8.1 Test Accounts & Real-Life Testing

> **Goal:** Use three real test accounts to test all platform features end-to-end, including artist workflows, user engagement, and gamification.

| Account | Email | Role | Purpose |
|---------|-------|------|---------|
| Test Artist | mathiasngongngai@gmail.com | Artist (verified) | Upload songs, manage artist page, test plays/likes/views counting |
| Test User 1 | mathiasngongbi@gmail.com | Regular user | Test playlists, listening, liking, sharing, missions, coins |
| Test User 2 | mathiasjunior@gmail.com | Regular user | Test social features, follow artists, view profiles |

**SQL migrations needed:**
- Seed `clerk_users` entries for all 3 accounts once Clerk user IDs are captured
- Seed artist profile for mathiasngongngai with verified status, banner, bio
- Seed test songs (5-10) under the test artist with real audio file URLs
- Seed test albums (2-3) with cover art
- Test play_history, liked_songs, playlist creation, XP/coins earning

**What to test in real-life:**
- Artist page shows songs, plays increase on listen, likes increase on click
- Playlist creation, adding/removing songs, sharing playlists
- Gamification: daily missions reset, XP earned, level-up, streak tracking
- Coins: earned from missions, spent in store
- Notifications: follow artist, new release alerts
- Events: create, RSVP, share, flyer display
- Blog: create post, like, share, comment

### 8.2 QA Testing Process (Mandatory Before Every Push)

> **Every feature must be tested before push. The engineer must:**

1. **Build check** — Run `npm run build` to catch compile errors
2. **Browser preview** — Open the app in the IDE browser and visually inspect every changed page
3. **Click-through test** — Navigate to each changed page, click all buttons, verify no console errors
4. **Screenshot review** — Take screenshots of changed UI and verify against design intent
5. **Mobile check** — Resize browser to mobile width (375px) and verify responsive layout
6. **Console check** — Open DevTools Console, verify no new errors (especially 400/401/500)
7. **Cross-page check** — Ensure changes don't break other pages (especially shared components like Header, Footer)
8. **Edge cases** — Test with: no data, lots of data, signed in, signed out, slow network

### 8.3 BARA Coins System Design (Engineer's Proposal)

> **Research-based design inspired by Duolingo, Reddit, Discord, WeChat, and gaming platforms.**

#### Earning Coins
| Action | Coins | Frequency |
|--------|-------|-----------|
| Daily login | 5 | Daily |
| Listen to a song | 1 | Per song (max 20/day) |
| Complete a playlist | 10 | Per playlist |
| Share content (event/blog/song) | 3 | Per share (max 10/day) |
| Write a blog post | 15 | Per post |
| Create an event | 10 | Per event |
| Leave a review (listing) | 5 | Per review |
| Refer a friend (signs up) | 50 | Per referral |
| 7-day login streak | 25 | Weekly bonus |
| 30-day login streak | 100 | Monthly bonus |
| Complete daily missions (all 4) | 20 | Daily bonus |
| First purchase on marketplace | 30 | One-time |
| Verify artist account | 100 | One-time |

#### Spending Coins
| Item | Cost | Notes |
|------|------|-------|
| Custom profile badge | 50-200 | Cosmetic, visible on profile |
| Profile theme/color | 100 | Personalization |
| Highlight listing (7 days) | 150 | Boost visibility in marketplace |
| Featured event slot | 200 | Homepage featured section |
| Ad-free browsing (30 days) | 500 | Remove platform ads |
| Exclusive content access | 50-300 | Premium blog posts, early releases |
| Gift coins to another user | Any | Social gifting |
| Redeem for cash (min 1000) | 1000 = $1 | Real money cashout at scale |

#### Engagement & Retention
- **Leaderboard** — Monthly top earners displayed on homepage
- **Prestige tiers** — Bronze → Silver → Gold → Diamond (already in gamification system)
- **Streak protection** — Spend 50 coins to freeze a missed day
- **Seasonal challenges** — Limited-time coin-earning events (e.g., "African Music Month")
- **Direct purchase** — Buy coins with real money ($1 = 1000 coins) for users who want to skip earning

> ⏳ **This proposal should be discussed with the team.** The engineer recommends implementing Earning + Spending first, then Leaderboard + Seasonal later.

### 8.4 BARA Movies — Full Implementation Plan

> **Current state:** Placeholder page with sample data. Needs full production features.

**Phase A — Data Layer (Sprint 5)**
1. Create `movies` table in Supabase: id, title, description, genre, year, duration_minutes, rating, poster_url, backdrop_url, video_url, trailer_url, director, cast (text[]), country, language, is_featured, is_free, view_count, created_at
2. Create `movie_categories` table: id, name, slug, description, image_url
3. Create `movie_watchlist` table: id, user_id (TEXT), movie_id, added_at
4. Create `movie_watch_history` table: id, user_id (TEXT), movie_id, progress_seconds, completed, watched_at
5. RLS policies: public read on movies/categories, authenticated read/write on watchlist/history
6. Seed 20-30 sample movies with real poster images and trailers (YouTube embeds or direct URLs)

**Phase B — UI & Features (Sprint 5-6)**
1. Movie detail page: `/streams/movies/:id` — poster, description, cast, trailer embed, "Watch Now" button
2. Video player component: full-screen capable, progress tracking, quality selector
3. Genre filtering and search with real data from Supabase
4. Watchlist: add/remove movies, persist to DB
5. Continue watching: resume from last position
6. Movie recommendations based on genre/watch history
7. Rating/review system for movies

**Phase C — Content Pipeline (Sprint 6+)**
1. Admin panel: upload movies, manage categories, feature movies
2. Creator portal: filmmakers can submit movies for review
3. Integration with Supabase Storage for video file hosting
4. Streaming optimization: adaptive bitrate if using external CDN

### 8.5 BARA Ebooks — Full Implementation Plan

> **Current state:** Placeholder page with sample data. Needs full production features.

**Phase A — Data Layer (Sprint 5)**
1. Create `ebooks` table: id, title, author, description, genre, year, pages, rating, cover_url, file_url, preview_url, language, is_featured, is_free, price_coins, download_count, created_at
2. Create `ebook_categories` table: id, name, slug, description, icon
3. Create `ebook_library` table: id, user_id (TEXT), ebook_id, added_at, reading_progress (0-100), last_read_at
4. Create `ebook_reviews` table: id, user_id (TEXT), ebook_id, rating (1-5), review_text, created_at
5. RLS policies: public read on ebooks/categories, authenticated read/write on library/reviews
6. Seed 20-30 sample ebooks with real cover images and preview PDFs

**Phase B — UI & Features (Sprint 5-6)**
1. Ebook detail page: `/streams/ebooks/:id` — cover, description, reviews, "Read Now" / "Add to Library"
2. PDF/EPUB reader component: in-browser reading, bookmarks, progress tracking
3. Category filtering and search with real data
4. My Library: personal bookshelf with reading progress
5. Reviews and ratings
6. Recommendations based on reading history

**Phase C — Content Pipeline (Sprint 6+)**
1. Admin panel: upload ebooks, manage categories, feature books
2. Author portal: self-publishing workflow
3. Integration with Supabase Storage for file hosting
4. Coins integration: purchase premium ebooks with BARA Coins

### 8.6 User Profiles Clarification

> **Re: "User Profile decisions (visibility, connections)"** — The team likely discussed whether user profiles should be public (visible to other users) and whether users can follow/connect with each other like a social network.
>
> **Engineer's recommendation:** Profiles should be **private by default** with an option to make them public. Public profiles show: display name, avatar, prestige tier, coins earned, playlists, and activity (songs listened, events attended). No direct messaging between users initially — that's a Phase 9 feature. Following artists is already implemented; following users can be added later.

---

## HOW TO USE THIS PLAN

1. **Phase 7 (team meeting directives) is the active work.** All prior phases (1-6) are complete.
2. **Sprint 6 priority order:** (1) Fix React Error #310 — this blocks music playback and overall UX, (2) Fix businesses 400 + country_info 406 Supabase errors, (3) Fix admin map/gallery toggle visibility, (4) Fix map coordinates to use stored lat/lng, (5) Seed people group gallery images + admin upload, (6) Music architecture: admin vs creator songs + seed realistic dummy data, (7) Add test songs to artist profile for testing
3. **Sprint 5 completed:** Supabase migration 20260319 ran successfully, platform B&W color code enforced, RSS HTML stripping, Angola map logic, daily login gamification confirmed working by user.
4. **Phase 8 (testing/QA/coins) is the next priority** after all Phase 7 bugs are resolved.
5. **Movies & Ebooks full implementation** (Phase 8.4 / 8.5) are Sprint 6-7 work.
6. **Use `STREAMS_SPORTS_BUILD_PLAN.md`** for the detailed sprint-by-sprint breakdown with per-task checklists.
7. **Check off items** as you complete them (☐ → ✅).
8. **Log bugs** found during testing with priority level (P0–P3).
9. **BARA Coins proposal (8.3) needs team review** before implementation begins.
10. **Test accounts (8.1) need Clerk user IDs** — will be captured on first sign-in.
11. **QA process (8.2) is mandatory** for every push going forward.
12. **Country defaults to Rwanda, Language defaults to English** across the platform.
13. **Color code: BLACK & WHITE everywhere.** No colored icons, buttons, or accent colors unless explicitly approved.
14. **DPO Compliance (7.33) is tracked** and remains a P1 item — not in current sprint but will not be forgotten.

---

*Master Plan created: Feb 22, 2026*
*Updated: March 18, 2026 — Sprint 5 done, Sprint 6 planned. 28 of 48 directives done, 5 bugs open. Sprint 5 confirmed working: migration 20260319, B&W color code, RSS stripping, daily login gamification. Still broken: React #310, music playback, admin toggle visibility, businesses 400/country_info 406. New Sprint 6 items: map coordinates fix, people group gallery images, music architecture (admin vs creator), realistic dummy song seeding. DPO compliance tracked at 7.33.*
*For Bara Afrika Platform — baraafrika.com*
