import { SignUp } from '@clerk/clerk-react';

import { useLocation } from 'react-router-dom';



export const UserSignUpPage = () => {

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const redirectUrl = searchParams.get('redirect_url') || '/';

  const signInUrl = `/user/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;

  const finishUrl = `/auth/finish?mode=sign_up&redirect_url=${encodeURIComponent(redirectUrl)}`;



  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-4 sm:space-y-6">

        <div className="text-center">

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">

            Sign up

          </h2>

          <p className="mt-1 text-sm text-gray-600">

            Takes a few seconds.

          </p>

        </div>

        <div>

          <SignUp

            routing="path"

            path="/user/sign-up"

            signInUrl={signInUrl}

            forceRedirectUrl={finishUrl}

            appearance={{

              layout: {

                socialButtonsPlacement: 'top',

                socialButtonsVariant: 'blockButton',

                showOptionalFields: false,

              },

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



export default UserSignUpPage;





