-- Registration funnel telemetry.
-- Users report registration failures we cannot reproduce or diagnose; nothing
-- records where sign-ups fail. The sign-up page now logs each step and error
-- here (see src/lib/registrationTelemetry.ts).
--
-- Access model: write-only from the client. INSERT is granted to anon (the
-- user has no session yet during registration); there is deliberately NO
-- SELECT policy, so events are readable only from the SQL editor / service
-- role. Useful queries:
--   select event, count(*) from registration_events
--     where created_at > now() - interval '7 days' group by 1 order by 2 desc;
--   select * from registration_events where email = '<reporter''s email>'
--     order by created_at;

CREATE TABLE IF NOT EXISTS public.registration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,          -- random per page load; groups one user's attempts
  event TEXT NOT NULL,      -- e.g. create_error / code_sent / verified / profile_save_error
  email TEXT,
  error_code TEXT,          -- Clerk error code when applicable
  error_message TEXT,
  detail JSONB,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_registration_events_created
  ON public.registration_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_events_email
  ON public.registration_events (email);

ALTER TABLE public.registration_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS registration_events_insert ON public.registration_events;
CREATE POLICY registration_events_insert ON public.registration_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

GRANT INSERT ON public.registration_events TO anon, authenticated;
