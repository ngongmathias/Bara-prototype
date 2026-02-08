import { useState } from 'react';
import { SignIn, useSignIn } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';

export const UserSignInPage = () => {
  const location = useLocation();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect_url') || '/user/settings';
  const signUpUrl = `/user/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`;
  const finishUrl = `/auth/finish?mode=sign_in&redirect_url=${encodeURIComponent(redirectUrl)}`;

  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!signInLoaded || !signIn) return;
    setOauthLoading(strategy);
    // Store redirect so the SSO callback page can read it
    sessionStorage.setItem('bara_oauth_redirect', redirectUrl);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: finishUrl,
      });
    } catch (err) {
      console.error('OAuth redirect failed:', err);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your account to manage your settings
          </p>
          <p className="mt-2 text-sm text-gray-600">
            New here?{' '}
            <Link className="text-blue-600 hover:text-blue-800 font-medium" to={signUpUrl}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Custom OAuth buttons — route through /sso-callback for seamless auto-transfer */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={!signInLoaded || oauthLoading !== null}
            onClick={() => handleOAuth('oauth_google')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {oauthLoading === 'oauth_google' ? 'Redirecting…' : 'Continue with Google'}
          </button>
          <button
            type="button"
            disabled={!signInLoaded || oauthLoading !== null}
            onClick={() => handleOAuth('oauth_github')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            {oauthLoading === 'oauth_github' ? 'Redirecting…' : 'Continue with GitHub'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 text-gray-500">or</span></div>
        </div>

        {/* Clerk SignIn for email/password only (OAuth buttons hidden) */}
        <div className="space-y-6">
          <SignIn 
            routing="path" 
            path="/user/sign-in"
            signUpUrl={signUpUrl}
            signUpForceRedirectUrl={`/auth/finish?mode=sign_up&redirect_url=${encodeURIComponent(redirectUrl)}`}
            afterSignInUrl={finishUrl}
            appearance={{
              elements: {
                socialButtonsBlockButton: { display: 'none' },
                socialButtonsBlockButtonText: { display: 'none' },
                socialButtonsProviderIcon: { display: 'none' },
                dividerRow: { display: 'none' },
                dividerText: { display: 'none' },
                dividerLine: { display: 'none' },
                formButtonPrimary: 'bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
                card: 'bg-white shadow-lg border border-gray-200 rounded-lg p-6',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
                footerActionText: 'text-sm text-gray-600',
                footerActionLink: 'text-blue-600 hover:text-blue-800 font-medium',
                formFieldInput: 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset ring-black sm:text-sm sm:leading-6',
                formFieldErrorText: 'text-red-600 text-sm mt-1 font-medium',
                alert: 'bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4',
                alertText: 'text-sm font-medium',
              },
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'blockButton',
                showOptionalFields: true,
              }
            }}
          />
          {/* Fallback UI for email/password 'account not found' */}
          <div id="clerk-account-not-found-fallback" style={{ display: 'none' }} className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
            <p className="text-sm text-blue-800 mb-3">No account found with this email. Would you like to create one?</p>
            <Link
              to={signUpUrl}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const observer = new MutationObserver(() => {
                const alert = document.querySelector('[role="alert"]');
                const fallback = document.getElementById('clerk-account-not-found-fallback');
                if (alert && fallback) {
                  const text = alert.textContent || '';
                  if (/couldn't find your account|no account found/i.test(text)) {
                    alert.closest('.clerk-alert')?.setAttribute('style', 'display:none');
                    fallback.removeAttribute('style');
                  }
                }
              });
              observer.observe(document.body, { childList: true, subtree: true });
            })();
          `
        }} />
      </div>
    </div>
  );
};

export default UserSignInPage;


