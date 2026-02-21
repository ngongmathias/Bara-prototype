import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GamificationService, GamificationProfile, calculateLevel, getXPForLevel } from '@/lib/gamificationService';
import { useUser } from '@clerk/clerk-react';

export const useGamification = () => {
    const { user } = useUser();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [celebration, setCelebration] = useState<{
        isOpen: boolean;
        type: 'level_up' | 'achievement';
        title: string;
        subtitle: string;
        xp?: number;
        coins?: number;
    }>({
        isOpen: false,
        type: 'level_up',
        title: '',
        subtitle: ''
    });

    const fetchProfile = async () => {
        if (!user) return;
        const data = await GamificationService.getProfile(user.id);
        setProfile(data);
        setLoading(false);

        // Check streak on first load
        if (data) {
            await GamificationService.checkDailyStreak(user.id);
        }
    };

    useEffect(() => {
        fetchProfile();

        // Subscribe to profile changes
        if (user) {
            const channel = supabase
                .channel(`gamification_profile_${user.id}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'gamification_profiles', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        const newProfile = payload.new as GamificationProfile;

                        // Detect Level Up for celebration
                        setProfile(prev => {
                            if (prev && newProfile.current_level > prev.current_level) {
                                setCelebration({
                                    isOpen: true,
                                    type: 'level_up',
                                    title: `Level ${newProfile.current_level}`,
                                    subtitle: 'You are reaching new heights! Keep up the great work.',
                                    xp: 0,
                                    coins: newProfile.current_level * 10
                                });
                            }
                            return newProfile;
                        });
                    }
                )
                .subscribe();

            // Listen for Achievement Unlocks
            const handleAchievement = (e: any) => {
                const { title, subtitle, xp, coins } = e.detail;
                setCelebration({
                    isOpen: true,
                    type: 'achievement',
                    title,
                    subtitle,
                    xp,
                    coins
                });
            };

            window.addEventListener('bara_achievement_earned', handleAchievement);

            return () => {
                supabase.removeChannel(channel);
                window.removeEventListener('bara_achievement_earned', handleAchievement);
            };
        }
    }, [user]);

    const addXP = async (amount: number, reason: string) => {
        if (!user) return null;
        return await GamificationService.addXP(user.id, amount, reason);
    };

    const spendCoins = async (amount: number, reason: string) => {
        if (!user) return false;
        return await GamificationService.spendCoins(user.id, amount, reason);
    };

    const getProgress = () => {
        if (!profile) return { current: 0, next: 1000, percentage: 0 };

        const currentLevelXP = getXPForLevel(profile.current_level);
        const nextLevelXP = getXPForLevel(profile.current_level + 1);
        const xpInCurrentLevel = profile.total_xp - currentLevelXP;
        const xpNeededForNext = nextLevelXP - currentLevelXP;

        return {
            current: profile.total_xp,
            next: nextLevelXP,
            percentage: Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100))
        };
    };

    return {
        profile,
        loading,
        celebration,
        setCelebration: (isOpen: boolean) => setCelebration(prev => ({ ...prev, isOpen })),
        addXP,
        spendCoins,
        getProgress,
        refresh: fetchProfile
    };
};
