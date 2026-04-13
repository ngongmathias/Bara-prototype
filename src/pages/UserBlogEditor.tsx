import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  X,
  Plus,
  Loader2,
  Lock,
  AlertTriangle,
  PenLine,
} from 'lucide-react';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  blogPostsService,
  blogCategoriesService,
  blogAuthorsService,
  BlogPost,
  BlogCategory,
  generateSlug,
  calculateReadingTime,
} from '../lib/blogService';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';

export const UserBlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const isEditMode = !!id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [postStatus, setPostStatus] = useState<string>('draft');
  const [declineReason, setDeclineReason] = useState<string | null>(null);

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
  });

  const [tagInput, setTagInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  const [currentPostId, setCurrentPostId] = useState<string | null>(isEditMode ? (id ?? null) : null);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const dirtyRef = useRef(false);
  const isAutosavingRef = useRef(false);

  const isPendingReview = postStatus === 'pending_review';
  const isDeclined = postStatus === 'declined';
  const isLocked = isPendingReview;

  useEffect(() => {
    if (!isSignedIn) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit blog posts',
        variant: 'destructive',
      });
      navigate('/user/sign-in?redirect_url=/blog/write');
      return;
    }
    loadData();
  }, [id, isSignedIn]);

  const loadData = async () => {
    setLoading(true);
    try {
      const categoriesData = await blogCategoriesService.getAll();
      setCategories(categoriesData);

      if (isEditMode) {
        const post = await blogPostsService.getById(id!);
        if (post) {
          const author = await blogAuthorsService.getByUserId(user!.id);
          if (post.author_id !== author?.id) {
            toast({
              title: 'Access Denied',
              description: 'You can only edit your own posts',
              variant: 'destructive',
            });
            navigate('/blog');
            return;
          }
          setFormData(post);
          setPostStatus(post.status);
          setDeclineReason(post.decline_reason ?? null);
          setAutoSlug(false);
        }
      } else {
        if (user?.id) {
          let author = await blogAuthorsService.getByUserId(user.id);
          if (!author) {
            author = await blogAuthorsService.create({
              user_id: user.id,
              display_name: user.fullName || user.username || 'Anonymous',
              avatar_url: user.imageUrl,
              is_verified: false,
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
    setFormData(prev => ({ ...prev, title }));
    if (autoSlug && !isEditMode) {
      setFormData(prev => ({ ...prev, slug: generateSlug(title) }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image: publicUrl }));
      toast({ title: 'Image uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) || [] }));
  };

  /** Strip empty strings from nullable DB fields so we don't send '' instead of null */
  const cleanPost = (data: Partial<BlogPost>) => ({
    ...data,
    category_id: data.category_id?.trim() || null,
    featured_image: data.featured_image?.trim() || null,
    excerpt: data.excerpt?.trim() || null,
    seo_title: data.seo_title?.trim() || null,
    seo_description: data.seo_description?.trim() || null,
    scheduled_for: data.scheduled_for?.trim() || null,
  });

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const postData = cleanPost({
        ...formData,
        status: 'draft' as const,
        reading_time: calculateReadingTime(formData.content!),
      });
      if (isEditMode) {
        await blogPostsService.update(id!, postData);
      } else {
        await blogPostsService.create(postData);
      }
      toast({ title: 'Draft saved' });
      navigate('/users/dashboard/my-blog');
    } catch {
      toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const postData = cleanPost({
        ...formData,
        status: 'pending_review' as const,
        decline_reason: null,
        reading_time: calculateReadingTime(formData.content!),
      });
      if (isEditMode) {
        await blogPostsService.update(id!, postData);
      } else {
        await blogPostsService.create(postData);
      }

      // Send submission confirmation email (fire-and-forget)
      const authorEmail = user?.primaryEmailAddress?.emailAddress;
      if (authorEmail) {
        supabase.functions.invoke('send-email', {
          body: {
            to: authorEmail,
            subject: 'Your article has been submitted — Bara Afrika Blog',
            type: 'blog_submitted',
            data: {
              authorName: user?.firstName ?? user?.fullName ?? 'Contributor',
              articleTitle: formData.title ?? 'Your Article',
            },
          },
        }).catch(console.error);
      }

      toast({
        title: isDeclined ? 'Article resubmitted!' : 'Article submitted for review!',
        description: 'Our editorial team will review it and get back to you.',
      });
      navigate('/users/dashboard/my-blog');
    } catch {
      toast({ title: 'Error', description: 'Failed to submit article', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const runAutosave = async () => {
    if (isAutosavingRef.current) return;
    if (isLocked) return;
    if (postStatus === 'published') return;
    if (!formData.title?.trim() || !formData.content?.trim()) return;
    if (!formData.author_id) return;

    isAutosavingRef.current = true;
    setAutosaveStatus('saving');
    try {
      const postData = cleanPost({
        ...formData,
        status: (postStatus === 'declined' ? 'declined' : 'draft') as any,
        reading_time: calculateReadingTime(formData.content!),
      });
      if (currentPostId) {
        await blogPostsService.update(currentPostId, postData);
      } else {
        const created = await blogPostsService.create(postData);
        if (created?.id) {
          setCurrentPostId(created.id);
        }
      }
      dirtyRef.current = false;
      setLastSavedAt(new Date());
      setAutosaveStatus('saved');
    } catch (err) {
      console.error('Autosave error:', err);
      setAutosaveStatus('error');
    } finally {
      isAutosavingRef.current = false;
    }
  };

  useEffect(() => {
    dirtyRef.current = true;
    if (autosaveStatus === 'saved') setAutosaveStatus('idle');
  }, [formData.title, formData.content, formData.excerpt, formData.featured_image, formData.category_id, formData.tags, formData.seo_title, formData.seo_description]);

  useEffect(() => {
    if (loading || isLocked || postStatus === 'published') return;
    const interval = setInterval(() => {
      if (dirtyRef.current) {
        runAutosave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [loading, isLocked, postStatus, currentPostId, formData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
        <Footer />
      </div>
    );
  }

  // Locked view — post is under review
  if (isPendingReview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Button variant="ghost" onClick={() => navigate('/user/profile?tab=blog')} className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to My Posts
          </Button>

          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-5">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your article is under review</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-2">
              <strong>"{formData.title}"</strong> has been submitted and is currently being reviewed by our editorial team.
            </p>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
              Editing is disabled while the article is under review. You'll be notified of the outcome. In the meantime, you're welcome to submit a new article.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/blog/write')} className="bg-black hover:bg-gray-800">
                <PenLine className="w-4 h-4 mr-2" /> Write New Article
              </Button>
              <Button variant="outline" onClick={() => navigate('/user/profile?tab=blog')}>
                View My Submissions
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/user/profile?tab=blog')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to My Posts
          </Button>

          <div className="flex items-center gap-2">
            {!isLocked && postStatus !== 'published' && (
              <span className="text-xs text-gray-500 font-roboto mr-2" aria-live="polite">
                {autosaveStatus === 'saving' && 'Saving…'}
                {autosaveStatus === 'saved' && lastSavedAt && `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                {autosaveStatus === 'error' && <span className="text-red-600">Autosave failed</span>}
                {autosaveStatus === 'idle' && dirtyRef.current && 'Unsaved changes'}
              </span>
            )}
            {!isDeclined && (
              <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-black hover:bg-gray-800"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isDeclined ? 'Edit & Resubmit' : 'Submit for Review'}
            </Button>
          </div>
        </div>

        {/* Decline reason banner */}
        {isDeclined && declineReason && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Your article was not approved</AlertTitle>
            <AlertDescription className="text-red-700 mt-1">
              <strong>Feedback from our editors:</strong> {declineReason}
              <br />
              <span className="text-sm mt-1 block text-red-600">
                Please revise your article based on the feedback above and resubmit.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* General info banner for new/draft */}
        {!isDeclined && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              Articles are reviewed by our editorial team before being published. Save a draft to continue later, or submit when ready.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isDeclined ? 'Revise Your Article' : 'Write Your Article'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter article title..."
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, slug: e.target.value }));
                      setAutoSlug(false);
                    }}
                    placeholder="article-url-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of your article..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your article content here..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Write your content in <strong>HTML format</strong> — e.g. <code className="bg-gray-100 px-1 rounded">&lt;p&gt;Your paragraph&lt;/p&gt;</code>, <code className="bg-gray-100 px-1 rounded">&lt;h2&gt;Heading&lt;/h2&gt;</code>, <code className="bg-gray-100 px-1 rounded">&lt;ul&gt;&lt;li&gt;Item&lt;/li&gt;&lt;/ul&gt;</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featured_image ? (
                  <div className="relative">
                    <img src={formData.featured_image} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
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
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload Image</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Category</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contributor guidelines link */}
            <p className="text-xs text-gray-500 text-center">
              Read our{' '}
              <Link to="/blog/guidelines" className="underline hover:text-gray-700">
                Contributor Guidelines
              </Link>{' '}
              before submitting.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserBlogEditor;
