import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { ClerkSupabaseBridge } from '@/lib/clerkSupabaseBridge';
import { supabase } from '@/lib/supabase';

export const AuthFinishPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const redirectUrl = params.get('redirect_url') || '/';

    if (!isSignedIn || !user) {
      if (mode === 'sign_up') navigate(`/user/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
      else navigate(`/user/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      try {
        const userEmail = (user.primaryEmailAddress?.emailAddress || '').toLowerCase();
        const isOAuth = (user.externalAccounts?.length ?? 0) > 0;

        const { data: existing, error: existingErr } = await supabase
          .from('clerk_users')
          .select('id')
          .eq('clerk_user_id', user.id)
          .maybeSingle();
        if (existingErr) {
          throw new Error('Unable to verify your account. Please try again.');
        }

        if (!existing?.id) {
          // Reconcile by email first: someone who registered with email/password
          // and is now signing in with Google (same verified email) should link to
          // their existing profile, not be treated as a new user.
          let linked = false;
          if (userEmail) {
            const { data: byEmail } = await supabase
              .from('clerk_users')
              .select('id')
              .eq('email', userEmail)
              .maybeSingle();
            if (byEmail?.id) {
              await supabase
                .from('clerk_users')
                .update({ clerk_user_id: user.id, updated_at: new Date().toISOString() })
                .eq('id', byEmail.id);
              linked = true;
            }
          }

          if (!linked) {
            if (isOAuth) {
              // New Google/social user — collect the registration profile (DOB,
              // gender, country, phone, username). No password needed.
              navigate(`/auth/complete-profile?redirect_url=${encodeURIComponent(redirectUrl)}`);
              return;
            }
            if (mode === 'sign_up') {
              // Email/password sign-up via a prebuilt widget (e.g. the admin
              // sign-up) — create the minimal profile row as before.
              const flagKey = `bara_platform_user_created_${user.id}`;
              if (!sessionStorage.getItem(flagKey)) {
                const ok = await ClerkSupabaseBridge.ensureDatabaseUser({
                  id: user.id,
                  email: userEmail,
                  firstName: user.firstName || undefined,
                  lastName: user.lastName || undefined,
                });
                if (!ok) {
                  throw new Error('Failed to create your user profile. Please try again.');
                }
                sessionStorage.setItem(flagKey, '1');
              }
            } else {
              // Email/password sign-in with no platform account → register first.
              setError('No BARA account found. Please register first.');
              await clerk.signOut();
              navigate(`/user/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
              return;
            }
          }
        }

        navigate(redirectUrl);
      } catch (e: any) {
        setError(e?.message || 'Authentication completed, but your account setup failed.');
      }
    };

    run();
  }, [isLoaded, isSignedIn, user, location.search, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        {error ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Account Setup Error</h2>
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
            <button
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
            <p className="text-sm text-gray-700">Finishing authentication…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFinishPage;
