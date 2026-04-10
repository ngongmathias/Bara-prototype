-- Phase 11.7.1 — Lead types + inbox state for category-specific CTAs
-- Enables: Request Viewing (property), Book Test Drive (motors),
--          Apply Now (jobs), Book Appointment (services), Buy/Make Offer (goods)
-- All CTAs write to marketplace_leads; lead_type discriminates them.
-- CTA-specific payload (viewing_date, cv_url, etc.) goes in the EXISTING
-- "metadata" jsonb column — we do NOT add a second jsonb column.
-- seen_at / responded_at power the seller partner dashboard inbox.

alter table public.marketplace_leads
  add column if not exists lead_type text not null default 'contact',
  add column if not exists seen_at timestamptz,
  add column if not exists responded_at timestamptz;

-- Constrain lead_type to known values. Safe to re-run — drops and re-adds.
alter table public.marketplace_leads
  drop constraint if exists marketplace_leads_lead_type_check;

alter table public.marketplace_leads
  add constraint marketplace_leads_lead_type_check
  check (lead_type in (
    'contact',      -- generic "contact seller"
    'viewing',      -- property: request a viewing
    'test_drive',   -- motors: book a test drive
    'application',  -- jobs: apply now
    'booking',      -- services: book appointment
    'offer',        -- make an offer (goods)
    'other'
  ));

-- Speed up seller inbox queries and "unread" badges.
create index if not exists idx_marketplace_leads_seller_unseen
  on public.marketplace_leads (seller_user_id, seen_at)
  where seen_at is null;

create index if not exists idx_marketplace_leads_lead_type
  on public.marketplace_leads (lead_type);

comment on column public.marketplace_leads.lead_type is
  'Category-specific CTA type: contact|viewing|test_drive|application|booking|offer|other';
comment on column public.marketplace_leads.metadata is
  'CTA-specific payload — e.g. {"viewing_date":"2026-05-01","viewing_time":"14:00","cv_url":"https://..."}';
comment on column public.marketplace_leads.seen_at is
  'Timestamp when seller first opened the lead in their dashboard inbox';
comment on column public.marketplace_leads.responded_at is
  'Timestamp when seller marked the lead as responded';
