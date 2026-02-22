# BARA AFRIKA — Monetization & User Retention Master Strategy

> A research-driven framework combining behavioral economics (Nir Eyal's Hooked Model), virtual economy design (Sinks & Faucets), African platform monetization models (Boomplay, Jumia, Flutterwave), and hybrid revenue strategies from Spotify, Duolingo, and Peloton.

---

## TABLE OF CONTENTS

1. [Platform Audit: What Exists Today](#1-platform-audit)
2. [Revenue Architecture: 12 Revenue Streams](#2-revenue-architecture)
3. [Bara Coin Economy: Sinks & Faucets Design](#3-bara-coin-economy)
4. [User Retention: The Hooked Model Applied](#4-user-retention)
5. [Feature-by-Feature Monetization Map](#5-feature-monetization-map)
6. [Implementation Priority Matrix](#6-implementation-priority)
7. [KPIs & Metrics Framework](#7-kpis)

---

## 1. PLATFORM AUDIT: What Exists Today {#1-platform-audit}

### Current Monetization Infrastructure

| Component | File(s) | Status | Revenue Potential |
|-----------|---------|--------|-------------------|
| **Gamification Engine** | `gamificationService.ts`, `useGamification.ts` | ✅ Built | Medium (coin sinks) |
| **Bara Coins (Virtual Currency)** | `gamificationService.ts` | ✅ Built | **High** (if coin purchase enabled) |
| **Daily Missions** | `DailyMissions.tsx` | ✅ Built | Medium (retention) |
| **Achievements** | `AchievementHall.tsx` | ✅ Built | Medium (retention) |
| **XP & Leveling** | `gamificationService.ts` | ✅ Built | Medium (retention) |
| **Prestige Tiers** | `gamificationService.ts` | ✅ Built | Low (no perks yet) |
| **Monetization Tracking** | `monetizationService.ts` | ✅ Built | High (analytics) |
| **Commission System** | `monetizationService.ts` | ✅ Built (Feb 2026) | High (marketplace 5%, tickets 3%) |
| **Marketing Performance** | `MarketingPerformance.tsx` | ⚠️ Mock data | High (ROI dashboard) |
| **Banner Ads (Sponsored)** | `BannerAd.tsx`, `TopBannerAd.tsx`, `BottomBannerAd.tsx` | ✅ Built + real tracking | **High** |
| **Banner Submission (User)** | `UserBannerSubmission.tsx` | ✅ Built | High |
| **Banner Admin** | `AdminBannerAds.tsx`, `AdminSponsoredBanners.tsx` | ✅ Built | High |
| **Admin Revenue Dashboard** | `AdminRevenue.tsx` | ✅ Built (Feb 2026) | High (KPIs, streams, transactions) |
| **Premium Features (Subscriptions)** | `PremiumFeatures.tsx`, `PricingPage.tsx` | ✅ Free during launch | **Very High** (when paid) |
| **Coin Store** | `CoinStorePage.tsx` | ✅ Functional — grants coins free | **Very High** (when paid) |
| **Event Ticketing** | `TicketPurchaseModal.tsx`, `eventsService.ts` | ✅ Built | High |
| **Marketplace Listings** | `PostListing.tsx` | ✅ Built | High |
| **Premium Listing Boost** | `PostListing.tsx` (50 coins) | ✅ Built + "Buy more" link | Medium |
| **Artist Track Boost** | `ArtistDashboard.tsx` (50 coins) | ✅ Built | Medium |
| **Artist Verification** | `ArtistVerificationPage.tsx` | ✅ Built (Feb 2026) | Medium ($10/mo) |
| **Business Premium Tiers** | `BusinessPremiumPage.tsx` | ✅ Built (Feb 2026) | High (Free/$15/$40) |
| **Referral System** | `InvitePage.tsx` | ✅ Built (Feb 2026) | Medium (viral growth) |
| **Leaderboard** | `LeaderboardPage.tsx` | ✅ Built (Feb 2026) | Medium (retention) |
| **Daily Spin Wheel** | `DailySpinWheel.tsx` | ✅ Built (Feb 2026) | Medium (retention) |
| **Cross-Feature Discovery** | `DiscoverMore.tsx` | ✅ Built (Feb 2026) | Medium (engagement) |
| **Admin Economy Controls** | `AdminGamification.tsx`, `AdminUsers.tsx` | ✅ Built | Operational |
| **Trust Rank System** | `gamificationService.ts` | ✅ Built | Medium (ad auctions) |
| **User Analytics** | `UserAnalytics.tsx` | ✅ Built | Medium (upsell) |
| **Sports Predictions** | `SportsPredictions.tsx` | ✅ Built (Feb 2026) | High (coin sink + engagement) |
| **Ad-Free Browsing** | `useAdFree.ts` + banner components | ✅ Built (Feb 2026) | Medium (20 coins/24h) |
| **Profile Themes** | `useProfileTheme.ts`, `ProfileThemesPage.tsx` | ✅ Built (Feb 2026) | Medium (30–100 coins) |
| **Affiliate Partners** | `AffiliatePage.tsx` | ✅ Built (Feb 2026) | Medium (referral commissions) |

### Key Gap Analysis (Updated Feb 22, 2026)

| Gap | Impact | Difficulty | Status |
|-----|--------|------------|--------|
| No real payment processor (Stripe/Paystack) | � Deferred — all features free during launch | Medium | ⏳ Deferred — will add when ready to monetize |
| Coins can't be purchased with real money | � Deferred — coins granted free for now | Medium | ⏳ Deferred — Coin Store functional, grants coins free |
| Subscriptions are "contact sales" only | � Resolved for launch — all plans instant-activate free | Medium | ✅ Fixed — no payment wall, toast activation |
| Banner click/view tracking is console.log only | � Fixed | Low | ✅ Fixed — `MonetizationService.trackInteraction()` in all 3 banner components |
| No commission on marketplace transactions | � Fixed | Medium | ✅ Fixed — `recordMarketplaceCommission()` (5%) in MonetizationService |
| No event organizer fees/commission | � Fixed | Medium | ✅ Fixed — `recordTicketCommission()` (3%) in MonetizationService |
| Streaming has no per-play royalty or ad model | 🟡 Deferred — artist verification free for now | High | ⏳ Deferred — verification page instant-activates free |
| No admin revenue visibility | � Fixed | Low | ✅ Fixed — Admin Revenue Dashboard at `/admin/revenue` |
| No referral/invite system | � Fixed | Low | ✅ Fixed — Invite page at `/invite` with referral links + milestones |
| No leaderboard or competitive engagement | � Fixed | Low | ✅ Fixed — Leaderboard at `/leaderboard` with XP/Coins/Streak tabs |
| No business directory premium tiers | � Fixed | Medium | ✅ Fixed — Business Premium page at `/business-premium` (Free/Pro/Elite) |
| No coin sinks beyond boosts | 🟢 Fixed | Low | ✅ Fixed — Sports predictions, ad-free browsing, profile themes |
| No affiliate/partner revenue | 🟢 Fixed | Low | ✅ Fixed — Partner page at `/partners` with 10 curated services |
| No sports engagement beyond scores | 🟢 Fixed | Medium | ✅ Fixed — Predictions at `/sports/predictions` with coin betting |
| Resend email on test domain only | 🟡 Low — works for dev, upgrade tomorrow | Low | ⏳ Remaining — purchase production domain |

---

## 2. REVENUE ARCHITECTURE: 12 Revenue Streams {#2-revenue-architecture}

Based on research from Jumia's hybrid model, Boomplay's ad+subscription model, Spotify's freemium conversion, and Eventbrite's commission structure:

### Stream 1: Bara Coin Purchases (Virtual Currency Sales)
**Model:** Users buy Bara Coins with real money (Stripe, Paystack, M-Pesa)
**Research basis:** Mobile games generate $0.50–$3.00 ARPU through virtual currency. Duolingo converts 5% of free users to paid via similar mechanics.

| Coin Pack | Price (USD) | Coins | Bonus | Effective Rate |
|-----------|-------------|-------|-------|----------------|
| Starter | $1.99 | 100 | — | $0.020/coin |
| Popular | $4.99 | 300 | +50 bonus | $0.014/coin |
| Power | $9.99 | 700 | +150 bonus | $0.012/coin |
| Elite | $24.99 | 2000 | +500 bonus | $0.010/coin |

**Behavioral hook:** Larger packs feel like better deals (anchoring effect). Bonus coins create perceived surplus value.

### Stream 2: Bara Premium Subscriptions
**Model:** Tiered monthly/annual plans (already have UI in `PremiumFeatures.tsx`)
**Research basis:** Spotify converts 40% of users to premium. Apps with tiered subscriptions report 30% lower churn on annual plans.

| Tier | Monthly | Annual | Key Perks |
|------|---------|--------|-----------|
| **Free** | $0 | $0 | Basic listings, 1 event/month, ads shown, 3 marketplace posts |
| **Bara Pro** | $5/mo | $50/yr | No ads, unlimited listings, analytics dashboard, priority support, 100 bonus coins/month, Pro badge |
| **Bara Elite** | $20/mo | $200/yr | Everything in Pro + featured placement, verified badge, 500 bonus coins/month, API access, white-label business page, dedicated account manager |

**Why this works for Africa:** Boomplay proved tiered subscription works in African markets. Key is keeping the free tier generous enough to drive adoption, while making Pro indispensable for serious businesses.

### Stream 3: Marketplace Commission
**Model:** 5–10% commission on marketplace transactions facilitated through the platform
**Research basis:** Jumia charges sellers 5–20% commission. Etsy charges 6.5% transaction fee. The industry average for marketplace take rate is 10–15%.

| Transaction Range | Commission |
|-------------------|------------|
| Under $50 | 5% |
| $50–$500 | 7.5% |
| Over $500 | 10% |

**Implementation:** Add Stripe/Paystack checkout to marketplace. Hold funds in escrow, release to seller minus commission after buyer confirms.

### Stream 4: Event Ticketing Commission
**Model:** Platform fee on paid event tickets
**Research basis:** Eventbrite charges 3.7% + $1.79 per paid ticket. Ticketmaster charges 10–25%.

| Event Type | Platform Fee |
|------------|-------------|
| Free events | $0 (drives adoption) |
| Paid events (organizer pays) | 5% of ticket price |
| Paid events (buyer absorbs) | 3% + $0.50 per ticket |

**Why free events stay free:** Your instinct was right — free events with unlimited capacity should auto-confirm. This drives community engagement which is the top of the monetization funnel.

### Stream 5: Sponsored Banner Advertising (CPM/CPC)
**Model:** Businesses pay to display banners on country pages, landing page, and community pages
**Research basis:** African digital ad spend reached $5.3B in 2024 (PwC). CPM for targeted community platforms ranges $5–$25.

**Already built:** `BannerAd.tsx`, `sponsored_banners` table, admin approval flow, payment status tracking.

**What's missing:** Real impression/click tracking (currently `console.log`), CPM/CPC billing, advertiser dashboard.

| Placement | CPM Rate | Estimated Monthly Revenue (10K MAU) |
|-----------|----------|--------------------------------------|
| Homepage top banner | $15 | $150–$450 |
| Country detail page | $10 | $100–$300 |
| Event listing sidebar | $8 | $80–$240 |
| Marketplace category page | $12 | $120–$360 |

### Stream 6: Featured/Promoted Listings
**Model:** Pay (coins or cash) to boost visibility
**Research basis:** Gumtree, OLX, and Craigslist all monetize through featured listings. Etsy's Promoted Listings generate 12% of their revenue.

**Already partially built:** `PostListing.tsx` has 50-coin premium boost.

**Expansion:**

| Boost Type | Cost (Coins) | Cost (Cash) | Duration | Effect |
|------------|-------------|-------------|----------|--------|
| Marketplace Spotlight | 50 coins | $2.99 | 7 days | Top of category |
| Event Highlight | 75 coins | $4.99 | Until event date | Featured banner on events page |
| Business Premium Badge | 100 coins | $9.99/month | 30 days | Verified badge, priority in search |
| Track Boost (Streams) | 50 coins | $2.99 | 24 hours | Top of trending feed |

### Stream 7: Business Directory Premium
**Model:** Tiered business listings (free → pro → premium)
**Research basis:** Yelp generates $1.1B/year primarily from business advertising. Google My Business premium features drive local commerce.

| Business Tier | Price | Features |
|---------------|-------|----------|
| **Basic (Free)** | $0 | Name, address, phone, 1 photo |
| **Pro** | $10/mo | Full gallery, social links, business hours, reviews, analytics |
| **Premium** | $25/mo | Everything + featured in search, sidebar ads, lead generation form, appointment booking |

### Stream 8: Streaming Revenue (Music)
**Model:** Hybrid ad-supported + premium streaming
**Research basis:** Boomplay combines ad revenue with premium subscriptions across 75M+ users. Mdundo reaches 20M users with ad+subscription hybrid.

| Model | Revenue Source |
|-------|---------------|
| Free tier | Pre-roll audio ads (15–30s) every 3–5 songs |
| Free tier | Display ads on player page |
| Pro subscriber | Ad-free listening, offline downloads, higher quality |
| Artist boost | Coins/cash to promote tracks to trending |

**Per-stream payout model:**
- Free tier: $0.001/stream (funded by ad revenue)
- Premium tier: $0.004/stream (funded by subscription pool)
- This mirrors Boomplay's model which pays $0.001–$0.005 per stream

### Stream 9: Sports Page Sponsorships
**Model:** Branded content partnerships and sponsored match coverage
**Research basis:** Sports media sponsorship is a $65B global market. Community-focused sports platforms can command premium CPMs due to engaged audiences.

| Sponsorship Type | Price Range |
|------------------|-------------|
| Match day sponsor banner | $50–$200/match |
| League section sponsor | $200–$500/month |
| Branded prediction game | $500–$1000/month |
| Sports newsletter sponsor | $100–$300/issue |

### Stream 10: Data & Analytics Services
**Model:** Aggregated, anonymized community insights for brands targeting African diaspora
**Research basis:** Ethical data monetization is a growing $10B+ market. Platforms with community-specific demographic data command premium pricing.

| Product | Price | Audience |
|---------|-------|----------|
| Community Insights Report | $500–$2000 | Brands, NGOs |
| Demographic Dashboard | $200/mo | Marketers |
| Event Attendance Analytics | $100/event | Organizers |

### Stream 11: White-Label & API Access
**Model:** License the Bara community infrastructure to other African communities
**Research basis:** SaaS/PaaS models for community platforms (Circle, Mighty Networks) charge $33–$119/month.

### Stream 12: Affiliate & Referral Revenue
**Model:** Earn commission by referring users to partner services
**Research basis:** Affiliate marketing generates 15–30% of all digital media revenue globally.

| Partner Type | Commission Model |
|-------------|-----------------|
| Travel booking (flights to Africa) | 3–8% of booking |
| Money transfer (remittance) | $1–$5 per transfer |
| African fashion/food e-commerce | 5–15% of sale |
| Language learning apps | $5–$10 per signup |

---

## 3. BARA COIN ECONOMY: Sinks & Faucets Design {#3-bara-coin-economy}

Based on research from virtual game economy design (World of Warcraft, Fortnite, Roblox), the key to a healthy virtual economy is balancing **faucets** (ways coins enter) and **sinks** (ways coins exit).

### Current State Problem
Your economy has many faucets but insufficient sinks, which means coins accumulate with no utility pressure. Users have no reason to buy coins because they earn them faster than they can spend them.

### Faucets (Coin Inflow) — Currently Active

| Faucet | Coins Earned | Frequency |
|--------|-------------|-----------|
| Level up bonus | Level × 10 | Per level |
| Achievement rewards | Varies (10–100) | One-time |
| Mission rewards | Varies (5–50) | Daily |
| Streak multiplier | Amplifies XP | Daily |
| Sign-in bonus | 50 XP (indirect) | Daily |

### Sinks (Coin Outflow) — Must Expand

| Sink | Cost | Status | Priority |
|------|------|--------|----------|
| Marketplace listing boost | 50 coins | ✅ Built | — |
| Track boost (streams) | 50 coins | ✅ Built | — |
| **Event highlight** | 75 coins | 🔲 New | High |
| **Business premium badge** | 100 coins/mo | 🔲 New | High |
| **Custom profile themes** | 30 coins | 🔲 New | Medium |
| **Exclusive community access** | 50 coins | 🔲 New | Medium |
| **Gift coins to other users** | Variable | 🔲 New | Medium |
| **Unlock analytics dashboard** | 200 coins | 🔲 New | High |
| **Priority customer support** | 25 coins/ticket | 🔲 New | Low |
| **Ad-free browsing (24h)** | 20 coins | 🔲 New | High |
| **Raffle/lottery entries** | 10 coins/entry | 🔲 New | Medium |
| **Sponsored post in community feed** | 100 coins | 🔲 New | High |

### Economy Balance Principles

1. **Scarcity creates value:** Reduce free coin distribution by ~30% once coin purchases launch
2. **Loss aversion:** Show users what they're missing (locked premium features with coin prices)
3. **Endowment effect:** Give new users 50 free coins so they feel they "have" something to protect
4. **Sunk cost fallacy:** The more coins users spend, the more committed they become to the platform
5. **Time-gated abundance:** Daily login bonuses create habit, but cap at small amounts to maintain purchase incentive
6. **Deflationary pressure:** Ensure total sinks > total faucets so coins maintain perceived value

### Dual Currency Strategy (Advanced)

Consider introducing a second currency for premium-only actions:

| Currency | Earned By | Used For |
|----------|-----------|----------|
| **Bara Coins** (soft) | Playing, missions, achievements | Boosts, cosmetics, minor features |
| **Bara Gems** (hard) | Real money purchase only | Premium subscriptions, ad removal, exclusive content, direct business promotion |

This is the model used by Clash of Clans (Gold/Gems), Fortnite (V-Bucks), and Duolingo (Hearts/Gems). It prevents inflation while preserving the fun of earning.

---

## 4. USER RETENTION: The Hooked Model Applied {#4-user-retention}

Based on Nir Eyal's Hooked Model and behavioral economics research:

### The Hook Cycle for Bara Afrika

```
TRIGGER → ACTION → VARIABLE REWARD → INVESTMENT
   ↑                                        |
   └────────────────────────────────────────┘
```

### Phase 1: TRIGGER (Get Users to Open the App)

| Trigger Type | Implementation | Behavioral Principle |
|-------------|----------------|---------------------|
| **Push notification:** "Your daily missions reset! 3 new challenges await" | Cron job at 8am local time | Curiosity gap |
| **Email:** "New events in [Country] this weekend" | Weekly digest | FOMO (Fear of Missing Out) |
| **Push:** "🔥 Your 7-day streak is at risk! Login to keep it" | 23h after last login | Loss aversion |
| **Push:** "[Friend] just earned the Power Listener badge" | Real-time | Social proof |
| **Email:** "Your marketplace listing got 50 views this week" | Weekly analytics | Investment protection |
| **Push:** "New music from artists in [Country]" | On new upload | Novelty seeking |
| **Internal trigger:** Boredom → "Let me check what's new on Bara" | Habit formation over time | Variable reward anticipation |

### Phase 2: ACTION (Make It Effortless)

**Principle:** BJ Fogg's Behavior Model — Behavior = Motivation × Ability × Trigger. Reduce friction relentlessly.

| Current Friction | Fix | Impact |
|-----------------|-----|--------|
| Must sign in to browse events | Allow anonymous browsing, gate registration | +30% page views |
| Marketplace posting requires many fields | Progressive disclosure (basic → details) | +25% listing completion |
| Music requires navigation to streams page | Mini-player on all pages | +40% listening time |
| Community pages require finding in footer | Add "My Communities" to user dashboard | +20% community engagement |

### Phase 3: VARIABLE REWARD (The Dopamine Engine)

Three types of variable rewards (from Nir Eyal):

#### Rewards of the Tribe (Social)
- **Leaderboard position changes:** "You moved up 3 spots this week!"
- **Community recognition:** "You're the #1 contributor in Rwandaful Rwanda"
- **Social proof badges:** Visible prestige tiers (Explorer → Bronze → Silver → Gold → Diamond)
- **User-to-user coin gifting:** Public gifting creates social status

#### Rewards of the Hunt (Material)
- **Daily mystery box:** Login → spin wheel → random reward (5–500 coins)
- **Flash sales on premium features:** "50% off Business Pro badge for the next 2 hours"
- **Weekly treasure hunt:** Hidden coins scattered across platform pages
- **Seasonal limited achievements:** "Africa Month Explorer" badge (only available in May)

#### Rewards of the Self (Mastery)
- **Level progression with visible milestones:** Level bar always visible in nav
- **Skill-based missions:** "List 5 items → unlock Merchant title"
- **Collection mechanics:** "Earn all 10 Country Explorer badges"
- **Streak records:** "Your personal best: 23 days! Can you beat it?"

### Phase 4: INVESTMENT (Lock Users In)

Every action a user takes increases their switching cost:

| Investment Type | Implementation | Lock-in Effect |
|----------------|----------------|----------------|
| **Profile building** | Business page, photos, reviews | Content they don't want to lose |
| **Reputation** | Review scores, trust rank, verified badge | Social capital |
| **Coin balance** | Accumulated Bara Coins | Sunk cost fallacy |
| **Achievement collection** | Badges earned over months | Completion drive |
| **Social graph** | Followers, community memberships | Network effect |
| **Content history** | Playlists, saved events, listing history | Personalization |
| **Streak count** | 30-day streak with 2x multiplier | Fear of losing progress |

### Retention Calendar (Weekly Engagement Cadence)

| Day | Trigger | Content |
|-----|---------|---------|
| Monday | Push | "New week, new missions! 5 challenges unlocked" |
| Tuesday | Email | "Trending events near you this week" |
| Wednesday | Push | "New music drop: [Artist] just released [Track]" |
| Thursday | In-app | "Flash deal: 2x coins on all missions today" |
| Friday | Push | "Weekend events starting tomorrow — secure your spot" |
| Saturday | Push | "Community highlight: See what [Community] is up to" |
| Sunday | Email | "Your weekly recap: X views, Y coins earned, Z level progress" |

---

## 5. FEATURE-BY-FEATURE MONETIZATION MAP {#5-feature-monetization-map}

### Events

| Revenue Source | Model | Est. Monthly Revenue (10K MAU) |
|---------------|-------|-------------------------------|
| Ticket commission (5%) | Per-transaction | $200–$1,000 |
| Event highlight boost | 75 coins or $4.99 | $100–$500 |
| Organizer Pro subscription | $15/mo | $150–$750 |
| Sponsored event banner | $50–$200/event | $200–$800 |
| **Subtotal** | | **$650–$3,050** |

### Marketplace

| Revenue Source | Model | Est. Monthly Revenue |
|---------------|-------|---------------------|
| Transaction commission (5–10%) | Per-sale | $500–$2,500 |
| Featured listing boost | 50 coins or $2.99 | $150–$600 |
| Seller Pro subscription | $10/mo | $200–$1,000 |
| Category sponsor banner | $100–$300/mo | $100–$300 |
| **Subtotal** | | **$950–$4,400** |

### Streams (Music)

| Revenue Source | Model | Est. Monthly Revenue |
|---------------|-------|---------------------|
| Audio ads (free tier) | CPM $8–$15 | $100–$500 |
| Display ads on player | CPM $5–$10 | $50–$200 |
| Premium ad-free subscription | $3/mo | $300–$1,500 |
| Track boost (artists) | 50 coins or $2.99 | $50–$300 |
| Artist verification badge | $10/mo | $50–$200 |
| **Subtotal** | | **$550–$2,700** |

### Business Listings

| Revenue Source | Model | Est. Monthly Revenue |
|---------------|-------|---------------------|
| Business Pro tier | $10/mo | $200–$1,000 |
| Business Premium tier | $25/mo | $250–$1,250 |
| Verified badge | $5/mo | $100–$500 |
| Featured in search | 100 coins or $9.99/mo | $100–$500 |
| **Subtotal** | | **$650–$3,250** |

### Banner Advertising (Global)

| Revenue Source | Model | Est. Monthly Revenue |
|---------------|-------|---------------------|
| Homepage banners | CPM $15 | $150–$750 |
| Country page banners | CPM $10 | $200–$1,000 |
| Community page banners | CPM $8 | $80–$400 |
| Sports page banners | CPM $12 | $120–$600 |
| **Subtotal** | | **$550–$2,750** |

### Bara Coins (Virtual Currency Sales)

| Revenue Source | Model | Est. Monthly Revenue |
|---------------|-------|---------------------|
| Direct coin purchases | IAP | $200–$2,000 |
| Coin bundles (promotional) | Flash sales | $100–$500 |
| **Subtotal** | | **$300–$2,500** |

### Subscriptions (Bara Pro/Elite)

| Revenue Source | Model | Est. Monthly Revenue |
|---------------|-------|---------------------|
| Bara Pro ($5/mo) | Subscription | $500–$2,500 |
| Bara Elite ($20/mo) | Subscription | $200–$1,000 |
| **Subtotal** | | **$700–$3,500** |

### TOTAL ESTIMATED MONTHLY REVENUE

| Scenario | 10K MAU | 50K MAU | 100K MAU |
|----------|---------|---------|----------|
| Conservative | $4,350 | $21,750 | $43,500 |
| Mid-range | $11,575 | $57,875 | $115,750 |
| Optimistic | $22,150 | $110,750 | $221,500 |

---

## 6. IMPLEMENTATION PRIORITY MATRIX {#6-implementation-priority}

### Phase 1: Foundation (Weeks 1–4) — "Turn on the Money"

| Task | Revenue Impact | Effort |
|------|---------------|--------|
| Integrate Paystack/Stripe for payments | 🔴 Critical | Medium |
| Enable real coin purchases | 🔴 Critical | Medium |
| Activate subscription billing (Pro/Elite) | 🔴 Critical | Medium |
| Wire up banner impression/click tracking (replace console.log) | 🟡 High | Low |
| Add marketplace transaction commission | 🟡 High | Medium |
| Add event ticketing commission | 🟡 High | Low |

### Phase 2: Retention Engine (Weeks 5–8) — "Keep Them Coming Back"

| Task | Retention Impact | Effort |
|------|-----------------|--------|
| Push notification system (Firebase/OneSignal) | 🔴 Critical | Medium |
| Weekly email digest (events, music, analytics) | 🔴 Critical | Medium |
| Daily mystery box / spin wheel | 🟡 High | Low |
| Streak risk notifications | 🟡 High | Low |
| Mini-player on all pages | 🟡 High | Medium |
| Weekly analytics email for content creators | 🟡 High | Medium |

### Phase 3: Economy Expansion (Weeks 9–12) — "Deepen the Hooks"

| Task | Impact | Effort |
|------|--------|--------|
| Add 6+ new coin sinks | 🟡 High | Medium |
| Introduce Bara Gems (hard currency) | 🟡 High | Medium |
| Advertiser self-serve dashboard | 🟡 High | High |
| Business directory premium tiers | 🟡 High | Medium |
| Artist verification + premium tools | 🟡 Medium | Medium |
| Seasonal limited-time achievements | 🟡 Medium | Low |

### Phase 4: Scale (Months 4–6) — "Network Effects"

| Task | Impact | Effort |
|------|--------|--------|
| Affiliate/referral program | 🟡 Medium | Medium |
| Data insights product | 🟡 Medium | High |
| API/white-label licensing | 🟡 Medium | High |
| Sports sponsorship sales | 🟡 Medium | Medium |
| Podcast/audio ad integration | 🟡 Medium | High |

---

## 7. KPIs & METRICS FRAMEWORK {#7-kpis}

### North Star Metric
**Weekly Active Community Engagements (WACE)** = sum of (event registrations + marketplace interactions + music plays + community visits + mission completions)

### Revenue Metrics

| Metric | Target (6 months) | Measurement |
|--------|-------------------|-------------|
| Monthly Recurring Revenue (MRR) | $5,000+ | Subscriptions + recurring banner ads |
| Average Revenue Per User (ARPU) | $0.50+ | Total revenue / MAU |
| Conversion Rate (free → paid) | 3–5% | Paying users / total users |
| Coin Purchase Rate | 2–4% | Users who buy coins / total users |
| Lifetime Value (LTV) | $15+ | Total revenue per user over lifetime |

### Retention Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Day 1 Retention | 40%+ | Users who return within 24h of signup |
| Day 7 Retention | 25%+ | Users active 7 days after signup |
| Day 30 Retention | 15%+ | Users active 30 days after signup |
| Daily Active / Monthly Active (DAU/MAU) | 20%+ | Stickiness ratio |
| Average Session Duration | 5+ min | Time in app per visit |
| Mission Completion Rate | 30%+ | Completed missions / assigned missions |
| Streak Length (median) | 5+ days | Consecutive login days |

### Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Events per user per month | 2+ | Event registrations / active users |
| Marketplace listings per seller | 3+ | Total listings / unique sellers |
| Songs played per session | 5+ | Play events / sessions |
| Community visits per week | 3+ | Community page views / active users |
| Achievement unlock rate | 40%+ | Users with 3+ achievements / total users |

---

---

## 8. USER JOURNEY & CONVERSION ARCHITECTURE {#8-user-journey}

### Current User-Facing Monetization Pages (Audit)

| Page | Route | What It Sells | CTA Result | Problem |
|------|-------|---------------|------------|---------|
| **Advertise Page** | `/advertise` | Bara Pro ($19/mo), Elite ($79/mo), CPC bidding | → Checkout page | ✅ Great premium feel, but checkout just shows a toast — no real payment |
| **Advertise Checkout** | `/advertise/checkout` | Pro/Elite tier + CPC bid configuration | → Toast + redirect to dashboard | 🔴 No Stripe/Paystack — user pays nothing, gets nothing |
| **Sponsor Country** | `/sponsor-country` | Banner on a country page ($25) | → mailto: email to admin | 🟡 Works for early stage, but friction kills conversion at scale |
| **Premium Features** | Embedded in business listing flow | Normal/Pro/Premium plans ($0/$5/$20) | → mailto: email to admin | 🔴 Inconsistent pricing with Advertise page ($19 vs $5) |
| **User Banner Submission** | `/users/dashboard/banner-submissions` | Submit a banner ad | → Supabase upload + admin review | 🟡 Good flow, but no pricing shown, no self-serve payment |
| **Marketplace Boost** | Inside `PostListing.tsx` | 50 Bara Coins to boost listing | → Coin spend (works!) | ✅ This is your BEST conversion moment — expand it |
| **Track Boost** | Inside `ArtistDashboard.tsx` | 50 Bara Coins to promote track | → Coin spend (works!) | ✅ Same — excellent micro-transaction |

### Critical Structural Problems

#### Problem 1: Three Different Pricing Structures
Your platform currently presents **three conflicting price points** for what sounds like the same "premium" offering:

| Where | Name | Price |
|-------|------|-------|
| `/advertise` | Bara Pro | **$19/mo** |
| `/advertise` | Bara Elite | **$79/mo** |
| `PremiumFeatures.tsx` (business listing) | Pro | **$5/mo** |
| `PremiumFeatures.tsx` (business listing) | Premium | **$20/mo** |

**Fix:** Unify into ONE pricing architecture. The Advertise page tiers ($19/$79) are for **advertisers/businesses**, and the Premium Features ($5/$20) should be for **individual users**. Make the distinction crystal clear with different naming:

| Tier | For | Price | Name |
|------|-----|-------|------|
| Free | Everyone | $0 | Bara Free |
| User Premium | Individual users | $5/mo | Bara+ |
| Business Pro | Sellers, event organizers, artists | $19/mo | Bara Business |
| Enterprise | Large advertisers, agencies | $79/mo | Bara Enterprise |

#### Problem 2: "Contact Sales" Kills Conversion
Three of your monetization pages end with a `mailto:` link. Every extra step between intent and payment loses 40-60% of users (Baymard Institute research). 

**Current flow:**
```
User sees pricing → Clicks "Upgrade" → Sees "Contact Sales" email → LEAVES
```

**Target flow:**
```
User sees pricing → Clicks "Upgrade" → Enters card details → INSTANT ACCESS
```

#### Problem 3: No Coin Purchase Page
You have an entire gamification economy (coins, boosts, missions) but **no way for users to buy coins with real money**. This is like building a casino with no cashier window.

**Missing page:** `/coins` or `/store` — a dedicated Bara Coin Store page.

#### Problem 4: User Dashboard Doesn't Upsell
The `UserDashboard.tsx` sidebar has zero monetization touchpoints. It lists My Events, My Tickets, Listings, Analytics — but never says "Upgrade to Pro" or shows coin balance or prompts the user to do anything premium.

#### Problem 5: No "Why Upgrade?" Moments
Users never encounter friction that makes them *want* to pay. Everything is free with no limitations. There are no soft walls, no "You've reached your limit" moments, no "Unlock this with Pro" overlays.

---

## 9. HOW TO PRESENT MONETIZATION TO USERS {#9-presenting-monetization}

### The 7 Conversion Touchpoints (Where Users Should See Paid Options)

The key principle: **Don't just have a pricing page. Weave upgrade prompts into the moments where users feel the most value or hit a natural limit.**

#### Touchpoint 1: The Header — Coin Balance + Upgrade CTA

**Current state:** Header shows XP progress bar in the user dropdown, prestige tier border on avatar. No coin balance. No upgrade CTA.

**Proposed:** Add a small coin balance indicator next to the notification bell for signed-in users, and a subtle "⚡ Go Pro" badge.

```
[Events] [Blog] [Listings] [Marketplace] [Advertise] ... 🪙 250 | 🔔 | [Avatar]
```

**Why:** Constant visibility of coin balance triggers the endowment effect — users value what they already have and want more. Seeing it deplete motivates purchase.

#### Touchpoint 2: User Dashboard Sidebar — Premium Upsell Card

**Current state:** Sidebar shows nav links + verification status. No upsell.

**Proposed:** Below the verification card, add a "Go Premium" card:
```
┌─────────────────────────┐
│ ⚡ Unlock Bara+          │
│                          │
│ • No ads                 │
│ • Unlimited listings     │
│ • Analytics dashboard    │
│ • 100 bonus coins/month  │
│                          │
│ [Upgrade — $5/mo]        │
└─────────────────────────┘
```

**Why:** This is where your most engaged users spend time. It's the highest-intent location for conversion.

#### Touchpoint 3: Marketplace — Post Listing Boost Upsell

**Current state:** The "Boost for 50 Coins" checkbox in `PostListing.tsx` is excellent.

**Proposed expansions:**
- After posting, show: *"Your listing is live! Boost it to reach 10x more buyers"* with a one-click boost
- On `MyListings` page, show performance comparison: *"Boosted listings get 340% more views"* (even if estimated)
- If user has 0 coins: *"Get 100 coins for $1.99"* inline CTA

#### Touchpoint 4: Events — Organizer Upgrade Prompt

**Current state:** Any user can create events for free with no limits.

**Proposed soft walls:**
- Free users: 1 active event at a time, basic analytics
- Pro users: Unlimited events, detailed analytics, custom registration forms, priority in event search
- After creating first event: *"Want to create more? Upgrade to Bara Business"*
- On event analytics: *"See detailed attendee demographics — available with Bara Business"* (blurred preview)

#### Touchpoint 5: Streams — Artist Growth Prompts

**Current state:** Creator Portal has a "Boost Now (50 Coins)" button and a "Bara Stream Verification" card.

**Proposed expansions:**
- After 100 plays: *"Your track is gaining traction! Boost it to the trending page for 50 coins"*
- On artist profile: *"Verified artists get 40% more streams — Apply for verification ($10/mo)"*
- Growth chart shows: *"Unlock detailed analytics with Bara Business"*

#### Touchpoint 6: The Advertise Page — Restructured as a Hub

**Current state:** Beautiful premium page selling Pro ($19) and Elite ($79) with CPC bidding.

**Proposed restructure — make it a comprehensive "Grow Your Business" hub:**

```
/advertise (Landing page)
├── /advertise/banners      → Self-serve banner ad creation & payment
├── /advertise/boost        → Boost listings, events, tracks
├── /advertise/sponsor      → Sponsor a country page
├── /advertise/business     → Bara Business subscription
├── /advertise/enterprise   → Bara Enterprise + contact sales
└── /advertise/checkout     → Unified checkout for any product
```

Each sub-page should:
1. Show social proof (*"500+ businesses use Bara to reach the African diaspora"*)
2. Show ROI calculator (*"Estimated reach: 5,000 impressions/month"*)
3. Have a single, clear CTA with instant payment
4. Show testimonials or case studies (even fabricated examples for prototype)

#### Touchpoint 7: The Coin Store — New Dedicated Page

**Missing entirely.** Create `/store` or `/coins`:

```
┌──────────────────────────────────────────────┐
│          🪙 Bara Coin Store                   │
│                                               │
│  Your Balance: 50 coins                       │
│                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ 100     │ │ 300+50  │ │ 700+150 │        │
│  │ coins   │ │ coins   │ │ coins   │        │
│  │ $1.99   │ │ $4.99 ★ │ │ $9.99   │        │
│  │ [Buy]   │ │ [Buy]   │ │ [Buy]   │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                               │
│  What can you do with coins?                  │
│  ✦ Boost marketplace listings (50 coins)     │
│  ✦ Promote your music (50 coins)             │
│  ✦ Get a verified badge (100 coins/mo)       │
│  ✦ Remove ads for 24h (20 coins)             │
│  ✦ Highlight your event (75 coins)           │
│                                               │
│  Or earn coins for FREE:                      │
│  ✦ Complete daily missions                    │
│  ✦ Maintain your login streak                 │
│  ✦ Unlock achievements                        │
└──────────────────────────────────────────────┘
```

**Why this is critical:** This page is the bridge between your gamification system (which is excellent) and real revenue. Without it, coins have no cash value and the entire economy is decorative.

---

## 10. PLATFORM MAGNETISM: MAKING USERS STAY & HAVE FUN {#10-platform-magnetism}

### The "One More Thing" Principle

Every page a user visits should hint at something **else** they can do. The goal is that a user who comes for events discovers music, a user who comes for music discovers the marketplace, and so on.

#### Cross-Feature Discovery Map

| User came for... | Show them... | How |
|-------------------|-------------|-----|
| Events | "Artists performing at this event →" | Link to streams page |
| Events | "Sell merchandise for your event →" | Link to marketplace |
| Marketplace | "Promote your listing to 5x more buyers →" | Boost with coins |
| Marketplace | "Upcoming events in your city →" | Sidebar widget |
| Streams (Music) | "This artist is performing at [Event] →" | Cross-link |
| Streams (Music) | "Support this artist: Gift coins →" | Social transaction |
| Sports | "Join the match discussion →" | Community link |
| Sports | "Predict the score → Win coins →" | Gamification |
| Communities | "Events in [Country] →" | Events widget |
| Blog | "Write your own post → Earn 50 XP →" | Gamification hook |
| Country page | "Businesses in [Country] →" | Business directory |
| Country page | "This page is sponsored by [Brand] →" | Banner ad value |

#### Fun Features That Drive Retention (Low Effort, High Impact)

| Feature | Where | Coins Involved | Fun Factor |
|---------|-------|---------------|------------|
| **Daily Spin Wheel** | Dashboard home | Win 5–500 coins | 🎰 Gambling dopamine |
| **Prediction Game** | Sports page | Bet 10 coins on match result | ⚽ Competitive social |
| **Weekly Leaderboard** | Dashboard sidebar | Top 10 get bonus coins | 🏆 Status competition |
| **Mystery Achievement** | Hidden across platform | Reveal on unlock | 🔍 Exploration drive |
| **Referral Challenge** | User profile | 100 coins per invited friend who signs up | 📢 Viral growth |
| **Collection Album** | Dashboard | Earn stamps for visiting 10 country pages | 🗺️ Completionism |
| **Community Challenges** | Community pages | "Most active member this week" | 👑 Social recognition |
| **Flash Deals** | Random pop-up (max 1/day) | "50% off listing boost for 2 hours" | ⏰ Urgency/scarcity |

### The Engagement Flywheel

```
   ┌──────────────────────────────────────────┐
   │                                          │
   │  FREE CONTENT ──→ USER ENGAGEMENT ──→    │
   │  (events, music,     (missions, streaks, │
   │   marketplace,        achievements)      │
   │   communities)                           │
   │       │                    │             │
   │       ▼                    ▼             │
   │  SOCIAL HOOKS ◄── VIRTUAL ECONOMY       │
   │  (leaderboards,    (coins earned,        │
   │   badges, gifting,  coins spent,         │
   │   referrals)        boosts purchased)    │
   │       │                    │             │
   │       ▼                    ▼             │
   │  NETWORK EFFECT ──→ MONETIZATION         │
   │  (more users =      (ads worth more,     │
   │   more content =     more subscribers,   │
   │   more value)        more transactions)  │
   │                                          │
   └──────────────────────────────────────────┘
```

The flywheel works because:
1. **Free content** draws users in (events, music, marketplace — all free to browse)
2. **Gamification** makes them stay (daily missions, streaks, achievements)
3. **Social hooks** make them invite others (leaderboards, badges, referral coins)
4. **Virtual economy** creates upgrade desire (coins feel valuable → want more → buy)
5. **Network effect** makes ads/premium worth more (more eyeballs = higher CPM, more sellers = marketplace commission)

---

## 11. STRUCTURAL GAPS: MISSING PAGES & FEATURES {#11-structural-gaps}

### Pages That Should Exist But Don't

| Missing Page | Route | Purpose | Revenue Impact |
|-------------|-------|---------|---------------|
| **Bara Coin Store** | `/store` | Buy coins with real money | 🔴 Critical — enables virtual economy |
| **Pricing Page** | `/pricing` | Unified overview of ALL paid options | 🔴 Critical — single source of truth |
| **Referral/Invite Page** | `/invite` | Share link, earn coins per signup | 🟡 High — viral acquisition |
| **Business Dashboard** | `/business/dashboard` | Analytics, banner management, ROI for business users | 🟡 High — retains paying businesses |
| **Creator Monetization Page** | `/streams/monetization` | Show artists how to earn (plays, tips, boosts) | 🟡 Medium — attracts artists |
| **Success Stories / Case Studies** | `/success-stories` | Social proof for advertisers and businesses | 🟡 Medium — conversion support |
| **Leaderboard Page** | `/leaderboard` | Full platform leaderboard with tiers | 🟢 Low — retention & fun |

### Features That Should Be Added to Existing Pages

| Existing Page | Missing Feature | Impact |
|--------------|-----------------|--------|
| **Header** (`Header.tsx`) | Coin balance display for signed-in users | 🟡 High — constant visibility |
| **Header** (`Header.tsx`) | "Go Pro" / upgrade badge | 🟡 High — persistent CTA |
| **User Dashboard** (`UserDashboard.tsx`) | Premium upsell card in sidebar | 🔴 Critical — highest-intent location |
| **User Dashboard** (`UserDashboard.tsx`) | Coin balance + "Buy More" link | 🔴 Critical |
| **User Dashboard** (`UserDashboard.tsx`) | Daily mission widget on dashboard home | 🟡 High — daily engagement |
| **User Dashboard** (`UserDashboard.tsx`) | "Invite Friends" card with referral link | 🟡 High — viral growth |
| **Marketplace** (`PostListing.tsx`) | "Not enough coins? Buy more →" fallback | 🟡 High — conversion at friction point |
| **Events Page** (`EventsPage.tsx`) | "Promote your event" CTA for organizers | 🟡 Medium |
| **Country Detail** (`CountryDetailPage.tsx`) | "Sponsor this page" CTA (currently only in footer) | 🟡 Medium — advertiser conversion |
| **Streams Home** (`StreamsHome.tsx`) | Premium badge on boosted tracks | 🟡 Medium — social proof for boosts |
| **Landing Page** | Gamification teaser ("Earn coins, unlock rewards") | 🟡 Medium — acquisition |
| **Footer** (`Footer.tsx`) | "Advertise With Us" link is commented out — uncomment it | 🟢 Low — free visibility |

### Admin Features That Should Be Enhanced

| Existing Admin Page | Missing Feature | Why |
|--------------------|-----------------|-----|
| **AdminGamification** | Economy health alerts (inflation warning if faucets > sinks) | Prevent coin devaluation |
| **AdminGamification** | Revenue dashboard (coin purchases, subscriptions, commissions) | Track actual money |
| **AdminBannerAds** | Impression/click counts from real tracking (not console.log) | Prove ROI to advertisers |
| **AdminUsers** | Subscription status column, revenue per user | Identify VIPs |
| **AdminDashboard** | Total revenue widget, conversion funnel visualization | Business intelligence |

---

## 12. COMPLETE MONETIZATION SURFACE AREA {#12-surface-area}

### Every Place on the Platform Where Money Can Be Made

This is the master checklist. Everything marked ❌ is a missed opportunity:

| # | Monetization Surface | Currently Active | Revenue Type |
|---|---------------------|-----------------|--------------|
| 1 | Marketplace listing boost (coins) | ✅ | Virtual currency |
| 2 | Track/song boost (coins) | ✅ | Virtual currency |
| 3 | Banner ads (sponsored_banners table) | ✅ (partial) | Display advertising |
| 4 | Advertise page (Pro/Elite tiers) | ⚠️ No real payment | Subscription |
| 5 | Premium Features (business tiers) | ⚠️ No real payment | Subscription |
| 6 | Sponsor Country page | ⚠️ Email only | Display advertising |
| 7 | User banner submission | ⚠️ No pricing shown | Display advertising |
| 8 | Coin purchase store | ❌ Missing | Virtual currency sales |
| 9 | Marketplace transaction commission | ❌ Missing | Commission |
| 10 | Event ticket commission | ❌ Missing | Commission |
| 11 | Featured event highlight (coins/cash) | ❌ Missing | Promoted content |
| 12 | Business directory premium tiers | ❌ Missing | Subscription |
| 13 | Artist verification badge | ❌ Missing | Subscription |
| 14 | Audio ads (streams free tier) | ❌ Missing | Audio advertising |
| 15 | Sports prediction game (coin bets) | ❌ Missing | Virtual currency sink |
| 16 | Referral rewards (coins) | ❌ Missing | Viral acquisition |
| 17 | Daily spin wheel | ❌ Missing | Engagement retention |
| 18 | Ad-free browsing (coins) | ❌ Missing | Virtual currency sink |
| 19 | Community sponsored posts (coins) | ❌ Missing | Virtual currency sink |
| 20 | Custom profile themes (coins) | ❌ Missing | Virtual currency sink |
| 21 | Blog promoted posts | ❌ Missing | Promoted content |
| 22 | Affiliate links (travel, remittance) | ❌ Missing | Affiliate commission |
| 23 | Data/analytics product for brands | ❌ Missing | B2B SaaS |
| 24 | Push notification sponsorship | ❌ Missing | Advertising |

**Active revenue surfaces: 7 of 24 (29%)**
**Goal: 18+ of 24 (75%) within 6 months**

---

## APPENDIX A: Key Research Sources

1. **Nir Eyal — Hooked Model:** Trigger → Action → Variable Reward → Investment cycle for habit formation
2. **BJ Fogg Behavior Model:** B = MAP (Motivation × Ability × Prompt)
3. **AfriMass 2025 (Accra):** African media monetization requires moving beyond passion-driven content to sustainable revenue models
4. **Boomplay/Mdundo models:** Hybrid ad + subscription works for African music streaming
5. **Jumia hybrid model:** Commission + logistics fees + ad placements = diversified revenue
6. **Flutterwave:** Transaction fee model generated $170M+ revenue
7. **Spotify:** 40% premium conversion through personalization and hybrid monetization
8. **Duolingo:** 5% free-to-paid conversion via gamification (XP, streaks, hearts)
9. **Peloton:** Community + leaderboards + content updates drive 92% annual retention
10. **Virtual Economy Design (Sinks & Faucets):** Balance currency creation with consumption to prevent inflation
11. **Sharetribe Marketplace Guide:** Commission (most popular), freemium, featured listings, subscriptions as revenue models
12. **PwC Africa Entertainment Outlook 2025–2029:** African digital ad spend projected to reach $7B by 2029

## APPENDIX B: Existing Codebase Files Reference

### Gamification
- `src/lib/gamificationService.ts` — Core service (XP, coins, achievements, missions, streaks)
- `src/hooks/useGamification.ts` — React hook with real-time profile subscription
- `src/components/gamification/DailyMissions.tsx` — Floating mission widget
- `src/components/gamification/AchievementHall.tsx` — Achievement display grid

### Monetization
- `src/lib/monetizationService.ts` — Interaction tracking (impressions, clicks, cost)
- `src/components/monetization/MarketingPerformance.tsx` — ROI dashboard (mock data)
- `src/components/PremiumFeatures.tsx` — Subscription tiers UI

### Banner Ads
- `src/components/BannerAd.tsx` — Main banner slideshow component
- `src/components/TopBannerAd.tsx` — Top placement
- `src/components/BottomBannerAd.tsx` — Bottom placement
- `src/components/sports/SponsorshipBanner.tsx` — Sports page banners
- `src/hooks/useSponsoredBanners.ts` — Banner CRUD operations
- `src/types/sponsoredBanner.types.ts` — TypeScript interfaces
- `src/pages/admin/AdminBannerAds.tsx` — Admin banner management
- `src/pages/admin/AdminSponsoredBanners.tsx` — Sponsored banner approval

### Admin
- `src/pages/admin/AdminGamification.tsx` — Economy & gamification dashboard
- `src/pages/admin/AdminUsers.tsx` — User economy controls (coin balance, trust rank)

### User Dashboard
- `src/pages/users/UserAnalytics.tsx` — User performance metrics + achievement hall
- `src/pages/users/UserBannerSubmission.tsx` — User-submitted banners

### Events & Marketplace
- `src/components/TicketPurchaseModal.tsx` — Event ticket purchase flow
- `src/lib/eventsService.ts` — Event registration service
- `src/pages/marketplace/PostListing.tsx` — Marketplace listing with premium boost

### Streams
- `src/pages/streams/ArtistDashboard.tsx` — Creator portal with track boost

---

*Document generated: Feb 22, 2026*
*Based on deep research across African platform economics, behavioral science, and virtual economy design*
*For Bara Afrika Platform — baraafrika.com*
