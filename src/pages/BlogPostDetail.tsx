import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Bookmark, 
  Share2, 
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TopBannerAd } from '../components/TopBannerAd';
import { BottomBannerAd } from '../components/BottomBannerAd';
import { BlogCard } from '../components/BlogCard';
import { 
  blogPostsService, 
  blogCommentsService,
  BlogPost, 
  BlogComment,
  formatDate,
  formatRelativeTime
} from '../lib/blogService';
import { useToast } from '../hooks/use-toast';

export const BlogPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      loadComments();
      loadRelatedPosts();
      checkBookmarkStatus();
      incrementViewCount();
    }
  }, [post?.id]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const data = await blogPostsService.getBySlug(slug!);
      if (data) {
        setPost(data);
      } else {
        toast({
          title: 'Post Not Found',
          description: 'The blog post you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!post) return;
    try {
      const data = await blogCommentsService.getByPostId(post.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadRelatedPosts = async () => {
    if (!post) return;
    try {
      const data = await blogPostsService.getRelated(post.id, post.category_id);
      setRelatedPosts(data);
    } catch (error) {
      console.error('Error loading related posts:', error);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!post || !user) return;
    try {
      const bookmarked = await blogPostsService.isBookmarked(post.id, user.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const incrementViewCount = async () => {
    if (!post) return;
    try {
      await blogPostsService.incrementViewCount(post.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to bookmark posts',
        variant: 'destructive',
      });
      return;
    }

    try {
      const bookmarked = await blogPostsService.toggleBookmark(post!.id, user.id);
      setIsBookmarked(bookmarked);
      toast({
        title: bookmarked ? 'Bookmarked' : 'Removed from Bookmarks',
        description: bookmarked 
          ? 'Post saved to your bookmarks' 
          : 'Post removed from your bookmarks',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive',
      });
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: 'Link Copied',
          description: 'Post link copied to clipboard',
        });
        setShowShareMenu(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      });
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await blogCommentsService.create({
        post_id: post!.id,
        user_id: user.id,
        user_name: user.fullName || user.username || 'Anonymous',
        user_avatar: user.imageUrl,
        content: commentText,
        parent_id: replyTo || undefined,
      });

      setCommentText('');
      setReplyTo(null);
      loadComments();
      toast({
        title: 'Comment Posted',
        description: 'Your comment has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderComment = (comment: BlogComment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
      <div className="flex gap-3">
        {comment.user_avatar ? (
          <img
            src={comment.user_avatar}
            alt={comment.user_name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
        )}
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{comment.user_name}</span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(comment.created_at)}
                {comment.is_edited && ' (edited)'}
              </span>
            </div>
            <p className="text-gray-700 font-roboto">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button
              onClick={() => setReplyTo(comment.id)}
              className="text-gray-600 hover:text-black transition-colors"
            >
              Reply
            </button>
            {comment.likes_count > 0 && (
              <span className="text-gray-500">{comment.likes_count} likes</span>
            )}
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TopBannerAd />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blog
        </button>

        {/* Article Header */}
        <article>
          {post.category && (
            <div 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
              style={{ backgroundColor: post.category.color || '#000000' }}
            >
              {post.category.name}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-comfortaa">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{post.author.display_name}</div>
                  {post.author.is_verified && (
                    <div className="text-xs text-blue-600">Verified Author</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.published_at!)}</span>
            </div>
            
            {post.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time} min read</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.view_count} views</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Facebook className="w-4 h-4" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Twitter className="w-4 h-4" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Linkedin className="w-4 h-4" />
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12 font-roboto">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio */}
          {post.author && post.author.bio && (
            <div className="bg-gray-50 rounded-lg p-6 mb-12">
              <div className="flex gap-4">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.display_name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 font-comfortaa">
                    {post.author.display_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 font-roboto">{post.author.bio}</p>
                  <div className="text-sm text-gray-500">
                    {post.author.post_count} articles published
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8">
              {replyTo && (
                <div className="mb-2 text-sm text-gray-600">
                  Replying to comment{' '}
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-blue-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
                disabled={!user || isSubmittingComment}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none font-roboto"
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!user || !commentText.trim() || isSubmittingComment}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map(comment => renderComment(comment))
              ) : (
                <p className="text-gray-500 text-center py-8 font-roboto">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <BlogCard
                  key={relatedPost.id}
                  post={relatedPost}
                  onReadMore={(slug) => navigate(`/blog/${slug}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default BlogPostDetail;
