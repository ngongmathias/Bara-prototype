import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { GamificationService } from '@/lib/gamificationService';
import { useToast } from '@/hooks/use-toast';
import {
    Trophy,
    Coins,
    TrendingUp,
    Users as UsersIcon,
    Activity,
    Award,
    ShieldAlert,
    Search,
    Send,
    Loader2,
    Target,
    CheckCircle,
    XCircle,
    RefreshCw,
    Shield,
    Rocket,
    Eye,
    Trash2,
    Plus,
    Phone,
    Building2,
    Mail,
    Star,
    Zap,
    Clock
} from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from 'recharts';

const AdminGamification = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Overview stats
    const [stats, setStats] = useState({ totalUsers: 0, totalCoins: 0, totalXP: 0, totalSpent: 0 });

    // User profiles list
    const [profiles, setProfiles] = useState<any[]>([]);
    const [profileSearch, setProfileSearch] = useState('');

    // God Mode
    const [grantUserId, setGrantUserId] = useState('');
    const [grantAmount, setGrantAmount] = useState('');
    const [grantReason, setGrantReason] = useState('Admin grant');
    const [granting, setGranting] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Edit Balance
    const [editingProfile, setEditingProfile] = useState<any>(null);
    const [editCoins, setEditCoins] = useState(0);
    const [editXP, setEditXP] = useState(0);
    const [editLevel, setEditLevel] = useState(1);
    const [editStreak, setEditStreak] = useState(0);
    const [saving, setSaving] = useState(false);

    // Missions
    const [missions, setMissions] = useState<any[]>([]);
    const [newMission, setNewMission] = useState({ key: '', title: '', description: '', goal: 1, xp_reward: 0, coin_reward: 0, type: 'daily', category: 'general' });

    // Achievements
    const [achievements, setAchievements] = useState<any[]>([]);
    const [newAchievement, setNewAchievement] = useState({ key: '', title: '', description: '', xp_reward: 0, coin_reward: 0, category: 'general' });

    // Verifications
    const [verifications, setVerifications] = useState<any[]>([]);

    // History
    const [history, setHistory] = useState<any[]>([]);

    // ============ DATA FETCHING ============
    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchProfiles(), fetchMissions(), fetchAchievements(), fetchVerifications(), fetchHistory()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        const { data } = await supabase.from('gamification_profiles').select('bara_coins, total_xp');
        if (data) {
            const totalCoins = data.reduce((a, c) => a + (c.bara_coins || 0), 0);
            const totalXP = data.reduce((a, c) => a + (c.total_xp || 0), 0);
            setStats({ totalUsers: data.length, totalCoins, totalXP, totalSpent: 0 });
        }
        // Get spent coins from history
        const { data: spentData } = await supabase.from('gamification_history').select('amount').eq('type', 'coin_spend');
        if (spentData) {
            setStats(prev => ({ ...prev, totalSpent: spentData.reduce((a, c) => a + (c.amount || 0), 0) }));
        }
    };

    const fetchProfiles = async () => {
        const { data } = await supabase.from('gamification_profiles').select('*').order('bara_coins', { ascending: false }).limit(100);
        if (data) {
            // Enrich with user names
            const userIds = data.map(p => p.user_id);
            const { data: users } = await supabase.from('clerk_users').select('id, full_name, email').in('id', userIds);
            const userMap: Record<string, any> = {};
            users?.forEach(u => userMap[u.id] = u);
            setProfiles(data.map(p => ({ ...p, user_name: userMap[p.user_id]?.full_name || 'Unknown', user_email: userMap[p.user_id]?.email || '' })));
        }
    };

    const fetchMissions = async () => {
        const { data } = await supabase.from('missions').select('*').order('created_at', { ascending: false });
        setMissions(data || []);
    };

    const fetchAchievements = async () => {
        const { data } = await supabase.from('achievements').select('*').order('xp_reward', { ascending: false });
        setAchievements(data || []);
    };

    const fetchVerifications = async () => {
        const { data } = await supabase.from('user_verifications').select('*').order('created_at', { ascending: false }).limit(100);
        if (data) {
            const userIds = data.map(v => v.user_id);
            const { data: users } = await supabase.from('clerk_users').select('id, full_name, email').in('id', userIds);
            const userMap: Record<string, any> = {};
            users?.forEach(u => userMap[u.id] = u);
            setVerifications(data.map(v => ({ ...v, user_name: userMap[v.user_id]?.full_name || 'Unknown', user_email: userMap[v.user_id]?.email || '' })));
        }
    };

    const fetchHistory = async () => {
        const { data } = await supabase.from('gamification_history').select('*').order('created_at', { ascending: false }).limit(50);
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(h => h.user_id))];
            const { data: users } = await supabase.from('clerk_users').select('id, full_name, email').in('id', userIds);
            const userMap: Record<string, any> = {};
            users?.forEach(u => userMap[u.id] = u);
            setHistory(data.map(h => ({ ...h, user_name: userMap[h.user_id]?.full_name || '', user_email: userMap[h.user_id]?.email || '' })));
        } else {
            setHistory([]);
        }
    };

    // ============ ACTIONS ============
    const handleSearchUsers = async () => {
        if (!userSearch.trim()) return;
        setSearching(true);
        const { data } = await supabase.from('clerk_users').select('id, full_name, email')
            .or(`full_name.ilike.%${userSearch}%,email.ilike.%${userSearch}%`).limit(10);
        setSearchResults(data || []);
        setSearching(false);
    };

    const handleGrantCoins = async () => {
        if (!grantUserId || !grantAmount || Number(grantAmount) <= 0) {
            toast({ title: 'Invalid input', description: 'Select a user and enter a valid amount.', variant: 'destructive' });
            return;
        }
        setGranting(true);
        const success = await GamificationService.addCoins(grantUserId, Number(grantAmount), grantReason);
        if (success) {
            toast({ title: 'Coins Granted!', description: `${grantAmount} coins sent successfully.` });
            setGrantAmount('');
            fetchStats();
            fetchProfiles();
        } else {
            toast({ title: 'Failed', description: 'Could not grant coins.', variant: 'destructive' });
        }
        setGranting(false);
    };

    const handleAddXP = async (userId: string, amount: number) => {
        await GamificationService.addXP(userId, amount, 'Admin XP boost');
        toast({ title: 'XP Added', description: `${amount} XP granted.` });
        fetchProfiles();
    };

    const openEditBalance = (profile: any) => {
        setEditingProfile(profile);
        setEditCoins(profile.bara_coins || 0);
        setEditXP(profile.total_xp || 0);
        setEditLevel(profile.current_level || 1);
        setEditStreak(profile.daily_streak || 0);
    };

    const handleSetBalance = async () => {
        if (!editingProfile) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('gamification_profiles')
                .update({
                    bara_coins: editCoins,
                    total_xp: editXP,
                    current_level: editLevel,
                    daily_streak: editStreak,
                    consecutive_days: editStreak,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', editingProfile.user_id);
            if (error) throw error;

            await supabase.from('gamification_history').insert({
                user_id: editingProfile.user_id,
                type: 'admin_adjustment',
                amount: editCoins - (editingProfile.bara_coins || 0),
                reason: `Admin set balance: ${editCoins} coins, ${editXP} XP, Lv.${editLevel}`
            });

            toast({ title: 'Balance Updated', description: `${editingProfile.user_name}'s profile updated.` });
            setEditingProfile(null);
            fetchStats();
            fetchProfiles();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to update balance.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateMission = async () => {
        if (!newMission.key || !newMission.title) {
            toast({ title: 'Missing fields', description: 'Key and title are required.', variant: 'destructive' });
            return;
        }
        const { error } = await supabase.from('missions').insert(newMission);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Mission Created!' });
            setNewMission({ key: '', title: '', description: '', goal: 1, xp_reward: 0, coin_reward: 0, type: 'daily', category: 'general' });
            fetchMissions();
        }
    };

    const handleDeleteMission = async (id: string) => {
        await supabase.from('user_missions').delete().eq('mission_id', id);
        await supabase.from('missions').delete().eq('id', id);
        toast({ title: 'Mission Deleted' });
        fetchMissions();
    };

    const handleCreateAchievement = async () => {
        if (!newAchievement.key || !newAchievement.title) {
            toast({ title: 'Missing fields', description: 'Key and title are required.', variant: 'destructive' });
            return;
        }
        const { error } = await supabase.from('achievements').insert(newAchievement);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Achievement Created!' });
            setNewAchievement({ key: '', title: '', description: '', xp_reward: 0, coin_reward: 0, category: 'general' });
            fetchAchievements();
        }
    };

    const handleToggleVerification = async (id: string, currentStatus: boolean) => {
        await supabase.from('user_verifications').update({ is_verified: !currentStatus, verified_at: !currentStatus ? new Date().toISOString() : null }).eq('id', id);
        toast({ title: !currentStatus ? 'Verified!' : 'Unverified' });
        fetchVerifications();
    };

    const filteredProfiles = profiles.filter(p =>
        !profileSearch || p.user_name?.toLowerCase().includes(profileSearch.toLowerCase()) || p.user_email?.toLowerCase().includes(profileSearch.toLowerCase()) || p.user_id?.includes(profileSearch)
    );

    const coinData = [
        { name: 'In Circulation', value: stats.totalCoins },
        { name: 'Spent (Burned)', value: stats.totalSpent }
    ];
    const COLORS = ['#3b82f6', '#10b981'];

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black font-comfortaa">Gamification Command Center</h1>
                    <p className="text-gray-500 text-sm">Manage coins, XP, missions, achievements, verifications, and boosts.</p>
                </div>
                <Button onClick={fetchAll} variant="outline" className="font-bold" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Players', value: stats.totalUsers, icon: UsersIcon, color: 'text-gray-500' },
                    { label: 'Coins in Wallets', value: stats.totalCoins.toLocaleString(), icon: Coins, color: 'text-yellow-500' },
                    { label: 'Global XP', value: `${(stats.totalXP / 1000).toFixed(1)}k`, icon: Activity, color: 'text-blue-500' },
                    { label: 'Coins Spent', value: stats.totalSpent.toLocaleString(), icon: TrendingUp, color: 'text-green-500' },
                ].map((s, i) => (
                    <Card key={i} className="bg-white border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-gray-400">{s.label}</CardTitle>
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                        </CardHeader>
                        <CardContent><div className="text-xl font-black">{s.value}</div></CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border w-full flex flex-wrap h-auto gap-1 p-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: Eye },
                        { id: 'users', label: 'User Wallets', icon: Coins },
                        { id: 'grant', label: 'Grant Coins', icon: Send },
                        { id: 'missions', label: 'Missions', icon: Target },
                        { id: 'achievements', label: 'Achievements', icon: Award },
                        { id: 'verifications', label: 'Verifications', icon: Shield },
                        { id: 'history', label: 'History', icon: Clock },
                    ].map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs font-bold">
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ===== OVERVIEW TAB ===== */}
                <TabsContent value="overview" className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-black">Coin Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={coinData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                            {coinData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 text-xs font-bold">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> In Wallets</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm" /> Spent</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-sm font-black">Top Earners</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {profiles.slice(0, 5).map((p, i) => (
                                        <div key={p.user_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center font-black text-xs">#{i + 1}</div>
                                                <div>
                                                    <div className="font-bold text-sm">{p.user_name}</div>
                                                    <div className="text-[10px] text-gray-400">Lv.{p.current_level} | {p.total_xp} XP</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 font-black text-sm">
                                                <Coins className="w-3.5 h-3.5 text-yellow-600" /> {p.bara_coins}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm font-black">Quick Stats</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-4 bg-purple-50 rounded-xl">
                                    <div className="text-2xl font-black text-purple-700">{missions.length}</div>
                                    <div className="text-xs font-bold text-purple-500">Active Missions</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <div className="text-2xl font-black text-blue-700">{achievements.length}</div>
                                    <div className="text-xs font-bold text-blue-500">Achievements</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <div className="text-2xl font-black text-green-700">{verifications.filter(v => v.is_verified).length}</div>
                                    <div className="text-xs font-bold text-green-500">Verified Users</div>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-xl">
                                    <div className="text-2xl font-black text-orange-700">{history.length}</div>
                                    <div className="text-xs font-bold text-orange-500">Recent Transactions</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ===== USER WALLETS TAB ===== */}
                <TabsContent value="users" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black">All User Wallets</CardTitle>
                                <div className="flex gap-2">
                                    <Input placeholder="Search users..." value={profileSearch} onChange={e => setProfileSearch(e.target.value)} className="w-64 h-8 text-sm" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-black">User</TableHead>
                                            <TableHead className="text-xs font-black">Level</TableHead>
                                            <TableHead className="text-xs font-black">Coins</TableHead>
                                            <TableHead className="text-xs font-black">XP</TableHead>
                                            <TableHead className="text-xs font-black">Streak</TableHead>
                                            <TableHead className="text-xs font-black">Trust</TableHead>
                                            <TableHead className="text-xs font-black">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProfiles.map(p => (
                                            <TableRow key={p.user_id}>
                                                <TableCell>
                                                    <div className="font-bold text-sm">{p.user_name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">{p.user_id.slice(0, 20)}...</div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="font-bold">Lv.{p.current_level}</Badge></TableCell>
                                                <TableCell className="font-bold">{(p.bara_coins || 0).toLocaleString()}</TableCell>
                                                <TableCell>{(p.total_xp || 0).toLocaleString()}</TableCell>
                                                <TableCell>{p.daily_streak || 0} days</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-xs ${(p.trust_rank || 1) >= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                        {Number(p.trust_rank || 1).toFixed(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => openEditBalance(p)}>
                                                            <Star className="w-3 h-3 mr-1" /> Edit
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => { setGrantUserId(p.user_id); setActiveTab('grant'); }}>
                                                            <Coins className="w-3 h-3 mr-1" /> Give
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => handleAddXP(p.user_id, 100)}>
                                                            <Zap className="w-3 h-3 mr-1" /> +100 XP
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {filteredProfiles.length === 0 && <p className="text-center text-gray-400 py-8">No profiles found. Users get profiles automatically on first visit.</p>}
                        </CardContent>
                    </Card>

                    {/* Edit Balance Dialog */}
                    {editingProfile && (
                        <Card className="border-2 border-blue-300 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-black flex items-center gap-2">
                                    <Star className="w-4 h-4 text-blue-600" /> Edit Balance: {editingProfile.user_name}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs">{editingProfile.user_id}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label className="text-xs font-bold">Bara Coins</Label>
                                        <Input type="number" value={editCoins} onChange={e => setEditCoins(Number(e.target.value))} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold">Total XP</Label>
                                        <Input type="number" value={editXP} onChange={e => setEditXP(Number(e.target.value))} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold">Level</Label>
                                        <Input type="number" value={editLevel} onChange={e => setEditLevel(Number(e.target.value))} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold">Daily Streak</Label>
                                        <Input type="number" value={editStreak} onChange={e => setEditStreak(Number(e.target.value))} className="mt-1" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSetBalance} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Save Changes</>}
                                    </Button>
                                    <Button onClick={() => setEditingProfile(null)} variant="outline">Cancel</Button>
                                    <Button onClick={() => { setEditCoins(50); setEditXP(0); setEditLevel(1); setEditStreak(0); }} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                        Reset to Default
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ===== GRANT COINS TAB ===== */}
                <TabsContent value="grant" className="mt-4">
                    <Card className="border-2 border-yellow-300 bg-yellow-50/30">
                        <CardHeader>
                            <CardTitle className="text-lg font-black font-comfortaa flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-yellow-600" /> God Mode: Grant Coins
                            </CardTitle>
                            <CardDescription>Directly add Bara Coins to any user's wallet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500">Find User</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchUsers()} />
                                    <Button onClick={handleSearchUsers} variant="outline" disabled={searching}>
                                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto bg-white">
                                        {searchResults.map(u => (
                                            <button key={u.id} onClick={() => { setGrantUserId(u.id); setSearchResults([]); setUserSearch(u.full_name || u.email); }}
                                                className={`w-full text-left px-3 py-2 hover:bg-yellow-50 text-sm ${grantUserId === u.id ? 'bg-yellow-100' : ''}`}>
                                                <span className="font-bold">{u.full_name || 'Unknown'}</span>
                                                <span className="text-gray-400 ml-2 text-xs">{u.email}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500">User ID (Clerk)</Label>
                                <Input placeholder="user_xxxxx" value={grantUserId} onChange={e => setGrantUserId(e.target.value)} className="mt-1 font-mono text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-bold uppercase text-gray-500">Coins to Grant</Label>
                                    <Input type="number" placeholder="100" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold uppercase text-gray-500">Reason</Label>
                                    <Input placeholder="Admin grant" value={grantReason} onChange={e => setGrantReason(e.target.value)} className="mt-1" />
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {[50, 100, 250, 500, 1000, 5000].map(amt => (
                                    <Button key={amt} variant="outline" size="sm" onClick={() => setGrantAmount(String(amt))}
                                        className={`text-xs font-bold ${grantAmount === String(amt) ? 'bg-yellow-100 border-yellow-400' : ''}`}>
                                        {amt} coins
                                    </Button>
                                ))}
                            </div>
                            <Button onClick={handleGrantCoins} disabled={granting || !grantUserId || !grantAmount}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-5">
                                {granting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Granting...</> : <><Send className="w-4 h-4 mr-2" /> Grant {grantAmount || '0'} Coins</>}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ===== MISSIONS TAB ===== */}
                <TabsContent value="missions" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black flex items-center gap-2"><Target className="w-4 h-4" /> Create New Mission</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Key (unique)</Label>
                                    <Input placeholder="daily_review" value={newMission.key} onChange={e => setNewMission({ ...newMission, key: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Title</Label>
                                    <Input placeholder="Write a Review" value={newMission.title} onChange={e => setNewMission({ ...newMission, title: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Goal</Label>
                                    <Input type="number" value={newMission.goal} onChange={e => setNewMission({ ...newMission, goal: Number(e.target.value) })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Type</Label>
                                    <select value={newMission.type} onChange={e => setNewMission({ ...newMission, type: e.target.value })}
                                        className="mt-1 w-full h-9 rounded-md border px-3 text-sm">
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="achievement">Achievement</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Description</Label>
                                    <Input placeholder="Complete this task..." value={newMission.description} onChange={e => setNewMission({ ...newMission, description: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">XP Reward</Label>
                                    <Input type="number" value={newMission.xp_reward} onChange={e => setNewMission({ ...newMission, xp_reward: Number(e.target.value) })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Coin Reward</Label>
                                    <Input type="number" value={newMission.coin_reward} onChange={e => setNewMission({ ...newMission, coin_reward: Number(e.target.value) })} className="mt-1" />
                                </div>
                            </div>
                            <Button onClick={handleCreateMission} className="bg-black text-white font-bold"><Plus className="w-4 h-4 mr-2" /> Create Mission</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm font-black">Active Missions ({missions.length})</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-black">Key</TableHead>
                                        <TableHead className="text-xs font-black">Title</TableHead>
                                        <TableHead className="text-xs font-black">Type</TableHead>
                                        <TableHead className="text-xs font-black">Goal</TableHead>
                                        <TableHead className="text-xs font-black">XP</TableHead>
                                        <TableHead className="text-xs font-black">Coins</TableHead>
                                        <TableHead className="text-xs font-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {missions.map(m => (
                                        <TableRow key={m.id}>
                                            <TableCell className="font-mono text-xs">{m.key}</TableCell>
                                            <TableCell className="font-bold text-sm">{m.title}</TableCell>
                                            <TableCell><Badge variant="outline" className="text-xs">{m.type}</Badge></TableCell>
                                            <TableCell>{m.goal}</TableCell>
                                            <TableCell>{m.xp_reward}</TableCell>
                                            <TableCell>{m.coin_reward}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" className="text-red-500 h-7" onClick={() => handleDeleteMission(m.id)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {missions.length === 0 && <p className="text-center text-gray-400 py-6">No missions yet. Create one above.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ===== ACHIEVEMENTS TAB ===== */}
                <TabsContent value="achievements" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black flex items-center gap-2"><Award className="w-4 h-4" /> Create New Achievement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Key (unique)</Label>
                                    <Input placeholder="first_purchase" value={newAchievement.key} onChange={e => setNewAchievement({ ...newAchievement, key: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Title</Label>
                                    <Input placeholder="First Purchase" value={newAchievement.title} onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Category</Label>
                                    <select value={newAchievement.category} onChange={e => setNewAchievement({ ...newAchievement, category: e.target.value })}
                                        className="mt-1 w-full h-9 rounded-md border px-3 text-sm">
                                        <option value="general">General</option>
                                        <option value="music">Music</option>
                                        <option value="market">Market</option>
                                        <option value="sports">Sports</option>
                                        <option value="community">Community</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Description</Label>
                                    <Input placeholder="Awarded when..." value={newAchievement.description} onChange={e => setNewAchievement({ ...newAchievement, description: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">XP Reward</Label>
                                    <Input type="number" value={newAchievement.xp_reward} onChange={e => setNewAchievement({ ...newAchievement, xp_reward: Number(e.target.value) })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Coin Reward</Label>
                                    <Input type="number" value={newAchievement.coin_reward} onChange={e => setNewAchievement({ ...newAchievement, coin_reward: Number(e.target.value) })} className="mt-1" />
                                </div>
                            </div>
                            <Button onClick={handleCreateAchievement} className="bg-black text-white font-bold"><Plus className="w-4 h-4 mr-2" /> Create Achievement</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm font-black">All Achievements ({achievements.length})</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {achievements.map(a => (
                                    <div key={a.id} className="p-4 border rounded-xl bg-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="font-bold text-sm">{a.title}</span>
                                            <Badge variant="outline" className="text-[10px] ml-auto">{a.category}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{a.description}</p>
                                        <div className="flex gap-3 text-xs font-bold">
                                            <span className="text-blue-600">{a.xp_reward} XP</span>
                                            <span className="text-yellow-600">{a.coin_reward} Coins</span>
                                        </div>
                                        <div className="text-[10px] text-gray-300 font-mono mt-1">{a.key}</div>
                                    </div>
                                ))}
                            </div>
                            {achievements.length === 0 && <p className="text-center text-gray-400 py-6">No achievements yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ===== VERIFICATIONS TAB ===== */}
                <TabsContent value="verifications" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black flex items-center gap-2"><Shield className="w-4 h-4" /> User Verifications ({verifications.length})</CardTitle>
                            <CardDescription>Manage phone, email, and business verifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-black">User</TableHead>
                                        <TableHead className="text-xs font-black">Type</TableHead>
                                        <TableHead className="text-xs font-black">Status</TableHead>
                                        <TableHead className="text-xs font-black">Data</TableHead>
                                        <TableHead className="text-xs font-black">Date</TableHead>
                                        <TableHead className="text-xs font-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {verifications.map(v => (
                                        <TableRow key={v.id}>
                                            <TableCell>
                                                <div className="font-bold text-sm">{v.user_name}</div>
                                                <div className="text-[10px] text-gray-400">{v.user_email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {v.verification_type === 'phone' && <Phone className="w-3 h-3 mr-1 inline" />}
                                                    {v.verification_type === 'email' && <Mail className="w-3 h-3 mr-1 inline" />}
                                                    {v.verification_type === 'business' && <Building2 className="w-3 h-3 mr-1 inline" />}
                                                    {v.verification_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {v.is_verified
                                                    ? <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>
                                                    : <Badge className="bg-orange-100 text-orange-800 text-xs"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                                                }
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                                                {v.verification_data ? JSON.stringify(v.verification_data) : '-'}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant={v.is_verified ? 'destructive' : 'default'}
                                                    className="text-xs h-7 px-2" onClick={() => handleToggleVerification(v.id, v.is_verified)}>
                                                    {v.is_verified ? <><XCircle className="w-3 h-3 mr-1" /> Revoke</> : <><CheckCircle className="w-3 h-3 mr-1" /> Approve</>}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {verifications.length === 0 && <p className="text-center text-gray-400 py-6">No verification requests yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ===== HISTORY TAB ===== */}
                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black flex items-center gap-2"><Activity className="w-4 h-4" /> Transaction History (Last 50)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-black">User</TableHead>
                                        <TableHead className="text-xs font-black">Type</TableHead>
                                        <TableHead className="text-xs font-black">Amount</TableHead>
                                        <TableHead className="text-xs font-black">Reason</TableHead>
                                        <TableHead className="text-xs font-black">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell>
                                                <div className="font-bold text-sm">{h.user_name || 'Unknown'}</div>
                                                <div className="text-[10px] text-gray-400">{h.user_email || h.user_id?.slice(0, 20) + '...'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${h.type === 'coin_gain' || h.type === 'coin_purchase' ? 'text-green-600' : h.type === 'coin_spend' ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {h.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">{h.amount || '-'}</TableCell>
                                            <TableCell className="text-xs text-gray-500 max-w-[300px] truncate">{h.reason || '-'}</TableCell>
                                            <TableCell className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {history.length === 0 && <p className="text-center text-gray-400 py-6">No transaction history yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminGamification;
