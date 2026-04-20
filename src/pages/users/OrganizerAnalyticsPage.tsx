import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Star, TrendingUp, BarChart3 } from 'lucide-react';

interface OrganizerStats {
    totalEvents: number;
    totalRegistrations: number;
    totalViews: number;
    avgRating: number;
    ratingCount: number;
    upcomingEvents: number;
    pastEvents: number;
}

interface EventRow {
    id: string;
    title: string;
    start_date: string;
    registration_count: number;
    view_count: number;
    event_image_url: string | null;
}

export function OrganizerAnalyticsPage() {
    const { user } = useUser();
    const [stats, setStats] = useState<OrganizerStats | null>(null);
    const [events, setEvents] = useState<EventRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                const { data: myEvents } = await supabase
                    .from('events')
                    .select('id, title, start_date, end_date, registration_count, view_count, event_image_url')
                    .eq('created_by_user_id', user.id)
                    .order('start_date', { ascending: false });

                const rows = myEvents || [];
                setEvents(rows);

                const now = new Date();
                const upcoming = rows.filter(e => new Date(e.start_date) > now).length;
                const past = rows.length - upcoming;
                const totalRegs = rows.reduce((s, e) => s + (e.registration_count || 0), 0);
                const totalViews = rows.reduce((s, e) => s + (e.view_count || 0), 0);

                let avgRating = 0;
                let ratingCount = 0;
                if (rows.length > 0) {
                    try {
                        const eventIds = rows.map(e => e.id);
                        const { data: reviews } = await supabase
                            .from('event_reviews')
                            .select('rating')
                            .in('event_id', eventIds);
                        if (reviews && reviews.length > 0) {
                            ratingCount = reviews.length;
                            avgRating = reviews.reduce((s, r) => s + r.rating, 0) / ratingCount;
                        }
                    } catch { /* event_reviews may not exist */ }
                }

                setStats({
                    totalEvents: rows.length,
                    totalRegistrations: totalRegs,
                    totalViews,
                    avgRating: Math.round(avgRating * 10) / 10,
                    ratingCount,
                    upcomingEvents: upcoming,
                    pastEvents: past,
                });
            } catch (e) {
                console.error('Error fetching organizer analytics:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats || stats.totalEvents === 0) {
        return (
            <div className="p-6 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h2>
                <p className="text-gray-500">Create your first event to see organizer analytics here.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Organizer Analytics</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Calendar size={16} /> Events Created
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalEvents}</div>
                        <p className="text-xs text-gray-500 mt-1">{stats.upcomingEvents} upcoming · {stats.pastEvents} past</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Users size={16} /> Total RSVPs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalRegistrations.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <TrendingUp size={16} /> Total Views
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Star size={16} /> Avg Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.avgRating > 0 ? stats.avgRating : '—'}</div>
                        <p className="text-xs text-gray-500 mt-1">{stats.ratingCount} review{stats.ratingCount !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 size={18} /> Event Performance
                </h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Event</th>
                                <th className="text-left px-4 py-3">Date</th>
                                <th className="text-right px-4 py-3">RSVPs</th>
                                <th className="text-right px-4 py-3">Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        {event.event_image_url ? (
                                            <img src={event.event_image_url} alt="" className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                                <Calendar size={16} className="text-gray-400" />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{event.title}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(event.start_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">{event.registration_count || 0}</td>
                                    <td className="px-4 py-3 text-right font-medium">{event.view_count || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
