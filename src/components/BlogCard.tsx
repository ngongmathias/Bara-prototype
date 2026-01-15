import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { BlogPost, formatDate } from '../lib/blogService';

interface BlogCardProps {
  post: BlogPost;
  onReadMore: (slug: string) => void;
}

export const BlogCard = ({ post, onReadMore }: BlogCardProps) => {
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
          {post.reading_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.reading_time} min read</span>
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

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={() => onReadMore(post.slug)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </button>

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
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
      </div>
    </article>
  );
};
