import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, Play } from 'lucide-react';
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
            <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24 bg-[#121212]">
                <h1 className="text-4xl font-bold mb-8 tracking-tight text-white">Artists</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {artists.map(artist => (
                            <Link key={artist.id} to={`/streams/artist/${artist.id}`} className="group flex flex-col items-center">
                                <div className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 w-full text-center group">
                                    <div className="relative mb-4 aspect-square shadow-2xl">
                                        <img
                                            src={artist.image_url}
                                            alt={artist.name}
                                            className="w-full h-full object-cover rounded-full shadow-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '/placeholder-artist.png';
                                            }}
                                        />
                                        <button className="absolute bottom-6 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                            <Play size={24} fill="black" className="ml-1" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold truncate text-white mb-1 text-sm">{artist.name}</h3>
                                    <p className="text-xs text-gray-400">Artist</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </StreamsLayout>
    );
}
