import { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Heart, Share2, Link2 } from 'lucide-react';
import { BlogPost, formatDate, calculateReadingTime } from '../lib/blogService';

interface BlogCardProps {
  post: BlogPost;
  onReadMore: (slug: string) => void;
}

export const BlogCard = ({ post, onReadMore }: BlogCardProps) => {
  const [liked, setLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const readingTime = post.reading_time || (post.content ? calculateReadingTime(post.content) : null);

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
              onClick={() => setLiked(!liked)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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
