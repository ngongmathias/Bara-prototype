import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Eye,
    TrendingUp,
    Calendar,
    ShoppingBag,
    Loader2
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

interface UserMetrics {
    totalViews: number;
    totalEvents: number;
    totalListings: number;
    totalPosts: number;
    totalBusinesses: number;
    engagementRate: number;
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
        engagementRate: 0
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
                engagementRate: totalItems > 0 ? parseFloat(((totalViews / totalItems) / 10).toFixed(1)) : 0
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
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Analytics</h2>
                <p className="text-muted-foreground">
                    Performance overview of your contributions to the platform.
                </p>
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
        </div>
    );
};

export default UserAnalytics;
