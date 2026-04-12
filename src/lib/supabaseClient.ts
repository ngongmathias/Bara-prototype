import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a hook that returns an authenticated Supabase client
export const useSupabaseClient = () => {
  const { getToken } = useAuth();

  const getAuthenticatedClient = async () => {
    const token = await getToken({ template: 'supabase' });
    
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  };

  return { getAuthenticatedClient };
};
