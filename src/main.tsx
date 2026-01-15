import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Initialize i18n

// Clerk configuration
const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  signIn: {
    // Redirect to home page after sign in
    afterSignInUrl: '/',
    // Don't automatically redirect, let Clerk handle new users
    fallbackRedirectUrl: '',
  },
  signUp: {
    // Don't automatically create accounts
    automatic: false,
    // Redirect to home page after sign up
    afterSignUpUrl: '/',
  },
  // Session management
  session: {
    singleSessionMode: false,
  },
  appearance: {
    variables: {
      colorPrimary: '#000000',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorInputBackground: '#f9fafb',
      colorInputText: '#1f2937',
      colorDanger: '#dc2626',
    },
    elements: {
      formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
      card: 'shadow-lg border border-gray-200',
      headerTitle: 'text-xl font-semibold text-gray-900',
      headerSubtitle: 'text-sm text-gray-600',
      formFieldErrorText: 'text-red-600 text-sm mt-1 font-medium',
      alert: 'bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4',
      alertText: 'text-sm font-medium',
      footerActionText: 'text-sm text-gray-600',
      footerActionLink: 'text-blue-600 hover:text-blue-800 font-medium underline',
    }
  }
};

createRoot(document.getElementById("root")!).render(
  <ClerkProvider {...clerkConfig}>
    <App />
  </ClerkProvider>
);
