import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', SUPABASE_URL ? 'Set' : 'Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!SUPABASE_URL || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: !!SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with error handling
let supabaseClient: any = null;

try {
  supabaseClient = createClient(SUPABASE_URL, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false, // Disable Supabase auth since we're using Clerk
      persistSession: false,   // Disable Supabase session persistence
      detectSessionInUrl: false // Disable Supabase session detection
    },
    db: {
      schema: 'public'
    }
  });
  
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw new Error('Failed to initialize Supabase client');
}

export const supabase = supabaseClient;

// Verify the client is properly initialized
if (!supabase) {
  console.error('❌ Supabase client is null');
  throw new Error('Failed to initialize Supabase client');
}

// Test the connection with better error handling
const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('popup_ads').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection test successful');
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
  }
};

// Test connection asynchronously
testConnection();

// Create an authenticated Supabase client for admin operations
export const createAuthenticatedSupabaseClient = async (clerkToken: string) => {
  return createClient(SUPABASE_URL, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  })
}

// Helper function to get authenticated database operations
export const getAuthenticatedDb = async () => {
  try {
    // Get Clerk token
    const { useAuth } = await import('@clerk/clerk-react');
    // Note: This function should be called within a component that has access to useAuth
    // For now, we'll use the regular client
    console.warn('getAuthenticatedDb: This function needs to be called within a component context');
    
    return getAdminDb();
  } catch (error) {
    console.error('Error creating authenticated database client:', error);
    throw error;
  }
};

// For now, let's use the regular client but with proper error handling
// This is a temporary solution until we can properly configure JWT authentication
export const getAdminDb = () => {
  if ((getAdminDb as any)._cachedDb) return (getAdminDb as any)._cachedDb;

  const adminSupabase = createClient(
    SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: 'sb-admin'
      },
      db: {
        schema: 'public'
      }
    }
  );

  (getAdminDb as any)._cachedDb = {
    // Business operations
    businesses: () => adminSupabase.from('businesses'),
    
    // Category operations
    categories: () => adminSupabase.from('categories'),
    
    // City operations
    cities: () => adminSupabase.from('cities'),
    
    // Country operations
    countries: () => adminSupabase.from('countries'),
    
    // Review operations
    reviews: () => adminSupabase.from('reviews'),
    
    // Event operations
    events: () => adminSupabase.from('events'),
    
    // Product operations
    products: () => adminSupabase.from('products'),
    
    // User operations
    users: () => adminSupabase.from('users'),
    
    // Payment operations
    payments: () => adminSupabase.from('payments'),
    
    // Premium features operations
    premium_features: () => adminSupabase.from('premium_features'),
    
    // Questions operations
    questions: () => adminSupabase.from('questions'),
    
    // Admin users operations
    admin_users: () => adminSupabase.from('admin_users'),
    
    // User logs operations
    user_logs: () => adminSupabase.from('user_logs'),
    
    // Contact messages operations
    contact_messages: () => adminSupabase.from('contact_messages'),
    
    // Listing claims operations
    listing_claims: () => adminSupabase.from('listing_claims'),
    
    // Banner ads operations
    banner_ads: () => adminSupabase.from('banner_ads'),
    
    // Banner ad analytics operations
    banner_ad_analytics: () => adminSupabase.from('banner_ad_analytics'),

    // Click analytics (events/views)
    business_click_events: () => adminSupabase.from('business_click_events'),
    business_clicks_by_month: () => adminSupabase.from('business_clicks_by_month'),
    business_clicks_totals: () => adminSupabase.from('business_clicks_totals'),

    // Business review stats view
    business_review_stats: () => adminSupabase.from('business_review_stats'),
    
    // Sponsored banners operations
    sponsored_banners: () => adminSupabase.from('sponsored_banners'),
    
    // Sponsored banner analytics operations
    sponsored_banner_analytics: () => adminSupabase.from('sponsored_banner_analytics'),
    
    // Country info operations
    country_info: () => adminSupabase.from('country_info'),
    
    // Global Africa operations
    global_africa: () => adminSupabase.from('global_africa'),
    global_africa_info: () => adminSupabase.from('global_africa_info'),
    
    // Slideshow images operations
    slideshow_images: () => adminSupabase.from('slideshow_images'),
    
    // Popup ads operations
    popup_ads: () => adminSupabase.from('popup_ads'),
    
    // Admin activity log operations
    admin_activity_log: () => adminSupabase.from('admin_activity_log'),
    
    // RSS feed operations
    rss_feed_sources: () => adminSupabase.from('rss_feed_sources'),
    rss_feeds: () => adminSupabase.from('rss_feeds')
  };

  return (getAdminDb as any)._cachedDb;
};

// Database types for TypeScript
// export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
// export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
// export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Extend the Database interface to include our new fields
declare module '@supabase/supabase-js' {
  interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            category_id: string | null;
            owner_id: string | null;
            city_id: string | null;
            country_id: string | null;
            phone: string | null;
            email: string | null;
            website: string | null;
            whatsapp: string | null;
            address: string | null;
            latitude: number | null;
            longitude: number | null;
            hours_of_operation: any | null;
            services: any | null;
            images: string[] | null;
            logo_url: string | null;
            status: 'pending' | 'active' | 'suspended' | 'premium';
            is_premium: boolean;
            is_verified: boolean;
            has_coupons: boolean;
            accepts_orders_online: boolean;
            is_kid_friendly: boolean;
            is_sponsored_ad: boolean;
            meta_title: string | null;
            meta_description: string | null;
            view_count: number;
            click_count: number;
            created_at: string;
            updated_at: string;
          };
        Insert: {
            id?: string;
            name: string;
            slug: string;
            description?: string | null;
            category_id?: string | null;
            owner_id?: string | null;
            city_id?: string | null;
            country_id?: string | null;
            phone?: string | null;
            email?: string | null;
            website?: string | null;
            whatsapp?: string | null;
            address?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            hours_of_operation?: any | null;
            services?: any | null;
            images?: string[] | null;
            logo_url?: string | null;
            status?: 'pending' | 'active' | 'suspended' | 'premium';
            is_premium?: boolean;
            is_verified?: boolean;
            has_coupons?: boolean;
            accepts_orders_online?: boolean;
            is_kid_friendly?: boolean;
            is_sponsored_ad?: boolean;
            meta_title?: string | null;
            meta_description?: string | null;
            view_count?: number;
            click_count?: number;
            created_at?: string;
            updated_at?: string;
          };
        Update: {
            id?: string;
            name?: string;
            slug?: string;
            description?: string | null;
            category_id?: string | null;
            owner_id?: string | null;
            city_id?: string | null;
            country_id?: string | null;
            phone?: string | null;
            email?: string | null;
            website?: string | null;
            whatsapp?: string | null;
            address?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            hours_of_operation?: any | null;
            services?: any | null;
            images?: string[] | null;
            logo_url?: string | null;
            status?: 'pending' | 'active' | 'suspended' | 'premium';
            is_premium?: boolean;
            is_verified?: boolean;
            has_coupons?: boolean;
            accepts_orders_online?: boolean;
            is_kid_friendly?: boolean;
            is_sponsored_ad?: boolean;
            meta_title?: string | null;
            meta_description?: string | null;
            view_count?: number;
            click_count?: number;
            created_at?: string;
            updated_at?: string;
          };
        };

        ad_campaigns: {
        Row: {
            id: string;
            business_id: string;
            campaign_name: string;
            campaign_type: 'featured_listing' | 'top_position' | 'sidebar';
            target_cities: string[];
            target_categories: string[];
            start_date: string;
            end_date: string;
            budget: number;
            spent_amount: number;
            daily_budget_limit: number | null;
            is_active: boolean;
            admin_approved: boolean;
            admin_notes: string | null;
            performance_metrics: any | null;
            created_at: string;
            updated_at: string;
          };
        Insert: {
            id?: string;
            business_id: string;
            campaign_name: string;
            campaign_type?: 'featured_listing' | 'top_position' | 'sidebar';
            target_cities?: string[];
            target_categories?: string[];
            start_date: string;
            end_date: string;
            budget: number;
            spent_amount?: number;
            daily_budget_limit?: number | null;
            is_active?: boolean;
            admin_approved?: boolean;
            admin_notes?: string | null;
            performance_metrics?: any | null;
            created_at?: string;
            updated_at?: string;
          };
        Update: {
            id?: string;
            business_id?: string;
            campaign_name?: string;
            campaign_type?: 'featured_listing' | 'top_position' | 'sidebar';
            target_cities?: string[];
            target_categories?: string[];
            start_date?: string;
            end_date?: string;
            budget?: number;
            spent_amount?: number;
            daily_budget_limit?: number | null;
            is_active?: boolean;
            admin_approved?: boolean;
            admin_notes?: string | null;
            performance_metrics?: any | null;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  }
}

// Helper functions for common operations
export const db = {
  // Business operations
  businesses: () => supabase.from('businesses'),
  
  // Category operations
  categories: () => supabase.from('categories'),
  
  // City operations
  cities: () => supabase.from('cities'),
  
  // Country operations
  countries: () => supabase.from('countries'),
  
  // Review operations
  reviews: () => supabase.from('reviews'),
  
  // Event operations
  events: () => supabase.from('events'),
  
  // Product operations
  products: () => supabase.from('products'),
  
  // User operations
  users: () => supabase.from('users'),
  
  // Payment operations
  payments: () => supabase.from('payments'),
  
  // Premium features operations
  premium_features: () => supabase.from('premium_features'),
  
  // Questions operations
  questions: () => supabase.from('questions'),
  
  // Contact messages operations
  contact_messages: () => supabase.from('contact_messages'),
  
  // Listing claims operations
  listing_claims: () => supabase.from('listing_claims'),
  
  // Banner ads operations
  banner_ads: () => supabase.from('banner_ads'),
  
  // Banner ad analytics operations
  banner_ad_analytics: () => supabase.from('banner_ad_analytics'),

  // Click analytics (events/views)
  business_click_events: () => supabase.from('business_click_events'),
  business_clicks_by_month: () => supabase.from('business_clicks_by_month'),
  business_clicks_totals: () => supabase.from('business_clicks_totals'),

  // Business review stats view
  business_review_stats: () => supabase.from('business_review_stats'),
  
  // Sponsored banners operations
  sponsored_banners: () => supabase.from('sponsored_banners'),
  
  // Sponsored banner analytics operations
  sponsored_banner_analytics: () => supabase.from('sponsored_banner_analytics'),
  
  // Country info operations
  country_info: () => supabase.from('country_info'),
  
  // Global Africa operations
  global_africa: () => supabase.from('global_africa'),
  global_africa_info: () => supabase.from('global_africa_info'),
  
  // Slideshow images operations
  slideshow_images: () => supabase.from('slideshow_images'),
  
  // Popup ads operations
  popup_ads: () => supabase.from('popup_ads')
}

// Auth helper functions
export const auth = {
  // Get current user
  getUser: () => supabase.auth.getUser(),
  
  // Sign up
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ email, password }),
  
  // Sign in
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  // Sign out
  signOut: () => supabase.auth.signOut(),
  
  // Reset password
  resetPassword: (email: string) => 
    supabase.auth.resetPasswordForEmail(email),
  
  // Update password
  updatePassword: (password: string) => 
    supabase.auth.updateUser({ password }),
  
  // Get session
  getSession: () => supabase.auth.getSession(),
  
  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback)
} 