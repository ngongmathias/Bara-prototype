import { SignIn, useSignIn } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useSignIn();

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect_url') || '/';
      navigate(redirectUrl);
    }
  }, [isLoaded, isSignedIn, navigate, location.search]);

  // Handle redirect after sign in
  const handleSignInSuccess = () => {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect_url') || '/';
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <SignIn 
            routing="path" 
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl={location.search ? `${location.pathname}${location.search}` : '/'}
            afterSignUpUrl={location.search ? `${location.pathname}${location.search}` : '/'}
            onSuccess={handleSignInSuccess}
            appearance={{
              elements: {
                formButtonPrimary: 'bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
                card: 'bg-white shadow-lg border border-gray-200 rounded-lg p-6',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
                footerActionText: 'text-sm text-gray-600',
                footerActionLink: 'text-blue-600 hover:text-blue-800',
                formFieldInput: 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6',
                identityPreviewText: 'text-sm text-gray-700',
                identityPreviewEditButton: 'text-blue-600 hover:text-blue-800',
                formFieldErrorText: 'text-red-600 text-sm mt-1',
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
        </div>
      </div>
    </div>
  );
};
