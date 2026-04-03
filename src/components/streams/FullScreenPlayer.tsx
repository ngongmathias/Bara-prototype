import React, { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import {
    ChevronDown,
    MoreHorizontal,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Heart,
    Share2,
    ListMusic,
    Volume2,
    VolumeX,
    Music,
    Mic2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface FullScreenPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ isOpen, onClose }) => {
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
        queue,
        play
    } = useAudioPlayer();

    const { toast } = useToast();
    const [showQueue, setShowQueue] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [dominantColor, setDominantColor] = useState('#1DB954');
    const [featuredArtists, setFeaturedArtists] = useState<string[]>([]);
    const imgRef = useRef<HTMLImageElement>(null);

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

    // Extract a pseudo-dominant color from the cover art for the background gradient
    useEffect(() => {
        if (!currentSong?.cover_url) {
            setDominantColor('#1DB954');
            return;
        }
        // Use a simple hash of the song ID to pick a color palette
        const colors = ['#1DB954', '#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6', '#6366F1'];
        const hash = currentSong.id.charCodeAt(0) + currentSong.id.charCodeAt(1);
        setDominantColor(colors[hash % colors.length]);
    }, [currentSong?.id]);

    if (!currentSong) return null;

    const isLiked = likedSongs.includes(currentSong.id);
    const progressPct = (progress / (duration || 1)) * 100;

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/streams/song/${currentSong.id}`;
        const shareData = { title: currentSong.title, text: `Listen to ${currentSong.title} by ${currentSong.artist} on Bara Streams`, url: shareUrl };
        try {
            if (navigator.share) { await navigator.share(shareData); }
            else { await navigator.clipboard.writeText(shareUrl); toast({ title: "Copied!", description: "Song link copied to clipboard." }); }
        } catch { /* cancelled */ }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                    className="fixed inset-0 z-[9999] flex flex-col overflow-hidden text-white"
                    style={{
                        background: `linear-gradient(160deg, ${dominantColor}40 0%, #121212 40%, #0a0a0a 100%)`
                    }}
                >
                    {/* Blurred background image overlay */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                            src={currentSong.cover_url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-[100px] opacity-30 scale-150"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    {/* Content container */}
                    <div className="relative z-10 flex flex-col h-full p-4 md:p-8 lg:p-12">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 md:mb-8">
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ChevronDown size={28} />
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Now Playing</span>
                                <span className="text-xs font-semibold text-white/80 truncate max-w-[200px]">{currentSong.artist}</span>
                            </div>
                            <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <MoreHorizontal size={24} />
                            </button>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 lg:gap-16 max-w-7xl mx-auto w-full overflow-hidden">

                            {/* Album Art with vinyl animation */}
                            <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[480px]">
                                <motion.div
                                    initial={{ scale: 0.85, opacity: 0, rotateY: -15 }}
                                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5 }}
                                    className="relative aspect-square"
                                >
                                    {/* Shadow glow */}
                                    <div
                                        className="absolute inset-4 rounded-2xl blur-3xl opacity-40"
                                        style={{ backgroundColor: dominantColor }}
                                    />
                                    {/* Cover art */}
                                    <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${isPlaying ? '' : ''}`}>
                                        <img
                                            ref={imgRef}
                                            src={currentSong.cover_url}
                                            alt={currentSong.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '/placeholder-music.png';
                                            }}
                                        />
                                        {/* Playing indicator overlay */}
                                        {isPlaying && (
                                            <div className="absolute bottom-4 left-4 flex items-end gap-[3px]">
                                                {[0, 0.15, 0.3, 0.45].map((delay, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-[4px] rounded-full bg-white/90"
                                                        animate={{ height: ['8px', '24px', '12px', '20px', '8px'] }}
                                                        transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right side: Song info + controls */}
                            <div className="flex-1 flex flex-col w-full max-w-[500px]">
                                {/* Song info */}
                                <div className="mb-6 md:mb-8 text-center md:text-left">
                                    <motion.h1
                                        key={currentSong.id + '-title'}
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 tracking-tight leading-tight"
                                    >
                                        {currentSong.title}
                                    </motion.h1>
                                    <motion.p
                                        key={currentSong.id + '-artist'}
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-lg md:text-xl text-white/60 font-medium"
                                    >
                                        {currentSong.artist}{featuredArtists.length > 0 && ` ft. ${featuredArtists.join(', ')}`}
                                    </motion.p>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-6 md:mb-8">
                                    <div className="group/progress relative h-1.5 bg-white/10 rounded-full mb-2 cursor-pointer transition-all hover:h-2.5">
                                        <input
                                            type="range"
                                            min="0"
                                            max={duration || 100}
                                            value={progress || 0}
                                            onChange={(e) => seek(parseFloat(e.target.value))}
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                                        />
                                        <div
                                            className="absolute top-0 left-0 h-full bg-white group-hover/progress:bg-[#1DB954] transition-colors rounded-full"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                        {/* Thumb indicator */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                            style={{ left: `calc(${progressPct}% - 6px)` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[11px] font-semibold text-white/40 tabular-nums">
                                        <span>{formatTime(progress)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Main playback controls */}
                                <div className="flex items-center justify-center gap-6 md:gap-8 mb-6 md:mb-8">
                                    <button onClick={toggleShuffle} className={`transition-all hover:scale-110 ${isShuffle ? 'text-[#1DB954]' : 'text-white/40 hover:text-white'}`}>
                                        <Shuffle size={20} />
                                    </button>
                                    <button onClick={prev} className="text-white hover:scale-110 transition-transform active:scale-95">
                                        <SkipBack size={32} fill="currentColor" />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgba(255,255,255,0.2)]"
                                    >
                                        {isPlaying ? <Pause fill="black" size={28} /> : <Play fill="black" size={28} className="ml-1" />}
                                    </button>
                                    <button onClick={next} className="text-white hover:scale-110 transition-transform active:scale-95">
                                        <SkipForward size={32} fill="currentColor" />
                                    </button>
                                    <button
                                        onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                                        className={`transition-all hover:scale-110 relative ${repeatMode !== 'none' ? 'text-[#1DB954]' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <Repeat size={20} />
                                        {repeatMode === 'one' && (
                                            <span className="absolute -top-1 -right-1 bg-[#1DB954] text-[7px] text-white w-3 h-3 rounded-full flex items-center justify-center font-bold">1</span>
                                        )}
                                    </button>
                                </div>

                                {/* Bottom controls row */}
                                <div className="flex items-center justify-between">
                                    {/* Like + Lyrics */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleLike(currentSong.id)}
                                            className={`p-2 rounded-full transition-all hover:scale-110 ${isLiked ? 'text-[#1DB954]' : 'text-white/40 hover:text-white'}`}
                                        >
                                            <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => setShowLyrics(!showLyrics)}
                                            className={`p-2 rounded-full transition-colors ${showLyrics ? 'text-[#1DB954]' : 'text-white/40 hover:text-white'}`}
                                        >
                                            <Mic2 size={20} />
                                        </button>
                                    </div>

                                    {/* Volume */}
                                    <div className="hidden md:flex items-center gap-3 w-40">
                                        <button
                                            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                                            className="text-white/40 hover:text-white transition-colors"
                                        >
                                            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group/vol hover:h-1.5 transition-all">
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
                                                className="absolute top-0 left-0 h-full bg-white group-hover/vol:bg-[#1DB954] transition-colors rounded-full"
                                                style={{ width: `${volume * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Queue + Share */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
                                            className={`p-2 rounded-full transition-colors ${showQueue ? 'text-[#1DB954]' : 'text-white/40 hover:text-white'}`}
                                        >
                                            <ListMusic size={20} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="p-2 rounded-full text-white/40 hover:text-white transition-colors"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Queue Drawer (slides up from bottom) */}
                        <AnimatePresence>
                            {showQueue && (
                                <motion.div
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: '100%', opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="absolute bottom-0 left-0 right-0 bg-[#181818]/95 backdrop-blur-xl rounded-t-2xl max-h-[50vh] flex flex-col z-30"
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-white/60">Up Next</h3>
                                        <button onClick={() => setShowQueue(false)} className="p-1 hover:bg-white/10 rounded-full">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                        {queue.length === 0 ? (
                                            <div className="text-center py-8 text-white/30">
                                                <ListMusic size={32} className="mx-auto mb-2" />
                                                <p className="text-sm">Queue is empty</p>
                                            </div>
                                        ) : (
                                            queue.map((song, i) => (
                                                <button
                                                    key={song.id + '-' + i}
                                                    onClick={() => play(song)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left ${
                                                        currentSong.id === song.id ? 'bg-white/5' : ''
                                                    }`}
                                                >
                                                    <img
                                                        src={song.cover_url || '/placeholder-music.png'}
                                                        alt={song.title}
                                                        className="w-10 h-10 rounded object-cover bg-white/10 flex-shrink-0"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm font-medium truncate ${currentSong.id === song.id ? 'text-[#1DB954]' : 'text-white'}`}>
                                                            {song.title}
                                                        </div>
                                                        <div className="text-xs text-white/40 truncate">{song.artist}</div>
                                                    </div>
                                                    {currentSong.id === song.id && isPlaying && (
                                                        <div className="flex items-end gap-[2px] mr-2">
                                                            {[0, 0.1, 0.2].map((d, j) => (
                                                                <motion.div
                                                                    key={j}
                                                                    className="w-[3px] rounded-full bg-[#1DB954]"
                                                                    animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
                                                                    transition={{ duration: 1, repeat: Infinity, delay: d }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Lyrics placeholder (slides up) */}
                        <AnimatePresence>
                            {showLyrics && (
                                <motion.div
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: '100%', opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="absolute bottom-0 left-0 right-0 bg-[#181818]/95 backdrop-blur-xl rounded-t-2xl max-h-[50vh] flex flex-col z-30"
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-white/60">Lyrics</h3>
                                        <button onClick={() => setShowLyrics(false)} className="p-1 hover:bg-white/10 rounded-full">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 text-center">
                                        <Mic2 size={40} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/40 text-sm mb-2">Lyrics not available yet</p>
                                        <p className="text-white/20 text-xs">Lyrics will appear here when added by the artist.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
