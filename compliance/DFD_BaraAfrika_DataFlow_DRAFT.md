# Data Flow Diagram (DFD) — Bara Afrika (Draft specification)

**Date:** [DATE]

This document describes the data flows you should draw into a 1-page diagram (then export to PDF as `DFD_BaraAfrika_DataFlow.pdf`).

## Entities (boxes)
1. **User (Rwanda / Global)**
2. **Bara Afrika Web App (Browser)**
3. **Bara Afrika Frontend Hosting**: [HOSTING PROVIDER IF ANY]
4. **Clerk (Auth)** — Germany (primary), Ireland (backup)
5. **Supabase (DB + Storage)** — Switzerland (Zurich, `eu-central-2`)
6. **Supabase Edge Function: send-email**
7. **Resend Email API** — [RESEND LOCATION]
8. **Admin User** (privileged)

## Data flows (arrows)
### A) Authentication
- User → Web App: sign-in/up requests
- Web App ↔ Clerk: authentication, session tokens, user profile fields (name/email/phone)

### B) Core platform usage (storage)
- Web App ↔ Supabase DB: create/read/update platform records
  - user profiles, reviews, listings, events, streams preferences
- Web App ↔ Supabase Storage: upload images (listings/event photos)

### C) Email delivery
- Supabase triggers → Edge Function (`send-email`)
- Edge Function → Resend API: sends transactional/service emails

### D) Admin operations
- Admin User → Admin UI (part of Web App)
- Admin UI ↔ Supabase DB: admin management actions
- Admin UI ↔ Supabase DB: content approval/rejection flows

## Controls to annotate on the diagram
- All external traffic uses **TLS/HTTPS**
- Access control:
  - Clerk sessions
  - Supabase RLS (where configured)
  - Admin access controlled by `admin_users` table
- Logging:
  - admin management actions logged to `admin_activity_log`

## Notes
- The purpose of this DFD is to satisfy the DPO “Data Flow Diagram (DFD)” attachment requirement.
- Keep it simple and readable (1 page).
