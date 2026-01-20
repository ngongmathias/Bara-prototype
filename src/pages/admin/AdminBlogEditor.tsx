import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import {
  blogPostsService,
  blogCategoriesService,
  blogAuthorsService,
  BlogPost,
  BlogCategory,
  BlogAuthor,
  generateSlug,
  calculateReadingTime
} from '../../lib/blogService';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../lib/supabase';

export const AdminBlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
  const isEditMode = !!id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    tags: [],
    status: 'draft',
    is_featured: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    scheduled_for: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, authorsData] = await Promise.all([
        blogCategoriesService.getAll(),
        blogAuthorsService.getAll(),
      ]);

      setCategories(categoriesData);
      setAuthors(authorsData);

      if (isEditMode) {
        const post = await blogPostsService.getById(id!);
        if (post) {
          setFormData(post);
          setAutoSlug(false);
        }
      } else {
        // Get or create author for current user
        if (user?.id) {
          let author = await blogAuthorsService.getByUserId(user.id);
          if (!author) {
            author = await blogAuthorsService.create({
              user_id: user.id,
              display_name: user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown',
              avatar_url: user.imageUrl,
            });
          }
          setFormData(prev => ({ ...prev, author_id: author!.id }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load editor data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image: publicUrl }));
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const addSeoKeyword = () => {
    if (seoKeywordInput.trim() && !formData.seo_keywords?.includes(seoKeywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...(prev.seo_keywords || []), seoKeywordInput.trim()],
      }));
      setSeoKeywordInput('');
    }
  };

  const removeSeoKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: prev.seo_keywords?.filter(k => k !== keyword) || [],
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.content?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Content is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.author_id) {
      toast({
        title: 'Validation Error',
        description: 'Author is required',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSave = async (buttonStatus?: 'draft' | 'published') => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Clean up empty string values that should be null for UUID and timestamp fields
      const cleanedFormData = {
        ...formData,
        category_id: formData.category_id && formData.category_id.trim() !== '' ? formData.category_id : null,
        scheduled_for: formData.scheduled_for && formData.scheduled_for.trim() !== '' ? formData.scheduled_for : null,
      };

      // Determine final status: use dropdown selection unless button explicitly sets draft/published
      let finalStatus = formData.status || 'draft';
      if (buttonStatus) {
        // Only override if user clicked a specific button (draft/publish)
        // But respect dropdown if it's set to scheduled or archived
        if (formData.status !== 'scheduled' && formData.status !== 'archived') {
          finalStatus = buttonStatus;
        }
      }

      const postData: Partial<BlogPost> = {
        ...cleanedFormData,
        status: finalStatus as 'draft' | 'published' | 'scheduled' | 'archived',
        reading_time: calculateReadingTime(formData.content || ''),
        slug: formData.slug || generateSlug(formData.title || ''),
      };

      if (finalStatus === 'published' && !formData.published_at) {
        postData.published_at = new Date().toISOString();
      }

      let savedPost: BlogPost;
      if (isEditMode) {
        savedPost = await blogPostsService.update(id!, postData);
        toast({
          title: 'Success',
          description: 'Post updated successfully',
        });
      } else {
        savedPost = await blogPostsService.create(postData);
        toast({
          title: 'Success',
          description: 'Post created successfully',
        });
      }

      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/blog')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 font-comfortaa">
              {isEditMode ? 'Edit Post' : 'Create New Post'}
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="bg-black hover:bg-gray-800"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title..."
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => {
                        setAutoSlug(false);
                        setFormData(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="post-url-slug"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAutoSlug(true);
                        setFormData(prev => ({
                          ...prev,
                          slug: generateSlug(prev.title || ''),
                        }));
                      }}
                    >
                      Auto
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the post..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content here..."
                    rows={20}
                    className="font-mono"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supports Markdown formatting
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="SEO optimized title..."
                  />
                </div>

                <div>
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Meta description for search engines..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>SEO Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={seoKeywordInput}
                      onChange={(e) => setSeoKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSeoKeyword())}
                      placeholder="Add keyword..."
                    />
                    <Button type="button" onClick={addSeoKeyword} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seo_keywords?.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeSeoKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featured_image ? (
                  <div className="relative">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-700">
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduled_for">Schedule For</Label>
                    <Input
                      id="scheduled_for"
                      type="datetime-local"
                      value={
                        formData.scheduled_for 
                          ? (() => {
                              // Convert ISO timestamp to local datetime-local format
                              const date = new Date(formData.scheduled_for);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            })()
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          // Convert local datetime to ISO timestamp
                          const date = new Date(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            scheduled_for: date.toISOString(),
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, scheduled_for: '' }));
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const offset = -new Date().getTimezoneOffset() / 60;
                        const sign = offset >= 0 ? '+' : '';
                        return `Your timezone: UTC${sign}${offset}`;
                      })()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured Post</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
