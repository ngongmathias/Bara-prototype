import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Loader2, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StreamsHome() {
    const { play, currentSong, isPlaying, togglePlay } = useAudioPlayer();
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [popularArtists, setPopularArtists] = useState<any[]>([]);
    const [newReleases, setNewReleases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Trending Songs (by plays)
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*, artists(name)')
                    .order('plays', { ascending: false })
                    .limit(5);

                if (songsData) {
                    const formattedSongs: Song[] = songsData.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artists?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || '/placeholder-music.png', // Fallback
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id
                    }));
                    setTrendingSongs(formattedSongs);
                }

                // Fetch Popular Artists
                const { data: artistsData } = await supabase
                    .from('artists')
                    .select('*')
                    .eq('is_verified', true)
                    .limit(5);
                setPopularArtists(artistsData || []);

                // Fetch New Releases (Albums)
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*, artists(name)')
                    .order('release_date', { ascending: false })
                    .limit(5);
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
        <MainLayout>
            <div className="min-h-screen bg-black text-white pb-24">
                {/* Main Content */}
                <main className="p-6">
                    {/* Greeting */}
                    <h1 className="text-4xl font-comfortaa font-semibold mb-6">Good evening</h1>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                        </div>
                    ) : (
                        <>
                            {/* Quick Access Tiles - For now static placeholders or derived from history */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <QuickAccessTile
                                    title="Liked Songs"
                                    gradient="from-purple-700 to-purple-500"
                                    icon="💜"
                                />
                                <QuickAccessTile
                                    title="Discover Weekly"
                                    gradient="from-blue-800 to-blue-600"
                                    icon="🎵"
                                />
                                <QuickAccessTile
                                    title="Release Radar"
                                    gradient="from-green-700 to-green-500"
                                    icon="📡"
                                />
                            </div>

                            {/* Trending Songs */}
                            <Section title="Trending songs">
                                {trendingSongs.length > 0 ? (
                                    trendingSongs.map(song => (
                                        <div key={song.id} className="bg-gray-900/50 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition group">
                                            <div className="relative mb-4 aspect-square">
                                                <img
                                                    src={song.cover_url}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover rounded-lg shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }}
                                                />
                                                <button
                                                    onClick={() => handlePlaySong(song)}
                                                    className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center transition shadow-lg ${currentSong?.id === song.id && isPlaying ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-100'
                                                        }`}
                                                >
                                                    {currentSong?.id === song.id && isPlaying ? <Pause fill="black" className="w-5 h-5" /> : <Play fill="black" className="w-5 h-5 ml-1" />}
                                                </button>
                                            </div>
                                            <h3 className="font-semibold truncate mb-1">{song.title}</h3>
                                            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full">No songs uploaded yet.</p>
                                )}
                            </Section>

                            {/* Popular Artists */}
                            <Section title="Popular artists">
                                {popularArtists.length > 0 ? (
                                    popularArtists.map(artist => (
                                        <Link key={artist.id} to={`/streams/artist/${artist.id}`}>
                                            <div className="bg-gray-900/50 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition group">
                                                <div className="relative mb-4 aspect-square">
                                                    <img
                                                        src={artist.image_url}
                                                        alt={artist.name}
                                                        className="w-full h-full object-cover rounded-full shadow-lg"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'; }}
                                                    />
                                                </div>
                                                <h3 className="font-semibold truncate mb-1 text-center">{artist.name}</h3>
                                                <p className="text-sm text-gray-400 text-center">Artist</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full">No artists found.</p>
                                )}
                            </Section>

                            {/* New Releases */}
                            <Section title="New Releases">
                                {newReleases.length > 0 ? (
                                    newReleases.map(album => (
                                        <div key={album.id} className="bg-gray-900/50 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition group">
                                            <div className="relative mb-4 aspect-square">
                                                <img
                                                    src={album.cover_url}
                                                    alt={album.title}
                                                    className="w-full h-full object-cover rounded-lg shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'; }}
                                                />
                                            </div>
                                            <h3 className="font-semibold truncate mb-1">{album.title}</h3>
                                            <p className="text-sm text-gray-400 truncate">{album.artists?.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full">No albums found.</p>
                                )}
                            </Section>
                        </>
                    )}
                </main>


            </div>
        </MainLayout>
    );
}

function QuickAccessTile({ title, gradient, icon }: { title: string; gradient: string; icon: string }) {
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:scale-105 transition group`}>
            <div className="w-16 h-16 bg-black/20 rounded flex items-center justify-center">
                <span className="text-3xl">{icon}</span>
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <button className="ml-auto w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                <Play fill="black" className="w-5 h-5 ml-1" />
            </button>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-comfortaa font-semibold">{title}</h2>
                <a href="#" className="text-sm text-gray-400 hover:text-white hover:underline">
                    Show all
                </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {children}
            </div>
        </div>
    );
}


