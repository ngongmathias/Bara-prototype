import { useEffect, useState } from 'react';

import { StreamsLayout } from '@/components/streams/StreamsLayout';

import { supabase } from '@/lib/supabase';

import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';

import { Loader2, Play, Pause, Clock } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

import { Link } from 'react-router-dom';

import { SEO } from '@/components/SEO';



export default function StreamsHome() {

    const { toast } = useToast();

    const { play, currentSong, isPlaying, playAlbum } = useAudioPlayer();

    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);

    const [popularArtists, setPopularArtists] = useState<any[]>([]);

    const [newReleases, setNewReleases] = useState<any[]>([]);

    const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);

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



                // Fetch Recently Played (from play_history)

                try {

                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {

                        const { data: historyData } = await supabase

                            .from('play_history')

                            .select('song_id, played_at, songs(*, artists(name))')

                            .eq('user_id', user.id)

                            .order('played_at', { ascending: false })

                            .limit(20);



                        if (historyData) {

                            // Deduplicate: keep only the most recent play of each song

                            const seen = new Set<string>();

                            const unique: Song[] = [];

                            for (const entry of historyData) {

                                const song = (entry as any).songs;

                                if (song && !seen.has(song.id)) {

                                    seen.add(song.id);

                                    unique.push({

                                        id: song.id,

                                        title: song.title,

                                        artist: song.artists?.name || 'Unknown Artist',

                                        file_url: song.file_url,

                                        cover_url: song.cover_url || '/placeholder-music.png',

                                        duration: song.duration,

                                        artist_id: song.artist_id,

                                        album_id: song.album_id,

                                    });

                                }

                            }

                            setRecentlyPlayed(unique.slice(0, 10));

                        }

                    }

                } catch {

                    // Silently fail - recently played is not critical

                }



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



    const handlePlayArtist = async (artistId: string) => {

        try {

            const { data: songsData } = await supabase

                .from('songs')

                .select('*, artists(name)')

                .eq('artist_id', artistId)

                .order('plays', { ascending: false })

                .limit(1);



            if (songsData && songsData.length > 0) {

                const song = songsData[0];

                play({

                    id: song.id,

                    title: song.title,

                    artist: song.artists?.name || 'Unknown Artist',

                    file_url: song.file_url,

                    cover_url: song.cover_url || '/placeholder-music.png',

                    duration: song.duration,

                });

            }

        } catch (error) {

            console.error('Error playing artist top song:', error);

        }

    };



    const handlePlayAlbum = async (albumId: string) => {

        try {

            const { data: songsData } = await supabase

                .from('songs')

                .select('*, artists(name)')

                .eq('album_id', albumId)

                .order('track_number', { ascending: true });



            if (songsData && songsData.length > 0) {

                const songs: Song[] = songsData.map(song => ({

                    id: song.id,

                    title: song.title,

                    artist: song.artists?.name || 'Unknown Artist',

                    file_url: song.file_url,

                    cover_url: song.cover_url || '/placeholder-music.png',

                    duration: song.duration,

                }));

                // Using playAlbum from context if available, otherwise just play first song

                // Based on AudioPlayerContext, playAlbum exists

                playAlbum(songs, 0);

            }

        } catch (error) {

            console.error('Error playing album:', error);

        }

    };



    return (

        <StreamsLayout>

            <SEO

                title="Music Streams"

                description="Listen to the latest trending African music, explore popular artists, and discover new releases on Bara Afrika Streams."

                keywords={['African Music', 'Music Streaming', 'Bara Streams', 'Afrobeats', 'Highlife']}

            />

            <div className="min-h-screen pb-24">

                {/* Main Content */}

                <main className="p-4 sm:p-8 max-w-[1400px] mx-auto">

                    {/* Greeting */}

                    <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 tracking-tight text-white">Good evening</h1>



                    {loading ? (

                        <div className="flex justify-center py-20">

                            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />

                        </div>

                    ) : (

                        <div className="space-y-8 sm:space-y-12">

                            {/* Quick Access Tiles */}

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">

                                <QuickAccessTile

                                    title="Liked Songs"

                                    gradient="from-purple-900 to-purple-800"

                                    icon="💜"

                                    to="/streams/liked"

                                />

                                <QuickAccessTile

                                    title="Afrobeats Mix"

                                    gradient="from-orange-900 to-orange-800"

                                    icon="🌍"

                                    to="/streams/search?q=Afrobeats"

                                />

                                <QuickAccessTile

                                    title="Amapiano Mix"

                                    gradient="from-yellow-900 to-yellow-800"

                                    icon="🎹"

                                    to="/streams/search?q=Amapiano"

                                />

                            </div>



                            {/* Made For You - Curated Mixes */}

                            <Section title="Made For You">

                                {[

                                    { id: '1', title: 'Discover Weekly', artist: 'Personalized for you', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', gradient: 'from-blue-600 to-blue-800' },

                                    { id: '2', title: 'Daily Mix 1', artist: 'Afrobeats & Highlife', cover: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', gradient: 'from-green-600 to-green-800' },

                                    { id: '3', title: 'Daily Mix 2', artist: 'Amapiano Beats', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop', gradient: 'from-orange-600 to-orange-800' },

                                    { id: '4', title: 'Release Radar', artist: 'New from artists you follow', cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', gradient: 'from-purple-600 to-purple-800' }

                                ].map(mix => (

                                    <div key={mix.id} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start shadow-xl border border-white/5">

                                        <div className="relative mb-4 aspect-square shadow-2xl">

                                            <div className={`absolute inset-0 bg-gradient-to-br ${mix.gradient} opacity-20 rounded-lg`} />

                                            <img

                                                src={mix.cover}

                                                alt={mix.title}

                                                className="w-full h-full object-cover rounded-md shadow-xl"

                                            />

                                            <button

                                                onClick={() => {

                                                    toast({

                                                        title: 'Coming Soon',

                                                        description: 'Personalized mixes are still in development.',

                                                    });

                                                }}

                                                className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"

                                            >

                                                <Play size={24} fill="black" className="ml-1" />

                                            </button>

                                        </div>

                                        <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{mix.title}</h3>

                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{mix.artist}</p>

                                    </div>

                                ))}

                            </Section>



                            {/* Recently Played */}

                            {recentlyPlayed.length > 0 && (

                                <Section title="Recently played">

                                    {recentlyPlayed.map(song => (

                                        <div key={song.id} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">

                                            <div className="relative mb-4 aspect-square shadow-2xl">

                                                <img

                                                    src={song.cover_url}

                                                    alt={song.title}

                                                    className="w-full h-full object-cover rounded-md shadow-lg"

                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }}

                                                />

                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">

                                                    <Clock size={10} /> Played

                                                </div>

                                                <button

                                                    onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}

                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"

                                                >

                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}

                                                </button>

                                            </div>

                                            <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{song.title}</h3>

                                            <p className="text-xs text-gray-400 truncate mt-auto">{song.artist}</p>

                                        </div>

                                    ))}

                                </Section>

                            )}



                            {/* Trending Songs */}

                            <Section title="Trending songs" showAllLink="/streams/trending">

                                {trendingSongs.length > 0 ? (

                                    trendingSongs.map(song => (

                                        <div key={song.id} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">

                                            <div className="relative mb-4 aspect-square shadow-2xl">

                                                <img

                                                    src={song.cover_url}

                                                    alt={song.title}

                                                    className="w-full h-full object-cover rounded-md shadow-lg"

                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }}

                                                />

                                                <button

                                                    onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}

                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"

                                                >

                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}

                                                </button>

                                            </div>

                                            <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{song.title}</h3>

                                            <p className="text-xs text-gray-400 truncate mt-auto">{song.artist}</p>

                                        </div>

                                    ))

                                ) : (

                                    <div className="min-w-full py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">

                                        <p className="text-gray-500">No trending songs found. Use Admin panel to seed.</p>

                                    </div>

                                )}

                            </Section>



                            {/* Popular Artists */}

                            <Section title="Popular artists" showAllLink="/streams/artists">

                                {popularArtists.length > 0 ? (

                                    popularArtists.map(artist => (

                                        <Link key={artist.id} to={`/streams/artist/${artist.id}`} className="group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">

                                            <div className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 w-full text-center">

                                                <div className="relative mb-4 aspect-square shadow-2xl">

                                                    <img

                                                        src={artist.image_url}

                                                        alt={artist.name}

                                                        className="w-full h-full object-cover rounded-full shadow-lg"

                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'; }}

                                                    />

                                                    <button

                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlayArtist(artist.id); }}

                                                        className="absolute bottom-6 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"

                                                    >

                                                        <Play size={24} fill="black" className="ml-1" />

                                                    </button>

                                                </div>

                                                <h3 className="font-bold truncate text-white mb-1 text-sm">{artist.name}</h3>

                                                <p className="text-xs text-gray-400">Artist</p>

                                            </div>

                                        </Link>

                                    ))

                                ) : (

                                    <p className="text-gray-500 min-w-full py-12 text-center">No artists found.</p>

                                )}

                            </Section>



                            {/* Popular Albums and Singles */}

                            <Section title="Popular albums and singles" showAllLink="/streams/new-releases">

                                {newReleases.length > 0 ? (

                                    newReleases.map(album => (

                                        <div key={album.id} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">

                                            <div className="relative mb-4 aspect-square shadow-2xl">

                                                <img

                                                    src={album.cover_url}

                                                    alt={album.title}

                                                    className="w-full h-full object-cover rounded-md shadow-lg"

                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'; }}

                                                />

                                                <button

                                                    onClick={(e) => { e.stopPropagation(); handlePlayAlbum(album.id); }}

                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"

                                                >

                                                    <Play size={24} fill="black" className="ml-1" />

                                                </button>

                                            </div>

                                            <h3 className="font-bold truncate text-white mb-1 text-sm">{album.title}</h3>

                                            <p className="text-xs text-gray-400 truncate mt-auto">{album.artists?.name}</p>

                                        </div>

                                    ))

                                ) : (

                                    <p className="text-gray-500 min-w-full py-12 text-center">No albums found.</p>

                                )}

                            </Section>



                            {/* Popular Radio */}

                            <Section title="Popular radio" showAllLink="/streams/radio">

                                {[

                                    { id: 'r1', title: 'Mike Kayihura', images: ['https://images.unsplash.com/photo-1520127873598-d22ecf253289?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop'], color: 'bg-[#509bf5]', footer: 'With Andy Bumuntu, Yvan Buravan, Igor...' },

                                    { id: 'r2', title: 'Kivumbi King', images: ['https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=200&h=200&fit=crop'], color: 'bg-[#9b50f5]', footer: 'With Amalon, Nel Ngabo, Ish Kevin and more' },

                                    { id: 'r3', title: 'The Ben', images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1520127873598-d22ecf253289?w=200&h=200&fit=crop'], color: 'bg-[#f5509b]', footer: 'With Meddy, Bruce Melodie, Christopher...' },

                                    { id: 'r4', title: 'Bruce Melodie', images: ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=200&h=200&fit=crop'], color: 'bg-[#50f59b]', footer: 'With Davis D, Chriss Eazy, Juno Kizigenza and more' },

                                    { id: 'r5', title: 'Rema', images: ['https://plus.unsplash.com/premium_photo-1661601614051-9e7978280628?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1520127873598-d22ecf253289?w=200&h=200&fit=crop'], color: 'bg-[#f59b50]', footer: 'With Shallipopi, ODUMODUBLVCK, Kizz...' }

                                ].map(radio => (

                                    <RadioCard key={radio.id} {...radio} />

                                ))}

                            </Section>



                            {/* Featured Charts */}

                            <Section title="Featured Charts" showAllLink="/streams/charts">

                                {[

                                    { id: 'c1', title: 'Top Songs Global', type: 'Weekly Music Charts', gradient: 'from-[#4e3c92] to-[#6a54bd]', footer: 'Your weekly update of the most played tracks...' },

                                    { id: 'c2', title: 'Top Songs USA', type: 'Weekly Music Charts', gradient: 'from-[#e91e63] to-[#ff4081]', footer: 'Your weekly update of the most played tracks...' },

                                    { id: 'c3', title: 'Top 50 Global', type: 'Daily Update', gradient: 'from-[#009688] to-[#26a69a]', footer: 'Your daily update of the most played tracks right...' },

                                    { id: 'c4', title: 'Top 50 USA', type: 'Daily Update', gradient: 'from-[#f44336] to-[#ef5350]', footer: 'Your daily update of the most played tracks right...' },

                                    { id: 'c5', title: 'Viral 50 Global', type: 'Daily Update', gradient: 'from-[#4caf50] to-[#66bb6a]', footer: 'Your daily update of the most viral tracks right...' }

                                ].map(chart => (

                                    <ChartCard key={chart.id} {...chart} />

                                ))}

                            </Section>



                        </div>

                    )}

                </main>

            </div>

        </StreamsLayout>

    );

}



function QuickAccessTile({ title, gradient, icon, to }: { title: string; gradient: string; icon: string; to: string }) {

    return (

        <Link to={to} className="bg-white/10 rounded-md flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all duration-300 group overflow-hidden relative">

            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>

                <span className="text-xl sm:text-2xl">{icon}</span>

            </div>

            <h3 className="font-bold text-sm sm:text-base text-white truncate pr-12">{title}</h3>

            <button className="absolute right-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95">

                <Play size={20} fill="black" className="ml-1" />

            </button>

        </Link>

    );

}



function RadioCard({ title, images, color, footer }: { title: string; images: string[]; color: string; footer: string }) {

    return (

        <div className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start border border-white/5">

            <div className={`relative mb-4 aspect-square shadow-2xl rounded-md overflow-hidden ${color}`}>

                <div className="absolute top-2 right-2 text-[10px] font-black tracking-tighter text-white opacity-80 uppercase">Radio</div>



                {/* Image Collage */}

                <div className="absolute inset-0 flex items-center justify-center">

                    {/* Left Small */}

                    <img src={images[1]} className="absolute w-[40%] aspect-square rounded-full border-2 border-black/20 left-[10%] z-0 scale-90 translate-y-2 opacity-80" alt="" />

                    {/* Right Small */}

                    <img src={images[2]} className="absolute w-[40%] aspect-square rounded-full border-2 border-black/20 right-[10%] z-0 scale-90 translate-y-2 opacity-80" alt="" />

                    {/* Center Large */}

                    <img src={images[0]} className="w-[60%] aspect-square rounded-full border-4 border-black/20 z-10 shadow-2xl" alt="" />

                </div>



                <div className="absolute bottom-4 left-4 right-4">

                    <h3 className="text-xl font-black text-white leading-tight tracking-tighter truncate">{title}</h3>

                </div>



                <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-20">

                    <Play size={24} fill="black" className="ml-1" />

                </button>

            </div>

            <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{title} Radio</h3>

            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{footer}</p>

        </div>

    );

}



function ChartCard({ title, type, gradient, footer }: { title: string; type: string; gradient: string; footer: string }) {

    return (

        <div className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start border border-white/5">

            <div className={`relative mb-4 aspect-square shadow-2xl rounded-md overflow-hidden bg-gradient-to-br ${gradient}`}>

                <div className="absolute top-4 left-4">

                    <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">

                        <div className="w-3 h-3 bg-[#1DB954] rounded-full rotate-45" />

                    </div>

                </div>



                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">

                    <h4 className="text-3xl font-black text-white leading-none tracking-tighter mb-2 overflow-hidden break-words">{title.split(' ').join('\n')}</h4>

                </div>



                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">

                    <div className="h-4 w-[2px] bg-white/40" />

                    <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">{type}</span>

                </div>



                <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-20">

                    <Play size={24} fill="black" className="ml-1" />

                </button>

            </div>

            <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{title}</h3>

            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{footer}</p>

        </div>

    );

}



function Section({ title, children, showAllLink }: { title: string; children: React.ReactNode; showAllLink?: string }) {

    return (

        <div className="mb-12">

            <div className="flex items-center justify-between mb-4">

                <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">{title}</h2>

                {showAllLink && (

                    <Link to={showAllLink} className="text-sm font-bold text-gray-400 hover:text-white transition-colors hover:underline">

                        Show all

                    </Link>

                )}

            </div>

            <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 snap-x -mx-2 px-2">

                {children}

            </div>

        </div>

    );

}



