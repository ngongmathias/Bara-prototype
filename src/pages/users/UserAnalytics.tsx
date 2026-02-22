import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Eye,
    TrendingUp,
    Calendar,
    ShoppingBag,
    Loader2,
    Coins,
    Award,
    Shield
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { AchievementHall } from '@/components/gamification/AchievementHall';
import { MarketingPerformance } from '@/components/monetization/MarketingPerformance';

interface UserMetrics {
    totalViews: number;
    totalEvents: number;
    totalListings: number;
    totalPosts: number;
    totalBusinesses: number;
    engagementRate: number;
    coins: number;
    tier: string;
}

export const UserAnalytics = () => {
    const { user, isLoaded: userLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<UserMetrics>({
        totalViews: 0,
        totalEvents: 0,
        totalListings: 0,
        totalPosts: 0,
        totalBusinesses: 0,
        engagementRate: 0,
        coins: 0,
        tier: 'standard'
    });

    const [chartData, setChartData] = useState<{ name: string; items: number; views: number }[]>([]);

    useEffect(() => {
        if (userLoaded && user) {
            fetchUserMetrics();
        }
    }, [userLoaded, user]);

    const fetchUserMetrics = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch Event Counts
            const { data: events } = await supabase
                .from('events')
                .select('view_count')
                .eq('created_by_user_id', user.id);

            // Fetch Business Counts
            const { data: businesses } = await supabase
                .from('businesses')
                .select('view_count')
                .eq('owner_id', user.id);

            // Fetch Marketplace Listings
            const { data: listings } = await supabase
                .from('marketplace_listings')
                .select('views_count')
                .eq('created_by', user.id);

            // Fetch Blog Posts
            const { data: posts } = await supabase
                .from('blog_posts')
                .select('views_count')
                .eq('author_id', user.id);

            // Fetch Gamification Data
            const { data: gamify } = await supabase
                .from('gamification_profiles')
                .select('bara_coins')
                .eq('user_id', user.id)
                .single();

            // Fetch Business Tier (assuming it's on businesses table as per migration)
            const { data: bizData } = await supabase
                .from('businesses')
                .select('user_tier')
                .eq('owner_id', user.id)
                .limit(1);

            const evCount = events?.length || 0;
            const evViews = events?.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0) || 0;

            const bizCount = businesses?.length || 0;
            const bizViews = businesses?.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0) || 0;

            const listCount = listings?.length || 0;
            const listViews = listings?.reduce((acc: number, curr: any) => acc + (curr.views_count || 0), 0) || 0;

            const postCount = posts?.length || 0;
            const postViews = posts?.reduce((acc: number, curr: any) => acc + (curr.views_count || 0), 0) || 0;

            const totalItems = evCount + bizCount + listCount + postCount;
            const totalViews = evViews + bizViews + listViews + postViews;

            setMetrics({
                totalViews,
                totalEvents: evCount,
                totalListings: listCount,
                totalPosts: postCount,
                totalBusinesses: bizCount,
                engagementRate: totalItems > 0 ? parseFloat(((totalViews / totalItems) / 10).toFixed(1)) : 0,
                coins: gamify?.bara_coins || 0,
                tier: bizData?.[0]?.user_tier || 'standard'
            });

            setChartData([
                { name: 'Events', items: evCount, views: evViews },
                { name: 'Business', items: bizCount, views: bizViews },
                { name: 'Listings', items: listCount, views: listViews },
                { name: 'Blog', items: postCount, views: postViews },
            ]);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg font-medium">Loading your analytics...</span>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Content Views',
            value: metrics.totalViews.toLocaleString(),
            description: 'Across all your contributions',
            icon: Eye
        },
        {
            title: 'Created Events',
            value: metrics.totalEvents,
            description: 'Total events you organized',
            icon: Calendar
        },
        {
            title: 'Marketplace Items',
            value: metrics.totalListings,
            description: 'Items you listed for sale',
            icon: ShoppingBag
        },
        {
            title: 'Engagement Score',
            value: `${metrics.engagementRate}%`,
            description: 'Average per-item reach',
            icon: TrendingUp
        },
        {
            title: 'Bara Coins',
            value: metrics.coins.toLocaleString(),
            description: 'Your virtual balance',
            icon: Coins
        }
    ];

    const getTierColor = (tier: string) => {
        switch (tier.toLowerCase()) {
            case 'elite': return 'text-purple-500 border-purple-500 bg-purple-50';
            case 'pro': return 'text-blue-500 border-blue-500 bg-blue-50';
            default: return 'text-gray-500 border-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Your Analytics</h2>
                    <p className="text-muted-foreground">
                        Performance overview of your contributions to the platform.
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 border rounded-full font-bold uppercase tracking-wider text-sm ${getTierColor(metrics.tier)}`}>
                    <Shield className="w-4 h-4" />
                    {metrics.tier} Account
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Content Performance</CardTitle>
                        <CardDescription>
                            Comparing views across different types of content you've created.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="views" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Contribution Breakdown</CardTitle>
                        <CardDescription>
                            Total items created in each category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {chartData.map((item) => (
                                <div key={item.name} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.items} {item.items === 1 ? 'item' : 'items'} created
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {item.views.toLocaleString()} views
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 bg-gray-50/50 p-8 rounded-3xl border border-dashed border-gray-200">
                {user?.id && <MarketingPerformance userId={user.id} />}
            </div>

            <div className="mt-12">
                {user?.id && <AchievementHall userId={user.id} />}
            </div>
        </div>
    );
};

export default UserAnalytics;
