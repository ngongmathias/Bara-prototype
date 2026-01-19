import { supabase } from './supabase';

// Supabase Storage functions for event images
export const uploadEventImage = async (file: File, eventId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const randomPart = Math.random().toString(36).slice(2);
  const fileName = `${eventId}/${Date.now()}-${randomPart}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('event-images')
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('event-images')
    .getPublicUrl(fileName);
  // Ensure public path for direct browser access
  const normalizedUrl = publicUrl.includes('/object/public/')
    ? publicUrl
    : publicUrl.replace('/storage/v1/object/', '/storage/v1/object/public/');
  return normalizedUrl;
};

export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  const fileName = imageUrl.split('/').pop();
  const { error } = await supabase.storage
    .from('event-images')
    .remove([fileName]);
    
  if (error) throw error;
};

export const getEventImageUrl = (imagePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('event-images')
    .getPublicUrl(imagePath);
  return publicUrl;
};

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventTicket {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  max_quantity?: number;
  registered_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  organizer_id?: string;
  organizer_name?: string;
  organizer_handle?: string;
  organizer_email?: string;
  organizer_phone?: string;
  country_id?: string;
  city_id?: string;
  venue?: string;
  venue_name?: string;
  venue_address?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  start_date: string;
  end_date: string;
  images?: string[];
  event_image_url?: string;
  event_images?: string[];
  category?: string;
  event_category_id?: string;
  tags?: string[];
  is_featured: boolean;
  event_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_public: boolean;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  capacity?: number;
  registration_url?: string;
  website_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  view_count: number;
  registration_count: number;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  
  // User tracking fields
  created_by_user_id?: string;
  created_by_email?: string;
  created_by_name?: string;
  
  // Related data
  country_name?: string;
  country_code?: string;
  city_name?: string;
  city_latitude?: number;
  city_longitude?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  tickets?: EventTicket[];
  creator_verification?: any;
}

export interface EventSearchParams {
  search_query?: string;
  country_id?: string;
  city_id?: string;
  category?: string;
  hashtags?: string[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  include_all_statuses?: boolean; // For admin: include completed/cancelled events
}

export interface EventSearchResult {
  events: Event[];
  total_count: number;
  has_more: boolean;
}

export interface City {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  population?: number;
}

export class EventsService {
  private static extractStoragePathFromUrl(url: string): string | null {
    // Accept both public and non-public forms and strip domain prefix
    const marker = '/storage/v1/object/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const path = url.substring(idx + marker.length);
    // expected like: public/event-images/xyz or event-images/xyz
    return path.startsWith('public/') ? path.replace('public/', '') : path;
  }

  // Move any images uploaded under 'temp/' into the event's folder and return updated URLs
  static async finalizeEventImages(eventId: string, imageUrls: string[]): Promise<string[]> {
    if (!imageUrls || imageUrls.length === 0) return [];
    const updated: string[] = [];

    for (const url of imageUrls) {
      try {
        const storagePath = this.extractStoragePathFromUrl(url);
        if (!storagePath) { updated.push(url); continue; }
        // storagePath like: event-images/temp/filename.png or event-images/<eventId>/...
        if (!storagePath.startsWith('event-images/')) { updated.push(url); continue; }
        const objectPath = storagePath.replace('event-images/', '');
        if (!objectPath.startsWith('temp/')) { updated.push(url); continue; }

        const fileName = objectPath.split('/').pop() as string;
        const fromPath = objectPath; // temp/xyz
        const toPath = `${eventId}/${fileName}`;

        // Copy then remove (works across all storage versions)
        const copyRes = await supabase.storage.from('event-images').copy(fromPath, toPath);
        if (copyRes.error) throw copyRes.error;
        await supabase.storage.from('event-images').remove([fromPath]);

        const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(toPath);
        const normalizedUrl = publicUrl.includes('/object/public/')
          ? publicUrl
          : publicUrl.replace('/storage/v1/object/', '/storage/v1/object/public/');
        updated.push(normalizedUrl);
      } catch (e) {
        console.error('finalizeEventImages error for', url, e);
        updated.push(url); // fallback to original url
      }
    }

    return updated;
  }
  // Get all event categories
  static async getEventCategories(): Promise<EventCategory[]> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event categories:', error);
      throw error;
    }
  }

  // Get cities by country
  static async getCitiesByCountry(countryId: string): Promise<City[]> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, latitude, longitude, population')
        .eq('country_id', countryId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cities by country:', error);
      throw error;
    }
  }

  // Search events with filters
  static async searchEvents(params: EventSearchParams = {}): Promise<EventSearchResult> {
    try {
      const {
        search_query,
        country_id,
        city_id,
        category,
        hashtags,
        start_date,
        end_date,
        limit = 20,
        offset = 0,
        include_all_statuses = false
      } = params;

      console.log('🔧 [EventsService.searchEvents] Parameters:', {
        include_all_statuses,
        limit,
        offset,
        has_filters: !!(search_query || country_id || city_id || category)
      });

      // Build the query without foreign key relationships
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_public', true);
      
      // Only filter by status if not including all statuses (for public-facing pages)
      if (!include_all_statuses) {
        console.log('⚠️ Filtering by status: upcoming, ongoing only');
        query = query.in('event_status', ['upcoming', 'ongoing']);
      } else {
        console.log('✅ Including ALL statuses (no filter)');
      }
      
      query = query
        .order('start_date', { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (search_query) {
        query = query.or(`title.ilike.%${search_query}%,description.ilike.%${search_query}%,venue_name.ilike.%${search_query}%,organizer_name.ilike.%${search_query}%`);
      }

      if (country_id) {
        query = query.eq('country_id', country_id);
      }

      if (city_id) {
        query = query.eq('city_id', city_id);
      }

      if (category) {
        query = query.eq('category', category);
      }

      // Add hashtag filtering
      if (hashtags && hashtags.length > 0) {
        query = query.overlaps('tags', hashtags);
      }

      if (start_date) {
        query = query.gte('start_date', start_date);
      }

      if (end_date) {
        query = query.lte('end_date', end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get total count separately to avoid any potential issues
      let totalCount = 0;
      try {
        let countQuery = supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('is_public', true);
        
        // Only filter by status if not including all statuses
        if (!include_all_statuses) {
          countQuery = countQuery.in('event_status', ['upcoming', 'ongoing']);
        }

        // Apply the same filters for count
        if (search_query) {
          countQuery.or(`title.ilike.%${search_query}%,description.ilike.%${search_query}%,venue_name.ilike.%${search_query}%,organizer_name.ilike.%${search_query}%`);
        }
        if (country_id) {
          countQuery.eq('country_id', country_id);
        }
        if (city_id) {
          countQuery.eq('city_id', city_id);
        }
        if (category) {
          countQuery.eq('category', category);
        }
        if (start_date) {
          countQuery.gte('start_date', start_date);
        }
        if (end_date) {
          countQuery.lte('end_date', end_date);
        }

        const { count } = await countQuery;
        totalCount = count || 0;
      } catch (countError) {
        console.warn('Error getting count:', countError);
        totalCount = data?.length || 0;
      }

      // Get related data in batches to avoid N+1 queries
      const events: Event[] = [];
      
      if (data && data.length > 0) {
        // Get unique IDs
        const countryIds = [...new Set(data.map(e => e.country_id).filter(Boolean))];
        const cityIds = [...new Set(data.map(e => e.city_id).filter(Boolean))];
        const categorySlugs = [...new Set(data.map(e => e.category).filter(Boolean))];

        // Batch fetch all related data
        const [countriesResult, citiesResult, categoriesResult] = await Promise.all([
          countryIds.length > 0 
            ? supabase.from('countries').select('id, name, code').in('id', countryIds)
            : Promise.resolve({ data: [] }),
          cityIds.length > 0
            ? supabase.from('cities').select('id, name, latitude, longitude').in('id', cityIds)
            : Promise.resolve({ data: [] }),
          categorySlugs.length > 0
            ? supabase.from('event_categories').select('slug, name, icon, color').in('slug', categorySlugs)
            : Promise.resolve({ data: [] })
        ]);

        // Create lookup maps
        const countriesMap = new Map((countriesResult.data || []).map(c => [c.id, c]));
        const citiesMap = new Map((citiesResult.data || []).map(c => [c.id, c]));
        const categoriesMap = new Map((categoriesResult.data || []).map(c => [c.slug, c]));

        // Map events with related data
        for (const event of data) {
          const country = countriesMap.get(event.country_id);
          const city = citiesMap.get(event.city_id);
          const category = categoriesMap.get(event.category);

          events.push({
            ...event,
            country_name: country?.name,
            country_code: country?.code,
            city_name: city?.name,
            city_latitude: city?.latitude,
            city_longitude: city?.longitude,
            category_name: category?.name,
            category_icon: category?.icon,
            category_color: category?.color,
          });
        }
      }

      return {
        events,
        total_count: totalCount,
        has_more: (offset + limit) < totalCount
      };
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  // Get events by country
  static async getEventsByCountry(countryId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('country_id', countryId)
        .eq('is_public', true)
        .in('event_status', ['upcoming', 'ongoing'])
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Get related data separately
      const events: Event[] = [];
      
      for (const event of data || []) {
        let countryData = null;
        let cityData = null;
        let categoryData = null;

        if (event.country_id) {
          const { data: country } = await supabase
            .from('countries')
            .select('name, code')
            .eq('id', event.country_id)
            .single();
          countryData = country;
        }

        if (event.city_id) {
          const { data: city } = await supabase
            .from('cities')
            .select('name, latitude, longitude')
            .eq('id', event.city_id)
            .single();
          cityData = city;
        }

        if (event.category) {
          const { data: category } = await supabase
            .from('event_categories')
            .select('name, icon, color')
            .eq('slug', event.category)
            .single();
          categoryData = category;
        }

        events.push({
          ...event,
          country_name: countryData?.name,
          country_code: countryData?.code,
          city_name: cityData?.name,
          city_latitude: cityData?.latitude,
          city_longitude: cityData?.longitude,
          category_name: categoryData?.name,
          category_icon: categoryData?.icon,
          category_color: categoryData?.color,
        });
      }

      return events;
    } catch (error) {
      console.error('Error fetching events by country:', error);
      throw error;
    }
  }

  // Get single event by ID
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Get related data separately
      let countryData = null;
      let cityData = null;
      let categoryData = null;
      let ticketsData = null;

      if (data.country_id) {
        const { data: country } = await supabase
          .from('countries')
          .select('name, code')
          .eq('id', data.country_id)
          .single();
        countryData = country;
      }

      if (data.city_id) {
        const { data: city } = await supabase
          .from('cities')
          .select('name, latitude, longitude')
          .eq('id', data.city_id)
          .single();
        cityData = city;
      }

      if (data.category) {
        const { data: category } = await supabase
          .from('event_categories')
          .select('name, icon, color')
          .eq('slug', data.category)
          .single();
        categoryData = category;
      }

      // Get tickets
      const { data: tickets } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId);
      ticketsData = tickets || [];

      return {
        ...data,
        country_name: countryData?.name,
        country_code: countryData?.code,
        city_name: cityData?.name,
        city_latitude: cityData?.latitude,
        city_longitude: cityData?.longitude,
        category_name: categoryData?.name,
        category_icon: categoryData?.icon,
        category_color: categoryData?.color,
        tickets: ticketsData
      };
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      throw error;
    }
  }

  // Create new event
  static async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      console.log('Creating event with data:', eventData);
      
      // Remove hashtags field as it doesn't exist in the database schema
      const { hashtags, ...cleanEventData } = eventData as any;
      
      const { data, error } = await supabase
        .from('events')
        .insert([cleanEventData])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Event created successfully:', data);

      // Get related data separately to avoid foreign key issues
      let countryData = null;
      let cityData = null;
      let categoryData = null;

      if (data.country_id) {
        const { data: country } = await supabase
          .from('countries')
          .select('name, code')
          .eq('id', data.country_id)
          .single();
        countryData = country;
      }

      if (data.city_id) {
        const { data: city } = await supabase
          .from('cities')
          .select('name, latitude, longitude')
          .eq('id', data.city_id)
          .single();
        cityData = city;
      }

      if (data.category) {
        const { data: category } = await supabase
          .from('event_categories')
          .select('name, icon, color')
          .eq('slug', data.category)
          .single();
        categoryData = category;
      }

      return {
        ...data,
        country_name: countryData?.name,
        country_code: countryData?.code,
        city_name: cityData?.name,
        city_latitude: cityData?.latitude,
        city_longitude: cityData?.longitude,
        category_name: categoryData?.name,
        category_icon: categoryData?.icon,
        category_color: categoryData?.color,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update event
  static async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    try {
      // Remove hashtags field as it doesn't exist in the database schema
      const { hashtags, ...cleanEventData } = eventData as any;
      
      const { data, error } = await supabase
        .from('events')
        .update(cleanEventData)
        .eq('id', eventId)
        .select('*')
        .single();

      if (error) throw error;

      // Get related data separately
      let countryData = null;
      let cityData = null;
      let categoryData = null;

      if (data.country_id) {
        const { data: country } = await supabase
          .from('countries')
          .select('name, code')
          .eq('id', data.country_id)
          .single();
        countryData = country;
      }

      if (data.city_id) {
        const { data: city } = await supabase
          .from('cities')
          .select('name, latitude, longitude')
          .eq('id', data.city_id)
          .single();
        cityData = city;
      }

      if (data.category) {
        const { data: category } = await supabase
          .from('event_categories')
          .select('name, icon, color')
          .eq('slug', data.category)
          .single();
        categoryData = category;
      }

      return {
        ...data,
        country_name: countryData?.name,
        country_code: countryData?.code,
        city_name: cityData?.name,
        city_latitude: cityData?.latitude,
        city_longitude: cityData?.longitude,
        category_name: categoryData?.name,
        category_icon: categoryData?.icon,
        category_color: categoryData?.color,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete event
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Create event tickets
  static async createEventTickets(eventId: string, tickets: Omit<EventTicket, 'id' | 'event_id' | 'created_at' | 'updated_at'>[]): Promise<EventTicket[]> {
    try {
      const ticketData = tickets.map(ticket => ({
        ...ticket,
        event_id: eventId
      }));

      const { data, error } = await supabase
        .from('event_tickets')
        .insert(ticketData)
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating event tickets:', error);
      throw error;
    }
  }

  // Update event tickets
  static async updateEventTickets(eventId: string, tickets: EventTicket[]): Promise<EventTicket[]> {
    try {
      // First, delete existing tickets
      await supabase
        .from('event_tickets')
        .delete()
        .eq('event_id', eventId);

      // Then insert new tickets
      const ticketData = tickets.map(ticket => ({
        ...ticket,
        event_id: eventId
      }));

      const { data, error } = await supabase
        .from('event_tickets')
        .insert(ticketData)
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error updating event tickets:', error);
      throw error;
    }
  }

  // Increment event view count
  static async incrementEventViewCount(eventId: string): Promise<void> {
    try {
      // First get the current view count
      const { data: eventData, error: fetchError } = await supabase
        .from('events')
        .select('view_count')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // Then update with incremented value
      const { error } = await supabase
        .from('events')
        .update({ view_count: (eventData?.view_count || 0) + 1 })
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing event view count:', error);
      throw error;
    }
  }

  // Get featured events
  static async getFeaturedEvents(limit: number = 6): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_featured', true)
        .eq('is_public', true)
        .in('event_status', ['upcoming', 'ongoing'])
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Get related data separately
      const events: Event[] = [];
      
      for (const event of data || []) {
        let countryData = null;
        let cityData = null;
        let categoryData = null;

        if (event.country_id) {
          const { data: country } = await supabase
            .from('countries')
            .select('name, code')
            .eq('id', event.country_id)
            .single();
          countryData = country;
        }

        if (event.city_id) {
          const { data: city } = await supabase
            .from('cities')
            .select('name, latitude, longitude')
            .eq('id', event.city_id)
            .single();
          cityData = city;
        }

        if (event.category) {
          const { data: category } = await supabase
            .from('event_categories')
            .select('name, icon, color')
            .eq('slug', event.category)
            .single();
          categoryData = category;
        }

        events.push({
          ...event,
          country_name: countryData?.name,
          country_code: countryData?.code,
          city_name: cityData?.name,
          city_latitude: cityData?.latitude,
          city_longitude: cityData?.longitude,
          category_name: categoryData?.name,
          category_icon: categoryData?.icon,
          category_color: categoryData?.color,
        });
      }

      return events;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .eq('event_status', 'upcoming')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Get related data separately
      const events: Event[] = [];
      
      for (const event of data || []) {
        let countryData = null;
        let cityData = null;
        let categoryData = null;

        if (event.country_id) {
          const { data: country } = await supabase
            .from('countries')
            .select('name, code')
            .eq('id', event.country_id)
            .single();
          countryData = country;
        }

        if (event.city_id) {
          const { data: city } = await supabase
            .from('cities')
            .select('name, latitude, longitude')
            .eq('id', event.city_id)
            .single();
          cityData = city;
        }

        if (event.category) {
          const { data: category } = await supabase
            .from('event_categories')
            .select('name, icon, color')
            .eq('slug', event.category)
            .single();
          categoryData = category;
        }

        events.push({
          ...event,
          country_name: countryData?.name,
          country_code: countryData?.code,
          city_name: cityData?.name,
          city_latitude: cityData?.latitude,
          city_longitude: cityData?.longitude,
          category_name: categoryData?.name,
          category_icon: categoryData?.icon,
          category_color: categoryData?.color,
        });
      }

      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  // Get trending hashtags
  static async getTrendingHashtags(limit: number = 10): Promise<{ hashtag: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_hashtags', { limit_count: limit });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      throw error;
    }
  }

  // Search events by hashtags
  static async searchEventsByHashtags(hashtags: string[]): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_events_by_hashtags', { search_hashtags: hashtags });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching events by hashtags:', error);
      throw error;
    }
  }

  // Get hashtag suggestions based on category and location
  static async getHashtagSuggestions(category?: string, cityName?: string): Promise<string[]> {
    try {
      const suggestions = new Set<string>();

      // Add category-based suggestions
      if (category) {
        suggestions.add(category.toLowerCase());
      }

      // Add city-based suggestions  
      if (cityName) {
        suggestions.add(cityName.toLowerCase().replace(/\s+/g, ''));
      }

      // Get trending hashtags from database
      const trending = await this.getTrendingHashtags(20);
      trending.forEach(item => suggestions.add(item.hashtag));

      return Array.from(suggestions);
    } catch (error) {
      console.error('Error getting hashtag suggestions:', error);
      return [];
    }
  }

  // User verification methods
  static async getUserVerificationStatus(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_verification_status', { user_id_param: userId });
      
      if (error) throw error;
      
      // Convert array to object
      const verificationStatus = {
        email: false,
        phone: false,
        business: false,
        trusted_organizer: false
      };
      
      data?.forEach((verification: any) => {
        verificationStatus[verification.verification_type as keyof typeof verificationStatus] = verification.is_verified;
      });
      
      return verificationStatus;
    } catch (error) {
      console.error('Error getting user verification status:', error);
      return {
        email: false,
        phone: false,
        business: false,
        trusted_organizer: false
      };
    }
  }

  static async createUserVerification(userId: string, verificationType: string, verificationData?: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_verifications')
        .insert({
          user_id: userId,
          verification_type: verificationType,
          is_verified: true,
          verified_at: new Date().toISOString(),
          verification_data: verificationData
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating user verification:', error);
      throw error;
    }
  }

  // Automatically create email verification for Clerk users (they have verified emails)
  static async ensureEmailVerification(userId: string, email: string): Promise<void> {
    try {
      // Check if email verification already exists
      const { data: existing } = await supabase
        .from('user_verifications')
        .select('id')
        .eq('user_id', userId)
        .eq('verification_type', 'email')
        .single();

      if (!existing) {
        await this.createUserVerification(userId, 'email', { email });
      }
    } catch (error) {
      console.error('Error ensuring email verification:', error);
    }
  }

  // Update Event interface to include user tracking
  static async createUserEvent(eventData: any, userId: string, userEmail: string, userName: string): Promise<Event> {
    try {
      // Ensure email verification exists for the user
      await this.ensureEmailVerification(userId, userEmail);

      // Create event with user tracking
      const event = await this.createEvent({
        ...eventData,
        created_by_user_id: userId,
        created_by_email: userEmail,
        created_by_name: userName,
      });

      return event;
    } catch (error) {
      console.error('Error creating user event:', error);
      throw error;
    }
  }

  // Get events with creator verification status
  static async getEventsWithCreatorInfo(params: EventSearchParams = {}): Promise<Event[]> {
    try {
      const events = await this.searchEvents(params);
      
      // Get unique user IDs from events that have creators
      const userIds = [...new Set(
        events.events
          .filter(event => event.created_by_user_id)
          .map(event => event.created_by_user_id)
      )].filter(Boolean) as string[];

      // Get verification status for all creators
      const verificationPromises = userIds.map(userId => 
        this.getUserVerificationStatus(userId).then(verification => ({
          userId,
          verification
        }))
      );
      
      const verifications = await Promise.all(verificationPromises);
      const verificationMap = new Map(
        verifications.map(v => [v.userId, v.verification])
      );

      // Add creator verification info to events
      const eventsWithCreatorInfo = events.events.map(event => ({
        ...event,
        creator_verification: event.created_by_user_id 
          ? verificationMap.get(event.created_by_user_id) 
          : null
      }));

      return eventsWithCreatorInfo;
    } catch (error) {
      console.error('Error getting events with creator info:', error);
      throw error;
    }
  }
}

export default EventsService;
