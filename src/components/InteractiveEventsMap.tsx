import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, X, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet to avoid namespace issues
const getLeaflet = () => {
  // @ts-ignore
  return typeof window !== 'undefined' ? window.L : null;
};

// Custom event marker icon
const createEventIcon = (isSelected: boolean = false) => {
  const L = getLeaflet();
  if (!L) return undefined;
  return new L.Icon({
    iconUrl: isSelected 
      ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNDhzMTYtMjAgMTYtMzJhMTYgMTYgMCAwIDAtMzIgMGMwIDEyIDE2IDMyIDE2IDMyeiIgZmlsbD0iI2VmNDQ0NCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+'
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNDhzMTYtMjAgMTYtMzJhMTYgMTYgMCAwIDAtMzIgMGMwIDEyIDE2IDMyIDE2IDMyeiIgZmlsbD0iIzM3ODZmZiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

interface EventMarkerData {
  id: string;
  title: string;
  description?: string;
  venue: string;
  latitude: number;
  longitude: number;
  event_date: string;
  image_url?: string;
  city?: string;
}

interface InteractiveEventsMapProps {
  events: EventMarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedEventId?: string;
  onClose?: () => void;
  onExpand?: () => void;
  showExpandButton?: boolean;
}

// Component to auto-fit map bounds to show all markers
const MapBoundsHandler: React.FC<{ events: EventMarkerData[] }> = ({ events }) => {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;
    
    const L = getLeaflet();
    if (!L) return;
    
    if (events.length === 1) {
      const event = events[0];
      (map as any).setView([event.latitude, event.longitude], 13);
    } else {
      // @ts-ignore - Leaflet latLngBounds
      const bounds = L.latLngBounds(
        events.map((e: EventMarkerData) => [e.latitude, e.longitude])
      );
      (map as any).fitBounds(bounds, { padding: [50, 50] });
    }
  }, [events, map]);

  return null;
};

export const InteractiveEventsMap: React.FC<InteractiveEventsMapProps> = ({
  events,
  center,
  zoom = 10,
  height = '600px',
  selectedEventId,
  onClose,
  onExpand,
  showExpandButton = false,
}) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventMarkerData | null>(null);

  // Calculate center if not provided
  const mapCenter: [number, number] = center || (
    events.length > 0 
      ? [events[0].latitude, events[0].longitude]
      : [0, 0] // Default fallback
  );

  const handleLearnMore = (event: EventMarkerData) => {
    navigate(`/events/${event.id}`);
  };

  if (events.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No events with location data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Close button for fullscreen mode */}
      {onClose && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-[1000] shadow-lg"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* Expand button for embedded mode */}
      {showExpandButton && onExpand && (
        <Button
          variant="default"
          size="lg"
          className="absolute top-6 right-6 z-[1000] shadow-2xl bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-brand-blue text-white font-semibold px-6 py-3 rounded-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Expand button clicked!');
            onExpand();
          }}
          title="Click to expand map to fullscreen"
        >
          <Maximize2 className="w-5 h-5 mr-2" />
          <span className="text-base">Expand Fullscreen</span>
        </Button>
      )}

      <MapContainer
        // @ts-ignore
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          // @ts-ignore
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsHandler events={events} />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            // @ts-ignore
            icon={createEventIcon(event.id === selectedEventId)}
            eventHandlers={{
              click: () => setSelectedEvent(event),
            }}
          >
            <Popup
              // @ts-ignore
              maxWidth={300}
              className="event-popup"
            >
              <Card className="border-0 shadow-none p-2">
                {event.image_url && (
                  <img
                    loading="lazy" src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      {format(new Date(event.event_date), 'MMM dd, yyyy • h:mm a')}
                    </span>
                  </div>
                </div>

                {event.city && (
                  <Badge variant="secondary" className="mb-3">
                    {event.city}
                  </Badge>
                )}
                
                <Button
                  className="w-full"
                  onClick={() => handleLearnMore(event)}
                >
                  Learn More
                </Button>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Event count badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Badge variant="secondary" className="shadow-lg text-sm py-2 px-4">
          {events.length} {events.length === 1 ? 'Event' : 'Events'} on Map
        </Badge>
      </div>
    </div>
  );
};
