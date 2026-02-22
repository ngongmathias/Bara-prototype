# Stripe-Dependent Features — Bara Afrika

This document lists all features that will require **Stripe** (or an equivalent payment processor) once the platform moves past the launch/free-access period.

---

## Current Status

> **Launch Period — All Features Free**
>
> During the early-access launch, every paid feature is unlocked for all users at no cost. Stripe integration has **not** been implemented yet. The UI shows friendly banners explaining this on every page that will eventually require payment.

---

## Features That Will Require Stripe

### 1. Subscription Plans (Pricing Page)

| Plan | Price | Key Features |
|------|-------|-------------|
| **Free** | $0 | Basic listing, reviews, 1 event/month, 3 marketplace posts |
| **Bara Pro** | $5/mo ($50/yr) | Unlimited listings/events, analytics, 100 bonus coins/month, Pro badge |
| **Bara Elite** | $20/mo ($200/yr) | Featured placement, verified badge, 500 bonus coins/month, API access |

- **Page**: `/pricing`
- **Current behavior**: Clicking any plan shows a toast saying features are free during launch.
- **Stripe needed for**: Recurring subscription billing, plan upgrades/downgrades, cancellation.

### 2. Bara Prime / Advertise Checkout

| Tier | Price | Purpose |
|------|-------|---------|
| **Bara Pro (Advertiser)** | $19/mo | CPC advertising, marketing dashboard |
| **Bara Elite (Advertiser)** | $79/mo | Zero ad commission, featured homepage spot |

- **Page**: `/advertise/checkout`
- **Current behavior**: Simulates a successful onboarding and redirects to dashboard.
- **Stripe needed for**: One-time or recurring payment for ad tiers, auction bid billing.

### 3. Coin Store — Paid Packs

| Pack | Coins | Bonus | Price |
|------|-------|-------|-------|
| Starter | 100 | 0 | $1.99 |
| Popular | 300 | 50 | $4.99 |
| Power | 700 | 150 | $9.99 |
| Elite | 2,000 | 500 | $24.99 |

- **Page**: `/store`
- **Current behavior**: Coins are granted for **free** (no payment). Button says "Claim X Coins".
- **Stripe needed for**: One-time purchase of coin packs, receipt generation.

### 4. Artist Verification Subscription

- **Page**: `/streams/artist-verification`
- **Current behavior**: Informational page with FAQ referencing Stripe/Paystack.
- **Stripe needed for**: Monthly subscription for verified artist badge.

### 5. Business Premium

- **Page**: `/business-premium`
- **Current behavior**: Feature showcase page.
- **Stripe needed for**: Business premium subscription billing.

### 6. Event Ticket Purchases

- **Flow**: Users buy tickets for events listed on the platform.
- **Current behavior**: Ticket "purchase" records are saved to DB; no real payment.
- **Stripe needed for**: Secure ticket payment, refunds, seller payouts.

---

## Implementation Plan

When ready to integrate Stripe:

1. **Install dependencies**: `@stripe/stripe-js`, `@stripe/react-stripe-js`
2. **Create Stripe account** and obtain publishable + secret keys.
3. **Environment variables**:
   - `VITE_STRIPE_PUBLISHABLE_KEY` — frontend
   - `STRIPE_SECRET_KEY` — Supabase Edge Function
   - `STRIPE_WEBHOOK_SECRET` — for webhook verification
4. **Supabase Edge Functions** needed:
   - `create-checkout-session` — initiates Stripe Checkout
   - `stripe-webhook` — handles payment confirmations, subscription events
   - `create-portal-session` — customer self-service portal
5. **Database tables** to add:
   - `subscriptions` — track active subscriptions per user
   - `payments` — payment history / receipts
   - `stripe_customers` — map Clerk user IDs to Stripe customer IDs
6. **Webhook events** to handle:
   - `checkout.session.completed`
   - `customer.subscription.created / updated / deleted`
   - `invoice.payment_succeeded / failed`
7. **UI updates**:
   - Replace "Claim" buttons with Stripe Checkout redirects
   - Add subscription management in user dashboard
   - Show active plan badge in profile

---

## Pages with "Launch Period" Banners

These pages currently show a friendly banner explaining the free access period:

- `/pricing` — Green banner: "Launch Period — All Features Free!"
- `/advertise/checkout` — Blue banner: "Early Access — Free Setup!"
- `/store` — Coin packs show "FREE" price with "Claim" buttons

---

## Contact

For questions about Stripe integration timeline, contact the development team.
