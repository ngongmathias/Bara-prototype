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
        const userEmail = user.primaryEmailAddress?.emailAddress || '';

        if (mode === 'sign_in') {
          const { data: existing, error: existingErr } = await supabase
            .from('clerk_users')
            .select('id')
            .eq('clerk_user_id', user.id)
            .maybeSingle();

          if (existingErr) {
            throw new Error('Unable to verify your account. Please try again.');
          }

          const isOAuth = (user.externalAccounts?.length ?? 0) > 0;

          if (!existing?.id) {
            if (isOAuth) {
              // OAuth user with no platform record → implicit sign-up
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
              // Email/password sign-in with no existing record → strict block
              setError('No account found for this sign-in. Please use Sign Up to create an account.');
              await clerk.signOut();
              navigate(`/user/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
              return;
            }
          }
        }

        if (mode === 'sign_up') {
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
