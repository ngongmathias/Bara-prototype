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
} from 'lucide-react';
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
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
    const [activity, setActivity] = useState<HistoryRow[]>([]);
    const [missions, setMissions] = useState<MissionStat[]>([]);

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

            // Names for leaderboard + recent activity
            const topRows = rows.slice(0, 10);
            const nameMap = await resolveNames([
                ...topRows.map((r) => r.user_id),
                ...hist.slice(0, 15).map((h) => h.user_id),
            ]);

            setStats({ totalUsers: rows.length, totalCoins, totalXP, totalSpent, totalEarned });
            setLeaderboard(
                topRows.map((r) => ({
                    ...r,
                    name: nameMap[r.user_id]?.name,
                    email: nameMap[r.user_id]?.email,
                }))
            );
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
                    {['XP rewards', 'Coin rewards', 'Coin costs', 'Limits', 'Economy'].map((group) => (
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
                        <CardTitle className="text-lg font-black font-comfortaa">Top Players</CardTitle>
                        <CardDescription>Ranked by lifetime XP.</CardDescription>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Missions overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                            <Target size={18} /> Missions
                        </CardTitle>
                        <CardDescription>Reward config and completion counts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {missions.length === 0 && !loading && (
                            <div className="text-center text-gray-400 py-8 italic text-sm">No missions configured.</div>
                        )}
                        <div className="space-y-3">
                            {missions.map((m) => (
                                <div key={m.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                                    <div>
                                        <div className="font-bold text-sm">{m.title}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">
                                            {m.type} · goal {m.goal} · +{m.xp_reward} XP / +{m.coin_reward} coins
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black">{m.completedCount.toLocaleString()}</div>
                                        <div className="text-[9px] text-gray-400 uppercase font-bold">completed</div>
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
        </div>
    );
};

export default AdminGamification;
