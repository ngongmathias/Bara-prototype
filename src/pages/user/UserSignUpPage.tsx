import { SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

export const UserSignUpPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect_url') || '/user/settings';
  const signInUrl = `/user/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join to save favorites and manage your preferences
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <SignUp 
            routing="path" 
            path="/user/sign-up"
            signInUrl={signInUrl}
            afterSignUpUrl={redirectUrl}
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
                card: 'bg-white shadow-lg border border-gray-200 rounded-lg p-6',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserSignUpPage;


