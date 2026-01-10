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
    },
    elements: {
      formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
      card: 'shadow-lg border border-gray-200',
      headerTitle: 'text-xl font-semibold text-gray-900',
      headerSubtitle: 'text-sm text-gray-600',
    }
  }
};

createRoot(document.getElementById("root")!).render(
  <ClerkProvider {...clerkConfig}>
    <App />
  </ClerkProvider>
);
