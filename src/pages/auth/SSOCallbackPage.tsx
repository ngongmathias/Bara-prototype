import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { safeRedirect } from '@/lib/safeRedirect';

/**
 * Handles OAuth SSO callbacks (Google/GitHub).
 * 
 * When a NEW user clicks "Continue with Google" on the Sign In page,
 * Clerk's sign-in fails because no account exists. The
 * AuthenticateWithRedirectCallback component detects this "transferable"
 * state and auto-creates a sign-up, then redirects to signUpForceRedirectUrl.
 *
 * Existing users sign in normally and land at signInForceRedirectUrl.
 */
export const SSOCallbackPage = () => {
  // sessionStorage is same-origin, but the value originally came from a
  // ?redirect_url= query parameter, so it gets the same treatment.
  const redirectUrl = safeRedirect(sessionStorage.getItem('bara_oauth_redirect'));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
        <p className="text-sm text-gray-600">Completing sign in…</p>
      </div>

      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl={`/auth/finish?mode=sign_in&redirect_url=${encodeURIComponent(redirectUrl)}`}
        signUpForceRedirectUrl={`/auth/finish?mode=sign_up&redirect_url=${encodeURIComponent(redirectUrl)}`}
      />
    </div>
  );
};

export default SSOCallbackPage;
