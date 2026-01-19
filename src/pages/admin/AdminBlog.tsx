import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
  blogPostsService,
  blogCategoriesService,
  blogAuthorsService,
  BlogPost,
  BlogCategory,
  formatDate
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
    draftPosts: 0,
    totalViews: 0,
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, postsData] = await Promise.all([
        blogCategoriesService.getAll(),
        blogPostsService.getAll({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          search: searchQuery || undefined,
        }),
      ]);

      setCategories(categoriesData);
      setPosts(postsData.posts);

      // Calculate stats
      const totalViews = postsData.posts.reduce((sum, post) => sum + post.view_count, 0);
      const publishedCount = postsData.posts.filter(p => p.status === 'published').length;
      const draftCount = postsData.posts.filter(p => p.status === 'draft').length;

      setStats({
        totalPosts: postsData.total,
        publishedPosts: publishedCount,
        draftPosts: draftCount,
        totalViews,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogPostsService.delete(id);
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updates: Partial<BlogPost> = { status: newStatus as any };
      
      // Set published_at when publishing
      if (newStatus === 'published') {
        const post = posts.find(p => p.id === id);
        if (!post?.published_at) {
          updates.published_at = new Date().toISOString();
        }
      }

      await blogPostsService.update(id, updates);
      toast({
        title: 'Success',
        description: `Post ${newStatus === 'published' ? 'published' : 'status updated'} successfully`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update post status',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      await blogPostsService.update(id, { is_featured: !currentValue });
      toast({
        title: 'Success',
        description: `Post ${!currentValue ? 'marked as featured' : 'removed from featured'}`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      archived: { color: 'bg-red-100 text-red-800', label: 'Archived' },
    };

    const variant = variants[status] || variants.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variant.color}`}>
        {variant.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-comfortaa">
            Blog Management
          </h1>
          <p className="text-gray-600 font-roboto">
            Create and manage blog posts, categories, and authors
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Posts
              </CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Published
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.publishedPosts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Drafts
              </CardTitle>
              <Edit className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {stats.draftPosts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Views
              </CardTitle>
              <Eye className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalViews.toLocaleString()}
              </div>
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
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
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

              <Button
                onClick={() => navigate('/admin/blog/new')}
                className="bg-black hover:bg-gray-800"
              >
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
                      <TableHead>Views</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {post.title}
                            </div>
                            {post.is_featured && (
                              <Badge variant="outline" className="mt-1">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {post.author?.avatar_url ? (
                              <img
                                src={post.author.avatar_url}
                                alt={post.author.display_name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-3 h-3 text-gray-500" />
                              </div>
                            )}
                            <span className="text-sm">
                              {post.author?.display_name || 'Unknown'}
                            </span>
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
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Eye className="w-4 h-4" />
                            {post.view_count}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {post.published_at
                            ? formatDate(post.published_at)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/blog/${post.slug}`)}
                              title="View Post"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                              title="Edit Post"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {post.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(post.id, 'published')}
                                className="text-green-600 hover:text-green-700"
                                title="Publish Post"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </Button>
                            )}
                            {post.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(post.id, 'archived')}
                                className="text-orange-600 hover:text-orange-700"
                                title="Archive Post"
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Post"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Posts Found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first blog post'}
                </p>
                <Button
                  onClick={() => navigate('/admin/blog/new')}
                  className="bg-black hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/blog/categories')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Categories</h3>
                  <p className="text-sm text-gray-600">
                    Manage {categories.length} categories
                  </p>
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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/blog/analytics')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View detailed stats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
