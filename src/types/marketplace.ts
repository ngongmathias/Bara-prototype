// Marketplace TypeScript Interfaces

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceListing {
  id: string;
  category_id: string;
  subcategory_id?: string;
  country_id: string;
  country_ids?: string[];
  title: string;
  description: string;
  price?: number;
  currency: string;
  price_type: 'fixed' | 'negotiable' | 'yearly' | 'monthly';
  condition?: 'new' | 'used' | 'like-new';
  seller_name: string;
  seller_email: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_type: 'individual' | 'dealer' | 'agent' | 'company';
  location_details?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'active' | 'sold' | 'expired' | 'rejected';
  is_featured: boolean;
  is_verified: boolean;
  verified_at?: string;
  views_count: number;
  favorites_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  images?: ListingImage[];
  attributes?: Record<string, string>;
  category?: MarketplaceCategory;
  subcategory?: MarketplaceSubcategory;
  country?: { id: string; name: string; code: string; flag_url?: string };
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ListingAttribute {
  id: string;
  listing_id: string;
  attribute_key: string;
  attribute_value: string;
  created_at: string;
}

// Category-specific listing interfaces
export interface PropertyListing extends MarketplaceListing {
  attributes: {
    property_type?: 'apartment' | 'villa' | 'townhouse' | 'penthouse' | 'studio';
    bedrooms?: string;
    bathrooms?: string;
    sqft?: string;
    furnished?: 'yes' | 'no' | 'semi';
    ready_status?: 'ready' | 'off-plan';
    completion_date?: string;
  };
}

export interface MotorListing extends MarketplaceListing {
  attributes: {
    make?: string;
    model?: string;
    year?: string;
    kilometers?: string;
    transmission?: 'automatic' | 'manual';
    body_type?: string;
    fuel_type?: string;
    color?: string;
    specs?: string;
    condition?: 'new' | 'used';
  };
}

export interface JobListing extends MarketplaceListing {
  attributes: {
    job_type?: string;
    employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance';
    salary_min?: string;
    salary_max?: string;
    experience_required?: string;
    qualification_required?: string;
    industry?: string;
  };
}

export interface ClassifiedListing extends MarketplaceListing {
  attributes: {
    condition?: 'new' | 'used' | 'like-new';
    brand?: string;
    warranty?: string;
    age?: string;
    usage_status?: string;
  };
}

// Admin interfaces
export interface AdminAction {
  id: string;
  listing_id: string;
  admin_user_id: string;
  action_type: 'approved' | 'rejected' | 'featured' | 'expired' | 'deleted';
  notes?: string;
  created_at: string;
}

export interface FeaturedPricing {
  id: string;
  category_id: string;
  duration_days: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

// Filter interfaces
export interface ListingFilters {
  category_slug?: string;
  subcategory_slug?: string;
  country_id?: string;
  min_price?: number;
  max_price?: number;
  search_query?: string;
  status?: string;
  is_featured?: boolean;
  seller_type?: string;
  attributes?: Record<string, string>;
}

// API response interfaces
export interface ListingsResponse {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface CategoriesResponse {
  categories: MarketplaceCategory[];
}

export interface SubcategoriesResponse {
  subcategories: MarketplaceSubcategory[];
}
