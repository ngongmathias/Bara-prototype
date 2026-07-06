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
    streak_shields?: number;
}


export interface Mission {
    id: string;
    key: string;
    title: string;
    description: string;
    goal: number;
    xp_reward: number;
    coin_reward: number;
    type: 'daily' | 'weekly' | 'achievement';
    category: string;
}


export interface UserMission extends Mission {
    current_progress: number;
    is_completed: boolean;
    claimed_at: string | null;
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


// ---------------------------------------------------------------------------
// Admin-tunable economy settings
// Every number in the economy (XP per action, coin rewards, perk costs, caps,
// the coin's reference worth) lives in the `gamification_settings` table and is
// editable from Admin → Gamification. The values below are the fallback
// defaults used when a key is missing (or the table hasn't been migrated yet),
// so the app keeps working with the historical values either way.
// ---------------------------------------------------------------------------

export const DEFAULT_ECONOMY_SETTINGS: Record<string, { value: number; label: string; group: string }> = {
    'xp.song_listen': { value: 10, label: 'Song listen', group: 'XP rewards' },
    'xp.daily_login': { value: 50, label: 'Daily login / streak bonus', group: 'XP rewards' },
    'xp.playlist_create': { value: 100, label: 'Create a playlist', group: 'XP rewards' },
    'xp.listing_create': { value: 200, label: 'Post a marketplace ad', group: 'XP rewards' },
    'xp.ticket_purchase': { value: 500, label: 'Register for an event', group: 'XP rewards' },
    'xp.event_photo': { value: 25, label: 'Upload an event photo (each)', group: 'XP rewards' },
    'xp.blog_published': { value: 150, label: 'Blog article published', group: 'XP rewards' },
    'coins.blog_published': { value: 25, label: 'Blog article published', group: 'Coin rewards' },
    'coins.starting_balance': { value: 100, label: 'New user starting balance', group: 'Coin rewards' },
    'coins.levelup_per_level': { value: 10, label: 'Level-up bonus (× new level)', group: 'Coin rewards' },
    'cost.ad_free_24h': { value: 20, label: 'Ad-free browsing (24h)', group: 'Coin costs' },
    'cost.listing_boost': { value: 50, label: 'Marketplace ad boost', group: 'Coin costs' },
    'cost.track_boost': { value: 50, label: 'Track boost (creator)', group: 'Coin costs' },
    'cost.streak_shield': { value: 50, label: 'Streak Shield', group: 'Coin costs' },
    'limit.daily_listen_xp_cap': { value: 50, label: 'Songs per day that earn XP', group: 'Limits' },
    'limit.daily_xp_cap': { value: 20000, label: 'Max XP earned per day', group: 'Limits' },
    'limit.daily_coin_gain_cap': { value: 20000, label: 'Max coins earned per day', group: 'Limits' },
    'economy.coins_per_usd': { value: 100, label: 'Coin worth: coins per 1 USD', group: 'Economy' },
    'perk.gold_coin_bonus_pct': { value: 5, label: 'Gold tier coin bonus (%)', group: 'Perks' },
    'leaderboard.rank1_coins': { value: 200, label: 'Weekly rank 1 prize', group: 'Leaderboard prizes' },
    'leaderboard.rank2_coins': { value: 100, label: 'Weekly rank 2 prize', group: 'Leaderboard prizes' },
    'leaderboard.rank3_coins': { value: 50, label: 'Weekly rank 3 prize', group: 'Leaderboard prizes' },
    'leaderboard.rank4to10_coins': { value: 20, label: 'Weekly ranks 4–10 prize', group: 'Leaderboard prizes' },
};

let _settingsCache: Record<string, number> | null = null;
let _settingsCacheAt = 0;
const SETTINGS_TTL_MS = 5 * 60 * 1000;


export type PrestigeTier = 'Explorer' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond';


export const getPrestigeTier = (level: number): PrestigeTier => {
    if (level >= 71) return 'Diamond';
    if (level >= 41) return 'Gold';
    if (level >= 21) return 'Silver';
    if (level >= 11) return 'Bronze';
    return 'Explorer';
};


// Phase 27.3.5 — flatten the early curve. Thresholds for levels 2–9 are HALVED
// so new users level up quickly in week 1; levels ≥10 keep today's cumulative
// XP (getXPForLevel(10) = 27,000) so nobody at L10+ ever loses a level. The two
// functions are exact inverses; the SQL economy_level_from_xp mirrors this.
const LEVEL10_XP = Math.floor(LEVEL_BASE_XP * Math.pow(9, LEVEL_MULTIPLIER)); // 27,000

export const calculateLevel = (xp: number): number => {
    if (xp >= LEVEL10_XP) {
        // Unchanged (original) curve from L10 up.
        return Math.floor(Math.pow(xp / LEVEL_BASE_XP, 1 / LEVEL_MULTIPLIER)) + 1;
    }
    // Below L10: halved thresholds (reach level L at floor(500 · (L−1)^1.5)),
    // capped at 9 since L10 requires the full 27,000.
    if (xp < LEVEL_BASE_XP / 2) return 1;
    return Math.min(9, Math.floor(Math.pow(xp / (LEVEL_BASE_XP / 2), 1 / LEVEL_MULTIPLIER)) + 1);
};


export const getXPForLevel = (level: number): number => {
    if (level <= 1) return 0;
    if (level < 10) {
        // Halved early thresholds.
        return Math.floor((LEVEL_BASE_XP * Math.pow(level - 1, LEVEL_MULTIPLIER)) / 2);
    }
    return Math.floor(LEVEL_BASE_XP * Math.pow(level - 1, LEVEL_MULTIPLIER));
};


// Custom Event for Floating XP UI
export const emitXPEvent = (amount: number, reason: string) => {
    const event = new CustomEvent('bara_xp_gain', { detail: { amount, reason } });
    window.dispatchEvent(event);
};

export const emitCoinEvent = (amount: number, reason: string) => {
    const event = new CustomEvent('bara_coin_gain', { detail: { amount, reason } });
    window.dispatchEvent(event);
};


// ---------------------------------------------------------------------------
// Phase 27.2.1 — Server-side economy.
// Every WRITE goes through a SECURITY DEFINER RPC (see
// 20260705_gamification_server_hardening.sql). The gamification tables are
// SELECT-only for the client, so reads stay direct but nothing can mint coins
// or XP by writing a table. If an RPC fails we surface the error (no fallback
// to direct table writes). Method signatures + bara_xp_gain / bara_coin_gain
// UI events are unchanged so no consumer breaks.
// ---------------------------------------------------------------------------

export class GamificationService {
    // ------------------------------------------------------------------
    // Economy settings (admin-tunable, cached 5 min, safe fallbacks)
    // ------------------------------------------------------------------

    static async getEconomySettings(force = false): Promise<Record<string, number>> {
        const now = Date.now();
        if (!force && _settingsCache && now - _settingsCacheAt < SETTINGS_TTL_MS) return _settingsCache;

        const merged: Record<string, number> = {};
        Object.entries(DEFAULT_ECONOMY_SETTINGS).forEach(([k, v]) => { merged[k] = v.value; });
        try {
            const { data, error } = await supabase.from('gamification_settings').select('key, value');
            if (!error && data) {
                data.forEach((row: any) => {
                    const n = Number(row.value);
                    if (!isNaN(n)) merged[row.key] = n;
                });
            }
        } catch {
            // Table not migrated yet — defaults keep everything working.
        }
        _settingsCache = merged;
        _settingsCacheAt = now;
        return merged;
    }

    static async getSetting(key: string): Promise<number> {
        const settings = await this.getEconomySettings();
        return settings[key] ?? DEFAULT_ECONOMY_SETTINGS[key]?.value ?? 0;
    }

    /**
     * Update an economy setting. Server-side gated on admin_users — the acting
     * admin's Clerk id must be passed (the tokenless anon client has no JWT).
     */
    static async updateSetting(key: string, value: number, adminUserId?: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('economy_update_setting', {
                p_key: key,
                p_value: value,
                p_admin_id: adminUserId ?? null,
            });
            if (error) throw error;
            const ok = !!(data as any)?.success;
            if (ok) _settingsCache = null; // bust cache so the new value applies immediately
            return ok;
        } catch (error) {
            console.error('Error updating economy setting:', error);
            return false;
        }
    }

    /**
     * 27.8.3 — coins-as-barter: atomic buyer→seller transfer through the
     * economy_transfer_coins RPC. Server rejects self-transfer + insufficient
     * balance, respects the seller's daily coin-gain cap, logs both sides to
     * gamification_history, notifies both parties, and is idempotent per
     * (buyer, refId) so double-clicks can't double-spend.
     */
    static async transferCoins(
        fromUserId: string,
        toUserId: string,
        amount: number,
        reason: string,
        refId: string | null,
    ): Promise<{ success: boolean; error?: string; alreadyPaid?: boolean; fromBalance?: number }> {
        try {
            const { data, error } = await supabase.rpc('economy_transfer_coins', {
                p_from_user: fromUserId,
                p_to_user: toUserId,
                p_amount: amount,
                p_reason: reason,
                p_ref_id: refId,
            });
            if (error) throw error;
            const r = data as any;
            return {
                success: !!r?.success,
                error: r?.error,
                alreadyPaid: !!r?.already_paid,
                fromBalance: r?.from_balance != null ? Number(r.from_balance) : undefined,
            };
        } catch (error) {
            console.error('Error transferring coins:', error);
            return { success: false, error: 'rpc_failed' };
        }
    }

    static async getProfile(userId: string): Promise<GamificationProfile | null> {
        try {
            const { data, error } = await supabase
                .from('gamification_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // If profile doesn't exist (PGRST116), create it server-side.
                if (error.code === 'PGRST116') {
                    const { data: created, error: rpcError } = await supabase
                        .rpc('economy_ensure_profile', { p_user_id: userId });

                    if (rpcError) {
                        console.error('Error creating gamification profile:', rpcError);
                        return null;
                    }

                    const newProfile = Array.isArray(created) ? created[0] : created;

                    // Launch-period welcome badge (idempotent, non-blocking)
                    this.awardAchievement(userId, 'early_adopter').catch(() => {});

                    return (newProfile as GamificationProfile) ?? null;
                }

                console.error('Error fetching gamification profile:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Error in getProfile:', err);
            return null;
        }
    }

    static async getUserEconomyHistory(userId: string, limit = 20): Promise<any[]> {
        const { data, error } = await supabase
            .from('gamification_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching economy history:', error);
            return [];
        }
        return data || [];
    }

    /**
     * "Your week on BARA" — activity over the last 7 days for the recap card.
     */
    static async getWeeklyRecap(userId: string): Promise<{
        xp: number; coins: number; listens: number; topArtist: string | null; topGenre: string | null;
    }> {
        const empty = { xp: 0, coins: 0, listens: 0, topArtist: null, topGenre: null };
        try {
            const since = new Date();
            since.setDate(since.getDate() - 7);
            const sinceISO = since.toISOString();

            const [{ data: hist }, { data: plays }] = await Promise.all([
                supabase.from('gamification_history').select('type, amount').eq('user_id', userId).gte('created_at', sinceISO),
                supabase.from('play_history').select('song_id').eq('user_id', userId).gte('played_at', sinceISO),
            ]);

            let xp = 0, coins = 0;
            (hist || []).forEach((h: any) => {
                if (h.type === 'xp_gain') xp += Number(h.amount) || 0;
                else if (h.type === 'coin_gain' || h.type === 'coin_purchase') coins += Number(h.amount) || 0;
            });

            const listens = (plays || []).length;
            let topArtist: string | null = null, topGenre: string | null = null;
            if (listens > 0) {
                const playCount: Record<string, number> = {};
                (plays as any[]).forEach((p) => { playCount[p.song_id] = (playCount[p.song_id] || 0) + 1; });
                const ids = Object.keys(playCount);
                const { data: songs } = await supabase.from('songs').select('id, genre, artists(name)').in('id', ids);
                const genreCount: Record<string, number> = {}, artistCount: Record<string, number> = {};
                (songs || []).forEach((s: any) => {
                    const c = playCount[s.id] || 0;
                    if (s.genre) genreCount[s.genre] = (genreCount[s.genre] || 0) + c;
                    const an = s.artists?.name;
                    if (an) artistCount[an] = (artistCount[an] || 0) + c;
                });
                topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
                topArtist = Object.entries(artistCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
            }

            return { xp, coins, listens, topArtist, topGenre };
        } catch (error) {
            console.error('Error building weekly recap:', error);
            return empty;
        }
    }

    static async addXP(userId: string, amount: number, reason: string): Promise<{ levelUp: boolean; newLevel: number } | null> {
        try {
            const { data, error } = await supabase.rpc('economy_add_xp', {
                p_user_id: userId,
                p_amount: amount,
                p_reason: reason,
            });
            if (error || !data) throw error || new Error('economy_add_xp returned no data');

            const r = data as any;
            emitXPEvent(Number(r.multiplied_amount) || 0, reason);
            if (Number(r.levelup_bonus) > 0) {
                emitCoinEvent(Number(r.levelup_bonus), `Level Up to ${r.new_level}`);
            }
            return { levelUp: !!r.level_up, newLevel: Number(r.new_level) };
        } catch (error) {
            console.error('Error adding XP:', error);
            return null;
        }
    }

    /**
     * Award XP for a song listen, but only up to a daily cap (admin-tunable
     * `limit.daily_listen_xp_cap`), and grant the first-listen achievement.
     * Replaces a raw addXP so listening can't be farmed.
     */
    static async awardSongListenXP(userId: string, songTitle: string): Promise<void> {
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const { count } = await supabase
                .from('gamification_history')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .ilike('reason', 'Listened to%')
                .gte('created_at', startOfToday.toISOString());

            const dailyCap = await this.getSetting('limit.daily_listen_xp_cap');
            if ((count || 0) >= dailyCap) return; // daily cap reached

            await this.addXP(userId, await this.getSetting('xp.song_listen'), `Listened to ${songTitle}`);
            await this.awardAchievement(userId, 'first_listen'); // idempotent

            // On the first listen of the day (cheap, once/day), check the
            // 1,000-listen "Music Lover" milestone.
            if ((count || 0) === 0) {
                const { count: total } = await supabase
                    .from('play_history')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId);
                if ((total || 0) >= 1000) await this.awardAchievement(userId, 'music_lover');
            }
        } catch (error) {
            console.error('Error awarding listen XP:', error);
        }
    }

    static async checkDailyStreak(userId: string): Promise<void> {
        try {
            const profile = await this.getProfile(userId);
            if (!profile) return;

            // Reset daily missions for this user if they haven't been reset today
            await this.resetDailyMissions(userId);

            // Compare LOCAL calendar days (a "day" is the user's day, not UTC) and
            // guard a missing/invalid last_activity_at so the streak can't get stuck.
            const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const today = startOfDay(new Date());

            const last = profile.last_activity_at ? new Date(profile.last_activity_at) : null;
            const lastValid = !!last && !isNaN(last.getTime());
            const diffDays = lastValid
                ? Math.round((today - startOfDay(last as Date)) / (1000 * 60 * 60 * 24))
                : Infinity;

            // Read the current streak from either column (defensive against drift).
            const currentStreak = Number(profile.consecutive_days ?? profile.daily_streak ?? 0) || 0;

            // Monthly free Streak Shield top-up (idempotent per calendar month).
            await supabase.rpc('economy_grant_monthly_shield', { p_user_id: userId }).then(() => {}, () => {});
            // Diamond prestige perk: one free ad-free week per month (self-gated + idempotent).
            supabase.rpc('economy_grant_diamond_adfree', { p_user_id: userId }).then(() => {}, () => {});

            // Exactly one day missed (gap of 2 calendar days) → try to spend a
            // Streak Shield to preserve the streak instead of resetting it.
            let shieldUsed = false;
            if (lastValid && currentStreak >= 1 && diffDays === 2) {
                const { data: sh } = await supabase.rpc('economy_consume_shield', { p_user_id: userId });
                if ((sh as any)?.consumed) shieldUsed = true;
            }

            let newStreak = currentStreak;
            let streakChanged = false;

            if (shieldUsed) {
                // Shield absorbed the missed day — carry the streak forward.
                newStreak = currentStreak + 1;
                streakChanged = true;
            } else if (!lastValid || currentStreak < 1 || diffDays >= 2) {
                // Brand-new / broken streak → start (or restart) at day 1
                newStreak = 1;
                streakChanged = true;
            } else if (diffDays === 1) {
                // Returned on the next calendar day → streak continues
                newStreak = currentStreak + 1;
                streakChanged = true;
            }
            // diffDays <= 0 → already counted today (or clock skew): no change

            // MIT-level psychological scaling
            const multiplier = newStreak >= 30 ? 2.0 : newStreak >= 7 ? 1.5 : newStreak >= 3 ? 1.2 : 1.0;

            // Persist the computed streak server-side (client keeps the
            // timezone-correct day maths; the RPC just writes + audits).
            const { error } = await supabase.rpc('economy_apply_streak', {
                p_user_id: userId,
                p_streak: newStreak,
                p_multiplier: multiplier,
                p_changed: streakChanged,
            });
            if (error) throw error;

            if (streakChanged) {
                // Give a small daily bonus for returning (admin-tunable)
                await this.addXP(userId, await this.getSetting('xp.daily_login'), `Daily Streak: Day ${newStreak}`);

                // Award streak achievements once the user reaches the milestones
                if (newStreak >= 7) await this.awardAchievement(userId, 'streak_7');
                if (newStreak >= 30) await this.awardAchievement(userId, 'streak_30');
            }

            // Always track the daily_login mission (trackMissionProgress is idempotent once completed)
            await this.trackMissionProgress(userId, 'daily_login', 1);
        } catch (error) {
            console.error('Error checking streak:', error);
        }
    }

    static async addCoins(userId: string, amount: number, reason: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('economy_add_coins', {
                p_user_id: userId,
                p_amount: amount,
                p_reason: reason,
            });
            if (error) throw error;
            const r = data as any;
            if (!r?.success) return false;

            // Emit the actually-credited amount (may include the Gold tier bonus).
            emitCoinEvent(Number(r.credited) || amount, reason);
            return true;
        } catch (error) {
            console.error('Error adding coins:', error);
            return false;
        }
    }

    static async spendCoins(userId: string, amount: number, reason: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('economy_spend_coins', {
                p_user_id: userId,
                p_amount: amount,
                p_reason: reason,
            });
            if (error) throw error;
            // Server returns { success:false } when the balance is insufficient.
            return !!(data as any)?.success;
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
            const { data, error } = await supabase.rpc('economy_award_achievement', {
                p_user_id: userId,
                p_key: achievementKey,
            });
            if (error) throw error;

            const r = data as any;
            if (!r || !r.awarded) return false;

            // Trigger visual celebration event
            window.dispatchEvent(new CustomEvent('bara_achievement_earned', {
                detail: { title: r.title, subtitle: r.description, xp: r.xp, coins: r.coins },
            }));

            // Mirror the floating XP feedback addXP used to emit for the badge XP.
            if (r.xp_result && Number(r.xp_result.multiplied_amount) > 0) {
                emitXPEvent(Number(r.xp_result.multiplied_amount), `Achievement: ${r.title}`);
                if (Number(r.xp_result.levelup_bonus) > 0) {
                    emitCoinEvent(Number(r.xp_result.levelup_bonus), `Level Up to ${r.xp_result.new_level}`);
                }
            }
            return true;
        } catch (error) {
            console.error('Error awarding achievement:', error);
            return false;
        }
    }

    static async getMissions(userId: string): Promise<UserMission[]> {
        try {
            // Reset daily + weekly missions if they're due for a reset
            await this.resetDailyMissions(userId);
            await this.resetWeeklyMissions(userId);

            // Ensure the user has a row for every active mission (server-side).
            await supabase.rpc('economy_ensure_missions', { p_user_id: userId });

            // Fetch final combined data
            const { data: finalData, error } = await supabase
                .from('user_missions')
                .select(`
                    current_progress,
                    is_completed,
                    claimed_at,
                    missions (*)
                `)
                .eq('user_id', userId);

            if (error) throw error;

            return finalData.map(item => ({
                ...item.missions,
                current_progress: item.current_progress,
                is_completed: item.is_completed,
                claimed_at: item.claimed_at
            })) as unknown as UserMission[];
        } catch (error) {
            console.error('Error fetching missions:', error);
            return [];
        }
    }

    static async trackMissionProgress(userId: string, missionKey: string, increment: number = 1): Promise<void> {
        try {
            const { data, error } = await supabase.rpc('economy_track_mission', {
                p_user_id: userId,
                p_key: missionKey,
                p_increment: increment,
            });
            if (error) throw error;

            if ((data as any)?.completed) {
                window.dispatchEvent(new CustomEvent('bara_mission_completed', {
                    detail: { missionKey, userId }
                }));
            }
        } catch (error) {
            console.error('Error tracking mission progress:', error);
        }
    }

    static async claimMissionReward(userId: string, missionId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('economy_claim_mission', {
                p_user_id: userId,
                p_mission_id: missionId,
            });
            if (error) throw error;

            const r = data as any;
            if (!r || !r.success) return false;

            // Mirror the floating XP feedback addXP used to emit for the reward.
            if (r.xp_result && Number(r.xp_result.multiplied_amount) > 0) {
                emitXPEvent(Number(r.xp_result.multiplied_amount), `Mission: ${r.title}`);
                if (Number(r.xp_result.levelup_bonus) > 0) {
                    emitCoinEvent(Number(r.xp_result.levelup_bonus), `Level Up to ${r.xp_result.new_level}`);
                }
            }

            // Referral activation: a referred user's FIRST claimed mission
            // activates their referral (pays both parties + milestones,
            // server-side & idempotent). Non-blocking; lazy import avoids a
            // circular module load.
            import('./referralService')
                .then(({ ReferralService }) => ReferralService.activateOnFirstClaim(userId))
                .catch(() => {});

            return true;
        } catch (error) {
            console.error('Error claiming mission reward:', error);
            return false;
        }
    }

    static async resetDailyMissions(userId: string): Promise<void> {
        try {
            await supabase.rpc('reset_daily_missions_for_user', { p_user_id: userId });
        } catch (error) {
            console.error('Error resetting daily missions:', error);
        }
    }

    /**
     * Buy an extra Streak Shield for coins (cost.streak_shield). Server checks
     * the balance and increments the shield count atomically.
     */
    static async buyStreakShield(userId: string): Promise<{ success: boolean; shields?: number; cost?: number; reason?: string }> {
        try {
            const { data, error } = await supabase.rpc('economy_buy_shield', { p_user_id: userId });
            if (error) throw error;
            const r = (data as any) || {};
            return { success: !!r.success, shields: r.shields, cost: r.cost, reason: r.reason };
        } catch (error) {
            console.error('Error buying streak shield:', error);
            return { success: false };
        }
    }

    /**
     * 27.8.7 — pay last completed week's leaderboard top ranks. Fully
     * idempotent server-side (leaderboard_payouts ledger + advisory lock), so
     * it's fire-and-forget: triggered lazily on the first leaderboard read of
     * a new week, with a guarded pg_cron Monday 00:10 UTC as backstop.
     */
    static async runLeaderboardPayout(): Promise<void> {
        try {
            await supabase.rpc('economy_leaderboard_payout');
        } catch (error) {
            console.error('Error running leaderboard payout:', error);
        }
    }

    static async resetWeeklyMissions(userId: string): Promise<void> {
        try {
            await supabase.rpc('reset_weekly_missions_for_user', { p_user_id: userId });
        } catch (error) {
            console.error('Error resetting weekly missions:', error);
        }
    }

    /**
     * Admin God-Mode: Directly override user economy stats (absolute set).
     */
    static async updateUserEconomy(userId: string, updates: { bara_coins?: number }): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('economy_admin_override', {
                p_user_id: userId,
                p_bara_coins: updates.bara_coins ?? null,
            });
            if (error) throw error;
            return !!(data as any)?.success;
        } catch (error) {
            console.error('Error updating user economy:', error);
            return false;
        }
    }
}
