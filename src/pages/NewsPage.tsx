import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, RefreshCw, Search, Globe, Clock, TrendingUp, Filter } from 'lucide-react';
import { getRSSFeeds, refreshRSSFeeds, RSSFeedItem } from '@/lib/rssService';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { DiscoverMore } from '@/components/DiscoverMore';
import { PullToRefresh } from '@/components/PullToRefresh';

/** Strip HTML tags from RSS feed descriptions */
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function NewsPage() {
  const { selectedCountry } = useCountrySelection();
  const [feeds, setFeeds] = useState<RSSFeedItem[]>([]);
  const [allFeeds, setAllFeeds] = useState<RSSFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchFeeds();
  }, [selectedCountry]);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const cachedFeeds = await Promise.race([
        getRSSFeeds({
          countryCode: selectedCountry?.code,
          limit: 50,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]).catch(() => [] as RSSFeedItem[]);

      setAllFeeds(cachedFeeds);
      setFeeds(cachedFeeds);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await Promise.race([
        refreshRSSFeeds(),
        new Promise<{ success: false; itemsAdded: 0 }>((resolve) =>
          setTimeout(() => resolve({ success: false, itemsAdded: 0 }), 20000)
        )
      ]);

      if (result.success) {
        await fetchFeeds();
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter feeds by search and source
  useEffect(() => {
    let filtered = allFeeds;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.title.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
      );
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(f => f.source === selectedSource);
    }

    setFeeds(filtered);
  }, [searchQuery, selectedSource, allFeeds]);

  const sources = [...new Set(allFeeds.map(f => f.source))].sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const featuredFeed = feeds.length > 0 ? feeds[0] : null;
  const remainingFeeds = feeds.slice(1);

  return (
    <MainLayout>
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-10 h-10" />
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">BARA News</h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl">
              Stay informed with the latest news from across Africa and the diaspora. 
              Curated from trusted sources, updated daily.
            </p>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news..."
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm"
              >
                <option value="all" className="text-black">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source} className="text-black">{source}</option>
                ))}
              </select>

              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {selectedCountry?.name || 'All Countries'}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {feeds.length} articles
              </span>
              <span className="flex items-center gap-1">
                <Filter className="w-4 h-4" />
                {sources.length} sources
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : feeds.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-20 h-20 text-gray-200 mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No news articles found</h2>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Click refresh to fetch the latest news'}
              </p>
              <Button onClick={handleRefresh} disabled={refreshing} className="bg-gray-900 text-white hover:bg-gray-800">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Fetch Latest News
              </Button>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredFeed && (
                <motion.a
                  href={featuredFeed.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="block mb-8 group"
                >
                  <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-white bg-gray-900 px-3 py-1 rounded-full uppercase tracking-wide">
                        Featured
                      </span>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {featuredFeed.source}
                      </span>
                      {featuredFeed.countryName && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {featuredFeed.countryName}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                      {featuredFeed.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3 max-w-3xl">
                      {stripHtml(featuredFeed.description)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(featuredFeed.pubDate)}
                      </span>
                      <span className="text-gray-900 font-medium group-hover:underline flex items-center gap-1">
                        Read full article <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.a>
              )}

              {/* Article Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingFeeds.map((feed, index) => (
                  <motion.a
                    key={feed.id || index}
                    href={feed.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group flex flex-col"
                  >
                    {feed.imageUrl && (
                      <div className="mb-4 -mx-5 -mt-5 overflow-hidden rounded-t-xl">
                        <img
                          loading="lazy" src={feed.imageUrl}
                          alt={feed.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {feed.source}
                      </span>
                      {feed.countryName && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {feed.countryName}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors flex-grow-0">
                      {feed.title}
                    </h3>

                    <p className="text-xs text-gray-500 mb-3 line-clamp-3 flex-grow">
                      {stripHtml(feed.description)}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(feed.pubDate)}
                      </span>
                      <span className="text-gray-900 font-medium group-hover:underline flex items-center gap-1">
                        Read more <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </>
          )}

          {/* Discover More */}
          <div className="mt-16">
            <DiscoverMore exclude={['news']} />
          </div>
        </div>
      </div>
      </PullToRefresh>
    </MainLayout>
  );
}
