import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { FullscreenMapModal } from "@/components/FullscreenMapModal";
import { InteractiveEventsMap } from "@/components/InteractiveEventsMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, ArrowLeft, CalendarDays, ArrowUpDown, X, Hash, Maximize2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { useEvents, useEventCategories } from '@/hooks/useEvents';
import { Event as DatabaseEvent } from '@/lib/eventsService';
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { supabase } from '@/lib/supabase';

export const EventsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedEvent, setSelectedEvent] = useState<DatabaseEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapEvents, setMapEvents] = useState<any[]>([]);
  const [selectedEventForMap, setSelectedEventForMap] = useState<string | undefined>();

  // Use real data from database
  const { events, loading, searchEvents } = useEvents();
  const { categories } = useEventCategories();
  const { selectedCountry } = useCountrySelection();

  // Load events on component mount and when selected country changes
  useEffect(() => {
    searchEvents({ limit: 100, country_id: selectedCountry?.id });
  }, [searchEvents, selectedCountry]);

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.venue_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organizer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         // Include hashtag search in main search
                         (event.tags && event.tags.some(tag => 
                           tag.toLowerCase().includes(searchQuery.toLowerCase().replace('#', ''))
                         ));
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    const matchesStartDate = !startDate || new Date(event.start_date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(event.end_date) <= new Date(endDate);
    
    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'location':
        return (a.city_name || '').localeCompare(b.city_name || '');
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = sortedEvents.slice(startIndex, startIndex + eventsPerPage);

  const handleViewEvent = (event: DatabaseEvent) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  const handleLocationClick = async (eventId: string, city?: string) => {
    const clickedEvent = events.find(e => e.id === eventId);
    if (!clickedEvent) return;

    // Get ALL events with valid coordinates from the database
    const eventsWithCoords = events.filter(e => 
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
    const eventsWithCoords = events.filter(e => 
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

  // Handle direct URL access to event details
  useEffect(() => {
    const eventId = window.location.pathname.split('/events/')[1];
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [events]);

  // Update URL when viewing event details
  useEffect(() => {
    if (selectedEvent) {
      navigate(`/events/${selectedEvent.id}`, { replace: true });
    } else {
      navigate('/events', { replace: true });
    }
  }, [selectedEvent, navigate]);

// Event Detail Component
  const EventDetail = ({ event, onBack }: { event: DatabaseEvent; onBack: () => void }) => {
    const images = [
      ...(event.event_image_url ? [event.event_image_url] : []),
      ...(event.event_images || []),
      ...(event.images || [])
    ];
    const [isLightboxVisible, setIsLightboxVisible] = useState(false);
    const [isLightboxEntered, setIsLightboxEntered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [navDirection, setNavDirection] = useState<'next' | 'prev' | null>(null);
    const [imageEntered, setImageEntered] = useState(true);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);

    const openLightboxAt = (index: number) => {
      setCurrentImageIndex(index);
      setIsLightboxVisible(true);
      // next tick to trigger CSS transitions
      requestAnimationFrame(() => {
        setIsLightboxEntered(true);
        setImageEntered(true);
      });
    };

    const closeLightbox = () => {
      setIsLightboxEntered(false);
      setTimeout(() => setIsLightboxVisible(false), 250);
    };
    const showPrev = () => {
      if (images.length === 0) return;
      setNavDirection('prev');
      setImageEntered(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        requestAnimationFrame(() => setImageEntered(true));
      }, 10);
    };
    const showNext = () => {
      if (images.length === 0) return;
      setNavDirection('next');
      setImageEntered(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        requestAnimationFrame(() => setImageEntered(true));
      }, 10);
    };

    useEffect(() => {
      if (isLightboxVisible) {
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Escape') closeLightbox();
          if (e.key === 'ArrowLeft') showPrev();
          if (e.key === 'ArrowRight') showNext();
        };
        document.addEventListener('keydown', onKey);
        // lock body scroll
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.removeEventListener('keydown', onKey);
          document.body.style.overflow = prevOverflow;
        };
      }
    }, [isLightboxVisible]);

    return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <button 
      onClick={onBack}
      className="flex items-center text-brand-blue hover:text-brand-blue/80 mb-6 transition-colors"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Back to Events
    </button>
    
    <div className="md:flex">
        <div className="md:flex-shrink-0 md:w-1/2">
            <div className="relative">
        <img 
                className="h-80 w-full object-cover md:h-full cursor-zoom-in" 
                src={images[currentImageIndex] || 'https://via.placeholder.com/600x400?text=Event+Image'} 
          alt={event.title} 
                onClick={() => openLightboxAt(0)}
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto">
                  {images.slice(0, 6).map((img, idx) => (
                    <img
                      key={`${img}-${idx}`}
                      src={img}
                      alt="thumbnail"
                      className={`h-12 w-16 object-cover rounded-md border cursor-pointer ${idx === currentImageIndex ? 'ring-2 ring-brand-blue' : 'border-white/70'}`}
                      onClick={() => { setCurrentImageIndex(idx); openLightboxAt(idx); }}
                    />
                  ))}
                </div>
              )}
            </div>
      </div>
        <div className="p-8 md:w-1/2">
          <div className="flex items-center mb-4">
            <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
              {event.category_name || event.category}
            </Badge>
          </div>
          
          {/* Hashtags Display */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {event.tags.map((hashtag) => (
                  <Badge 
                    key={hashtag} 
                    variant="outline" 
                    className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  >
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="space-y-6">
          <div className="flex items-start">
              <Calendar className="h-6 w-6 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
                <p className="text-lg text-gray-700 font-medium">
                  {new Date(event.start_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-gray-600">
                  {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <p className="text-sm text-brand-blue mt-1 cursor-pointer hover:underline">Add to calendar</p>
            </div>
          </div>
          
          <div className="flex items-start">
              <MapPin className="h-6 w-6 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
                <p className="text-lg text-gray-700 font-medium">{event.venue_name}</p>
                <p className="text-gray-600">{event.venue_address}</p>
                {event.city_name && (
                  <p className="text-sm text-gray-500">{event.city_name}, {event.country_name}</p>
                )}
                {(() => {
                  const hasCoords = (typeof event.venue_latitude === 'number' && typeof event.venue_longitude === 'number') ||
                                   (typeof event.latitude === 'number' && typeof event.longitude === 'number');
                  const lat = event.latitude || event.venue_latitude;
                  const lng = event.longitude || event.venue_longitude;
                  const mapsUrl = hasCoords
                    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue_name || ''} ${event.venue_address || ''} ${event.city_name || ''} ${event.country_name || ''}`.trim())}`;
                  return (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-blue mt-1 inline-block hover:underline"
                    >
                      Get directions
                    </a>
                  );
                })()}
            </div>
          </div>
          
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">About this event</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
          
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Organizer</p>
                  <p className="text-gray-700 font-medium">{event.organizer_name}</p>
                  {event.organizer_handle && (
                    <p className="text-sm text-gray-500">{event.organizer_handle}</p>
                  )}
              </div>
              <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Capacity</p>
                  <p className="text-gray-700 font-medium">{event.capacity || 'Unlimited'}</p>
                  {event.registration_count && (
                    <p className="text-sm text-gray-500">{event.registration_count} registered</p>
                  )}
              </div>
                {event.organizer_email && (
              <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Contact</p>
                    <p className="text-gray-700 font-medium">{event.organizer_email}</p>
              </div>
                )}
                {event.website_url && (
              <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Website</p>
                    <a href={event.website_url} className="text-brand-blue hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                  Visit website
                </a>
              </div>
                )}
            </div>
          </div>
          
            {/* Social Media Links */}
            {(event.facebook_url || event.twitter_url || event.instagram_url) && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow Event</h3>
                <div className="flex space-x-4">
                  {event.facebook_url && (
                    <a href={event.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <span className="sr-only">Facebook</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {event.twitter_url && (
                    <a href={event.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {event.instagram_url && (
                    <a href={event.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                      <span className="sr-only">Instagram</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.297v1.297h1.297V7.707zm-5.533 1.297c.807 0 1.418.611 1.418 1.418s-.611 1.418-1.418 1.418-1.418-.611-1.418-1.418.611-1.418 1.418-1.418zm5.533 2.715H8.449c-2.715 0-4.933 2.218-4.933 4.933s2.218 4.933 4.933 4.933h7.83c2.715 0 4.933-2.218 4.933-4.933s-2.218-4.933-4.933-4.933z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
            
            <div className="pt-6">
              <Button className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-4 px-6 rounded-lg text-lg">
              Get Tickets
            </Button>
          </div>
        </div>
      </div>


      {/* Break out of container for full-width map */}
    </div>

    {/* Full-width Interactive Map Section - Outside the constrained container */}
    <div className="w-full bg-gray-50 py-8 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-bold text-gray-900">📍 Event Location & All Events Map</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center">
                <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                <span className="font-medium">This Event</span>
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                <span className="font-medium">Other Events</span>
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            Explore this event's location and discover {getAllEventsForMap(event).length - 1} other events happening around the world
          </p>
        </div>
        
        <div className="rounded-xl overflow-hidden border-2 border-gray-300 shadow-2xl bg-white">
          {(() => {
            const hasCoords = (typeof event.venue_latitude === 'number' && typeof event.venue_longitude === 'number') ||
                             (typeof event.latitude === 'number' && typeof event.longitude === 'number');
            
            if (!hasCoords) {
              return (
                <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 font-medium">Location coordinates not available</p>
                    <p className="text-sm text-gray-500 mt-2">Map cannot be displayed without coordinates</p>
                  </div>
                </div>
              );
            }

            const allEventsForMap = getAllEventsForMap(event);
            
            return (
              <InteractiveEventsMap
                events={allEventsForMap}
                selectedEventId={event.id}
                height="700px"
                showExpandButton={true}
                onExpand={() => {
                  setMapEvents(allEventsForMap);
                  setSelectedEventForMap(event.id);
                  setMapModalOpen(true);
                }}
              />
            );
          })()}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <Maximize2 className="w-4 h-4 inline mr-1 text-brand-blue" /> 
            Click <strong className="text-brand-blue">"Expand Map"</strong> button to view in fullscreen mode
          </p>
          <p className="text-sm text-gray-500">
            Total events on map: <strong>{getAllEventsForMap(event).length}</strong>
          </p>
        </div>
      </div>
    </div>

    {/* Reopen container for other content if needed */}
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden" style={{ marginTop: 0 }}>
    </div>

        {isLightboxVisible && (
          <div 
            className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-300 ${isLightboxEntered ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeLightbox}
            onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              setTouchEndX(e.changedTouches[0]?.clientX ?? null);
              const start = touchStartX;
              const end = e.changedTouches[0]?.clientX ?? null;
              if (start != null && end != null) {
                const delta = end - start;
                if (Math.abs(delta) > 40) {
                  if (delta < 0) {
                    showNext();
                  } else {
                    showPrev();
                  }
                }
              }
            }}
          >
            <button
              className="absolute top-4 right-4 text-white/90 hover:text-white"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              aria-label="Close image viewer"
            >
              <X className="w-7 h-7" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 md:left-8 text-white/90 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); showPrev(); }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  className="absolute right-4 md:right-8 text-white/90 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); showNext(); }}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            <div 
              className={`max-h-[95vh] max-w-[95vw] p-2 transition-all duration-300 ease-out ${isLightboxEntered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`transition-all duration-300 ease-out ${imageEntered ? 'opacity-100 translate-x-0' : navDirection === 'next' ? 'opacity-0 translate-x-6' : navDirection === 'prev' ? 'opacity-0 -translate-x-6' : 'opacity-0'} `}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`event image ${currentImageIndex + 1}`}
                  className="max-h-[95vh] max-w-[95vw] object-contain"
                />
              </div>
            </div>
          </div>
        )}
  </div>
);
  };

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <EventDetail event={selectedEvent} onBack={handleBackToList} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with background slideshow */}
      <HeroSlideshow />

      {/* Filters Section - Moved beneath hero */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                  placeholder="Search events, venues, organizers, or #hashtags"
                      value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                    />
                  </div>
                </div>

                {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From Date</label>
                  <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                    />
                  </div>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To Date</label>
                  <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                    />
                  </div>
                </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
        </div>
        ) : currentEvents.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {sortedEvents.length} Events Found
              </h2>
              <p className="text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + eventsPerPage, sortedEvents.length)} of {sortedEvents.length} events
              </p>
      </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map((event) => (
                  <div key={event.id} onClick={() => handleViewEvent(event)} className="cursor-pointer">
                    <EventCard
                      id={event.id}
                      title={event.title}
                      date={new Date(event.start_date).toLocaleDateString()}
                      time={`${new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                      location={event.city_name ? `${event.city_name}, ${event.country_name}` : event.venue_address || ''}
                      imageUrl={event.event_image_url || ''}
                      category={event.category_name || event.category}
                      hashtags={event.tags || []}
                      latitude={event.latitude}
                      longitude={event.longitude}
                      city={event.city_name}
                      onViewEvent={(id) => {
                        const eventToView = events.find(e => e.id === id);
                        if (eventToView) {
                          handleViewEvent(eventToView);
                        }
                      }}
                      onLocationClick={handleLocationClick}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                  <Button
                    variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                  </Button>
                  
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10"
                    >
                      {page}
                      </Button>
                  ))}
                </div>
                  
                  <Button
                    variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' || startDate || endDate
                ? 'Try adjusting your search criteria or filters.'
                : 'Check back later for upcoming events.'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || startDate || endDate) && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStartDate('');
                  setEndDate('');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
            </div>
          )}
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
      const { data } = await supabase
        .from('event_slideshow_images')
        .select('image_url, video_url, video_thumbnail, media_type, title, description, is_active, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setSlides((data || []) as any);
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
              src={s.image_url}
              alt={s.title || 'slide'}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{current.title || 'Discover Amazing Events'}</h1>
          {current.description ? (
            <p className="text-base md:text-xl text-gray-200 max-w-3xl mx-auto">{current.description}</p>
          ) : (
            <p className="text-base md:text-xl text-gray-200 max-w-3xl mx-auto">Explore the latest events happening around the world.</p>
          )}
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
