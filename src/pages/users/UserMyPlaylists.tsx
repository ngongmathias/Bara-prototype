import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Music, ListMusic, Trash2, Play, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Playlist {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    created_at: string;
    song_count?: number;
}

export const UserMyPlaylists = () => {
    const { user } = useUser();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (user?.id) fetchPlaylists();
    }, [user?.id]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("playlists")
                .select("id, title, description, cover_url, created_at")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false });

            if (error) {
                if (error.code === "42P01") { setLoading(false); return; }
                throw error;
            }

            // Get song counts for each playlist
            if (data && data.length > 0) {
                const { data: songCounts } = await supabase
                    .from("playlist_songs")
                    .select("playlist_id")
                    .in("playlist_id", data.map(p => p.id));

                const countMap: Record<string, number> = {};
                songCounts?.forEach(sc => {
                    countMap[sc.playlist_id] = (countMap[sc.playlist_id] || 0) + 1;
                });

                setPlaylists(data.map(p => ({ ...p, song_count: countMap[p.id] || 0 })));
            } else {
                setPlaylists([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this playlist?")) return;
        try {
            await supabase.from("playlist_songs").delete().eq("playlist_id", id);
            const { error } = await supabase.from("playlists").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Deleted", description: "Playlist removed." });
            fetchPlaylists();
        } catch {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Playlists</h2>
                    <p className="text-sm text-gray-500">Manage your music playlists</p>
                </div>
                <Link to="/streams">
                    <Button variant="outline"><Music className="h-4 w-4 mr-2" /> Go to Streams</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : playlists.length === 0 ? (
                        <div className="p-8 text-center">
                            <ListMusic className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-700 mb-1">No playlists yet</h3>
                            <p className="text-sm text-gray-500 mb-4">Create playlists from the Streams music player</p>
                            <Link to="/streams">
                                <Button variant="outline"><Music className="h-4 w-4 mr-2" /> Browse Music</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {playlists.map(playlist => (
                                <div key={playlist.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                                    <Link to={`/streams/playlist/${playlist.id}`} className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {playlist.cover_url ? (
                                            <img loading="lazy" src={playlist.cover_url} alt={playlist.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center"><ListMusic className="h-6 w-6 text-gray-300" /></div>
                                        )}
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/streams/playlist/${playlist.id}`} className="hover:underline">
                                            <p className="font-medium text-gray-900 truncate">{playlist.title}</p>
                                        </Link>
                                        {playlist.description && <p className="text-xs text-gray-500 truncate">{playlist.description}</p>}
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                            <span className="flex items-center gap-1"><Music className="h-3 w-3" /> {playlist.song_count || 0} songs</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(playlist.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Link to={`/streams/playlist/${playlist.id}`}>
                                            <Button variant="ghost" size="sm"><Play className="h-4 w-4" /></Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(playlist.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
