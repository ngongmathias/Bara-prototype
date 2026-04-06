import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminPageGuide } from '../../components/admin/AdminPageGuide';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  blogPostsService,
  blogCategoriesService,
  BlogPost,
  BlogCategory,
  formatDate,
} from '../../lib/blogService';
import { useToast } from '../../hooks/use-toast';

export const AdminBlog = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    pendingPosts: 0,
    draftPosts: 0,
  });

  // Decline modal state
  const [declineModal, setDeclineModal] = useState<{
    open: boolean;
    postId: string | null;
    postTitle: string;
    reason: string;
  }>({ open: false, postId: null, postTitle: '', reason: '' });
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, postsData, allPostsData] = await Promise.all([
        blogCategoriesService.getAll(),
        blogPostsService.getAll({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          search: searchQuery || undefined,
        }),
        blogPostsService.getAll({}),
      ]);

      setCategories(categoriesData);
      setPosts(postsData.posts);

      const all = allPostsData.posts;
      setStats({
        totalPosts: allPostsData.total,
        publishedPosts: all.filter(p => p.status === 'published').length,
        pendingPosts: all.filter(p => p.status === 'pending_review').length,
        draftPosts: all.filter(p => p.status === 'draft').length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load blog data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogPostsService.delete(id);
      toast({ title: 'Post deleted successfully' });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const post = posts.find(p => p.id === id);
      await blogPostsService.update(id, {
        status: 'published',
        decline_reason: null,
        published_at: post?.published_at ?? new Date().toISOString(),
      } as any);
      toast({ title: 'Article published!', description: 'The author\'s submission has been approved.' });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'Failed to publish post', variant: 'destructive' });
    }
  };

  const handleOpenDecline = (post: BlogPost) => {
    setDeclineModal({ open: true, postId: post.id, postTitle: post.title, reason: '' });
  };

  const handleDecline = async () => {
    if (!declineModal.postId || !declineModal.reason.trim()) {
      toast({ title: 'Please enter a reason for declining', variant: 'destructive' });
      return;
    }
    setDeclining(true);
    try {
      await blogPostsService.update(declineModal.postId, {
        status: 'declined',
        decline_reason: declineModal.reason.trim(),
      } as any);
      toast({ title: 'Article declined', description: 'Feedback has been saved for the author.' });
      setDeclineModal({ open: false, postId: null, postTitle: '', reason: '' });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'Failed to decline post', variant: 'destructive' });
    } finally {
      setDeclining(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updates: Partial<BlogPost> = { status: newStatus as any };
      if (newStatus === 'published') {
        const post = posts.find(p => p.id === id);
        if (!post?.published_at) updates.published_at = new Date().toISOString();
      }
      await blogPostsService.update(id, updates);
      toast({ title: `Post ${newStatus === 'published' ? 'published' : 'status updated'} successfully` });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'Failed to update post status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      published:      { color: 'bg-green-100 text-green-800',  label: 'Published' },
      draft:          { color: 'bg-gray-100 text-gray-800',    label: 'Draft' },
      scheduled:      { color: 'bg-blue-100 text-blue-800',    label: 'Scheduled' },
      archived:       { color: 'bg-red-100 text-red-800',      label: 'Archived' },
      pending_review: { color: 'bg-amber-100 text-amber-800',  label: 'Pending Review' },
      declined:       { color: 'bg-red-100 text-red-700',      label: 'Declined' },
    };
    const variant = variants[status] || variants.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variant.color}`}>
        {variant.label}
      </span>
    );
  };

  return (
    <AdminLayout title="Blog Management" subtitle="Review contributor submissions and manage published articles">
    <>
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-comfortaa">
            Blog Management
          </h1>
          <AdminPageGuide
            title="Blog Management"
            description="Review and publish contributor submissions."
            features={[
              'Review pending submissions',
              'Approve or decline with feedback',
              'Manage published articles',
            ]}
            workflow={[
              'Filter by "Pending Review" to see new submissions',
              'Click the green tick to publish or red X to decline',
              'Declined posts show feedback to the author',
            ]}
          />
        </div>
        <p className="text-gray-600 font-roboto mb-8 sr-only">
          Review contributor submissions and manage published articles
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:ring-2 hover:ring-amber-300 transition"
            onClick={() => setStatusFilter('pending_review')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pendingPosts}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.publishedPosts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Drafts</CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draftPosts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-52">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => navigate('/admin/blog/new')} className="bg-black hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className={post.status === 'pending_review' ? 'bg-amber-50/40' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{post.title}</div>
                            {post.is_featured && (
                              <Badge variant="outline" className="mt-1">Featured</Badge>
                            )}
                            {post.status === 'declined' && (post as any).decline_reason && (
                              <p className="text-xs text-red-500 mt-1 max-w-xs truncate">
                                Feedback: {(post as any).decline_reason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {post.author?.avatar_url ? (
                              <img src={post.author.avatar_url} alt={post.author.display_name} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-3 h-3 text-gray-500" />
                              </div>
                            )}
                            <span className="text-sm">{post.author?.display_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.category && (
                            <span
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: post.category.color }}
                            >
                              {post.category.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(post.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(post.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {/* Preview */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/blog/${post.slug}`)}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Edit (admin) */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* Approve (pending_review only) */}
                            {post.status === 'pending_review' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(post.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve & Publish"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Decline (pending_review only) */}
                            {post.status === 'pending_review' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDecline(post)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Decline with feedback"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Archive published */}
                            {post.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(post.id, 'archived')}
                                className="text-orange-600 hover:text-orange-700"
                                title="Archive"
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
                <p className="text-gray-600 mb-4">
                  {statusFilter === 'pending_review'
                    ? 'No articles are waiting for review right now.'
                    : searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No posts match the current filters'}
                </p>
                <Button onClick={() => navigate('/admin/blog/new')} className="bg-black hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" /> Create Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/blog/categories')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Categories</h3>
                  <p className="text-sm text-gray-600">Manage {categories.length} categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/blog/authors')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Authors</h3>
                  <p className="text-sm text-gray-600">Manage blog authors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decline Modal */}
      <Dialog
        open={declineModal.open}
        onOpenChange={(open) => !open && setDeclineModal(prev => ({ ...prev, open: false }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Declining <strong>"{declineModal.postTitle}"</strong>. The author will see this message in their dashboard.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Reason for declining <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={declineModal.reason}
                onChange={(e) => setDeclineModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. The article needs more pan-African focus. Please revise the introduction and add references to specific African contexts..."
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Be specific and constructive — this helps the author improve and resubmit.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeclineModal({ open: false, postId: null, postTitle: '', reason: '' })}
              disabled={declining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDecline}
              disabled={declining || !declineModal.reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {declining ? 'Declining...' : 'Decline & Send Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
    </AdminLayout>
  );
};

export default AdminBlog;
