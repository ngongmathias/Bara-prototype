import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Music, Disc, Mic2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/supabase";

export const AdminStreamsDashboard = () => {
    const [stats, setStats] = useState({
        totalArtists: 0,
        totalAlbums: 0,
        totalSongs: 0,
        totalPlays: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { count: artistCount } = await db.artists().select('*', { count: 'exact', head: true });
            const { count: albumCount } = await db.albums().select('*', { count: 'exact', head: true });
            const { count: songCount } = await db.songs().select('*', { count: 'exact', head: true });

            // For plays, we need to sum. Supabase doesn't have a direct SUM API in JS client easily without RPC or loop.
            // We can use the view or just fetch simple stats.
            const { data: songs } = await db.songs().select('plays');
            const totalPlays = songs?.reduce((acc, song) => acc + (song.plays || 0), 0) || 0;

            setStats({
                totalArtists: artistCount || 0,
                totalAlbums: albumCount || 0,
                totalSongs: songCount || 0,
                totalPlays: totalPlays
            });
        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Streams Dashboard" subtitle="Manage music content and metrics">
            <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
                            <Mic2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalArtists}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Albums</CardTitle>
                            <Disc className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAlbums}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                            <Music className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSongs}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic2 className="h-5 w-5 text-brand-blue" />
                                Manage Artists
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4">Add, edit, or remove artists from the platform.</p>
                            <Link to="/admin/streams/artists">
                                <Button className="w-full">Go to Artists</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Disc className="h-5 w-5 text-brand-blue" />
                                Manage Content (Coming Soon)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4">Upload albums and songs for your artists.</p>
                            <Button className="w-full" disabled>Song Management (In Development)</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};
