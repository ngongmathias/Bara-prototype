import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  TrendingUp, Music, Mic2, BookOpen, Play, Download, Users,
  Lock, BarChart3, Eye, Heart, ArrowUpRight, Crown
} from "lucide-react";

interface ContentStats {
  songs: number;
  totalPlays: number;
  podcasts: number;
  totalSubscribers: number;
  ebooks: number;
  totalDownloads: number;
}

export const UserCreatorAnalytics = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<ContentStats>({
    songs: 0, totalPlays: 0, podcasts: 0,
    totalSubscribers: 0, ebooks: 0, totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  // TODO: Check user's subscription tier for gating
  const isPro = false; // Will be wired to actual subscription check

  useEffect(() => {
    if (user?.id) fetchStats();
  }, [user?.id]);

  const fetchStats = async () => {
    try {
      setLoading(false);
      const userId = user!.id;

      // Fetch songs
      const { data: songs } = await supabase
        .from("songs")
        .select("plays")
        .eq("uploaded_by", userId);

      // Fetch podcasts
      const { data: podcasts } = await supabase
        .from("podcasts")
        .select("subscriber_count")
        .or(`uploaded_by.eq.${userId},host.eq.${user!.fullName || ""}`);

      // Fetch ebooks
      const { data: ebooks } = await supabase
        .from("ebooks")
        .select("download_count")
        .eq("uploaded_by", userId);

      setStats({
        songs: songs?.length || 0,
        totalPlays: songs?.reduce((a, s) => a + (s.plays || 0), 0) || 0,
        podcasts: podcasts?.length || 0,
        totalSubscribers: podcasts?.reduce((a, p) => a + (p.subscriber_count || 0), 0) || 0,
        ebooks: ebooks?.length || 0,
        totalDownloads: ebooks?.reduce((a, e) => a + (e.download_count || 0), 0) || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalContent = stats.songs + stats.podcasts + stats.ebooks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Creator Analytics</h2>
          <p className="text-sm text-gray-500">Track your content performance across BARA</p>
        </div>
        {!isPro && (
          <Link to="/pricing">
            <Button variant="outline" className="gap-2">
              <Crown className="h-4 w-4" /> Upgrade for Full Analytics
            </Button>
          </Link>
        )}
      </div>

      {/* Overview Stats — visible to all */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Music className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.songs}</div>
            <p className="text-xs text-gray-500">Songs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.totalPlays.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Plays</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Mic2 className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.podcasts}</div>
            <p className="text-xs text-gray-500">Podcasts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.ebooks}</div>
            <p className="text-xs text-gray-500">Ebooks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Download className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Pro Analytics — gated */}
      {isPro ? (
        <div className="space-y-6">
          {/* Plays Over Time Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" /> Plays & Downloads Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <p className="text-sm">Chart visualization will appear when you have listening data</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" /> Top Performing Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <p className="text-sm">Your top songs, podcasts, and ebooks ranked by engagement</p>
              </div>
            </CardContent>
          </Card>

          {/* Audience Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" /> Audience Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <p className="text-sm">Listener country breakdown, language, and device data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Free user teaser */
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unlock Full Analytics</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              Upgrade to Pro or Elite to access detailed analytics including plays over time,
              audience demographics, top performing content, revenue breakdown, and more.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
              {[
                { icon: BarChart3, label: "Plays Over Time" },
                { icon: Users, label: "Audience Data" },
                { icon: TrendingUp, label: "Top Content" },
                { icon: Eye, label: "Revenue Insights" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <Icon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <Link to="/pricing">
              <Button className="gap-2">
                <Crown className="h-4 w-4" /> View Plans — from $5/mo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      {totalContent === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Start Creating!</h3>
            <p className="text-sm text-blue-700 mb-4">Upload your first content to see analytics here.</p>
            <div className="flex justify-center gap-3">
              <Link to="/streams/upload"><Button variant="outline" size="sm"><Music className="h-4 w-4 mr-1" /> Upload Song</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
