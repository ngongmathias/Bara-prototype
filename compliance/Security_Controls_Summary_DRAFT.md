# Security Controls Summary — Bara Afrika (Draft)

**Date:** [DATE]

## 1. Overview
This document summarizes technical and organizational measures implemented by Bara Afrika to protect personal data.

## 2. Identity and access management
- Authentication handled by **Clerk** (EU-based infrastructure).
- Admin access is restricted to users listed in `admin_users`.
- Role-based permissions (super_admin/admin/moderator).

## 3. Data storage and processing
- Primary data storage and processing through **Supabase** (DB + Storage) in **Zurich (`eu-central-2`)**.
- Transactional email delivery via **Resend**.

## 4. Access controls
- Principle of least privilege for administrative access.
- Supabase Row Level Security (RLS) used where applicable.
- Service role access restricted to backend/server contexts.

## 5. Encryption
- TLS/HTTPS for data in transit.
- Provider encryption at rest and encrypted backups (see Supabase DPA).

## 6. Logging and monitoring
- Admin management actions are logged in `admin_activity_log`.
- Supabase provides project logs and audit capabilities for operational events.

## 7. Backups and disaster recovery
- Supabase managed backups (see Supabase service configuration/DPA).
- Recovery procedures rely on provider backup and restore operations.

## 8. Incident response
- Breach response process documented in `compliance/BREACH_RESPONSE_PLAYBOOK_DRAFT.md`.
- Vendor incident notification and assistance is addressed via DPAs (see Supabase DPA).

## 9. Vendor and contractual safeguards
- Vendor DPAs/terms maintained for Supabase, Clerk, and Resend.
- Cross-border transfer safeguards documented in submission pack and SCC attachments.

## 10. Ongoing governance
- Regular review of admin access.
- Update privacy documentation when features/vendors change.

---

**Owner:** [DPO / RESPONSIBLE PERSON]
