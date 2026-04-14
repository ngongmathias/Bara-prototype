import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Play, Pause, Heart, Share2, ArrowLeft, Music, Clock, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShareDialog } from '@/components/ShareDialog';

export default function SongPage() {
    const { id } = useParams<{ id: string }>();
    const { play, currentSong, isPlaying, togglePlay, toggleLike, likedSongs } = useAudioPlayer();
    const [song, setSong] = useState<Song | null>(null);
    const [credits, setCredits] = useState<{ role: string; name: string; artist_id: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!id) return;
        const fetchSong = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('songs')
                .select('*, artists(name), albums(title)')
                .eq('id', id)
                .single();

            if (error || !data) {
                setLoading(false);
                return;
            }

            setSong({
                id: data.id,
                title: data.title,
                artist: data.artists?.name || 'Unknown Artist',
                file_url: data.file_url,
                cover_url: data.cover_url || '/placeholder-music.png',
                duration: data.duration || 0,
                artist_id: data.artist_id,
                album_id: data.album_id,
                album_title: data.albums?.title,
            });

            // Fetch credits from song_artists
            try {
                const { data: sa } = await supabase
                    .from('song_artists')
                    .select('role, artist_id, artists(name)')
                    .eq('song_id', id)
                    .order('display_order');
                if (sa) {
                    setCredits(sa.map((s: any) => ({ role: s.role, name: s.artists?.name || '', artist_id: s.artist_id })));
                }
            } catch { /* table may not exist */ }

            setLoading(false);
        };
        fetchSong();
    }, [id]);

    // Auto-play when song loads from a shared link
    useEffect(() => {
        if (song && !currentSong) {
            play(song);
        }
    }, [song]);

    const handlePlay = () => {
        if (!song) return;
        if (currentSong?.id === song.id) {
            togglePlay();
        } else {
            play(song);
        }
    };

    const handleShare = () => setShowShare(true);

    const isCurrentSong = currentSong?.id === id;
    const isLiked = song ? likedSongs.includes(song.id) : false;

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white gap-4">
                <Music className="h-16 w-16 text-gray-500" />
                <h1 className="text-xl font-bold">Song not found</h1>
                <Link to="/streams" className="text-gray-400 hover:text-white underline">Back to Streams</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back */}
                <Link to="/streams" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                    <ArrowLeft size={18} /> Back to Streams
                </Link>

                {/* Song Card */}
                <div className="flex flex-col items-center text-center">
                    <img
                        loading="lazy" src={song.cover_url}
                        alt={song.title}
                        className="w-64 h-64 rounded-xl shadow-2xl object-cover mb-6"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                    />
                    <h1 className="text-3xl font-bold mb-1">{song.title}</h1>
                    <p className="text-gray-400 text-lg mb-1">{song.artist}</p>

                    {/* Featured artists */}
                    {credits.filter(c => c.role === 'featured').length > 0 && (
                        <p className="text-gray-500 text-sm">
                            ft. {credits.filter(c => c.role === 'featured').map(c => c.name).join(', ')}
                        </p>
                    )}

                    {song.album_title && (
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                            <Disc size={14} /> {song.album_title}
                        </p>
                    )}

                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                        <Clock size={14} /> {formatTime(song.duration)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-6">
                        <Button
                            onClick={handlePlay}
                            className="rounded-full w-14 h-14 bg-white text-black hover:scale-110 transition shadow-lg"
                        >
                            {isCurrentSong && isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-0.5" />}
                        </Button>
                        <button
                            onClick={() => toggleLike(song.id)}
                            className={`transition hover:scale-110 ${isLiked ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={handleShare} className="text-gray-400 hover:text-white transition hover:scale-110">
                            <Share2 size={22} />
                        </button>
                    </div>

                    {/* Credits */}
                    {credits.length > 0 && (
                        <div className="mt-8 w-full max-w-sm text-left">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Credits</h3>
                            <div className="space-y-2">
                                {credits.map((c, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-500 capitalize">{c.role === 'primary' ? 'Artist' : c.role}</span>
                                        {c.role === 'producer' || c.role === 'songwriter' ? (
                                            <Link to={`/streams/${c.role}/${c.artist_id}`} className="text-gray-300 hover:text-white hover:underline transition-colors">
                                                {c.name}
                                            </Link>
                                        ) : c.role === 'primary' || c.role === 'featured' ? (
                                            <Link to={`/streams/artist/${c.artist_id}`} className="text-gray-300 hover:text-white hover:underline transition-colors">
                                                {c.name}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-300">{c.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {song && (
                <ShareDialog
                    open={showShare}
                    onClose={() => setShowShare(false)}
                    url={`${window.location.origin}/streams/song/${song.id}`}
                    title={song.title}
                    description={`By ${song.artist} — listen on Bara Streams`}
                    imageUrl={song.cover_url}
                />
            )}
        </div>
    );
}
