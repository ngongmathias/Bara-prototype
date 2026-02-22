-- Migration: Fix email_queue schema + grant remaining table permissions
-- Fixes:
--   1. email_queue missing 'type' column (engagement email functions need it)
--   2. user_ad_free, sports_predictions, user_profile_themes missing GRANT
--   3. email_queue status column: convert ENUM → TEXT for flexibility

-- ============================================================
-- STEP 1: Add 'type' column to email_queue (used by engagement email functions)
-- ============================================================
ALTER TABLE public.email_queue
  ADD COLUMN IF NOT EXISTS type TEXT;

-- ============================================================
-- STEP 2: Convert status from ENUM to TEXT for flexibility
-- The ENUM only allows 'pending','sent','failed' but we may need more states.
-- If already TEXT, this is a no-op.
-- ============================================================
DO $$
BEGIN
  -- Check if the column is currently an enum type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'email_queue'
      AND column_name = 'status'
      AND udt_name = 'email_status'
  ) THEN
    ALTER TABLE public.email_queue
      ALTER COLUMN status TYPE TEXT USING status::TEXT;
    ALTER TABLE public.email_queue
      ALTER COLUMN status SET DEFAULT 'pending';
  END IF;
END $$;

-- ============================================================
-- STEP 3: GRANT permissions on Phase 6 tables (user_ad_free, etc.)
-- These were created by 20260222_phase6_features.sql but never granted.
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON public.sports_predictions TO anon, authenticated;
GRANT SELECT, INSERT ON public.user_ad_free TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profile_themes TO anon, authenticated;

-- ============================================================
-- STEP 4: GRANT on other tables that may be missing permissions
-- ============================================================

-- Events and registrations (frontend reads these)
GRANT SELECT, INSERT, UPDATE ON public.events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.event_registrations TO anon, authenticated;

-- Marketplace
GRANT SELECT, INSERT, UPDATE ON public.marketplace_listings TO anon, authenticated;

-- User logs
GRANT SELECT, INSERT ON public.user_logs TO anon, authenticated;

-- Admin users (read-only for auth checks)
GRANT SELECT, UPDATE ON public.admin_users TO anon, authenticated;

-- User slideshow submissions
GRANT SELECT, INSERT, UPDATE ON public.user_slideshow_submissions TO anon, authenticated;

-- Countries and cities (read-only reference data)
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT SELECT ON public.cities TO anon, authenticated;

-- Achievements master table (insert for admin seeding)
GRANT SELECT, INSERT ON public.achievements TO anon, authenticated;
