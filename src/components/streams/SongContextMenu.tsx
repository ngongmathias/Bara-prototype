import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
    Play, ListPlus, Plus, User, Disc, Share2, Heart, HeartOff, Loader2, Music, Check,
} from 'lucide-react';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MenuState {
    song: Song;
    x: number;
    y: number;
}

interface SongContextMenuContextValue {
    open: (song: Song, x: number, y: number) => void;
    handlers: (song: Song) => {
        onContextMenu: (e: React.MouseEvent) => void;
        onTouchStart: (e: React.TouchEvent) => void;
        onTouchEnd: () => void;
        onTouchMove: () => void;
    };
}

const Ctx = createContext<SongContextMenuContextValue | null>(null);

export const useSongContextMenu = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error('useSongContextMenu must be used within SongContextMenuProvider');
    return v;
};

const MENU_WIDTH = 240;
const MENU_HEIGHT = 340;

export const SongContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menu, setMenu] = useState<MenuState | null>(null);
    const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
    const longPressTimerRef = useRef<number | null>(null);
    const touchMovedRef = useRef(false);

    const open = useCallback((song: Song, x: number, y: number) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cx = Math.min(x, vw - MENU_WIDTH - 8);
        const cy = Math.min(y, vh - MENU_HEIGHT - 8);
        setMenu({ song, x: Math.max(8, cx), y: Math.max(8, cy) });
    }, []);

    const close = useCallback(() => {
        setMenu(null);
        setPlaylistPickerOpen(false);
    }, []);

    const handlers = useCallback((song: Song) => ({
        onContextMenu: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            open(song, e.clientX, e.clientY);
        },
        onTouchStart: (e: React.TouchEvent) => {
            touchMovedRef.current = false;
            const t = e.touches[0];
            const x = t.clientX;
            const y = t.clientY;
            longPressTimerRef.current = window.setTimeout(() => {
                if (!touchMovedRef.current) open(song, x, y);
            }, 500);
        },
        onTouchMove: () => { touchMovedRef.current = true; },
        onTouchEnd: () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        },
    }), [open]);

    return (
        <Ctx.Provider value={{ open, handlers }}>
            {children}
            {menu && createPortal(
                <Menu
                    state={menu}
                    onClose={close}
                    playlistPickerOpen={playlistPickerOpen}
                    setPlaylistPickerOpen={setPlaylistPickerOpen}
                />,
                document.body
            )}
        </Ctx.Provider>
    );
};

interface MenuProps {
    state: MenuState;
    onClose: () => void;
    playlistPickerOpen: boolean;
    setPlaylistPickerOpen: (v: boolean) => void;
}

const Menu: React.FC<MenuProps> = ({ state, onClose, playlistPickerOpen, setPlaylistPickerOpen }) => {
    const { song, x, y } = state;
    const { play, playNext, addToQueue, toggleLike, likedSongs } = useAudioPlayer();
    const navigate = useNavigate();
    const { user } = useUser();
    const { toast } = useToast();
    const menuRef = useRef<HTMLDivElement>(null);

    const isLiked = likedSongs.includes(song.id);

    useEffect(() => {
        const onDocDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', onDocDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    const handlePlay = () => { play(song); onClose(); };

    const handlePlayNext = () => {
        playNext(song);
        toast({ title: 'Added to queue', description: `"${song.title}" plays next` });
        onClose();
    };

    const handleAddToQueue = () => {
        addToQueue(song);
        toast({ title: 'Added to queue', description: `"${song.title}" queued` });
        onClose();
    };

    const handleGoToArtist = () => {
        if (song.artist_id) navigate(`/streams/artists/${song.artist_id}`);
        onClose();
    };

    const handleGoToAlbum = () => {
        if (song.album_id) navigate(`/streams/albums/${song.album_id}`);
        else toast({ title: 'No album', description: 'This song is not part of an album', variant: 'destructive' });
        onClose();
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/streams/song/${song.id}`;
        const shareData = { title: song.title, text: `Listen to ${song.title} by ${song.artist}`, url };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                toast({ title: 'Link copied', description: 'Song link copied to clipboard' });
            }
        } catch { /* user cancelled */ }
        onClose();
    };

    const handleToggleLike = async () => {
        if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); onClose(); return; }
        await toggleLike(song.id);
        toast({ title: isLiked ? 'Removed from liked songs' : 'Added to liked songs' });
        onClose();
    };

    if (playlistPickerOpen) {
        return (
            <div
                ref={menuRef}
                style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: MENU_WIDTH }}
                className="bg-white border border-gray-200 rounded-lg shadow-2xl py-2 text-sm font-medium text-gray-900"
            >
                <PlaylistPicker
                    song={song}
                    onDone={onClose}
                    onBack={() => setPlaylistPickerOpen(false)}
                />
            </div>
        );
    }

    return (
        <div
            ref={menuRef}
            style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: MENU_WIDTH }}
            className="bg-white border border-gray-200 rounded-lg shadow-2xl py-2 text-sm font-medium text-gray-900"
        >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="truncate font-bold">{song.title}</p>
                <p className="truncate text-xs text-gray-500">{song.artist}</p>
            </div>
            <MenuItem icon={<Play size={16} />} label="Play" onClick={handlePlay} />
            <MenuItem icon={<ListPlus size={16} />} label="Play next" onClick={handlePlayNext} />
            <MenuItem icon={<Plus size={16} />} label="Add to queue" onClick={handleAddToQueue} />
            <MenuItem
                icon={<Music size={16} />}
                label="Add to playlist"
                onClick={() => {
                    if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); onClose(); return; }
                    setPlaylistPickerOpen(true);
                }}
            />
            <div className="my-1 border-t border-gray-100" />
            <MenuItem icon={isLiked ? <HeartOff size={16} /> : <Heart size={16} />} label={isLiked ? 'Unlike' : 'Like'} onClick={handleToggleLike} />
            {song.artist_id && <MenuItem icon={<User size={16} />} label="Go to artist" onClick={handleGoToArtist} />}
            {song.album_id && <MenuItem icon={<Disc size={16} />} label="Go to album" onClick={handleGoToAlbum} />}
            <MenuItem icon={<Share2 size={16} />} label="Share" onClick={handleShare} />
        </div>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 transition text-left"
    >
        <span className="text-gray-500">{icon}</span>
        <span>{label}</span>
    </button>
);

interface PlaylistRow { id: string; title: string }

const PlaylistPicker: React.FC<{ song: Song; onDone: () => void; onBack: () => void }> = ({ song, onDone, onBack }) => {
    const { user } = useUser();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
    const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;
        (async () => {
            const { data } = await supabase
                .from('playlists')
                .select('id, title')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });
            setPlaylists((data as PlaylistRow[]) || []);
            setLoading(false);
        })();
    }, [user?.id]);

    const addTo = async (playlistId: string) => {
        if (addedTo.has(playlistId)) return;
        const { count } = await supabase
            .from('playlist_songs')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', playlistId);
        const position = count || 0;
        const { error } = await supabase.from('playlist_songs').insert({
            playlist_id: playlistId,
            song_id: song.id,
            position,
        });
        if (error) {
            toast({ title: 'Failed to add', description: error.message, variant: 'destructive' });
        } else {
            setAddedTo(prev => new Set(prev).add(playlistId));
            toast({ title: 'Added to playlist' });
            setTimeout(onDone, 400);
        }
    };

    return (
        <div>
            <div className="px-3 py-2 border-b border-gray-100 mb-1 flex items-center justify-between">
                <p className="font-bold text-xs uppercase tracking-wider text-gray-500">Add to playlist</p>
                <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-900">Back</button>
            </div>
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-gray-400" /></div>
            ) : playlists.length === 0 ? (
                <p className="px-3 py-3 text-xs text-gray-500">No playlists yet. Create one from the sidebar.</p>
            ) : (
                <div className="max-h-64 overflow-y-auto">
                    {playlists.map(pl => {
                        const added = addedTo.has(pl.id);
                        return (
                            <button
                                key={pl.id}
                                onClick={() => addTo(pl.id)}
                                disabled={added}
                                className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-100 transition text-left text-sm"
                            >
                                <span className="truncate">{pl.title}</span>
                                {added && <Check size={14} className="text-gray-900" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
