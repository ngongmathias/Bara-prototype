import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import {
    ChevronDown,
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
    Disc3,
    X,
    ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

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
        play,
    } = useAudioPlayer();

    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'now' | 'queue'>('now');
    const [featuredArtists, setFeaturedArtists] = useState<string[]>([]);
    const [albumInfo, setAlbumInfo] = useState<{ title: string; cover_url: string } | null>(null);
    const [dominantColor, setDominantColor] = useState('#1DB954');

    // Fetch featured artists
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

    // Fetch album info
    useEffect(() => {
        if (!currentSong?.album_id) { setAlbumInfo(null); return; }
        let cancelled = false;
        (async () => {
            try {
                const { data } = await supabase
                    .from('albums')
                    .select('title, cover_url')
                    .eq('id', currentSong.album_id)
                    .single();
                if (!cancelled && data) setAlbumInfo(data);
            } catch {
                if (!cancelled) setAlbumInfo(null);
            }
        })();
        return () => { cancelled = true; };
    }, [currentSong?.album_id]);

    // Extract dominant color from album art via canvas (desaturated for subtle ambience)
    useEffect(() => {
        if (!currentSong?.cover_url) { setDominantColor('#1DB954'); return; }
        let cancelled = false;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (cancelled) return;
            try {
                const size = 32;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, size, size);
                const { data } = ctx.getImageData(0, 0, size, size);
                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const a = data[i + 3];
                    if (a < 128) continue;
                    const pr = data[i], pg = data[i + 1], pb = data[i + 2];
                    const max = Math.max(pr, pg, pb);
                    const min = Math.min(pr, pg, pb);
                    if (max - min < 20) continue; // skip near-grey
                    if (max < 40 || min > 220) continue; // skip near-black/white
                    r += pr; g += pg; b += pb; count += 1;
                }
                if (count === 0) { setDominantColor('#1DB954'); return; }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                // Desaturate 30% toward grey
                const grey = Math.round((r + g + b) / 3);
                const mix = 0.3;
                r = Math.round(r * (1 - mix) + grey * mix);
                g = Math.round(g * (1 - mix) + grey * mix);
                b = Math.round(b * (1 - mix) + grey * mix);
                setDominantColor(`rgb(${r}, ${g}, ${b})`);
            } catch {
                setDominantColor('#1DB954');
            }
        };
        img.onerror = () => { if (!cancelled) setDominantColor('#1DB954'); };
        img.src = currentSong.cover_url;
        return () => { cancelled = true; };
    }, [currentSong?.id, currentSong?.cover_url]);

    if (!currentSong) return null;

    const isLiked = likedSongs.includes(currentSong.id);
    const progressPct = (progress / (duration || 1)) * 100;
    const artistDisplay = currentSong.artist + (featuredArtists.length > 0 ? ` ft. ${featuredArtists.join(', ')}` : '');

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/streams/song/${currentSong.id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: currentSong.title, text: `Listen to ${currentSong.title} by ${currentSong.artist} on BARA Streams`, url: shareUrl });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast({ title: 'Link copied!' });
            }
        } catch { /* cancelled */ }
    };

    // Upcoming songs in queue (after current)
    const currentIdx = queue.findIndex(s => s.id === currentSong.id);
    const upNext = currentIdx >= 0 ? queue.slice(currentIdx + 1) : queue;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                    className="fixed inset-0 z-[2147483647] flex flex-col text-white select-none transition-colors duration-1000"
                    style={{ background: `linear-gradient(to bottom, ${dominantColor}, #0a0a0a 70%)` }}
                >
                    {/* Ambient background glow from cover art */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                            src={currentSong.cover_url}
                            alt=""
                            className="absolute top-0 left-0 w-full h-[70%] object-cover blur-[120px] opacity-25 scale-[1.5]"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/70 to-[#0a0a0a]" />
                    </div>

                    {/* ===== HEADER ===== */}
                    <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                        <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close">
                            <ChevronDown size={26} />
                        </button>
                        <div className="flex flex-col items-center flex-1 min-w-0 px-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Playing from</span>
                            <span className="text-xs font-semibold text-white/70 truncate max-w-[220px]">
                                {albumInfo?.title || currentSong.album_title || 'BARA Streams'}
                            </span>
                        </div>
                        <button onClick={handleShare} className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Share">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* ===== MAIN CONTENT ===== */}
                    <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">

                        {/* LEFT: Album art + Song info + Controls (mobile: full width, desktop: 60%) */}
                        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 py-4 min-h-0">

                            {/* Album Art */}
                            <motion.div
                                key={currentSong.id}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] aspect-square mb-6 md:mb-8 flex-shrink-0"
                            >
                                {/* Color glow behind art */}
                                <div
                                    className="absolute inset-6 rounded-3xl blur-[60px] opacity-30 transition-colors duration-1000"
                                    style={{ backgroundColor: dominantColor }}
                                />
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                                    <img
                                        src={currentSong.cover_url}
                                        alt={currentSong.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                    />
                                    {/* Subtle playing indicator */}
                                    {isPlaying && (
                                        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                            <Disc3 size={16} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Song Info */}
                            <div className="w-full max-w-[440px] mb-4 md:mb-6 flex-shrink-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <motion.h1
                                            key={currentSong.id + '-t'}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight truncate"
                                        >
                                            {currentSong.title}
                                        </motion.h1>
                                        <motion.div
                                            key={currentSong.id + '-a'}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.05 }}
                                            className="flex items-center gap-2 mt-1"
                                        >
                                            {currentSong.artist_id ? (
                                                <Link
                                                    to={`/streams/artist/${currentSong.artist_id}`}
                                                    onClick={onClose}
                                                    className="text-sm md:text-base text-white/60 hover:text-white hover:underline transition-colors truncate"
                                                >
                                                    {artistDisplay}
                                                </Link>
                                            ) : (
                                                <span className="text-sm md:text-base text-white/60 truncate">{artistDisplay}</span>
                                            )}
                                        </motion.div>
                                    </div>
                                    <button
                                        onClick={() => toggleLike(currentSong.id)}
                                        className={`p-2 rounded-full flex-shrink-0 transition-all hover:scale-110 ${isLiked ? 'text-[#1DB954]' : 'text-white/30 hover:text-white'}`}
                                    >
                                        <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full max-w-[440px] mb-4 md:mb-6 flex-shrink-0">
                                <div className="group relative h-1 bg-white/10 rounded-full cursor-pointer transition-all hover:h-1.5">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 100}
                                        value={progress || 0}
                                        onChange={(e) => seek(parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div
                                        className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ left: `calc(${progressPct}% - 6px)` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5 text-[11px] font-medium text-white/30 tabular-nums">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center justify-center gap-7 md:gap-8 mb-4 md:mb-6 flex-shrink-0">
                                <button
                                    onClick={toggleShuffle}
                                    className={`transition-all hover:scale-110 ${isShuffle ? 'text-[#1DB954]' : 'text-white/30 hover:text-white'}`}
                                >
                                    <Shuffle size={20} />
                                </button>
                                <button onClick={prev} className="text-white/80 hover:text-white hover:scale-110 transition-all active:scale-95">
                                    <SkipBack size={28} fill="currentColor" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
                                >
                                    {isPlaying ? <Pause fill="black" size={26} /> : <Play fill="black" size={26} className="ml-0.5" />}
                                </button>
                                <button onClick={next} className="text-white/80 hover:text-white hover:scale-110 transition-all active:scale-95">
                                    <SkipForward size={28} fill="currentColor" />
                                </button>
                                <button
                                    onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                                    className={`transition-all hover:scale-110 relative ${repeatMode !== 'none' ? 'text-[#1DB954]' : 'text-white/30 hover:text-white'}`}
                                >
                                    <Repeat size={20} />
                                    {repeatMode === 'one' && (
                                        <span className="absolute -top-1 -right-1 bg-[#1DB954] text-[7px] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">1</span>
                                    )}
                                </button>
                            </div>

                            {/* Bottom row: Volume + Queue toggle (mobile) + more */}
                            <div className="w-full max-w-[440px] flex items-center justify-between flex-shrink-0">
                                {/* Artist link */}
                                {currentSong.artist_id && (
                                    <Link
                                        to={`/streams/artist/${currentSong.artist_id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        <ExternalLink size={12} />
                                        <span>Go to artist</span>
                                    </Link>
                                )}
                                {!currentSong.artist_id && <div />}

                                <div className="flex items-center gap-3">
                                    {/* Queue toggle (visible on mobile) */}
                                    <button
                                        onClick={() => setActiveTab(activeTab === 'queue' ? 'now' : 'queue')}
                                        className={`p-2 rounded-full transition-colors lg:hidden ${activeTab === 'queue' ? 'text-[#1DB954]' : 'text-white/30 hover:text-white'}`}
                                    >
                                        <ListMusic size={20} />
                                    </button>
                                    {/* Volume (desktop) */}
                                    <div className="hidden md:flex items-center gap-2 w-28">
                                        <button
                                            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                                            className="text-white/30 hover:text-white transition-colors flex-shrink-0"
                                        >
                                            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                        </button>
                                        <div className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer group/vol hover:h-1.5 transition-all">
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
                                                className="absolute top-0 left-0 h-full bg-white/60 group-hover/vol:bg-white rounded-full transition-colors"
                                                style={{ width: `${volume * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR: Up Next queue (desktop always visible, mobile toggled) */}
                        <AnimatePresence>
                            {(activeTab === 'queue' || typeof window !== 'undefined') && (
                                <motion.div
                                    className={`
                                        ${activeTab === 'queue' ? 'flex' : 'hidden'} lg:flex
                                        flex-col w-full lg:w-[340px] xl:w-[380px] lg:border-l border-white/5
                                        bg-black/30 lg:bg-transparent
                                        absolute lg:relative inset-0 lg:inset-auto z-20 lg:z-auto
                                    `}
                                >
                                    {/* Queue header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Up Next</h3>
                                        <button
                                            onClick={() => setActiveTab('now')}
                                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors lg:hidden"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Now Playing card */}
                                    <div className="px-4 pt-4 pb-2 flex-shrink-0">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Now Playing</p>
                                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                                            <img
                                                src={currentSong.cover_url || '/placeholder-music.png'}
                                                alt={currentSong.title}
                                                className="w-11 h-11 rounded-md object-cover flex-shrink-0"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-[#1DB954] truncate">{currentSong.title}</div>
                                                <div className="text-xs text-white/40 truncate">{artistDisplay}</div>
                                            </div>
                                            {isPlaying && (
                                                <div className="flex items-end gap-[2px] flex-shrink-0">
                                                    {[0, 0.12, 0.24].map((d, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-[3px] rounded-full bg-[#1DB954]"
                                                            animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
                                                            transition={{ duration: 1, repeat: Infinity, delay: d }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Queue list */}
                                    <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
                                        {upNext.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-white/20">
                                                <ListMusic size={28} className="mb-2" />
                                                <p className="text-xs">Nothing queued up</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5">
                                                {upNext.map((song, i) => (
                                                    <button
                                                        key={song.id + '-q-' + i}
                                                        onClick={() => play(song)}
                                                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                                                    >
                                                        <span className="text-xs text-white/20 w-5 text-right font-medium flex-shrink-0">{i + 1}</span>
                                                        <img
                                                            src={song.cover_url || '/placeholder-music.png'}
                                                            alt={song.title}
                                                            className="w-9 h-9 rounded object-cover bg-white/10 flex-shrink-0"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium truncate text-white/80 group-hover:text-white transition-colors">{song.title}</div>
                                                            <div className="text-xs text-white/30 truncate">{song.artist}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
