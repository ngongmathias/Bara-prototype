import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Heart, Play, Pause, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';

export default function LikedSongsPage() {
    const { likedSongs, playAlbum, currentSong, isPlaying, toggleLike, play } = useAudioPlayer();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedSongs = async () => {
            if (likedSongs.length === 0) {
                setSongs([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('songs')
                    .select('*, artists(name)')
                    .in('id', likedSongs);

                if (data) {
                    setSongs(data.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artists?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id
                    })));
                }
            } catch (err) {
                console.error('Error fetching liked songs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedSongs();
    }, [likedSongs]);

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playAlbum(songs);
        }
    };

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-gradient-to-b from-green-900/40 to-black p-8">
                {/* Header */}
                <div className="flex flex-col md:row items-end gap-6 mb-8 mt-12">
                    <div className="w-52 h-52 bg-gradient-to-br from-[#1DB954] to-[#15803d] shadow-2xl flex items-center justify-center rounded-lg relative group overflow-hidden">
                        <Heart size={100} fill="white" className="text-white drop-shadow-lg" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <span className="text-sm font-black uppercase tracking-widest text-white/80">Playlist</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">Liked Songs</h1>
                        <div className="flex items-center gap-2 text-white/90 text-sm mt-4 font-bold">
                            <span className="hover:underline cursor-pointer">Your Personal Collection</span>
                            <span>•</span>
                            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 mb-8 mt-4">
                    <Button
                        onClick={handlePlayAll}
                        disabled={songs.length === 0}
                        className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 transition-all text-black flex items-center justify-center shadow-xl disabled:opacity-50"
                    >
                        <Play size={28} fill="black" className="ml-1" />
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                        <p className="mt-4 text-gray-400 font-bold">Resonance incoming...</p>
                    </div>
                ) : songs.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Heart size={32} className="text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Songs you like will appear here</h2>
                        <p className="text-gray-400 max-w-sm mx-auto font-medium">
                            Save songs by tapping the heart icon to build your personal selection.
                        </p>
                        <Link to="/streams">
                            <Button className="mt-8 bg-white text-black hover:bg-gray-200 rounded-full px-8 font-black transition-all hover:scale-105">
                                Find songs to like
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-[1400px]">
                        {/* Content Table Header */}
                        <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-3 border-b border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest mb-4">
                            <span>#</span>
                            <span>Title</span>
                            <span>Artist</span>
                            <div className="flex justify-end pr-8"><Clock size={16} /></div>
                        </div>

                        {/* Song List */}
                        <div className="space-y-1">
                            {songs.map((song, index) => {
                                const isCurrent = currentSong?.id === song.id;
                                return (
                                    <div
                                        key={song.id}
                                        className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-lg group hover:bg-white/10 transition-colors items-center cursor-pointer"
                                        onClick={() => play(song)}
                                    >
                                        <div className="text-gray-400 flex items-center justify-center">
                                            {isCurrent && isPlaying ? (
                                                <div className="flex items-end gap-[2px] h-3">
                                                    <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '60%' }}></div>
                                                    <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                                                    <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }}></div>
                                                </div>
                                            ) : (
                                                <span className={`text-sm font-bold group-hover:hidden ${isCurrent ? 'text-[#1DB954]' : ''}`}>{index + 1}</span>
                                            )}
                                            <Play className="w-4 h-4 hidden group-hover:block" fill="currentColor" />
                                        </div>

                                        <div className="flex items-center gap-3 min-w-0">
                                            <img src={song.cover_url} className="w-10 h-10 rounded shadow-md object-cover" alt="" />
                                            <div className="min-w-0">
                                                <div className={`font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</div>
                                                <div className="text-sm text-gray-400 truncate md:hidden">{song.artist}</div>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-400 truncate hidden md:block font-medium">
                                            {song.artist}
                                        </div>

                                        <div className="flex items-center justify-end gap-6 pr-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                className="text-[#1DB954] hover:scale-110 transition-transform"
                                            >
                                                <Heart size={18} fill="currentColor" />
                                            </button>
                                            <span className="text-sm text-gray-500 font-mono w-10 text-right">
                                                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </StreamsLayout>
    );
}
