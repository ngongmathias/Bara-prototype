import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { getRSSFeeds, refreshRSSFeeds, RSSFeedItem } from '@/lib/rssService';

interface RSSFeedsProps {
  countryName?: string;
  countryCode?: string;
}

export const RSSFeeds = ({ countryName, countryCode }: RSSFeedsProps) => {
  const [feeds, setFeeds] = useState<RSSFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeeds();
  }, [countryName, countryCode]);

  const fetchFeeds = async () => {
    setLoading(true);
    
    try {
      // Fetch cached RSS feeds from database
      const cachedFeeds = await getRSSFeeds({
        countryCode: countryCode,
        limit: 6,
      });
      
      if (cachedFeeds.length > 0) {
        setFeeds(cachedFeeds);
        setLoading(false);
      } else {
        // If no cached feeds, try to refresh
        await handleRefresh();
      }
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Refresh feeds from sources
      const result = await refreshRSSFeeds();
      
      if (result.success) {
        // Fetch updated feeds
        const updatedFeeds = await getRSSFeeds({
          countryCode: countryCode,
          limit: 6,
        });
        setFeeds(updatedFeeds);
      }
    } catch (error) {
      console.error('Error refreshing RSS feeds:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-black" />
          <h2 className="text-2xl font-bold text-black">
            {countryName ? `${countryName} News` : 'Latest News'}
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || refreshing}
          title="Refresh news from sources"
        >
          <RefreshCw className={`w-5 h-5 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeds.map((feed, index) => (
            <motion.a
              key={index}
              href={feed.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-black group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {feed.source}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </div>
              
              <h3 className="text-sm font-bold text-black mb-2 line-clamp-2 group-hover:text-gray-700">
                {feed.title}
              </h3>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                {feed.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatDate(feed.pubDate)}</span>
                <span className="text-black font-medium group-hover:underline">Read more →</span>
              </div>
            </motion.a>
          ))}
        </div>
      )}

      {!loading && feeds.length === 0 && (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No news available at the moment</p>
        </div>
      )}
    </div>
  );
};
