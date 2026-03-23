import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Music, Film, BookOpen, Calendar, ShoppingBag, Bookmark } from "lucide-react";

interface SavedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: string;
  saved_at: string;
}

export const UserSavedItems = () => {
  const { user } = useUser();
  const [likedSongs, setLikedSongs] = useState<SavedItem[]>([]);
  const [watchlist, setWatchlist] = useState<SavedItem[]>([]);
  const [ebookLibrary, setEbookLibrary] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchAll();
  }, [user?.id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const userId = user!.id;

      // Liked songs
      const { data: likes } = await supabase
        .from("user_song_likes")
        .select("id, created_at, songs(id, title, cover_url, artists(name))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (likes) {
        setLikedSongs(likes.map((l: any) => ({
          id: l.songs?.id || l.id,
          title: l.songs?.title || "Unknown",
          subtitle: l.songs?.artists?.name,
          image: l.songs?.cover_url,
          type: "song",
          saved_at: l.created_at,
        })));
      }

      // Movie watchlist
      const { data: movies } = await supabase
        .from("movie_watchlist")
        .select("id, added_at, movies(id, title, poster_url, genre)")
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
        .limit(20);

      if (movies) {
        setWatchlist(movies.map((m: any) => ({
          id: m.movies?.id || m.id,
          title: m.movies?.title || "Unknown",
          subtitle: m.movies?.genre,
          image: m.movies?.poster_url,
          type: "movie",
          saved_at: m.added_at,
        })));
      }

      // Ebook library
      const { data: ebooks } = await supabase
        .from("ebook_library")
        .select("id, added_at, ebooks(id, title, cover_url, author)")
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
        .limit(20);

      if (ebooks) {
        setEbookLibrary(ebooks.map((e: any) => ({
          id: e.ebooks?.id || e.id,
          title: e.ebooks?.title || "Unknown",
          subtitle: e.ebooks?.author,
          image: e.ebooks?.cover_url,
          type: "ebook",
          saved_at: e.added_at,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItems = (items: SavedItem[], icon: React.ReactNode, emptyMsg: string) => {
    if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
    if (items.length === 0) return (
      <div className="p-8 text-center">
        <Bookmark className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{emptyMsg}</p>
      </div>
    );
    return (
      <div className="divide-y">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
            <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">{icon}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
            </div>
            <span className="text-xs text-gray-400">{new Date(item.saved_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Saved & Favorites</h2>
        <p className="text-sm text-gray-500">All your saved content in one place</p>
      </div>

      <Tabs defaultValue="songs">
        <TabsList>
          <TabsTrigger value="songs" className="gap-1"><Heart className="h-3 w-3" /> Liked Songs ({likedSongs.length})</TabsTrigger>
          <TabsTrigger value="movies" className="gap-1"><Film className="h-3 w-3" /> Watchlist ({watchlist.length})</TabsTrigger>
          <TabsTrigger value="ebooks" className="gap-1"><BookOpen className="h-3 w-3" /> Library ({ebookLibrary.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <Card><CardContent className="p-0">
            {renderItems(likedSongs, <Music className="h-5 w-5" />, "No liked songs yet. Like songs while listening to save them here.")}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="movies">
          <Card><CardContent className="p-0">
            {renderItems(watchlist, <Film className="h-5 w-5" />, "No movies in your watchlist. Add movies to watch later.")}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="ebooks">
          <Card><CardContent className="p-0">
            {renderItems(ebookLibrary, <BookOpen className="h-5 w-5" />, "No ebooks in your library. Add ebooks to read later.")}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
