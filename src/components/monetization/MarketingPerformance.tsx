import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, MousePointer2, Eye, CircleDollarSign, BarChart2 } from 'lucide-react';
import { MonetizationService } from '@/lib/monetizationService';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketingPerformanceProps {
    userId: string;
}

export const MarketingPerformance: React.FC<MarketingPerformanceProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        avgCTR: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // In a real app, we'd fetch identifiers for all the user's listings/banners
                // For this prototype, we'll fetch general stats for context
                // Mock data for immediate visualization if no DB records yet
                const mockData = [
                    { event_date: '2026-02-15', impressions: 120, clicks: 5, total_spend: 2.5 },
                    { event_date: '2026-02-16', impressions: 450, clicks: 22, total_spend: 11.0 },
                    { event_date: '2026-02-17', impressions: 380, clicks: 18, total_spend: 9.0 },
                    { event_date: '2026-02-18', impressions: 600, clicks: 45, total_spend: 22.5 },
                    { event_date: '2026-02-19', impressions: 850, clicks: 62, total_spend: 31.0 },
                    { event_date: '2026-02-20', impressions: 920, clicks: 78, total_spend: 39.0 },
                    { event_date: '2026-02-21', impressions: 1100, clicks: 95, total_spend: 47.5 },
                ];

                setStats(mockData);

                const totals = mockData.reduce((acc, curr) => ({
                    totalImpressions: acc.totalImpressions + curr.impressions,
                    totalClicks: acc.totalClicks + curr.clicks,
                    totalSpend: acc.totalSpend + curr.total_spend
                }), { totalImpressions: 0, totalClicks: 0, totalSpend: 0 });

                setSummary({
                    ...totals,
                    avgCTR: totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0
                });

            } catch (error) {
                console.error('Error fetching marketing stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchStats();
        }
    }, [userId]);

    if (loading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold font-comfortaa flex items-center gap-2">
                        Marketing Performance
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">Demo Data</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">Real-time ROI on your promoted listings and banners. (Waiting for backend integration)</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Bara Prime</div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Impressions</p>
                            <Eye className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-black">{summary.totalImpressions.toLocaleString()}</div>
                        <p className="text-[10px] text-green-600 font-bold mt-1">+12% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-green-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Clicks</p>
                            <MousePointer2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-black">{summary.totalClicks.toLocaleString()}</div>
                        <p className="text-[10px] text-green-600 font-bold mt-1">+8% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-purple-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">CTR</p>
                            <BarChart2 className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-black">{summary.avgCTR.toFixed(1)}%</div>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Market Avg: 2.1%</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-yellow-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Value Spent</p>
                            <CircleDollarSign className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="text-2xl font-black">${summary.totalSpend.toFixed(2)}</div>
                        <p className="text-[10px] text-yellow-600 font-bold mt-1">540 Bara Coins</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Growth Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats}>
                            <defs>
                                <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="event_date"
                                fontSize={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            />
                            <YAxis fontSize={10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="impressions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorImp)" strokeWidth={2} />
                            <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
