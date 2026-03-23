import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic2, Users, Headphones, Plus, Trash2, Eye } from "lucide-react";

interface MyPodcast {
  id: string;
  title: string;
  host: string;
  description: string;
  category: string;
  cover_url: string;
  language: string;
  is_featured: boolean;
  subscriber_count: number;
  created_at: string;
}

export const UserMyPodcasts = () => {
  const { user } = useUser();
  const [podcasts, setPodcasts] = useState<MyPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) fetchMyPodcasts();
  }, [user?.id]);

  const fetchMyPodcasts = async () => {
    try {
      setLoading(true);
      // Podcasts created by this user (matched by host name or uploaded_by)
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .or(`uploaded_by.eq.${user!.id},host.eq.${user!.fullName || ""}`)
        .order("created_at", { ascending: false });

      if (error) {
        // Table might not exist yet
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setLoading(false);
          return;
        }
        throw error;
      }
      setPodcasts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this podcast? All episodes will also be deleted.")) return;
    try {
      const { error } = await supabase.from("podcasts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Podcast removed." });
      fetchMyPodcasts();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const totalSubscribers = podcasts.reduce((a, p) => a + (p.subscriber_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Podcasts</h2>
          <p className="text-sm text-gray-500">Manage your podcast shows and episodes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
            <Mic2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{podcasts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Headphones className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{new Set(podcasts.map(p => p.category)).size}</div></CardContent>
        </Card>
      </div>

      {/* Podcasts List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your podcasts...</div>
          ) : podcasts.length === 0 ? (
            <div className="p-8 text-center">
              <Mic2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No podcasts yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start your podcast journey on BARA</p>
              <p className="text-xs text-gray-400">Contact admin to create a podcast show, or use the Creator Portal when available.</p>
            </div>
          ) : (
            <div className="divide-y">
              {podcasts.map(podcast => (
                <div key={podcast.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {podcast.cover_url ? (
                      <img src={podcast.cover_url} alt={podcast.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Mic2 className="h-6 w-6 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{podcast.title}</p>
                    <p className="text-sm text-gray-500">{podcast.category} · {podcast.language}</p>
                    <p className="text-xs text-gray-400 truncate">{podcast.description}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-3 w-3" /> {podcast.subscriber_count || 0}
                    </div>
                    <p className="text-[10px] text-gray-400">subscribers</p>
                  </div>
                  {podcast.is_featured && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">FEATURED</span>}
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(podcast.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
