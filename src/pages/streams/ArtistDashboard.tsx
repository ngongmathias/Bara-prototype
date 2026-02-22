import { useState, useEffect } from "react";
import { StreamsLayout } from "@/components/streams/StreamsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Music,
    Disc,
    TrendingUp,
    Users,
    Plus,
    Upload,
    BarChart3,
    Play,
    Zap,
    Share2,
    Star
} from "lucide-react";
import { motion } from "framer-motion";
import { GamificationService } from "@/lib/gamificationService";
import { MonetizationService } from "@/lib/monetizationService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

export default function ArtistDashboard() {
    const { user } = useUser();
    const { toast } = useToast();
    const [stats, setStats] = useState({
        tracks: 0,
        albums: 0,
        totalPlays: 0,
        fans: 0
    });
    const [loading, setLoading] = useState(true);
    const [isBoosting, setIsBoosting] = useState(false);
    const [latestTrackId, setLatestTrackId] = useState<string | null>(null);

    useEffect(() => {
        // In a real app, we'd fetch for the logged in artist
        // For this prototype, we'll fetch global stats as a placeholder
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: songs, count: trackCount } = await supabase.from('songs').select('*', { count: 'exact' });
            const { count: albumCount } = await supabase.from('albums').select('*', { count: 'exact', head: true });
            const totalPlays = songs?.reduce((acc, s) => acc + (s.plays || 0), 0) || 0;

            if (songs && songs.length > 0) {
                // Get the most recent track for the "Boost Now" shortcut
                const sorted = [...songs].sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setLatestTrackId(sorted[0].id);
            }

            setStats({
                tracks: trackCount || 0,
                albums: albumCount || 0,
                totalPlays,
                fans: Math.floor(trackCount! * 15.4) // Dummy fan count
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StreamsLayout>
            <div className="p-8 pb-32">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">Creator Portal</h1>
                    <p className="text-gray-400">Manage your music, track your growth, and connect with fans.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Streams', value: stats.totalPlays.toLocaleString(), icon: Play, color: 'text-green-500' },
                        { label: 'Tracks', value: stats.tracks, icon: Music, color: 'text-blue-500' },
                        { label: 'Albums', value: stats.albums, icon: Disc, color: 'text-purple-500' },
                        { label: 'Monthly Listeners', value: stats.fans.toLocaleString(), icon: Users, color: 'text-pink-500' }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-[#181818] border-none hover:bg-[#282828] transition-colors group">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <TrendingUp size={16} className="text-green-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-400 uppercase tracking-wider font-bold">{stat.label}</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link to="/admin/streams/songs">
                                    <div className="bg-gradient-to-br from-[#1DB954] to-[#1aa34a] p-6 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform group shadow-lg">
                                        <Upload className="text-white mb-4 group-hover:bounce" size={32} />
                                        <h3 className="font-bold text-xl text-white">Upload music</h3>
                                        <p className="text-white/80 text-sm">Release a new single or track</p>
                                    </div>
                                </Link>
                                <Link to="/admin/streams/albums">
                                    <div className="bg-[#282828] p-6 rounded-xl cursor-pointer hover:bg-[#333333] transition-colors group border border-white/5 shadow-lg">
                                        <Plus className="text-[#1DB954] mb-4" size={32} />
                                        <h3 className="font-bold text-xl text-white">Create Album</h3>
                                        <p className="text-gray-400 text-sm">Organize your tracks into EP or Album</p>
                                    </div>
                                </Link>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Performance</h2>
                                <Button variant="ghost" className="text-gray-400 hover:text-white">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Detailed Analytics
                                </Button>
                            </div>
                            <Card className="bg-[#181818] border-none h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 size={48} className="text-gray-600 mb-4 mx-auto" />
                                    <p className="text-gray-500 font-medium">Growth charts will appear here after your first 1,000 streams.</p>
                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6">Artist Tips</h2>
                            <div className="space-y-4">
                                {[
                                    { title: 'Optimize for Playlists', text: 'Songs with high completion rates are 3x more likely to be playlisted.', icon: Music },
                                    { title: 'Complete your Profile', text: 'Verified artists with bios see 40% more engagement.', icon: Users }
                                ].map(tip => (
                                    <div key={tip.title} className="bg-[#181818] p-4 rounded-lg flex gap-4">
                                        <div className="flex-shrink-0 text-[#1DB954]">
                                            <tip.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{tip.title}</h4>
                                            <p className="text-xs text-gray-400 leading-relaxed">{tip.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <Card className="bg-[#181818] border-none overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                                <h3 className="font-bold text-white text-lg">Bara Stream Verification</h3>
                            </div>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-400 mb-4">Get the blue checkmark and unlock advanced creator tools.</p>
                                <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold">Apply Now</Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#181818] border-none border-l-4 border-yellow-500 overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    <Zap className="text-yellow-500" size={20} />
                                    Promote Your Track
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 mb-4">Boost your latest release to the top of the "Trending" feed for 24 hours.</p>
                                <div className="space-y-2">
                                    <Button
                                        className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold flex items-center gap-2"
                                        disabled={isBoosting || !latestTrackId}
                                        onClick={async () => {
                                            if (!user || !latestTrackId) return;
                                            setIsBoosting(true);
                                            try {
                                                const success = await GamificationService.spendCoins(user.id, 50, "Track Boost: " + latestTrackId);
                                                if (success) {
                                                    // Mark as premium in DB
                                                    await supabase.from('songs').update({
                                                        is_premium: true,
                                                        boosted_until: new Date(Date.now() + 86400000).toISOString()
                                                    }).eq('id', latestTrackId);

                                                    // Track the interaction for ROI
                                                    await MonetizationService.trackInteraction(latestTrackId, 'song', 'click', 0.50); // $0.50 eqv cost

                                                    toast({
                                                        title: "Success",
                                                        description: `Track promoted! -50 Coins.`
                                                    });
                                                } else {
                                                    toast({
                                                        title: "Error",
                                                        description: "Insufficient Bara Coins!",
                                                        variant: 'destructive'
                                                    });
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                toast({
                                                    title: "Error",
                                                    description: "Not enough coins to promote track.",
                                                    variant: 'destructive'
                                                });
                                            } finally {
                                                setIsBoosting(false);
                                            }
                                        }}
                                    >
                                        <Star size={18} className={isBoosting ? "animate-spin" : ""} />
                                        {isBoosting ? "Boosting..." : "Boost Now (50 Coins)"}
                                    </Button>
                                    <p className="text-[10px] text-center text-gray-500 uppercase tracking-tighter">Powered by Bara Elite</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StreamsLayout>
    );
}
