import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GamificationService, GamificationProfile, calculateLevel, getXPForLevel } from '@/lib/gamificationService';
import { useUser } from '@clerk/clerk-react';

export const useGamification = () => {
    const { user } = useUser();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!user) return;
        const data = await GamificationService.getProfile(user.id);
        setProfile(data);
        setLoading(false);
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
                        setProfile(payload.new as GamificationProfile);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
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
        addXP,
        spendCoins,
        getProgress,
        refresh: fetchProfile
    };
};
