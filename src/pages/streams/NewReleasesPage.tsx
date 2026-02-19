import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, Play } from 'lucide-react';

export default function NewReleasesPage() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('albums')
                    .select('*, artists(name)')
                    .order('release_date', { ascending: false });

                if (error) throw error;
                setAlbums(data || []);
            } catch (error) {
                console.error('Error fetching new releases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    return (
        <StreamsLayout>
            <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24 bg-[#121212]">
                <h1 className="text-4xl font-bold mb-8 tracking-tight text-white">New Releases</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {albums.map(album => (
                            <div key={album.id} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col h-full shadow-lg">
                                <div className="relative mb-4 aspect-square shadow-2xl">
                                    <img
                                        src={album.cover_url}
                                        alt={album.title}
                                        className="w-full h-full object-cover rounded-md shadow-lg"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'; }}
                                    />
                                    <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                        <Play size={24} fill="black" className="ml-1" />
                                    </button>
                                </div>
                                <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{album.title}</h3>
                                <p className="text-xs text-gray-400 truncate mt-auto">{album.artists?.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StreamsLayout>
    );
}
