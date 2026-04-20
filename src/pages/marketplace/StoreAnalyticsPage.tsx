import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, Package, Star, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StoreStats {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalFavorites: number;
    totalMessages: number;
    avgRating: number;
    ratingCount: number;
    followerCount: number;
}

interface ListingRow {
    id: string;
    title: string;
    views_count: number;
    favorites_count: number;
    status: string;
    image_urls: string[] | null;
    created_at: string;
}

export default function StoreAnalyticsPage() {
    const { user } = useUser();
    const [stats, setStats] = useState<StoreStats | null>(null);
    const [listings, setListings] = useState<ListingRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                const { data: partner } = await supabase
                    .from('marketplace_partners')
                    .select('id, avg_rating, rating_count')
                    .eq('owner_user_id', user.id)
                    .maybeSingle();

                if (!partner) {
                    setLoading(false);
                    return;
                }

                const { data: listingsData } = await supabase
                    .from('marketplace_listings')
                    .select('id, title, views_count, favorites_count, status, image_urls, created_at')
                    .eq('partner_id', partner.id)
                    .order('created_at', { ascending: false });

                const rows = listingsData || [];
                setListings(rows);

                const activeCount = rows.filter(l => l.status === 'active').length;
                const totalViews = rows.reduce((s, l) => s + (l.views_count || 0), 0);
                const totalFavorites = rows.reduce((s, l) => s + (l.favorites_count || 0), 0);

                let msgCount = 0;
                try {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('receiver_id', user.id);
                    msgCount = count || 0;
                } catch { /* messages table shape may differ */ }

                let followerCount = 0;
                try {
                    const { count } = await supabase
                        .from('store_followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('partner_id', partner.id);
                    followerCount = count || 0;
                } catch { /* table may not exist */ }

                setStats({
                    totalListings: rows.length,
                    activeListings: activeCount,
                    totalViews,
                    totalFavorites,
                    totalMessages: msgCount,
                    avgRating: partner.avg_rating || 0,
                    ratingCount: partner.rating_count || 0,
                    followerCount,
                });
            } catch (e) {
                console.error('Error fetching store analytics:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    if (loading) {
        return (
            <><Header />
                <div className="p-8 flex items-center justify-center min-h-[50vh]">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                </div>
            <Footer /></>
        );
    }

    if (!stats) {
        return (
            <><Header />
                <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
                    <Package size={48} className="text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Store Found</h2>
                    <p className="text-gray-500 mb-4">Create a store to see analytics.</p>
                    <Link to="/marketplace/storefront/edit" className="text-[#1DB954] hover:underline font-medium">
                        Set up your store
                    </Link>
                </div>
            <Footer /></>
        );
    }

    return (
        <><Header />
            <div className="p-6 sm:p-8 max-w-[1200px] mx-auto pb-24">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Analytics</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Package size={16} /> Listings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalListings}</div>
                            <p className="text-xs text-gray-500 mt-1">{stats.activeListings} active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Eye size={16} /> Total Views
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Heart size={16} /> Favorites
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalFavorites.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <MessageCircle size={16} /> Messages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalMessages.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Star size={16} /> Avg Rating
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</div>
                            <p className="text-xs text-gray-500 mt-1">{stats.ratingCount} review{stats.ratingCount !== 1 ? 's' : ''}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Users size={16} /> Followers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.followerCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <TrendingUp size={16} /> Views / Listing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalListings > 0 ? Math.round(stats.totalViews / stats.totalListings) : 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-3">Listing Performance</h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Listing</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Views</th>
                                <th className="text-right px-4 py-3">Favorites</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {listings.map(listing => (
                                <tr key={listing.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        {listing.image_urls?.[0] ? (
                                            <img src={listing.image_urls[0]} alt="" className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                                <Package size={16} className="text-gray-400" />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{listing.title}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">{listing.views_count || 0}</td>
                                    <td className="px-4 py-3 text-right font-medium">{listing.favorites_count || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        <Footer /></>
    );
}
