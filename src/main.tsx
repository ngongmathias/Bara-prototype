import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Initialize i18n

// Clerk configuration
const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  // Enable automatic account creation
  signIn: {
    // Redirect to home page after sign in
    afterSignInUrl: '/',
    // Automatically create accounts for new users
    fallbackRedirectUrl: '/',
  },
  signUp: {
    // Automatically create accounts for new users
    automatic: true,
    // Redirect to home page after sign up
    afterSignUpUrl: '/',
  },
  // Session management
  session: {
    // Automatically create user sessions
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
