# Bara Afrika — Status & Progress Report

**Updated:** 2026-02-22

## Summary
This file summarizes what was **recently fixed/built**, what you should **test tomorrow**, and what is **next to build**.

## Recently fixed / built (today)
### Routing + Listings
- **Added missing route**: `/listings/categories`
  - Fixes the issue where clicking **View All Categories** from `/listings` was falling into the dynamic route `/:city/:category` and showing a fallback “Looking for something?” screen.
  - **Files**:
    - `src/App.tsx`

### Gamification / Missions
- **Fixed `daily_login` mission not tracking** when `user_missions` row does not exist.
  - `trackMissionProgress()` now **auto-creates** the `user_missions` row and then increments progress.
  - **Files**:
    - `src/lib/gamificationService.ts`

### Admin — Gamification page
- **Admin sidebar disappearing on** `/admin/gamification`
  - `AdminGamification` is now wrapped in `AdminLayout`, restoring sidebar + consistent admin layout.
- **Admin gamification showing “Unknown” users everywhere**
  - Root cause: `gamification_profiles.user_id` stores **Clerk user id**, but the lookup was using `clerk_users.id` (UUID).
  - Fix: enrichment now uses `clerk_users.clerk_user_id`.
  - **Files**:
    - `src/pages/admin/AdminGamification.tsx`

### Reviews
- **Write a Review business search suggestions**
  - Added **debounced auto-suggest** as you type.
  - **Files**:
    - `src/pages/WriteReviewPage.tsx`

### Marketplace
- **`/marketplace/post` blank page / auth redirect**
  - Fixed redirect query param to use `redirect_url`.
  - **Files**:
    - `src/pages/marketplace/PostListing.tsx`

### User settings UX
- **Removed confusing “Clerk manages phone” text** and improved edit UX.
- **Email is now read-only** from this page (safer).
- **Phone becomes editable in edit mode** (still depends on Clerk rules for actually persisting; see notes under “Needs follow-up”).
  - **Files**:
    - `src/pages/users/UserSettingsPage.tsx`

### Streams
- **Create playlist** now uses **Clerk auth** (was using `supabase.auth.getUser()` which returns null in this app).
  - **Files**:
    - `src/components/streams/StreamsSidebar.tsx`

- **“Made For You” play buttons** no longer show “Coming soon”.
  - They now play a shuffled subset of `trendingSongs`.
  - **Files**:
    - `src/pages/streams/StreamsHome.tsx`

- **Creator portal fixes**
  - The “Apply Now” button now navigates to `/streams/verification`.
  - Removed links that sent normal users into **admin-only** routes (`/admin/streams/...`). Replaced with a “Coming Soon / Contact us” toast.
  - **Files**:
    - `src/pages/streams/ArtistDashboard.tsx`

- **Artist verification page redirect**
  - Sign-in redirect now uses `redirect_url=/streams/verification`.
  - **Files**:
    - `src/pages/streams/ArtistVerificationPage.tsx`

### Advertise page
- **Removed the “MIT Auction Model” section** and replaced it with a clearer **“How Bara Ads Work”** section.
  - **Files**:
    - `src/pages/AdvertisePage.tsx`

### Partners page
- Confirmed `/partners` is implemented and routes to `AffiliatePage`.
  - **Files**:
    - `src/pages/AffiliatePage.tsx`
    - `src/App.tsx`

## What to test tomorrow (high priority)
### 1) Daily login mission
- Sign in -> open dashboard missions -> confirm **Daily Login** increments to **1/1**.
- Sign out/in again same day -> ensure it does not break.

### 2) Listings categories navigation
- Go to `/listings` -> click **View All Categories**.
- Should correctly go to `/listings/categories` and display category grid.

### 3) Admin gamification
- Go to `/admin/gamification`
  - Sidebar should remain visible.
  - Overview Top Earners should show real names/emails (no “Unknown”).

### 4) Write a review search
- Go to `/writeareview`
  - Type business name -> confirm **suggestions appear without clicking Search**.

### 5) Streams
- Go to `/streams`
  - “Made For You” play buttons should start playing.
- Create playlist from sidebar “+”
  - Should create playlist (or at least not redirect incorrectly) and award XP/coins.
- Go to `/streams/creator`
  - Apply Now should go to `/streams/verification`.

### 6) Marketplace post
- Go to `/marketplace/post` while logged out
  - Should redirect to sign-in with proper return.

## Known gaps / needs follow-up
### User phone verification / saving
- UI now allows editing phone in the form, but **Clerk typically requires a dedicated verification flow**.
- If you want a real “verify & save phone” UX, we should add a button that routes to Clerk’s phone verification (or a dedicated page using Clerk components) and then refresh the profile.

### Streams upload
- “Upload music” and “Create album” for non-admin users are currently **stubbed** with toasts (so users aren’t pushed into admin routes).
- Next step is to build a real creator upload flow (with storage, moderation, and RLS rules).

## Next build tasks (recommended order)
1. **Gamify event photo posting**
   - Decide reward type:
     - Coins vs XP vs both
   - Decide rule:
     - Only after event end time?
     - Only after admin approval?
2. **Partners page copy**
   - Rename navigation label “Partners” -> “Partner Services” (optional)
3. **Advertise page enhancements**
   - Add small pricing summary block that matches `/pricing` + `/advertise/checkout` (optional)

## Recent commits (for reference)
- `c965a59` — routes + missions + search + auth redirects (batch 1)
- `e22d7d9` — admin gamification sidebar + Unknown names + user settings UX
- `15abc1a` — streams fixes (playlist creation + Made For You + creator portal navigation)

---

## Appendix: Existing older report
There is also an older long-form report:
- `PROJECT_STATUS_REPORT.md` (dated 2024-12-10)
