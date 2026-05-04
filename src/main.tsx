import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Initialize i18n

// Clerk configuration (v5 — see https://clerk.com/docs/upgrade-guides/react-router-v5)
const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  // Fallback redirects when a flow isn't triggered with its own redirect_url.
  // Each <SignIn>/<SignUp> page sets its own forceRedirectUrl to /auth/finish.
  signInFallbackRedirectUrl: '/',
  signUpFallbackRedirectUrl: '/',
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
