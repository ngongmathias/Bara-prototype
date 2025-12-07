import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

interface RSSFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

interface RSSFeedsProps {
  countryName?: string;
  countryCode?: string;
}

export const RSSFeeds = ({ countryName, countryCode }: RSSFeedsProps) => {
  const [feeds, setFeeds] = useState<RSSFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeds();
  }, [countryName, countryCode]);

  const fetchFeeds = async () => {
    setLoading(true);
    
    // Simulate RSS feed fetching with mock data
    // In production, you'd fetch from actual RSS feeds or a backend API
    setTimeout(() => {
      const mockFeeds: RSSFeedItem[] = [
        {
          title: `${countryName || 'Africa'}: Economic Growth Reaches New Heights`,
          link: '#',
          description: `Latest economic indicators show strong growth across ${countryName || 'African nations'} with increased investment in technology and infrastructure.`,
          pubDate: new Date().toISOString(),
          source: 'Africa Business News',
        },
        {
          title: `${countryName || 'African'} Tech Startups Attract Record Funding`,
          link: '#',
          description: `Venture capital firms invest heavily in ${countryName || 'African'} technology companies, signaling confidence in the region's innovation ecosystem.`,
          pubDate: new Date(Date.now() - 3600000).toISOString(),
          source: 'Tech Africa',
        },
        {
          title: `Cultural Festival Celebrates ${countryName || 'African'} Heritage`,
          link: '#',
          description: `Annual cultural celebration brings together communities to showcase ${countryName || 'African'} traditions, music, and cuisine.`,
          pubDate: new Date(Date.now() - 7200000).toISOString(),
          source: 'Culture Today',
        },
        {
          title: `${countryName || 'African'} Tourism Industry Shows Strong Recovery`,
          link: '#',
          description: `Travel and tourism sector in ${countryName || 'Africa'} rebounds with increased visitor numbers and new hospitality developments.`,
          pubDate: new Date(Date.now() - 10800000).toISOString(),
          source: 'Travel Weekly',
        },
        {
          title: `Education Initiatives Transform ${countryName || 'African'} Schools`,
          link: '#',
          description: `New educational programs and digital learning platforms expand access to quality education across ${countryName || 'the region'}.`,
          pubDate: new Date(Date.now() - 14400000).toISOString(),
          source: 'Education Africa',
        },
      ];
      
      setFeeds(mockFeeds);
      setLoading(false);
    }, 1000);
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
          onClick={fetchFeeds}
          className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
