import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, createAuthenticatedSupabaseClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Music, Film, BookOpen, ShoppingBag, Bookmark, FileText } from "lucide-react";
import { blogPostsService } from "@/lib/blogService";

interface SavedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: string;
  saved_at: string;
  slug?: string;
  listing_id?: string;
}

export const UserSavedItems = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [likedSongs, setLikedSongs] = useState<SavedItem[]>([]);
  const [watchlist, setWatchlist] = useState<SavedItem[]>([]);
  const [ebookLibrary, setEbookLibrary] = useState<SavedItem[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedItem[]>([]);
  const [marketplaceFavorites, setMarketplaceFavorites] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get default tab from URL parameter
  const defaultTab = searchParams.get('tab') || 'articles';

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

      // Saved blog articles (bookmarks)
      try {
        const blogBookmarks = await blogPostsService.getUserBookmarks(userId);
        setSavedArticles(blogBookmarks.map((post: any) => ({
          id: post.id,
          title: post.title || "Unknown",
          subtitle: post.author?.display_name,
          image: post.featured_image,
          type: "article",
          saved_at: post.created_at,
          slug: post.slug,
        })));
      } catch (e) {
        console.error("Error loading blog bookmarks:", e);
      }

      // Marketplace favorites - use authenticated client
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          const authSupabase = await createAuthenticatedSupabaseClient(token);
          const { data: mfavs } = await authSupabase
            .from("marketplace_favorites")
            .select("listing_id, created_at, marketplace_listings(id, title, price, marketplace_listing_images(image_url, is_primary))")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20);

          if (mfavs) {
            setMarketplaceFavorites(mfavs.map((f: any) => ({
              id: f.marketplace_listings?.id || f.listing_id,
              title: f.marketplace_listings?.title || "Unknown",
              subtitle: f.marketplace_listings?.price != null ? `$${f.marketplace_listings.price}` : undefined,
              image: f.marketplace_listings?.marketplace_listing_images?.find((img: any) => img.is_primary)?.image_url || 
                     f.marketplace_listings?.marketplace_listing_images?.[0]?.image_url,
              type: "listing",
              saved_at: f.created_at,
              listing_id: f.marketplace_listings?.id,
            })));
          }
        }
      } catch (err) {
        console.error("Error loading marketplace favorites:", err);
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
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              if (item.type === 'article' && item.slug) navigate(`/blog/${item.slug}`);
              else if (item.type === 'listing' && item.listing_id) navigate(`/marketplace/${item.listing_id}`);
            }}
          >
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

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="articles" className="gap-1"><FileText className="h-3 w-3" /> Saved Articles ({savedArticles.length})</TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-1"><ShoppingBag className="h-3 w-3" /> Marketplace ({marketplaceFavorites.length})</TabsTrigger>
          <TabsTrigger value="events" className="gap-1"><Heart className="h-3 w-3" /> Liked Events (0)</TabsTrigger>
          <TabsTrigger value="songs" className="gap-1"><Heart className="h-3 w-3" /> Liked Songs ({likedSongs.length})</TabsTrigger>
          <TabsTrigger value="movies" className="gap-1"><Film className="h-3 w-3" /> Watchlist ({watchlist.length})</TabsTrigger>
          <TabsTrigger value="ebooks" className="gap-1"><BookOpen className="h-3 w-3" /> Library ({ebookLibrary.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Card><CardContent className="p-0">
            {renderItems(savedArticles, <FileText className="h-5 w-5" />, "No saved articles yet. Bookmark blog posts to find them here.")}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card><CardContent className="p-0">
            {renderItems(marketplaceFavorites, <ShoppingBag className="h-5 w-5" />, "No marketplace favorites yet. Heart listings to save them here.")}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="events">
          <Card><CardContent className="p-0">
            <div className="p-8 text-center">
              <Heart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Event likes coming soon! Like events to save them here.</p>
            </div>
          </CardContent></Card>
        </TabsContent>

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
