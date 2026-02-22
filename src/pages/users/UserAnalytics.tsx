import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    Eye,
    Share2,
    MousePointer2,
    Calendar,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const data = [
    { name: 'Mon', views: 400, engagement: 240 },
    { name: 'Tue', views: 300, engagement: 139 },
    { name: 'Wed', views: 200, engagement: 980 },
    { name: 'Thu', views: 278, engagement: 390 },
    { name: 'Fri', views: 189, engagement: 480 },
    { name: 'Sat', views: 239, engagement: 380 },
    { name: 'Sun', views: 349, engagement: 430 },
];

const categoryData = [
    { name: 'Events', value: 45, color: '#3b82f6' },
    { name: 'Listings', value: 25, color: '#10b981' },
    { name: 'Blog', value: 20, color: '#f59e0b' },
    { name: 'Marketplace', value: 10, color: '#ef4444' },
];

export const UserAnalytics = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Analytics</h1>
                    <p className="text-muted-foreground">Monitor how your content is performing across the platform.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,234</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2%</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2,350</div>
                        <p className="text-xs text-muted-foreground">+180 since yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shares</CardTitle>
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">452</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Views Overview</CardTitle>
                        <CardDescription>Daily views for the current week.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="engagement"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Engagement by Type</CardTitle>
                        <CardDescription>Performance of different content types.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Top Performing Content</CardTitle>
                    <CardDescription>Specific items that received the most engagement.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { title: 'Tech Innovation in Lagos', type: 'Blog', views: '1,240', clicks: '450' },
                            { title: 'Eko Hotels & Suites', type: 'Listing', views: '890', clicks: '120' },
                            { title: 'Africa Tech Summit 2026', type: 'Event', views: '2,400', clicks: '800' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{item.title}</span>
                                    <span className="text-sm text-muted-foreground">{item.type}</span>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{item.views}</p>
                                        <p className="text-xs text-muted-foreground">Views</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{item.clicks}</p>
                                        <p className="text-xs text-muted-foreground">Clicks</p>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <MousePointer2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
