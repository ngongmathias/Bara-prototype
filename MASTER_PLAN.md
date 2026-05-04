# BARA AFRIKA — MASTER PLAN

> **The single source of truth for ALL platform development — past, present, and future.**
> Used across multiple AI platforms (Windsurf, Claude Code, Antigravity, Claude terminal, code CMD sessions).
> Every AI assistant should read the **START HERE** section first, then jump to the relevant phase.

---

## ⬆️ START HERE (for any AI assistant)

### What BARA Afrika Is

**baraafrika.com** — An African super-app / diaspora platform with these major sections:

| Section | Description | Status |
|---------|-------------|--------|
| **BARA Global** | Country-specific news/gallery landing pages | Live |
| **Events** | Event discovery, ticketing, calendar, maps, organizer profiles | Live |
| **Streams** | Music (Spotify-like), Movies, Ebooks, Podcasts, Gaming hub | Live |
| **Marketplace** | Classified ads (vehicles, property, jobs, electronics, fashion, etc.) with storefronts, cart, transactions | Live |
| **Blog** | Articles, categories, featured posts, contributor system | Live |
| **Sports** | Scores, predictions, news (API deferred — manual content) | Live |
| **Communities** | Country communities, WhatsApp groups | Live |
| **Business Directory** | Business listings, categories, reviews | Live |
| **User Dashboard** | Saved items, analytics, content management, BARA Coins gamification | Live |
| **Admin** | 30+ management pages with analytics | Live |
| **Tools** | Calculator, compass, world clock, currency converter, QR | Live |
| **Messaging** | Inbox, real-time chat | Live |

### Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Auth:** Clerk (SSO, email/password, JWT → Supabase RLS)
- **Backend:** Supabase (Postgres, Edge Functions, Storage, Realtime)
- **Email:** Resend API via Supabase Edge Function (`send-email`) + React Email templates
- **Sports API:** api-sports.io (deferred — $10/mo Pro plan)
- **Deployment:** Vercel (Edge Middleware for OG tags)
- **Icons:** Lucide, react-icons
- **Charts:** Recharts
- **i18n:** Google Translate widget (temporary), i18next configured

### Design System (STRICTLY ENFORCED)

- **Colors**: Black, white, and greys ONLY. NO orange, NO colored accents anywhere. Use black for primary actions, white backgrounds, grays (gray-100 through gray-900) for depth. The only exception is subtle status indicators (green "active" dot, red "sold" badge) — minimal and muted.
- **Typography**: Comfortaa for headings, Roboto for body text.
- **Tone**: Confident, bold, clean, modern. Think Apple + Stripe — generous whitespace, sharp contrast, no clutter.
- **Layout**: Every component should feel spacious and intentional. No cramped UIs.

### Terminology (IMPORTANT)

- **"Listing"** = a **business listing** in BARA Listings/Directory. NOT a marketplace item.
- **"Ad"** or **"marketplace ad"** = a marketplace item. Never call marketplace items "listings" in user-facing text.
- DB tables keep `marketplace_listings` internally — that's fine. UI says "ad" or "post".

### Payments (Current Phase)

- **No integrated payment processing yet** (MoMo, Visa etc. will come later — see Phase 15).
- **Streams music**: Free during launch. Note: "All music is free during our launch period."
- **Marketplace ads**: Sellers include payment instructions (MoMo number, bank details, WhatsApp). Dedicated "Payment Instructions" field on ad form + detail page.
- **Events**: Organizers include ticket purchase instructions. "How to Get Tickets" field on event form + detail page.
- **Blog, Ebooks, Movies**: Free during launch.
- Design UI so payment instruction areas can later be swapped for actual payment buttons.

### Key File Paths & Patterns

| Pattern | Example |
|---------|---------|
| Pages | `src/pages/marketplace/SearchResults.tsx` |
| Components | `src/components/marketplace/listing-parts/SellerTrustCard.tsx` |
| Context | `src/context/AudioPlayerContext.tsx`, `src/context/ShareContext.tsx` |
| Services | `src/services/sportsApi.ts`, `src/services/GamificationService.ts` |
| Admin | `src/pages/admin/AdminMarketplace.tsx` |
| Email templates | `supabase/functions/_shared/emails/WelcomeEmail.tsx` |
| Edge functions | `supabase/functions/send-email/index.ts` |
| Migrations | `supabase/migrations/` |
| Config | `src/config/categoryFieldConfigs.ts` |
| Compliance | `compliance/` (10 files) |

### Key Identifiers

- **BARA Mall Clerk user ID**: `user_39F89D6dX01nG31j8rAUxLYa3IG`
- **User Mathias Ngong Clerk user ID**: `user_39EUqrQ4of91lQx8RnwkSZOTiQF`
- **Supabase JWT template name**: `supabase` (in Clerk dashboard)
- **Email "from" addresses**: `noreply@baraafrika.com` (transactional), `hello@baraafrika.com` (digest/marketing). Current default `onboarding@resend.dev` must be updated once domain verified.

---

## RULES FOR ALL AI ASSISTANTS

1. **Black, white, gray ONLY.** No orange. No colored accents. No colored gradients. Only essential status indicators (green active, red sold) — muted/subtle.
2. **DO NOT remove any existing features.** Only add to them.
3. **DO NOT refactor existing working code** unless it's blocking a new feature.
4. **DO NOT touch header/footer/navbar order** — they are correct as-is.
5. **Use existing patterns**: `useToast` for notifications, `useShare` for sharing, `FavoriteButton` for likes, `supabase` client for data, Clerk for auth.
6. **Create Supabase migration files** for any new tables in `supabase/migrations/`.
7. **Mobile-first**: every new component must look good on 375px screens.
8. **Implement one feature at a time**, build, test, commit. Never batch unrelated changes.
9. **Use existing component library** (shadcn/ui, Lucide icons) before creating custom components.
10. **Keep bundle size in mind** — lazy-load heavy features.
11. **Terminology**: Marketplace items are "ads" not "listings" in user-facing text.
12. **Likes not reactions**: Simple like/heart buttons. No emoji reaction pickers (except maybe private chat later).
13. **Design confidence**: Bold typography, generous whitespace, sharp contrast. Reference Apple, Stripe, Linear.
14. **No payment processing code**: No Stripe/MoMo APIs. Only UI for payment instructions and manual flows.
15. **Emails must go through the queue**: Insert into `email_queue` first. Never send directly from frontend. Check user email preferences before sending non-critical emails.
16. **Email design**: Black buttons with white text, no emojis in headings, specific deep-links (not generic pages), unsubscribe/preferences link in footer.

---

## PHASE HISTORY (Completed — Summary)

> Full detail for all completed phases is in **`MASTER_PLAN_ARCHIVE.md`**.

| Phase | Date | Summary | Status |
|-------|------|---------|--------|
| 1 | Feb 22, 2026 | **Stabilize** — Fixed crashes, dead links, email triggers, dark-mode remnants | ✅ Complete |
| 2 | Feb 22, 2026 | **Harden** — RLS policies, Clerk JWT integration, XSS prevention | ✅ Complete |
| 3 | Feb 22, 2026 | **Enrich** — Gamification (coins, XP, missions, streaks, spin wheel, leaderboard, coin store) | ✅ Complete |
| 4 | Feb 22, 2026 | **Expand** — Real-time messaging, banner ads, profile themes, sports predictions | ✅ Complete |
| 5 | Feb 22, 2026 | **Launch Prep** — Domain, DNS, production env, SEO, sitemap, OG tags | ✅ Complete |
| 6 | Feb 22, 2026 | **Post-Launch Monitoring** — Error logs, Supabase usage, feedback | ✅ Complete |
| 7 | Mar 1–Apr 8 | **Major Build** — 68 items: header/footer redesign, Streams white theme, StreamsHub, Sports ESPN-style, admin CRUD (songs/artists/albums/events/marketplace/users), mobile nav, mega-menu, DPO compliance, blog categories, freemium music, multi-artist credits, full-screen player, producer/songwriter pages | ✅ Complete (60/68 done) |
| 8 | Mar 17, 2026 | **Testing & Coins Design** — Test accounts, QA process, coins earn/spend proposal, movies/ebooks/podcasts build plans | ✅ Documented |
| 9 | Mar 23, 2026 | **Platform Maturity** — Track ownership, file upload, dropdowns, sports management, ebooks admin, creator dashboard, search optimization, event flyer, dashboard features, translation | Partially open |
| 10 | Apr 6, 2026 | **Blog & Admin Polish** — Blog editor fix, admin sidebar fix, saved articles, coins dropdown, blog submission flow | ✅ Complete |
| 11 | Apr 6, 2026 | **Marketplace Trust** — Partners, verification, ratings, leads, offers, saved searches, storefronts, terminology rename (26 files) | ✅ Complete (core done, backlog remains) |
| 12 | Apr 9, 2026 | **Universal Share & OG** — ShareContext, Vercel Edge Middleware, movie/ebook detail pages, events pagination fix | ✅ Complete |
| 13 | Apr 10, 2026 | **Events Perf & Marketplace UX** — Server-side pagination, category-aware forms, detail page parity, storefront editor, reactive moderation, SOLD badges | ✅ Complete |
| 14 | Apr 11, 2026 | **Marketplace Deep Features** — Variant listings, cart, transactions, reviews/Q&A, sign-up UX, country simplification, RLS bug fixes | ✅ Complete |

---

## ACTIVE WORK — Open Items from Previous Phases

> These are all unchecked ☐ items from Phases 7–15 that are still pending. They remain active work items.

### Pre-Launch Blockers (P0)

| # | Item | Source |
|---|------|--------|
| 1 | **Clerk production keys** — app runs on dev keys with strict rate limits | 7.42 |
| 2 | **Emails: audit + setup** — @baraafrika.com transactional email (Resend), SPF/DKIM | 7.51 |
| 3 | **Streams: verify `audio-files` + `cover-art` storage buckets + RLS** | 7A-1.5 |
| 4 | **Admin: Movies + Podcasts management pages** (`/admin/movies`, `/admin/podcasts`) | 7.50 |
| 5 | **Cross-device testing** — mobile (375px), tablet (768px), desktop (1440px) all pages | 7A-0.2 |
| 6 | ~~**Blog post likes** — needs `blog_post_likes` table + RLS (currently localStorage)~~ ✅ Done Apr 13 — migration created, BlogPostDetail wired to Supabase | 10.4 |
| 7 | **Deploy `send-email` edge function with idempotency guard + audit `email_queue` webhook in Supabase Dashboard** (INSERT-only, single registration). Code fix `4ddca2e` is merged but not yet deployed; until then duplicate confirmation emails are still going out in production. | 22.5.3 / 22.5.4 |
| 8 | **Sign-up / login bugs (Clerk)** — Maj Mlinzi case: tried to register as "Maj theGeezer", told username already taken; full Clerk flow audit needed across all entry points. | 25.1.1 |
| 9 | **Chrome sign-up popup never closes** — sign-up modal stays open forever in Chrome (works in Firefox). Reproduces blocking new-user onboarding on the most-used browser. | 25.1.2 |
| 10 | ~~**Blog comments — permissions error** — users hitting RLS / permissions error when trying to comment on blog posts. Audit `blog_comments` RLS + Clerk JWT mapping.~~ ✅ Done May 4 — missing GRANTs on `blog_comments` + `blog_comment_likes` added (commit `a986918`) | 25.1.3 |
| 11 | **SSL certificate not Secure** — site not showing as Secure (https) in browser. Confirm Vercel SSL provisioned correctly for `baraafrika.com` + all subdomains, fix mixed content if any. | 25.1.4 |
| 12 | ~~**About Us copy replacement** — replace current About Us body with the new "ORIGINS: BARA Afrika" 4-paragraph copy and replace tagline "Est 2024, Rwanda" with "Made by Africans for Africans and friends of Africa".~~ ✅ Done May 4 — copy replaced (commit `80f71da`) | 25.3 |
| 13 | **Music UX/UI parity with josplay.com** — Music is the most important Streams pillar; bring listening experience to parity with https://music.josplay.com/ (player UX, browse, artist pages). | 25.2.3 |

### Important Pre-Launch (P1)

| # | Item | Source |
|---|------|--------|
| 7 | **DPO Compliance gaps** — privacy policy (api-sports, retention periods, DFD) | 7.33 |
| 8 | **Streams: volume control in player** | 7A-1.3 |
| 9 | **User profile visibility decision** — needs team call | 7D |
| 10 | **BARA Coins: earn/spend balance review** — needs team meeting | 7E |
| 11 | **Event saves** — `event_bookmarks` table | 10.4 |
| 12 | **Business listing saves** — `listing_bookmarks` table | 10.4 |
| 13 | **Favorites count badge** on marketplace icon | 13.7 |
| 14 | **"My Favorites" link** in user dashboard | 13.7 |

### Phase 9 Open Items (Creator Economy & Infrastructure)

| # | Item | Priority |
|---|------|----------|
| 9.1 | **Track ownership** — link songs to user accounts, DB constraint | P0 |
| 9.2 | **Universal file upload** — convert all URL inputs to Supabase Storage uploads (11 tasks) | P0 |
| 9.3 | **Country & language dropdowns** — shared constants, convert all admin forms | P1 |
| 9.4 | **Sports management** — teams, leagues, tournaments, fixtures, players admin + fan pages | P0-P2 |
| 9.5 | **Admin Ebooks page** — CRUD, storage bucket, dashboard metrics | P0 |
| 9.6 | **Creator dashboard** — My Music/Podcasts/Ebooks, analytics (paid), revenue | P0 |
| 9.7 | **Search optimization** — debounced search, filters, unified Streams search | P1 |
| 9.8 | **Event flyer A4/portrait** — aspect-[3/4] container | P0 |
| 9.9 | **Dashboard missing features** — playlists, blog posts, notifications, saved items, settings | P1 |
| 9.10 | **Translation** — replace Google Translate with proper i18n (Weglot or i18next+DeepL) | P1 |

### Phase 11 Backlog (Marketplace)

- [ ] Card grid trust badges (MarketplacePage + SearchResults)
- [ ] Partner dashboard (`/marketplace/partner/dashboard`) — storefront editor, leads inbox, offers inbox, team
- [ ] Admin verification console
- [ ] Bulk CSV upload for partners
- [ ] Lead inbox UI (`/marketplace/leads`)
- [ ] Seller ratings UI
- [ ] Saved searches management page
- [ ] Email alerts cron for saved searches
- [ ] Response-time computation job
- [ ] Video ad support
- [ ] Slug-based ad URLs
- [ ] Fraud detection rules
- [ ] Category-specific required fields prominence (13.2)
- [ ] Use CategoryPostForm as single posting form — delete PostListing.tsx (11.7.6/13.2)

### Phase 11.7 — Marketplace Structural Refactor (awaiting sign-off)

- [ ] 11.7.1: SQL migrations (lead_type enum, partner verification fields)
- [ ] 11.7.2: Extract shared listing primitives (9 components)
- [ ] 11.7.3: Category-specific primary CTAs
- [ ] 11.7.4: Seller partner dashboard
- [ ] 11.7.5: Admin marketplace tabs (Partners, Leads, Offers, Bulk Upload)
- [ ] 11.7.6: Posting form unification

### Phase 15 — Marketplace Payment Integration

> Full plan for Flutterwave integration (34 African countries, MoMo, cards, bank transfer, split payments).

| # | Task | Priority |
|---|------|----------|
| 15.1 | Flutterwave account setup + API keys | P0 |
| 15.2 | Payment service module (`PaymentService.ts`) | P0 |
| 15.3 | Checkout flow (Flutterwave hosted checkout) | P0 |
| 15.4 | Webhook handler (Edge Function) | P0 |
| 15.5 | Seller payouts (subaccounts, commission) | P1 |
| 15.6 | Transaction status expansion | P0 |
| 15.7 | Cart checkout (grouped by seller) | P1 |
| 15.8 | Payment method selector UI | P1 |
| 15.9 | Paystack as secondary (Nigeria/Ghana/SA/Kenya) | P2 |
| 15.10 | BARA Coins as payment | P2 |
| 15.11 | Event ticket payments | P2 |
| 15.12 | Coin Store payments (buy coins with real money) | P2 |

**DB changes needed:** `payment_reference`, `payment_method`, `payment_status`, `commission_amount` on `marketplace_transactions`. New table: `marketplace_seller_payouts`.

---

## PHASE 16 — UX REVAMP: SEARCH, INTERACTIONS, SHARING, NOTIFICATIONS & ENGAGEMENT

> Source: REVAMP_PROMPT.md sections 1-5. These are platform-wide improvements.

### 16.1 Search Experience Overhaul

| # | Task | Priority | Status |
|---|------|----------|--------|
| 16.1.1 | **Autocomplete/typeahead** on every search bar — suggestions dropdown (recent, popular, matching) | P0 | ☐ |
| 16.1.2 | **Typo tolerance** — fuzzy matching ("Matystores" → "MatyStores"). Client-side Levenshtein or Supabase `similarity()`/trigram | P0 | ☐ |
| 16.1.3 | **Federated search** — main navbar search shows categorized results: Events, Ads, Blog, Artists in grouped sections | P1 | ✅ |
| 16.1.4 | **Search history** — persist last 10 searches per user (Supabase table or localStorage), show when search bar focused | P1 | ✅ |
| 16.1.5 | **"No results" state** — never blank. Suggest: related items, popular items, spelling corrections, browse categories CTA | P0 | ✅ Done |

### 16.2 Micro-Interactions & Motion

| # | Task | Priority | Status |
|---|------|----------|--------|
| 16.2.1 | **Button feedback** — all clickable elements: subtle scale (0.97) on press via `active:scale-[0.97]` on shadcn Button base | P1 | ✅ Done |
| 16.2.2 | **Page transitions** — `AnimatePresence` with fade+slide (150ms) on route changes | P2 | ☐ |
| 16.2.3 | **Skeleton loaders** — every data-fetching section shows content-shaped skeletons (not spinners). Extend to ALL sections | P1 | ✅ Done (streams: Trending/NewReleases/Artists/Library/Movies/Ebooks/StreamsHome) |
| 16.2.4 | **Toast notifications** — consistent `useToast` for all user actions (cart, like, save, share, error) everywhere | P1 | ✅ Done (FavoriteButton add/remove/error; CartContext add/update/remove/clear) |
| 16.2.5 | **Scroll-triggered animations** — cards fade-in-up on viewport enter via `ScrollReveal`. Ensure it wraps all card grids | P2 | ✅ Done (BlogPage, MarketplacePage, Artists/TrendingSongs/NewReleases; EventsPage already wrapped) |
| 16.2.6 | **Celebration animations** — confetti/sparkle on milestones (first ad, 10th event, streak achievement) | P2 | ☐ |

### 16.3 Social & Sharing

| # | Task | Priority | Status |
|---|------|----------|--------|
| 16.3.1 | **Universal share modal** — every content type (events, ads, songs, albums, artists, movies, ebooks, podcasts, blog, storefronts, organizer profiles) must have share button via `useShare`. Verify coverage | P0 | ✅ Done (audit: added ArtistPage, unified BlogPostDetail to useShare) |
| 16.3.2 | **Deep links with rich previews** — every shareable page has OG meta tags via SEO component. Test WhatsApp/social preview cards | P0 | ☐ |
| 16.3.3 | **"Shared with you" banner** — when user clicks shared link with referral tracking, show subtle "Shared by [name]" | P2 | ☐ |

### 16.4 Notifications System

| # | Task | Priority | Status |
|---|------|----------|--------|
| 16.4.1 | **In-app notification bell** in navbar with unread count badge (black dot, white number) | P0 | ✅ Done (fixed styling: text-gray-700, black badge, type icons) |
| 16.4.2 | **Notification types**: new message, event reminder (24h), new song from followed artist, blog comment reply, coins earned, new ad from followed store | P0 | ✅ Done (17 types defined in NotificationType union + icon mapping) |
| 16.4.3 | **Supabase table**: `notifications(id, user_id, type, title, body, link, is_read, created_at)` + RLS | P0 | ✅ Done (migration + indexes + RLS + realtime) |
| 16.4.4 | **Real-time**: Supabase Realtime subscriptions for push notifications without page refresh | P1 | ✅ Done (already wired in NotificationsContext) |

### 16.5 User Engagement

| # | Task | Priority | Status |
|---|------|----------|--------|
| 16.5.1 | **Onboarding tour** — 3-5 step guided tour for new users (react-joyride or similar) highlighting search, streams, marketplace, events, coins | P1 | ☐ |
| 16.5.2 | **"Continue where you left off"** section on home page — recently viewed events, last played song, last viewed ad | P1 | ✅ |
| 16.5.3 | **Weekly digest email** opt-in — "Your week on BARA" with top events, new songs, trending ads (see Phase 22) | P2 | ☐ |

---

## PHASE 17 — STREAMS / MUSIC OVERHAUL

> Source: REVAMP_PROMPT.md sections 6-10. Reference: Spotify 2025, Audiomack, Boomplay, Apple Music, YouTube Music.

### 17.1 Enhanced Now Playing Experience (MAJOR REDESIGN)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 17.1.1 | **Full-width immersive layout** — album art or blurred version spans entire background edge-to-edge. Large centered art. No wasted whitespace | P0 | ☐ |
| 17.1.2 | **Desktop layout** — two-column: left 60% massive album art, right side: song info, lyrics, queue. Blurred art bleeds into background with dark gradient overlay | P0 | ☐ |
| 17.1.3 | **Mobile layout** — full-screen vertical: large art at top (full width), info + controls below, swipe up for queue/lyrics | P0 | ☐ |
| 17.1.4 | **Background ambience** — extract dominant color from album art, use as subtle desaturated gradient behind player | P1 | ✅ |
| 17.1.5 | **Lyrics display** — scrolling lyrics synced with playback (from `lyrics` column on `songs` table). "Lyrics not available" CTA for artists to add them | P1 | ✅ Done (`lyrics` column; lyrics tab in FullScreenPlayer with Mic2 toggle; "Lyrics not available" CTA; upload form field) |
| 17.1.6 | **Queue panel** — always visible on desktop (right sidebar), slide-up drawer on mobile. Drag-to-reorder, remove from queue. "Nothing queued" suggests Browse/search | P0 | ☐ |
| 17.1.7 | **Progress bar** — full-width, scrubbable, elapsed/remaining time, timestamp tooltip on hover | P0 | ☐ |
| 17.1.8 | **Controls row** — centered: shuffle, prev, play/pause (large), next, repeat. Below: volume (desktop), heart/like, add-to-playlist, share | P0 | ☐ |
| 17.1.9 | **Swipe gestures** — swipe right = next, swipe left = previous (mobile) | P1 | ✅ |
| 17.1.10 | **Crossfade control** — 0-12s crossfade between tracks, stored in localStorage | P2 | ☐ |
| 17.1.11 | **Sleep timer** — "Stop after 15/30/60 min or end of track" from menu icon | P1 | ✅ Done (AudioPlayerContext.setSleepTimer + GlobalPlayer extras popover with live remaining) |
| 17.1.12 | **Playback speed** — 0.5x, 1x, 1.25x, 1.5x, 2x for podcasts/audiobooks | P1 | ✅ Done (AudioPlayerContext.setPlaybackRate + 0.5–2x grid in GlobalPlayer extras popover) |
| 17.1.13 | **"Go to artist" / "Go to album"** links always visible near song title | P0 | ☐ |
| 17.1.14 | **Keyboard shortcuts** — Space=play/pause, arrows=seek ±10s, N=next, P=prev, L=like, M=mute. "?" help modal | P1 | ✅ Done (GlobalPlayer global keydown listener with help modal, skips when typing) |

### 17.2 Discovery & Personalization

| # | Task | Priority | Status |
|---|------|----------|--------|
| 17.2.1 | **"Made for You" daily mixes** — 3-5 personalized playlists from listening history by mood/genre. Expand `personalizedSongs` into proper named playlists with cover art | P0 | ☐ |
| 17.2.2 | **Genre/mood browsing page** — clean grid of genre cards (Afrobeats, Amapiano, Gospel, Highlife, Bongo Flava, Gqom, etc.). Bold black/white, large typography. Each leads to curated page with top songs, artists, playlists | P0 | ☐ |
| 17.2.3 | **"Fans also like"** on artist pages — related artists by shared listeners or genre | P1 | ✅ |
| 17.2.4 | **New Release Radar** — personalized playlist of new releases from followed + similar artists, auto-updated weekly | P1 | ✅ Done |
| 17.2.5 | **Listening stats dashboard** — total minutes this week/month, top genres, top artists, streak counter | P1 | ✅ |
| 17.2.6 | **Song/artist radio** — "Start Radio" button creates infinite auto-playing queue of similar music | P2 | ☐ |

### 17.3 Social Features for Music

| # | Task | Priority | Status |
|---|------|----------|--------|
| 17.3.1 | **Activity feed** — "Friends are listening to..." on StreamsHome (opt-in privacy toggle). Long-term infrastructure build | P2 | ☐ |
| 17.3.2 | **Collaborative playlists** — multiple users add songs via join link. Contributor avatars on playlist cover | P1 | ✅ Done |
| 17.3.3 | **Song comments** — short comments on song detail page. Likes on comments for surfacing best ones | P2 | ☐ |
| 17.3.4 | **Artist follow system** — follow button, follower count, "new release" notifications | P0 | ☐ |
| 17.3.5 | **Share currently playing** — one-tap share with beautiful card (album art, title, artist, BARA link) | P0 | ☐ |

### 17.4 Artist Experience

| # | Task | Priority | Status |
|---|------|----------|--------|
| 17.4.1 | **Verification badges** — bold black checkmark badge (filled black circle with white checkmark). No colored rings. Appears everywhere artist name appears | P0 | ☐ |
| 17.4.2 | **Artist Spotlight** — rotating featured artist on StreamsHome: full-width banner, large photo, bold Comfortaa name, bio snippet, "Play top tracks". Weekly rotation via `featured_artists` table | P1 | ✅ Done |
| 17.4.3 | **"Behind the music"** — artists add "story behind this song" text, shown expandable on song detail page | P2 | ☐ |
| 17.4.4 | **Artist analytics** enhancements — streams over time ✅, follower count ✅, (TODO: top countries, demographics, playlist adds, follower growth over time) | P1 | 🟡 |
| 17.4.5 | **"Artist Picks"** — verified artists pin 3-5 tracks to top of profile | P1 | ✅ Done |

### 17.5 Music Player Polish

| # | Task | Priority | Status |
|---|------|----------|--------|
| 17.5.1 | **Mini player** enhancements — add: progress bar scrubbing, volume slider (desktop), heart/like, queue toggle, "expand to full Now Playing" | P0 | ☐ |
| 17.5.2 | **"Add to Playlist" modal** — searchable list of user's playlists + "Create new playlist" at top | P0 | ☐ |
| 17.5.3 | **Waveform visualization** — audio waveform animating with playback on Now Playing/Song detail (Web Audio API or pre-generated). Subtle, monochrome | P2 | ☐ |
| 17.5.4 | **Song context menu** — right-click/long-press: Play, Play Next, Add to Queue, Add to Playlist, Go to Artist, Go to Album, Share, Like/Unlike | P1 | ✅ |

---

## PHASE 18 — EVENTS UPGRADE

> Source: REVAMP_PROMPT.md sections 11-13. Reference: Eventbrite 2025, Meetup, Dice, Fever.

### 18.1 Smart Event Discovery

| # | Task | Priority | Status |
|---|------|----------|--------|
| 18.1.1 | **"Events near me"** — browser geolocation (with permission), sort by distance | P0 | ☐ |
| 18.1.2 | **Interest-based recommendations** — users pick interests during onboarding (Music, Sports, Tech, Food, Art, Networking), surface matching events | P1 | ✅ Done |
| 18.1.3 | **"Happening Now" live indicator** — pulsing black dot + "LIVE" text on events currently in progress | P1 | ✅ Done (EventTimingBadge on cards + EventCountdown "Live Now" on detail) |
| 18.1.4 | **Event countdown** — live countdown timer on event detail page | P1 | ✅ Done (EventCountdown: Starts-in d/h/m/s, Live Now, Ended states, auto-tick) |
| 18.1.5 | **Weather widget** — forecast for event date + location (free API like OpenWeatherMap) | P2 | ☐ |

### 18.2 Ticketing & Attendance

| # | Task | Priority | Status |
|---|------|----------|--------|
| 18.2.1 | **Going / Interested RSVP** — buttons with attendee count + avatars. `event_rsvps` table (partially exists from 7.31) | P0 | ☐ |
| 18.2.2 | **"How to Get Tickets" section** — prominent display of organizer's payment/ticket instructions | P0 | ☐ |
| 18.2.3 | **Early bird pricing display** — support multiple ticket tiers in description | P1 | ✅ |
| 18.2.4 | **Post-event** — prompt attendees to rate (1-5 stars), upload photos, leave review. `event_reviews` table | P1 | ✅ Done (`event_reviews` table + RLS; `EventReviews` component mounted on `EventDetail` with stars, body, photo upload) |

### 18.3 Organizer Profiles (Event Storefronts)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 18.3.1 | **Organizer page** at `/events/organizer/:slug` — name, bio, photo, verification, all events, ratings, follower count, "Message Organizer", "Follow" | P0 | ☐ |
| 18.3.2 | **Supabase table**: `event_organizers(id, user_id, display_name, slug, bio, profile_image_url, cover_image_url, verification_level, created_at)` — auto-created on first event post | P0 | ☐ |
| 18.3.3 | **"Message Organizer"** — private 1-on-1 chat via existing messaging system | P1 | ✅ |
| 18.3.4 | **"View all events by this organizer"** link on every event detail page | P0 | ☐ |
| 18.3.5 | **Event series** — support recurring events linked on organizer profile | P2 | ☐ |
| 18.3.6 | **Organizer analytics** — events created, total RSVPs, attendees, average rating | P1 | ✅ Done |

---

## PHASE 19 — MARKETPLACE ENHANCEMENTS

> Source: REVAMP_PROMPT.md sections 14-17. Reference: Dubizzle, OLX, Facebook Marketplace, Etsy, Amazon.

### 19.1 Search & Discovery

| # | Task | Priority | Status |
|---|------|----------|--------|
| 19.1.1 | **Category-aware autocomplete** — typing "iPhone" suggests "iPhone 15 Pro > Mobiles & Tablets" | P0 | ☐ |
| 19.1.2 | **Recent searches** dropdown when focusing search bar | P1 | ✅ |
| 19.1.3 | **Voice search** — Web Speech API, especially useful for mobile | P2 | ☐ |
| 19.1.4 | **"Similar ads"** section on every ad detail page (same category, similar price, same location) | P1 | ✅ |

### 19.2 Ad Quality

| # | Task | Priority | Status |
|---|------|----------|--------|
| 19.2.1 | **Image guidelines** — minimum 1 photo, suggest 3+. Quality score: "Your ad is 70% complete — add price, location, 2 more photos" | P1 | ✅ Done (completeness bar lists missing items; no-photo tip about 3+ photos → 5× more views) |
| 19.2.2 | **Ad completeness bar** — visual progress during ad creation | P1 | ✅ Done (sticky bar on PostListing with 9 checks, color-coded red/amber/green) |
| 19.2.3 | **Auto-categorization suggestion** — based on title keywords, suggest category/subcategory | P2 | ☐ |
| 19.2.4 | **Ad boost/promote** — paid feature to pin to top of search. UI flow: "Contact us to boost your ad" (manual for now) | P2 | ☐ |
| 19.2.5 | **Payment Instructions field** — dedicated field in ad creation + prominent display on detail page as "How to Pay" | P0 | ☐ |

### 19.3 Buyer/Seller Communication

| # | Task | Priority | Status |
|---|------|----------|--------|
| 19.3.1 | **Private in-app chat** — "Message Seller" on every ad opens private 1-on-1 conversation | P0 | ☐ |
| 19.3.2 | **Public Q&A section** — separate from private chat. Buyer asks, seller answers publicly. Reduces repetitive questions. `marketplace_ad_questions` table | P0 | ☐ |
| 19.3.3 | **"Make an Offer"** — buyer proposes price, seller accepts/counters/declines. `marketplace_offers` table (exists from Phase 11) | P0 | ✅ Exists |
| 19.3.4 | **Safety tips** — dismissible banner on ad detail: "Meet in public places", "Don't share banking info", "Inspect before paying" | P1 | ✅ |
| 19.3.5 | **Seller response time** — "Usually responds within X hours" from historical chat data | P1 | ✅ Done (EWMA trigger on `messages` insert updating `marketplace_partners.response_time_hours`; already rendered on storefront) |

### 19.4 Storefront Enhancements

| # | Task | Priority | Status |
|---|------|----------|--------|
| 19.4.1 | **Store categories/filters** — within storefront, filter store's ads by category | P1 | ✅ |
| 19.4.2 | **Store reviews/ratings** — buyers rate experience (1-5 stars + text). `store_reviews` table | P1 | ✅ Done (table + aggregate trigger updating `marketplace_partners.avg_rating/rating_count`; review UI on MarketplaceStorefront) |
| 19.4.3 | **Store analytics for sellers** — views, clicks, favorites, messages chart over time | P1 | ✅ Done |
| 19.4.4 | **"Follow Store"** — notifications when store adds new ads | P1 | ✅ Done (`store_followers` table + trigger notifying followers on new active listing; `FollowStoreButton` on storefront) |
| 19.4.5 | **Store banner customization** — ensure prominent with CTA area | P1 | ✅ Done (`banner_headline`, `banner_cta_text`, `banner_cta_url` columns; editor fields; overlay on storefront) |

---

## PHASE 20 — BLOG & COMMUNITY

> Source: REVAMP_PROMPT.md sections 18-20. Reference: Medium, Substack, Dev.to, Hashnode.

### 20.1 Reading Experience

| # | Task | Priority | Status |
|---|------|----------|--------|
| 20.1.1 | **Estimated reading time** on every blog card and detail page (word count / 200 wpm) | P0 | ✅ Done |
| 20.1.2 | **Table of contents** — auto-generated from headings, sticky sidebar on desktop, collapsible on mobile | P1 | ✅ Done (BlogTableOfContents: DOMParser-extracted h2/h3, fixed sidebar on xl+, mobile drawer) |
| 20.1.3 | **Reading progress bar** at top of page filling as user scrolls | P1 | ✅ Done |
| 20.1.4 | **Text-to-speech** — "Listen to this article" via Web Speech API | P2 | ☐ |
| 20.1.5 | **Dark/light reading mode toggle** on blog detail pages | P2 | ☐ |

### 20.2 Engagement

| # | Task | Priority | Status |
|---|------|----------|--------|
| 20.2.1 | **Likes** — simple heart icon on blog posts (needs `blog_post_likes` DB table — see Active Work #6) | P0 | ✅ Done (table + RLS, BlogCard + BlogPostDetail persist via Clerk-authed client) |
| 20.2.2 | **Comments system** — threaded with reply, like, report. `blog_comments` table (exists from 7.32) | P0 | ✅ Exists |
| 20.2.3 | **"Related articles"** at bottom of every post — same category + tags | P1 | ✅ Done (BlogPostDetail.loadRelatedPosts via blogPostsService.getRelated) |
| 20.2.4 | **Bookmarks** — save articles for later. Make more visible with bookmark icon on every card + article header | P1 | ✅ Done (blog_bookmarks table + bookmark button on BlogCard & BlogPostDetail, Liked Articles tab in dashboard) |

### 20.3 Writer Experience

| # | Task | Priority | Status |
|---|------|----------|--------|
| 20.3.1 | **Writer profiles** — dedicated author pages at `/blog/author/:slug` with bio, social links, all posts, follower count. Auto-created on first publish | P0 | ☐ |
| 20.3.2 | **Draft autosave** — save every 30 seconds to prevent content loss | P1 | ✅ Done (UserBlogEditor: 30s interval, creates-or-updates, header status indicator) |
| 20.3.3 | **Post analytics** — views, read completion rate, shares, comments in writer dashboard | P1 | ✅ Done |
| 20.3.4 | **SEO suggestions** — pre-publish checklist: title length, meta description, featured image, tags | P2 | ☐ |
| 20.3.5 | **Content scheduling** — "Publish at" date/time picker for future publishing | P2 | ☐ |

---

## PHASE 21 — CROSS-SECTION: COINS, PROFILES, MOBILE, ANALYTICS & ACCESSIBILITY

> Source: REVAMP_PROMPT.md sections 21-25.

### 21.1 BARA Coins Integration

| # | Task | Priority | Status |
|---|------|----------|--------|
| 21.1.1 | **Earn coins everywhere** — listen (+1), attend event (+5), post ad (+3), write blog (+10), share (+2), daily streak (+1-7 scaling) | P0 | ☐ |
| 21.1.2 | **Spend coins** — boost ad, highlight blog post, tip artist, unlock badge frame | P0 | ☐ |
| 21.1.3 | **Leaderboard** — weekly/monthly top earners with tier badges (Bronze, Silver, Gold, Diamond) | P1 | ✅ |
| 21.1.4 | **Coin animation** — floating "+5 coins" rising from action point, monochrome and clean | P1 | ✅ |

### 21.2 User Profile & Social

| # | Task | Priority | Status |
|---|------|----------|--------|
| 21.2.1 | **Public profile page** — avatar, bio, country, joined date, interests, followed artists, events attending, blog posts, marketplace rating | P0 | ☐ |
| 21.2.2 | **Follow/connect system** — follow users, see public activity (events, playlists, posts) | P1 | ✅ Done (`user_follows` table with RLS; `FollowUserButton` component; ArtistPage follow button now persists via `artists.user_id`) |
| 21.2.3 | **Achievement badges** — "Early Adopter", "Music Lover (1000 songs)", "Event Explorer (10 events)", "Top Seller", "Prolific Writer". Black/white badge icons | P1 | ✅ |

### 21.3 Mobile-First Polish

| # | Task | Priority | Status |
|---|------|----------|--------|
| 21.3.1 | **Bottom navigation bar** on mobile — Home, Events, Streams, Marketplace, Profile. Black bar, white icons. Always visible | P0 | ☐ |
| 21.3.2 | **Pull-to-refresh** on all feed pages | P1 | ✅ |
| 21.3.3 | **Swipe gestures** — swipe left on song = add to queue, right = like. Swipe left on ad card = hide, right = favorite | P2 | ☐ |
| 21.3.4 | **PWA enhancements** — add-to-homescreen prompt, offline cache, push notifications via service worker | P2 | ☐ |

### 21.4 Analytics & Insights (Admin + Users)

#### Admin Panel Improvements

| # | Task | Priority | Status |
|---|------|----------|--------|
| 21.4.1 | **Dashboard KPIs** — DAU/MAU, total users (growth %), total events, ads, songs, blog posts, revenue, active countries | P0 | ☐ |
| 21.4.2 | **User management** — searchable, sortable, filterable by country/role/status. Bulk actions: suspend, verify, notify | P0 | ☐ |
| 21.4.3 | **Content moderation queue** — flagged/reported content across all sections in one view. Quick-action buttons | P0 | ☐ |
| 21.4.4 | **Marketplace analytics** — ads by category (pie), by country, top sellers, avg response time, trending searches | P1 | ☐ |
| 21.4.5 | **Events analytics** — events by category/country, top organizers, RSVPs, attendance rates, calendar heatmap | P1 | ☐ |
| 21.4.6 | **Streams analytics** — top songs/artists/genres, listening hours by day (line chart), upload queue status | P1 | ☐ |
| 21.4.7 | **Blog analytics** — posts by category, top posts by views, top writers, avg read time, comment activity | P1 | ☐ |
| 21.4.8 | **BARA Coins analytics** — total in circulation, earned vs spent, top earners, mission completion rates | P1 | ☐ |
| 21.4.9 | **Charts everywhere** — Recharts: line (trends), bar (comparisons), pie (distributions). Every table gets a visual | P1 | ☐ |
| 21.4.10 | **Export to CSV** — allow admins to export any table as CSV | P1 | ☐ |
| 21.4.11 | **Admin activity log** — who did what and when (accountability) | P2 | ☐ |

#### Creator Insights (artists, organizers, bloggers, sellers)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 21.4.12 | Views over time graph, engagement rate, geographic breakdown, top-performing content | P1 | ☐ |

### 21.5 Accessibility & Performance

| # | Task | Priority | Status |
|---|------|----------|--------|
| 21.5.1 | **Lazy load images** across all pages with blur placeholder — ensure consistency | P1 | ✅ |
| 21.5.2 | **Code splitting** — split streams, marketplace, events, blog into separate chunks (currently 5MB+) | P0 | ☐ |
| 21.5.3 | **Keyboard navigation** — all interactive elements keyboard-accessible with visible focus rings | P1 | ✅ |
| 21.5.4 | **ARIA labels** on all icon-only buttons (favorites, share, play, cart) | P1 | ✅ |
| 21.5.5 | **Color contrast** — verify all text meets WCAG AA (especially gray text on white) | P1 | ✅ |

---

## PHASE 22 — EMAIL SYSTEM OVERHAUL

> Source: REVAMP_PROMPT.md section 26. Infrastructure: Resend API, React Email, Supabase Edge Function (`send-email`), `email_queue` table.

### 22.1 Fix Template Design (all 13 existing templates)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 22.1.1 | **Button style** — change ALL templates from gold/yellow (#FFD700) text to white (#ffffff) text on black (#000000) background | P0 | ☐ |
| 22.1.2 | **Remove emojis** from headings (🎉 etc.) | P0 | ☐ |
| 22.1.3 | **Consistent layout** — logo → heading → greeting → body → primary CTA → optional secondary CTA → footer | P0 | ☐ |
| 22.1.4 | **Specific deep-links** — "View Your Event" → `/events/{eventId}`, NOT `/events` | P0 | ☐ |
| 22.1.5 | **Extract shared styles** into `emailStyles.ts` — main, container, logo, h1, text, button, footer | P1 | ✅ Done (`supabase/functions/_shared/emails/emailStyles.ts`; all 13 templates refactored) |

### 22.2 Wire Up Existing Templates (never triggered)

| Template | Trigger Point | File to Edit | Status |
|----------|---------------|--------------|--------|
| `WelcomeEmail` | New user sign-up (Clerk webhook or first login) | Clerk webhook / App.tsx | ☐ |
| `EventSubmittedEmail` | User submits new event | Event creation handler | ☐ |
| `EventApprovedEmail` | Admin approves event | AdminEvents.tsx | ☐ |
| `EventRejectedEmail` | Admin rejects event | AdminEvents.tsx | ☐ |
| `ListingCreatedEmail` | User posts marketplace ad | PostListing.tsx | ☐ |
| `TicketPurchasedEmail` | User RSVPs / gets tickets | Event RSVP handler | ☐ |
| `BannerRequestEmail` | User submits banner request | Banner form handler | ☐ |
| `ContactFormConfirmationEmail` | User submits contact form | Contact page handler | ☐ |

### 22.3 Create NEW Email Templates + Triggers

**Transactional:**

| # | Template | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| 22.3.1 | `NewMessageEmail` | "You have a new message from {sender}" — smart throttling: skip if user online, batch if multiple within 10min | P0 | ☐ |
| 22.3.2 | `SongUploadedEmail` | "Your song '{title}' is now live" — sent to artists when song processed | P1 | ✅ Done (template + send-email switch + wired in UploadSongPage) |
| 22.3.3 | `EventReminderEmail` | "{eventName} is tomorrow!" — 24h before, to RSVP'd users. Needs cron job | P0 | ☐ |
| 22.3.4 | `OfferReceivedEmail` | "Offer of {amount} on '{adTitle}'" — to seller. Money-related = must be email | P0 | ☐ |
| 22.3.5 | `OfferAcceptedEmail` | "Your offer on '{adTitle}' was accepted!" — to buyer | P0 | ☐ |

**Periodic / Digest:**

| # | Template | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| 22.3.6 | `WeeklyDigestEmail` | "Your week on BARA" — opt-in only, off by default. Top events, new songs, trending ads, coin balance. Needs cron + user preference | P2 | ☐ |

**NOT emails (in-app notification bell only):**
- New follower (store/artist/organizer/user)
- BARA Coins earned / milestone
- New review on store or event
- Ad expiry warning (3 days)
- Re-engagement / inactivity nudges (skip entirely)

**Total email types: 18** (13 fixed + 5 new)

### 22.4 Email Preferences / Settings

| # | Task | Priority | Status |
|---|------|----------|--------|
| 22.4.1 | **Email Preferences page** in user dashboard (`/users/dashboard/settings`) — toggles for transactional, digest, marketing | P0 | ☐ |
| 22.4.2 | **Supabase table**: `user_email_preferences(user_id TEXT PK, transactional BOOLEAN DEFAULT true, digest BOOLEAN DEFAULT false, marketing BOOLEAN DEFAULT false, updated_at)` | P0 | ☐ |
| 22.4.3 | **Every email footer** must include working "Unsubscribe" / "Email Preferences" link | P0 | ☐ |
| 22.4.4 | **Respect preferences** — check before sending non-critical emails | P0 | ☐ |

### 22.5 Email Queue & Reliability

| # | Task | Priority | Status |
|---|------|----------|--------|
| 22.5.1 | Ensure ALL emails go through `email_queue` — never send directly from frontend. ~~Remaining call sites that still bypass the queue: `AdminMarketplace.updateListingStatus` (rejection path, after Apr 22 fix), `AdminBlog.handleApprove`, `AdminBlog.handleDecline`, `UserBlogEditor` (submission), `UploadSongPage` (song uploaded).~~ ✅ Done May 4 — all five call sites migrated. AdminBlog/UserBlogEditor/UploadSongPage now insert into `email_queue` with `metadata.{type,data}` shape. AdminMarketplace rejection now uses the trigger (see 22.5.6). Sweep confirms zero `supabase.functions.invoke('send-email', ...)` calls remain in `src/`. | P0 | ✅ Done |
| 22.5.2 | **Admin email log** — table: recipient, subject, type, status (sent/failed/pending), sent_at. Filterable | P1 | ✅ Done (`/admin/email-log` — status+type filter, search, stats cards) |
| 22.5.3 | **Duplicate-email bug fix — `send-email` idempotency guard.** Apr 22, 2026: users reported the same event confirmation email arriving twice. Root cause: edge function had no idempotency check, so when it self-updated `email_queue.status='sent'` and the Supabase DB webhook was wired to INSERT+UPDATE (or registered twice), the email re-sent on the self-update. Code fix landed (`4ddca2e`): early-return on any webhook with `body.type !== 'INSERT'` or payload `status !== 'pending'`. **Still pending:** deploy `send-email` edge function (`supabase functions deploy send-email`) and verify in production. | P0 | 🟡 Code merged — deploy pending |
| 22.5.4 | **Supabase Dashboard webhook audit on `email_queue`** — confirm the webhook is registered exactly once, fires on INSERT only (not UPDATE/DELETE), and points at the deployed `send-email` function. This is the infra-side counterpart of 22.5.3. | P0 | ☐ |
| 22.5.5 | **Verify duplicate emails are gone end-to-end after 22.5.3 + 22.5.4 deploy** — register for a free event, register for a paid event, approve a marketplace listing, submit a banner, sign up a new user. Each should produce exactly one email per logical action in `email_queue` and exactly one delivery in Resend. | P0 | ☐ |
| 22.5.6 | **AdminMarketplace double-send fix (Apr 22, 2026, `4ddca2e`).** Direct `send-email` invoke for `listing_approved` removed; DB trigger `tr_marketplace_listing_email` is now the only path. ~~Rejection path retained (no DB trigger branch). Follow-up: extend `handle_marketplace_listing_email` with a `listing_rejected` branch so 22.5.1 can fully retire the direct invoke.~~ ✅ Done May 4 — `listing_rejected` branch added in migration `20260504_marketplace_listing_rejected_email.sql`; `AdminMarketplace.updateListingStatus` rejection invoke removed. Trigger now handles all three states (created/approved/rejected). | P1 | ✅ Done |

### 22.6 "From" Address

| # | Task | Priority | Status |
|---|------|----------|--------|
| 22.6.1 | Update from `onboarding@resend.dev` to `noreply@baraafrika.com` (transactional) and `hello@baraafrika.com` (digest) once domain verified in Resend | P0 | ☐ |

---

## PHASE 23 — COMPREHENSIVE TESTING (Pre-Launch Feature Freeze)

> Source: REVAMP_PROMPT.md Phase 5. Full freeze on new features — only find and fix bugs.

### 23.1 Cross-Device Testing

| # | Task | Priority | Status |
|---|------|----------|--------|
| 23.1.1 | Mobile: 375px (iPhone SE), 390px (iPhone 14), 412px (Pixel 7) | P0 | ☐ |
| 23.1.2 | Tablet: 768px (iPad Mini), 1024px (iPad Pro) | P0 | ☐ |
| 23.1.3 | Laptop: 1366px | P0 | ☐ |
| 23.1.4 | Desktop: 1920px (Full HD) | P0 | ☐ |
| 23.1.5 | Verify: no horizontal overflow, no cut-off text, no overlapping, all modals work, min 44px touch targets | P0 | ☐ |

### 23.2 Cross-Browser Testing
- [ ] Chrome, Safari, Firefox, Edge on macOS and Windows

### 23.3 User Flow Walkthroughs (End-to-End)
- [ ] Sign up → onboarding → browse marketplace → view ad → message seller → make offer
- [ ] Sign up → browse events → RSVP → receive reminder email
- [ ] Sign up → Streams → play song → like → create playlist → add songs → share
- [ ] Sign up → write blog → submit → admin approves → email → view published
- [ ] Sign up → post marketplace ad → email → buyer messages
- [ ] Sign up → upload song (artist) → email → view on artist page
- [ ] Sign up → visit storefront → follow → store posts new ad → notification
- [ ] Admin: approve/reject across all sections → verify emails → check analytics

### 23.4 Error State Testing
- [ ] Slow/offline network — skeleton loaders show? errors display gracefully?
- [ ] Not logged in + protected page — redirects to sign-in?
- [ ] Empty/invalid form data — clear validation messages?
- [ ] Supabase error — toast shown? no white screen of death?
- [ ] Image load failure — fallback/placeholder shown?

### 23.5 Email Testing
- [ ] Send every email type to test inbox
- [ ] All links work and go to correct specific page
- [ ] No broken images (logo loads)
- [ ] Button colors correct (black + white text)
- [ ] Renders in Gmail, Outlook, Apple Mail
- [ ] Unsubscribe/preferences link works

### 23.6 Performance Testing
- [ ] Lighthouse on key pages — Performance > 70, Accessibility > 90
- [ ] Initial load < 4s on 3G
- [ ] Lazy loading working (images, route chunks)
- [ ] Memory leaks (music player running extended time, many navigations)

### 23.7 Data Integrity
- [ ] RLS: user A cannot see user B's private data
- [ ] All tables have RLS enabled
- [ ] Delete/edit only affects owned content

### 23.8 Other
- [ ] Notification testing — bell, links, mark read
- [ ] Search testing — normal, partial, typos, empty, special chars, very long
- [ ] Bug tracker — markdown file or spreadsheet: section, description, severity, status

---

## PHASE 24 — PLATFORM AUDIT & REFINEMENT (Post-Launch, Ongoing)

> Source: REVAMP_PROMPT.md Phase 6. NOT bug-fixing — raising the bar.

### 24.1 UX Consistency Audit
- [ ] Consistent spacing, font sizes, colors (black/white/gray only — catch remaining orange)
- [ ] Consistent card styles across sections
- [ ] Consistent empty states with helpful CTAs
- [ ] Consistent loading states (skeletons, not spinners)
- [ ] Consistent button styles and sizes
- [ ] Consistent icon usage (same library, same style)

### 24.2 Content Quality Audit
- [ ] No placeholder text, lorem ipsum, or visible TODO comments
- [ ] All error messages helpful and human-readable
- [ ] All tooltip/helper text actually helpful
- [ ] "Coming soon" / "free during launch" notes consistently placed

### 24.3 Navigation Audit
- [ ] Any page reachable within 3 clicks from home
- [ ] Back button behavior correct everywhere
- [ ] Breadcrumbs/context indicators where needed
- [ ] Mobile bottom nav highlights correct active section

### 24.4 SEO Audit
- [ ] Every public page has unique meta title + description
- [ ] OG tags with correct images for social sharing
- [ ] Sitemap generated and submitted
- [ ] Canonical URLs set correctly

### 24.5 Analytics Review (after 1-2 weeks of real data)
- [ ] Highest bounce rate pages → investigate
- [ ] Highest drop-off flows → simplify
- [ ] Underused features → make discoverable or remove
- [ ] No-results search queries → add content or improve matching

### 24.6 User Feedback
- [ ] Lightweight "Feedback" button (floating or footer) for quick submissions
- [ ] Review feedback weekly, prioritize improvements

### 24.7 Performance Profiling
- [ ] Slowest pages → optimize (lazy load, reduce queries, cache)
- [ ] Supabase query performance → add indexes
- [ ] Bundle size → eliminate unnecessary dependencies

### 24.8 Competitor Benchmarking
- [ ] Periodically review Audiomack, Boomplay, Eventbrite, OLX, Medium for new UX patterns
- [ ] Create prioritized backlog from findings → feed into Phase 16-21 sprints

---

## Phase 25 — Team & Stakeholder Feedback (April 23–28, 2026)

> Comprehensive feedback round from Marlon and the wider team (WhatsApp + Saturday morning call, mid-to-late April 2026).
> Treat every item here as required scope; do not drop items without explicit team sign-off. Items overlap with Pre-Launch Blockers #8–13 above where flagged P0.

### 25.0 Source & Team Priority Labels (verbatim)

The Saturday morning call (call ID `222320694136853`) classified items with these labels — preserved here for traceability. Internal P0/P1 labels in this plan layer on top of, not replace, the team's own classification.

| Team label | Item | Phase ref |
|------------|------|-----------|
| **High Priority** | Cyber Security Authority (CSA) Meeting — Compliance, Data Protection Certificate, offer assistance for CSA awareness | 25.8 |
| Medium Priority | SSL Certificate issue (https NOT Secure) | 25.1.4 |
| Medium Priority | BARA Marketplace categories — align Admin & User sides + 4 Main Categories restructure | 25.4 |
| Medium Priority | BARA Global — add Gallery and Key Listings area | 25.5 |

### 25.0.1 Meeting agenda (Marlon → Mathias)

Open meeting request topics — to be scheduled, agenda items:
- [ ] **BARA Streams** review (status of each pillar, priorities, parity gaps) — see 25.2
- [ ] **BARA Coins** — earn / spend balance review (also tracked under Active Work P1 #10)
- [ ] **BARA Sports** — current state, manual content workflow, what's blocking handover

### 25.0.2 Screenshots referenced (NOT YET INSPECTED)

Marlon's message referenced two inline images (`Image #5`, `Image #6`) and attached two more screenshots:
- **Image #5** — example of a payment screen showing 3 payment methods (used as the "≥ 3 methods" reference for 25.6.5)
- **Image #6** — screenshot of a user still having trouble with login + commenting (relevant to 25.1.1, 25.1.3)
- `WhatsApp Image 2026-04-24 at 7.45.52 AM.jpeg` — content not yet reviewed
- `ff9534fb-e987-40ee-816f-8ca2cb576ace.jpeg` — content not yet reviewed

> ⚠️ **Action**: Open these four images, transcribe any UI text / error messages, and append the findings here before beginning implementation. Don't assume the screenshots only restate what's in the message — they may contain specific error strings, account names, browser versions, or stack traces that change the fix.

### 25.1 Auth & Account Bugs (P0)

- [x] **25.1.1 Sign-up / login full audit (Clerk)** ✅ Code-side audit done May 5 (commit `4011eee`). **Findings:**

  **Code fixed (3 mis-routed entry points):**
  - `StreamsSidebar` "Create Playlist" sent users to `/sign-in` (admin sign-in!) instead of `/user/sign-in`. Fixed + now preserves location as `redirect_url`.
  - `SportsScores` "Sign In Now" CTA linked to admin `/sign-in`. Fixed to `/user/sign-in?redirect_url=/sports/scores`.
  - `PostListing` pre-auth redirect used `?redirect=` (wrong param name) — the auth flow reads `?redirect_url=`, so the return-to URL was silently dropped. Fixed.

  **Clerk v5 redirect API migration** (commit `1efc1c4`, see 25.1.2) — fixes a class of post-auth navigation failures across browsers, including the "popup never closes" symptom.

  **Maj theGeezer "username already taken" — three possible causes:**
  1. Username genuinely taken (someone — possibly Maj himself in an abandoned earlier attempt — already reserved it). Check Clerk Dashboard → Users for `maj_thegeezer` / `MajtheGeezer` / `majthegeezer` (Clerk treats usernames case-insensitively).
  2. Reserved-words list in Clerk Dashboard → User & Authentication → Username settings — some words are blocked.
  3. The username field is required at all (current Clerk Dashboard config). **Recommendation:** drop the username requirement entirely (see 25.1.1.a). Sign up with email + password only; let users pick a display name post-sign-up if/when needed. This eliminates the bug class permanently and shortens the form.

  **Action items for Marlon (Clerk Dashboard, dev.clerk.com):**
  - [ ] Search for existing accounts matching `majthegeezer` (any case, with/without spaces). Delete or reassign if it's an orphan.
  - [ ] User & Authentication → Email, Phone, Username → set Username to **off** (recommended) OR **optional**. Email + password only.
  - [ ] User & Authentication → Restrictions → review reserved-words list. Remove anything not strictly needed.
  - [ ] Customization → Account portal → confirm post-sign-up redirect is **not** overriding our `forceRedirectUrl=/auth/finish`.
  - [ ] After changes, retest sign-up as `Maj theGeezer` with a fresh email and confirm it succeeds without the username collision.

  **Other entry-point friction noted (handled in 25.1.1.c non-user QA pass):** ~20 places navigate to `/user/sign-in` without preserving `redirect_url`, so users land on home `/` after sign-in instead of returning to the action they tried to take (favoriting, following, posting review, RSVP, etc.).
- [x] **25.1.1.a Sign-up UX — "as quick and painless as possible"** ✅ Code-side May 5. UserSignUpPage now uses Clerk `layout.showOptionalFields: false` (hides non-required fields by default, user can expand if they want), `socialButtonsPlacement: 'top'` (one-tap social sign-up if Dashboard has Google/Apple enabled), tightened heading copy ("Sign up — takes a few seconds"), reduced mobile padding. Also fixed design-system violation: button + sign-up CTA card were `bg-blue-600` → now `bg-black` per the strict black/white/gray rule. **Field-level trimming still requires Clerk Dashboard action by Marlon** — turn off Username field (drops it from required), keep Email + Password. Re-evaluate first/last name fields: probably keep optional only, asked once post-sign-up if needed.
- [ ] **25.1.1.b Investigate alternatives to current 3rd-party (Clerk) flow** — team asked: *"is there a better way to do it while still using a 3rd party?"* Action: evaluate whether the current Clerk flow can be customized further, or if Clerk's native components vs hosted pages would be smoother; document trade-offs before deciding.
- [x] **25.1.1.c Non-user QA pass** ✅ Code-side May 5. Audited every sign-in / sign-up entry point in the codebase and fixed 21 files where the user's location was being dropped — every gate (favoriting, following stores/users, posting reviews, RSVP, leaving comments, posting ads, sports predictions, theme purchases, coin store, message-seller, header sign-in/sign-up buttons in both desktop and mobile drawer, and the dashboard auth guard) now preserves the current pathname as `?redirect_url=...` so the user lands back where they were after auth instead of on home `/`. Also caught a couple of design-system slips along the way: invisible `text-gray-900` on `bg-black` in ArtistVerificationPage, and a blue underline link in TicketPurchaseModal — both fixed. **Manual incognito walkthrough still needed by a human** (the platform has flows hard to evaluate without a real browser session) — but the dead-ends are now wired up correctly.
- [x] **25.1.2 Chrome sign-up popup never closes** ✅ Fix landed May 5 — root cause was deprecated Clerk v4 API on v5.46. `ClerkProvider` had bogus nested `signIn`/`signUp` config keys (silently ignored in v5) and every `<SignIn>` / `<SignUp>` page used deprecated `afterSignInUrl` / `afterSignUpUrl` props. Firefox tolerated the deprecated path; Chrome's stricter cross-origin handling could drop the post-auth redirect, leaving the form open. Migrated 5 files to v5: `forceRedirectUrl` on each `<SignIn>` / `<SignUp>`, and `signInFallbackRedirectUrl` / `signUpFallbackRedirectUrl` on `ClerkProvider`. **Needs Marlon to retest in Chrome / Edge / Safari / Firefox / mobile Chrome / mobile Safari** — couldn't reproduce live, so the fix is best-guess based on the symptom + Clerk v5 migration guide.
- [x] **25.1.3 Blog comments permissions error** ✅ Done May 4 (commit `a986918`) — root cause was missing GRANTs on `blog_comments` + `blog_comment_likes`, not RLS. Verify on Marlon / Maj's accounts post-deploy.
- [x] **25.1.4 SSL certificate "Not Secure"** ✅ Audited May 4 — infrastructure is healthy. Apex + www both serve valid Let's Encrypt R12 certs (renewed May 3, valid until Aug 1, Vercel auto-managed). HTTP→HTTPS is 308 Permanent Redirect on both. HSTS `max-age=63072000` (2 years). Code is clean — no `http://` asset/script/fetch URLs (only SVG XML namespace + protocol-relative Google Translate `//translate.google.com/...` which inherits HTTPS). **Likely cause of Marlon's report:** browser cached an old `http://` visit before HSTS was set, or he hit an uncovered subdomain. Action: confirm with Marlon which exact URL showed "Not Secure" + whether it reproduces in incognito on a fresh device. No code changes needed.

### 25.2 Streams Status & Parity (P0)

- [ ] **25.2.1 E-books operational status check** — Confirm e-books section is fully working end-to-end: browse, detail page, "read" / preview, admin upload, storage bucket, RLS. Document any gaps and fix them.
- [ ] **25.2.2 Super Admin permissions verification** — Verify Super Admin role has full permissions across all Streams admin areas (Music, Movies, E-books, Podcasts, Gaming) and content moderation flows. Test create / edit / delete / publish / unpublish on each.
- [ ] **25.2.3 Music UX/UI parity with josplay.com** — Music is the **most important pillar** of Streams. Benchmark https://music.josplay.com/ and bring our listening experience to parity or better: player UX, queue handling, browse-by-genre, artist pages, album pages, playlists, search results. Produce a gap analysis first, then implement in passes.

### 25.3 About Us Page — Copy Update (P0) ✅ Done May 4

- [x] Replace the current About Us body copy with the new **"ORIGINS: BARA Afrika"** copy (4 paragraphs, ending: *"We are one. We are home. We are your bridge to New Africa."*). Final copy provided by Marlon — paste verbatim. ✅ commit `80f71da`
- [x] Replace the tagline **"Est 2024, Rwanda"** with **"Made by Africans for Africans and friends of Africa"** wherever it appears (footer, About page hero, marketing cards). ✅ commit `80f71da`
- [ ] Audit any other "About / Mission / Story" surfaces (footer, marketing site if any, email templates, social meta) for stale copy and align with the new wording.

### 25.4 Marketplace Categories Restructure (P1)

> Team finding: there is a **mismatch between Admin-side categories and User-side categories**. Audit and reconcile, then restructure into 4 Main Categories with the subcategories below. Migrate existing `marketplace_listings` to the new taxonomy without breaking live ads.

#### 25.4.1 Audit
- [x] **Diff Admin vs User category list** ✅ Done May 6. Found **5 different category lists** in the codebase, all slightly different:

  | Source | Count | Slugs |
  |---|---|---|
  | DB seed (`20260102_seed_marketplace_categories.sql`) | 7 | property-sale, property-rent, motors, classifieds, jobs, furniture-garden, mobile-tablets |
  | Root-level legacy SQL (`ADD_MISSING_CATEGORIES.sql` + `UPDATE_CATEGORY_NAMES.sql`, manually run) | 13 | Adds electronics, fashion, services, kids-babies, pets, hobbies, business-industrial; deletes classifieds |
  | `src/pages/MarketplacePage.tsx` hardcoded array | 12 | Same 12 as above minus property-rent (only 1 property tile shown on home) |
  | `src/config/categoryFieldConfigs.ts` (post-form) | 11 | **Different slugs**: `property` (vs DB `property-sale`/`property-rent`), `home-furniture` (vs `furniture-garden`), `businesses` (vs `business-industrial`); no `mobile-tablets` field config at all |
  | `src/pages/admin/AdminMarketplaceCategories.tsx` HARDCODED_CATEGORY_SLUGS | 13 | Yet another list with `business-industrial` etc. |

  **Root cause of Marlon's "Admin vs User mismatch" complaint:** the slug mismatches in `categoryFieldConfigs.ts` mean the post-ad form renders the wrong fields (or none) for property-sale/property-rent/furniture-garden/mobile-tablets/business-industrial. Every cross-source change has historically been done in only some sources, leaving the others stale.

- [ ] **Decide on canonical taxonomy source (DB table) and migrate both Admin + User UI to read from it.** Recommendation: keep `marketplace_categories` + `marketplace_subcategories` as the single source of truth; `categoryFieldConfigs.ts` keeps its field configs but keys them by DB slug; `MarketplacePage.tsx` and `AdminMarketplaceCategories.tsx` stop hardcoding lists and read from the DB. Pending sign-off.

- [ ] **Spec ambiguity to resolve before 25.4.2–6:** the plan calls for "4 Main Categories restructure" with Electronics / Appliances / Climate Control / Mobile Phones & Tablets — but all 4 are consumer-electronics buckets. Two possible reads:
  - **(A) Strict 4** — entire marketplace narrows to consumer electronics; Motors / Property / Jobs / Fashion / Pets / Kids&Babies / Hobbies / Services / Businesses&Industrial / Furniture&Garden get removed from marketplace (moved elsewhere or deleted).
  - **(B) 4 new top-level categories added alongside existing ones** — the 4 new finer-grained electronics categories replace the current "Electronics & Appliances" + "Mobile & Tablets" buckets; everything else stays. End state: ~14 main categories.

  Reading (B) fits the spec text better (subcategory lists in 25.4.2–5 are electronics-only) and is far less destructive given live listings in Motors/Property/Jobs. **Need Marlon's confirmation** before executing 25.4.2–6.

#### 25.4.2 Main Category — Electronics
Subcategories (with item-level examples from team — used as picker tags / placeholder text on post-ad form):
- [ ] **TVs** — LED, QLED, OLED, Smart TVs, CRT TVs
- [ ] **Home Audio** — Soundbars, speakers, AV receivers, subwoofers
- [ ] **Portable Audio** — Headphones, earphones, MP3 players, Bluetooth speakers
- [ ] **Video** — Projectors, Blu-ray / DVD players, streaming devices (Chromecast / Roku)
- [ ] **Computers | Laptops & Notebooks** — Ultrabooks, refurbished laptops, tower PCs, workstations, office computers
- [ ] **Computer Accessories & Components** — CPUs, RAM, graphics cards, hard drives (HDD/SSD), motherboards, monitors, keyboards, mice, printers, scanners, routers, modems, cables
- [ ] **Gaming & Accessories** — Gaming laptops, gaming consoles, accessories (controllers, headsets, VR headsets, steering wheels)
- [ ] **Cameras** — DSLR, mirrorless, point-and-shoot, action cameras (GoPro), drones
- [ ] **Camera Accessories** — Lenses, tripods, flashes, memory cards
- [ ] **Smart Home** — Smart security cameras, smart plugs, smart thermostats, doorbell cameras
- [ ] **Vehicle Electronics** — Car stereos, GPS units, dash cams, amplifiers
- [ ] **Specialized Electronics**:
  - Electronic Components — sensors, relays, circuit boards
  - Office Electronics — fax machines, copiers, paper shredders, etc.

#### 25.4.3 Main Category — Appliances
Subcategories (with item-level examples):
- [ ] **Refrigerators & Freezers** — upright, chest, french door, mini-fridges
- [ ] **Ovens & Ranges** — electric stoves, gas stoves, built-in ovens, hobs, cooking ranges
- [ ] **Dishwashers** — freestanding, integrated, slimline
- [ ] **Microwaves** — countertop, built-in
- [ ] **Range Hoods & Ventilation** — kitchen exhaust fans
- [ ] **Food Prep** — blenders, mixers, food processors, juicers
- [ ] **Cooking & Heating** — air fryers, rice cookers, toasters, toaster ovens, slow cookers, electric kettles
- [ ] **Coffee & Espresso** — electric kettles, coffee makers, espresso machines
- [ ] **Cleaning Appliances**:
  - Vacuum Cleaners — cordless, corded, robot, hand-held
  - Steam Cleaners & Carpet Washers
  - Irons & Steamers — clothes irons, garment steamers
- [ ] **Washing Machines & Dryers**:
  - Washing Machines — front loaders, top loaders, semi-automatic
  - Clothes Dryers — vented, condenser, heat pump
  - Washer & Dryer Sets / Combos — combined units or matched sets

#### 25.4.4 Main Category — Climate Control
Subcategories (with item-level examples):
- [ ] **Air Conditioners** — window, split, portable
- [ ] **Fans** — pedestal, ceiling, desk
- [ ] **Heaters** — room heaters, electric heaters
- [ ] **Air Purifiers & Dehumidifiers**

#### 25.4.5 Main Category — Mobile Phones & Tablets
Subcategories (with item-level examples):
- [ ] **Mobile Phones** — smartphones (Android / iOS), feature phones, refurbished phones
- [ ] **Tablets & E-Readers** — iPad, Android tablets, Kindle, e-readers
- [ ] **Accessories** — cases, covers, chargers, power banks, screen protectors, styluses
- [ ] **Wearable Tech** — smartwatches, fitness trackers

#### 25.4.6 Migration & Wiring
- [ ] Update `categoryFieldConfigs.ts` (or DB-backed equivalent) with the new tree
- [ ] Migrate existing `marketplace_listings` rows to the closest new (sub)category
- [ ] Update mega-menu, marketplace search filters, post-ad form, admin moderation filters
- [ ] Update SEO meta titles for category landing pages

### 25.5 BARA Global — Gallery & Key Listings (P1)

> New admin-managed surfaces on the BARA Global country pages.

#### 25.5.1 Gallery ✅ Done May 7
- [x] **Admin-only photo upload UI** — new page at `/admin/country-gallery` with country picker + `CountryGalleryManager` component (multi-file picker, captions, reorder via up/down arrows, delete). Sidebar entry added under "Country Info".
- [x] **Dimensions and file size** — frontend pre-resizes to 1920px on the longest side, JPEG-compresses with quality stepping down (0.85 → 0.5) until under ~500 KB. Hard limit 5 MB per file (oversized rejected with toast). Bucket also enforces 5 MB and JPEG/PNG/WebP MIME allow-list.
- [x] **Storage bucket + RLS** — new `country-gallery` bucket. Public read; INSERT/UPDATE/DELETE require authenticated. Admin gating happens in the frontend via `AdminAuthGuard`, matching the existing `country-flags` / `country-leaders` / `country-monuments` bucket convention.
- [x] **Public gallery viewer** — new `CountryGallery` component mounted on `CountryDetailPage` (between hero and sponsored banner). Responsive grid (2/3/4 cols), captions on hover, fullscreen Dialog lightbox with prev/next navigation, keyboard arrow-key support, photo counter. Section is fully hidden when a country has no photos.

Files: `supabase/migrations/20260507_country_gallery.sql`, `src/components/CountryGallery.tsx`, `src/components/admin/CountryGalleryManager.tsx`, `src/pages/admin/AdminCountryGallery.tsx`. Wired into `CountryDetailPage`, `App.tsx`, `AdminSidebar`, `AdminLayout`.

#### 25.5.2 Key Listings ✅ Done May 7
Admin-side fields for each Key Listing entry:
- [x] **Main Category Type** (enum) — Postgres enum `country_key_listing_type` with 6 values: government_ministry, regulator, agency, sports_federation, charity, ngo. Labels rendered via shared `src/lib/countryKeyListingTypes.ts` so admin + public agree.
- [x] **Description** — Textarea with live word counter; 100-word cap enforced in form validation (`countWords` util). Counter turns red over the limit, save blocked.
- [x] **Web Link** — Both client-side (`/^https:\/\//i.test`) and DB-side `CHECK (web_link IS NULL OR web_link ~* '^https://')` validation.
- [x] **Logo** — Square icon up to 100 KB (bucket-enforced). New `country-key-listing-logos` Supabase Storage bucket separate from country-gallery so the size cap can be tighter. Frontend pre-validates size and rejects oversized uploads with a toast.
- [x] **Address + Telephone** — Free-text fields, both optional.
- [x] **Public listing** on country landing page — new `CountryKeyListings` component mounted on `CountryDetailPage` after the gallery, renders entries grouped by listing type with logo, description, web link, address (with map pin icon), tel: link. Section is fully hidden when a country has no listings.
- [x] **Admin CRUD page** — `/admin/country-key-listings` with country picker, list-by-type view, add/edit dialog, sidebar entry, page guide.

Migration: `supabase/migrations/20260508_country_key_listings.sql`. Files: `src/lib/countryKeyListingTypes.ts`, `src/components/CountryKeyListings.tsx`, `src/components/admin/CountryKeyListingsManager.tsx`, `src/pages/admin/AdminCountryKeyListings.tsx`. Wired into `CountryDetailPage`, `App.tsx`, `AdminSidebar`, `AdminLayout`.

### 25.6 Payments — Phase 15 Expansion (P1, blocks monetization)

> Expands the existing Phase 15 (Flutterwave) plan based on team feedback.

- [ ] **25.6.1 MTN MoMo direct integration** — direct API integration (not via aggregator) + MTN compliance / KYB sign-off
- [ ] **25.6.2 MTN MoMo multi-country** — extend to 15+ African countries where MTN MoMo operates (Ghana, South Africa, Nigeria, Cameroon, Côte d'Ivoire, Uganda, Rwanda, Zambia, Benin, Congo-B, Liberia, Guinea-Conakry, Guinea-Bissau, Sudan, etc.)
- [ ] **25.6.3 Visa / Mastercard acceptance** — card payments via Flutterwave or direct PSP, including 3DS support
- [ ] **25.6.4 PAPPS integration** — Pan-African Payment & Settlement System integration for cross-border payments
- [ ] **25.6.5 Payment screen UX** — checkout / pay screen must offer at least **3 payment methods** clearly visible, with method selection persisted per user
- [ ] **25.6.6 Documentation** — user-facing docs ("How payments work on BARA"), seller docs ("How payouts work")

### 25.7 Monetization & Referrals (P1)

- [ ] **25.7.1 Identify current ad provider** — confirm whether the current "AdChoices" labelled ads are Google AdSense or another network; document publisher account IDs and where ad code is wired in
- [ ] **25.7.2 Google AdSense onboarding** — apply / verify, enable PPC + CPM + Auto Ads, target the standard ~68% publisher revenue share. Wire `ads.txt`, AdSense site verification, and place ad slots without breaking the black/white design system
- [ ] **25.7.3 Affiliate Marketing program** — register BARA as an affiliate publisher with major networks (Amazon Associates where allowed in our African markets, Awin, CJ, Impact, region-specific networks) and identify content surfaces (blog, marketplace categories, e-books) where affiliate links fit
- [ ] **25.7.4 CPA (Cost-per-Action) marketing** — register for CPA networks, identify offer types that fit African audiences (financial products, telco offers, app installs)
- [ ] **25.7.5 Outbound "Refer-a-Friend" programs** — research and join external refer-a-friend programs we can promote to our users (e.g. fintech, ride-hailing, telco) for additional revenue
- [ ] **25.7.6 BARA's own referral program** — design our internal "invite a friend" flow on top of BARA Coins (separate from external refer-a-friend partnerships)

### 25.8 Cyber Security Authority (CSA) Meeting (P1, compliance)

- [ ] **25.8.1 Compliance & Data Protection Certificate** — engage CSA, complete required filings, obtain Data Protection Certificate
- [ ] **25.8.2 Offer assistance for CSA awareness** — propose BARA as a partner for CSA's public-awareness campaigns (content slots in BARA Global / Blog, joint announcements). Document the offer, send a formal letter
- [ ] **25.8.3 Internal security posture review** — before the CSA meeting, run a self-audit (RLS, secrets, third-party data sharing, data retention) and prepare a one-pager

---

## DEPENDENCIES MAP

```
Phase 15 (Payments) ──→ Flutterwave account approval
Phase 16.4 (Notifications) ──→ notifications table must exist before email triggers
Phase 17 (Streams overhaul) ──→ AudioPlayerContext refactor needed first
Phase 18.3 (Organizer profiles) ──→ event_organizers table + messaging system
Phase 22 (Email overhaul) ──→ Resend domain verification for @baraafrika.com
Phase 23 (Testing) ──→ All feature phases (16-22) should be complete first
Phase 24 (Audit) ──→ After public launch with real users
BARA Coins balance review ──→ Team meeting required
User profile visibility ──→ Team decision required
```

---

## KEY METRICS TO TRACK

| Metric | Target | Current |
|--------|--------|---------|
| Active pages without console errors | 100% | ~85% |
| Mobile-responsive pages | 100% | ~70% |
| Email templates with correct design | 13/13 | ~5/13 |
| Supabase tables with RLS | 100% | ~90% |
| Features with skeleton loaders | 100% | ~40% |
| Code bundle size | < 3MB | ~5MB |
| Lighthouse Performance (key pages) | > 70 | Unknown |
| Lighthouse Accessibility | > 90 | Unknown |

---

## RISK REGISTER

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | Clerk dev keys rate limiting in production | High | Switch to production keys (Active Work #1) |
| R2 | api-sports.io Pro plan cost ($10/mo) | Medium | Deferred — use manual content. Revisit when revenue exists |
| R3 | 5MB+ bundle size causing slow loads | High | Code split streams/marketplace/events/blog (Phase 21.5.2) |
| R4 | Email deliverability — still using `onboarding@resend.dev` | High | Verify domain in Resend, update from address (Phase 22.6) |
| R5 | No payment integration — marketplace is manual-only | Medium | Phase 15 (Flutterwave) planned |
| R6 | Blog likes stored in localStorage — lost on device change | Low | Phase 20.2.1 — needs `blog_post_likes` table |
| R7 | Google Translate widget is ugly and uncontrollable | Low | Phase 9.10 — replace with proper i18n |

---

## CHANGELOG

*Master Plan created: Feb 22, 2026*
*Phases 1-6 completed: Feb 22, 2026*
*Phase 7 (68 items) implemented: Mar 1 – Apr 8, 2026*
*Phase 8 (Testing & Coins Design) documented: Mar 17, 2026*
*Phase 9 (Platform Maturity) added: Mar 23, 2026*
*Phase 10 (Blog & Admin Polish) completed: Apr 6, 2026*
*Phase 11 (Marketplace Trust) completed: Apr 6, 2026*
*Phase 12 (Universal Share & OG) completed: Apr 9, 2026*
*Phase 13 (Events Perf & Marketplace UX) completed: Apr 10, 2026*
*Phase 14 (Marketplace Deep Features) completed: Apr 11, 2026*
*Phase 14.9 (Bug Fix Round) completed: Apr 12, 2026*
*Phase 15 (Payment Integration) planned: Apr 11, 2026*
***April 13, 2026 — MAJOR RESTRUCTURE: Merged REVAMP_PROMPT.md into MASTER_PLAN.md as Phases 16-24. Archived completed phases 1-14 to MASTER_PLAN_ARCHIVE.md. Added START HERE section for multi-AI compatibility. Added RULES section. Refreshed OPEN ITEMS, DEPENDENCIES, METRICS, and RISK REGISTER.***
*April 13, 2026 — Phase 16 implementation sprint: notifications table + RLS + realtime (16.4.1-4), NotificationBell redesign (black/white design system, 17 notification types with icons), blog_post_likes table replacing localStorage (Active Work #6), EmptyState component + improved no-results on 4 search pages (16.1.5), button press feedback on all Buttons (16.2.1), share audit + ArtistPage share + BlogPostDetail unified to useShare (16.3.1).*
*April 22, 2026 — Duplicate confirmation email investigation. Diagnosed two paths: (1) `send-email` edge function had no idempotency guard, so the self-update of `email_queue.status='sent'` re-fired the DB webhook and re-delivered the email; (2) `AdminMarketplace.updateListingStatus` was double-sending listing_approved (DB trigger + direct invoke). Code fixes merged in `4ddca2e`. Open: deploy edge function (22.5.3), audit Supabase webhook to INSERT-only (22.5.4), verify end-to-end (22.5.5), migrate remaining direct `send-email` calls in AdminBlog/UserBlogEditor/UploadSongPage to the queue (22.5.1), add `listing_rejected` branch to marketplace trigger (22.5.6).*
*April 23–28, 2026 — **Phase 25 added: Team & Stakeholder Feedback** from Marlon and team. Added six new P0 blockers (sign-up/login bugs incl. Maj Mlinzi "Maj theGeezer" username case, Chrome sign-up popup never closes, blog comments permissions error, SSL not Secure, About Us copy replacement to "ORIGINS: BARA Afrika" + "Made by Africans for Africans and friends of Africa", Music UX/UI parity with josplay.com). New Phase 25 sub-sections: 25.1 Auth bugs, 25.2 Streams status (e-books, Super Admin perms, Music parity), 25.3 About Us copy, 25.4 Marketplace category restructure into 4 main categories (Electronics, Appliances, Climate Control, Mobile Phones & Tablets) with full subcategory specs + admin/user category mismatch audit, 25.5 BARA Global Gallery (admin-only photo upload) + Key Listings (Govt Ministry/Regulator/Agency/Sports Federation/Charity/NGO with description ≤100 words, https web link, icon-size logo, address, optional tel), 25.6 Payments expansion (MTN MoMo direct + 15+ African countries, Visa/Mastercard, PAPPS, ≥3 payment methods at checkout), 25.7 Monetization (identify current ad provider/AdSense, AdSense onboarding PPC+CPM+Auto Ads ~68%, affiliate marketing, CPA, outbound refer-a-friend, internal referral program), 25.8 Cyber Security Authority engagement (Data Protection Certificate, partnership offer for CSA awareness).*
*April 28, 2026 — **Phase 25 second pass** after re-reading the original Marlon message verbatim from the conversation transcript. Filled in detail that was lost in the first pass: (a) marketplace sub-sub-category item lists for every subcategory across all 4 Main Categories (TVs LED/QLED/OLED/Smart/CRT, Home Audio soundbars/AV receivers/subs, Cameras DSLR/mirrorless/GoPro/drones, Refrigerators upright/chest/french door/mini, Cleaning Appliances vacuum types + steam + irons, Washing Machines front/top/semi-auto, Mobile Phones smartphones/feature/refurbished, etc.); (b) Key Listings logo "similar to Coat of Arms" reference preserved; (c) Sign-up UX directives split out — "as quick and painless as possible" (25.1.1.a), 3rd-party alternative evaluation (25.1.1.b), non-user QA pass (25.1.1.c); (d) team's verbatim priority labels (CSA = High Priority, SSL / Marketplace categories / BARA Global = Medium Priority) preserved in new section 25.0; (e) Meeting Request agenda items — BARA Streams, BARA Coins, BARA Sports — captured in 25.0.1; (f) explicit gap-flag for the four screenshots referenced in the message (Image #5 payment screen, Image #6 login/comment trouble, plus two attached jpegs) that must still be inspected and transcribed (25.0.2).*

---

*For Bara Afrika Platform — baraafrika.com*

<!-- END OF DOCUMENT -->
