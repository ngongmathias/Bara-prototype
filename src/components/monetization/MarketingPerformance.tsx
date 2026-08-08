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
    Area,
    Legend
} from 'recharts';
import { TrendingUp, MousePointer2, Eye, BarChart2 } from 'lucide-react';
import { MonetizationService } from '@/lib/monetizationService';
import { supabase } from '@/lib/supabase';
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
        // This used to render seven days of invented impressions, clicks and
        // dollar spend for every user — a "Demo Data" badge next to a chart
        // claiming they had spent $162.50. The real numbers live in
        // `monetization_stats`, which MonetizationService already reads.
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data: listings } = await supabase
                    .from('marketplace_listings')
                    .select('id')
                    .eq('created_by', userId);

                const ids = (listings || []).map((l: { id: string }) => l.id);
                if (ids.length === 0) {
                    setStats([]);
                    setSummary({ totalImpressions: 0, totalClicks: 0, totalSpend: 0, avgCTR: 0 });
                    return;
                }

                const rows = await MonetizationService.getUserPortfolioStats(ids, 'listing');

                // One row per (item, day) — collapse to one row per day so the
                // chart shows the portfolio total rather than a jagged per-item mix.
                const byDate = new Map<string, { event_date: string; impressions: number; clicks: number; total_spend: number }>();
                for (const row of rows || []) {
                    const key = row.event_date;
                    const acc = byDate.get(key) || { event_date: key, impressions: 0, clicks: 0, total_spend: 0 };
                    acc.impressions += row.impressions || 0;
                    acc.clicks += row.clicks || 0;
                    acc.total_spend += Number(row.total_spend) || 0;
                    byDate.set(key, acc);
                }

                const daily = [...byDate.values()].sort((a, b) => a.event_date.localeCompare(b.event_date));
                setStats(daily);

                const totals = daily.reduce((acc, curr) => ({
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
                setStats([]);
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

    const header = (
        <div className="mb-4">
            <h3 className="text-xl font-bold font-comfortaa">Marketing Performance</h3>
            <p className="text-sm text-muted-foreground">Impressions and clicks on your marketplace ads.</p>
        </div>
    );

    if (stats.length === 0) {
        return (
            <div>
                {header}
                <Card>
                    <CardContent className="py-12 flex flex-col items-center text-center gap-2">
                        <BarChart2 className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-medium text-gray-700">No performance data yet</p>
                        <p className="text-xs text-gray-500 max-w-sm">
                            Once your ads start being seen, daily impressions and clicks will appear here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {header}

            {/* Quick Metrics.
                The "+12% from yesterday" / "+8% from yesterday" / "Market Avg: 2.1%"
                sub-labels were invented constants, and the "Value Spent" card showed
                a dollar total for advertising that is currently free — all removed.
                What's left is computed from monetization_stats. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Impressions</p>
                            <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-black">{summary.totalImpressions.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Clicks</p>
                            <MousePointer2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-black">{summary.totalClicks.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">CTR</p>
                            <BarChart2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-black">{summary.avgCTR.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        Impressions and clicks over time
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats}>
                            {/* Monochrome per the platform design rule. The two series
                                are separated by value (impressions always ≥ clicks) and
                                by weight, and the legend below names them — previously
                                there was no legend at all, so neither line was labelled. */}
                            <defs>
                                <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#111827" stopOpacity={0.14} />
                                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="event_date"
                                fontSize={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            />
                            <YAxis fontSize={10} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
                            <Area name="Impressions" type="monotone" dataKey="impressions" stroke="#111827" fillOpacity={1} fill="url(#colorImp)" strokeWidth={2} />
                            <Area name="Clicks" type="monotone" dataKey="clicks" stroke="#9ca3af" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} strokeDasharray="4 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
