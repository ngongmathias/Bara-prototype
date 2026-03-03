import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Loader2, Play, Pause, Heart, MoreHorizontal, Shuffle, Clock, Music, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaylistData {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    created_at: string;
}

export default function PlaylistPage() {
    const { id } = useParams();
    const { play, currentSong, isPlaying, togglePlay } = useAudioPlayer();
    const { toast } = useToast();
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [tracks, setTracks] = useState<Song[]>([]);
    const [likedTracks, setLikedTracks] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylist = async () => {
            setLoading(true);

            // Fetch playlist details
            const { data: playlistData } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', id)
                .single();

            if (playlistData) {
                setPlaylist(playlistData);
            }

            // Fetch songs in this playlist (via playlist_songs junction table)
            const { data: playlistSongs } = await supabase
                .from('playlist_songs')
                .select(`
                    position,
                    songs (
                        id, title, artist, album, duration, audio_url, cover_url
                    )
                `)
                .eq('playlist_id', id)
                .order('position', { ascending: true });

            if (playlistSongs) {
                const mappedTracks: Song[] = playlistSongs
                    .filter((ps: any) => ps.songs)
                    .map((ps: any) => ({
                        id: ps.songs.id,
                        title: ps.songs.title,
                        artist: ps.songs.artist,
                        album_title: ps.songs.album,
                        duration: ps.songs.duration,
                        file_url: ps.songs.audio_url,
                        cover_url: ps.songs.cover_url || '/placeholder.svg',
                    }));
                setTracks(mappedTracks);
            }

            // If no junction table data, fall back to fetching all songs
            if (!playlistSongs || playlistSongs.length === 0) {
                const { data: allSongs } = await supabase
                    .from('songs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (allSongs) {
                    setTracks(allSongs.map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        artist: s.artist,
                        album_title: s.album || 'Single',
                        duration: s.duration,
                        file_url: s.file_url || s.audio_url,
                        cover_url: s.cover_url || '/placeholder.svg',
                    })));
                }
            }

            setLoading(false);
        };

        if (id) fetchPlaylist();
    }, [id]);

    const toggleLike = (trackId: string) => {
        setLikedTracks(prev =>
            prev.includes(trackId)
                ? prev.filter(i => i !== trackId)
                : [...prev, trackId]
        );
    };

    const handlePlayTrack = (track: Song) => {
        if (currentSong?.id === track.id) {
            togglePlay();
        } else {
            play(track);
        }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            play(tracks[0]);
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: playlist?.title || 'Playlist',
            text: `Check out "${playlist?.title || 'this playlist'}" on Bara Streams!`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast({ title: 'Link copied!', description: 'Playlist link copied to clipboard.' });
            }
        } catch (err) {
            // User cancelled share or clipboard failed
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast({ title: 'Link copied!', description: 'Playlist link copied to clipboard.' });
            } catch {
                toast({ title: 'Share', description: shareUrl });
            }
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

    if (loading) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#1DB954]" />
                </div>
            </StreamsLayout>
        );
    }

    const playlistTitle = playlist?.title || 'Afrobeats Essentials';
    const playlistDesc = playlist?.description || 'The biggest Afrobeats hits from across the continent. Updated weekly with the freshest tracks.';
    const coverUrl = playlist?.cover_url;

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-black text-white pb-24">
                {/* Hero Header */}
                <div className="bg-gradient-to-b from-blue-900/60 to-[#121212] pt-16 pb-6 px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end gap-6">
                            {/* Playlist Cover */}
                            {coverUrl ? (
                                <img src={coverUrl} alt={playlistTitle} className="w-56 h-56 rounded shadow-2xl object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-56 h-56 rounded shadow-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                                    <Music size={100} className="text-gray-400" />
                                </div>
                            )}

                            {/* Playlist Info */}
                            <div className="flex-1 pb-4">
                                <div className="text-xs font-bold mb-2 uppercase tracking-tight">Playlist</div>
                                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tighter text-white">{playlistTitle}</h1>
                                <p className="text-gray-300 text-sm mb-4 font-medium">{playlistDesc}</p>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    <span className="text-white hover:underline cursor-pointer">Bara Streams</span>
                                    <span className="text-white/70">•</span>
                                    <span className="text-white">{tracks.length} songs</span>
                                    <span className="text-white/70">•</span>
                                    <span className="text-gray-400 font-normal">{Math.floor(totalDuration / 3600) > 0 ? `${Math.floor(totalDuration / 3600)} hr ` : ''}{Math.floor((totalDuration % 3600) / 60)} min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-transparent px-8 pt-6 pb-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-8">
                        <button
                            onClick={handlePlayAll}
                            className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 transition flex items-center justify-center shadow-xl active:scale-95"
                        >
                            <Play className="w-6 h-6 text-black ml-1" fill="black" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition">
                            <Shuffle className="w-7 h-7" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition">
                            <Heart className="w-7 h-7" />
                        </button>
                        <button onClick={handleShare} className="text-gray-400 hover:text-white transition" title="Share playlist">
                            <Share2 className="w-7 h-7" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition">
                            <MoreHorizontal className="w-7 h-7" />
                        </button>
                    </div>
                </div>

                {/* Track List */}
                <div className="px-8 pt-4">
                    <div className="max-w-7xl mx-auto">
                        {/* Table Header */}
                        <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-gray-800 mb-2 text-sm text-gray-400 uppercase">
                            <div className="text-center">#</div>
                            <div>Title</div>
                            <div>Album</div>
                            <div className="text-right"><Clock className="w-4 h-4 inline" /></div>
                        </div>

                        {tracks.length === 0 ? (
                            <div className="text-gray-400 text-center py-12">
                                <p className="text-lg mb-2">This playlist is empty</p>
                                <p className="text-sm">Add songs from the Streams home page to get started.</p>
                            </div>
                        ) : (
                            <div>
                                {tracks.map((track, index) => {
                                    const isCurrentTrack = currentSong?.id === track.id;
                                    return (
                                        <div
                                            key={track.id}
                                            className={`grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-white/10 cursor-pointer ${isCurrentTrack ? 'bg-white/5' : ''}`}
                                            onClick={() => handlePlayTrack(track)}
                                        >
                                            {/* Track Number / Play Button */}
                                            <div className="flex items-center justify-center text-gray-400 group-hover:text-white w-8">
                                                {isCurrentTrack && isPlaying ? (
                                                    <div className="flex items-end gap-[2px] h-3">
                                                        <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '60%' }}></div>
                                                        <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                                                        <div className="w-[3px] bg-[#1DB954] rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }}></div>
                                                    </div>
                                                ) : (
                                                    <span className={`text-sm group-hover:hidden ${isCurrentTrack ? 'text-[#1DB954]' : ''}`}>{index + 1}</span>
                                                )}
                                                <Play className="w-4 h-4 hidden group-hover:block" fill="currentColor" />
                                            </div>

                                            {/* Title and Artist */}
                                            <div className="flex gap-3 items-center min-w-0">
                                                <img
                                                    src={track.cover_url || '/placeholder.svg'}
                                                    alt={track.title}
                                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className={`font-bold truncate transition text-sm ${isCurrentTrack ? 'text-[#1DB954]' : 'group-hover:text-white'}`}>
                                                        {track.title}
                                                    </div>
                                                    <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                                                </div>
                                            </div>

                                            {/* Album */}
                                            <div className="flex items-center text-sm text-gray-400 truncate">
                                                {track.album_title || 'Single'}
                                            </div>

                                            {/* Duration and Heart */}
                                            <div className="flex items-center justify-end gap-6 pr-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                                                    className={`opacity-0 group-hover:opacity-100 transition ${likedTracks.includes(track.id) ? 'text-[#1DB954] !opacity-100' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    <Heart size={18} fill={likedTracks.includes(track.id) ? "currentColor" : "none"} />
                                                </button>
                                                <span className="text-sm text-gray-500 font-mono w-10 text-right">{formatDuration(track.duration)}</span>
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
