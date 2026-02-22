# BARA PLATFORM — EMAIL IMPLEMENTATION & VERIFICATION PLAN

> **Purpose:** Ensure all email notifications across the platform are properly implemented, triggered at the right moments, delivered successfully via Resend, and provide a great user experience.
>
> **Referenced by:** `MASTER_PLAN.md`
>
> **Phase 1 Status:** ✅ CRITICAL FIX APPLIED (Feb 22, 2026) — Email queue status update bug fixed in `supabase/functions/send-email/index.ts`. All 7 templates verified. Queue rows now update to `sent`/`failed` with timestamps.

---

## TABLE OF CONTENTS

1. [Current Email Architecture](#1-architecture)
2. [Email Inventory — What Exists](#2-inventory)
3. [Email Trigger Audit](#3-trigger-audit)
4. [Missing Emails — What Should Exist](#4-missing-emails)
5. [Resend Configuration Verification](#5-resend-config)
6. [Email Template Audit](#6-template-audit)
7. [End-to-End Testing Plan](#7-testing)
8. [Monitoring & Reliability](#8-monitoring)
9. [Implementation Checklist](#9-checklist)

---

## 1. CURRENT EMAIL ARCHITECTURE {#1-architecture}

### How Emails Work Today

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  USER ACTION (register for event, sign up, post listing) │
│       │                                                  │
│       ▼                                                  │
│  SUPABASE TRIGGER (PL/pgSQL function)                    │
│       │                                                  │
│       ▼                                                  │
│  EMAIL_QUEUE TABLE (pending row inserted)                │
│       │                                                  │
│       ▼                                                  │
│  SUPABASE WEBHOOK (on INSERT to email_queue)             │
│       │                                                  │
│       ▼                                                  │
│  SUPABASE EDGE FUNCTION: send-email/index.ts             │
│       │                                                  │
│       ├── Detects template type from metadata.type       │
│       ├── Renders React Email template (if applicable)   │
│       ├── Falls back to html_content from queue row      │
│       │                                                  │
│       ▼                                                  │
│  RESEND API (https://api.resend.com/emails)              │
│       │                                                  │
│       ▼                                                  │
│  USER'S INBOX                                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `supabase/functions/send-email/index.ts` | Edge function that receives webhook, renders template, calls Resend |
| `supabase/migrations/20260220_email_queue_system.sql` | Creates `email_queue` table, triggers for events/users/marketplace/banners |
| `supabase/migrations/20260221_fix_email_triggers.sql` | Fixes to email trigger functions |
| `supabase/migrations/20260221_event_creation_email.sql` | Email trigger for event creation |
| `supabase/migrations/20260220_fix_email_queue_rls.sql` | RLS policy fixes for email queue |
| `src/hooks/useWelcomeEmail.ts` | Client-side hook ensuring user profile exists (welcome email via DB trigger) |
| `src/pages/TestEmailPage.tsx` | Test page for sending emails manually |

### Email Templates (React Email)

| Template File | Type Key | Purpose |
|--------------|----------|---------|
| `supabase/functions/_shared/emails/WelcomeEmail.tsx` | `welcome`, `welcome_email` | New user welcome |
| `supabase/functions/_shared/emails/TicketPurchasedEmail.tsx` | `ticket_purchased`, `ticket_free`, `ticket_paid_confirmed`, `ticket_reserved_pending` | Event ticket confirmations |
| `supabase/functions/_shared/emails/ListingCreatedEmail.tsx` | `listing_created`, `marketplace_submission` | Marketplace listing submitted |
| `supabase/functions/_shared/emails/ListingApprovedEmail.tsx` | `listing_approved`, `marketplace_published` | Listing approved by admin |
| `supabase/functions/_shared/emails/ListingRejectedEmail.tsx` | `listing_rejected` | Listing rejected by admin |
| `supabase/functions/_shared/emails/EventSubmittedEmail.tsx` | `event_submitted`, `event_submission` | Event submitted for review |
| `supabase/functions/_shared/emails/BannerRequestEmail.tsx` | `banner_request`, `banner_submission` | Banner ad submission |

**Note:** Duplicate template files exist at `emails/` (root) AND `supabase/functions/_shared/emails/`. Only the Supabase function copies are used at runtime. The root copies may be for local preview only — verify.

---

## 2. EMAIL INVENTORY — WHAT EXISTS {#2-inventory}

### Database Triggers (Automatic Emails)

| # | Trigger | Table | Event | Template Type | Status |
|---|---------|-------|-------|---------------|--------|
| 1 | `tr_event_registration_email` | `event_registrations` | INSERT (free confirmed) | `ticket_free` | Exists |
| 2 | `tr_event_registration_email` | `event_registrations` | INSERT (pending payment) | `ticket_reserved_pending` | Exists |
| 3 | `tr_event_registration_email` | `event_registrations` | UPDATE (payment confirmed) | `ticket_paid_confirmed` | Exists |
| 4 | `tr_welcome_email` | `clerk_users` | INSERT | `welcome_email` | Exists |
| 5 | `tr_marketplace_listing_email` | `marketplace_listings` | INSERT | `marketplace_submission` | Exists |
| 6 | `tr_marketplace_listing_email` | `marketplace_listings` | UPDATE (status → active) | `marketplace_published` | Exists |
| 7 | `tr_banner_submission_email` | `user_slideshow_submissions` | INSERT | `banner_submission` | Exists |
| 8 | `tr_banner_submission_email` | `user_slideshow_submissions` | UPDATE (approved) | `banner_approved` | Exists |

### Client-Side Email Hooks

| # | Hook/Function | What It Does |
|---|--------------|--------------|
| 1 | `useWelcomeEmail` | Ensures `user_profiles` record exists; welcome email handled by DB trigger |

---

## 3. EMAIL TRIGGER AUDIT {#3-trigger-audit}

For each existing email trigger, verify the complete chain works:

### Trigger 1: Free Event Registration → Confirmation Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.1.1 | User registers for free event | `TicketPurchaseModal.tsx` inserts into `event_registrations` with `payment_status='confirmed'`, `payment_method='free'` | ☐ |
| 3.1.2 | Trigger fires | `tr_event_registration_email` catches INSERT | ☐ |
| 3.1.3 | Queue row created | Row in `email_queue` with `metadata.type = 'ticket_free'` | ☐ |
| 3.1.4 | Webhook fires | Supabase webhook calls `send-email` function | ☐ |
| 3.1.5 | Template renders | `TicketPurchasedEmail.tsx` renders correctly | ☐ |
| 3.1.6 | Resend delivers | Email arrives in user's inbox | ☐ |
| 3.1.7 | Content correct | Subject, event name, ticket ID, quantity all correct | ☐ |

### Trigger 2: Paid Event Registration → Pending Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.2.1 | User registers for paid event | Insert with `payment_status='pending'` | ☐ |
| 3.2.2 | Trigger fires for pending | ☐ |
| 3.2.3 | Queue row with `ticket_reserved_pending` | ☐ |
| 3.2.4 | Email delivered with "spot reserved" message | ☐ |

### Trigger 3: Payment Confirmed → Confirmation Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.3.1 | Admin confirms payment (UPDATE `payment_status` → 'confirmed') | ☐ |
| 3.3.2 | Trigger catches UPDATE where old != confirmed, new = confirmed | ☐ |
| 3.3.3 | Queue row with `ticket_paid_confirmed` | ☐ |
| 3.3.4 | Email delivered with "payment confirmed" message | ☐ |

### Trigger 4: New User Sign-Up → Welcome Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.4.1 | New user signs up via Clerk | ☐ |
| 3.4.2 | `clerk_users` row inserted (via `clerkSupabaseBridge`) | ☐ |
| 3.4.3 | `tr_welcome_email` fires | ☐ |
| 3.4.4 | Queue row with `welcome_email` type | ☐ |
| 3.4.5 | Welcome email delivered | ☐ |
| 3.4.6 | Email includes user's name and correct branding | ☐ |

### Trigger 5: Marketplace Listing Created → Submission Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.5.1 | User creates listing in `PostListing.tsx` | ☐ |
| 3.5.2 | `marketplace_listings` INSERT trigger fires | ☐ |
| 3.5.3 | Queue row with `marketplace_submission` | ☐ |
| 3.5.4 | Email delivered: "listing received, under review" | ☐ |
| 3.5.5 | Seller name and listing title correct in email | ☐ |

### Trigger 6: Marketplace Listing Approved → Published Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.6.1 | Admin changes listing status to 'active' | ☐ |
| 3.6.2 | UPDATE trigger fires (old status != active, new = active) | ☐ |
| 3.6.3 | Queue row with `marketplace_published` | ☐ |
| 3.6.4 | Email delivered: "listing published" | ☐ |

### Trigger 7: Banner Submitted → Submission Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.7.1 | User submits banner via `UserBannerSubmission.tsx` | ☐ |
| 3.7.2 | `user_slideshow_submissions` INSERT trigger fires | ☐ |
| 3.7.3 | Queue row with `banner_submission` | ☐ |
| 3.7.4 | Email delivered to user | ☐ |

### Trigger 8: Banner Approved → Approval Email

| # | Step | What to Verify | Status |
|---|------|---------------|--------|
| 3.8.1 | Admin approves banner submission | ☐ |
| 3.8.2 | UPDATE trigger fires (old != approved, new = approved) | ☐ |
| 3.8.3 | Queue row with `banner_approved` | ☐ |
| 3.8.4 | Email delivered: "banner approved" | ☐ |

---

## 4. MISSING EMAILS — WHAT SHOULD EXIST {#4-missing-emails}

These are emails that **should** be sent but currently have **no trigger or template**:

### High Priority (Must Have)

| # | Email | Trigger Point | Template Needed | Why |
|---|-------|--------------|-----------------|-----|
| 4.1 | **Event Created — Admin Notification** | Event submitted by user | `event_created_admin` | Admin needs to know there's a new event to review |
| 4.2 | **Event Approved — Organizer Notification** | Admin approves event | `event_approved` | Organizer needs to know event is live |
| 4.3 | **Event Rejected — Organizer Notification** | Admin rejects event | `event_rejected` | Organizer needs to know why |
| 4.4 | **Listing Rejected — Seller Notification** | Admin rejects listing | `listing_rejected` (template exists, trigger may not) | Seller needs feedback |
| 4.5 | **Contact Form — Admin Notification** | User submits contact form | `contact_form_admin` | Admin needs to see inquiries |
| 4.6 | **Contact Form — User Confirmation** | User submits contact form | `contact_form_confirmation` | User wants to know their message was received |
| 4.7 | **Business Claim — Admin Notification** | User claims a business | `business_claim_admin` | Admin needs to review claim |
| 4.8 | **Business Claim — User Confirmation** | User submits claim | `business_claim_confirmation` | User confirmation |
| 4.9 | **Password Reset / Account Security** | Via Clerk (handled by Clerk) | N/A — Clerk handles this | Verify Clerk sends these |

### Medium Priority (Should Have)

| # | Email | Trigger Point | Template Needed | Why |
|---|-------|--------------|-----------------|-----|
| 4.10 | **Event Reminder (24h before)** | Scheduled/cron job | `event_reminder` | Reduces no-shows by 30-40% |
| 4.11 | **Weekly Digest** | Scheduled (Monday) | `weekly_digest` | Re-engagement for inactive users |
| 4.12 | **Achievement Unlocked** | Gamification achievement awarded | `achievement_unlocked` | Celebration + brings user back |
| 4.13 | **Streak About to Break** | Daily cron, user hasn't logged in | `streak_warning` | Retention — loss aversion |
| 4.14 | **New Message** | New message in inbox | `new_message` | Drive messaging engagement |
| 4.15 | **Listing Expired** | Listing past expiry date | `listing_expired` | Prompt re-listing |

### Low Priority (Nice to Have)

| # | Email | Trigger Point | Template Needed | Why |
|---|-------|--------------|-----------------|-----|
| 4.16 | **Monthly Analytics Report** | Monthly cron | `monthly_report` | Show users their impact |
| 4.17 | **Referral Reward** | Referred user signs up | `referral_reward` | Viral growth loop |
| 4.18 | **Subscription Renewal Reminder** | 3 days before renewal | `subscription_reminder` | Reduce churn |
| 4.19 | **Coin Purchase Confirmation** | Coin purchase completed | `coin_purchase` | Transaction receipt |
| 4.20 | **Welcome Back** | User returns after 14+ days inactive | `welcome_back` | Win-back campaign |

---

## 5. RESEND CONFIGURATION VERIFICATION {#5-resend-config}

### Environment Variables

| Variable | Where | What to Check | Status |
|----------|-------|--------------|--------|
| `RESEND_API_KEY` | Supabase Edge Function secrets | Key exists and is valid | ☐ |
| `RESEND_FROM_EMAIL` | Supabase Edge Function secrets (optional) | Fallback: `Bara Afrika <onboarding@resend.dev>` | ☐ |

### Domain Verification

| # | Check | Status |
|---|-------|--------|
| 5.1 | Resend account active and not rate-limited | ☐ |
| 5.2 | Custom domain (`baraafrika.com`) verified in Resend | ☐ |
| 5.3 | DNS records (SPF, DKIM, DMARC) configured for `baraafrika.com` | ☐ |
| 5.4 | If using `onboarding@resend.dev` — this is Resend's sandbox, only sends to verified emails | ☐ |
| 5.5 | Production "from" address configured (e.g., `noreply@baraafrika.com`) | ☐ |

### Webhook Configuration

| # | Check | Status |
|---|-------|--------|
| 5.6 | Supabase Database Webhook exists for `email_queue` table on INSERT | ☐ |
| 5.7 | Webhook URL points to `send-email` edge function | ☐ |
| 5.8 | Webhook sends correct payload format (includes `record` with `metadata`) | ☐ |
| 5.9 | Webhook has proper authorization headers | ☐ |

### Edge Function Deployment

| # | Check | Status |
|---|-------|--------|
| 5.10 | `send-email` function deployed to Supabase | ☐ |
| 5.11 | Function has access to `RESEND_API_KEY` secret | ☐ |
| 5.12 | Function logs visible in Supabase dashboard | ☐ |
| 5.13 | CORS headers allow webhook calls | ☐ |

---

## 6. EMAIL TEMPLATE AUDIT {#6-template-audit}

For each React Email template, verify:

| # | Template | Renders | Branded | Correct Data | Mobile-Friendly | Status |
|---|---------|---------|---------|-------------|----------------|--------|
| 6.1 | `WelcomeEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6.2 | `TicketPurchasedEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6.3 | `ListingCreatedEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6.4 | `ListingApprovedEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6.5 | `ListingRejectedEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6.6 | `EventSubmittedEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6.7 | `BannerRequestEmail.tsx` | ☐ | ☐ | ☐ | ☐ | ☐ |

### Template Quality Checks

| # | Check | Status |
|---|-------|--------|
| 6.8 | All templates have consistent branding (logo, colors, footer) | ☐ |
| 6.9 | All templates include unsubscribe link or footer | ☐ |
| 6.10 | All templates handle missing/null data gracefully (no "undefined" in output) | ☐ |
| 6.11 | All templates pass Litmus/Email on Acid rendering test (or at minimum, Gmail + Outlook) | ☐ |
| 6.12 | Fallback HTML content in queue rows is readable (for cases where template rendering fails) | ☐ |

---

## 7. END-TO-END TESTING PLAN {#7-testing}

### Using the Test Email Page

The `/test-email` page (`src/pages/TestEmailPage.tsx`) can be used to manually trigger emails.

| # | Test | How | Expected Result | Status |
|---|------|-----|----------------|--------|
| 7.1 | Send welcome email | Use test page with type `welcome` | Email arrives with welcome content | ☐ |
| 7.2 | Send ticket email (free) | Use test page with type `ticket_free` | Email arrives with ticket details | ☐ |
| 7.3 | Send listing created | Use test page with type `listing_created` | Email arrives | ☐ |
| 7.4 | Send listing approved | Use test page with type `listing_approved` | Email arrives | ☐ |
| 7.5 | Send event submitted | Use test page with type `event_submitted` | Email arrives | ☐ |
| 7.6 | Send banner request | Use test page with type `banner_request` | Email arrives | ☐ |

### Real User Flow Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 7.7 | New user registration | Sign up with new email | Welcome email received within 60 seconds | ☐ |
| 7.8 | Free event registration | Register for a free event | Confirmation email received | ☐ |
| 7.9 | Paid event registration | Register for paid event | "Spot reserved" email received | ☐ |
| 7.10 | Payment confirmation | Admin confirms payment in `OrganizerRegistrationsPage` | "Payment confirmed" email to user | ☐ |
| 7.11 | Post marketplace listing | Submit a new listing | "Listing received" email | ☐ |
| 7.12 | Admin approves listing | Change listing status to 'active' in admin | "Listing published" email to seller | ☐ |
| 7.13 | Submit banner | Submit banner via dashboard | "Banner received" email | ☐ |
| 7.14 | Admin approves banner | Approve banner in admin panel | "Banner approved" email | ☐ |

### Error Handling Tests

| # | Test | Expected | Status |
|---|------|----------|--------|
| 7.15 | Invalid email address in queue | Function returns 400, doesn't crash | ☐ |
| 7.16 | Missing template type | Function falls back to `html_content` | ☐ |
| 7.17 | Missing Resend API key | Function returns 500 with clear error | ☐ |
| 7.18 | Resend rate limit hit | Email stays in queue, can be retried | ☐ |
| 7.19 | Template data missing fields | Email renders without "undefined" | ☐ |

---

## 8. MONITORING & RELIABILITY {#8-monitoring}

### Email Queue Health

| # | Check | How | Status |
|---|-------|-----|--------|
| 8.1 | Monitor `email_queue` for stuck "pending" rows (>5 min old) | SQL query or admin dashboard | ☐ |
| 8.2 | Add `status` update after successful send (currently missing?) | Update edge function to mark rows `sent` | ☐ |
| 8.3 | Add `error_message` update on failure | Update edge function to mark `failed` + store error | ☐ |
| 8.4 | Implement retry logic for failed emails | Max 3 retries with exponential backoff | ☐ |
| 8.5 | Admin view of email queue (sent, pending, failed counts) | Add to admin dashboard | ☐ |

### Current Gap: Queue Status Not Updated

The `send-email` edge function currently **does not update** the `email_queue` row after sending. This means:
- All rows stay as `pending` forever
- No way to know if email was sent or failed
- No retry mechanism

**Fix Required:** After successful Resend API call, UPDATE the queue row:
```sql
UPDATE email_queue SET status = 'sent', sent_at = now() WHERE id = <row_id>;
```

On failure:
```sql
UPDATE email_queue SET status = 'failed', error_message = <error>, retry_count = retry_count + 1 WHERE id = <row_id>;
```

---

## 9. IMPLEMENTATION CHECKLIST {#9-checklist}

### Phase 1: Verify Existing Emails Work (Week 1)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.1 | Verify Resend API key is set in Supabase secrets | P0 | ☐ |
| 9.2 | Verify `send-email` edge function is deployed | P0 | ☐ |
| 9.3 | Verify database webhook exists for `email_queue` INSERT | P0 | ☐ |
| 9.4 | Test welcome email with new sign-up | P0 | ☐ |
| 9.5 | Test event registration email (free + paid) | P0 | ☐ |
| 9.6 | Test marketplace submission + approval emails | P0 | ☐ |
| 9.7 | Test banner submission + approval emails | P1 | ☐ |
| 9.8 | Fix: Update queue row status after send (sent/failed) | P0 | ☐ |
| 9.9 | Verify Resend from address (sandbox vs production domain) | P0 | ☐ |

### Phase 2: Add Missing Critical Emails (Week 2)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.10 | Create `event_approved` trigger + template | P0 | ☐ |
| 9.11 | Create `event_rejected` trigger + template | P0 | ☐ |
| 9.12 | Create admin notification for new events | P1 | ☐ |
| 9.13 | Create `listing_rejected` trigger (template exists) | P1 | ☐ |
| 9.14 | Create contact form confirmation email | P1 | ☐ |
| 9.15 | Create admin notification for contact form submissions | P1 | ☐ |
| 9.16 | Create business claim email triggers | P1 | ☐ |

### Phase 3: Engagement Emails (Week 3-4)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.17 | Create event reminder email (24h before) | P1 | ☐ |
| 9.18 | Set up Supabase cron job for event reminders | P1 | ☐ |
| 9.19 | Create achievement unlocked email | P2 | ☐ |
| 9.20 | Create streak warning email | P2 | ☐ |
| 9.21 | Create new message notification email | P2 | ☐ |

### Phase 4: Template Polish & Monitoring (Week 4)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.22 | Standardize all template branding (logo, colors, footer) | P1 | ☐ |
| 9.23 | Add unsubscribe link to all templates | P1 | ☐ |
| 9.24 | Test all templates on Gmail, Outlook, Apple Mail | P2 | ☐ |
| 9.25 | Add email queue monitoring to admin dashboard | P2 | ☐ |
| 9.26 | Implement retry logic for failed emails | P2 | ☐ |
| 9.27 | Set up Resend production domain (if still on sandbox) | P0 | ☐ |
| 9.28 | Remove `/test-email` route from production build | P3 | ☐ |

---

## APPENDIX: Email Queue Schema

```sql
CREATE TABLE public.email_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email text NOT NULL,
    subject text NOT NULL,
    html_content text NOT NULL,
    status email_status DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed'
    retry_count int DEFAULT 0,
    error_message text,
    created_at timestamptz DEFAULT now(),
    sent_at timestamptz,
    metadata jsonb  -- { type: 'template_name', data: { ... }, event_id: '...', user_id: '...' }
);
```

---

*Document created: Feb 22, 2026*
*For Bara Afrika Platform*
