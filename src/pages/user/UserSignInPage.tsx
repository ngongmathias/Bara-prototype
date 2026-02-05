import { SignIn } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';

export const UserSignInPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect_url') || '/user/settings';
  const signUpUrl = `/user/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`;

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
        <div className="mt-8 space-y-6">
          <SignIn 
            routing="path" 
            path="/user/sign-in"
            signUpUrl={signUpUrl}
            afterSignInUrl={redirectUrl}
            appearance={{
              elements: {
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
        </div>
      </div>
    </div>
  );
};

export default UserSignInPage;


