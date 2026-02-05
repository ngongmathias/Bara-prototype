CREATE TABLE IF NOT EXISTS public.clerk_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text,
  email text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_sign_in_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS clerk_users_email_key ON public.clerk_users (email);
CREATE UNIQUE INDEX IF NOT EXISTS clerk_users_clerk_user_id_key ON public.clerk_users (clerk_user_id);

ALTER TABLE public.clerk_users ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.clerk_users TO anon, authenticated, service_role;

-- Allow client-side upsert (Clerk runs in the browser using the anon key)
DROP POLICY IF EXISTS "Allow anon upsert to clerk_users" ON public.clerk_users;
CREATE POLICY "Allow anon upsert to clerk_users"
  ON public.clerk_users
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update to clerk_users" ON public.clerk_users;
CREATE POLICY "Allow anon update to clerk_users"
  ON public.clerk_users
  FOR UPDATE
  TO anon
  USING (true);

-- Allow service role (admin) to read all rows
DROP POLICY IF EXISTS "Service role can read clerk_users" ON public.clerk_users;
CREATE POLICY "Service role can read clerk_users"
  ON public.clerk_users
  FOR SELECT
  TO service_role
  USING (true);
