-- ============================================
-- Registration profile fields (custom sign-up form)
-- Stores the extra fields collected at registration on the existing clerk_users
-- profile row: name, username, DOB, gender, country, phone. Auth itself stays in
-- Clerk; these are the Supabase-side profile (queryable for dashboard/compliance).
-- Run this in your Supabase SQL Editor. Idempotent.
-- ============================================

ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS first_name    TEXT;
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS last_name     TEXT;
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS username      TEXT;
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS gender        TEXT;
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS country       TEXT;
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS phone         TEXT;

-- Case-insensitive uniqueness for usernames that are set (NULLs allowed).
CREATE UNIQUE INDEX IF NOT EXISTS uq_clerk_users_username_lower
    ON public.clerk_users (lower(username))
    WHERE username IS NOT NULL;

-- The sign-up form writes the profile with the tokenless anon client, so anon
-- must be able to read (username availability check) and write these rows.
ALTER TABLE public.clerk_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clerk_users readable" ON public.clerk_users;
CREATE POLICY "clerk_users readable" ON public.clerk_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "clerk_users insertable" ON public.clerk_users;
CREATE POLICY "clerk_users insertable" ON public.clerk_users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "clerk_users updatable" ON public.clerk_users;
CREATE POLICY "clerk_users updatable" ON public.clerk_users
    FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON public.clerk_users TO anon;
GRANT SELECT, INSERT, UPDATE ON public.clerk_users TO authenticated;
GRANT ALL ON public.clerk_users TO service_role;
