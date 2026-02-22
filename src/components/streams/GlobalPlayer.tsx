import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { Play, Pause, Heart, Shuffle, SkipBack, SkipForward, Repeat, Volume2, List, Share2, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { GamificationService } from '@/lib/gamificationService';
import { QueueDrawer } from './QueueDrawer';
import { FullScreenPlayer } from './FullScreenPlayer';

export function GlobalPlayer() {
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
        toggleLike
    } = useAudioPlayer();

    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    if (!currentSong) return null;

    const isLiked = likedSongs.includes(currentSong.id);

    const { user } = useUser();
    const [lastTrackedSongId, setLastTrackedSongId] = useState<string | null>(null);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Phase 8: Mission Tracking for Song Listens
    useEffect(() => {
        if (user && currentSong && isPlaying) {
            // If we've reached 50% of the song or 30 seconds
            const isSignificantProgress = (progress / duration > 0.5) || (progress > 30);

            if (isSignificantProgress && lastTrackedSongId !== currentSong.id) {
                GamificationService.trackMissionProgress(user.id, 'daily_listen');
                setLastTrackedSongId(currentSong.id);
            }
        }
    }, [progress, duration, currentSong?.id, user?.id, isPlaying, lastTrackedSongId]);

    // Reset tracked song id when song changes significantly
    useEffect(() => {
        if (currentSong?.id !== lastTrackedSongId && progress < 5) {
            // If it's a new song and we're at the beginning, we might allow re-tracking later
            // but usually we just want one listen per song per session or reset if they start over.
        }
    }, [currentSong?.id]);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 z-[100] text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
                {/* Now Playing */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative group">
                        <img
                            src={currentSong.cover_url}
                            alt={currentSong.title}
                            className="w-14 h-14 rounded shadow-lg object-cover bg-gray-800 transition-transform group-hover:scale-105 cursor-pointer"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
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
                            {currentSong.artist}
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
                        onClick={async () => {
                            const shareUrl = `${window.location.origin}/streams/song/${currentSong.id}`;
                            const shareData = { title: currentSong.title, text: `Listen to ${currentSong.title} by ${currentSong.artist} on Bara Streams`, url: shareUrl };
                            try {
                                if (navigator.share) { await navigator.share(shareData); }
                                else { await navigator.clipboard.writeText(shareUrl); alert('Link copied to clipboard!'); }
                            } catch { /* User cancelled */ }
                        }}
                        className="text-gray-400 hover:text-white transition-colors hidden md:block"
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

            {/* Logic for QueueDrawer would be triggered by isQueueOpen */}
            <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />

            <FullScreenPlayer isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} />
        </div>
    );
}
