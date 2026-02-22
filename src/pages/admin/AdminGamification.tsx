import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import {
    Trophy,
    Coins,
    TrendingUp,
    Users as UsersIcon,
    Activity,
    Award,
    ShieldAlert,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const AdminGamification = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCoins: 0,
        totalXP: 0,
        totalSpent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGlobals = async () => {
            setLoading(true);
            try {
                // Fetch aggregate stats from profiles
                const { data, error } = await supabase
                    .from('gamification_profiles')
                    .select('bara_coins, total_xp');

                if (data) {
                    const totalCoins = data.reduce((acc, curr) => acc + (curr.bara_coins || 0), 0);
                    const totalXP = data.reduce((acc, curr) => acc + (curr.total_xp || 0), 0);
                    setStats({
                        totalUsers: data.length,
                        totalCoins,
                        totalXP,
                        totalSpent: 4500 // Mock for now until we have history aggregation
                    });
                }
            } catch (err) {
                console.error('Error fetching admin gamification stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGlobals();
    }, []);

    const coinData = [
        { name: 'In Circulation', value: stats.totalCoins },
        { name: 'Ever Spent', value: stats.totalSpent }
    ];
    const COLORS = ['#3b82f6', '#10b981'];

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black font-comfortaa">Economy & Gamification</h1>
                    <p className="text-gray-500">Monitor wealth distribution and user retention loops.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="font-bold border-2">Export Data</Button>
                    <Button className="bg-black text-white font-bold">God Mode Tools</Button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Total Players</CardTitle>
                        <UsersIcon className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.totalUsers}</div>
                        <p className="text-[10px] text-green-500 font-bold">+5% this week</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Coins in Vault</CardTitle>
                        <Coins className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.totalCoins.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-400 font-bold">Total Capital Base</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Global XP</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{(stats.totalXP / 1000).toFixed(1)}k</div>
                        <p className="text-[10px] text-blue-600 font-bold">Activity Velocity</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black uppercase text-gray-400">Economy Health</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">Stable</div>
                        <p className="text-[10px] text-gray-400 font-bold">Deflationary Trend</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Economy Distribution */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa">Coin Distribution</CardTitle>
                        <CardDescription>Circulation vs Utility Sink</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={coinData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {coinData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> In Wallets</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Spent (Burned)</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performers */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-black font-comfortaa">Global Leaderboard (Preview)</CardTitle>
                        <CardDescription>Top contributors to the Bara ecosystem.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Abiola K.", level: 42, coins: 5400, rank: 1 },
                                { name: "Moussa D.", level: 38, coins: 3100, rank: 2 },
                                { name: "Grace O.", level: 35, coins: 2800, rank: 3 },
                                { name: "Kofi A.", level: 31, coins: 1900, rank: 4 }
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-yp-yellow flex items-center justify-center font-black text-sm">#{user.rank}</div>
                                        <div>
                                            <div className="font-bold">{user.name}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase">Level {user.level}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Coins size={14} className="text-yellow-600" />
                                        <span className="font-black">{user.coins.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 font-bold text-gray-500">View Full Leaderboard</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Achievement Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-black font-comfortaa">Recent Milestones</CardTitle>
                    <CardDescription>Latest achievements earned by the community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: "Market Entry", user: "Tayo P.", time: "2m ago", color: "blue" },
                            { title: "Power Listener", user: "Sifa L.", time: "15m ago", color: "green" },
                            { title: "Elite Seller", user: "Jean B.", time: "1h ago", color: "yellow" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50">
                                <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                                    <Award size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{item.title}</div>
                                    <div className="text-xs text-gray-400">{item.user} • {item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminGamification;
