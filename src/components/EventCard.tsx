import { Calendar, Clock, MapPin, Hash, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VerificationIcon, VerificationStatus } from '@/components/ui/verification-badge';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category?: string;
  hashtags?: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  createdBy?: {
    name: string;
    email: string;
    verification?: VerificationStatus;
  };
  onViewEvent?: (id: string) => void;
  onLocationClick?: (eventId: string, city?: string) => void;
}

export const EventCard = ({
  id,
  title,
  date,
  time,
  location,
  imageUrl,
  category,
  hashtags,
  latitude,
  longitude,
  city,
  createdBy,
  onViewEvent,
  onLocationClick,
}: EventCardProps) => {
  const handleViewEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewEvent) {
      onViewEvent(id);
    } else {
      // Fallback to URL navigation if no handler provided
      window.location.href = `/events/${id}`;
    }
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLocationClick && (latitude && longitude)) {
      onLocationClick(id, city);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-48 bg-gray-200 overflow-hidden relative">
        <img
          src={imageUrl || 'https://via.placeholder.com/400x300?text=Event+Image'}
          alt={title}
          className="w-full h-full object-cover"
        />
        {category && (
          <div className="absolute top-3 left-3">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 h-14">
          {title}
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-orange-500" />
            <span>{date} • {time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
            {latitude && longitude && onLocationClick ? (
              <button
                onClick={handleLocationClick}
                className="line-clamp-1 text-left hover:text-orange-500 hover:underline transition-colors"
                title="Click to view on map"
              >
                {location}
              </button>
            ) : (
              <span className="line-clamp-1">{location}</span>
            )}
          </div>
        </div>
        
        {/* Creator Information */}
        {createdBy && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate max-w-[120px]">{createdBy.name}</span>
            </div>
            {createdBy.verification && (
              <VerificationIcon 
                verification={createdBy.verification} 
                size="sm" 
                className="flex-shrink-0"
              />
            )}
          </div>
        )}
        
        {/* Hashtags Preview */}
        {hashtags && hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {hashtags.slice(0, 3).map((hashtag) => (
              <Badge 
                key={hashtag} 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                #{hashtag}
              </Badge>
            ))}
            {hashtags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                +{hashtags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={handleViewEvent}
            className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
          >
            View Event
          </button>
        </div>
      </div>
    </div>
  );
};
