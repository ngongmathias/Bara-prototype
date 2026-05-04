import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GalleryPhoto {
    id: string;
    image_url: string;
    caption: string | null;
    display_order: number;
}

interface CountryGalleryProps {
    countryId: string;
    countryName: string;
    /** Optional title rendered above the grid. Section is fully hidden when no photos. */
    title?: string;
    /** Optional subtitle rendered below the title. */
    subtitle?: string;
}

export const CountryGallery = ({ countryId, countryName, title, subtitle }: CountryGalleryProps) => {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('country_gallery_photos')
                .select('id, image_url, caption, display_order')
                .eq('country_id', countryId)
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: true });
            if (cancelled) return;
            if (!error && data) setPhotos(data as GalleryPhoto[]);
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [countryId]);

    const open = useCallback((idx: number) => setActiveIndex(idx), []);
    const close = useCallback(() => setActiveIndex(null), []);
    const prev = useCallback(() => {
        setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
    }, [photos.length]);
    const next = useCallback(() => {
        setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));
    }, [photos.length]);

    useEffect(() => {
        if (activeIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeIndex, prev, next]);

    if (loading) {
        return (
            <div>
                {title && <div className="h-7 w-32 bg-gray-100 rounded animate-pulse mb-3" />}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (photos.length === 0) {
        return null;
    }

    const active = activeIndex !== null ? photos[activeIndex] : null;

    return (
        <>
            {title && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 font-comfortaa">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                    <button
                        key={photo.id}
                        type="button"
                        onClick={() => open(idx)}
                        className="group relative aspect-square overflow-hidden rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
                        aria-label={photo.caption || `${countryName} photo ${idx + 1}`}
                    >
                        <img
                            src={photo.image_url}
                            alt={photo.caption || `${countryName} ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white line-clamp-2">{photo.caption}</p>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <Dialog open={active !== null} onOpenChange={(open) => !open && close()}>
                <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-0">
                    {active && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={close}
                                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                            {photos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prev}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={next}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                            <img
                                src={active.image_url}
                                alt={active.caption || `${countryName} photo`}
                                className="w-full max-h-[85vh] object-contain"
                            />
                            {active.caption && (
                                <div className="bg-black/80 px-4 py-3">
                                    <p className="text-sm text-white text-center">{active.caption}</p>
                                </div>
                            )}
                            {photos.length > 1 && (
                                <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/60 text-white text-xs">
                                    {(activeIndex ?? 0) + 1} / {photos.length}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CountryGallery;
