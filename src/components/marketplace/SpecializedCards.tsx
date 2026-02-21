import React from 'react';
import { MapPin, Bed, Bath, Move, Calendar, Gauge, Fuel, Zap, Briefcase, DollarSign, Clock } from 'lucide-react';
import { MarketplaceListing } from '@/types/marketplace';
import { Button } from '@/components/ui/button';

interface CardProps {
    listing: MarketplaceListing;
    onClick: () => void;
}

export const PropertyCard: React.FC<CardProps> = ({ listing, onClick }) => {
    const attributes = listing.attributes || {};
    const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
        listing.images?.[0]?.image_url ||
        '/placeholder.jpg';

    return (
        <div
            onClick={onClick}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer bg-white group"
        >
            <div className="relative h-48 bg-gray-100">
                <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
                {listing.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                        FEATURED
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="text-2xl font-bold text-black mb-1 font-comfortaa">
                    {listing.currency} {listing.price?.toLocaleString()}
                </div>
                <h3 className="font-bold text-black mb-3 line-clamp-1 font-roboto group-hover:underline">
                    {listing.title}
                </h3>

                {/* Property Specs */}
                <div className="flex items-center gap-4 mb-3 text-gray-600 border-y border-gray-100 py-2">
                    {attributes.beds && (
                        <div className="flex items-center gap-1 text-sm">
                            <Bed className="w-4 h-4" />
                            <span>{attributes.beds}</span>
                        </div>
                    )}
                    {attributes.baths && (
                        <div className="flex items-center gap-1 text-sm">
                            <Bath className="w-4 h-4" />
                            <span>{attributes.baths}</span>
                        </div>
                    )}
                    {attributes.area && (
                        <div className="flex items-center gap-1 text-sm">
                            <Move className="w-4 h-4" />
                            <span>{attributes.area} sqft</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 font-roboto">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{listing.location_details || 'Location not specified'}</span>
                </div>
            </div>
        </div>
    );
};

export const VehicleCard: React.FC<CardProps> = ({ listing, onClick }) => {
    const attributes = listing.attributes || {};
    const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
        listing.images?.[0]?.image_url ||
        '/placeholder.jpg';

    return (
        <div
            onClick={onClick}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer bg-white group"
        >
            <div className="relative h-48 bg-gray-100">
                <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
                <div className="text-2xl font-bold text-black mb-1 font-comfortaa">
                    {listing.currency} {listing.price?.toLocaleString()}
                </div>
                <h3 className="font-bold text-black mb-3 line-clamp-1 font-roboto group-hover:underline">
                    {listing.title}
                </h3>

                {/* Vehicle Specs */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{attributes.year || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Gauge className="w-4 h-4 text-gray-400" />
                        <span>{attributes.mileage ? `${attributes.mileage} km` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{attributes.fuel_type || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{attributes.transmission || 'N/A'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 font-roboto">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{listing.location_details || 'Location not specified'}</span>
                </div>
            </div>
        </div>
    );
};

export const JobCard: React.FC<CardProps> = ({ listing, onClick }) => {
    const attributes = listing.attributes || {};

    return (
        <div
            onClick={onClick}
            className="border border-gray-200 rounded-lg p-6 hover:border-black transition-colors cursor-pointer bg-white group shadow-sm"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-black mb-1 font-comfortaa group-hover:underline">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 font-roboto text-sm">
                        <Briefcase className="w-4 h-4" />
                        <span>{attributes.company_name || 'Hiring Company'}</span>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {attributes.job_type || 'Full-time'}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-gray-900">
                        {listing.currency} {listing.price?.toLocaleString()}
                        {attributes.salary_period && <span className="text-gray-500 font-normal"> / {attributes.salary_period}</span>}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{listing.location_details || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Posted {new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-roboto italic">
                {listing.description}
            </p>

            <Button className="w-full bg-black text-white hover:bg-gray-800">
                View Details & Apply
            </Button>
        </div>
    );
};
