# BARA Afrika — Team Update
**Date:** April 28, 2026
**For:** Marlon & the wider team
**From:** Mathias

> This is a working snapshot — not the full master plan. It's the "what's done, what's next, when" view. The full detail (every sub-task, schema change, RLS rule, etc.) lives in `MASTER_PLAN.md` if anyone wants to dig deeper.

---

## TL;DR

The platform is live and running. Most user-facing sections (Events, Streams, Marketplace, Blog, Communities, Tools, BARA Global, Sports) are functional. Recent weeks have closed dozens of items — analytics dashboards across blog/marketplace/events, collaborative playlists, interest-based event recommendations, follow-store, store reviews, notifications system, and a critical duplicate-email fix among them.

We now have a clear picture of **everything still to do before public launch is comfortable**, plus the bigger feature pushes Marlon and team have asked for (Music parity with Josplay, marketplace category restructure, BARA Global Gallery + Key Listings, payments, monetization, compliance). The work is grouped below into **19 workstreams** with a **10-week rough timeline** that starts Monday May 5.

**This week (Apr 28 – May 4)** I'm in deep crunch on urgent paid client projects, so platform work is limited to monitoring, small fixes, and replying to team feedback. The serious push resumes **Monday May 5**.

---

## Heads-up on this week

I'm tied up with two urgent client deliverables through Sunday May 4. During this period I'll:

- Monitor production (errors, emails, sign-ups)
- Reply to any team questions
- Triage anything that breaks
- Continue grooming the plan so I can hit the ground running on Monday

I will **not** be starting any new feature work this week. If something is on fire, ping me and I'll handle it — otherwise the heavy lifting starts May 5.

---

## What just shipped (last 2–3 weeks recap)

A condensed list of what's already in the bank — for context on velocity:

- **Notifications system** end-to-end: in-app bell, 17 notification types with icons, unread badge, Supabase Realtime push, RLS, dedicated table
- **Blog post likes** moved off localStorage to a real Supabase table with RLS
- **Empty states** improved on 4 search pages with helpful CTAs
- **Button micro-feedback** (subtle press animation) standardized everywhere
- **Universal share modal audit** — added share to Artist page, unified Blog detail to the shared share component
- **Skeleton loaders** rolled out across Streams (Trending, New Releases, Artists, Library, Movies, Ebooks, StreamsHome)
- **Toast notifications** unified for FavoriteButton + CartContext flows
- **Scroll-triggered animations** on Blog, Marketplace, Artists, Trending Songs, New Releases
- **Lyrics tab** in the full-screen player with "lyrics not available" CTA
- **Sleep timer + playback speed** in the global music player
- **Keyboard shortcuts** for the player (space, arrows, N/P, L, M, ?)
- **Collaborative playlists** with invite link + collaborator display
- **Interest-based event recommendations** + user interests picker
- **Organizer analytics dashboard** (events, RSVPs, views, average rating)
- **Store analytics for sellers** (views, favorites, messages, ratings)
- **Store reviews / ratings** with aggregate trigger updating the partner record
- **Follow-store** with new-listing notifications to followers
- **Store banner** customization (headline, CTA text, CTA URL)
- **EWMA seller response-time** computation on every message insert
- **Blog post analytics** for writers (views, likes, comments)
- **Blog table of contents** (auto-generated, sticky on desktop, drawer on mobile)
- **Reading progress bar**, **estimated reading time**, **draft autosave**
- **Blog bookmarks** + Liked Articles tab in dashboard
- **Email-log admin view** at `/admin/email-log` (status + type filter, search, stats)
- **Email templates standardized** — 13 templates refactored to a shared style file (black buttons, no emojis in headings, consistent layout, deep-links)
- **Duplicate confirmation email — root-caused and patched** (idempotency guard in the edge function + removed double-send path in admin marketplace; deploy is the last step)
- **Event timing badge + countdown** ("Live Now", "Starts in", "Ended" states)
- **Post-event reviews** with photo upload
- **Public follow system** for users / artists
- **Achievement badges** (Early Adopter, Music Lover, Event Explorer, etc.)
- **Coins leaderboard + animation**

That's roughly 30–40 substantial pieces shipped in the past 2–3 weeks alongside dozens of smaller fixes. The platform is moving.

---

## The big picture — 19 workstreams still open

This is everything that is **not yet completely done**. Some items are days of work, some are weeks, a couple span months. Grouped by theme so the scale is visible:

### A. Pre-launch P0 bugs and gaps (must clear before "go-public" is comfortable)
1. **Sign-up & login bugs (Clerk)** — Maj Mlinzi's "Maj theGeezer" username case, Chrome sign-up popup that never closes, full audit of every sign-up entry point, "as quick and painless as possible" rewrite, evaluation of whether to stay on current third-party flow, full non-user QA pass
2. **Blog comments permissions error** — RLS / JWT mapping fix
3. **SSL certificate** — site showing "Not Secure"; Vercel cert + mixed content audit
4. **Email infrastructure deploy** — push the merged duplicate-email fix to production, audit Supabase webhook (INSERT only, registered once), end-to-end verify on every email type
5. **Clerk production keys** — currently on dev keys with strict rate limits
6. **About Us copy refresh** — replace with the new "ORIGINS: BARA Afrika" copy + change tagline to "Made by Africans for Africans and friends of Africa"
7. **Storage buckets** — verify `audio-files` and `cover-art` buckets + RLS
8. **Cross-device testing** — full pass on 375 / 390 / 412 / 768 / 1024 / 1366 / 1920 widths
9. **Production "from" email** — switch from `onboarding@resend.dev` to `noreply@baraafrika.com`

### B. Streams — Music UX/UI parity with Josplay
The most important Streams pillar per Marlon. Full benchmark of `music.josplay.com` and bring our experience to parity or better. Includes:
- Now Playing immersive redesign (desktop two-column, mobile full-screen)
- Lyrics polish, queue panel, full-width scrubbable progress bar
- Mini player enhancements (scrubbing, volume slider, heart, queue toggle)
- "Add to Playlist" modal (searchable + create-new-at-top)
- Genre/mood browsing page with bold cards
- "Made for You" daily personalized mixes
- Artist follow + verification badges
- Share-currently-playing card

### C. Streams — pillar status verification
- E-books fully operational end-to-end (browse, detail, read/preview, admin upload, storage)
- Super Admin permissions confirmed across all Streams admin
- Movies admin page (`/admin/movies`)
- Podcasts admin page (`/admin/podcasts`)
- Volume control in the player

### D. Marketplace — category restructure (per team's Saturday call)
- Audit the Admin / User category mismatch and reconcile to a single source of truth
- Restructure into **4 Main Categories**: **Electronics / Appliances / Climate Control / Mobile Phones & Tablets** — each with the full subcategory + item-level tree the team specified
- Migrate existing listings into the new taxonomy without breaking live ads
- Update mega-menu, marketplace search filters, post-ad form, admin moderation, SEO meta

### E. BARA Global — Gallery & Key Listings (per team's Saturday call)
- **Gallery**: admin-only photo upload, ideal dimensions + max file size enforced, storage bucket + RLS, public viewer (grid + lightbox)
- **Key Listings**: admin CRUD with Main Category Type (Government Ministry / Regulator / Agency / Sports Federation / Charity / NGO), description (100-word max), https web link, logo (Coat-of-Arms-size icon), address, optional telephone; public listing on country pages grouped by type

### F. Payments — Phase 15 expansion (per team feedback)
- **MTN MoMo direct integration** + MTN compliance / KYB sign-off
- **MTN multi-country** (15+ African countries: Ghana, South Africa, Nigeria, Cameroon, Côte d'Ivoire, Uganda, Rwanda, Zambia, etc.)
- **Visa / Mastercard** acceptance via PSP with 3DS support
- **PAPPS** — Pan-African Payment & Settlement System integration
- **Payment screen UX** — minimum 3 payment methods clearly visible at checkout
- **Flutterwave** account setup + payment service module + checkout flow + webhook handler (the original Phase 15 baseline)
- Seller payouts (subaccounts, commission), cart checkout (grouped by seller), payment method selector

### G. Monetization & referrals (per team feedback)
- **Identify current ad provider** ("AdChoices" — confirm if Google AdSense or other)
- **Google AdSense** onboarding: PPC + CPM + Auto Ads, ~68% publisher revenue share, `ads.txt`, site verification, ad slots that respect the black/white design
- **Affiliate marketing** — register with Amazon Associates (where allowed), Awin, CJ, Impact, region-specific networks
- **CPA marketing** — register with CPA networks suited to African audiences
- **Outbound refer-a-friend** programs (fintech, ride-hailing, telco) — promote external offers
- **BARA's own referral program** built on top of BARA Coins

### H. Compliance & Data Protection
- **Cyber Security Authority (CSA) meeting** — High Priority per team. Compliance, **Data Protection Certificate**, offer to assist CSA on public-awareness campaigns (joint content slots, formal letter)
- **Internal security posture review** — RLS audit, secret hygiene, third-party data sharing review, data retention review — to be ready for the CSA meeting
- **DPO compliance gaps** — privacy policy updates (api-sports, retention periods), data flow diagram

### I. Translation / i18n (currently using a temporary Google Translate widget)
- Decide between **Weglot** vs **i18next + DeepL**
- Replace the embedded Google Translate widget with a controlled, consistent solution
- Initial language coverage: English (default), French, Swahili, Portuguese, Arabic — review with team
- Roll out across all sections and email templates

### J. Email system overhaul
- Wire up the **8 templates that are written but never trigger** (WelcomeEmail, EventApprovedEmail, EventRejectedEmail, ListingCreatedEmail, TicketPurchasedEmail, BannerRequestEmail, ContactFormConfirmationEmail, EventSubmittedEmail)
- Build **5 new templates + triggers**: NewMessageEmail, EventReminderEmail (24h cron), OfferReceivedEmail, OfferAcceptedEmail, WeeklyDigestEmail (opt-in)
- **Email Preferences page** in user dashboard + DB table + footer unsubscribe link + respect-preferences check
- Migrate the remaining **direct send-email calls** in AdminBlog, UserBlogEditor, UploadSongPage to go through the queue
- Add `listing_rejected` branch to the marketplace email trigger

### K. Notifications & user engagement
- Onboarding tour (3–5 step guided tour for new users)
- Weekly digest email opt-in
- Deep-link OG previews verified across WhatsApp / Facebook / Twitter / iMessage
- "Shared with you" referral banner

### L. Phase 9 platform-maturity items
- **Track ownership** — link songs to user accounts, DB constraint
- **Universal file upload** — convert all 11 remaining URL inputs to Supabase Storage uploads
- **Country & language dropdowns** — shared constants, applied to all admin forms
- **Sports management** — teams, leagues, tournaments, fixtures, players admin + public fan pages
- **Creator dashboard** — My Music / Podcasts / Ebooks, analytics, revenue
- **Search optimization** — debounced search, filters, unified Streams search, autocomplete with typeahead
- **Event flyer** A4 / portrait aspect-ratio support
- **Dashboard missing features** — playlists, blog posts, notifications, saved items, settings tabs

### M. Now-Playing redesign (overlaps with Workstream B but tracked separately)
- Full-width immersive layout with album-art ambience
- Two-column desktop / vertical mobile
- Scrolling synced lyrics
- Always-visible queue panel (drag-to-reorder)
- Full-width scrubbable progress bar
- "Go to artist" / "Go to album" links
- Crossfade control (0–12s)

### N. Events upgrades
- "Going / Interested" RSVP with attendee count + avatars
- "How to Get Tickets" prominent section
- "Events near me" with browser geolocation
- Organizer profiles at `/events/organizer/:slug` (auto-created on first event)
- "View all events by this organizer"
- "Message Organizer" via existing messaging
- Event series / recurring events

### O. Marketplace polish (Phase 19)
- Category-aware autocomplete ("iPhone" suggests "iPhone 15 Pro > Mobiles & Tablets")
- "Message Seller" private chat
- Public Q&A on every ad
- Auto-categorization suggestion based on title keywords
- Ad boost / promote (manual flow first)
- "Payment Instructions" field prominently on every ad

### P. BARA Coins — earn / spend balance
- Team meeting required to lock the rates
- Wire **earn coins** across every action (listen, attend, post, write, share, daily streak)
- Wire **spend coins** flows (boost ad, highlight blog post, tip artist, unlock badge frame)
- Coin Store payments

### Q. Public profile page + mobile / PWA polish
- Public profile page (avatar, bio, country, joined, interests, followed artists, events attending, blog posts, marketplace rating)
- Profile visibility decision (needs team call)
- Mobile bottom navigation bar (Home / Events / Streams / Marketplace / Profile)
- PWA enhancements (add-to-homescreen, offline cache, push notifications)
- Swipe gestures (queue, like, hide, favorite)

### R. Admin analytics buildout
- Dashboard KPIs (DAU / MAU, totals, growth %, revenue, active countries)
- Searchable / filterable user management with bulk actions
- Unified content moderation queue
- Per-section analytics (Marketplace, Events, Streams, Blog, Coins) with Recharts
- CSV exports on every table
- Admin activity log (accountability)

### S. Pre-launch testing & performance
- Cross-device + cross-browser pass (Chrome, Safari, Firefox, Edge × macOS, Windows, mobile)
- 8 end-to-end user-flow walkthroughs (sign-up → ad → message → offer; sign-up → event → RSVP → reminder; etc.)
- Error-state testing (offline, empty, invalid, image failures)
- Email testing (every type rendered in Gmail / Outlook / Apple Mail)
- Lighthouse Performance > 70, Accessibility > 90 on key pages
- **Code splitting** — current bundle is 5MB+, target < 3MB (Streams / Marketplace / Events / Blog as separate chunks)
- RLS data integrity audit
- SEO audit + sitemap submission

---

## Rough 10-week timeline

Starting Monday May 5. Each week is a target, not a contract — some items may slip a week if they're harder than expected, others may finish early. I'll send a short weekly update each Friday with what shipped + what slipped.

| Week | Dates | Focus |
|------|-------|-------|
| **Now** | Apr 28 – May 4 | Day-job crunch. Production monitoring + small fixes only. |
| **W1** | May 5 – May 11 | **P0 bug week**: Auth fixes (Maj's case, Chrome popup, non-user QA), blog comments permissions, SSL cert, deploy email infra fix + verify, About Us copy + tagline, Streams pillar status check |
| **W2** | May 12 – May 18 | **Foundations**: Josplay parity gap analysis (write-up), marketplace category mismatch audit + DB schema design, Movies + Podcasts admin pages, Super Admin perms verified, AdSense application started |
| **W3** | May 19 – May 25 | **Marketplace + Global build**: marketplace 4-category restructure (DB + admin + user UI), migrate existing listings, BARA Global Gallery (admin upload + storage), Key Listings (admin CRUD + public view), CSA meeting prep package |
| **W4** | May 26 – Jun 1 | **Music UX revamp pass 1**: Now-Playing immersive layout (desktop + mobile), mini player enhancements, Add-to-Playlist modal, lyrics polish, queue panel; CSA meeting itself if scheduled |
| **W5** | Jun 2 – Jun 8 | **Payments kickoff + Compliance**: MTN MoMo paperwork + sandbox, Visa/MC PSP shortlist, Flutterwave reactivation, internal security review, DPO compliance gaps closed (privacy, retention, DFD) |
| **W6** | Jun 9 – Jun 15 | **Payments build + Translation**: MTN MoMo sandbox integration, AdSense slots wired (`ads.txt`, verification), Translation spike (Weglot vs i18next+DeepL) and decision, Email Preferences page |
| **W7** | Jun 16 – Jun 22 | **Payments expand + Email overhaul**: MTN multi-country (Ghana, SA, Nigeria, etc.), Visa/MC live, PAPPS scoping, wire up the 8 unwired email templates, build the 5 new ones, domain verified for `noreply@baraafrika.com` |
| **W8** | Jun 23 – Jun 29 | **Affiliate + Phase 9 cleanup**: register affiliate / CPA networks, design BARA's own refer-a-friend, Track ownership, Universal file upload migration, Sports management admin, Search autocomplete |
| **W9** | Jun 30 – Jul 6 | **Pre-launch testing**: cross-device + cross-browser pass, 8 E2E user-flow walkthroughs, email testing all 18 types, Lighthouse audits, code-split bundle (5MB → <3MB), RLS audit |
| **W10** | Jul 7 – Jul 13 | **Final polish + soft launch**: bug bash from W9, SEO audit + sitemap, Clerk production keys swap, organizer profiles, public profile page, **soft launch / staged public rollout** |

That's a **~2.5 month runway to a comfortable public launch** with all of the team's feedback addressed and the major missing features in place. Items in workstreams M / N / O / P / Q / R that don't fit in 10 weeks become the post-launch backlog (Phase 24+ in the master plan).

---

## What I need from the team

A few decisions that block progress — please advise when you can:

1. **BARA Coins earn/spend rates** — needs a team call to lock the values before I wire coin earning everywhere
2. **User profile visibility** — public-by-default vs opt-in vs paywalled. Affects the public profile page in W10
3. **Translation languages** — confirm initial set (English / French / Swahili / Portuguese / Arabic?)
4. **Marketplace category mismatch** — once I produce the audit (W2), I'll need a quick yes/no on the canonical taxonomy before W3 implementation
5. **CSA meeting scheduling** — I'll prepare the compliance one-pager and assistance offer, but I'll need help getting the meeting on the calendar
6. **MTN MoMo compliance contact** — who's our point of contact at MTN for KYB / API access?
7. **Resend / `baraafrika.com` DNS** — need DKIM + SPF records added before W7 so we can send from `@baraafrika.com`
8. **Test accounts** — confirm the 5–6 test accounts we'll use for end-to-end flows in W9 (writer, seller, buyer, organizer, admin, anonymous)
9. **Marlon's screenshots from the WhatsApp thread** — the four images (payment screen example, login/comment trouble screenshot, plus the two attached jpegs) — please re-share them in a fresh message so I can transcribe specifics into the plan

---

## Risks I'm watching

- **Solo-developer single-point-of-failure** — this is a wide surface for one engineer; if a complex item (MTN integration, marketplace migration) blows up, it'll push everything behind it. Mitigation: weekly status, surface blockers fast, descope cleanly when needed.
- **Third-party approvals** — Clerk production keys, Resend domain verification, MTN MoMo KYB, AdSense approval, affiliate network approvals. Each is days-to-weeks of waiting on someone external. Started early on purpose.
- **Bundle size (5MB+)** — slow first load on mobile. Code splitting in W9 should drop it under 3MB.
- **Day-job conflicts** — the kind of week I'm having now will recur. The plan has zero buffer — if a week of crunch hits during W4 or W7, the launch slips a week. Honest framing for the team.
- **Marketplace category migration** — moving live listings into a new taxonomy is risky if we get it wrong. Will be done in a transaction with a rollback plan.

---

## Bottom line

There is **a lot** still to do. The 19 workstreams above are real, the timeline is tight, and most of it lands on one developer. But the path is clear, the recent shipping cadence proves we can move, and every item below is either already in flight or scoped enough to start cleanly on Monday May 5.

Questions, corrections, additions — fire away. I'd rather adjust the plan now than discover a missing requirement in week 6.

— Mathias
