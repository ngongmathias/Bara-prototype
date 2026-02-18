import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Loader2, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StreamsHome() {
    const { play, currentSong, isPlaying } = useAudioPlayer();
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [popularArtists, setPopularArtists] = useState<any[]>([]);
    const [newReleases, setNewReleases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Trending Songs (by plays) - Increased limit for density
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*, artists(name)')
                    .order('plays', { ascending: false })
                    .limit(20);

                if (songsData) {
                    const formattedSongs: Song[] = songsData.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artists?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id
                    }));
                    setTrendingSongs(formattedSongs);
                }

                // Fetch Popular Artists - Increased limit
                const { data: artistsData } = await supabase
                    .from('artists')
                    .select('*')
                    .eq('is_verified', true)
                    .limit(20);
                setPopularArtists(artistsData || []);

                // Fetch New Releases (Albums) - Increased limit
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*, artists(name)')
                    .order('release_date', { ascending: false })
                    .limit(10);
                setNewReleases(albumsData || []);

            } catch (error) {
                console.error('Error fetching streams data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePlaySong = (song: Song) => {
        play(song);
    };

    return (
        <StreamsLayout>
            <div className="min-h-screen pb-24">
                {/* Main Content */}
                <main className="p-8 max-w-[1400px] mx-auto">
                    {/* Greeting */}
                    <h1 className="text-4xl font-bold mb-8 tracking-tight">Good evening</h1>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Quick Access Tiles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <QuickAccessTile
                                    title="Liked Songs"
                                    gradient="from-purple-900 to-purple-800"
                                    icon="💜"
                                />
                                <QuickAccessTile
                                    title="Discover Weekly"
                                    gradient="from-blue-900 to-blue-800"
                                    icon="🎵"
                                />
                                <QuickAccessTile
                                    title="Amapiano Mix"
                                    gradient="from-green-900 to-green-800"
                                    icon="🔥"
                                />
                            </div>

                            {/* Trending Songs */}
                            <Section title="Trending Now" showAllLink="/streams/trending">
                                {trendingSongs.length > 0 ? (
                                    trendingSongs.map(song => (
                                        <div key={song.id} className="bg-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300 group flex flex-col h-full">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img
                                                    src={song.cover_url}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }}
                                                />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                                    className={`absolute bottom-3 right-3 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center transition-all duration-300 shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 active:scale-95`}
                                                >
                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-white mb-1">{song.title}</h3>
                                            <p className="text-sm text-gray-400 truncate mt-auto">{song.artist}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                                        <p className="text-gray-500">No trending songs found. Use Admin panel to seed.</p>
                                    </div>
                                )}
                            </Section>

                            {/* Popular Artists */}
                            <Section title="Popular Artists" showAllLink="/streams/artists">
                                {popularArtists.length > 0 ? (
                                    popularArtists.map(artist => (
                                        <Link key={artist.id} to={`/streams/artist/${artist.id}`} className="group flex flex-col items-center">
                                            <div className="bg-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300 w-full text-center">
                                                <div className="relative mb-4 aspect-square shadow-2xl">
                                                    <img
                                                        src={artist.image_url}
                                                        alt={artist.name}
                                                        className="w-full h-full object-cover rounded-full"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'; }}
                                                    />
                                                </div>
                                                <h3 className="font-bold truncate text-white mb-1">{artist.name}</h3>
                                                <p className="text-sm text-gray-500">Artist</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full py-12 text-center">No artists found.</p>
                                )}
                            </Section>

                            {/* New Releases */}
                            <Section title="New Releases" showAllLink="/streams/new-releases">
                                {newReleases.length > 0 ? (
                                    newReleases.map(album => (
                                        <div key={album.id} className="bg-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300 group flex flex-col h-full">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img
                                                    src={album.cover_url}
                                                    alt={album.title}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'; }}
                                                />
                                            </div>
                                            <h3 className="font-bold truncate text-white mb-1">{album.title}</h3>
                                            <p className="text-sm text-gray-400 truncate mt-auto">{album.artists?.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full py-12 text-center">No albums found.</p>
                                )}
                            </Section>
                        </div>
                    )}
                </main>
            </div>
        </StreamsLayout>
    );
}

function QuickAccessTile({ title, gradient, icon }: { title: string; gradient: string; icon: string }) {
    return (
        <div className={`bg-gradient-to-r ${gradient} rounded-lg flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all duration-300 group overflow-hidden border border-white/5`}>
            <div className="w-20 h-20 bg-black/40 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">{icon}</span>
            </div>
            <h3 className="font-bold text-lg text-white">{title}</h3>
            <button className="ml-auto mr-4 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110">
                <Play size={24} fill="white" className="ml-1" />
            </button>
        </div>
    );
}

function Section({ title, children, showAllLink }: { title: string; children: React.ReactNode; showAllLink?: string }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                {showAllLink && (
                    <Link to={showAllLink} className="text-sm font-bold text-gray-400 hover:text-white transition-colors hover:underline">
                        Show all
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {children}
            </div>
        </div>
    );
}

