import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { isProfileComplete } from '@/lib/profileCompletion';

// Paths where we must NOT force profile completion: the auth flow itself, the
// completion page (would loop), legal pages linked from it, and the admin area
// (admins are gated separately and may not have a clerk_users profile row).
const EXEMPT_PREFIXES = [
  '/auth/complete-profile',
  '/auth/finish',
  '/sso-callback',
  '/user/sign-in',
  '/user/sign-up',
  '/sign-in',
  '/sign-up',
  '/admin',
  '/terms',
  '/privacy',
  '/registration-disclaimer',
  '/definitions',
  '/cookies',
];

const isExempt = (path: string) =>
  EXEMPT_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * App-wide guard: any signed-in user whose registration profile is incomplete
 * (missing DOB/gender/country/phone) is sent to /auth/complete-profile before
 * they can use the rest of the app. Catches new social sign-ups, returning
 * users who predate those fields, and anyone who abandoned the step. Once a
 * user is confirmed complete it never re-checks for the rest of the session.
 */
export function useProfileCompletionGuard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  // Clerk user id we've already confirmed complete for — stops re-fetching.
  const confirmedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (confirmedFor.current === user.id) return;
    if (isExempt(location.pathname)) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('clerk_users')
        .select('date_of_birth, gender, country, phone')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      if (cancelled || error) return; // don't block navigation on transient errors

      if (isProfileComplete(data)) {
        confirmedFor.current = user.id;
        return;
      }

      const back = location.pathname + location.search;
      navigate(`/auth/complete-profile?redirect_url=${encodeURIComponent(back)}`);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user, location.pathname, location.search, navigate]);
}
