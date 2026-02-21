import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { SEO } from '@/components/SEO';
import { Loader2, Play, Pause, BadgeCheck } from 'lucide-react';

export default function ArtistPage() {
    const { id } = useParams();
    const { play, currentSong, isPlaying, togglePlay } = useAudioPlayer();
    const [artist, setArtist] = useState<any>(null);
    const [topTracks, setTopTracks] = useState<Song[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Artist Details
                const { data: artistData } = await supabase
                    .from('artists')
                    .select('*')
                    .eq('id', id)
                    .single();
                setArtist(artistData);

                // Fetch Top Tracks (by plays)
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*, albums(title, cover_url)')
                    .eq('artist_id', id)
                    .order('plays', { ascending: false })
                    .limit(5);

                if (songsData) {
                    const formattedSongs: Song[] = songsData.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: artistData?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || song.albums?.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id,
                        album_title: song.albums?.title
                    }));
                    setTopTracks(formattedSongs);
                }

                // Fetch Albums
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*')
                    .eq('artist_id', id)
                    .order('release_date', { ascending: false });
                setAlbums(albumsData || []);

            } catch (error) {
                console.error('Error fetching artist data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePlaySong = (song: Song) => {
        play(song);
    };

    if (loading) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                </div>
            </StreamsLayout>
        );
    }

    if (!artist) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <p>Artist not found.</p>
                </div>
            </StreamsLayout>
        );
    }

    const artistSchema = {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        "name": artist.name,
        "image": artist.banner_url || artist.image_url,
        "description": artist.bio || `Listen to ${artist.name} on Bara Afrika Streams.`,
        "track": topTracks.map(track => ({
            "@type": "MusicRecording",
            "name": track.title,
            "url": `${window.location.origin}/streams/artist/${id}`
        })),
        "album": albums.map(album => ({
            "@type": "MusicAlbum",
            "name": album.title,
            "image": album.cover_url
        }))
    };

    return (
        <StreamsLayout>
            <SEO
                title={artist.name}
                description={`Explore ${artist.name}'s music, top tracks, and albums on Bara Afrika. Discover the best of African sounds.`}
                image={artist.banner_url}
                type="music.song" // Or just keep as website/article if music.group isn't standard OG type
                keywords={[artist.name, 'African Music', 'Bara Streams', 'African Artist']}
                schemaData={artistSchema}
            />
            <div className="min-h-screen bg-black text-white pb-24">
                {/* Hero Header */}
                <div className="bg-gradient-to-b from-gray-700 to-[#121212] pt-20 pb-6 px-8 relative">
                    {artist.banner_url && (
                        <div className="absolute inset-0 z-0">
                            <img src={artist.banner_url} alt="Banner" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#121212]"></div>
                        </div>
                    )}
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex items-end gap-6 pb-6">
                            {/* Artist Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <BadgeCheck className="text-blue-400 w-6 h-6 fill-blue-400/20" />
                                    <span className="text-sm font-bold">Verified Artist</span>
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-none tracking-tighter text-white">{artist.name}</h1>
                                <p className="text-sm font-bold text-gray-300">
                                    {Math.floor(Math.random() * 500000) + 100000} monthly listeners
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-[#121212] px-8 pt-6 pb-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-8">
                        {/* Play Button */}
                        {topTracks.length > 0 && (
                            <button
                                onClick={() => handlePlaySong(topTracks[0])}
                                className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 transition flex items-center justify-center shadow-xl active:scale-95"
                            >
                                <Play fill="black" className="w-6 h-6 ml-1 text-black" />
                            </button>
                        )}

                        {/* Follow Button */}
                        <button
                            onClick={() => setFollowing(!following)}
                            className={`px-8 py-1.5 rounded-full font-bold transition bg-transparent border border-gray-500 text-white hover:border-white hover:scale-105 active:scale-95 text-sm uppercase tracking-widest`}
                        >
                            {following ? 'Following' : 'Follow'}
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="px-8 pt-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Popular Tracks */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-comfortaa font-semibold mb-6">Popular</h2>
                            <div className="space-y-2">
                                {topTracks.map((track, index) => (
                                    <div
                                        key={track.id}
                                        className="grid grid-cols-[16px_4fr_2fr_minmax(80px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-white/10 cursor-pointer items-center"
                                        onClick={() => handlePlaySong(track)}
                                    >
                                        {/* Track Number / Play Button */}
                                        <div className="text-gray-400 flex justify-center w-8">
                                            {currentSong?.id === track.id && isPlaying ? (
                                                <div className="flex items-end gap-[2px] h-3">
                                                    <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '60%' }}></div>
                                                    <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                                                    <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }}></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className={`group-hover:hidden ${currentSong?.id === track.id ? 'text-[#1DB954]' : ''}`}>{index + 1}</span>
                                                    <Play fill="white" className="w-4 h-4 hidden group-hover:block" />
                                                </>
                                            )}
                                        </div>

                                        {/* Track Info */}
                                        <div className="flex gap-3 items-center min-w-0">
                                            <img src={track.cover_url} alt={track.title} className="w-10 h-10 object-cover rounded" />
                                            <div className="min-w-0 flex-1">
                                                <div className={`font-bold truncate transition text-sm ${currentSong?.id === track.id ? 'text-[#1DB954]' : 'text-white'}`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                                    {/* <span>{track.plays || 0} plays</span> */}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Album */}
                                        <div className="text-sm text-gray-400 truncate hidden md:block">
                                            {track.album_title || 'Single'}
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center justify-end gap-4">
                                            <span className="text-sm text-gray-400 min-w-[40px] text-right">
                                                {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '-:-'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Discography */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-comfortaa font-semibold">Discography</h2>
                            </div>
                            <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4">
                                {albums.map((album) => (
                                    <div key={album.id} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer group min-w-[180px] flex flex-col">
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                src={album.cover_url || '/placeholder-music.png'}
                                                alt={album.title}
                                                className="w-full h-full object-cover rounded shadow-lg"
                                            />
                                            <button className="absolute right-2 bottom-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 active:scale-95">
                                                <Play fill="black" className="w-5 h-5 ml-1 text-black" />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-sm mb-1 truncate">{album.title}</h3>
                                        <p className="text-xs text-gray-400">{new Date(album.release_date).getFullYear()} • Album</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </StreamsLayout>
    );
}
