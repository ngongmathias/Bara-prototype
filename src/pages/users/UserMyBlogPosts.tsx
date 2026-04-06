import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Plus, Edit, Trash2, Eye, MessageSquare, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MyPost {
  id: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  status: string;
  views: number;
  created_at: string;
}

export const UserMyBlogPosts = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) fetchMyPosts();
  }, [user?.id]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, image_url, status, views, created_at")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") { setLoading(false); return; }
        throw error;
      }
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Post removed." });
      fetchMyPosts();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Blog Posts</h2>
          <p className="text-sm text-gray-500">Articles published under your name</p>
        </div>
        <Link to="/blog/guidelines">
          <Button variant="outline"><BookOpen className="h-4 w-4 mr-2" /> Contributor Guidelines</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No blog posts yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Want to contribute? Submit your article to our editorial team for review.
              </p>
              <Link to="/blog/guidelines">
                <Button variant="outline"><BookOpen className="h-4 w-4 mr-2" /> View Contributor Guidelines</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {posts.map(post => (
                <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="h-12 w-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><FileText className="h-5 w-5 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 truncate">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="h-3 w-3" /> {post.views || 0}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {post.status?.toUpperCase() || "DRAFT"}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                  <Link to={`/blog/${post.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
