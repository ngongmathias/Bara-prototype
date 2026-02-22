import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  DollarSign,
  Coins,
  TrendingUp,
  Users,
  ShoppingBag,
  Ticket,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  MousePointer,
} from 'lucide-react';

interface RevenueStats {
  totalCoinsPurchased: number;
  totalCoinsSpent: number;
  totalCoinsInCirculation: number;
  totalUsers: number;
  premiumListings: number;
  bannerImpressions: number;
  bannerClicks: number;
  bannerCTR: number;
  bannerRevenue: number;
  activeProUsers: number;
  activeEliteUsers: number;
}

interface RecentTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  reason: string;
  created_at: string;
}

export default function AdminRevenue() {
  const [stats, setStats] = useState<RevenueStats>({
    totalCoinsPurchased: 0,
    totalCoinsSpent: 0,
    totalCoinsInCirculation: 0,
    totalUsers: 0,
    premiumListings: 0,
    bannerImpressions: 0,
    bannerClicks: 0,
    bannerCTR: 0,
    bannerRevenue: 0,
    activeProUsers: 0,
    activeEliteUsers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch gamification profiles aggregate
      const { data: profiles } = await supabase
        .from('gamification_profiles')
        .select('bara_coins, total_xp');

      const totalCoinsInCirculation = profiles?.reduce((sum, p) => sum + (p.bara_coins || 0), 0) || 0;
      const totalUsers = profiles?.length || 0;

      // Fetch coin gain history (purchases + rewards)
      const { data: coinGains } = await supabase
        .from('gamification_history')
        .select('amount')
        .eq('type', 'coin_gain');

      const totalCoinsPurchased = coinGains?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Fetch coin spend history
      const { data: coinSpends } = await supabase
        .from('gamification_history')
        .select('amount')
        .eq('type', 'coin_spend');

      const totalCoinsSpent = coinSpends?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;

      // Fetch premium marketplace listings
      const { count: premiumListings } = await supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      // Fetch banner analytics
      const { data: bannerAnalytics } = await supabase
        .from('sponsored_banner_analytics')
        .select('event_type');

      const bannerImpressions = bannerAnalytics?.filter(a => a.event_type === 'impression').length || 0;
      const bannerClicks = bannerAnalytics?.filter(a => a.event_type === 'click').length || 0;
      const bannerCTR = bannerImpressions > 0 ? (bannerClicks / bannerImpressions) * 100 : 0;

      // Fetch monetization stats for revenue
      const { data: monetizationData } = await supabase
        .from('monetization_stats')
        .select('total_cost')
        .eq('item_type', 'banner');

      const bannerRevenue = monetizationData?.reduce((sum, d) => sum + (d.total_cost || 0), 0) || 0;

      // Fetch recent transactions
      const { data: recent } = await supabase
        .from('gamification_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setStats({
        totalCoinsPurchased,
        totalCoinsSpent,
        totalCoinsInCirculation,
        totalUsers,
        premiumListings: premiumListings || 0,
        bannerImpressions,
        bannerClicks,
        bannerCTR,
        bannerRevenue,
        activeProUsers: 0,
        activeEliteUsers: 0,
      });

      setRecentTransactions(recent || []);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    {
      title: 'Coins in Circulation',
      value: stats.totalCoinsInCirculation.toLocaleString(),
      icon: Coins,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      subtitle: `${stats.totalCoinsPurchased.toLocaleString()} earned · ${stats.totalCoinsSpent.toLocaleString()} spent`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      subtitle: `${stats.activeProUsers} Pro · ${stats.activeEliteUsers} Elite`,
    },
    {
      title: 'Banner Ad Revenue',
      value: `$${stats.bannerRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      subtitle: `${stats.bannerImpressions.toLocaleString()} impressions`,
    },
    {
      title: 'Banner CTR',
      value: `${stats.bannerCTR.toFixed(2)}%`,
      icon: MousePointer,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      subtitle: `${stats.bannerClicks.toLocaleString()} clicks`,
    },
    {
      title: 'Premium Listings',
      value: stats.premiumListings.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      subtitle: '50 coins each',
    },
    {
      title: 'Estimated Coin Value',
      value: `$${((stats.totalCoinsPurchased * 0.01)).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      subtitle: 'Based on $0.01/coin avg',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform monetization overview and analytics</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">{card.title}</span>
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-black text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Streams Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Streams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Revenue Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Banner Advertising', value: stats.bannerRevenue, status: 'active' },
                { name: 'Premium Marketplace Boosts', value: stats.premiumListings * 50 * 0.01, status: 'active' },
                { name: 'Bara Pro Subscriptions', value: stats.activeProUsers * 5, status: stats.activeProUsers > 0 ? 'active' : 'pending' },
                { name: 'Bara Elite Subscriptions', value: stats.activeEliteUsers * 20, status: stats.activeEliteUsers > 0 ? 'active' : 'pending' },
                { name: 'Event Ticket Commissions', value: 0, status: 'pending' },
                { name: 'Marketplace Commissions', value: 0, status: 'pending' },
              ].map((stream) => (
                <div key={stream.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${stream.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-gray-700">{stream.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">${stream.value.toFixed(2)}</span>
                    <Badge variant={stream.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {stream.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="w-5 h-5" />
              Recent Coin Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{tx.reason}</p>
                      <p className="text-[10px] text-gray-400">
                        {tx.user_id.slice(0, 8)}… · {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                      {tx.type === 'coin_gain' ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-sm font-bold ${tx.type === 'coin_gain' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'coin_gain' ? '+' : '-'}{Math.abs(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Banner Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Banner Ad Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{stats.bannerImpressions.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{stats.bannerClicks.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{stats.bannerCTR.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Click-Through Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-600">${stats.bannerRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
