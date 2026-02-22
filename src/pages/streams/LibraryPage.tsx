import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Heart, Play, User, Music, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { CreatePlaylistModal } from '@/components/streams/CreatePlaylistModal';
import { useUser } from '@clerk/clerk-react';

interface LibraryItem {
    id: string;
    type: 'playlist' | 'artist';
    title: string;
    subtitle: string;
    image_url: string;
}

export default function LibraryPage() {
    const { likedSongs } = useAudioPlayer();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'playlists' | 'artists'>('all');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { user, isLoaded } = useUser();

    const fetchLibrary = async () => {
        if (!isLoaded) return;
        setLoading(true);
        try {
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch Liked Playlists
            const { data: playlistsData } = await supabase
                .from('user_playlist_likes')
                .select('*, playlists(*, artists(name))')
                .eq('user_id', user.id);

            // Fetch Followed Artists
            const { data: artistsData } = await supabase
                .from('user_artist_follows')
                .select('*, artists(*)')
                .eq('user_id', user.id);

            const formattedPlaylists: LibraryItem[] = (playlistsData || []).map(p => ({
                id: p.playlists.id,
                type: 'playlist',
                title: p.playlists.title,
                subtitle: `Playlist • ${p.playlists.artists?.name || 'Various Artists'}`,
                image_url: p.playlists.cover_url || '/placeholder-playlist.png'
            }));

            const formattedArtists: LibraryItem[] = (artistsData || []).map(a => ({
                id: a.artists.id,
                type: 'artist',
                title: a.artists.name,
                subtitle: 'Artist',
                image_url: a.artists.image_url || '/placeholder-artist.png'
            }));

            setItems([...formattedPlaylists, ...formattedArtists]);
        } catch (err) {
            console.error('Error fetching library:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
    }, []);

    const handleCreateSuccess = () => {
        fetchLibrary();
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'playlists') return item.type === 'playlist';
        if (filter === 'artists') return item.type === 'artist';
        return true;
    });

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-black p-8 pt-16">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-3">
                            <FilterPill label="Playlists" active={filter === 'playlists'} onClick={() => setFilter(filter === 'playlists' ? 'all' : 'playlists')} />
                            <FilterPill label="Artists" active={filter === 'artists'} onClick={() => setFilter(filter === 'artists' ? 'all' : 'artists')} />
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                        >
                            <Plus size={24} />
                        </Button>
                    </div>

                    <CreatePlaylistModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={handleCreateSuccess}
                    />

                    <h1 className="text-3xl font-black text-white mb-8 tracking-tighter">Your Library</h1>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Persistent Liked Songs Tile */}
                            {(filter === 'all' || filter === 'playlists') && (
                                <Link
                                    to="/streams/liked"
                                    className="col-span-2 bg-gradient-to-br from-[#450aef] to-[#8d67e1] rounded-lg p-6 hover:scale-[1.02] transition-transform shadow-xl relative overflow-hidden group h-[220px] flex flex-col justify-end"
                                >
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Heart size={24} fill="white" className="text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-white tracking-widest leading-none">LIKED</h2>
                                            <h2 className="text-3xl font-black text-white tracking-widest leading-none">SONGS</h2>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-white font-bold">{likedSongs.length} liked songs</p>
                                    </div>
                                    <div className="absolute bottom-6 right-6 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl translate-y-2 group-hover:translate-y-0 text-black">
                                        <Play size={24} fill="black" className="ml-1" />
                                    </div>
                                </Link>
                            )}

                            {/* Dynamically Fetched Items */}
                            {filteredItems.map((item) => (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    to={`/streams/${item.type}/${item.id}`}
                                    className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all group flex flex-col shadow-lg"
                                >
                                    <div className="relative mb-4 aspect-square">
                                        <img
                                            src={item.image_url}
                                            className={`w-full h-full object-cover shadow-2xl ${item.type === 'artist' ? 'rounded-full' : 'rounded-lg'}`}
                                            alt={item.title}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                        <div className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl translate-y-2 group-hover:translate-y-0 hover:scale-105 text-black">
                                            <Play size={24} fill="black" className="ml-1" />
                                        </div>
                                    </div>
                                    <h3 className="font-black text-white truncate text-lg tracking-tight">{item.title}</h3>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">{item.subtitle.split(' • ')[0]}</p>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredItems.length === 0 && filter !== 'all' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Music size={32} className="text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Build your collection</h2>
                            <p className="text-gray-400 max-w-sm mx-auto font-medium">
                                Save artists or playlists to see them here and access them quickly.
                            </p>
                            <Link to="/streams">
                                <Button className="mt-8 bg-white text-black hover:bg-gray-200 rounded-full px-8 font-black transition-all hover:scale-105">
                                    Browse content
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </StreamsLayout>
    );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${active
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
        >
            {label}
        </button>
    );
}
