import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { Play, Pause, Heart, Shuffle, SkipBack, SkipForward, Repeat, Volume2, List, Share2, Maximize2, Lock, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { GamificationService } from '@/lib/gamificationService';
import { QueueDrawer } from './QueueDrawer';
import { FullScreenPlayer } from './FullScreenPlayer';
import { ShareDialog } from '@/components/ShareDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function GlobalPlayer() {
    const { toast } = useToast();
    const {
        currentSong,
        isPlaying,
        togglePlay,
        next,
        prev,
        volume,
        setVolume,
        progress,
        duration,
        seek,
        isShuffle,
        toggleShuffle,
        repeatMode,
        setRepeatMode,
        likedSongs,
        toggleLike,
        isPreviewing,
        purchaseSong,
        isSongPurchased
    } = useAudioPlayer();

    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const { user, isSignedIn } = useUser();
    const [lastTrackedSongId, setLastTrackedSongId] = useState<string | null>(null);
    const [featuredArtists, setFeaturedArtists] = useState<string[]>([]);

    // Fetch featured artists for current song
    useEffect(() => {
        if (!currentSong) { setFeaturedArtists([]); return; }
        let cancelled = false;
        (async () => {
            try {
                const { data } = await supabase
                    .from('song_artists')
                    .select('role, artists(name)')
                    .eq('song_id', currentSong.id)
                    .eq('role', 'featured')
                    .order('display_order');
                if (!cancelled && data) {
                    setFeaturedArtists(data.map((d: any) => d.artists?.name).filter(Boolean));
                }
            } catch {
                if (!cancelled) setFeaturedArtists([]);
            }
        })();
        return () => { cancelled = true; };
    }, [currentSong?.id]);

    // Mission Tracking for Song Listens
    useEffect(() => {
        if (user && currentSong && isPlaying && duration > 0) {
            const isSignificantProgress = (progress / duration > 0.5) || (progress > 30);
            if (isSignificantProgress && lastTrackedSongId !== currentSong.id) {
                setLastTrackedSongId(currentSong.id);
                // Track mission progress (try multiple common key names)
                GamificationService.trackMissionProgress(user.id, 'daily_listen');
                GamificationService.trackMissionProgress(user.id, 'listen_songs');
                GamificationService.trackMissionProgress(user.id, 'stream_music');
                // Dispatch event so DailyMissions UI refreshes
                window.dispatchEvent(new CustomEvent('bara_song_played', {
                    detail: { songId: currentSong.id, userId: user.id }
                }));
            }
        }
    }, [progress, duration, currentSong?.id, user?.id, isPlaying, lastTrackedSongId]);

    // Early return AFTER all hooks to avoid React error #310
    if (!currentSong) return null;

    const isLiked = likedSongs.includes(currentSong.id);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 z-[200] text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
                {/* Now Playing */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative group">
                        <img
                            src={currentSong.cover_url}
                            alt={currentSong.title}
                            className="w-14 h-14 rounded shadow-lg object-cover bg-gray-800 transition-transform group-hover:scale-105 cursor-pointer"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/placeholder-music.png';
                            }}
                            onClick={() => setIsFullScreen(true)}
                        />
                        {isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center gap-[2px] bg-black/20 rounded">
                                <div className="w-[3px] bg-[#1DB954] rounded-full animate-bars" style={{ animationDelay: '0s' }}></div>
                                <div className="w-[3px] bg-[#1DB954] rounded-full animate-bars" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-[3px] bg-[#1DB954] rounded-full animate-bars" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}
                    </div>
                    <div
                        className="min-w-0 mr-4 cursor-pointer group"
                        onClick={() => setIsFullScreen(true)}
                    >
                        <div className="font-bold truncate text-white hover:underline tracking-tight transition-colors group-hover:text-[#1DB954]">
                            {currentSong.title}
                        </div>
                        <div className="text-xs text-gray-400 truncate hover:text-white transition-colors font-medium">
                            {currentSong.artist}{featuredArtists.length > 0 && ` ft. ${featuredArtists.join(', ')}`}
                        </div>
                    </div>
                    <button
                        onClick={() => toggleLike(currentSong.id)}
                        className={`transition-all hover:scale-110 flex-shrink-0 ${isLiked ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center gap-1 md:gap-2 flex-[2] max-w-[600px]">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={toggleShuffle}
                            className={`transition-colors hidden md:block ${isShuffle ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
                            title="Shuffle"
                        >
                            <Shuffle size={18} />
                        </button>
                        <button onClick={prev} className="text-gray-400 hover:text-white transition">
                            <SkipBack size={20} fill="currentColor" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            {isPlaying ? <Pause fill="black" size={20} /> : <Play fill="black" size={20} className="ml-1" />}
                        </button>
                        <button onClick={next} className="text-gray-400 hover:text-white transition">
                            <SkipForward size={20} fill="currentColor" />
                        </button>
                        <button
                            onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                            className={`transition-colors relative hidden md:block ${repeatMode !== 'none' ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Repeat size={18} />
                            {repeatMode === 'one' && (
                                <span className="absolute -top-1 -right-1 bg-[#1DB954] text-[8px] text-white w-3 h-3 rounded-full flex items-center justify-center font-bold">1</span>
                            )}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 md:gap-3 w-full group/progress">
                        <span className="text-[10px] text-gray-500 w-8 md:w-10 text-right tabular-nums">{formatTime(progress)}</span>
                        <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group-hover/progress:h-1.5 transition-all">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={progress || 0}
                                onChange={(e) => seek(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                                title={formatTime(progress)}
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-white group-hover/progress:bg-[#1DB954] transition-colors z-10"
                                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-500 w-8 md:w-10 tabular-nums">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Extra Controls */}
                <div className="flex items-center gap-4 flex-1 justify-end min-w-0 md:min-w-[200px]">
                    <button
                        onClick={() => setIsQueueOpen(!isQueueOpen)}
                        className={`transition-colors ${isQueueOpen ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
                        title="Queue"
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setIsFullScreen(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Full Screen"
                    >
                        <Maximize2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Share"
                    >
                        <Share2 size={18} />
                    </button>
                    <div className="hidden md:flex items-center gap-2 group/volume w-32">
                        <Volume2 size={18} className="text-gray-400 group-hover/volume:text-white transition-colors" />
                        <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group-hover/volume:h-1.5 transition-all">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-white group-hover/volume:bg-[#1DB954] transition-colors"
                                style={{ width: `${volume * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Prompt — shown when preview ends */}
            {isPreviewing && currentSong.price && currentSong.price > 0 && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-30 rounded-t-lg">
                    <div className="flex items-center gap-6 px-6">
                        <Lock className="w-6 h-6 text-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">Preview ended</p>
                            <p className="text-gray-400 text-xs truncate">
                                {isSignedIn
                                    ? `Purchase "${currentSong.title}" to listen to the full song`
                                    : 'Sign in to purchase this song'}
                            </p>
                        </div>
                        {isSignedIn ? (
                            <button
                                onClick={async () => {
                                    const result = await purchaseSong(currentSong.id);
                                    if (result.success) {
                                        toast({ title: 'Purchased!', description: `You can now listen to "${currentSong.title}" in full.` });
                                    } else {
                                        toast({ title: 'Purchase failed', description: result.message, variant: 'destructive' });
                                    }
                                }}
                                className="flex items-center gap-2 bg-[#1DB954] text-black font-bold px-5 py-2.5 rounded-full hover:bg-[#1ed760] transition text-sm whitespace-nowrap flex-shrink-0"
                            >
                                <ShoppingCart size={16} />
                                Buy {currentSong.price} coins
                            </button>
                        ) : (
                            <a
                                href="/user/sign-in"
                                className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-full hover:bg-gray-200 transition text-sm whitespace-nowrap flex-shrink-0"
                            >
                                Sign In
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Logic for QueueDrawer would be triggered by isQueueOpen */}
            <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />

            <FullScreenPlayer isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} />

            <ShareDialog
                open={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                url={`${window.location.origin}/streams/song/${currentSong.id}`}
                title={currentSong.title}
                description={`By ${currentSong.artist} — listen on Bara Streams`}
                imageUrl={currentSong.cover_url}
            />
        </div>
    );
}
