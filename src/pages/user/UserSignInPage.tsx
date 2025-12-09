import { SignIn } from '@clerk/clerk-react';

export const UserSignInPage = () => {
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
        </div>
        <div className="mt-8 space-y-6">
          <SignIn 
            routing="path" 
            path="/user/sign-in"
            signUpUrl="/user/sign-up"
            afterSignInUrl="/user/settings"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
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

export default UserSignInPage;


