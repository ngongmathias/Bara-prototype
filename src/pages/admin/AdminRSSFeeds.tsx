import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAdminDb } from '@/lib/supabase';
import { refreshRSSFeeds, getRSSFeedSources } from '@/lib/rssService';
import {
  RefreshCw,
  Newspaper,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  Calendar
} from 'lucide-react';

export const AdminRSSFeeds = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<any[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalSources: 0, totalFeeds: 0, activeSources: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const db = getAdminDb();

      // Fetch sources
      const { data: sourcesData, error: sourcesError } = await db
        .rss_feed_sources()
        .select('*')
        .order('country_name');

      if (sourcesError) throw sourcesError;

      // Fetch recent feeds
      const { data: feedsData, error: feedsError } = await db
        .rss_feeds()
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(50);

      if (feedsError) throw feedsError;

      setSources(sourcesData || []);
      setFeeds(feedsData || []);

      // Calculate stats
      setStats({
        totalSources: sourcesData?.length || 0,
        activeSources: sourcesData?.filter(s => s.is_active).length || 0,
        totalFeeds: feedsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching RSS data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch RSS data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshFeeds = async () => {
    try {
      setRefreshing(true);
      toast({
        title: 'Refreshing Feeds',
        description: 'Fetching latest news from all sources...',
      });

      const result = await refreshRSSFeeds();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Added ${result.itemsAdded} new articles`,
        });
        fetchData(); // Refresh the data
      } else {
        toast({
          title: 'Refresh Complete',
          description: 'Some feeds may have failed to update',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh RSS feeds',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSourceActive = async (sourceId: string, currentStatus: boolean) => {
    try {
      const db = getAdminDb();
      const { error } = await db
        .rss_feed_sources()
        .update({ is_active: !currentStatus })
        .eq('id', sourceId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Source ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error toggling source:', error);
      toast({
        title: 'Error',
        description: 'Failed to update source',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout title="RSS Feeds Management" subtitle="Manage news sources and feeds">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-roboto">Total Sources</p>
                  <p className="text-3xl font-comfortaa font-bold">{stats.totalSources}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-roboto">Active Sources</p>
                  <p className="text-3xl font-comfortaa font-bold">{stats.activeSources}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-roboto">Cached Articles</p>
                  <p className="text-3xl font-comfortaa font-bold">{stats.totalFeeds}</p>
                </div>
                <Newspaper className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-comfortaa font-semibold mb-1">Refresh All Feeds</h3>
                <p className="text-sm text-gray-600 font-roboto">
                  Fetch latest news from all active sources
                </p>
              </div>
              <Button
                onClick={handleRefreshFeeds}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RSS Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="font-comfortaa">RSS Feed Sources</CardTitle>
            <CardDescription className="font-roboto">
              Manage news sources by country
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 font-roboto">Loading sources...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-comfortaa font-semibold">{source.name}</h4>
                        {source.country_name && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-roboto">
                            {source.country_name}
                          </span>
                        )}
                        {source.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-roboto mt-1">{source.url}</p>
                      {source.last_fetched_at && (
                        <p className="text-xs text-gray-400 font-roboto mt-1">
                          Last fetched: {formatDate(source.last_fetched_at)}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => toggleSourceActive(source.id, source.is_active)}
                      variant="outline"
                      size="sm"
                    >
                      {source.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Feeds */}
        <Card>
          <CardHeader>
            <CardTitle className="font-comfortaa">Recent Articles</CardTitle>
            <CardDescription className="font-roboto">
              Latest cached news articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 font-roboto">Loading articles...</p>
              </div>
            ) : feeds.length === 0 ? (
              <div className="text-center py-8">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-roboto mb-4">No articles cached yet</p>
                <Button onClick={handleRefreshFeeds} disabled={refreshing}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fetch Articles
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {feeds.slice(0, 20).map((feed) => (
                  <div
                    key={feed.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-roboto">
                            {feed.source}
                          </span>
                          {feed.country_name && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-roboto">
                              {feed.country_name}
                            </span>
                          )}
                        </div>
                        <h4 className="font-comfortaa font-semibold mb-1">{feed.title}</h4>
                        <p className="text-sm text-gray-600 font-roboto mb-2 line-clamp-2">
                          {feed.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 font-roboto">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(feed.pub_date)}
                          </span>
                        </div>
                      </div>
                      <a
                        href={feed.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-roboto"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
