import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Music, Play, Heart, Upload, TrendingUp, Disc, MoreVertical, Trash2, Edit, ExternalLink
} from "lucide-react";

interface MySong {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  duration: number;
  plays: number;
  created_at: string;
  artists?: { name: string };
  albums?: { title: string };
}

export const UserMyMusic = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState<MySong[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPlays: 0, totalLikes: 0, totalSongs: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) fetchMySongs();
  }, [user?.id]);

  const fetchMySongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("songs")
        .select("*, artists(name), albums(title)")
        .eq("uploaded_by", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const songList = data || [];
      setSongs(songList);
      setStats({
        totalSongs: songList.length,
        totalPlays: songList.reduce((a, s) => a + (s.plays || 0), 0),
        totalLikes: 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this song? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Song removed." });
      fetchMySongs();
    } catch {
      toast({ title: "Error", description: "Failed to delete song.", variant: "destructive" });
    }
  };

  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return "--:--";
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Music</h2>
          <p className="text-sm text-gray-500">Manage your uploaded tracks</p>
        </div>
        <Link to="/streams/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" /> Upload Song
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalSongs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Play className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalLikes}</div></CardContent>
        </Card>
      </div>

      {/* Songs List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your music...</div>
          ) : songs.length === 0 ? (
            <div className="p-8 text-center">
              <Music className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No songs yet</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your first track to get started</p>
              <Link to="/streams/upload">
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Upload Song</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {songs.map((song, i) => (
                <div key={song.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <span className="text-sm text-gray-400 w-6 text-right">{i + 1}</span>
                  <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {song.cover_url ? (
                      <img loading="lazy" src={song.cover_url} alt={song.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Disc className="h-5 w-5 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{song.title}</p>
                    <p className="text-xs text-gray-500">{song.artists?.name || "Unknown Artist"} {song.albums?.title ? `· ${song.albums.title}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Play className="h-3 w-3" /> {(song.plays || 0).toLocaleString()}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{formatDuration(song.duration)}</span>
                  <span className="text-xs text-gray-400">{new Date(song.created_at).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(song.id)}>
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
