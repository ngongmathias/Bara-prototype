import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface CoinPop {
    id: number;
    amount: number;
    reason: string;
    x: number;
    y: number;
}

export const FloatingCoins: React.FC = () => {
    const [pops, setPops] = useState<CoinPop[]>([]);

    useEffect(() => {
        const handleCoinGain = (e: any) => {
            const { amount, reason } = e.detail;
            if (!amount || amount <= 0) return;

            const newPop: CoinPop = {
                id: Date.now() + Math.random(),
                amount,
                reason,
                x: Math.random() * 40 - 20,
                y: Math.random() * 20 - 20,
            };

            setPops(prev => [...prev, newPop]);
            setTimeout(() => {
                setPops(prev => prev.filter(p => p.id !== newPop.id));
            }, 2000);
        };

        window.addEventListener('bara_coin_gain', handleCoinGain);
        return () => window.removeEventListener('bara_coin_gain', handleCoinGain);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            <AnimatePresence>
                {pops.map(pop => (
                    <motion.div
                        key={pop.id}
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.15, 1],
                            y: -120 + pop.y,
                            x: pop.x,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full shadow-lg border border-gray-700">
                            <Coins size={18} className="text-amber-400" />
                            <span className="text-sm font-black tracking-tight">+{pop.amount}</span>
                        </div>
                        <span className="mt-1 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                            {pop.reason}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
