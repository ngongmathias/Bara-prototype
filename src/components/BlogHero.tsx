import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { BlogPost, formatDate } from '../lib/blogService';

interface BlogHeroProps {
  post: BlogPost;
  onReadMore: (slug: string) => void;
}

export const BlogHero = ({ post, onReadMore }: BlogHeroProps) => {
  return (
    <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-xl mb-12">
      {post.featured_image && (
        <div className="absolute inset-0">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        </div>
      )}
      
      <div className="relative z-10 px-8 py-16 md:px-16 md:py-24">
        <div className="max-w-4xl">
          {post.category && (
            <div 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium text-white mb-4"
              style={{ backgroundColor: post.category.color || '#000000' }}
            >
              {post.category.name}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-comfortaa leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-3xl font-roboto">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-8">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.display_name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="font-medium text-white">{post.author.display_name}</span>
              </div>
            )}
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            )}
            {post.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time} min read</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onReadMore(post.slug)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Read Full Article
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
