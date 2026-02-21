import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'level_up' | 'achievement';
    title: string;
    subtitle: string;
    rewardXp?: number;
    rewardCoins?: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
    isOpen,
    onClose,
    type,
    title,
    subtitle,
    rewardXp,
    rewardCoins
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                    >
                        {/* Animated Background Rays */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 opacity-5 pointer-events-none"
                            style={{
                                backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, #f97316 20deg, transparent 40deg)',
                                backgroundSize: '100% 100%'
                            }}
                        />

                        <div className="relative z-10">
                            {/* Icon */}
                            <motion.div
                                initial={{ y: -20, rotate: -20 }}
                                animate={{ y: 0, rotate: 0 }}
                                transition={{ type: "spring", damping: 10 }}
                                className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center mb-6 shadow-xl"
                            >
                                {type === 'level_up' ? (
                                    <Star className="w-12 h-12 text-white fill-white" />
                                ) : (
                                    <Trophy className="w-12 h-12 text-white" />
                                )}
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-black text-gray-900 mb-2 font-comfortaa uppercase tracking-tight"
                            >
                                {type === 'level_up' ? 'Level Up!' : 'Achievement!'}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-lg font-bold text-orange-600 mb-4"
                            >
                                {title}
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 mb-8"
                            >
                                {subtitle}
                            </motion.p>

                            {/* Rewards */}
                            {(rewardXp || rewardCoins) && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center gap-4 mb-8"
                                >
                                    {rewardXp && (
                                        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
                                            <span className="block text-xs uppercase font-bold text-orange-400">XP</span>
                                            <span className="text-xl font-black text-orange-600">+{rewardXp}</span>
                                        </div>
                                    )}
                                    {rewardCoins && (
                                        <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                                            <span className="block text-xs uppercase font-bold text-yellow-500">Coins</span>
                                            <span className="text-xl font-black text-yellow-600">+{rewardCoins}</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-6 rounded-2xl group"
                                >
                                    Fantastic!
                                    <Sparkles className="ml-2 w-5 h-5 group-hover:animate-pulse" />
                                </Button>
                            </motion.div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
