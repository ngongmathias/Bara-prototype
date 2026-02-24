import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Activity, Settings } from "lucide-react";
import { Link } from "react-router-dom";
// import { db } from "@/lib/supabase"; // Use if we add sports tables to db helper
import { supabase } from "@/lib/supabase";
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';


export const AdminSportsDashboard = () => {
    const [stats, setStats] = useState({
        totalLeagues: 0,
        totalTeams: 0,
        totalMatches: 0,
        activeMatches: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Mock data or real tables if they exist. 
            // Assuming we need to create sports tables.
            // For prototype, we might just show 0 or mock.
            // Let's assume tables: leagues, teams, matches

            // Check if tables exist by trying to select. 
            // If error, we show 0 (safe fallback).
            const { count: leagues } = await supabase.from('leagues').select('*', { count: 'exact', head: true });
            const { count: teams } = await supabase.from('teams').select('*', { count: 'exact', head: true });
            const { count: matches } = await supabase.from('matches').select('*', { count: 'exact', head: true });
            const { count: active } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'live');

            setStats({
                totalLeagues: leagues || 0,
                totalTeams: teams || 0,
                totalMatches: matches || 0,
                activeMatches: active || 0
            });
        } catch (error) {
            console.error("Error fetching sports stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Sports Dashboard" subtitle="Manage leagues, teams, and matches">
        <div className="mb-4 w-full flex justify-end">
          <AdminPageGuide 
            title="Sports Dashboard"
            description="Monitor automated API polling for sports data."
            features={["Check API-Sports quota", "View active matches syncing", "Monitor error logs"]}
            workflow={["Verify daily quota is under limit", "Check that active matches are updating without errors"]}
          />
        </div>
            <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalLeagues}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTeams}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMatches}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeMatches}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-brand-blue" />
                                Manage News
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4">Post and manage sports news articles.</p>
                            <Link to="/admin/sports/news">
                                <Button className="w-full">Go to News</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-brand-blue" />
                                Manage Videos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4">Upload and manage video highlights.</p>
                            <Link to="/admin/sports/videos">
                                <Button className="w-full">Go to Videos</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-brand-blue" />
                                Manage Matches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4">Schedule matches and update scores.</p>
                            <Link to="/admin/sports/matches">
                                <Button className="w-full">Go to Matches</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};
