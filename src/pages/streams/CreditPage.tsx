import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Loader2, Play, Pause, Music, ArrowLeft, Disc3 } from 'lucide-react';

interface CreditTrack extends Song {
    primary_artist: string;
    album_title: string;
    plays: number;
}

export default function CreditPage() {
    const { role, id } = useParams<{ role: string; id: string }>();
    const { play, playAlbum, currentSong, isPlaying, togglePlay } = useAudioPlayer();
    const [creditName, setCreditName] = useState<string>('');
    const [tracks, setTracks] = useState<CreditTrack[]>([]);
    const [loading, setLoading] = useState(true);

    const roleLabel = role === 'producer' ? 'Producer' : role === 'songwriter' ? 'Songwriter' : 'Credit';

    useEffect(() => {
        if (!id || !role) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Get the artist/person name
                const { data: artistData } = await supabase
                    .from('artists')
                    .select('name, image_url, bio, genre')
                    .eq('id', id)
                    .single();

                if (artistData) {
                    setCreditName(artistData.name);
                }

                // Get all songs this person is credited on with the given role
                const { data: creditsData } = await supabase
                    .from('song_artists')
                    .select(`
                        song_id,
                        display_order,
                        songs(
                            id, title, file_url, cover_url, duration, plays,
                            artist_id, album_id,
                            artists(name),
                            albums(title, cover_url)
                        )
                    `)
                    .eq('artist_id', id)
                    .eq('role', role)
                    .order('display_order');

                if (creditsData) {
                    const formatted: CreditTrack[] = creditsData
                        .filter((c: any) => c.songs)
                        .map((c: any) => ({
                            id: c.songs.id,
                            title: c.songs.title,
                            artist: c.songs.artists?.name || 'Unknown Artist',
                            file_url: c.songs.file_url,
                            cover_url: c.songs.cover_url || c.songs.albums?.cover_url || '/placeholder-music.png',
                            duration: c.songs.duration || 0,
                            artist_id: c.songs.artist_id,
                            album_id: c.songs.album_id,
                            primary_artist: c.songs.artists?.name || 'Unknown Artist',
                            album_title: c.songs.albums?.title || 'Single',
                            plays: c.songs.plays || 0,
                        }));
                    setTracks(formatted);
                }
            } catch (error) {
                console.error('Error fetching credit data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, role]);

    const handlePlay = (track: Song) => {
        if (currentSong?.id === track.id) {
            togglePlay();
        } else {
            play(track);
        }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            playAlbum(tracks, 0);
        }
    };

    if (loading) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                </div>
            </StreamsLayout>
        );
    }

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-white text-gray-900 pb-24">
                {/* Hero */}
                <div className="bg-gradient-to-b from-gray-200 to-white px-6 md:px-8 pt-12 pb-8">
                    <div className="max-w-4xl mx-auto">
                        <Link to="/streams" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                            <ArrowLeft size={16} />
                            Back to Streams
                        </Link>

                        <div className="flex items-center gap-3 mb-2">
                            <Disc3 className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{roleLabel}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">{creditName || 'Unknown'}</h1>
                        <p className="text-gray-500 font-medium">
                            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} {role === 'producer' ? 'produced' : 'written'}
                        </p>
                    </div>
                </div>

                {/* Play All button */}
                {tracks.length > 0 && (
                    <div className="px-6 md:px-8 py-4">
                        <div className="max-w-4xl mx-auto flex items-center gap-6">
                            <button
                                onClick={handlePlayAll}
                                className="w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 hover:scale-105 transition flex items-center justify-center shadow-lg active:scale-95"
                             aria-label="Play"><Play fill="white" className="w-5 h-5 ml-0.5 text-white" /></button>
                            <span className="text-sm font-semibold text-gray-500">Play All</span>
                        </div>
                    </div>
                )}

                {/* Tracks List */}
                <div className="px-6 md:px-8">
                    <div className="max-w-4xl mx-auto">
                        {tracks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <Music size={40} className="mb-3" />
                                <p className="text-lg font-medium">No tracks found</p>
                                <p className="text-sm mt-1">No songs {role === 'producer' ? 'produced' : 'written'} by this {roleLabel.toLowerCase()} yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Header row */}
                                <div className="grid grid-cols-[32px_1fr_1fr_80px] gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <span className="text-center">#</span>
                                    <span>Title</span>
                                    <span className="hidden md:block">Album</span>
                                    <span className="text-right">Plays</span>
                                </div>

                                {tracks.map((track, index) => {
                                    const isCurrent = currentSong?.id === track.id;
                                    return (
                                        <div
                                            key={track.id}
                                            className="grid grid-cols-[32px_1fr_1fr_80px] gap-4 px-4 py-2.5 rounded-lg group hover:bg-gray-50 cursor-pointer items-center transition-colors"
                                            onClick={() => handlePlay(track)}
                                        >
                                            {/* Number / Play icon */}
                                            <div className="flex justify-center text-gray-400 w-8">
                                                {isCurrent && isPlaying ? (
                                                    <div className="flex items-end gap-[2px] h-3">
                                                        <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '60%' }} />
                                                        <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                                                        <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className={`group-hover:hidden text-sm ${isCurrent ? 'text-gray-900 font-bold' : ''}`}>{index + 1}</span>
                                                        <Play fill="currentColor" className="w-4 h-4 hidden group-hover:block text-gray-600" />
                                                    </>
                                                )}
                                            </div>

                                            {/* Song info */}
                                            <div className="flex gap-3 items-center min-w-0">
                                                <img
                                                    loading="lazy" src={track.cover_url}
                                                    alt={track.title}
                                                    className="w-10 h-10 rounded object-cover flex-shrink-0 bg-gray-100"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className={`font-semibold text-sm truncate ${isCurrent ? 'text-gray-900' : 'text-gray-800'}`}>
                                                        {track.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        <Link
                                                            to={`/streams/artist/${track.artist_id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="hover:underline hover:text-gray-700 transition-colors"
                                                        >
                                                            {track.primary_artist}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Album */}
                                            <div className="text-sm text-gray-400 truncate hidden md:block">
                                                {track.album_title}
                                            </div>

                                            {/* Plays */}
                                            <div className="text-sm text-gray-400 text-right tabular-nums">
                                                {track.plays.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StreamsLayout>
    );
}
