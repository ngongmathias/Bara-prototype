# BARA PLATFORM — FULL AUDIT PLAN

> **Purpose:** Systematic page-by-page, button-by-button audit of the entire Bara Afrika platform to ensure every page is complete, every interactive element works, and the user experience is seamless.
>
> **Referenced by:** `MASTER_PLAN.md`
>
> **Phase 1 Status:** ✅ COMPLETE (Feb 22, 2026) — 13 bugs found and fixed. See `MASTER_PLAN.md` for details.

---

## TABLE OF CONTENTS

1. [Audit Methodology](#1-methodology)
2. [Public Pages Audit](#2-public-pages)
3. [Authentication Flow Audit](#3-auth-flow)
4. [User Dashboard Audit](#4-user-dashboard)
5. [Admin Dashboard Audit](#5-admin-dashboard)
6. [Marketplace Audit](#6-marketplace)
7. [Events System Audit](#7-events)
8. [Communities Audit](#8-communities)
9. [Blog System Audit](#9-blog)
10. [Navigation & Layout Audit](#10-navigation)
11. [Responsive & Cross-Browser](#11-responsive)
12. [Data Integrity & Edge Cases](#12-data-integrity)
13. [Performance Audit](#13-performance)

---

## 1. AUDIT METHODOLOGY {#1-methodology}

### How to Audit Each Page

For every page listed below, verify:

| Check | What to Test |
|-------|-------------|
| **Renders** | Page loads without console errors or blank screens |
| **Data** | Dynamic data loads from Supabase (not just mock/hardcoded) |
| **Buttons** | Every button has a click handler that does something (no dead buttons) |
| **Links** | Every `<Link>` and `<a>` navigates to a valid route (no 404s) |
| **Forms** | All form fields validate, submit, and show success/error feedback |
| **Auth guard** | Protected pages redirect unauthenticated users to sign-in |
| **Empty states** | Pages gracefully handle zero data (no broken layouts) |
| **Loading states** | Skeleton/spinner shown while data fetches |
| **Error states** | Network errors show a toast or inline error, not a crash |
| **Mobile** | Layout doesn't break on 375px viewport |

### Priority Levels

- **P0 — Blocker:** Page crashes, data doesn't load, user can't complete core action
- **P1 — Major:** Button does nothing, link goes to 404, form doesn't submit
- **P2 — Minor:** Cosmetic issue, missing loading state, inconsistent styling
- **P3 — Polish:** Copy improvement, animation, micro-interaction

---

## 2. PUBLIC PAGES AUDIT {#2-public-pages}

### 2.1 Landing Page

| # | Check | File | Status |
|---|-------|------|--------|
| 2.1.1 | Page renders without errors | `src/pages/LandingPageFinal.tsx` | ☐ |
| 2.1.2 | Hero section CTA buttons work (navigate to correct routes) | | ☐ |
| 2.1.3 | Country carousel/cards load from Supabase | | ☐ |
| 2.1.4 | Event section loads upcoming events | | ☐ |
| 2.1.5 | Marketplace preview loads real listings | | ☐ |
| 2.1.6 | Community section links work | | ☐ |
| 2.1.7 | Newsletter subscribe form works | `src/components/NewsletterSubscribe.tsx` | ☐ |
| 2.1.8 | All "Explore" / "View All" buttons navigate correctly | | ☐ |
| 2.1.9 | Mobile layout — no horizontal overflow | | ☐ |
| 2.1.10 | SEO meta tags present (Helmet) | | ☐ |

### 2.2 Countries Pages

| # | Check | File | Status |
|---|-------|------|--------|
| 2.2.1 | `/countries` — list renders with flags and names | `src/pages/CountriesPage.tsx` | ☐ |
| 2.2.2 | `/countries/:countrySlug` — detail page loads correct country | `src/pages/CountryDetailPage.tsx` | ☐ |
| 2.2.3 | `/countries/:countrySlug/listings` — listings filtered by country | `src/pages/CountryListingsPage.tsx` | ☐ |
| 2.2.4 | Country detail — Wikipedia info renders | | ☐ |
| 2.2.5 | Country detail — sponsored banner displays if present | | ☐ |
| 2.2.6 | Country links from header dropdown work | | ☐ |
| 2.2.7 | Country links from footer work | | ☐ |

### 2.3 Business Listings

| # | Check | File | Status |
|---|-------|------|--------|
| 2.3.1 | `/listings` — page renders, search works | `src/pages/ListingsPage.tsx` | ☐ |
| 2.3.2 | `/:city/search` — city-scoped search works | | ☐ |
| 2.3.3 | `/:city/:category` — category listings load | `src/pages/CategoryListingsPage.tsx` | ☐ |
| 2.3.4 | `/:city/:category/:businessId` — detail page loads | `src/pages/BusinessDetailPage.tsx` | ☐ |
| 2.3.5 | Business detail — reviews section works | | ☐ |
| 2.3.6 | Business detail — map renders (if configured) | | ☐ |
| 2.3.7 | Business detail — contact buttons (phone, email, website) work | | ☐ |
| 2.3.8 | `/claim-listing` — claim form submits | `src/pages/ClaimListingPage.tsx` | ☐ |
| 2.3.9 | `/writeareview` — review form submits | `src/pages/WriteReviewPage.tsx` | ☐ |
| 2.3.10 | `/categories` — categories page renders | `src/pages/CategoriesPage.tsx` | ☐ |
| 2.3.11 | `/cities/:citySlug` — city detail page renders | `src/pages/CityDetailPage.tsx` | ☐ |

### 2.4 Static / Info Pages

| # | Check | File | Status |
|---|-------|------|--------|
| 2.4.1 | `/about` — renders with content | `src/pages/AboutUsPage.tsx` | ☐ |
| 2.4.2 | `/contact-us` — form submits, sends to Supabase | `src/pages/ContactUsPage.tsx` | ☐ |
| 2.4.3 | `/faq` — accordion items expand/collapse | `src/pages/FaqPage.tsx` | ☐ |
| 2.4.4 | `/terms` — full content renders | `src/pages/TermsOfServicePage.tsx` | ☐ |
| 2.4.5 | `/privacy` — full content renders | `src/pages/PrivacyPolicyPage.tsx` | ☐ |
| 2.4.6 | `/ask-question` — form submits | `src/pages/AskQuestionPage.tsx` | ☐ |
| 2.4.7 | `/tools` — all tools render and function | `src/pages/ToolsPage.tsx` | ☐ |

### 2.5 Advertise & Monetization Pages

| # | Check | File | Status |
|---|-------|------|--------|
| 2.5.1 | `/advertise` — page renders, all tiers display | `src/pages/AdvertisePage.tsx` | ☐ |
| 2.5.2 | `/advertise` — "Start Promoting Now" → navigates to checkout | | ☐ |
| 2.5.3 | `/advertise` — "Download Media Kit" button has action | | ☐ |
| 2.5.4 | `/advertise` — tier cards "Get Started" / "Claim Pro" / "Contact Sales" work | | ☐ |
| 2.5.5 | `/advertise` — "Set Your Bid" button in auction card works | | ☐ |
| 2.5.6 | `/advertise/checkout` — plan selection toggles | `src/pages/AdvertiseCheckoutPage.tsx` | ☐ |
| 2.5.7 | `/advertise/checkout` — bid/budget inputs accept values | | ☐ |
| 2.5.8 | `/advertise/checkout` — "Secure Upgrade" button processes (toast + redirect) | | ☐ |
| 2.5.9 | `/sponsor-country` — country dropdown loads | `src/pages/SponsorCountryPage.tsx` | ☐ |
| 2.5.10 | `/sponsor-country` — image upload works | | ☐ |
| 2.5.11 | `/sponsor-country` — form submits, shows contact dialog | | ☐ |
| 2.5.12 | `/sponsor-country` — "Contact Sales" opens mailto | | ☐ |

### 2.6 Search

| # | Check | File | Status |
|---|-------|------|--------|
| 2.6.1 | Global search (if present in header) returns results | `src/pages/SearchPage.tsx` | ☐ |
| 2.6.2 | Search results link to correct detail pages | | ☐ |
| 2.6.3 | Empty search shows appropriate message | | ☐ |

---

## 3. AUTHENTICATION FLOW AUDIT {#3-auth-flow}

| # | Check | File | Status |
|---|-------|------|--------|
| 3.1 | `/sign-in` — Clerk sign-in renders | `src/pages/SignInPage.tsx` | ☐ |
| 3.2 | `/sign-up` — Clerk sign-up renders | `src/pages/SignUpPage.tsx` | ☐ |
| 3.3 | `/user/sign-in` — User-specific sign-in works | `src/pages/user/UserSignInPage.tsx` | ☐ |
| 3.4 | `/user/sign-up` — User-specific sign-up works | `src/pages/user/UserSignUpPage.tsx` | ☐ |
| 3.5 | `/sso-callback` — SSO redirect completes | `src/pages/auth/SSOCallbackPage.tsx` | ☐ |
| 3.6 | `/auth/finish` — Auth finish page works | `src/pages/auth/AuthFinishPage.tsx` | ☐ |
| 3.7 | Sign-in → redirect to previous page or dashboard | | ☐ |
| 3.8 | Sign-out → clears session, redirects to home | | ☐ |
| 3.9 | `UserAuthGuard` — redirects unauthenticated users | `src/components/users/UserAuthGuard.tsx` | ☐ |
| 3.10 | `AdminAuthGuard` — blocks non-admin users | `src/components/admin/AdminAuthGuard.tsx` | ☐ |
| 3.11 | Clerk user → synced to `clerk_users` table in Supabase | `src/lib/clerkSupabaseBridge.ts` | ☐ |
| 3.12 | New user → welcome email triggered | `src/hooks/useWelcomeEmail.ts` | ☐ |

---

## 4. USER DASHBOARD AUDIT {#4-user-dashboard}

**Base route:** `/users/dashboard`
**File:** `src/pages/users/UserDashboard.tsx`

| # | Check | File | Status |
|---|-------|------|--------|
| 4.1 | Dashboard home — renders welcome card, quick stats, quick actions | `UserDashboard.tsx` | ☐ |
| 4.2 | Sidebar — all navigation links work | | ☐ |
| 4.3 | Sidebar — active link highlighting correct | | ☐ |
| 4.4 | Sidebar — verification status card displays | | ☐ |
| 4.5 | **My Events** — lists user's created events | `src/pages/users/UserEventsPage.tsx` | ☐ |
| 4.6 | My Events — "Create Event" button works | | ☐ |
| 4.7 | My Events — edit/delete event works | | ☐ |
| 4.8 | **My Tickets** — lists tickets user purchased | `src/pages/users/UserTicketsPage.tsx` | ☐ |
| 4.9 | My Tickets — ticket status badge correct (Confirmed for free, Pending for paid) | | ☐ |
| 4.10 | My Tickets — upcoming/past filter works | | ☐ |
| 4.11 | **Event Registrations** — organizer sees attendee list | `src/pages/users/OrganizerRegistrationsPage.tsx` | ☐ |
| 4.12 | Event Registrations — confirm/reject payment works | | ☐ |
| 4.13 | **Analytics** — metrics load (views, engagement, coins, tier) | `src/pages/users/UserAnalytics.tsx` | ☐ |
| 4.14 | Analytics — charts render | | ☐ |
| 4.15 | Analytics — achievement hall displays | | ☐ |
| 4.16 | **Banner Submissions** — form renders, upload works | `src/pages/users/UserBannerSubmission.tsx` | ☐ |
| 4.17 | Banner Submissions — existing submissions list displays | | ☐ |
| 4.18 | **Profile** — user info displays correctly | `src/pages/users/UserProfilePage.tsx` | ☐ |
| 4.19 | Profile — edit fields save to database | | ☐ |
| 4.20 | **My Listings** link → navigates to `/marketplace/my-listings` | | ☐ |
| 4.21 | **Post Marketplace Ad** link → navigates to `/marketplace/post` | | ☐ |
| 4.22 | Dashboard home "Create New Event" button works | | ☐ |
| 4.23 | Dashboard home "View Detailed Analytics" button works | | ☐ |

---

## 5. ADMIN DASHBOARD AUDIT {#5-admin-dashboard}

**Base route:** `/admin`

| # | Check | File | Status |
|---|-------|------|--------|
| 5.1 | Admin dashboard home — stats cards load | `src/pages/admin/AdminDashboard.tsx` | ☐ |
| 5.2 | **Cities** — CRUD operations work | `src/pages/admin/AdminCities.tsx` | ☐ |
| 5.3 | **Countries** — CRUD operations work | `src/pages/admin/AdminCountries.tsx` | ☐ |
| 5.4 | **Country Info** — edit country details | `src/pages/admin/AdminCountryInfo.tsx` | ☐ |
| 5.5 | **Businesses** — list, approve, reject, edit | `src/pages/admin/AdminBusinesses.tsx` | ☐ |
| 5.6 | **Events** — list, approve, reject, edit, manage slideshow | `src/pages/admin/AdminEventsEnhanced.tsx` | ☐ |
| 5.7 | **Events Slideshow** — manage featured events | `src/pages/admin/AdminEventsSlideshow.tsx` | ☐ |
| 5.8 | **Sponsored Ads** — manage ads | `src/pages/admin/AdminSponsoredAds.tsx` | ☐ |
| 5.9 | **Sponsored Banners** — approve/reject user banners | `src/pages/admin/AdminSponsoredBanners.tsx` | ☐ |
| 5.10 | **Categories** — CRUD | `src/pages/admin/AdminCategories.tsx` | ☐ |
| 5.11 | **Reports** — view reports | `src/pages/admin/AdminReports.tsx` | ☐ |
| 5.12 | **Reviews** — moderate reviews | `src/pages/admin/AdminReviews.tsx` | ☐ |
| 5.13 | **Users** — list users, edit economy (coins/XP) | `src/pages/admin/AdminUsers.tsx` | ☐ |
| 5.14 | **Admin Management** — manage admin accounts | `src/pages/admin/AdminManagement.tsx` | ☐ |
| 5.15 | **RSS Feeds** — configure feeds, refresh | `src/pages/admin/AdminRSSFeeds.tsx` | ☐ |
| 5.16 | **Settings** — platform settings save | `src/pages/admin/AdminSettings.tsx` | ☐ |
| 5.17 | **Gamification** — economy stats, leaderboard | `src/pages/admin/AdminGamification.tsx` | ☐ |
| 5.18 | **Contact Messages** — view submitted messages | `src/pages/admin/ContactMessagesPage.tsx` | ☐ |
| 5.19 | **Banner Ads** — manage banner ad slots | `src/pages/admin/AdminBannerAds.tsx` | ☐ |
| 5.20 | **Blog** — list, create, edit posts | `src/pages/admin/AdminBlog.tsx` | ☐ |
| 5.21 | **Blog Editor** — create/edit blog post | `src/pages/admin/AdminBlogEditor.tsx` | ☐ |
| 5.22 | **Slideshow Images** — manage homepage slideshow | `src/pages/admin/AdminSlideshowImages.tsx` | ☐ |
| 5.23 | **Popups** — create/manage popups | `src/pages/admin/AdminPopups.tsx` | ☐ |
| 5.24 | **Marketplace** — manage listings | `src/pages/admin/AdminMarketplace.tsx` | ☐ |
| 5.25 | **Marketplace Categories** — CRUD | `src/pages/admin/AdminMarketplaceCategories.tsx` | ☐ |
| 5.26 | **Streams Dashboard** — overview | `src/pages/admin/streams/AdminStreamsDashboard.tsx` | ☐ |
| 5.27 | **Streams Artists** — manage artists | `src/pages/admin/streams/AdminArtists.tsx` | ☐ |
| 5.28 | **Streams Songs** — manage songs | `src/pages/admin/streams/AdminSongs.tsx` | ☐ |
| 5.29 | **Streams Albums** — manage albums | `src/pages/admin/streams/AdminAlbums.tsx` | ☐ |
| 5.30 | **Sports Dashboard** — overview | `src/pages/admin/sports/AdminSportsDashboard.tsx` | ☐ |
| 5.31 | **Sports News** — manage news | `src/pages/admin/sports/AdminSportsNews.tsx` | ☐ |
| 5.32 | **Sports Videos** — manage videos | `src/pages/admin/sports/AdminSportsVideos.tsx` | ☐ |

---

## 6. MARKETPLACE AUDIT {#6-marketplace}

**Base route:** `/marketplace`

| # | Check | File | Status |
|---|-------|------|--------|
| 6.1 | Home page — categories, featured listings load | `src/pages/MarketplacePage.tsx` | ☐ |
| 6.2 | `/marketplace/categories` — all categories display | `src/pages/marketplace/AllCategoriesPage.tsx` | ☐ |
| 6.3 | `/marketplace/:categorySlug` — category page loads listings | `src/pages/marketplace/CategoryPage.tsx` | ☐ |
| 6.4 | `/marketplace/search` — search returns results | `src/pages/marketplace/SearchResults.tsx` | ☐ |
| 6.5 | `/marketplace/listing/:listingId` — detail page renders | `src/pages/marketplace/CategoryDetailRouter.tsx` | ☐ |
| 6.6 | Detail page — correct detail component per category (Property, Motors, Jobs, etc.) | `src/pages/marketplace/details/*.tsx` | ☐ |
| 6.7 | Detail page — seller contact button works | | ☐ |
| 6.8 | Detail page — "Message Seller" opens chat | | ☐ |
| 6.9 | Detail page — favorite/unfavorite works | | ☐ |
| 6.10 | Detail page — report listing works | | ☐ |
| 6.11 | `/marketplace/post` — form renders all fields | `src/pages/marketplace/PostListing.tsx` | ☐ |
| 6.12 | Post listing — image upload works | | ☐ |
| 6.13 | Post listing — category-specific fields appear on selection | | ☐ |
| 6.14 | Post listing — "Boost for 50 Coins" checkbox works | | ☐ |
| 6.15 | Post listing — form submits to Supabase | | ☐ |
| 6.16 | Post listing — XP awarded after posting | | ☐ |
| 6.17 | `/marketplace/my-listings` — shows user's listings | `src/pages/marketplace/MyListings.tsx` | ☐ |
| 6.18 | My listings — edit button → navigates to edit page | | ☐ |
| 6.19 | My listings — delete button works | | ☐ |
| 6.20 | `/marketplace/edit/:listingId` — edit form loads with data | `src/pages/marketplace/EditListing.tsx` | ☐ |
| 6.21 | `/marketplace/favorites` — shows favorited listings | `src/pages/marketplace/MyFavorites.tsx` | ☐ |
| 6.22 | `/marketplace/property-sale` — property listings load | `src/pages/marketplace/PropertyPage.tsx` | ☐ |
| 6.23 | `/marketplace/property-rent` — rental listings load | | ☐ |
| 6.24 | `/marketplace/motors` — motors listings load | `src/pages/marketplace/MotorsPage.tsx` | ☐ |
| 6.25 | `/marketplace/classifieds` — classifieds load | `src/pages/marketplace/ClassifiedsPage.tsx` | ☐ |
| 6.26 | `/marketplace/jobs` — jobs listings load | `src/pages/marketplace/JobsPage.tsx` | ☐ |

---

## 7. EVENTS SYSTEM AUDIT {#7-events}

**Base route:** `/events`

| # | Check | File | Status |
|---|-------|------|--------|
| 7.1 | Events page — upcoming events load | `src/pages/EventsPage.tsx` | ☐ |
| 7.2 | Events page — filter/search works | | ☐ |
| 7.3 | Events page — category tabs work | | ☐ |
| 7.4 | Event detail — opens from event card click | | ☐ |
| 7.5 | Event detail — all info displays (date, location, description, price) | | ☐ |
| 7.6 | Event detail — "Get Tickets" opens ticket modal | `src/components/TicketPurchaseModal.tsx` | ☐ |
| 7.7 | Ticket modal — free event → instant confirmation | | ☐ |
| 7.8 | Ticket modal — paid event → shows payment instructions | | ☐ |
| 7.9 | Ticket modal — confirmation email triggered | | ☐ |
| 7.10 | Ticket modal — ticket appears in user's "My Tickets" | | ☐ |
| 7.11 | Create event (from dashboard) — form renders, submits | `src/pages/users/UserEventsPage.tsx` | ☐ |
| 7.12 | Created event — appears in admin approval queue | | ☐ |
| 7.13 | Admin approves event → visible on public events page | | ☐ |

---

## 8. COMMUNITIES AUDIT {#8-communities}

| # | Check | File | Status |
|---|-------|------|--------|
| 8.1 | `/communities` — community cards render | `src/pages/communities/index.tsx` | ☐ |
| 8.2 | `/communities/:communitySlug` — detail page loads dynamic data | `src/pages/communities/CommunityPage.tsx` | ☐ |
| 8.3 | Community page — WhatsApp group link works | | ☐ |
| 8.4 | Community page — events widget shows relevant events | | ☐ |
| 8.5 | Community page — members count displays | | ☐ |
| 8.6 | Community page — loading and not-found states work | | ☐ |

---

## 9. BLOG SYSTEM AUDIT {#9-blog}

| # | Check | File | Status |
|---|-------|------|--------|
| 9.1 | `/blog` — blog posts list renders | `src/pages/BlogPage.tsx` | ☐ |
| 9.2 | `/blog/:slug` — blog post detail renders | `src/pages/BlogPostDetail.tsx` | ☐ |
| 9.3 | `/blog/write` — editor renders (auth required) | `src/pages/UserBlogEditor.tsx` | ☐ |
| 9.4 | Blog editor — rich text editing works | | ☐ |
| 9.5 | Blog editor — image upload works | | ☐ |
| 9.6 | Blog editor — form submits, post appears in blog list | | ☐ |
| 9.7 | `/blog/edit/:id` — loads existing post for editing | | ☐ |
| 9.8 | Admin blog — list, create, edit, delete posts | `src/pages/admin/AdminBlog.tsx` | ☐ |

---

## 10. NAVIGATION & LAYOUT AUDIT {#10-navigation}

| # | Check | File | Status |
|---|-------|------|--------|
| 10.1 | **Header** — logo links to home | `src/components/Header.tsx` | ☐ |
| 10.2 | Header — all nav links (Events, Blog, Listings, Marketplace, Advertise, Write Review) work | | ☐ |
| 10.3 | Header — Tools dropdown opens, all tool links work | | ☐ |
| 10.4 | Header — Country selector loads countries from DB | | ☐ |
| 10.5 | Header — Country selection persists and filters content | | ☐ |
| 10.6 | Header — Google Translate widget renders | | ☐ |
| 10.7 | Header — Notification bell shows (signed-in users) | | ☐ |
| 10.8 | Header — User avatar dropdown opens | | ☐ |
| 10.9 | Header — XP progress bar shows in user dropdown | | ☐ |
| 10.10 | Header — Prestige tier border on avatar correct | | ☐ |
| 10.11 | Header — Dashboard, My Events, Profile, Sign Out links work | | ☐ |
| 10.12 | Header — Admin link shows for admin users | | ☐ |
| 10.13 | Header — Mobile hamburger menu opens/closes | | ☐ |
| 10.14 | Header — Mobile menu contains all nav items | | ☐ |
| 10.15 | **Footer** — all links work (About, Contact, Advertise, Sponsor, Claim Listing, FAQ) | `src/components/Footer.tsx` | ☐ |
| 10.16 | Footer — country links in footer work | | ☐ |
| 10.17 | Footer — social media links work | | ☐ |
| 10.18 | **TopBannerAd** — renders banner from Supabase if available | `src/components/TopBannerAd.tsx` | ☐ |
| 10.19 | **BottomBannerAd** — renders banner if available | `src/components/BottomBannerAd.tsx` | ☐ |
| 10.20 | **BannerAd** — slideshow rotates, click tracking works | `src/components/BannerAd.tsx` | ☐ |
| 10.21 | **ScrollToTop** — page scrolls to top on navigation | `src/components/ScrollToTop.tsx` | ☐ |
| 10.22 | **CookieConsent** — displays and can be dismissed | `src/components/CookieConsent.tsx` | ☐ |
| 10.23 | **404 Page** — renders for invalid routes | `src/pages/NotFound.tsx` | ☐ |

---

## 11. MESSAGING SYSTEM AUDIT {#11-messaging}

| # | Check | File | Status |
|---|-------|------|--------|
| 11.1 | `/messages` — inbox renders (auth required) | `src/pages/messages/InboxPage.tsx` | ☐ |
| 11.2 | Inbox — conversation list loads | | ☐ |
| 11.3 | `/messages/:conversationId` — chat window renders | `src/pages/messages/ChatWindow.tsx` | ☐ |
| 11.4 | Chat — messages load in real-time | | ☐ |
| 11.5 | Chat — send message works | | ☐ |
| 11.6 | Chat — initiated from marketplace listing contact | | ☐ |

---

## 12. RESPONSIVE & CROSS-BROWSER {#12-responsive}

Test all major pages at these breakpoints:

| Breakpoint | Width | Priority Pages |
|-----------|-------|---------------|
| Mobile | 375px | Landing, Events, Marketplace, Streams, Sports |
| Tablet | 768px | Dashboard, Admin, Blog |
| Desktop | 1280px | All pages |
| Wide | 1920px | All pages (ensure max-width constraints) |

### Key Responsive Checks

| # | Check | Status |
|---|-------|--------|
| 12.1 | Header collapses to hamburger menu on mobile | ☐ |
| 12.2 | Dashboard sidebar collapses or stacks on mobile | ☐ |
| 12.3 | Marketplace grid → single column on mobile | ☐ |
| 12.4 | Event cards stack vertically on mobile | ☐ |
| 12.5 | Admin dashboard — tables scroll horizontally on mobile | ☐ |
| 12.6 | Forms — input fields don't overflow on mobile | ☐ |
| 12.7 | Modals — centered and scrollable on mobile | ☐ |

---

## 13. DATA INTEGRITY & EDGE CASES {#13-data-integrity}

| # | Check | Status |
|---|-------|--------|
| 13.1 | New user with 0 events — dashboard shows empty state, not error | ☐ |
| 13.2 | New user with 0 listings — marketplace "My Listings" shows empty state | ☐ |
| 13.3 | Event with 0 registrations — organizer page handles gracefully | ☐ |
| 13.4 | Country with 0 businesses — country page shows empty state | ☐ |
| 13.5 | Marketplace listing with 0 images — detail page doesn't crash | ☐ |
| 13.6 | User not synced to Supabase — gamification hooks don't crash | ☐ |
| 13.7 | Expired events — properly marked, not shown in "upcoming" | ☐ |
| 13.8 | Deleted listing — navigating to URL shows 404, not crash | ☐ |
| 13.9 | Network timeout — pages show error state, not infinite spinner | ☐ |
| 13.10 | Rapid button clicks — no duplicate submissions | ☐ |

---

## 14. PERFORMANCE AUDIT {#14-performance}

| # | Check | Status |
|---|-------|--------|
| 14.1 | Landing page — loads in <3s on 3G throttle | ☐ |
| 14.2 | No unused large dependencies bundled | ☐ |
| 14.3 | Images — proper sizing, lazy loading, WebP where possible | ☐ |
| 14.4 | Supabase queries — no N+1 queries, proper pagination | ☐ |
| 14.5 | React Query — caching configured, no redundant fetches | ☐ |
| 14.6 | Console — no excessive warnings or errors in production | ☐ |

---

## EXECUTION ORDER

1. **Phase 1 (Critical Path):** Sections 2–4 — Public pages, auth, user dashboard
2. **Phase 2 (Core Features):** Sections 6–9 — Marketplace, events, communities, blog
3. **Phase 3 (Admin & Infra):** Sections 5, 10, 11 — Admin, navigation, messaging
4. **Phase 4 (Quality):** Sections 12–14 — Responsive, edge cases, performance

**Note:** Sports and Streams have their own dedicated audit plan in `SPORTS_STREAMS_AUDIT_PLAN.md`.

---

*Document created: Feb 22, 2026*
*For Bara Afrika Platform*
