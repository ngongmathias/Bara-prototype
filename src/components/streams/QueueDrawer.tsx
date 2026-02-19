import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Music, GripVertical, Trash2 } from 'lucide-react';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';

interface QueueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
    const { queue, currentSong, play, isPlaying } = useAudioPlayer();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#121212] border-l border-white/5 z-[120] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Queue</h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    {queue.length} Songs Total
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide">
                            {/* Currently Playing Section */}
                            {currentSong && (
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-4 px-2">Now Playing</h3>
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-4">
                                        <div className="relative group flex-shrink-0">
                                            <img src={currentSong.cover_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                            {isPlaying && (
                                                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 rounded-lg">
                                                    <div className="w-1 h-3 bg-purple-500 rounded-full animate-bars"></div>
                                                    <div className="w-1 h-5 bg-purple-500 rounded-full animate-bars" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-1 h-3 bg-purple-500 rounded-full animate-bars" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-white truncate">{currentSong.title}</div>
                                            <div className="text-sm text-purple-400 font-bold truncate">{currentSong.artist}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Up Next Section */}
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Next Up</h3>
                                <div className="space-y-1">
                                    {queue.length > 0 ? (
                                        queue.map((song, index) => {
                                            const isPlayingNow = currentSong?.id === song.id;
                                            if (isPlayingNow) return null; // Skip current song as it's above

                                            return (
                                                <motion.div
                                                    key={`${song.id}-${index}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="group flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                                    onClick={() => play(song)}
                                                >
                                                    <div className="w-10 h-10 relative flex-shrink-0">
                                                        <img src={song.cover_url} className="w-full h-full rounded shadow-md object-cover" alt="" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                                            <Play size={16} fill="white" />
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-white truncate text-sm">{song.title}</div>
                                                        <div className="text-xs text-gray-500 font-bold truncate">{song.artist}</div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-500 font-mono">
                                                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                                        </span>
                                                        <GripVertical size={16} className="text-gray-600 cursor-grab" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-12 text-center text-gray-600">
                                            <Music size={40} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">Queue is empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer / Controls */}
                        <div className="p-6 bg-black/40 border-t border-white/5">
                            <button
                                className="w-full py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-[1.02] transition-transform active:scale-95"
                                onClick={onClose}
                            >
                                Continue Listening
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
