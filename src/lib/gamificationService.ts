import { supabase } from './supabase';

export interface GamificationProfile {
    user_id: string;
    total_xp: number;
    current_level: number;
    bara_coins: number;
    daily_streak: number;
    last_login_at: string;
}

export interface Achievement {
    id: string;
    key: string;
    title: string;
    description: string;
    icon_url: string;
    xp_reward: number;
    coin_reward: number;
    category: string;
}

export const XP_REWARDS = {
    SONG_LISTEN: 10,
    PLAYLIST_CREATE: 100,
    LISTING_CREATE: 200,
    TICKET_PURCHASE: 500,
    DAILY_STREAK_BONUS: 20,
};

export const LEVEL_BASE_XP = 1000;
export const LEVEL_MULTIPLIER = 1.5;

export const calculateLevel = (xp: number): number => {
    // Simple progression: Level 1 = 0, Level 2 = 1000, Level 3 = 2500, etc.
    // Formula: XP = Base * (L^1.5) -> L = (XP/Base)^(1/1.5)
    if (xp < LEVEL_BASE_XP) return 1;
    return Math.floor(Math.pow(xp / LEVEL_BASE_XP, 1 / LEVEL_MULTIPLIER)) + 1;
};

export const getXPForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(LEVEL_BASE_XP * Math.pow(level - 1, LEVEL_MULTIPLIER));
};

export class GamificationService {
    static async getProfile(userId: string): Promise<GamificationProfile | null> {
        const { data, error } = await supabase
            .from('gamification_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching gamification profile:', error);
            return null;
        }
        return data;
    }

    static async addXP(userId: string, amount: number, reason: string): Promise<{ levelUp: boolean; newLevel: number } | null> {
        try {
            const profile = await this.getProfile(userId);
            if (!profile) return null;

            const newXP = Number(profile.total_xp) + amount;
            const newLevel = calculateLevel(newXP);
            const levelUp = newLevel > profile.current_level;

            // Award 1 coin for every 100 XP gained (indirectly via this logic)
            // Actually, let's just award coins based on specific achievement rewards
            // But we can add a "level up" coin bonus
            const levelUpBonus = levelUp ? (newLevel * 10) : 0;

            const { data, error } = await supabase
                .from('gamification_profiles')
                .update({
                    total_xp: newXP,
                    current_level: newLevel,
                    bara_coins: Number(profile.bara_coins) + levelUpBonus,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            // Log history
            await supabase.from('gamification_history').insert({
                user_id: userId,
                type: 'xp_gain',
                amount,
                reason
            });

            if (levelUpBonus > 0) {
                await supabase.from('gamification_history').insert({
                    user_id: userId,
                    type: 'coin_gain',
                    amount: levelUpBonus,
                    reason: `Level Up to ${newLevel}`
                });
            }

            return { levelUp, newLevel };
        } catch (error) {
            console.error('Error adding XP:', error);
            return null;
        }
    }

    static async spendCoins(userId: string, amount: number, reason: string): Promise<boolean> {
        try {
            const profile = await this.getProfile(userId);
            if (!profile || profile.bara_coins < amount) return false;

            const { error } = await supabase
                .from('gamification_profiles')
                .update({
                    bara_coins: Number(profile.bara_coins) - amount,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;

            await supabase.from('gamification_history').insert({
                user_id: userId,
                type: 'coin_spend',
                amount,
                reason
            });

            return true;
        } catch (error) {
            console.error('Error spending coins:', error);
            return false;
        }
    }

    static async getAchievements(): Promise<Achievement[]> {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .order('xp_reward', { ascending: false });

        if (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
        return data;
    }

    static async getUserAchievements(userId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user achievements:', error);
            return [];
        }
        return data.map(ua => ua.achievement_id);
    }

    static async awardAchievement(userId: string, achievementKey: string): Promise<boolean> {
        try {
            // Get achievement details
            const { data: achievement, error: achError } = await supabase
                .from('achievements')
                .select('*')
                .eq('key', achievementKey)
                .single();

            if (achError || !achievement) return false;

            // Check if already awarded
            const { data: existing } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', userId)
                .eq('achievement_id', achievement.id)
                .maybeSingle();

            if (existing) return false;

            // Award it
            const { error: insError } = await supabase
                .from('user_achievements')
                .insert({
                    user_id: userId,
                    achievement_id: achievement.id
                });

            if (insError) throw insError;

            // Give rewards
            if (achievement.xp_reward > 0) {
                await this.addXP(userId, achievement.xp_reward, `Achievement: ${achievement.title}`);
            }

            if (achievement.coin_reward > 0) {
                // Since addXP doesn't directly add coins unless levelUp, we add them here
                const profile = await this.getProfile(userId);
                if (profile) {
                    await supabase
                        .from('gamification_profiles')
                        .update({
                            bara_coins: Number(profile.bara_coins) + achievement.coin_reward
                        })
                        .eq('user_id', userId);

                    await supabase.from('gamification_history').insert({
                        user_id: userId,
                        type: 'coin_gain',
                        amount: achievement.coin_reward,
                        reason: `Achievement: ${achievement.title}`
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Error awarding achievement:', error);
            return false;
        }
    }
}
