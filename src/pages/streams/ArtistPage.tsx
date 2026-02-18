import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Loader2, Play, Pause } from 'lucide-react';

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
            <MainLayout>
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                </div>
            </MainLayout>
        );
    }

    if (!artist) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <p>Artist not found.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-black text-white pb-24">
                {/* Hero Header */}
                <div className="bg-gradient-to-b from-gray-800 to-black pt-20 pb-6 px-8 relative">
                    {artist.banner_url && (
                        <div className="absolute inset-0 z-0 opacity-30">
                            <img src={artist.banner_url} alt="Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
                        </div>
                    )}
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex items-end gap-6">
                            {/* Artist Image */}
                            <div className="w-56 h-56 rounded-full shadow-2xl bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {artist.image_url ? (
                                    <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-8xl">🎤</div>
                                )}
                            </div>

                            {/* Artist Info */}
                            <div className="flex-1 pb-6">
                                {artist.is_verified && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        <span className="text-sm font-semibold">Verified Artist</span>
                                    </div>
                                )}
                                <h1 className="text-6xl md:text-8xl font-comfortaa font-semibold mb-6 leading-none">{artist.name}</h1>
                                {artist.bio && (
                                    <p className="text-sm text-gray-300 max-w-2xl line-clamp-2">{artist.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-black px-8 pt-6 pb-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-6">
                        {/* Play Button */}
                        {topTracks.length > 0 && (
                            <button
                                onClick={() => handlePlaySong(topTracks[0])}
                                className="w-14 h-14 rounded-full bg-green-500 hover:scale-105 transition flex items-center justify-center shadow-xl"
                            >
                                <Play fill="black" className="w-6 h-6 ml-1 text-black" />
                            </button>
                        )}

                        {/* Follow Button */}
                        <button
                            onClick={() => setFollowing(!following)}
                            className={`px-8 py-2 rounded-full font-semibold transition bg-transparent border border-gray-400 text-white hover:border-white`}
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
                                        <div className="text-gray-400 group-hover:text-white flex justify-center">
                                            {currentSong?.id === track.id && isPlaying ? (
                                                <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3 h-3" alt="playing" />
                                            ) : (
                                                <>
                                                    <span className="group-hover:hidden">{index + 1}</span>
                                                    <Play fill="white" className="w-4 h-4 hidden group-hover:block" />
                                                </>
                                            )}
                                        </div>

                                        {/* Track Info */}
                                        <div className="flex gap-3 items-center min-w-0">
                                            <img src={track.cover_url} alt={track.title} className="w-10 h-10 object-cover rounded" />
                                            <div className="min-w-0 flex-1">
                                                <div className={`font-semibold truncate transition ${currentSong?.id === track.id ? 'text-green-500' : 'text-white'}`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                                    {/* <span>{track.plays || 0} plays</span> */}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Album */}
                                        <div className="text-sm text-gray-400 truncate hidden md:block">
                                            {(track as any).album_title}
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
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {albums.map((album) => (
                                    <div key={album.id} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer group">
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                src={album.cover_url || '/placeholder-music.png'}
                                                alt={album.title}
                                                className="w-full h-full object-cover rounded shadow-lg"
                                            />
                                            <button className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                                                <Play fill="black" className="w-6 h-6 ml-1" />
                                            </button>
                                        </div>
                                        <h3 className="font-semibold text-base mb-1 truncate">{album.title}</h3>
                                        <p className="text-sm text-gray-400">{new Date(album.release_date).getFullYear()} • {album.type || 'Album'}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
