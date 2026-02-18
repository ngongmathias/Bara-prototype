import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from 'lucide-react';
import { Event } from '@/lib/eventsService';

interface SimilarEventsProps {
    events: Event[];
    currentEvent: Event;
    onEventClick: (event: Event) => void;
}

export const SimilarEvents = ({ events, currentEvent, onEventClick }: SimilarEventsProps) => {
    const parseDate = (value?: string | null) => {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const similarEvents = events
        .filter(e =>
            e.id !== currentEvent.id &&
            (e.category === currentEvent.category || e.category_name === currentEvent.category_name)
        )
        .slice(0, 3);

    if (similarEvents.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarEvents.map((similarEvent) => (
                    <div
                        key={similarEvent.id}
                        onClick={() => onEventClick(similarEvent)}
                        className="cursor-pointer group"
                    >
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                            <img
                                src={similarEvent.event_image_url || 'https://via.placeholder.com/400x300?text=Event'}
                                alt={similarEvent.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="p-4">
                                <Badge variant="secondary" className="mb-2 text-xs">
                                    {similarEvent.category_name || similarEvent.category}
                                </Badge>
                                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                                    {similarEvent.title}
                                </h4>
                                <p className="text-sm text-gray-600 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {(parseDate(similarEvent.start_date) ?? parseDate(similarEvent.end_date))?.toLocaleDateString() ?? 'TBD'}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {similarEvent.city_name || similarEvent.venue_name}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
