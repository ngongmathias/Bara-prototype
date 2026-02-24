import { useEffect, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Loader2, Play, Pause } from 'lucide-react';

export default function TrendingSongsPage() {
    const { play, currentSong, isPlaying } = useAudioPlayer();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('songs')
                    .select('*, artists(name)')
                    .order('plays', { ascending: false });

                if (error) throw error;

                if (data) {
                    const formattedSongs: Song[] = data.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artists?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id
                    }));
                    setSongs(formattedSongs);
                }
            } catch (error) {
                console.error('Error fetching trending songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const handlePlaySong = (song: Song) => {
        play(song);
    };

    return (
        <StreamsLayout>
            <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24 bg-[#121212]">
                <h1 className="text-4xl font-bold mb-8 tracking-tight text-white">Trending Songs</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {songs.map(song => (
                            <div key={song.id} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col h-full shadow-lg">
                                <div className="relative mb-4 aspect-square shadow-2xl">
                                    <img
                                        src={song.cover_url}
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
                                        className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"
                                    >
                                        {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                                    </button>
                                </div>
                                <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">{song.title}</h3>
                                <p className="text-xs text-gray-400 truncate mt-auto">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StreamsLayout>
    );
}
