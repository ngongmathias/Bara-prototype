import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { DiscoverMore } from '@/components/DiscoverMore';
import { EventCard } from "@/components/EventCard";
import { EventGalleryModal } from "@/components/EventGalleryModal";
import { ScrollReveal, SkeletonCard } from "@/components/animations";
import { FullscreenMapModal } from "@/components/FullscreenMapModal";
import { InteractiveEventsMap } from "@/components/InteractiveEventsMap";
import { EventDetail } from "@/components/EventDetail";
import { trackRecent } from "@/lib/recentActivity";
import { SimilarEvents } from "@/components/SimilarEvents";
import { TicketPurchaseModal } from "@/components/TicketPurchaseModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, ArrowLeft, CalendarDays, ArrowUpDown, X, Hash, Maximize2, LayoutGrid, Share2, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents, useEventCategories } from '@/hooks/useEvents';
import { EventsService } from '@/lib/eventsService';
import { Event as DatabaseEvent } from '@/lib/eventsService';
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { useUser, useAuth } from '@clerk/clerk-react';
import { InterestPicker } from '@/components/events/InterestPicker';
import { MonetizationService } from '@/lib/monetizationService';
import { useToast } from '@/hooks/use-toast';
import { useShare } from '@/context/ShareContext';
import { SectionNavButton } from '@/components/SectionNavButton';
import { EmptyState } from '@/components/EmptyState';

export const EventsPage = () => {
  const navigate = useNavigate();
  const { '*': splatParam } = useParams();
  const { toast } = useToast();
  const { openShare } = useShare();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedEvent, setSelectedEvent] = useState<DatabaseEvent | null>(null);
  const [activeEventsPage, setActiveEventsPage] = useState(1);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapEvents, setMapEvents] = useState<any[]>([]);
  const [selectedEventForMap, setSelectedEventForMap] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [showFilters, setShowFilters] = useState(false); // Mobile filters collapsed by default
  const [timeFilter, setTimeFilter] = useState<'all' | 'active' | 'happening' | 'today' | 'tomorrow' | 'weekend'>('all');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedGalleryEvent, setSelectedGalleryEvent] = useState<DatabaseEvent | null>(null);
  const [urlCountryFilter, setUrlCountryFilter] = useState<string | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketModalEvent, setTicketModalEvent] = useState<DatabaseEvent | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<DatabaseEvent[]>([]);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();

  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Helper function to format event date for display
  const formatEventDate = (startDate: string, endDate: string) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start && !end) return 'TBD';
    if (start && !end) return start.toLocaleDateString();
    if (!start && end) return end.toLocaleDateString();
    const isSameDay = start!.toDateString() === end!.toDateString();

    if (isSameDay) {
      return start!.toLocaleDateString();
    } else {
      // Multi-day event - show date range
      return `${start!.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  // Helper function to format event time for display
  const formatEventTime = (startDate: string, endDate: string) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start && !end) return '';
    if (start && !end) return start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!start && end) return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSameDay = start!.toDateString() === end!.toDateString();

    if (isSameDay) {
      return `${start!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Multi-day event - show opening time
      return `Opens ${start!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Use real data from database — server-side pagination
  const { searchEvents } = useEvents();
  const [activeEvents, setActiveEvents] = useState<DatabaseEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<DatabaseEvent[]>([]);
  const [activeEventsTotal, setActiveEventsTotal] = useState(0);
  const [pastEventsTotal, setPastEventsTotal] = useState(0);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingPast, setLoadingPast] = useState(false);
  const eventsPerSection = 12;
  const { categories } = useEventCategories();
  const { selectedCountry } = useCountrySelection();

  // Debounced search query — avoids firing a query on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Check URL for country parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const countryParam = urlParams.get('country');
    if (countryParam) {
      setUrlCountryFilter(countryParam);
    }
  }, []);

  // Build shared query params from current filter state
  const buildQueryParams = useCallback(() => {
    const params: any = {
      country_id: selectedCountry?.id,
      include_all_statuses: true,
    };
    if (debouncedSearch.trim()) {
      params.search_query = debouncedSearch.trim();
    }
    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }
    if (sortBy) {
      params.sort_by = sortBy;
    }
    // Map the time filter for specific sub-filters (today, tomorrow, weekend, happening)
    if (timeFilter && timeFilter !== 'all' && timeFilter !== 'active') {
      params.time_filter = timeFilter;
    }
    return params;
  }, [selectedCountry, debouncedSearch, selectedCategory, startDate, endDate, sortBy, timeFilter]);

  // Load active (upcoming/ongoing) events
  const loadActiveEvents = useCallback(async (page: number) => {
    setLoadingActive(true);
    try {
      const params = buildQueryParams();
      params.time_filter = (timeFilter === 'all' || timeFilter === 'active') ? 'active' : timeFilter;
      params.limit = eventsPerSection;
      params.offset = (page - 1) * eventsPerSection;
      const result = await EventsService.searchEvents(params);
      setActiveEvents(result.events);
      setActiveEventsTotal(result.total_count);
    } catch (err) {
      console.error('Error loading active events:', err);
    } finally {
      setLoadingActive(false);
    }
  }, [buildQueryParams, timeFilter, eventsPerSection]);

  // Load past events
  const loadPastEvents = useCallback(async (page: number) => {
    setLoadingPast(true);
    try {
      const params = buildQueryParams();
      params.time_filter = 'past';
      params.limit = eventsPerSection;
      params.offset = (page - 1) * eventsPerSection;
      const result = await EventsService.searchEvents(params);
      setPastEvents(result.events);
      setPastEventsTotal(result.total_count);
    } catch (err) {
      console.error('Error loading past events:', err);
    } finally {
      setLoadingPast(false);
    }
  }, [buildQueryParams, eventsPerSection]);

  // Reload both sections when filters change
  useEffect(() => {
    setActiveEventsPage(1);
    setPastEventsPage(1);
    loadActiveEvents(1);
    loadPastEvents(1);
  }, [selectedCountry, debouncedSearch, selectedCategory, startDate, endDate, sortBy, timeFilter]);

  // Reload active events when its page changes
  useEffect(() => {
    loadActiveEvents(activeEventsPage);
  }, [activeEventsPage]);

  // Reload past events when its page changes
  useEffect(() => {
    loadPastEvents(pastEventsPage);
  }, [pastEventsPage]);

  // Server-side pagination totals
  const activeEventsTotalPages = Math.ceil(activeEventsTotal / eventsPerSection);
  const pastEventsTotalPages = Math.ceil(pastEventsTotal / eventsPerSection);

  // Combined list of currently loaded events (for map, gallery, event lookup)
  const allLoadedEvents = [...activeEvents, ...pastEvents];


  const handleViewEvent = (event: DatabaseEvent) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  const handleViewGallery = (eventId: string) => {
    const event = allLoadedEvents.find(e => e.id === eventId);
    if (event && event.event_images && event.event_images.length > 0) {
      setSelectedGalleryEvent(event);
      setGalleryModalOpen(true);
    }
  };

  // Generate country-specific shareable link
  const getCountrySpecificLink = (countryName?: string) => {
    const baseUrl = window.location.origin;
    if (!countryName) {
      return `${baseUrl}/events`;
    }
    return `${baseUrl}/events?country=${encodeURIComponent(countryName.toLowerCase())}`;
  };

  // Open share dialog for country-specific events page
  const handleCopyCountryLink = (countryName?: string) => {
    openShare({
      url: getCountrySpecificLink(countryName),
      title: `Events in ${countryName || 'Africa'} — Bara Afrika`,
      description: `Discover upcoming events and experiences${countryName ? ` in ${countryName}` : ' across Africa'}.`,
    });
  };

  const handleLocationClick = async (eventId: string, city?: string) => {
    const clickedEvent = allLoadedEvents.find(e => e.id === eventId);
    if (!clickedEvent) return;

    // Get ALL events with valid coordinates from the database
    const eventsWithCoords = allLoadedEvents.filter(e =>
      ((e.latitude && e.longitude) || (e.venue_latitude && e.venue_longitude))
    );

    // Map to the format expected by InteractiveEventsMap
    const mappedEvents = eventsWithCoords.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      venue: e.venue_name || e.venue_address || '',
      latitude: e.latitude || e.venue_latitude || 0,
      longitude: e.longitude || e.venue_longitude || 0,
      event_date: e.start_date,
      image_url: e.event_image_url,
      city: e.city_name,
    }));

    setMapEvents(mappedEvents);
    setSelectedEventForMap(eventId);
    setMapModalOpen(true);
  };

  // Get ALL events with coordinates for event detail map
  const getAllEventsForMap = (currentEvent: DatabaseEvent) => {
    // Get ALL events with valid coordinates from the database
    const eventsWithCoords = allLoadedEvents.filter(e =>
      e.id !== currentEvent.id && // Exclude current event to add it first
      ((e.latitude && e.longitude) || (e.venue_latitude && e.venue_longitude))
    );

    return [
      // Include current event first (will be shown with red marker)
      {
        id: currentEvent.id,
        title: currentEvent.title,
        description: currentEvent.description,
        venue: currentEvent.venue_name || currentEvent.venue_address || '',
        latitude: currentEvent.latitude || currentEvent.venue_latitude || 0,
        longitude: currentEvent.longitude || currentEvent.venue_longitude || 0,
        event_date: currentEvent.start_date,
        image_url: currentEvent.event_image_url,
        city: currentEvent.city_name,
      },
      // Add ALL other events with coordinates (shown with blue markers)
      ...eventsWithCoords.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        venue: e.venue_name || e.venue_address || '',
        latitude: e.latitude || e.venue_latitude || 0,
        longitude: e.longitude || e.venue_longitude || 0,
        event_date: e.start_date,
        image_url: e.event_image_url,
        city: e.city_name,
      }))
    ];
  };

  // Track impressions for primary events shown
  useEffect(() => {
    if (activeEvents.length > 0) {
      const activePremium = activeEvents.filter(e => e.is_premium);
      activePremium.forEach(event => {
        MonetizationService.trackInteraction(event.id, 'event', 'impression');
      });
    }
  }, [activeEventsPage]); // Track on page change

  // Handle direct URL access to event details (e.g. /events/<uuid>)
  // Runs once on mount + when events first load
  const directEventHandled = React.useRef(false);
  useEffect(() => {
    if (directEventHandled.current) return;
    const urlEventId = splatParam || window.location.pathname.split('/events/')[1];
    if (!urlEventId || urlEventId === '') {
      setInitialLoadDone(true);
      directEventHandled.current = true;
      return;
    }

    // First check if the event is already in the loaded list
    if (allLoadedEvents.length > 0) {
      const found = allLoadedEvents.find(e => e.id === urlEventId);
      if (found) {
        setSelectedEvent(found);
        setInitialLoadDone(true);
        directEventHandled.current = true;
        return;
      }
    }

    // Event not in filtered list — fetch directly by ID (works across all countries)
    let cancelled = false;
    const fetchDirectEvent = async () => {
      try {
        const eventData = await EventsService.getEventById(urlEventId);
        if (!cancelled && eventData) {
          setSelectedEvent(eventData);
        }
      } catch (err) {
        console.error('Failed to fetch event by ID:', err);
      } finally {
        if (!cancelled) {
          setInitialLoadDone(true);
          directEventHandled.current = true;
        }
      }
    };
    fetchDirectEvent();
    return () => { cancelled = true; };
  }, [allLoadedEvents, splatParam]);

  // Fetch interest-based recommendations
  useEffect(() => {
    if (!clerkUser?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token || cancelled) return;
        const client = await createAuthenticatedSupabaseClient(token);
        const { data: interests } = await client
          .from('user_interests')
          .select('category_slug')
          .eq('user_id', clerkUser.id);
        if (!interests || interests.length === 0 || cancelled) return;
        const slugs = new Set(interests.map(i => i.category_slug));
        const matching = activeEvents.filter(e =>
          e.category && slugs.has(e.category)
        ).slice(0, 8);
        if (!cancelled) setRecommendedEvents(matching);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [clerkUser?.id, activeEvents]);

  // Update URL when viewing event details (only after initial load to prevent premature redirect)
  useEffect(() => {
    if (!initialLoadDone) return;
    if (selectedEvent) {
      window.history.replaceState(null, '', `/events/${selectedEvent.id}`);
      trackRecent({
        id: selectedEvent.id,
        kind: 'event',
        title: selectedEvent.title,
        subtitle: selectedEvent.venue_name || selectedEvent.city_name || undefined,
        imageUrl: selectedEvent.event_image_url || (selectedEvent.event_images && selectedEvent.event_images[0]),
        href: `/events/${selectedEvent.id}`,
      });
    } else {
      window.history.replaceState(null, '', '/events');
    }
  }, [selectedEvent, initialLoadDone]);

  const eventSchema = selectedEvent ? {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": selectedEvent.title,
    "startDate": selectedEvent.start_date,
    "endDate": selectedEvent.end_date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": selectedEvent.venue_name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": selectedEvent.city_name,
        "addressCountry": selectedEvent.country_name
      }
    },
    "image": selectedEvent.event_image_url || (selectedEvent.event_images && selectedEvent.event_images[0]),
    "description": selectedEvent.description,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "price": selectedEvent.entry_fee,
      "priceCurrency": selectedEvent.currency || "GHS",
      "availability": "https://schema.org/InStock"
    }
  } : undefined;

  const getEventPriceDisplay = (eventObj: DatabaseEvent) => {
    if (eventObj.is_free) return 'Free';
    const activeTickets = (eventObj.tickets || []).filter((t: any) => t.is_active !== false);
    if (activeTickets.length === 0) return undefined;

    const prices = activeTickets.map((t: any) => t.price ? Number(t.price) : 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const currSymbol = eventObj.currency === 'USD' ? '$' : eventObj.currency === 'EUR' ? '€' : eventObj.currency === 'GBP' ? '£' : '';
    const formatStr = (p: number) => {
      const str = p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return currSymbol ? `${currSymbol}${str}` : `${str} ${eventObj.currency || ''}`;
    };

    if (minPrice === maxPrice && minPrice > 0) return formatStr(minPrice);
    if (minPrice < maxPrice) {
      if (minPrice === 0) return `Free - ${formatStr(maxPrice)}`;
      return `From ${formatStr(minPrice)}`;
    }
    return undefined;
  };

  // Selected event view
  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO
          title={`${selectedEvent.title} | Events`}
          description={selectedEvent.description?.substring(0, 160)}
          image={selectedEvent.event_image_url || (selectedEvent.event_images && selectedEvent.event_images[0])}
          type="event"
          schemaData={eventSchema}
        />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <EventDetail
            event={selectedEvent}
            onBack={handleBackToList}
            onRegister={(event) => {
              setTicketModalEvent(event);
              setTicketModalOpen(true);
            }}
          />
          <SimilarEvents
            events={allLoadedEvents}
            currentEvent={selectedEvent}
            onEventClick={(event) => {
              setSelectedEvent(event);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          {/* Ticket Purchase Modal */}
          {ticketModalEvent && (
            <TicketPurchaseModal
              isOpen={ticketModalOpen}
              onClose={() => {
                setTicketModalOpen(false);
                setTicketModalEvent(null);
              }}
              event={ticketModalEvent}
            />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <SEO
        title="Bara Events"
        description="Discover upcoming events in Africa. Concerts, festivals, business conferences, and more on Bara Afrika."
        keywords={['Africa', 'Events', 'Concerts', 'Conferences', 'Festivals']}
      />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Top Banner Ad */}
      <div className="relative z-10">
        <TopBannerAd />
      </div>

      {/* Page Title */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-comfortaa font-bold text-black text-center">
          BARA Events
        </h1>
      </div>

      {/* Main Content - All floating together */}
      <div className="relative z-10 flex flex-col lg:flex-row">
        {/* Left Sidebar - Filters (scrolls with page, not sticky) */}
        <aside className="w-full lg:w-96 border-r border-gray-200">
          <div className="p-4 lg:p-8">
            {/* Mobile: Collapsible Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg font-bold text-gray-900">Filters & Search</span>
              <Filter className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop: Always show title */}
            <h2 className="hidden lg:block text-3xl font-bold text-gray-900 mb-8">Filters</h2>

            {/* Filters Content - Collapsible on mobile, always visible on desktop */}
            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div className="space-y-4">
                <label className="text-base font-bold text-gray-900 uppercase tracking-wide">Search Events</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, venue, or hashtag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
              </div>

              {/* Categories - Pill Buttons like Sinc */}
              <div className="space-y-4">
                <label className="text-base font-bold text-gray-900 uppercase tracking-wide">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.slug
                        ? 'bg-black text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-4">
                <label className="text-base font-bold text-gray-900 uppercase tracking-wide">Date Range</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                      placeholder="From date"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                      placeholder="To date"
                    />
                  </div>
                </div>
              </div>

              {/* Organizers - Grid with Profile Pictures like Sinc */}
              <div className="space-y-4">
                <label className="text-base font-bold text-gray-900 uppercase tracking-wide">Organizers</label>
                <div className="grid grid-cols-2 gap-3">
                  {[...new Set(allLoadedEvents.map(e => e.organizer_name).filter(Boolean))].slice(0, 20).map((organizer, idx) => (
                    <label key={idx} className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mt-1 text-black focus:ring-black rounded"
                      />
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-lg mb-1">
                          {organizer.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-700 text-center line-clamp-2">{organizer}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-4">
                <label className="text-base font-bold text-gray-900 uppercase tracking-wide">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 text-base border-gray-300 focus:border-black focus:ring-black">
                    <ArrowUpDown className="h-5 w-5 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Earliest First)</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="location">Location (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || selectedCategory !== 'all' || startDate || endDate) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  variant="outline"
                  className="w-full h-12 text-base border-2 border-gray-300 hover:border-black hover:text-black"
                >
                  <X className="w-5 h-5 mr-2" />
                  Clear All Filters
                </Button>
              )}

              {/* Results Count */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-base text-gray-600">
                  Showing <span className="font-bold text-gray-900 text-lg">{activeEventsTotal + pastEventsTotal}</span> events
                </p>
                {(activeEventsTotal + pastEventsTotal) > allLoadedEvents.length && (
                  <p className="text-sm text-gray-500 mt-1">
                    Browse pages to see more events
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side - Events Grid */}
        <main className="flex-1">
          <div className="container mx-auto px-6 py-8">
            {/* Top Bar: Time Filters + Create Event + Reset Filters */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Time-based Filters - Sinc Style */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${timeFilter === 'all'
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setTimeFilter('active')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${timeFilter === 'active'
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setTimeFilter('happening')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${timeFilter === 'happening'
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  Happening
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${timeFilter === 'today'
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter('tomorrow')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${timeFilter === 'tomorrow'
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setTimeFilter('weekend')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${timeFilter === 'weekend'
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  Weekend
                </button>
              </div>

              {/* Right Side: Share Link + Create Event + Reset Filters */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleCopyCountryLink(selectedCountry?.name)}
                  variant="outline"
                  className="px-6 py-2.5 h-auto text-sm font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all"
                  title={`Share events for ${selectedCountry?.name || 'all countries'}`}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share {selectedCountry?.name || 'All'} Events
                </Button>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setStartDate('');
                    setEndDate('');
                    setTimeFilter('all');
                  }}
                  variant="outline"
                  className="px-6 py-2.5 h-auto text-sm font-semibold border-2 border-gray-300 hover:border-black hover:text-black transition-all"
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={() => navigate('/users/dashboard/events')}
                  className="px-6 py-2.5 h-auto text-sm font-semibold bg-black hover:bg-gray-800 text-white shadow-lg transition-all"
                >
                  Create Event
                </Button>
              </div>
            </div>
            {(loadingActive && loadingPast) ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : (
              <>
                {/* View Toggle */}
                <div className="flex justify-end mb-6">
                  <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'grid'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'calendar'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      Calendar
                    </button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <>
                    {(activeEventsTotal + pastEventsTotal) > 0 ? (
                      <>
                        {/* Interest Picker + Recommended */}
                        {clerkUser && (
                          <>
                            {showInterestPicker && (
                              <InterestPicker onDone={() => setShowInterestPicker(false)} />
                            )}
                            {recommendedEvents.length > 0 && (
                              <div className="mb-12">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                                    <p className="text-sm text-gray-500">Based on your interests</p>
                                  </div>
                                  <button
                                    onClick={() => setShowInterestPicker(p => !p)}
                                    className="text-sm text-gray-500 hover:text-gray-900 underline"
                                  >
                                    Edit interests
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                  {recommendedEvents.map(event => (
                                    <div key={event.id} onClick={() => handleViewEvent(event)} className="cursor-pointer">
                                      <EventCard
                                        id={event.id}
                                        title={event.title}
                                        date={formatEventDate(event.start_date, event.end_date)}
                                        time={formatEventTime(event.start_date, event.end_date)}
                                        location={event.city_name ? `${event.city_name}, ${event.country_name}` : event.venue_address || ''}
                                        imageUrl={event.event_image_url || ''}
                                        category={event.category_name || event.category}
                                        hashtags={event.tags || []}
                                        startDate={event.start_date}
                                        endDate={event.end_date}
                                        isFree={event.is_free}
                                        entryFee={event.entry_fee}
                                        priceDisplay={getEventPriceDisplay(event)}
                                        currency={event.currency}
                                        onViewEvent={(id) => {
                                          const ev = allLoadedEvents.find(e => e.id === id);
                                          if (ev) handleViewEvent(ev);
                                        }}
                                        onLocationClick={handleLocationClick}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {recommendedEvents.length === 0 && !showInterestPicker && (
                              <button
                                onClick={() => setShowInterestPicker(true)}
                                className="mb-8 text-sm text-[#1DB954] hover:underline font-medium"
                              >
                                Set your interests for personalized event recommendations
                              </button>
                            )}
                          </>
                        )}

                        {/* Active Events Section */}
                        {activeEvents.length > 0 && (
                          <div className="mb-12">
                            <div className="mb-6">
                              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Active Events
                              </h2>
                              <p className="text-gray-600">
                                Showing {((activeEventsPage - 1) * eventsPerSection) + 1}-{Math.min(activeEventsPage * eventsPerSection, activeEventsTotal)} of {activeEventsTotal} upcoming and ongoing events
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {activeEvents.map((event, index) => (
                                <div
                                  key={event.id}
                                  onClick={() => handleViewEvent(event)}
                                  className="cursor-pointer"
                                >
                                  <EventCard
                                    id={event.id}
                                    title={event.title}
                                    date={formatEventDate(event.start_date, event.end_date)}
                                    time={formatEventTime(event.start_date, event.end_date)}
                                    location={event.city_name ? `${event.city_name}, ${event.country_name}` : event.venue_address || ''}
                                    imageUrl={event.event_image_url || ''}
                                    category={event.category_name || event.category}
                                    hashtags={event.tags || []}
                                    latitude={event.latitude}
                                    longitude={event.longitude}
                                    city={event.city_name}
                                    startDate={event.start_date}
                                    endDate={event.end_date}
                                    isFree={event.is_free}
                                    entryFee={event.entry_fee}
                                    priceDisplay={getEventPriceDisplay(event)}
                                    currency={event.currency}
                                    onViewEvent={(id) => {
                                      const eventToView = allLoadedEvents.find(e => e.id === id);
                                      if (eventToView) {
                                        handleViewEvent(eventToView);
                                      }
                                    }}
                                    onLocationClick={handleLocationClick}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Active Events Pagination */}
                            {activeEventsTotalPages > 1 && (
                              <div className="flex justify-center items-center mt-8 space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setActiveEventsPage(prev => Math.max(prev - 1, 1))}
                                  disabled={activeEventsPage === 1}
                                  className="px-4 py-2"
                                >
                                  <ChevronLeft className="w-4 h-4 mr-1" />
                                  Previous
                                </Button>

                                <div className="flex space-x-1">
                                  {Array.from({ length: Math.min(activeEventsTotalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (activeEventsTotalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (activeEventsPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (activeEventsPage >= activeEventsTotalPages - 2) {
                                      pageNum = activeEventsTotalPages - 4 + i;
                                    } else {
                                      pageNum = activeEventsPage - 2 + i;
                                    }
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={activeEventsPage === pageNum ? "default" : "outline"}
                                        onClick={() => setActiveEventsPage(pageNum)}
                                        className="w-10 h-10"
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  })}
                                </div>

                                <Button
                                  variant="outline"
                                  onClick={() => setActiveEventsPage(prev => Math.min(prev + 1, activeEventsTotalPages))}
                                  disabled={activeEventsPage === activeEventsTotalPages}
                                  className="px-4 py-2"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Past Events Section */}
                        {pastEvents.length > 0 && (
                          <div className="mb-12">
                            <div className="mb-6">
                              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Past Events
                              </h2>
                              <p className="text-gray-600">
                                Showing {((pastEventsPage - 1) * eventsPerSection) + 1}-{Math.min(pastEventsPage * eventsPerSection, pastEventsTotal)} of {pastEventsTotal} past events
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {pastEvents.map((event, index) => (
                                <div
                                  key={event.id}
                                  onClick={() => handleViewEvent(event)}
                                  className="cursor-pointer"
                                >
                                  <EventCard
                                    id={event.id}
                                    title={event.title}
                                    date={formatEventDate(event.start_date, event.end_date)}
                                    time={formatEventTime(event.start_date, event.end_date)}
                                    location={event.city_name ? `${event.city_name}, ${event.country_name}` : event.venue_address || ''}
                                    imageUrl={event.event_image_url || ''}
                                    category={event.category_name || event.category}
                                    hashtags={event.tags || []}
                                    latitude={event.latitude}
                                    longitude={event.longitude}
                                    city={event.city_name}
                                    startDate={event.start_date}
                                    endDate={event.end_date}
                                    isFree={event.is_free}
                                    entryFee={event.entry_fee}
                                    priceDisplay={getEventPriceDisplay(event)}
                                    currency={event.currency}
                                    galleryImages={event.event_images}
                                    isPastEvent={true}
                                    onViewEvent={(id) => {
                                      const eventToView = allLoadedEvents.find(e => e.id === id);
                                      if (eventToView) {
                                        handleViewEvent(eventToView);
                                      }
                                    }}
                                    onLocationClick={handleLocationClick}
                                    onViewGallery={handleViewGallery}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Past Events Pagination */}
                            {pastEventsTotalPages > 1 && (
                              <div className="flex justify-center items-center mt-8 space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setPastEventsPage(prev => Math.max(prev - 1, 1))}
                                  disabled={pastEventsPage === 1}
                                  className="px-4 py-2"
                                >
                                  <ChevronLeft className="w-4 h-4 mr-1" />
                                  Previous
                                </Button>

                                <div className="flex space-x-1">
                                  {Array.from({ length: Math.min(pastEventsTotalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (pastEventsTotalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (pastEventsPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (pastEventsPage >= pastEventsTotalPages - 2) {
                                      pageNum = pastEventsTotalPages - 4 + i;
                                    } else {
                                      pageNum = pastEventsPage - 2 + i;
                                    }
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={pastEventsPage === pageNum ? "default" : "outline"}
                                        onClick={() => setPastEventsPage(pageNum)}
                                        className="w-10 h-10"
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  })}
                                </div>

                                <Button
                                  variant="outline"
                                  onClick={() => setPastEventsPage(prev => Math.min(prev + 1, pastEventsTotalPages))}
                                  disabled={pastEventsPage === pastEventsTotalPages}
                                  className="px-4 py-2"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}


                      </>
                    ) : (
                      <EmptyState
                        icon={Calendar}
                        title="No events found"
                        searchQuery={searchQuery || undefined}
                        description={
                          searchQuery || selectedCategory !== 'all' || startDate || endDate
                            ? 'Try different keywords, adjust your dates, or remove some filters.'
                            : 'Check back soon — new events are added regularly!'
                        }
                        onClearFilters={
                          (searchQuery || selectedCategory !== 'all' || startDate || endDate)
                            ? () => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setStartDate('');
                                setEndDate('');
                              }
                            : undefined
                        }
                        suggestions={[
                          { label: 'Music Events', onClick: () => setSelectedCategory('Music') },
                          { label: 'Sports', onClick: () => setSelectedCategory('Sports') },
                          { label: 'Networking', onClick: () => setSelectedCategory('Networking') },
                        ]}
                      />
                    )}
                  </>
                ) : (
                  /* Calendar View */
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendar View</h2>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Calendar implementation - showing events by date */}
                      {(() => {
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        const firstDay = new Date(currentYear, currentMonth, 1);
                        const lastDay = new Date(currentYear, currentMonth + 1, 0);
                        const daysInMonth = lastDay.getDate();
                        const startingDayOfWeek = firstDay.getDay();

                        const days = [];
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                        // Day headers
                        dayNames.forEach(day => {
                          days.push(
                            <div key={`header-${day}`} className="text-center font-semibold text-gray-700 py-2">
                              {day}
                            </div>
                          );
                        });

                        // Empty cells before first day
                        for (let i = 0; i < startingDayOfWeek; i++) {
                          days.push(<div key={`empty-${i}`} className="p-2"></div>);
                        }

                        // Days of month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(currentYear, currentMonth, day);
                          const dateStr = date.toLocaleDateString('en-CA');
                          const dayEvents = allLoadedEvents.filter(e => {
                            const eventDateStr = typeof e.start_date === 'string'
                              ? new Date(e.start_date).toLocaleDateString('en-CA')
                              : (parseDate(String(e.start_date))?.toLocaleDateString('en-CA') ?? '');
                            return eventDateStr === dateStr;
                          });

                          days.push(
                            <div
                              key={day}
                              className={`p-2 min-h-[100px] border rounded-lg ${day === today.getDate() && currentMonth === today.getMonth()
                                ? 'bg-orange-50 border-orange-500'
                                : 'border-gray-200'
                                }`}
                            >
                              <div className="font-semibold text-sm text-gray-700 mb-1">{day}</div>
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  onClick={() => handleViewEvent(event)}
                                  className="text-xs bg-black text-white p-1 rounded mb-1 cursor-pointer hover:bg-black/80 truncate"
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                              )}
                            </div>
                          );
                        }

                        return days;
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <DiscoverMore exclude={['Events']} />

      {/* Bottom Banner Ad */}
      <div className="relative z-10">
        <BottomBannerAd />
      </div>

      <Footer />

      {/* Fullscreen Map Modal */}
      <FullscreenMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        events={mapEvents}
        selectedEventId={selectedEventForMap}
        title="Events in this Area"
      />

      {/* Gallery Modal */}
      {selectedGalleryEvent && (
        <EventGalleryModal
          isOpen={galleryModalOpen}
          onClose={() => {
            setGalleryModalOpen(false);
            setSelectedGalleryEvent(null);
          }}
          eventTitle={selectedGalleryEvent.title}
          images={selectedGalleryEvent.event_images || []}
          eventDate={selectedGalleryEvent.start_date}
        />
      )}

      <BottomBannerAd />
      <Footer />

      {/* Ticket Purchase Modal */}
      {ticketModalEvent && (
        <TicketPurchaseModal
          isOpen={ticketModalOpen}
          onClose={() => {
            setTicketModalOpen(false);
            setTicketModalEvent(null);
          }}
          event={ticketModalEvent}
        />
      )}
    </div>
  );
};

const HeroSlideshow = () => {
  const [slides, setSlides] = useState<Array<{
    image_url: string;
    video_url?: string | null;
    video_thumbnail?: string | null;
    media_type: 'image' | 'video';
    title?: string | null;
    description?: string | null;
  }>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('event_slideshow_images')
          .select('image_url, video_url, video_thumbnail, media_type, title, description, is_active, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (!error) {
          setSlides((data || []) as any);
        }
      } catch {
        // Table may not exist yet — silently fall back to static hero
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActive((idx) => (idx + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Discover Amazing Events</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore the latest events happening around the world. From concerts and sports to conferences and cultural events.
          </p>
        </div>
      </div>
    );
  }

  const current = slides[active];
  return (
    <div className="relative h-[360px] md:h-[460px] lg:h-[520px] overflow-hidden">
      {slides.map((s, i) => (
        <div key={s.image_url + i} className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}>
          {s.media_type === 'video' && s.video_url ? (
            <video
              src={s.video_url}
              poster={s.video_thumbnail || s.image_url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              loading="lazy" src={s.image_url}
              alt={s.title || 'slide'}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Events</h1>
          <p className="text-base md:text-xl text-gray-200 max-w-3xl mx-auto">Explore the latest events happening around the world.</p>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} className={`w-2.5 h-2.5 rounded-full ${i === active ? 'bg-white' : 'bg-white/50'}`} onClick={() => setActive(i)} />
          ))}
        </div>
      )}
    </div>
  );
};
