import { useAuth } from '@clerk/clerk-react';
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';

// §K1/§K6 — the owner/admin RLS checks added in
// 20260806_security_hardening.sql read the caller's identity from
// `request.jwt.claims->>'sub'`, which is only populated when the request
// carries a Clerk-issued Supabase JWT. Writes made with the plain `supabase`
// client (anon key, no JWT) authenticate as the `anon` Postgres role no
// matter who's signed into Clerk in the browser — this is the client half
// of the fix; RLS is the other half. Every write to an owner/admin-scoped
// table needs to go through the client this hook returns, not the plain one.
export function useAuthedSupabase() {
    const { getToken } = useAuth();

    const getClient = async () => {
        try {
            const token = await getToken({ template: 'supabase' });
            return token ? await createAuthenticatedSupabaseClient(token) : supabase;
        } catch {
            return supabase;
        }
    };

    return { getClient };
}
