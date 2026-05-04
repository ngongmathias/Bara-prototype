import { useEffect, useState } from 'react';
import { ExternalLink, Phone, MapPin, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
    COUNTRY_KEY_LISTING_TYPES,
    COUNTRY_KEY_LISTING_TYPE_PLURALS,
    type CountryKeyListingType,
} from '@/lib/countryKeyListingTypes';

interface KeyListing {
    id: string;
    listing_type: CountryKeyListingType;
    name: string;
    description: string | null;
    web_link: string | null;
    logo_url: string | null;
    address: string | null;
    telephone: string | null;
    display_order: number;
}

interface CountryKeyListingsProps {
    countryId: string;
    countryName: string;
    title?: string;
    subtitle?: string;
}

export const CountryKeyListings = ({ countryId, countryName, title, subtitle }: CountryKeyListingsProps) => {
    const [listings, setListings] = useState<KeyListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('country_key_listings')
                .select('id, listing_type, name, description, web_link, logo_url, address, telephone, display_order')
                .eq('country_id', countryId)
                .order('listing_type', { ascending: true })
                .order('display_order', { ascending: true })
                .order('name', { ascending: true });
            if (cancelled) return;
            if (data) setListings(data as KeyListing[]);
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [countryId]);

    if (loading) {
        return (
            <div className="space-y-4">
                {title && <div className="h-7 w-40 bg-gray-100 rounded animate-pulse" />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (listings.length === 0) {
        return null;
    }

    // Group by listing_type, preserving the canonical order.
    const grouped = COUNTRY_KEY_LISTING_TYPES
        .map((type) => ({
            type,
            items: listings.filter((l) => l.listing_type === type),
        }))
        .filter((g) => g.items.length > 0);

    return (
        <section>
            {title && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 font-comfortaa">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
            )}

            <div className="space-y-8">
                {grouped.map(({ type, items }) => (
                    <div key={type}>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            {COUNTRY_KEY_LISTING_TYPE_PLURALS[type]}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.logo_url ? (
                                                <img
                                                    src={item.logo_url}
                                                    alt={`${item.name} logo`}
                                                    className="w-full h-full object-contain"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 leading-tight">{item.name}</h4>
                                            {item.description && (
                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                                            )}
                                            <div className="mt-3 space-y-1.5">
                                                {item.web_link && (
                                                    <a
                                                        href={item.web_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span className="truncate">{item.web_link.replace(/^https:\/\//, '')}</span>
                                                    </a>
                                                )}
                                                {item.address && (
                                                    <div className="flex items-start gap-1.5 text-sm text-gray-700">
                                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                        <span>{item.address}</span>
                                                    </div>
                                                )}
                                                {item.telephone && (
                                                    <a
                                                        href={`tel:${item.telephone}`}
                                                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span>{item.telephone}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CountryKeyListings;
