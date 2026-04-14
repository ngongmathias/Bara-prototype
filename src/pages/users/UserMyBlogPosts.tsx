import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { blogPostsService } from "@/lib/blogService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  BookOpen,
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
  Trash2,
  Archive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MyPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  status: string;
  view_count: number;
  reading_time: number | null;
  decline_reason: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  published:      { label: "PUBLISHED",     className: "bg-green-50 text-green-700" },
  pending_review: { label: "UNDER REVIEW",  className: "bg-amber-50 text-amber-700" },
  declined:       { label: "DECLINED",      className: "bg-red-50 text-red-700" },
  draft:          { label: "DRAFT",         className: "bg-gray-50 text-gray-600" },
  archived:       { label: "ARCHIVED",      className: "bg-gray-50 text-gray-400" },
};

export const UserMyBlogPosts = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDecline, setExpandedDecline] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) fetchMyPosts();
  }, [user?.id]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      // Get author record first
      const { data: author } = await supabase
        .from("blog_authors")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!author) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, status, view_count, reading_time, decline_reason, created_at")
        .eq("author_id", author.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") { setLoading(false); return; }
        throw error;
      }
      // Map featured_image → image_url for display
      setPosts((data || []).map(p => ({ ...p, image_url: p.featured_image })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently? This cannot be undone.')) return;
    try {
      await blogPostsService.delete(id);
      toast({ title: 'Article deleted' });
      fetchMyPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await blogPostsService.update(id, { status: 'archived' } as any);
      toast({ title: 'Article archived', description: 'It\'s hidden from the public blog.' });
      fetchMyPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to archive article', variant: 'destructive' });
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await blogPostsService.update(id, { status: 'pending_review' } as any);
      toast({ title: 'Submitted for review', description: 'Your article is back in the review queue.' });
      fetchMyPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to resubmit article', variant: 'destructive' });
    }
  };

  const pendingCount  = posts.filter(p => p.status === 'pending_review').length;
  const declinedCount = posts.filter(p => p.status === 'declined').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount    = posts.filter(p => p.status === 'draft').length;
  const totalViews    = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Blog Articles</h2>
          <p className="text-sm text-gray-500">Articles submitted under your name</p>
        </div>
        <div className="flex gap-2">
          <Link to="/blog/guidelines">
            <Button variant="outline" size="sm"><BookOpen className="h-4 w-4 mr-2" /> Guidelines</Button>
          </Link>
          <Link to="/blog/write">
            <Button size="sm" className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" /> New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Insights summary */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1"><TrendingUp className="h-3 w-3" /> Total Views</div>
            <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 text-xs mb-1"><Eye className="h-3 w-3" /> Published</div>
            <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 text-xs mb-1"><Clock className="h-3 w-3" /> Under Review</div>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1"><FileText className="h-3 w-3" /> Drafts</div>
            <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
          </div>
        </div>
      )}

      {/* Alert badges for action needed */}
      {(pendingCount > 0 || declinedCount > 0) && (
        <div className="flex gap-3 flex-wrap">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <Lock className="h-3.5 w-3.5" />
              {pendingCount} article{pendingCount > 1 ? 's' : ''} under review
            </div>
          )}
          {declinedCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {declinedCount} article{declinedCount > 1 ? 's' : ''} need{declinedCount === 1 ? 's' : ''} revision
            </div>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No articles yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Ready to contribute? Read the guidelines and submit your first article.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/blog/guidelines">
                  <Button variant="outline" size="sm"><BookOpen className="h-4 w-4 mr-2" /> Guidelines</Button>
                </Link>
                <Link to="/blog/write">
                  <Button size="sm" className="bg-black hover:bg-gray-800"><Plus className="h-4 w-4 mr-2" /> Write Article</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {posts.map(post => {
                const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
                const isUnderReview = post.status === 'pending_review';
                const isDeclined = post.status === 'declined';
                const showDecline = isDeclined && expandedDecline === post.id;

                return (
                  <div key={post.id}>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
                      {/* Thumbnail */}
                      <div className="h-12 w-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        {post.image_url ? (
                          <img loading="lazy" src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Title + excerpt */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-500 truncate">{post.excerpt}</p>
                      </div>

                      {/* Views + reading time */}
                      <div className="flex flex-col items-end gap-0.5 hidden sm:flex">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="h-3 w-3" /> {post.view_count || 0}
                        </div>
                        {post.reading_time && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" /> {post.reading_time} min
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>

                      {/* Date */}
                      <span className="text-xs text-gray-400 hidden md:block">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isUnderReview && (
                          <div title="Locked while under review" className="p-2 text-amber-500">
                            <Lock className="h-4 w-4" />
                          </div>
                        )}

                        {isDeclined && (
                          <>
                            <Link to={`/blog/edit/${post.id}`}>
                              <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-700 hover:bg-red-50">
                                <Edit className="h-3 w-3 mr-1" /> Revise
                              </Button>
                            </Link>
                            {post.decline_reason && (
                              <Button variant="ghost" size="sm" onClick={() => setExpandedDecline(showDecline ? null : post.id)} className="text-red-600" title="View feedback">
                                {showDecline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {post.status === 'published' && (
                          <>
                            <Link to={`/blog/${post.slug}`}>
                              <Button variant="ghost" size="sm" title="View live article"><Eye className="h-4 w-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => handleArchive(post.id)} className="text-gray-400 hover:text-orange-600" title="Archive / hide from public">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {post.status === 'draft' && (
                          <>
                            <Link to={`/blog/edit/${post.id}`}>
                              <Button variant="ghost" size="sm" title="Edit draft"><Edit className="h-4 w-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-600" title="Delete draft">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {post.status === 'archived' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleUnarchive(post.id)} className="text-xs text-gray-600" title="Resubmit for review">
                              <Edit className="h-3 w-3 mr-1" /> Resubmit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded decline reason */}
                    {showDecline && post.decline_reason && (
                      <div className="px-4 pb-4 bg-red-50 border-t border-red-100">
                        <div className="flex items-start gap-2 pt-3">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-1">Editorial feedback:</p>
                            <p className="text-sm text-red-700">{post.decline_reason}</p>
                            <p className="text-xs text-red-500 mt-2">
                              Please revise your article and click <strong>"Revise"</strong> to resubmit.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
