import { db, getAdminDb } from './supabase';

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  city_id: string;
  country_id: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  order_online_url: string | null;
  website_visible: boolean;
  address: string | null;
  status: 'pending' | 'active' | 'suspended' | 'premium';
  is_premium: boolean;
  is_verified: boolean;
  has_coupons: boolean;
  accepts_orders_online: boolean;
  is_kid_friendly: boolean;
  latitude: number | null;
  longitude: number | null;
  hours_of_operation: any | null;
  services: any | null;
  images: string[] | null;
  logo_url: string | null;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  is_sponsored_ad: boolean;

  // Joined fields
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  city?: {
    id: string;
    name: string;
    country_id: string;
  };
  country?: {
    id: string;
    name: string;
    code: string;
    flag_url: string | null;
  };
  reviews?: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    created_at: string;
    status?: 'pending' | 'approved' | 'rejected';
    images?: string[] | null;
  }[];
}

export interface BusinessFilters {
  category?: string;
  city?: string;
  country?: string;
  status?: 'active' | 'premium';
  search?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  has_coupons?: boolean;
  accepts_orders_online?: boolean;
  is_kid_friendly?: boolean;
  is_sponsored_ad?: boolean;
  website_visible?: boolean;
}

export interface BusinessSearchParams {
  categorySlug?: string;
  citySlug?: string;
  countryCode?: string;
  searchTerm?: string;
  filters?: BusinessFilters;
  page?: number;
  limit?: number;
}

export interface City {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  countries: { code: string } | null;
}

export interface AdCampaign {
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
  daily_budget_limit?: number;
  is_active: boolean;
  admin_approved: boolean;
  admin_notes?: string;
  performance_metrics?: any;
  created_at: string;
  updated_at: string;
}

export class BusinessService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get nearby cities for proximity filtering
   */
  static async getNearbyCities(cityName: string, radiusKm: number = 50): Promise<string[]> {
    try {
      // First get the selected city coordinates
      const { data: cityData, error: cityError } = await db.cities()
        .select('id, name, latitude, longitude')
        .eq('name', cityName)
        .single();

      if (cityError || !cityData || !cityData.latitude || !cityData.longitude) {
        return [cityName]; // Return just the selected city if no coordinates
      }

      // Get all cities with coordinates
      const { data: allCities, error: citiesError } = await db.cities()
        .select('id, name, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (citiesError || !allCities) {
        return [cityName];
      }

      // Filter cities within radius
      const nearbyCities = allCities
        .filter(city => {
          const distance = this.calculateDistance(
            cityData.latitude!,
            cityData.longitude!,
            city.latitude!,
            city.longitude!
          );
          return distance <= radiusKm;
        })
        .map(city => city.name);

      return nearbyCities.length > 0 ? nearbyCities : [cityName];
    } catch (error) {
      console.error('Error getting nearby cities:', error);
      return [cityName];
    }
  }

  /**
   * Fetch businesses with filters and joins
   */
  static async getBusinesses(params: BusinessSearchParams = {}): Promise<Business[]> {
    try {
      // Use inner joins to ensure category/city filters work reliably
      let query = db.businesses()
        .select(`
          *,
          category:categories!businesses_category_id_fkey(id, name, slug, icon),
          city:cities!businesses_city_id_fkey(id, name, country_id),
          country:countries!businesses_country_id_fkey(id, name, code, flag_url),
          reviews:reviews(id, rating, title, content, created_at, status, images)
        `, { head: false })
        .eq('status', 'active');

      // Apply category filter
      if (params.categorySlug) {
        const { data: catData } = await db.categories().select('id').eq('slug', params.categorySlug).single();
        if (catData) {
          query = query.eq('category_id', catData.id);
        } else {
          // If category not found, return empty
          return [];
        }
      }

      // Apply city filter with proximity
      if (params.citySlug) {
        const nearbyCities = await this.getNearbyCities(params.citySlug);
        if (nearbyCities.length > 0) {
          const { data: cityIds } = await db.cities().select('id').in('name', nearbyCities);
          if (cityIds && cityIds.length > 0) {
            query = query.in('city_id', cityIds.map(c => c.id));
          } else {
            return [];
          }
        }
      }

      // Apply country filter
      if (params.countryCode) {
        // First get the country ID from the country code
        const { data: countryData, error: countryError } = await db.countries()
          .select('id, name, code')
          .eq('code', params.countryCode)
          .single();

        if (countryError) {
          console.error('Error fetching country:', countryError);
        } else if (countryData) {
          query = query.eq('country_id', countryData.id);
        } else {
        }
      }

      // Apply search filter
      if (params.searchTerm) {
        query = query.or(`name.ilike.%${params.searchTerm}%,description.ilike.%${params.searchTerm}%`);
      }

      // Apply premium filter
      if (params.filters?.is_premium) {
        query = query.eq('is_premium', true);
      }

      // Apply verification filter
      if (params.filters?.is_verified) {
        query = query.eq('is_verified', true);
      }

      // Apply new business feature filters
      if (params.filters?.has_coupons) {
        query = query.eq('has_coupons', true);
      }

      if (params.filters?.accepts_orders_online) {
        query = query.eq('accepts_orders_online', true);
      }

      if (params.filters?.is_kid_friendly) {
        query = query.eq('is_kid_friendly', true);
      }

      if (params.filters?.is_sponsored_ad) {
        query = query.eq('is_sponsored_ad', true);
      }

      // Order by premium status and creation date
      query = query.order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply pagination
      if (params.page && params.limit) {
        const offset = (params.page - 1) * params.limit;
        query = query.range(offset, offset + params.limit - 1);
      }
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error in getBusinesses:', error);
      throw error;
    }
  }

  /**
   * Get business by ID with full details
   */
  static async getBusinessById(id: string): Promise<Business | null> {
    try {
      const { data, error } = await db.businesses()
        .select(`
          *,
          category:categories!businesses_category_id_fkey(id, name, slug, icon),
          city:cities!businesses_city_id_fkey(id, name, country_id),
          country:countries!businesses_country_id_fkey(id, name, code, flag_url),
          reviews:reviews(id, rating, title, content, created_at, status, images)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getBusinessById:', error);
      return null;
    }
  }

  /**
   * Get businesses by category slug
   */
  static async getBusinessesByCategory(categorySlug: string, citySlug?: string, countryId?: string): Promise<Business[]> {
    try {

      // First, get the category ID from the slug
      const { data: categoryData, error: categoryError } = await db.categories()
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (categoryError || !categoryData) {
        console.error('Category not found:', categorySlug, categoryError);
        return [];
      }

      // Build the main query
      let query = db.businesses()
        .select(`
          *,
          category:categories!businesses_category_id_fkey(id, name, slug, icon),
          city:cities!businesses_city_id_fkey(id, name, country_id),
          country:countries!businesses_country_id_fkey(id, name, code, flag_url),
          reviews:reviews(id, rating, title, content, created_at, status, images)
        `)
        .eq('status', 'active')
        .eq('category_id', categoryData.id);

      // Apply country filter if provided (use country_id exact match)
      if (countryId) {
        query = query.eq('country_id', countryId);
      }

      // Apply city filter if provided
      if (citySlug) {
        const nearbyCities = await this.getNearbyCities(citySlug);
        if (nearbyCities.length > 1) {
          // Use subquery to get city IDs for nearby cities
          const { data: cityIds } = await db.cities()
            .select('id')
            .in('name', nearbyCities);

          if (cityIds && cityIds.length > 0) {
            const cityIdArray = cityIds.map(city => city.id);
            query = query.in('city_id', cityIdArray);
          }
        } else {
          // Get the specific city ID
          const { data: cityData } = await db.cities()
            .select('id')
            .eq('name', citySlug)
            .single();

          if (cityData) {
            query = query.eq('city_id', cityData.id);
          }
        }
      }

      const { data, error } = await query
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses by category:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error in getBusinessesByCategory:', error);
      throw error;
    }
  }

  /**
   * Search businesses by name or description
   */
  static async searchBusinesses(searchTerm: string, filters: BusinessFilters = {}, limit: number = 50): Promise<Business[]> {
    try {

      // Sanitize term for PostgREST logical tree (avoid commas/parentheses breaking or=)
      const sanitized = (searchTerm || '').replace(/[(),]/g, ' ').trim();
      const pattern = `*${sanitized}*`;

      let query = db.businesses()
        .select(`
          *,
          category:categories!businesses_category_id_fkey(id, name, slug, icon),
          city:cities!businesses_city_id_fkey(id, name, country_id),
          country:countries!businesses_country_id_fkey(id, name, code, flag_url),
          reviews:reviews(id, rating, title, content, created_at, status, images)
        `)
        .eq('status', 'active')
        // Broaden search across multiple relevant fields, including related tables
        // Note: Keep OR limited to base table columns to avoid PostgREST parse errors
        .or([
          `name.ilike.${pattern}`,
          `description.ilike.${pattern}`,
          `address.ilike.${pattern}`,
          `website.ilike.${pattern}`
        ].join(','));

      // Apply additional filters
      if (filters.category) {
        // Get category ID from slug
        const { data: categoryData } = await db.categories()
          .select('id')
          .eq('slug', filters.category)
          .eq('is_active', true)
          .single();

        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters.city) {
        const nearbyCities = await this.getNearbyCities(filters.city);
        if (nearbyCities.length > 1) {
          // Get city IDs for nearby cities
          const { data: cityIds } = await db.cities()
            .select('id')
            .in('name', nearbyCities);

          if (cityIds && cityIds.length > 0) {
            const cityIdArray = cityIds.map(city => city.id);
            query = query.in('city_id', cityIdArray);
          }
        } else {
          // Get specific city ID
          const { data: cityData } = await db.cities()
            .select('id')
            .eq('name', filters.city)
            .single();

          if (cityData) {
            query = query.eq('city_id', cityData.id);
          }
        }
      }

      if (filters.country) {
        // Check if it's a UUID (country ID) or a string (country code)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.country);
        if (isUUID) {
          // It's a country ID, filter by country_id
          query = query.eq('country_id', filters.country);
        } else {
          // It's a country code, filter by countries.code
          query = query.eq('countries.code', filters.country);
        }
      }

      if (filters.is_premium) {
        query = query.eq('is_premium', true);
      }

      if (filters.is_verified) {
        query = query.eq('is_verified', true);
      }

      if (filters.has_coupons) {
        query = query.eq('has_coupons', true);
      }

      if (filters.accepts_orders_online) {
        query = query.eq('accepts_orders_online', true);
      }

      if (filters.is_kid_friendly) {
        query = query.eq('is_kid_friendly', true);
      }

      if (filters.is_sponsored_ad) {
        query = query.eq('is_sponsored_ad', true);
      }

      // Apply a sane limit for live search
      const { data, error } = await query
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching businesses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchBusinesses:', error);
      throw error;
    }
  }

  /**
   * Get countries that have businesses in a specific category
   */
  static async getCountriesByCategory(categorySlug: string): Promise<Array<{ id: string; name: string; code: string; business_count: number }>> {
    try {

      // First, get the category ID from the slug
      const { data: categoryData, error: categoryError } = await db.categories()
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (categoryError || !categoryData) {
        console.error('Category not found:', categorySlug, categoryError);
        return [];
      }

      // Get countries that have businesses in this category
      const { data, error } = await db.businesses()
        .select(`
          country_id,
          countries!businesses_country_id_fkey(
            id,
            name,
            code
          )
        `)
        .eq('status', 'active')
        .eq('category_id', categoryData.id)
        .not('country_id', 'is', null);

      if (error) {
        console.error('Error fetching countries by category:', error);
        throw error;
      }

      // Count businesses per country
      const countryCountMap: { [key: string]: { id: string; name: string; code: string; count: number } } = {};

      data?.forEach((business: any) => {
        if (business.countries) {
          const countryId = business.countries.id;
          if (!countryCountMap[countryId]) {
            countryCountMap[countryId] = {
              id: business.countries.id,
              name: business.countries.name,
              code: business.countries.code,
              count: 0
            };
          }
          countryCountMap[countryId].count++;
        }
      });

      // Convert to array and sort by business count (descending) then by name
      const countriesWithCounts = Object.values(countryCountMap).map(country => ({
        id: country.id,
        name: country.name,
        code: country.code,
        business_count: country.count
      })).sort((a, b) => {
        if (b.business_count !== a.business_count) {
          return b.business_count - a.business_count;
        }
        return a.name.localeCompare(b.name);
      });
      return countriesWithCounts;
    } catch (error) {
      console.error('Error in getCountriesByCategory:', error);
      throw error;
    }
  }

  /**
   * Get business count by category
   */
  static async getBusinessCountByCategory(categorySlug: string): Promise<number> {
    try {
      // First get the category ID
      const { data: categoryData, error: categoryError } = await db.categories()
        .select('id')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (categoryError || !categoryData) {
        console.error('Category not found for count:', categorySlug);
        return 0;
      }

      const { count, error } = await db.businesses()
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('category_id', categoryData.id);

      if (error) {
        console.error('Error getting business count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getBusinessCountByCategory:', error);
      return 0;
    }
  }

  /**
   * Get cities that have businesses in a specific category
   */
  static async getCitiesByCategory(categorySlug: string): Promise<Array<{
    city_id: string;
    city_name: string;
    country_name: string;
    business_count: number;
  }>> {
    try {

      // First get the category ID
      const { data: categoryData, error: categoryError } = await db.categories()
        .select('id')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (categoryError || !categoryData) {
        console.error('Category not found for cities:', categorySlug);
        return [];
      }

      // Get businesses in this category with their city information
      const { data, error } = await db.businesses()
        .select(`
          city_id,
          cities!businesses_city_id_fkey(
            id,
            name,
            countries!cities_country_id_fkey(name)
          )
        `)
        .eq('status', 'active')
        .eq('category_id', categoryData.id)
        .not('city_id', 'is', null);

      if (error) {
        console.error('Error getting cities by category:', error);
        return [];
      }

      // Group by city and count businesses
      const cityMap = new Map<string, {
        city_id: string;
        city_name: string;
        country_name: string;
        business_count: number;
      }>();

      data?.forEach((business: any) => {
        if (business.city_id && business.cities) {
          const cityKey = business.city_id;
          if (cityMap.has(cityKey)) {
            cityMap.get(cityKey)!.business_count++;
          } else {
            cityMap.set(cityKey, {
              city_id: business.city_id,
              city_name: business.cities.name,
              country_name: business.cities.countries?.name || 'Unknown',
              business_count: 1
            });
          }
        }
      });

      const result = Array.from(cityMap.values()).sort((a, b) => b.business_count - a.business_count);
      return result;
    } catch (error) {
      console.error('Error in getCitiesByCategory:', error);
      return [];
    }
  }

  /**
   * Get category statistics including city distribution
   */
  static async getCategoryStats(categorySlug: string): Promise<{
    total_businesses: number;
    cities_count: number;
    premium_count: number;
    verified_count: number;
    cities: Array<{
      city_id: string;
      city_name: string;
      country_name: string;
      business_count: number;
    }>;
  }> {
    try {
      // First get the category ID
      const { data: categoryData, error: categoryError } = await db.categories()
        .select('id')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (categoryError || !categoryData) {
        console.error('Category not found for stats:', categorySlug);
        return {
          total_businesses: 0,
          cities_count: 0,
          premium_count: 0,
          verified_count: 0,
          cities: []
        };
      }

      // Get all businesses in this category
      const { data: businesses, error } = await db.businesses()
        .select('*')
        .eq('status', 'active')
        .eq('category_id', categoryData.id);

      if (error) {
        console.error('Error getting category stats:', error);
        return {
          total_businesses: 0,
          cities_count: 0,
          premium_count: 0,
          verified_count: 0,
          cities: []
        };
      }

      const total_businesses = businesses?.length || 0;
      const premium_count = businesses?.filter(b => b.is_premium).length || 0;
      const verified_count = businesses?.filter(b => b.is_verified).length || 0;

      // Get cities distribution
      const cities = await this.getCitiesByCategory(categorySlug);
      const cities_count = cities.length;

      return {
        total_businesses,
        cities_count,
        premium_count,
        verified_count,
        cities
      };
    } catch (error) {
      console.error('Error in getCategoryStats:', error);
      return {
        total_businesses: 0,
        cities_count: 0,
        premium_count: 0,
        verified_count: 0,
        cities: []
      };
    }
  }

  /**
   * Increment view count for a business
   */
  static async incrementViewCount(businessId: string): Promise<void> {
    try {
      // Read existing then update via admin client to avoid RLS issues
      const { data: current } = await db.businesses()
        .select('view_count')
        .eq('id', businessId)
        .single();

      const next = (current?.view_count || 0) + 1;

      const { error } = await getAdminDb()
        .businesses()
        .update({ view_count: next })
        .eq('id', businessId);

      if (error) console.error('Error incrementing view count:', error);
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
    }
  }

  /**
   * Increment click count for a business
   */
  static async incrementClickCount(businessId: string): Promise<void> {
    try {
      // Read current count then update with +1 (fallback if no event table available)
      const { data: current } = await db.businesses()
        .select('click_count')
        .eq('id', businessId)
        .single();

      const next = (current?.click_count || 0) + 1;

      const { error } = await getAdminDb()
        .businesses()
        .update({ click_count: next })
        .eq('id', businessId);

      if (error) {
        console.error('Error incrementing click count:', error);
      }
    } catch (error) {
      console.error('Error in incrementClickCount:', error);
    }
  }

  /**
   * Log a click event for analytics (requires business_click_events table)
   */
  static async logBusinessClick(businessId: string, context: { source?: string; city?: string; category?: string } = {}): Promise<void> {
    try {
      const payload = {
        business_id: businessId,
        source: context.source || 'listings',
        city: context.city || null,
        category: context.category || null
      } as any;

      // First try with public client (RLS open per SQL). If it fails, fallback to admin client.
      const { error } = await db.business_click_events().insert(payload);
      if (error) {
        console.warn('Public insert failed, retrying with admin client:', error.message);
        const { error: adminErr } = await getAdminDb().business_click_events().insert(payload);
        if (adminErr) console.error('Admin insert failed for business_click_events:', adminErr.message || adminErr);
      }
    } catch (error) {
      console.error('Error logging business click:', error);
    }
  }

  /**
   * Get sponsored businesses for a specific city/category
   */
  static async getSponsoredBusinesses(
    citySlug?: string,
    categorySlug?: string
  ): Promise<Business[]> {
    try {
      let query = db.businesses()
        .select(`
          *,
          category:categories!businesses_category_id_fkey(id, name, slug, icon),
          city:cities!businesses_city_id_fkey(id, name, country_id),
          country:countries!businesses_country_id_fkey(id, name, code, flag_url),
          reviews:reviews(id, rating, title, content, created_at, status, images)
        `)
        .eq('status', 'active')
        .eq('is_sponsored_ad', true)
        .eq('admin_approved', true);

      // Filter by city if provided
      if (citySlug) {
        query = query.eq('cities.slug', citySlug);
      }

      // Filter by category if provided
      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sponsored businesses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSponsoredBusinesses:', error);
      return [];
    }
  }
}
