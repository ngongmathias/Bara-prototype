import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPPop {
    id: number;
    amount: number;
    reason: string;
    x: number;
    y: number;
}

export const FloatingXP: React.FC = () => {
    const [pops, setPops] = useState<XPPop[]>([]);

    useEffect(() => {
        const handleXPGain = (e: any) => {
            const { amount, reason } = e.detail;

            // Generate random position near the center/top but slightly offset
            const newPop: XPPop = {
                id: Date.now(),
                amount,
                reason,
                x: Math.random() * 40 - 20, // offset -20 to 20
                y: Math.random() * 20 - 40, // offset -40 to -20
            };

            setPops(prev => [...prev, newPop]);

            // Remove after animation
            setTimeout(() => {
                setPops(prev => prev.filter(p => p.id !== newPop.id));
            }, 2000);
        };

        window.addEventListener('bara_xp_gain', handleXPGain);
        return () => window.removeEventListener('bara_xp_gain', handleXPGain);
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
                            scale: [0.5, 1.2, 1],
                            y: -100 + pop.y,
                            x: pop.x
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-2xl font-black text-orange-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                            +{pop.amount} XP
                        </span>
                        <span className="text-xs font-bold text-gray-700 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                            {pop.reason}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
