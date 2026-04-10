-- Phase 11.7.1 — Partner verification review workflow
-- Enables the admin verification console: partners request a verification
-- tier upgrade (email → phone → id → business); admins review and approve/reject.
-- Existing column `verification_tier` on marketplace_partners is the *current* state.
-- New columns below track the *pending* request and the review audit trail.

alter table public.marketplace_partners
  add column if not exists verification_doc_url text,
  add column if not exists verification_requested_tier text,
  add column if not exists verification_requested_at timestamptz,
  add column if not exists verification_reviewed_by text,
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists verification_notes text;

-- Constrain requested tier to known values. Safe to re-run.
alter table public.marketplace_partners
  drop constraint if exists marketplace_partners_verification_requested_tier_check;

alter table public.marketplace_partners
  add constraint marketplace_partners_verification_requested_tier_check
  check (
    verification_requested_tier is null
    or verification_requested_tier in ('email','phone','id','business')
  );

-- Admin console query: "show me all pending verification requests"
create index if not exists idx_marketplace_partners_pending_verification
  on public.marketplace_partners (verification_requested_at)
  where verification_requested_tier is not null
    and verification_reviewed_at is null;

comment on column public.marketplace_partners.verification_doc_url is
  'URL to uploaded verification document (ID card / business license / utility bill)';
comment on column public.marketplace_partners.verification_requested_tier is
  'Tier the partner is requesting to upgrade to: email|phone|id|business. NULL = no pending request.';
comment on column public.marketplace_partners.verification_requested_at is
  'Timestamp when the partner submitted the verification request';
comment on column public.marketplace_partners.verification_reviewed_by is
  'Clerk user ID of the admin who approved or rejected the request';
comment on column public.marketplace_partners.verification_reviewed_at is
  'Timestamp when the admin reviewed the request (approve or reject)';
comment on column public.marketplace_partners.verification_notes is
  'Admin-visible notes on why the request was approved or rejected';
