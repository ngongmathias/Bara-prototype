import { useState, useEffect, useCallback } from 'react';
import { EventsService, Event, EventSearchParams, EventSearchResult, EventCategory, City } from '@/lib/eventsService';
import { db } from '@/lib/supabase';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEvents = useCallback(async (params: EventSearchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await EventsService.searchEvents(params);
      setEvents(result.events);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search events';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventsByCountry = useCallback(async (countryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const countryEvents = await EventsService.getEventsByCountry(countryId);
      setEvents(countryEvents);
      return countryEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events by country';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeaturedEvents = useCallback(async (limit: number = 6) => {
    setLoading(true);
    setError(null);
    
    try {
      const featuredEvents = await EventsService.getFeaturedEvents(limit);
      setEvents(featuredEvents);
      return featuredEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch featured events';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUpcomingEvents = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const upcomingEvents = await EventsService.getUpcomingEvents(limit);
      setEvents(upcomingEvents);
      return upcomingEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming events';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    searchEvents,
    getEventsByCountry,
    getFeaturedEvents,
    getUpcomingEvents,
    setEvents
  };
};

export const useEvent = (eventId: string | null) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const eventData = await EventsService.getEventById(id);
      setEvent(eventData);
      return eventData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const incrementViewCount = useCallback(async (id: string) => {
    try {
      await EventsService.incrementEventViewCount(id);
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  return {
    event,
    loading,
    error,
    fetchEvent,
    incrementViewCount
  };
};

export const useEventCategories = () => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const categoriesData = await EventsService.getEventCategories();
      // Sort categories alphabetically by name
      const sortedCategories = categoriesData.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setCategories(sortedCategories);
      return sortedCategories;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event categories';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories
  };
};

export const useCitiesByCountry = (countryId: string | null) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const citiesData = await EventsService.getCitiesByCountry(id);
      setCities(citiesData);
      return citiesData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cities';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (countryId) {
      fetchCities(countryId);
    } else {
      setCities([]);
    }
  }, [countryId, fetchCities]);

  return {
    cities,
    loading,
    error,
    fetchCities
  };
};

export const useEventManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(async (eventData: Partial<Event>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newEvent = await EventsService.createEvent(eventData);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedEvent = await EventsService.updateEvent(eventId, eventData);
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await EventsService.deleteEvent(eventId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEventTickets = useCallback(async (eventId: string, tickets: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTickets = await EventsService.updateEventTickets(eventId, tickets);
      return updatedTickets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event tickets';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventTickets
  };
};

// Hook for fetching countries
export const useCountries = () => {
  const [countries, setCountries] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await db.countries()
        .select('id, name, code')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch countries';
      setError(errorMessage);
      console.error('Error fetching countries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries
  };
};
