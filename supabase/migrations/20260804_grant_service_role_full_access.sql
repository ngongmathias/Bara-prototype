-- Several tables (marketplace_listings, gamification-adjacent tables,
-- marketplace_partners, blog_*, admin_*, etc. — 42 in total) were created
-- without the standard Supabase default privileges, so the service_role key
-- got "permission denied for table" on plain SELECTs. service_role is the
-- backend-only key (protected by the secret key, never shipped to clients)
-- and is meant to have full access by default — RLS + anon/authenticated
-- grants are what actually protect data from browsers, not this.
--
-- Applied directly via the Supabase Management API on 2026-08-04 (NOT via
-- `supabase db push` — the remote migration history table is empty/out of
-- sync with local files, so a push would attempt to replay the entire
-- ~150-file migration history, including one-off seed/cleanup scripts,
-- against live production data). This file exists for the record only.

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
