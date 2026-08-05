import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { useSongContextMenu } from '@/components/streams/SongContextMenu';
import { Loader2, Play, Pause, Heart, MoreHorizontal, Shuffle, Clock, Music, Share2, Users, Link2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShare } from '@/context/ShareContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlaylistData {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    created_at: string;
    created_by?: string;
    is_collaborative?: boolean;
    invite_code?: string;
}

export default function PlaylistPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { play, playAlbum, currentSong, isPlaying, togglePlay, likedSongs, toggleLike, isShuffle, toggleShuffle } = useAudioPlayer();
    const { handlers: contextMenuHandlers } = useSongContextMenu();
    const { toast } = useToast();
    const { openShare } = useShare();
    const { user } = useUser();
    const { getToken } = useAuth();
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [tracks, setTracks] = useState<Song[]>([]);
    const [ftMap, setFtMap] = useState<Record<string, string>>({});
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isPlaylistLiked, setIsPlaylistLiked] = useState(false);

    useEffect(() => {
        const fetchPlaylist = async () => {
            setLoading(true);
            setNotFound(false);

            // Fetch playlist details
            const { data: playlistData } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', id)
                .single();

            if (!playlistData) {
                setPlaylist(null);
                setTracks([]);
                setNotFound(true);
                setLoading(false);
                return;
            }

            setPlaylist(playlistData);

            // Fetch collaborators
            try {
                const { data: collabs } = await supabase
                    .from('playlist_collaborators')
                    .select('user_id')
                    .eq('playlist_id', playlistData.id);
                const ids = (collabs || []).map((c: any) => c.user_id);
                setCollaborators(ids);
                setIsCollaborator(
                    playlistData.created_by === user?.id || ids.includes(user?.id || '')
                );
            } catch { /* table may not exist */ }

            // Fetch songs in this playlist (via playlist_songs junction table)
            const { data: playlistSongs } = await supabase
                .from('playlist_songs')
                .select(`
                    position,
                    songs (
                        id, title, file_url, cover_url, duration, artist_id, album_id,
                        artists(name),
                        albums(title)
                    )
                `)
                .eq('playlist_id', id)
                .order('position', { ascending: true });

            const mappedTracks: Song[] = (playlistSongs || [])
                .filter((ps: any) => ps.songs)
                .map((ps: any) => ({
                    id: ps.songs.id,
                    title: ps.songs.title,
                    artist: ps.songs.artists?.name || 'Unknown Artist',
                    album_title: ps.songs.albums?.title || 'Single',
                    duration: ps.songs.duration,
                    file_url: ps.songs.file_url,
                    cover_url: ps.songs.cover_url || '/placeholder-music.png',
                    artist_id: ps.songs.artist_id,
                    album_id: ps.songs.album_id,
                }));
            setTracks(mappedTracks);

            // Whether the signed-in user has saved this playlist
            if (user?.id) {
                const { data: likeRow } = await supabase
                    .from('user_playlist_likes')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .eq('playlist_id', playlistData.id)
                    .maybeSingle();
                setIsPlaylistLiked(!!likeRow);
            } else {
                setIsPlaylistLiked(false);
            }

            setLoading(false);
        };

        if (id) fetchPlaylist();
    }, [id, user?.id]);

    // Fetch featured artists for playlist tracks
    useEffect(() => {
        if (tracks.length === 0) return;
        const ids = tracks.map(t => t.id);
        supabase
            .from('song_artists')
            .select('song_id, artists(name)')
            .in('song_id', ids)
            .eq('role', 'featured')
            .then(({ data }) => {
                const map: Record<string, string[]> = {};
                if (data) {
                    for (const e of data as any[]) {
                        const name = e.artists?.name;
                        if (name) { if (!map[e.song_id]) map[e.song_id] = []; map[e.song_id].push(name); }
                    }
                }
                const result: Record<string, string> = {};
                for (const [sid, names] of Object.entries(map)) result[sid] = ` ft. ${names.join(', ')}`;
                setFtMap(result);
            });
    }, [tracks]);

    const togglePlaylistLike = async () => {
        if (!user?.id || !playlist) {
            toast({ title: 'Sign in required', description: 'Sign in to save playlists to your library.' });
            return;
        }
        try {
            if (isPlaylistLiked) {
                await supabase
                    .from('user_playlist_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('playlist_id', playlist.id);
                setIsPlaylistLiked(false);
            } else {
                await supabase
                    .from('user_playlist_likes')
                    .insert({ user_id: user.id, playlist_id: playlist.id });
                setIsPlaylistLiked(true);
                toast({ title: 'Saved to Your Library' });
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const handlePlayTrack = (track: Song) => {
        if (currentSong?.id === track.id) {
            togglePlay();
        } else {
            // Set entire playlist as queue so next/prev work
            const trackIndex = tracks.findIndex(t => t.id === track.id);
            playAlbum(tracks, trackIndex >= 0 ? trackIndex : 0);
        }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            playAlbum(tracks, 0);
        }
    };

    const handleShare = () => {
        if (!playlist) return;
        openShare({
            url: `${window.location.origin}/streams/playlist/${playlist.id}`,
            title: playlist.title,
            description: playlist.description || `Check out "${playlist.title}" on Bara Streams`,
            imageUrl: playlist.cover_url,
        });
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Auto-join via invite code in URL
    useEffect(() => {
        const inviteCode = searchParams.get('invite');
        if (!inviteCode || !user?.id || !id) return;
        (async () => {
            try {
                const token = await getToken({ template: 'supabase' });
                if (!token) return;
                const client = await createAuthenticatedSupabaseClient(token);
                await client
                    .from('playlist_collaborators')
                    .upsert({ playlist_id: id, user_id: user.id }, { onConflict: 'playlist_id,user_id' });
                setIsCollaborator(true);
                setCollaborators(prev => prev.includes(user.id) ? prev : [...prev, user.id]);
                toast({ title: 'Joined playlist', description: 'You can now add songs.' });
            } catch { /* ignore */ }
        })();
    }, [searchParams, user?.id, id]);

    const copyInviteLink = async () => {
        if (!playlist || !id) return;
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) return;
            const client = await createAuthenticatedSupabaseClient(token);
            let code = playlist.invite_code;
            if (!code) {
                code = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
                await client
                    .from('playlists')
                    .update({ is_collaborative: true, invite_code: code })
                    .eq('id', id);
                setPlaylist(prev => prev ? { ...prev, is_collaborative: true, invite_code: code! } : prev);
            }
            const link = `${window.location.origin}/streams/playlist/${id}?invite=${code}`;
            await navigator.clipboard.writeText(link);
            toast({ title: 'Invite link copied!' });
        } catch (e: any) {
            toast({ title: 'Error', description: e.message });
        }
    };

    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

    // Window-based list virtualisation — keeps long playlists (500+ tracks) smooth
    // by only rendering the rows in view. The list scrolls with the page.
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    useLayoutEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.getBoundingClientRect().top + window.scrollY);
        }
    }, [tracks.length, loading]);

    const rowVirtualizer = useWindowVirtualizer({
        count: tracks.length,
        estimateSize: () => 56,
        overscan: 10,
        scrollMargin,
    });

    if (loading) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-black text-gray-900 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                </div>
            </StreamsLayout>
        );
    }

    if (notFound || !playlist) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3 px-8 text-center">
                    <Music size={48} className="text-gray-500" />
                    <h1 className="text-2xl font-bold">Playlist not found</h1>
                    <p className="text-gray-400 max-w-md">This playlist doesn't exist or may have been removed.</p>
                </div>
            </StreamsLayout>
        );
    }

    const playlistTitle = playlist.title;
    const playlistDesc = playlist.description || '';
    const coverUrl = playlist.cover_url;

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-black text-gray-900 pb-24">
                {/* Hero Header */}
                <div className="bg-gradient-to-b from-gray-800 to-[#121212] pt-16 pb-6 px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end gap-6">
                            {/* Playlist Cover */}
                            {coverUrl ? (
                                <img loading="lazy" src={coverUrl} alt={playlistTitle} className="w-56 h-56 rounded shadow-2xl object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-56 h-56 rounded shadow-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                                    <Music size={100} className="text-gray-500" />
                                </div>
                            )}

                            {/* Playlist Info */}
                            <div className="flex-1 pb-4">
                                <div className="text-xs font-bold mb-2 uppercase tracking-tight flex items-center gap-2">
                                    Playlist
                                    {playlist?.is_collaborative && (
                                        <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            <Users size={10} /> Collaborative
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tighter text-gray-900">{playlistTitle}</h1>
                                <p className="text-gray-600 text-sm mb-4 font-medium">{playlistDesc}</p>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    <span className="text-gray-900 hover:underline cursor-pointer">Bara Streams</span>
                                    <span className="text-gray-900/70">•</span>
                                    <span className="text-gray-900">{tracks.length} songs</span>
                                    <span className="text-gray-900/70">•</span>
                                    <span className="text-gray-500 font-normal">{Math.floor(totalDuration / 3600) > 0 ? `${Math.floor(totalDuration / 3600)} hr ` : ''}{Math.floor((totalDuration % 3600) / 60)} min</span>
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
                            className="w-14 h-14 rounded-full bg-white hover:scale-105 transition flex items-center justify-center shadow-xl active:scale-95"
                         aria-label="Play"><Play className="w-6 h-6 text-black ml-1" fill="black" /></button>
                        <button
                            onClick={toggleShuffle}
                            className={`transition ${isShuffle ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            aria-label="Shuffle"
                            title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
                        >
                            <Shuffle className="w-7 h-7" />
                        </button>
                        <button
                            onClick={togglePlaylistLike}
                            className={`transition ${isPlaylistLiked ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            aria-label={isPlaylistLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                            title={isPlaylistLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                        >
                            <Heart className="w-7 h-7" fill={isPlaylistLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={handleShare} className="text-gray-500 hover:text-gray-900 transition" title="Share playlist" aria-label="Share"><Share2 className="w-7 h-7" /></button>
                        {playlist?.created_by === user?.id && (
                            <button
                                onClick={copyInviteLink}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition border border-gray-300 rounded-full px-3 py-1.5"
                                title="Copy invite link for collaborators"
                            >
                                <Link2 size={14} /> Invite
                            </button>
                        )}
                        {collaborators.length > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Users size={14} /> {collaborators.length + 1} contributors
                            </span>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-gray-500 hover:text-gray-900 transition" aria-label="More options">
                                    <MoreHorizontal className="w-7 h-7" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={handleShare}>
                                    <Share2 className="w-4 h-4 mr-2" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast({ title: 'Link copied!' }))}>
                                    <Copy className="w-4 h-4 mr-2" /> Copy link
                                </DropdownMenuItem>
                                {playlist?.created_by === user?.id && (
                                    <DropdownMenuItem onClick={copyInviteLink}>
                                        <Link2 className="w-4 h-4 mr-2" /> Copy invite link
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Track List */}
                <div className="px-8 pt-4">
                    <div className="max-w-7xl mx-auto">
                        {/* Table Header */}
                        <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-gray-800 mb-2 text-sm text-gray-500 uppercase">
                            <div className="text-center">#</div>
                            <div>Title</div>
                            <div>Album</div>
                            <div className="text-right"><Clock className="w-4 h-4 inline" /></div>
                        </div>

                        {tracks.length === 0 ? (
                            <div className="text-gray-500 text-center py-12">
                                <p className="text-lg mb-2">This playlist is empty</p>
                                <p className="text-sm">Add songs from the Streams home page to get started.</p>
                            </div>
                        ) : (
                            <div
                                ref={listRef}
                                style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const index = virtualRow.index;
                                    const track = tracks[index];
                                    const isCurrentTrack = currentSong?.id === track.id;
                                    return (
                                        <div
                                            key={track.id}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                                            }}
                                            className={`grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-gray-100 cursor-pointer ${isCurrentTrack ? 'bg-gray-50' : ''}`}
                                            onClick={() => handlePlayTrack(track)}
                                            {...contextMenuHandlers(track)}
                                        >
                                            {/* Track Number / Play Button */}
                                            <div className="flex items-center justify-center text-gray-500 group-hover:text-gray-900 w-8">
                                                {isCurrentTrack && isPlaying ? (
                                                    <div className="flex items-end gap-[2px] h-3">
                                                        <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: '60%' }}></div>
                                                        <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                                                        <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }}></div>
                                                    </div>
                                                ) : (
                                                    <span className={`text-sm group-hover:hidden ${isCurrentTrack ? 'text-white' : ''}`}>{index + 1}</span>
                                                )}
                                                <Play className="w-4 h-4 hidden group-hover:block" fill="currentColor" />
                                            </div>

                                            {/* Title and Artist */}
                                            <div className="flex gap-3 items-center min-w-0">
                                                <img
                                                    loading="lazy" src={track.cover_url || '/placeholder.svg'}
                                                    alt={track.title}
                                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className={`font-bold truncate transition text-sm ${isCurrentTrack ? 'text-white' : 'group-hover:text-gray-900'}`}>
                                                        {track.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate">{track.artist}{ftMap[track.id] || ''}</div>
                                                </div>
                                            </div>

                                            {/* Album */}
                                            <div className="flex items-center text-sm text-gray-500 truncate">
                                                {track.album_title || 'Single'}
                                            </div>

                                            {/* Duration and Heart */}
                                            <div className="flex items-center justify-end gap-6 pr-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                                                    className={`opacity-0 group-hover:opacity-100 transition ${likedSongs.includes(track.id) ? 'text-white !opacity-100' : 'text-gray-500 hover:text-gray-900'}`}
                                                >
                                                    <Heart size={18} fill={likedSongs.includes(track.id) ? "currentColor" : "none"} />
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
