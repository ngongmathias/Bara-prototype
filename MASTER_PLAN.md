# BARA AFRIKA — MASTER PLAN

> **The single source of truth for ALL platform development — past, present, and future.**
> Used across multiple AI platforms (Windsurf, Claude Code, Antigravity, Claude terminal, code CMD sessions).
> Every AI assistant should read the **START HERE** section first, then jump to the relevant phase.
>
> **v3 — restarted lean on July 6, 2026.** Full item-level history lives in the archives:
> - `MASTER_PLAN_ARCHIVE.md` — Phases 1–14 detail (Feb–Apr 2026)
> - `MASTER_PLAN_ARCHIVE_2.md` — full plan as of Jul 6, 2026: Phases 15–27 detail, all DONE notes, migration history
>
> When a completed item's implementation details matter, check ARCHIVE_2 before re-deriving anything.

---

## ⬆️ START HERE (for any AI assistant)

### What BARA Afrika Is

**baraafrika.com** — An African super-app / diaspora platform with these major sections:

| Section | Description | Status |
|---------|-------------|--------|
| **BARA Global** | Country-specific news/gallery landing pages | Live |
| **Events** | Event discovery, ticketing, calendar, maps, organizer profiles | Live |
| **Streams** | Music (Spotify-like), Movies, Ebooks, Podcasts, Gaming hub | Live |
| **Marketplace** | Classified ads with storefronts, cart, transactions, coin-barter | Live |
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
- **Auth:** Clerk v5 (SSO, email/password; `forceRedirectUrl`/`fallbackRedirectUrl` only — no v4 props). User sign-in is `/user/sign-in` (NOT `/sign-in`, that's admin). Usernames are auto-derived from first+last name at sign-up (27.8.1) — never prompt for one.
- **Backend:** Supabase (Postgres, Edge Functions, Storage, Realtime). The app uses the **tokenless anon client** — server-side gating is done inside SECURITY DEFINER RPCs, not via auth.uid() RLS.
- **Email:** Resend API via Supabase Edge Function (`send-email`) + React Email templates; all sends go through `email_queue`
- **Deployment:** Vercel (Edge Middleware for OG tags); pushes to `main` auto-deploy
- **Icons:** Lucide, react-icons · **Charts:** Recharts · **i18n:** Google Translate widget (temporary)

### Design System (STRICTLY ENFORCED)

- **Colors**: Black, white, and greys ONLY. NO orange, NO colored accents anywhere. Black for primary actions, white backgrounds, grays (gray-100–900) for depth. Only exception: subtle status indicators (green "active" dot, red "sold" badge) — minimal and muted.
- **Typography**: Comfortaa for headings, Roboto for body text.
- **Tone**: Confident, bold, clean, modern. Think Apple + Stripe — generous whitespace, sharp contrast, no clutter.

### Terminology (IMPORTANT)

- **"Listing"** = a **business listing** in BARA Listings/Directory. NOT a marketplace item.
- **"Ad"** or **"marketplace ad"** = a marketplace item. Never call marketplace items "listings" in user-facing text (DB tables keep `marketplace_listings` internally — that's fine).

### Gamification & Economy (state as of Jul 6, 2026)

- **Every economy write goes through SECURITY DEFINER RPCs** (`economy_add_coins`, `economy_spend_coins`, `economy_transfer_coins`, …). Client tables are SELECT-only. New economy operations = new RPCs in a migration, same pattern (admin gating via `admin_users`, idempotency, logging to `gamification_history`).
- **Every earn/spend amount is admin-tunable** in Admin → Gamification: `gamification_settings` keys (XP actions, coin rewards, costs, theme prices, referral bonuses, streak multipliers, leaderboard prizes, caps) plus inline per-mission and per-achievement reward editors. Exception by team decision: the daily-spin prize table stays fixed.
- Coins have **no cash value** — never build cash-out. Coin-barter marketplace purchases are buyer→seller transfers, not a currency.
- All Phase 27 + 27.8 migrations are **applied to prod** (verified Jul 6). Migration files are named `2026MMDD_<slug>.sql`; never auto-apply — list them for Mathias to run in the Supabase SQL editor.

### Payments (Current Phase)

- **No integrated payment processing yet** (Phase 15 = Flutterwave, planned). Sellers/organizers include manual payment instructions; business packages are sold with manual fulfilment (`/packages` + Admin → Business Packages).
- **Streams music**: free during launch.

### Key File Paths & Patterns

| Pattern | Example |
|---------|---------|
| Pages | `src/pages/marketplace/SearchResults.tsx` |
| Components | `src/components/marketplace/listing-parts/SellerTrustCard.tsx` |
| Context | `src/context/AudioPlayerContext.tsx`, `src/context/ShareContext.tsx` |
| Services | `src/lib/gamificationService.ts`, `src/lib/referralService.ts`, `src/lib/verificationService.ts` |
| Admin | `src/pages/admin/AdminGamification.tsx` |
| Email templates | `supabase/functions/_shared/emails/WelcomeEmail.tsx` |
| Edge functions | `supabase/functions/send-email/index.ts` |
| Migrations | `supabase/migrations/` |
| Config | `src/config/categoryFieldConfigs.ts` |
| Compliance | `compliance/` (10 files) |
| Streams spec | `STREAMS_STANDARD.md` · Rewards reference: `GAMIFICATION_GUIDE.md` |

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
6. **Create Supabase migration files** for any new tables in `supabase/migrations/`. Do NOT apply them — list them for Mathias.
7. **Mobile-first**: every new component must look good on 375px screens.
8. **Implement one feature at a time**, build, test, commit. Never batch unrelated changes.
9. **Use existing component library** (shadcn/ui, Lucide icons) before creating custom components.
10. **Keep bundle size in mind** — lazy-load heavy features.
11. **Terminology**: Marketplace items are "ads" not "listings" in user-facing text.
12. **Likes not reactions**: Simple like/heart buttons. No emoji reaction pickers.
13. **Design confidence**: Bold typography, generous whitespace, sharp contrast. Reference Apple, Stripe, Linear.
14. **No payment processing code** until Phase 15. Only UI for payment instructions and manual flows.
15. **Emails must go through the queue**: insert into `email_queue`; never send directly from frontend. Check user email preferences before non-critical sends.
16. **Email design**: black buttons with white text, no emojis in headings, specific deep-links, unsubscribe/preferences link in footer.
17. **Economy writes only via SECURITY DEFINER RPCs** — never reintroduce direct client writes to `gamification_*` tables. Tunable amounts live in `gamification_settings` with hardcoded fallbacks.

---

## PHASE HISTORY (Completed — Summary)

> Item-level detail: Phases 1–14 in `MASTER_PLAN_ARCHIVE.md`, Phases 15–27 in `MASTER_PLAN_ARCHIVE_2.md`.

| Phase | Date | Summary | Status |
|-------|------|---------|--------|
| 1–6 | Feb 2026 | Stabilize, harden (RLS/Clerk JWT), gamification v1, messaging, launch prep, monitoring | ✅ |
| 7–8 | Mar 2026 | 68-item major build (headers, Streams white theme, admin CRUD, mobile nav); testing & coins design | ✅ |
| 9–10 | Mar–Apr | Platform maturity (partially open — see backlog); blog & admin polish | 🟡 |
| 11–14 | Apr 2026 | Marketplace trust, universal share/OG, events perf, deep marketplace features (variants, cart, reviews) | ✅ (backlog remains) |
| 15 | planned | Flutterwave payment integration — NOT started (see Active Work) | ⬜ |
| 16–21 | Apr–Jun | UX revamp, Streams overhaul, events, marketplace, blog, cross-section — largely shipped; leftovers folded into backlog | 🟡 |
| 22 | Apr–Jun | Email system overhaul — templates + queue + idempotency shipped; domain verification open | 🟡 |
| 23–24 | ongoing | Pre-launch testing & post-launch audit — checklists in ARCHIVE_2 | ⬜ |
| 25 | Apr 23–28 | Team & stakeholder feedback round — most P0s fixed; categories restructure + CSA compliance open | 🟡 |
| 26 | Jun 17–23 | Platform repair + Streams Spotify-grade overhaul (Tier 1 done; Tier 2/3 in `STREAMS_STANDARD.md`) | 🟡 |
| 27 | Jul 5–6 | Gamification overhaul & economy control: server hardening, referrals, weekly missions/leaderboard, streak shields, prestige, anti-abuse, full admin tunability | ✅ core done |
| 27.8 | Jul 6 | Marlon meeting decisions: auto-usernames, verification, coin-barter, packages scaffold, referral surfacing, explainers, leaderboard prizes, upload legal | ✅ all 8 done |

**Migrations:** ALL applied to prod as of Jul 6, 2026 (verified 15/15 via read-only probe), **except** `20260622_streams_content_fields.sql` (status unknown — check before touching song/album descriptions).

---

## ACTIVE WORK

### Pre-Launch Blockers (P0)

| # | Item | Source |
|---|------|--------|
| 1 | **Clerk production keys** — app runs on dev keys with strict rate limits | 7.42 |
| 2 | **Emails: domain + audit** — @baraafrika.com in Resend (SPF/DKIM), replace `onboarding@resend.dev`; audit the `email_queue` webhook is INSERT-only/registered once | 7.51 / 22.5.4 / 22.6 |
| 3 | **Cross-device human pass** — mobile 375px / tablet / desktop, all pages; several fixes are "best-guess, needs retest" | 23.1 |
| 4 | **Clerk flow audit** — retest Chrome sign-up popup (never closes) now that sign-up changed to auto-usernames; full walk of all auth entry points | 25.1.1 / 25.1.2 |
| 5 | **SSL not showing Secure** — confirm Vercel SSL for baraafrika.com + subdomains, fix mixed content | 25.1.4 |
| 6 | **`20260622_streams_content_fields.sql`** — confirm applied (song/album descriptions dropped otherwise) | 26 |
| 7 | **27.2.3 Admin economy-settings save rejection** — Jul 6 test: saving a setting failed "not admin" for Mathias. Verify his row in `admin_users` (active, correct Clerk ID) and retest. May already be fixed — re-verify after next tuning session. | 27.2.3 |

### Important (P1)

| # | Item | Source |
|---|------|--------|
| 1 | DPO compliance gaps — privacy policy (api-sports, retention, DFD) | 7.33 |
| 2 | Streams: volume control in player | 7A-1.3 |
| 3 | User profile visibility — needs team call | 7D |
| 4 | Event saves (`event_bookmarks`) + business listing saves (`listing_bookmarks`) | 10.4 |
| 5 | Favorites count badge + "My Favorites" dashboard link | 13.7 |
| 6 | CSA (Cyber Security Authority) compliance meeting follow-ups | 25.8 |
| 7 | Marketplace categories restructure remainder — esp. **old-ad remap** (data-integrity risk) | 25.4.6 / 27.6.8 |
| 8 | BARA Global gallery & key listings | 25.5 |

### Backlogs (detail in ARCHIVE_2)

- **Phase 15 — Payments (Flutterwave)**: full 12-task plan in ARCHIVE_2. Unblocks: business-package charging, ticket payments, coin-store purchases, seller payouts. Depends on Flutterwave account approval.
- **Phase 9 leftovers**: track ownership constraint, universal file upload, sports management, admin ebooks, creator dashboard analytics, i18n (= 27.6.6).
- **Phase 11/11.7 marketplace backlog**: partner dashboard, lead inbox UI, bulk CSV upload, saved-search alerts, video ads, slug URLs, fraud rules, posting-form unification (delete PostListing.tsx in favor of CategoryPostForm).
- **Phase 22 email**: create remaining new templates/triggers, preferences page completeness.
- **Phases 23/24 checklists**: cross-browser, error states, perf, SEO, competitor benchmark — run before/after launch.
- **Streams Tier 2/3** (`STREAMS_STANDARD.md`): radio, daily mixes, synced lyrics enhancements, gapless/crossfade, offline/PWA (27.6.5), perf/a11y.

### Phase 27 — remaining items

- [ ] **27.4.1 Coin anchor ratification** — `economy.coins_per_usd` (100 ≈ $1) is tunable; team to ratify + internal price sheet.
- [ ] **27.4.2 New coin sinks** — partial ticket payment, per-day featured slots, super-boost bundles, artist tipping.
- [ ] **27.4.4 Quarterly seasons** — free cosmetic season track; no pay-to-win.
- [ ] **27.4.5 Marketplace Seller Reputation** (optional; NOT a currency — Trust Rank stays dead).
- [ ] **27.6.1 In-browser ebook reader** (PDF.js/EPUB.js).
- [ ] **27.6.2 Admin role separation** — `admin_users.role` read but never enforced.
- [ ] **27.6.3 Membership (Pro/Elite) reality check** — build MVP or align Pricing-page claims; partially addressed by 27.8.4 packages scaffold.
- [ ] **27.6.7 Low-end Android perf budget** — bundle + lazy-load audit beyond Streams (main chunk is ~5.4 MB).

### Guardrails (do NOT)

- Do **not** reopen the coin top-up store, re-enable sports betting (compliance), or add new currencies (XP + Coins only).
- Do **not** give coins cash value / cash-out in any form.

### Open team decisions (no code blocked)

- Final **verification required-docs list** (placeholder in `verificationService.ts` `REQUIRED_DOCS`).
- Real **business package pricing** (3 seeded packages editable in Admin → Business Packages).
- Optional: enable `pg_cron` in Supabase for the Monday leaderboard-payout + weekly-recap crons (lazy client triggers already cover both).
- ~~Clerk Dashboard: turn Username field off~~ — settled with Marlon, Jul 6, 2026.

---

## DEPENDENCIES MAP

```
Phase 15 (Payments) ──→ Flutterwave account approval
  └── unblocks: package charging (27.8.4), ticket payments, coin store, payouts
Phase 22 (Email) ──→ Resend domain verification for @baraafrika.com
Launch ──→ Clerk production keys + SSL + cross-device pass (23.1)
Phase 24 (Audit) ──→ after public launch with real users
User profile visibility ──→ team decision
```

---

## RISK REGISTER

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | Clerk dev keys rate-limiting in production | High | Switch to production keys (P0 #1) |
| R2 | Email deliverability — still `onboarding@resend.dev` | High | Verify domain in Resend (P0 #2) |
| R3 | ~5.4 MB main bundle on low-end Android | High | Code-split (27.6.7) |
| R4 | Old marketplace ads in stale categories | Medium | Remap (P1 #7) |
| R5 | No payment integration — manual-only | Medium | Phase 15 planned |
| R6 | Google Translate widget UX | Low | Real i18n (27.6.6) |

---

## CHANGELOG

*Feb 22 – Jul 6, 2026 — full changelog preserved in `MASTER_PLAN_ARCHIVE_2.md`.*

***July 6, 2026 — v3 RESTRUCTURE: archived the full plan (Phases 15–27 detail, all DONE notes) to `MASTER_PLAN_ARCHIVE_2.md` and restarted MASTER_PLAN.md lean: START HERE + RULES kept, history compressed to a summary table, ACTIVE WORK reduced to genuinely open items. Same day: Phase 27 + 27.8 shipped end-to-end and ALL migrations verified applied to prod (15/15); every earn/spend amount made admin-tunable; Marlon confirmed the Clerk username-field question is settled.***
