import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { Play, Radar } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function NewReleasesPage() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [radarSongs, setRadarSongs] = useState<any[]>([]);
    const [radarLoading, setRadarLoading] = useState(false);
    const { play, playAlbum, currentSong, isPlaying } = useAudioPlayer();
    const { user, isSignedIn } = useUser();

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
                playAlbum(songs, 0);
            }
        } catch (error) {
            console.error('Error playing album:', error);
        }
    };

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

    useEffect(() => {
        if (!isSignedIn || !user?.id) {
            setRadarSongs([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                setRadarLoading(true);
                const { data: follows } = await supabase
                    .from('user_follows')
                    .select('followee_user_id')
                    .eq('follower_user_id', user.id);
                const followeeIds = (follows || []).map(f => f.followee_user_id);
                if (followeeIds.length === 0) {
                    if (!cancelled) setRadarSongs([]);
                    return;
                }
                const { data: artistRows } = await supabase
                    .from('artists')
                    .select('id')
                    .in('user_id', followeeIds);
                const artistIds = (artistRows || []).map(a => a.id);
                if (artistIds.length === 0) {
                    if (!cancelled) setRadarSongs([]);
                    return;
                }
                const since = new Date();
                since.setDate(since.getDate() - 30);
                const { data: songs } = await supabase
                    .from('songs')
                    .select('id, title, cover_url, file_url, duration, created_at, artists(name)')
                    .in('artist_id', artistIds)
                    .gte('created_at', since.toISOString())
                    .order('created_at', { ascending: false })
                    .limit(24);
                if (!cancelled) setRadarSongs(songs || []);
            } catch (e) {
                console.error('Error fetching release radar:', e);
                if (!cancelled) setRadarSongs([]);
            } finally {
                if (!cancelled) setRadarLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isSignedIn, user?.id]);

    const playRadar = (index: number) => {
        const songs: Song[] = radarSongs.map(s => ({
            id: s.id,
            title: s.title,
            artist: s.artists?.name || 'Unknown Artist',
            file_url: s.file_url,
            cover_url: s.cover_url || '/placeholder-music.png',
            duration: s.duration,
        }));
        if (songs.length > 0) playAlbum(songs, index);
    };

    return (
        <StreamsLayout>
            <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24 bg-gray-50">
                <h1 className="text-4xl font-bold mb-8 tracking-tight text-gray-900">New Releases</h1>

                {isSignedIn && (
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Radar className="w-6 h-6 text-[#1DB954]" />
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Release Radar</h2>
                            <span className="text-sm text-gray-500">New from artists you follow (last 30 days)</span>
                        </div>
                        {radarLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} type="product" />
                                ))}
                            </div>
                        ) : radarSongs.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">
                                <p className="text-gray-600 mb-2">Your radar is quiet.</p>
                                <p className="text-sm text-gray-500">
                                    Follow artists on their <Link to="/streams/artists" className="text-[#1DB954] hover:underline">profiles</Link> to see their new releases here.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {radarSongs.map((song, i) => (
                                    <div key={song.id} className="bg-white border border-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-all group flex flex-col shadow-md">
                                        <div className="relative mb-3 aspect-square">
                                            <img
                                                loading="lazy"
                                                src={song.cover_url || '/placeholder-music.png'}
                                                alt={song.title}
                                                className="w-full h-full object-cover rounded-md"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = '/placeholder-music.png';
                                                }}
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); playRadar(i); }}
                                                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95"
                                            >
                                                <Play size={20} fill="black" className="ml-0.5" />
                                            </button>
                                        </div>
                                        <h3 className="font-semibold truncate text-gray-900 text-sm">{song.title}</h3>
                                        <p className="text-xs text-gray-500 truncate">{song.artists?.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <h2 className="text-2xl font-bold mb-4 tracking-tight text-gray-900">All New Releases</h2>
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} type="product" />
                        ))}
                    </div>
                ) : (
                    <ScrollReveal className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {albums.map(album => (
                            <div key={album.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col h-full shadow-lg">
                                <div className="relative mb-4 aspect-square shadow-2xl">
                                    <img
                                        loading="lazy" src={album.cover_url}
                                        alt={album.title}
                                        className="w-full h-full object-cover rounded-md shadow-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/placeholder-album.png';
                                        }}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePlayAlbum(album.id); }}
                                        className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"
                                    >
                                        <Play size={24} fill="black" className="ml-1" />
                                    </button>
                                </div>
                                <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{album.title}</h3>
                                <p className="text-xs text-gray-500 truncate mt-auto">{album.artists?.name}</p>
                            </div>
                        ))}
                    </ScrollReveal>
                )}
            </div>
        </StreamsLayout>
    );
}
