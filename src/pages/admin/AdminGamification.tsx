import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { GamificationService, getPrestigeTier, DEFAULT_ECONOMY_SETTINGS } from '@/lib/gamificationService';
import { useToast } from '@/hooks/use-toast';
import {
    Trophy,
    Coins,
    TrendingUp,
    Users as UsersIcon,
    Activity,
    Award,
    Search,
    Plus,
    Loader2,
    Target,
    RotateCcw,
    SlidersHorizontal,
    Save,
    BookOpen,
} from 'lucide-react';
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';

interface ProfileRow {
    user_id: string;
    total_xp: number;
    current_level: number;
    bara_coins: number;
    daily_streak: number;
    consecutive_days: number;
    name?: string;
    email?: string;
}

interface HistoryRow {
    id: string;
    user_id: string;
    type: string;
    amount: number | null;
    reason: string | null;
    created_at: string;
    name?: string;
}

interface MissionStat {
    id: string;
    key: string;
    title: string;
    type: string;
    xp_reward: number;
    coin_reward: number;
    goal: number;
    completedCount: number;
}

interface AchievementRow {
    id: string;
    key: string;
    title: string;
    description: string | null;
    xp_reward: number;
    coin_reward: number;
    earnedCount: number;
}

// Per-row reward edit buffers for the missions/achievements editors.
type RewardEdit = { xp: string; coins: string; goal?: string };

// Resolve Clerk display names for a set of user ids via the clerk_users sync table.
const resolveNames = async (userIds: string[]): Promise<Record<string, { name: string; email: string }>> => {
    const map: Record<string, { name: string; email: string }> = {};
    const unique = Array.from(new Set(userIds)).filter(Boolean);
    if (unique.length === 0) return map;
    const { data } = await supabase
        .from('clerk_users')
        .select('clerk_user_id, full_name, email')
        .in('clerk_user_id', unique);
    (data || []).forEach((u: any) => {
        map[u.clerk_user_id] = { name: u.full_name || '', email: u.email || '' };
    });
    return map;
};

const shortId = (id: string) => (id?.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id);

const AdminGamification = () => {
    const { toast } = useToast();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalCoins: 0, totalXP: 0, totalSpent: 0, totalEarned: 0 });
    const [leaderboard, setLeaderboard] = useState<ProfileRow[]>([]);
    // Top Players ranking metric (Jul 7 request: rank by XP / Coins / Streak)
    const [allProfiles, setAllProfiles] = useState<ProfileRow[]>([]);
    const [rankBy, setRankBy] = useState<'total_xp' | 'bara_coins' | 'streak'>('total_xp');
    const [activity, setActivity] = useState<HistoryRow[]>([]);
    const [missions, setMissions] = useState<MissionStat[]>([]);
    const [achievements, setAchievements] = useState<AchievementRow[]>([]);
    const [missionEdits, setMissionEdits] = useState<Record<string, RewardEdit>>({});
    const [achievementEdits, setAchievementEdits] = useState<Record<string, RewardEdit>>({});
    const [savingReward, setSavingReward] = useState<string | null>(null);
    const [dailyFlow, setDailyFlow] = useState<{ day: string; earned: number; spent: number }[]>([]);
    const [topEarners, setTopEarners] = useState<{ user_id: string; name?: string; earned: number }[]>([]);

    // Economy settings panel (admin-tunable values)
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [savedSettings, setSavedSettings] = useState<Record<string, number>>({});
    const [settingsSaving, setSettingsSaving] = useState(false);

    // God Mode user-adjust panel
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [target, setTarget] = useState<ProfileRow | null>(null);
    const [coinDelta, setCoinDelta] = useState('');
    const [xpDelta, setXpDelta] = useState('');
    const [applying, setApplying] = useState(false);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        try {
            // Aggregate profile stats + leaderboard in one read
            const { data: profiles } = await supabase
                .from('gamification_profiles')
                .select('user_id, total_xp, current_level, bara_coins, daily_streak, consecutive_days')
                .order('total_xp', { ascending: false });

            const rows = (profiles || []) as ProfileRow[];
            const totalCoins = rows.reduce((a, r) => a + (Number(r.bara_coins) || 0), 0);
            const totalXP = rows.reduce((a, r) => a + (Number(r.total_xp) || 0), 0);

            // Coin sink / source totals from the audit log
            const { data: history } = await supabase
                .from('gamification_history')
                .select('id, user_id, type, amount, reason, created_at')
                .order('created_at', { ascending: false })
                .limit(500);

            const hist = (history || []) as HistoryRow[];
            const totalSpent = hist
                .filter((h) => h.type === 'coin_spend')
                .reduce((a, h) => a + (Number(h.amount) || 0), 0);
            const totalEarned = hist
                .filter((h) => h.type === 'coin_gain' || h.type === 'coin_purchase')
                .reduce((a, h) => a + (Number(h.amount) || 0), 0);

            // Names for recent activity (the Top Players list resolves its own
            // names in the rankBy effect below, since the metric is switchable)
            const nameMap = await resolveNames(hist.slice(0, 15).map((h) => h.user_id));

            setStats({ totalUsers: rows.length, totalCoins, totalXP, totalSpent, totalEarned });
            setAllProfiles(rows);
            setActivity(
                hist.slice(0, 15).map((h) => ({ ...h, name: nameMap[h.user_id]?.name }))
            );

            // Mission completion stats
            const { data: missionRows } = await supabase
                .from('missions')
                .select('id, key, title, type, xp_reward, coin_reward, goal')
                .order('type', { ascending: true });

            const missionStats: MissionStat[] = [];
            for (const m of missionRows || []) {
                const { count } = await supabase
                    .from('user_missions')
                    .select('id', { count: 'exact', head: true })
                    .eq('mission_id', m.id)
                    .eq('is_completed', true);
                missionStats.push({ ...(m as any), completedCount: count || 0 });
            }
            setMissions(missionStats);
            setMissionEdits(Object.fromEntries(missionStats.map((m) => [
                m.id, { xp: String(m.xp_reward), coins: String(m.coin_reward), goal: String(m.goal) },
            ])));

            // Achievement rewards (editable — every earn amount is admin-tunable)
            const { data: achRows } = await supabase
                .from('achievements')
                .select('id, key, title, description, xp_reward, coin_reward')
                .order('title', { ascending: true });
            const achStats: AchievementRow[] = [];
            for (const a of achRows || []) {
                const { count } = await supabase
                    .from('user_achievements')
                    .select('id', { count: 'exact', head: true })
                    .eq('achievement_id', a.id);
                achStats.push({ ...(a as any), earnedCount: count || 0 });
            }
            setAchievements(achStats);
            setAchievementEdits(Object.fromEntries(achStats.map((a) => [
                a.id, { xp: String(a.xp_reward), coins: String(a.coin_reward) },
            ])));

            // Observability: last 14 days coin flow + 24h top earners
            const since14 = new Date();
            since14.setDate(since14.getDate() - 14);
            const { data: flowRows } = await supabase
                .from('gamification_history')
                .select('user_id, type, amount, created_at')
                .gte('created_at', since14.toISOString())
                .order('created_at', { ascending: false })
                .limit(5000);
            const rowsF = (flowRows || []) as any[];

            const dayMap = new Map<string, { earned: number; spent: number }>();
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dayMap.set(d.toLocaleDateString('en-CA'), { earned: 0, spent: 0 });
            }
            rowsF.forEach((h) => {
                const day = new Date(h.created_at).toLocaleDateString('en-CA');
                const bucket = dayMap.get(day);
                if (!bucket) return;
                const amt = Number(h.amount) || 0;
                if (h.type === 'coin_gain' || h.type === 'coin_purchase') bucket.earned += amt;
                else if (h.type === 'coin_spend') bucket.spent += amt;
            });
            setDailyFlow(Array.from(dayMap.entries()).map(([day, v]) => ({ day: day.slice(5), earned: v.earned, spent: v.spent })));

            const since24 = Date.now() - 24 * 60 * 60 * 1000;
            const earnMap = new Map<string, number>();
            rowsF.forEach((h) => {
                if (new Date(h.created_at).getTime() < since24) return;
                if (h.type === 'coin_gain' || h.type === 'coin_purchase') {
                    earnMap.set(h.user_id, (earnMap.get(h.user_id) || 0) + (Number(h.amount) || 0));
                }
            });
            const topE = Array.from(earnMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const topNames = await resolveNames(topE.map(([id]) => id));
            setTopEarners(topE.map(([id, earned]) => ({ user_id: id, name: topNames[id]?.name, earned })));
        } catch (err) {
            console.error('Error loading gamification overview:', err);
            toast({ title: 'Load error', description: 'Could not load gamification data.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const loadSettings = useCallback(async () => {
        const live = await GamificationService.getEconomySettings(true);
        const asStrings: Record<string, string> = {};
        Object.keys(DEFAULT_ECONOMY_SETTINGS).forEach((k) => {
            asStrings[k] = String(live[k] ?? DEFAULT_ECONOMY_SETTINGS[k].value);
        });
        setSettings(asStrings);
        setSavedSettings(live);
    }, []);

    useEffect(() => {
        loadOverview();
        loadSettings();
    }, [loadOverview, loadSettings]);

    // Top Players — re-rank by the selected metric (XP / Coins / Streak) and
    // resolve display names for whoever lands in the top 10.
    useEffect(() => {
        if (allProfiles.length === 0) { setLeaderboard([]); return; }
        const metric = (r: ProfileRow) =>
            rankBy === 'streak'
                ? Number(r.daily_streak ?? r.consecutive_days ?? 0) || 0
                : Number(r[rankBy]) || 0;
        const top = [...allProfiles].sort((a, b) => metric(b) - metric(a)).slice(0, 10);
        let cancelled = false;
        resolveNames(top.map((r) => r.user_id)).then((map) => {
            if (cancelled) return;
            setLeaderboard(top.map((r) => ({ ...r, name: map[r.user_id]?.name, email: map[r.user_id]?.email } as ProfileRow)));
        });
        return () => { cancelled = true; };
    }, [allProfiles, rankBy]);

    const dirtySettingKeys = Object.keys(settings).filter((k) => {
        const n = Number(settings[k]);
        return !isNaN(n) && n !== (savedSettings[k] ?? DEFAULT_ECONOMY_SETTINGS[k]?.value);
    });

    const saveSettings = async () => {
        if (dirtySettingKeys.length === 0) return;
        setSettingsSaving(true);
        try {
            let failures = 0;
            for (const key of dirtySettingKeys) {
                const value = Number(settings[key]);
                if (isNaN(value) || value < 0) { failures++; continue; }
                const ok = await GamificationService.updateSetting(key, value, user?.id);
                if (!ok) failures++;
            }
            if (failures > 0) {
                toast({
                    title: 'Some settings failed to save',
                    description: 'Writes are admin-gated server-side. Ensure your account is in admin_users and that migrations 20260705_economy_settings_drop_trust_rank.sql and 20260705_gamification_server_hardening.sql are applied.',
                    variant: 'destructive',
                });
            } else {
                toast({ title: 'Economy settings saved', description: 'New values apply immediately across the app.' });
            }
            await loadSettings();
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleSearch = async () => {
        const q = query.trim();
        if (!q) return;
        setSearching(true);
        setTarget(null);
        try {
            // Resolve a clerk user id from email/name/id
            let userId = q;
            if (!q.startsWith('user_')) {
                const { data: matches } = await supabase
                    .from('clerk_users')
                    .select('clerk_user_id, full_name, email')
                    .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
                    .limit(1);
                if (matches && matches.length > 0) {
                    userId = matches[0].clerk_user_id;
                } else {
                    toast({ title: 'No match', description: 'No user found for that email/name.', variant: 'destructive' });
                    return;
                }
            }

            const { data: profile } = await supabase
                .from('gamification_profiles')
                .select('user_id, total_xp, current_level, bara_coins, daily_streak, consecutive_days')
                .eq('user_id', userId)
                .maybeSingle();

            if (!profile) {
                toast({ title: 'No profile', description: 'This user has no gamification profile yet.', variant: 'destructive' });
                return;
            }
            const names = await resolveNames([userId]);
            setTarget({ ...(profile as ProfileRow), name: names[userId]?.name, email: names[userId]?.email });
        } catch (err) {
            console.error('Search error:', err);
            toast({ title: 'Search failed', variant: 'destructive' });
        } finally {
            setSearching(false);
        }
    };

    const refreshTarget = async (userId: string) => {
        const { data: profile } = await supabase
            .from('gamification_profiles')
            .select('user_id, total_xp, current_level, bara_coins, daily_streak, consecutive_days')
            .eq('user_id', userId)
            .maybeSingle();
        if (profile) {
            setTarget((prev) => ({ ...(profile as ProfileRow), name: prev?.name, email: prev?.email }));
        }
    };

    const applyAdjustment = async () => {
        if (!target) return;
        const coins = parseInt(coinDelta, 10);
        const xp = parseInt(xpDelta, 10);
        if ((!coins || isNaN(coins)) && (!xp || isNaN(xp))) {
            toast({ title: 'Nothing to apply', description: 'Enter a coin or XP amount.', variant: 'destructive' });
            return;
        }
        setApplying(true);
        try {
            if (coins && !isNaN(coins)) {
                if (coins >= 0) {
                    await GamificationService.addCoins(target.user_id, coins, 'Admin grant');
                } else {
                    await GamificationService.spendCoins(target.user_id, Math.abs(coins), 'Admin deduction');
                }
            }
            if (xp && !isNaN(xp)) {
                await GamificationService.addXP(target.user_id, xp, 'Admin grant');
            }
            toast({ title: 'Applied', description: `Updated ${target.name || shortId(target.user_id)}.` });
            setCoinDelta('');
            setXpDelta('');
            await refreshTarget(target.user_id);
            loadOverview();
        } catch (err) {
            console.error('Adjustment error:', err);
            toast({ title: 'Failed to apply', variant: 'destructive' });
        } finally {
            setApplying(false);
        }
    };

    const resetMissions = async () => {
        if (!target) return;
        await GamificationService.resetDailyMissions(target.user_id);
        toast({ title: 'Daily missions reset', description: target.name || shortId(target.user_id) });
    };

    // Save an edited mission's rewards/goal (admin-gated RPC; live immediately).
    const saveMissionReward = async (m: MissionStat) => {
        if (!user?.id) return;
        const edit = missionEdits[m.id];
        if (!edit) return;
        setSavingReward(m.id);
        try {
            const ok = await GamificationService.updateMission(
                user.id, m.id,
                Math.max(parseInt(edit.xp) || 0, 0),
                Math.max(parseInt(edit.coins) || 0, 0),
                Math.max(parseInt(edit.goal || '1') || 1, 1),
            );
            if (ok) {
                toast({ title: 'Mission updated', description: `"${m.title}" rewards saved — applies to the next claim.` });
                setMissions((prev) => prev.map((x) => x.id === m.id
                    ? { ...x, xp_reward: parseInt(edit.xp) || 0, coin_reward: parseInt(edit.coins) || 0, goal: Math.max(parseInt(edit.goal || '1') || 1, 1) }
                    : x));
            } else {
                toast({ title: 'Update failed', description: 'Are you signed in as an active admin?', variant: 'destructive' });
            }
        } finally {
            setSavingReward(null);
        }
    };

    const saveAchievementReward = async (a: AchievementRow) => {
        if (!user?.id) return;
        const edit = achievementEdits[a.id];
        if (!edit) return;
        setSavingReward(a.id);
        try {
            const ok = await GamificationService.updateAchievement(
                user.id, a.id,
                Math.max(parseInt(edit.xp) || 0, 0),
                Math.max(parseInt(edit.coins) || 0, 0),
            );
            if (ok) {
                toast({ title: 'Achievement updated', description: `"${a.title}" rewards saved — applies to the next unlock.` });
                setAchievements((prev) => prev.map((x) => x.id === a.id
                    ? { ...x, xp_reward: parseInt(edit.xp) || 0, coin_reward: parseInt(edit.coins) || 0 }
                    : x));
            } else {
                toast({ title: 'Update failed', description: 'Are you signed in as an active admin?', variant: 'destructive' });
            }
        } finally {
            setSavingReward(null);
        }
    };

    const missionDirty = (m: MissionStat) => {
        const e = missionEdits[m.id];
        return !!e && (parseInt(e.xp) !== m.xp_reward || parseInt(e.coins) !== m.coin_reward || parseInt(e.goal || '') !== m.goal);
    };

    const achievementDirty = (a: AchievementRow) => {
        const e = achievementEdits[a.id];
        return !!e && (parseInt(e.xp) !== a.xp_reward || parseInt(e.coins) !== a.coin_reward);
    };

    const coinData = [
        { name: 'In Wallets', value: stats.totalCoins },
        { name: 'Spent (Burned)', value: stats.totalSpent },
    ];
    const COLORS = ['#111827', '#9ca3af'];

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-black font-comfortaa">Economy & Gamification</h1>
                    <p className="text-gray-500">Live coins, XP, streaks, missions — and direct user controls.</p>
                </div>
                <Button onClick={loadOverview} variant="outline" className="font-bold border-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                    Refresh
                </Button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Total Players</CardTitle>
                        <UsersIcon className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.totalUsers.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-400 font-bold">With gamification profiles</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Coins in Circulation</CardTitle>
                        <Coins className="h-4 w-4 text-gray-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.totalCoins.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-400 font-bold">Across all wallets</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Global XP</CardTitle>
                        <Activity className="h-4 w-4 text-gray-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{(stats.totalXP / 1000).toFixed(1)}k</div>
                        <p className="text-[10px] text-gray-400 font-bold">Lifetime earned</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Coins Spent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.totalSpent.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-400 font-bold">Burned (last 500 events)</p>
                    </CardContent>
                </Card>
            </div>

            {/* God Mode — user controls */}
            <Card className="border-2 border-black">
                <CardHeader>
                    <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                        <Award size={18} /> User Controls
                    </CardTitle>
                    <CardDescription>Search a user by email, name or Clerk ID to view and adjust their economy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="email, name, or user_..."
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={searching} className="bg-black text-white font-bold">
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                        </Button>
                    </div>

                    {target && (
                        <div className="border rounded-2xl p-5 bg-gray-50 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <div className="font-black text-lg">{target.name || shortId(target.user_id)}</div>
                                    <div className="text-xs text-gray-500">{target.email || target.user_id}</div>
                                </div>
                                <div className="flex gap-6 text-center">
                                    <div>
                                        <div className="text-xl font-black">{Number(target.bara_coins).toLocaleString()}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Coins</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-black">{Number(target.total_xp).toLocaleString()}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">XP</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-black">{target.current_level}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">
                                            {getPrestigeTier(target.current_level)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-black">{target.daily_streak ?? target.consecutive_days ?? 0}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Streak</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-end gap-3 pt-2 border-t">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Coins (+/-)</label>
                                    <Input
                                        type="number"
                                        value={coinDelta}
                                        onChange={(e) => setCoinDelta(e.target.value)}
                                        placeholder="e.g. 100 or -50"
                                        className="w-36"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">XP (+)</label>
                                    <Input
                                        type="number"
                                        value={xpDelta}
                                        onChange={(e) => setXpDelta(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="w-36"
                                    />
                                </div>
                                <Button onClick={applyAdjustment} disabled={applying} className="bg-black text-white font-bold">
                                    {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-1" />}
                                    Apply
                                </Button>
                                <Button onClick={resetMissions} variant="outline" className="font-bold border-2">
                                    <RotateCcw className="h-4 w-4 mr-1" /> Reset daily missions
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                Negative coin values deduct (won't go below 0). Adjustments are written to the gamification history log.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Economy Settings — every number in the economy, editable live */}
            <Card className="border-2 border-black">
                <CardHeader>
                    <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                        <SlidersHorizontal size={18} /> Economy Settings
                    </CardTitle>
                    <CardDescription>
                        Change how much every action earns, what perks cost, daily caps, and the coin's reference worth.
                        Values apply across the app within minutes (no deploy needed).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {['XP rewards', 'Coin rewards', 'Coin costs', 'Theme prices', 'Leaderboard prizes', 'Referrals', 'Streaks', 'Limits', 'Economy', 'Perks'].map((group) => (
                        <div key={group}>
                            <div className="text-[11px] uppercase font-black text-gray-400 tracking-wider mb-2">{group}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {Object.entries(DEFAULT_ECONOMY_SETTINGS)
                                    .filter(([, def]) => def.group === group)
                                    .map(([key, def]) => (
                                        <div key={key} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm truncate">{def.label}</div>
                                                <div className="text-[10px] text-gray-400 font-mono truncate">{key}</div>
                                            </div>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="any"
                                                value={settings[key] ?? ''}
                                                onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                                                className="w-24 text-right font-bold"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t">
                        <p className="text-[11px] text-gray-400 max-w-xl">
                            "Coin worth" is the reference anchor: {settings['economy.coins_per_usd'] || 100} coins ≈ $1
                            (1 coin ≈ ${(1 / (Number(settings['economy.coins_per_usd']) || 100)).toFixed(3)}).
                            It doesn't move money — it's the pricing yardstick for perks and future coin packs.
                            One-off bonus grants for a specific user are in User Controls above.
                        </p>
                        <Button
                            onClick={saveSettings}
                            disabled={settingsSaving || dirtySettingKeys.length === 0}
                            className="bg-black text-white font-bold"
                        >
                            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save {dirtySettingKeys.length > 0 ? `(${dirtySettingKeys.length})` : ''}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coin Distribution */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa">Coin Distribution</CardTitle>
                        <CardDescription>Circulation vs spent</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={coinData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {coinData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-900 rounded-sm" /> In Wallets</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-sm" /> Spent</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Real Leaderboard */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-lg font-black font-comfortaa">Top Players</CardTitle>
                                <CardDescription>
                                    Ranked by {rankBy === 'total_xp' ? 'lifetime XP' : rankBy === 'bara_coins' ? 'coin balance' : 'daily streak'}.
                                </CardDescription>
                            </div>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                {([
                                    { key: 'total_xp', label: 'XP' },
                                    { key: 'bara_coins', label: 'Coins' },
                                    { key: 'streak', label: 'Streak' },
                                ] as const).map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setRankBy(opt.key)}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                                            rankBy === opt.key ? 'bg-black text-white' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length === 0 && !loading && (
                            <div className="text-center text-gray-400 py-8 italic text-sm">No players yet.</div>
                        )}
                        <div className="space-y-3">
                            {leaderboard.map((u, i) => (
                                <div key={u.user_id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold">{u.name || shortId(u.user_id)}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase">
                                                Level {u.current_level} · {getPrestigeTier(u.current_level)} · {(u.daily_streak ?? u.consecutive_days ?? 0)}d streak
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="text-right">
                                            <div className="font-black text-sm">{Number(u.total_xp).toLocaleString()}</div>
                                            <div className="text-[9px] text-gray-400 uppercase font-bold">XP</div>
                                        </div>
                                        <div className="text-right flex items-center gap-1">
                                            <Coins size={14} className="text-gray-500" />
                                            <span className="font-black">{Number(u.bara_coins).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Economy health: daily earned vs spent + 24h top earners */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa">Coins earned vs spent</CardTitle>
                        <CardDescription>Daily flow over the last 14 days (economy health).</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="earned" name="Earned" fill="#111827" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="spent" name="Spent" fill="#9ca3af" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                            <TrendingUp size={18} /> Top earners (24h)
                        </CardTitle>
                        <CardDescription>Most coins earned in the last day — watch for anomalies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topEarners.length === 0 && !loading && (
                            <div className="text-center text-gray-400 py-8 italic text-sm">No coin activity in the last 24h.</div>
                        )}
                        <div className="space-y-2">
                            {topEarners.map((e, i) => (
                                <div key={e.user_id} className="flex items-center justify-between p-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-bold truncate">{e.name || shortId(e.user_id)}</span>
                                    </div>
                                    <span className="font-black text-sm flex items-center gap-1 shrink-0">
                                        <Coins size={12} className="text-gray-500" />{e.earned.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Missions overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                            <Target size={18} /> Missions
                        </CardTitle>
                        <CardDescription>Every mission's XP, coins and goal is editable — changes apply to the next claim.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {missions.length === 0 && !loading && (
                            <div className="text-center text-gray-400 py-8 italic text-sm">No missions configured.</div>
                        )}
                        <div className="space-y-3">
                            {missions.map((m) => (
                                <div key={m.id} className="p-3 border border-gray-100 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="font-bold text-sm truncate">{m.title}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">{m.type}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-black">{m.completedCount.toLocaleString()}</div>
                                            <div className="text-[9px] text-gray-400 uppercase font-bold">completed</div>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 flex-wrap">
                                        <div>
                                            <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">XP</label>
                                            <Input
                                                type="number" min={0}
                                                className="w-20 h-8 text-right font-bold text-sm"
                                                value={missionEdits[m.id]?.xp ?? ''}
                                                onChange={(e) => setMissionEdits((prev) => ({ ...prev, [m.id]: { ...prev[m.id], xp: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Coins</label>
                                            <Input
                                                type="number" min={0}
                                                className="w-20 h-8 text-right font-bold text-sm"
                                                value={missionEdits[m.id]?.coins ?? ''}
                                                onChange={(e) => setMissionEdits((prev) => ({ ...prev, [m.id]: { ...prev[m.id], coins: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Goal</label>
                                            <Input
                                                type="number" min={1}
                                                className="w-16 h-8 text-right font-bold text-sm"
                                                value={missionEdits[m.id]?.goal ?? ''}
                                                onChange={(e) => setMissionEdits((prev) => ({ ...prev, [m.id]: { ...prev[m.id], goal: e.target.value } }))}
                                            />
                                        </div>
                                        {missionDirty(m) && (
                                            <Button
                                                size="sm"
                                                onClick={() => saveMissionReward(m)}
                                                disabled={savingReward === m.id}
                                                className="bg-black text-white font-bold h-8"
                                            >
                                                {savingReward === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa">Recent Activity</CardTitle>
                        <CardDescription>Latest coin / XP events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activity.length === 0 && !loading && (
                            <div className="text-center text-gray-400 py-8 italic text-sm">No activity yet.</div>
                        )}
                        <div className="space-y-2">
                            {activity.map((h) => (
                                <div key={h.id} className="flex items-center justify-between p-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Award size={14} className="text-gray-400 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold truncate">{h.reason || h.type}</div>
                                            <div className="text-[10px] text-gray-400 truncate">
                                                {h.name || shortId(h.user_id)} · {new Date(h.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    {h.amount != null && (
                                        <span className={`font-black text-sm shrink-0 ${h.type === 'coin_spend' ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {h.type === 'coin_spend' ? '-' : '+'}{Number(h.amount).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Achievement rewards — editable (every earn amount is admin-tunable) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                        <Award size={18} /> Achievement rewards
                    </CardTitle>
                    <CardDescription>
                        One-off badge bonuses. Every achievement's XP and coin payout is editable — changes apply to the next unlock (already-earned badges are not re-paid).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {achievements.length === 0 && !loading && (
                        <div className="text-center text-gray-400 py-8 italic text-sm">No achievements configured.</div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {achievements.map((a) => (
                            <div key={a.id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm truncate">{a.title}</div>
                                    <div className="text-[10px] text-gray-400 truncate">
                                        <span className="font-mono">{a.key}</span> · earned {a.earnedCount.toLocaleString()}×
                                    </div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <div>
                                        <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">XP</label>
                                        <Input
                                            type="number" min={0}
                                            className="w-20 h-8 text-right font-bold text-sm"
                                            value={achievementEdits[a.id]?.xp ?? ''}
                                            onChange={(e) => setAchievementEdits((prev) => ({ ...prev, [a.id]: { ...prev[a.id], xp: e.target.value } }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Coins</label>
                                        <Input
                                            type="number" min={0}
                                            className="w-20 h-8 text-right font-bold text-sm"
                                            value={achievementEdits[a.id]?.coins ?? ''}
                                            onChange={(e) => setAchievementEdits((prev) => ({ ...prev, [a.id]: { ...prev[a.id], coins: e.target.value } }))}
                                        />
                                    </div>
                                    {achievementDirty(a) && (
                                        <Button
                                            size="sm"
                                            onClick={() => saveAchievementReward(a)}
                                            disabled={savingReward === a.id}
                                            className="bg-black text-white font-bold h-8"
                                        >
                                            {savingReward === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 27.8.6 — How the economy works (admin explainer) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                        <BookOpen size={18} /> How the economy works
                    </CardTitle>
                    <CardDescription>
                        The whole system in plain language — what feeds coins in, what takes them out, and where each lever is tuned.
                        Every amount below is a key in the Economy Settings panel above; change it there and the app follows within minutes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-gray-700 leading-relaxed">
                    <div>
                        <div className="font-black text-gray-900 mb-1">The two currencies</div>
                        <p>
                            <span className="font-bold">XP</span> is status: it only goes up, it sets a user's Level, and Levels unlock
                            Prestige tiers (Explorer → Bronze → Silver → Gold → Diamond) with perks like free themes, double daily spins,
                            a coin bonus (<span className="font-mono text-xs">perk.gold_coin_bonus_pct</span>) and monthly ad-free weeks.
                            <span className="font-bold"> Bara Coins</span> are spendable: earned and burned. Coins have no cash value and
                            can't be withdrawn — <span className="font-mono text-xs">economy.coins_per_usd</span> is only a pricing
                            yardstick for deciding what perks should cost.
                        </p>
                    </div>
                    <div>
                        <div className="font-black text-gray-900 mb-1">Faucets (where coins &amp; XP come from) — all tunable on this page</div>
                        <p>
                            Creating an account grants <span className="font-mono text-xs">coins.starting_balance</span> coins and{' '}
                            <span className="font-mono text-xs">xp.signup</span> XP. After that: every XP action is an{' '}
                            <span className="font-mono text-xs">xp.*</span> key above, level-ups pay
                            (<span className="font-mono text-xs">coins.levelup_per_level</span> × new level), daily &amp; weekly mission
                            rewards are edited per mission in the Missions card, achievement bonuses (incl. Ambassador) per badge in the
                            Achievement rewards card, blog publishing pays
                            (<span className="font-mono text-xs">coins.blog_published</span>), referrals pay
                            (<span className="font-mono text-xs">referral.friend_coins</span> / <span className="font-mono text-xs">referral.referrer_coins</span>{' '}
                            plus the three <span className="font-mono text-xs">referral.milestone*_coins</span> bonuses), and weekly
                            leaderboard prizes (<span className="font-mono text-xs">leaderboard.rank1_coins</span> …{' '}
                            <span className="font-mono text-xs">leaderboard.rank4to10_coins</span>, paid once per completed week).
                            The daily spin's prize table (5–100 coins/XP) is the one faucet that stays fixed for now — by team decision.
                        </p>
                    </div>
                    <div>
                        <div className="font-black text-gray-900 mb-1">Sinks (where coins go)</div>
                        <p>
                            Ad-free browsing (<span className="font-mono text-xs">cost.ad_free_24h</span>), marketplace ad boosts
                            (<span className="font-mono text-xs">cost.listing_boost</span>), track boosts
                            (<span className="font-mono text-xs">cost.track_boost</span>), Streak Shields
                            (<span className="font-mono text-xs">cost.streak_shield</span> — forgives one missed day so the streak
                            survives), and profile themes (<span className="font-mono text-xs">cost.theme_*</span>, one per theme) —
                            every sink price is a <span className="font-mono text-xs">cost.*</span> key above.
                            Coin-barter marketplace purchases are a <span className="font-bold">transfer</span>, not a sink:
                            the buyer's coins move to the seller (the seller sets that price per ad), so total circulation is unchanged.
                        </p>
                    </div>
                    <div>
                        <div className="font-black text-gray-900 mb-1">Streaks &amp; multipliers</div>
                        <p>
                            Opening the app on consecutive days builds a streak that multiplies XP at the 3 / 7 / 30-day marks
                            (<span className="font-mono text-xs">streak.multiplier_3day/7day/30day</span> above).
                            Streaks only multiply XP (status), never coins — so they can't inflate the coin supply.
                        </p>
                    </div>
                    <div>
                        <div className="font-black text-gray-900 mb-1">Caps &amp; anti-abuse</div>
                        <p>
                            Per-day ceilings stop grinding and bot loops: <span className="font-mono text-xs">limit.daily_listen_xp_cap</span>{' '}
                            (songs per day that earn XP), <span className="font-mono text-xs">limit.daily_xp_cap</span> and{' '}
                            <span className="font-mono text-xs">limit.daily_coin_gain_cap</span> (hard daily earn ceilings, enforced inside
                            the server RPCs). Watch the "Top earners (24h)" panel above for anomalies.
                        </p>
                    </div>
                    <div>
                        <div className="font-black text-gray-900 mb-1">Why nothing here can be faked</div>
                        <p>
                            Every write goes through SECURITY DEFINER RPCs (<span className="font-mono text-xs">economy_add_coins</span>,{' '}
                            <span className="font-mono text-xs">economy_spend_coins</span>, <span className="font-mono text-xs">economy_transfer_coins</span>, …)
                            that enforce caps and log to <span className="font-mono text-xs">gamification_history</span>. The client can only
                            read balances, never write them. One-off grants for a specific user are in User Controls above — they're logged too.
                        </p>
                    </div>
                    <p className="text-xs text-gray-400">
                        Users see the same story in plain language at <span className="font-mono">/coins-and-xp</span> — that page reads the
                        live setting values, so tuning here updates it automatically.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminGamification;
