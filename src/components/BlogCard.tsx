import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowRight, Heart, Bookmark, Share2, Link2 } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { BlogPost, formatDate, calculateReadingTime } from '../lib/blogService';
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface BlogCardProps {
  post: BlogPost;
  onReadMore: (slug: string) => void;
}

export const BlogCard = ({ post, onReadMore }: BlogCardProps) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const readingTime = post.reading_time || (post.content ? calculateReadingTime(post.content) : null);

  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      if (!user || !post?.id) return;
      try {
        const [likeRes, bookmarkRes] = await Promise.all([
          supabase.from('blog_post_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
          supabase.from('blog_bookmarks').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
        ]);
        if (cancelled) return;
        setLiked(!!likeRes.data);
        setBookmarked(!!bookmarkRes.data);
      } catch {
        /* ignore */
      }
    };
    loadStatus();
    return () => { cancelled = true; };
  }, [user?.id, post?.id]);

  const requireAuthedClient = async () => {
    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token available');
    return createAuthenticatedSupabaseClient(token);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Sign In Required', description: 'Please sign in to like posts', variant: 'destructive' });
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    try {
      const client = await requireAuthedClient();
      if (next) {
        const { error } = await client.from('blog_post_likes').insert({ post_id: post.id, user_id: user.id });
        if (error && error.code !== '23505') throw error;
      } else {
        const { error } = await client.from('blog_post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error('BlogCard like error:', err);
      setLiked(!next);
      toast({ title: 'Error', description: 'Failed to update like', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Sign In Required', description: 'Please sign in to bookmark posts', variant: 'destructive' });
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const client = await requireAuthedClient();
      if (next) {
        const { error } = await client.from('blog_bookmarks').insert({ post_id: post.id, user_id: user.id });
        if (error && error.code !== '23505') throw error;
      } else {
        const { error } = await client.from('blog_bookmarks').delete().eq('post_id', post.id).eq('user_id', user.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error('BlogCard bookmark error:', err);
      setBookmarked(!next);
      toast({ title: 'Error', description: 'Failed to update bookmark', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const shareUrl = `${window.location.origin}/blog/${post.slug}`;
  const shareText = `Check out: ${post.title}`;

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`; break;
      case 'whatsapp': url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`; break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).catch(() => {});
        setShowShare(false);
        return;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
    setShowShare(false);
  };

  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {post.featured_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {post.category && (
            <div 
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: post.category.color || '#000000' }}
            >
              {post.category.name}
            </div>
          )}
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="font-medium">{post.author.display_name}</span>
            </div>
          )}
          {post.published_at && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.published_at)}</span>
            </div>
          )}
          {readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{readingTime} min read</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer font-comfortaa">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow font-roboto">
            {post.excerpt}
          </p>
        )}

        {/* Action bar: Like, Share, Read More */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={() => onReadMore(post.slug)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={busy}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              disabled={busy}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400'}`} />
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShare(!showShare)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4 text-gray-400" />
              </button>
              {showShare && (
                <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20 min-w-[140px]">
                  <button onClick={() => handleShare('facebook')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-xs">Facebook</button>
                  <button onClick={() => handleShare('twitter')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-xs">Twitter / X</button>
                  <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-xs">WhatsApp</button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => handleShare('copy')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-xs flex items-center gap-1"><Link2 className="w-3 h-3" /> Copy Link</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mt-2">
            {post.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
