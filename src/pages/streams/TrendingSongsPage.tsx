import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { useSongContextMenu } from '@/components/streams/SongContextMenu';
import { Play, Pause } from 'lucide-react';
import { PAID_MUSIC_ENABLED } from '@/lib/features';
import { filterPublished } from '@/lib/publishFilter';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Loader2 } from 'lucide-react';

const PAGE_SIZE = 24;

export default function TrendingSongsPage() {
    const { play, playAlbum, currentSong, isPlaying } = useAudioPlayer();
    const { handlers: contextMenuHandlers } = useSongContextMenu();
    const [songs, setSongs] = useState<Song[]>([]);
    const [ftMap, setFtMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchFeaturedArtists = async (ids: string[]) => {
        if (ids.length === 0) return;
        const { data: ftData } = await supabase
            .from('song_artists')
            .select('song_id, artists(name)')
            .in('song_id', ids)
            .eq('role', 'featured');
        const map: Record<string, string[]> = {};
        if (ftData) {
            for (const e of ftData as any[]) {
                const name = e.artists?.name;
                if (name) { if (!map[e.song_id]) map[e.song_id] = []; map[e.song_id].push(name); }
            }
        }
        setFtMap(prev => {
            const next = { ...prev };
            for (const [sid, names] of Object.entries(map)) next[sid] = ` ft. ${names.join(', ')}`;
            return next;
        });
    };

    // Pagination (STREAMS_MASTER_PLAN.md §J2) — this page used to fetch every
    // song in one unbounded query; now fetches PAGE_SIZE at a time via range().
    const fetchPage = async (offset: number) => {
        const { data, error } = await supabase
            .from('songs')
            .select('*, artists(name)')
            .order('plays', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;
        if (!data) return [];

        const formattedSongs: Song[] = filterPublished(data).map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artists?.name || 'Unknown Artist',
            file_url: song.file_url,
            cover_url: song.cover_url || '/placeholder-music.png',
            duration: song.duration,
            artist_id: song.artist_id,
            album_id: song.album_id,
            price: song.price ?? null,
        }));
        if (data.length < PAGE_SIZE) setHasMore(false);
        return formattedSongs;
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setHasMore(true);
                const formattedSongs = await fetchPage(0);
                setSongs(formattedSongs);
                fetchFeaturedArtists(formattedSongs.map(s => s.id));
            } catch (error) {
                console.error('Error fetching trending songs:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const nextSongs = await fetchPage(songs.length);
            setSongs(prev => [...prev, ...nextSongs]);
            fetchFeaturedArtists(nextSongs.map(s => s.id));
        } catch (error) {
            console.error('Error fetching more trending songs:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handlePlaySong = (song: Song) => {
        // Set all trending songs as queue so next/prev work
        const idx = songs.findIndex(s => s.id === song.id);
        playAlbum(songs, idx >= 0 ? idx : 0);
    };

    return (
        <StreamsLayout>
            <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24 bg-gray-50">
                <h1 className="text-4xl font-bold mb-8 tracking-tight text-gray-900">Trending Songs</h1>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} type="product" />
                        ))}
                    </div>
                ) : (
                    <ScrollReveal className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {songs.map(song => (
                            <div key={song.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col h-full shadow-lg" {...contextMenuHandlers(song)}>
                                <div className="relative mb-4 aspect-square shadow-2xl">
                                    <img
                                        loading="lazy" src={song.cover_url}
                                        alt={song.title}
                                        className="w-full h-full object-cover rounded-md shadow-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/placeholder-music.png';
                                        }}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                        className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"
                                    >
                                        {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                    </button>
                                </div>
                                <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{song.title}</h3>
                                <p className="text-xs text-gray-500 truncate mt-auto">
                                    {song.artist}{ftMap[song.id] || ''}
                                    {PAID_MUSIC_ENABLED && song.price && song.price > 0 && <span className="ml-1.5 text-[10px] font-bold text-gray-700">${song.price.toFixed(2)}</span>}
                                </p>
                            </div>
                        ))}
                    </ScrollReveal>
                )}

                {!loading && hasMore && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </StreamsLayout>
    );
}
