import { supabase } from '@/lib/supabase';

// Fire-and-forget funnel telemetry for the registration flow. "Some users
// can't register" reports are undiagnosable without a record of where
// sign-ups fail, so every step/error lands in `registration_events`
// (write-only from the client; read it in the Supabase SQL editor).
// Inserts must never block or break sign-up: all failures — including the
// table not existing yet because the migration hasn't been run — are
// swallowed.
const sessionId = Math.random().toString(36).slice(2, 10);

type TelemetryFields = {
  email?: string;
  errorCode?: string;
  errorMessage?: string;
  detail?: Record<string, unknown>;
};

export const RegTelemetry = {
  log(event: string, fields: TelemetryFields = {}): void {
    try {
      void supabase
        .from('registration_events')
        .insert({
          session_id: sessionId,
          event,
          email: fields.email?.trim().toLowerCase() || null,
          error_code: fields.errorCode || null,
          error_message: fields.errorMessage?.slice(0, 500) || null,
          detail: fields.detail || null,
          user_agent:
            typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
        })
        .then(() => undefined, () => undefined);
    } catch {
      /* telemetry must never affect registration */
    }
  },
};
