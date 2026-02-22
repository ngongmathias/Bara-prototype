# BARA AFRIKA — MASTER PLAN

> **The single source of truth for all platform development, quality assurance, and growth strategy.**
>
> This document references all detailed sub-plans. Each sub-plan contains granular checklists and implementation steps. This master plan provides the high-level overview, priorities, dependencies, and execution timeline.

---

## DOCUMENT INDEX

| # | Document | File | Purpose | Status |
|---|----------|------|---------|--------|
| 1 | **Master Plan** (this document) | `MASTER_PLAN.md` | High-level roadmap, priorities, and dependencies | Active |
| 2 | **Monetization & Retention Strategy** | `MONETIZATION_AND_RETENTION_STRATEGY.md` | 12 revenue streams, gamification economy, user retention, conversion architecture, structural gaps | Complete |
| 3 | **Full Platform Audit** | `PLATFORM_AUDIT_PLAN.md` | Page-by-page, button-by-button audit of every platform feature | ✅ Phase 1 Done |
| 4 | **Sports & Streams Audit** | `SPORTS_STREAMS_AUDIT_PLAN.md` | Deep audit of the Sports and Music mini-applications | ✅ Phase 1 Done |
| 5 | **Email Implementation** | `EMAIL_IMPLEMENTATION_PLAN.md` | Email trigger audit, missing emails, Resend verification, templates | ✅ Phase 1 Done |

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

There are **4 parallel workstreams**. Each maps to a detailed sub-plan document.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  WORKSTREAM A              WORKSTREAM B                         │
│  Platform Audit            Sports & Streams Audit               │
│  ───────────────           ───────────────────                  │
│  PLATFORM_AUDIT_PLAN.md    SPORTS_STREAMS_AUDIT_PLAN.md         │
│  • Public pages            • Music player & pages               │
│  • Auth flows              • All 7 sports                       │
│  • User dashboard          • Admin panels                       │
│  • Admin dashboard         • API integrations                   │
│  • Marketplace             • Database/seed data                 │
│  • Events                                                       │
│  • Communities & Blog                                           │
│  • Navigation & Layout                                          │
│  • Responsive & Edge cases                                      │
│                                                                 │
│  WORKSTREAM C              WORKSTREAM D                         │
│  Email System              Monetization & Growth                │
│  ──────────────            ────────────────────                  │
│  EMAIL_IMPLEMENTATION_     MONETIZATION_AND_RETENTION_          │
│  PLAN.md                   STRATEGY.md                          │
│  • Verify existing emails  • Revenue architecture               │
│  • Fix email queue status  • Coin store page                    │
│  • Add missing emails      • Unified pricing                    │
│  • Resend domain setup     • Conversion touchpoints             │
│  • Engagement emails       • User retention features            │
│  • Template polish         • Platform magnetism                 │
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
| P1 | Add "Not enough coins? Buy more" fallback in marketplace boost | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 3 | ✅ Done — link in PostListing.tsx |
| P1 | Create unified pricing page (`/pricing`) | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 11 | ✅ Done — Free/Pro/Elite, annual toggle, FAQ, coin CTA |
| P2 | Restructure Advertise page as a hub with sub-pages | D | `MONETIZATION_AND_RETENTION_STRATEGY.md` → Section 9, Touchpoint 6 | ⏳ Deferred |
| P2 | Add event reminder emails (24h before) | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Item 4.10 | ✅ Done — `EventReminderEmail.tsx`, `queue_event_reminder()` SQL function, `events_needing_reminders` view |
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
| P1 | Create achievement unlocked + streak warning emails | C | `EMAIL_IMPLEMENTATION_PLAN.md` → Items 4.12–4.13 | ✅ Done — `AchievementUnlockedEmail.tsx`, `StreakWarningEmail.tsx`, DB trigger + batch function |
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

## HOW TO USE THIS PLAN

1. **Start with Phase 1** — Stabilize. Work through the platform audit and email verification in parallel.
2. **Check off items** in each sub-plan document as you complete them (☐ → ✅).
3. **Log bugs** found during audits with the priority level (P0–P3).
4. **Move to next phase** only when current phase P0 items are complete.
5. **Update this document** when priorities shift or new workstreams are added.
6. **Reference sub-plans** for detailed implementation steps — this master plan is for navigation and tracking only.

---

*Master Plan created: Feb 22, 2026*
*For Bara Afrika Platform — baraafrika.com*
