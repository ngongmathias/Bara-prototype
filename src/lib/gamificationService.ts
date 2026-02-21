import { supabase } from './supabase';

export interface GamificationProfile {
    user_id: string;
    total_xp: number;
    current_level: number;
    bara_coins: number;
    daily_streak: number;
    last_activity_at: string;
    consecutive_days: number;
    multiplier: number;
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
    SIGN_IN_BONUS: 50,
};

export const LEVEL_BASE_XP = 1000;
export const LEVEL_MULTIPLIER = 1.5;

export type PrestigeTier = 'Explorer' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export const getPrestigeTier = (level: number): PrestigeTier => {
    if (level >= 71) return 'Diamond';
    if (level >= 41) return 'Gold';
    if (level >= 21) return 'Silver';
    if (level >= 11) return 'Bronze';
    return 'Explorer';
};

export const calculateLevel = (xp: number): number => {
    if (xp < LEVEL_BASE_XP) return 1;
    return Math.floor(Math.pow(xp / LEVEL_BASE_XP, 1 / LEVEL_MULTIPLIER)) + 1;
};

export const getXPForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(LEVEL_BASE_XP * Math.pow(level - 1, LEVEL_MULTIPLIER));
};

// Custom Event for Floating XP UI
export const emitXPEvent = (amount: number, reason: string) => {
    const event = new CustomEvent('bara_xp_gain', { detail: { amount, reason } });
    window.dispatchEvent(event);
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

            // Apply multiplier (MIT-level incentive)
            const multipliedAmount = Math.round(amount * (profile.multiplier || 1));
            const newXP = Number(profile.total_xp) + multipliedAmount;
            const newLevel = calculateLevel(newXP);
            const levelUp = newLevel > profile.current_level;

            // Level up coin bonus (increased for higher tiers)
            const levelUpBonus = levelUp ? (newLevel * 10) : 0;

            const { error } = await supabase
                .from('gamification_profiles')
                .update({
                    total_xp: newXP,
                    current_level: newLevel,
                    bara_coins: Number(profile.bara_coins) + levelUpBonus,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;

            // Trigger visual feedback event
            emitXPEvent(multipliedAmount, reason);

            // Log history
            await supabase.from('gamification_history').insert({
                user_id: userId,
                type: 'xp_gain',
                amount: multipliedAmount,
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

    static async checkDailyStreak(userId: string): Promise<void> {
        try {
            const profile = await this.getProfile(userId);
            if (!profile) return;

            const now = new Date();
            const lastActivity = new Date(profile.last_activity_at);
            const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = profile.consecutive_days;
            let multiplier = profile.multiplier;

            if (diffDays === 1) {
                // Streak continued
                newStreak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                newStreak = 1;
            } else {
                // Same day activity, no update needed to streak count
                return;
            }

            // MIT-level psychological scaling
            if (newStreak >= 30) multiplier = 2.0;
            else if (newStreak >= 7) multiplier = 1.5;
            else if (newStreak >= 3) multiplier = 1.2;
            else multiplier = 1.0;

            const { error } = await supabase
                .from('gamification_profiles')
                .update({
                    consecutive_days: newStreak,
                    multiplier: multiplier,
                    last_activity_at: now.toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;

            // Give a small daily bonus for returning
            await this.addXP(userId, XP_REWARDS.SIGN_IN_BONUS, `Daily Streak: Day ${newStreak}`);

        } catch (error) {
            console.error('Error checking streak:', error);
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

            // Trigger visual celebration event
            const event = new CustomEvent('bara_achievement_earned', {
                detail: { title: achievement.title, subtitle: achievement.description, xp: achievement.xp_reward, coins: achievement.coin_reward }
            });
            window.dispatchEvent(event);

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
