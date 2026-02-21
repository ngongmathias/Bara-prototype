import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { FloatingXP } from './FloatingXP';
import { CelebrationModal } from './CelebrationModal';

export const GlobalGamification: React.FC = () => {
    const { celebration, setCelebration } = useGamification();

    return (
        <>
            <FloatingXP />
            <CelebrationModal
                isOpen={celebration.isOpen}
                onClose={() => setCelebration(false)}
                type={celebration.type}
                title={celebration.title}
                subtitle={celebration.subtitle}
                rewardXp={celebration.xp}
                rewardCoins={celebration.coins}
            />
        </>
    );
};
