import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Music, GripVertical, Trash2 } from 'lucide-react';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

interface QueueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const fmt = (s?: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

export function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
    const { queue, currentSong, play, isPlaying, removeFromQueue, reorderQueue, clearQueue } = useAudioPlayer();
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    const currentIdx = currentSong ? queue.findIndex((s) => s.id === currentSong.id) : -1;
    // Up-next = everything after the current track (real queue indices preserved).
    const upNext = queue
        .map((song, index) => ({ song, index }))
        .filter(({ index }) => index !== currentIdx);

    const handleDrop = (targetIndex: number) => {
        if (dragIndex !== null && dragIndex !== targetIndex) reorderQueue(dragIndex, targetIndex);
        setDragIndex(null);
        setOverIndex(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-[120] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Queue</h2>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                    {upNext.length} up next
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {upNext.length > 0 && (
                                    <button
                                        onClick={clearQueue}
                                        className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-700"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide">
                            {/* Now Playing */}
                            {currentSong && (
                                <div className="mb-6">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Now Playing</h3>
                                    <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3">
                                        <div className="relative flex-shrink-0">
                                            <img loading="lazy" src={currentSong.cover_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                            {isPlaying && (
                                                <div className="absolute inset-0 flex items-center justify-center gap-[2px] bg-black/40 rounded-lg">
                                                    <div className="w-1 h-3 bg-white rounded-full animate-bars" />
                                                    <div className="w-1 h-5 bg-white rounded-full animate-bars" style={{ animationDelay: '0.2s' }} />
                                                    <div className="w-1 h-3 bg-white rounded-full animate-bars" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-gray-900 truncate">{currentSong.title}</div>
                                            <div className="text-sm text-gray-500 truncate">{currentSong.artist}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Up Next */}
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Next up</h3>
                                {upNext.length > 0 ? (
                                    <div className="space-y-0.5">
                                        {upNext.map(({ song, index }) => (
                                            <div
                                                key={`${song.id}-${index}`}
                                                draggable
                                                onDragStart={() => setDragIndex(index)}
                                                onDragOver={(e) => { e.preventDefault(); setOverIndex(index); }}
                                                onDrop={() => handleDrop(index)}
                                                onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                                                className={`group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                                                    overIndex === index && dragIndex !== null ? 'bg-gray-100 ring-1 ring-gray-300' : 'hover:bg-gray-50'
                                                } ${dragIndex === index ? 'opacity-40' : ''}`}
                                                onClick={() => play(song)}
                                            >
                                                <button
                                                    className="text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label="Drag to reorder"
                                                >
                                                    <GripVertical size={16} />
                                                </button>
                                                <div className="w-10 h-10 relative flex-shrink-0">
                                                    <img loading="lazy" src={song.cover_url} className="w-full h-full rounded object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                                        <Play size={14} fill="white" className="text-white ml-0.5" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-gray-900 truncate text-sm">{song.title}</div>
                                                    <div className="text-xs text-gray-500 truncate">{song.artist}</div>
                                                </div>
                                                <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0">{fmt(song.duration)}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                                                    className="text-gray-300 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                    aria-label="Remove from queue"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-14 text-center text-gray-400">
                                        <Music size={36} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-bold text-gray-500">Nothing queued up</p>
                                        <p className="text-xs mt-1">Play an album or add songs to build a queue.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
