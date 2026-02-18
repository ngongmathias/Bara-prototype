import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Maximize2 } from 'lucide-react';
import { Event as DatabaseEvent } from '@/lib/eventsService';
import { InteractiveEventsMap } from "@/components/InteractiveEventsMap";

interface EventDetailProps {
    event: DatabaseEvent;
    onBack: () => void;
    onRegister: (event: DatabaseEvent) => void;
    currentUserId?: string | null;
}

export const EventDetail = ({ event, onBack, onRegister }: EventDetailProps) => {
    const images = [
        ...(event.event_image_url ? [event.event_image_url] : []),
        ...(event.event_images || []),
        ...(event.images || [])
    ];
    const [isLightboxVisible, setIsLightboxVisible] = useState(false);
    const [isLightboxEntered, setIsLightboxEntered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageEntered, setImageEntered] = useState(true);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    // Filter helper functions (parseDate) needed here or imported?
    // We can redefine parseDate here as it's simple
    const parseDate = (value?: string | null) => {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const openLightboxAt = (index: number) => {
        setCurrentImageIndex(index);
        setIsLightboxVisible(true);
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
        setImageEntered(false);
        setTimeout(() => {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
            requestAnimationFrame(() => setImageEntered(true));
        }, 10);
    };

    const showNext = () => {
        if (images.length === 0) return;
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
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', onKey);
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [isLightboxVisible]);

    const formatPrice = (event: DatabaseEvent) => {
        if (event.is_free) return 'Free Event';
        if (event.entry_fee !== undefined && event.entry_fee !== null) {
            return `Price: ${event.currency || ''} ${event.entry_fee.toLocaleString()}`;
        }
        return 'Paid Event (Price TBD)';
    };

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <button
                onClick={onBack}
                className="flex items-center text-black hover:opacity-80 mb-6 transition-colors p-4"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Events
            </button>

            <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/2">
                    <div className="relative h-80 md:h-full">
                        <img
                            className="h-full w-full object-cover cursor-zoom-in"
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
                                        className={`h-12 w-16 object-cover rounded-md border cursor-pointer ${idx === currentImageIndex ? 'ring-2 ring-black' : 'border-white/70'}`}
                                        onClick={() => { setCurrentImageIndex(idx); openLightboxAt(idx); }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-8 md:w-1/2">
                    <div className="flex items-center mb-4">
                        <Badge variant="secondary" className="bg-black/10 text-black border-black/20">
                            {event.category_name || event.category}
                        </Badge>
                    </div>

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
                            <Calendar className="h-6 w-6 text-black mr-3 mt-1 flex-shrink-0" />
                            <div>
                                {(() => {
                                    const startDate = parseDate(event.start_date);
                                    const endDate = parseDate(event.end_date);
                                    if (!startDate && !endDate) {
                                        return <p className="text-lg text-gray-700 font-medium">TBD</p>;
                                    }
                                    const effectiveStart = startDate ?? endDate!;
                                    const effectiveEnd = endDate ?? startDate!;
                                    const isSameDay = effectiveStart.toDateString() === effectiveEnd.toDateString();

                                    if (isSameDay) {
                                        return (
                                            <>
                                                <p className="text-lg text-gray-700 font-medium">
                                                    {effectiveStart.toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-gray-600">
                                                    {effectiveStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {effectiveEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <p className="text-lg text-gray-700 font-medium">
                                                    {effectiveStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {effectiveEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-gray-600">
                                                    Opens: {effectiveStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {effectiveStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </>
                                        );
                                    }
                                })()}
                                <p className="text-sm text-black mt-1 cursor-pointer hover:underline">Add to calendar</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <MapPin className="h-6 w-6 text-black mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-lg text-gray-700 font-medium">{event.venue_name}</p>
                                <p className="text-gray-600">{event.venue_address}</p>
                                {event.city_name && (
                                    <p className="text-sm text-gray-500">{event.city_name}, {event.country_name}</p>
                                )}
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue_name || ''} ${event.venue_address || ''} ${event.city_name || ''}`.trim())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-black mt-1 inline-block hover:underline"
                                >
                                    Get directions
                                </a>
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
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Capacity</p>
                                    <p className="text-gray-700 font-medium">{event.capacity || 'Unlimited'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links would go here */}

                        <div className="pt-6 space-y-3">
                            <Button
                                className={`w-full text-white font-semibold py-4 px-6 rounded-lg text-lg ${event.is_free ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:opacity-80'}`}
                                onClick={() => onRegister(event)}
                                disabled={event.max_capacity ? (event.current_registrations || 0) >= event.max_capacity : false}
                            >
                                {event.max_capacity && (event.current_registrations || 0) >= event.max_capacity ? 'Sold Out' : (event.is_free ? 'Register — Free Event' : 'Buy Tickets')}
                            </Button>
                            <p className="text-sm text-gray-600 text-center">
                                {formatPrice(event)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox would go here - simplified for brevity in this extraction but logic is preserved above */}
            {isLightboxVisible && (
                <div
                    className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-300 ${isLightboxEntered ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeLightbox}
                >
                    {/* Lightbox content */}
                    <img
                        src={images[currentImageIndex]}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        alt="fullscreen"
                    />
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={closeLightbox}
                    >
                        Close
                    </button>
                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
                                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                            >
                                ←
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
                                onClick={(e) => { e.stopPropagation(); showNext(); }}
                            >
                                →
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
