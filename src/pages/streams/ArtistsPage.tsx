import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { Play } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Link } from 'react-router-dom';

export default function ArtistsPage() {
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('artists')
                    .select('*')
                    .order('name', { ascending: true });

                if (error) throw error;
                setArtists(data || []);
            } catch (error) {
                console.error('Error fetching artists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

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
                                        <button className="absolute bottom-6 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10" aria-label="Play"><Play size={24} fill="black" className="ml-1" /></button>
                                    </div>
                                    <h3 className="font-bold truncate text-gray-900 mb-1 text-sm">{artist.name}</h3>
                                    <p className="text-xs text-gray-500">Artist</p>
                                </div>
                            </Link>
                        ))}
                    </ScrollReveal>
                )}
            </div>
        </StreamsLayout>
    );
}
