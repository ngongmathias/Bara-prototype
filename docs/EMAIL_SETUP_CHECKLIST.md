# Email Setup Checklist — Bara Afrika

## Current Status
- Resend is the email provider (via Supabase Edge Function)
- 10 email templates exist in `supabase/functions/_shared/emails/`
- Edge function `send-email` handles all sending via Resend API
- `email_queue` table provides reliable delivery with retry support

## What Needs to Be Done

### 1. Resend Account Setup
- [ ] Create account at [resend.com](https://resend.com) (if not already done)
- [ ] Get API key and set as Supabase secret: `RESEND_API_KEY`
- [ ] Set `RESEND_FROM_EMAIL` secret to `Bara Afrika <noreply@baraafrika.com>`

### 2. Domain Verification (DNS)
Add these DNS records for `baraafrika.com`:

- [ ] **SPF** — TXT record: `v=spf1 include:resend.com ~all`
- [ ] **DKIM** — CNAME record provided by Resend after domain verification
- [ ] **DMARC** — TXT record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@baraafrika.com`
- [ ] Verify domain in Resend dashboard

### 3. Email Addresses Needed
| Address | Purpose | Setup |
|---------|---------|-------|
| `noreply@baraafrika.com` | Transactional emails (welcome, tickets, notifications) | Resend sender |
| `support@baraafrika.com` | Customer support replies | Email hosting (Google Workspace, Zoho, etc.) |
| `info@baraafrika.com` | General inquiries | Email hosting |
| `admin@baraafrika.com` | Admin notifications | Email hosting |

### 4. Clerk Email Configuration
- [ ] In Clerk Dashboard → Email templates, set sender to `noreply@baraafrika.com`
- [ ] Customize templates: verification, password reset, magic link
- [ ] Add Clerk's SPF/DKIM records if using custom sender domain

### 5. Supabase Edge Function Deployment
```bash
supabase functions deploy send-email --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set RESEND_FROM_EMAIL="Bara Afrika <noreply@baraafrika.com>"
```

### 6. Database Webhook (auto-send on queue insert)
- [ ] In Supabase Dashboard → Database → Webhooks
- [ ] Create webhook on `email_queue` INSERT → calls `send-email` edge function
- [ ] This enables fire-and-forget email sending from any part of the app

## Email Templates Available
1. **WelcomeEmail** — New user signup
2. **TicketPurchasedEmail** — Event ticket confirmation
3. **ListingCreatedEmail** — Marketplace listing submitted
4. **ListingApprovedEmail** — Listing approved by admin
5. **ListingRejectedEmail** — Listing rejected by admin
6. **EventSubmittedEmail** — Event submitted for review
7. **EventApprovedEmail** — Event approved
8. **EventRejectedEmail** — Event rejected
9. **BannerRequestEmail** — Banner ad request
10. **ContactFormConfirmationEmail** — Contact form auto-reply

## Testing
After setup, test by:
1. Creating a new account → welcome email should arrive
2. Submitting a contact form → confirmation email
3. Purchasing a ticket → ticket confirmation email
4. Check Resend dashboard for delivery logs
