import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { Play, Loader2 } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Link } from 'react-router-dom';
import { VerifiedBadge } from '@/components/streams/VerifiedBadge';

const PAGE_SIZE = 24;

export default function ArtistsPage() {
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Pagination (STREAMS_MASTER_PLAN.md §J2) — used to fetch every artist
    // in one unbounded query; now fetches PAGE_SIZE at a time via range().
    const fetchPage = async (offset: number) => {
        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .order('name', { ascending: true })
            .range(offset, offset + PAGE_SIZE - 1);
        if (error) throw error;
        if ((data || []).length < PAGE_SIZE) setHasMore(false);
        return data || [];
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setHasMore(true);
                setArtists(await fetchPage(0));
            } catch (error) {
                console.error('Error fetching artists:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const next = await fetchPage(artists.length);
            setArtists(prev => [...prev, ...next]);
        } catch (error) {
            console.error('Error fetching more artists:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <StreamsLayout>
            <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24 bg-gray-50">
                <h1 className="text-4xl font-bold mb-8 tracking-tight text-gray-900">Artists</h1>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} type="product" />
                        ))}
                    </div>
                ) : (
                    <ScrollReveal className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {artists.map(artist => (
                            <Link key={artist.id} to={`/streams/artist/${artist.id}`} className="group flex flex-col items-center">
                                <div className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 w-full text-center group">
                                    <div className="relative mb-4 aspect-square shadow-2xl">
                                        <img
                                            loading="lazy" src={artist.image_url}
                                            alt={artist.name}
                                            className="w-full h-full object-cover rounded-full shadow-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '/placeholder-artist.png';
                                            }}
                                        />
                                        <button className="absolute bottom-6 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10" aria-label="Play"><Play size={24} fill="white" className="ml-1" /></button>
                                    </div>
                                    <h3 className="font-bold truncate text-gray-900 mb-1 text-sm flex items-center justify-center gap-1">{artist.name}{artist.is_verified && <VerifiedBadge size={13} />}</h3>
                                    <p className="text-xs text-gray-500">Artist</p>
                                </div>
                            </Link>
                        ))}
                    </ScrollReveal>
                )}

                {!loading && hasMore && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </StreamsLayout>
    );
}
