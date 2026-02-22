import React from 'react';
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
    Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        toggleLike
    } = useAudioPlayer();

    if (!currentSong) return null;

    const isLiked = likedSongs.includes(currentSong.id);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[200] bg-gradient-to-b from-[#282828] to-[#121212] flex flex-col p-6 md:p-12 overflow-hidden text-white"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 md:mb-12">
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronDown size={32} />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Now Playing</span>
                            <span className="text-sm font-bold truncate max-w-[200px]">{currentSong.title}</span>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <MoreHorizontal size={24} />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full">
                        {/* Album Art */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-[300px] md:max-w-[450px] aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden flex-shrink-0"
                        >
                            <img
                                src={currentSong.cover_url}
                                alt={currentSong.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                            />
                        </motion.div>

                        {/* Controls & Details */}
                        <div className="flex-1 flex flex-col w-full">
                            <div className="mb-8 text-center md:text-left">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-4xl md:text-6xl font-black mb-4 tracking-tighter"
                                >
                                    {currentSong.title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl md:text-2xl text-gray-300 font-medium"
                                >
                                    {currentSong.artist}
                                </motion.p>
                            </div>

                            {/* Progress */}
                            <div className="mb-8">
                                <div className="group/progress relative h-1.5 bg-white/10 rounded-full mb-2 cursor-pointer transition-all hover:h-2">
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
                                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 tabular-nums">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* playback buttons */}
                            <div className="flex flex-col gap-8">
                                <div className="flex items-center justify-between md:justify-start md:gap-12">
                                    <button
                                        onClick={() => toggleLike(currentSong.id)}
                                        className={`transition-all hover:scale-110 ${isLiked ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <Heart size={32} fill={isLiked ? "currentColor" : "none"} />
                                    </button>

                                    <div className="flex items-center gap-6 md:gap-10">
                                        <button onClick={toggleShuffle} className={`transition-colors ${isShuffle ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}>
                                            <Shuffle size={24} />
                                        </button>
                                        <button onClick={prev} className="text-white hover:scale-110 transition">
                                            <SkipBack size={40} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={togglePlay}
                                            className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-2xl"
                                        >
                                            {isPlaying ? <Pause fill="black" size={32} /> : <Play fill="black" size={32} className="ml-1" />}
                                        </button>
                                        <button onClick={next} className="text-white hover:scale-110 transition">
                                            <SkipForward size={40} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                                            className={`transition-colors relative ${repeatMode !== 'none' ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Repeat size={24} />
                                            {repeatMode === 'one' && (
                                                <span className="absolute -top-1 -right-1 bg-[#1DB954] text-[8px] text-white w-3 h-3 rounded-full flex items-center justify-center font-bold">1</span>
                                            )}
                                        </button>
                                    </div>

                                    <button className="text-gray-400 hover:text-white transition-colors">
                                        <Share2 size={24} />
                                    </button>
                                </div>

                                {/* Volume control at bottom for desktop */}
                                <div className="hidden md:flex items-center gap-4 w-48 text-gray-400 hover:text-white transition-colors">
                                    <Volume2 size={20} />
                                    <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all">
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
                                            className="absolute top-0 left-0 h-full bg-white hover:bg-[#1DB954] transition-colors"
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ListMusic size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Queue</span>
                        </button>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
