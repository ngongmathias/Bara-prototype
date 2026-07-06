import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Flame, Star, Coins, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getPrestigeTier, GamificationService, DEFAULT_ECONOMY_SETTINGS } from '@/lib/gamificationService';
import { SEO } from '@/components/SEO';

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  current_level: number;
  bara_coins: number;
  daily_streak: number;
  display_name?: string;
  avatar_url?: string;
}

type Tab = 'xp' | 'coins' | 'streak';
type Period = 'week' | 'month' | 'all';

const TABS: { key: Tab; label: string; icon: typeof Trophy }[] = [
  { key: 'xp', label: 'Top XP', icon: TrendingUp },
  { key: 'coins', label: 'Most Coins', icon: Coins },
  { key: 'streak', label: 'Longest Streak', icon: Flame },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All-time' },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>;
}

function getPrestigeColor(level: number): string {
  const tier = getPrestigeTier(level);
  switch (tier) {
    case 'Diamond': return 'bg-gradient-to-r from-blue-400 to-cyan-300 text-white';
    case 'Gold': return 'bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900';
    case 'Silver': return 'bg-gradient-to-r from-gray-300 to-gray-200 text-gray-800';
    case 'Bronze': return 'bg-gradient-to-r from-amber-600 to-amber-400 text-white';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>('xp');
  const [period, setPeriod] = useState<Period>('week');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [lastWeekTop, setLastWeekTop] = useState<Set<string>>(new Set());
  const [prizes, setPrizes] = useState<{ rank1: number; rank2: number; rank3: number; rank4to10: number }>({
    rank1: DEFAULT_ECONOMY_SETTINGS['leaderboard.rank1_coins'].value,
    rank2: DEFAULT_ECONOMY_SETTINGS['leaderboard.rank2_coins'].value,
    rank3: DEFAULT_ECONOMY_SETTINGS['leaderboard.rank3_coins'].value,
    rank4to10: DEFAULT_ECONOMY_SETTINGS['leaderboard.rank4to10_coins'].value,
  });

  // Last completed week's top 10 — get a cosmetic crown across all views AND
  // their coin prizes (27.8.7). The payout RPC is idempotent server-side, so
  // this lazy fire-and-forget call is the weekly trigger (pg_cron is backup).
  useEffect(() => {
    GamificationService.runLeaderboardPayout();
    supabase
      .rpc('leaderboard_last_week_top', { p_limit: 10 })
      .then(({ data }) => setLastWeekTop(new Set((data || []).map((r: any) => r.user_id))))
      .catch(() => {});
    GamificationService.getEconomySettings().then((s) =>
      setPrizes({
        rank1: s['leaderboard.rank1_coins'],
        rank2: s['leaderboard.rank2_coins'],
        rank3: s['leaderboard.rank3_coins'],
        rank4to10: s['leaderboard.rank4to10_coins'],
      })
    );
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Streak tab ignores period (streak is inherently a running state)
        if (tab === 'streak' || period === 'all') {
          const orderCol = tab === 'xp' ? 'total_xp' : tab === 'coins' ? 'bara_coins' : 'daily_streak';
          const { data, error } = await supabase
            .from('gamification_profiles')
            .select('user_id, total_xp, current_level, bara_coins, daily_streak')
            .order(orderCol, { ascending: false })
            .limit(50);
          if (error) throw error;
          setEntries(data || []);
          if (user?.id && data) {
            const idx = data.findIndex((e) => e.user_id === user.id);
            setUserRank(idx >= 0 ? idx + 1 : null);
          }
          return;
        }

        // This week (Monday-anchored) / this month — aggregated server-side by
        // the leaderboard_period RPC (weekly season resets every Monday).
        const since = new Date();
        if (period === 'week') {
          const day = since.getDay(); // 0=Sun … 6=Sat
          const backToMonday = day === 0 ? 6 : day - 1;
          since.setDate(since.getDate() - backToMonday);
          since.setHours(0, 0, 0, 0);
        } else {
          since.setDate(since.getDate() - 30);
        }
        const historyType = tab === 'xp' ? 'xp_gain' : 'coin_gain';

        const { data, error } = await supabase.rpc('leaderboard_period', {
          p_type: historyType,
          p_since: since.toISOString(),
          p_limit: 50,
        });
        if (error) throw error;

        const ranked: LeaderboardEntry[] = (data || []).map((r: any) => ({
          user_id: r.user_id,
          total_xp: tab === 'xp' ? Number(r.period_total) : Number(r.total_xp),
          current_level: r.current_level,
          bara_coins: tab === 'coins' ? Number(r.period_total) : Number(r.bara_coins),
          daily_streak: r.daily_streak,
        }));

        setEntries(ranked);
        if (user?.id) {
          const idx = ranked.findIndex((e) => e.user_id === user.id);
          setUserRank(idx >= 0 ? idx + 1 : null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [tab, period, user]);

  const getValue = (entry: LeaderboardEntry) => {
    if (tab === 'xp') return `${entry.total_xp.toLocaleString()} XP`;
    if (tab === 'coins') return `${entry.bara_coins.toLocaleString()} coins`;
    return `${entry.daily_streak} days`;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Leaderboard | Bara Afrika"
        description="See who's leading on Bara Afrika. Top XP earners, coin holders, and streak champions."
        keywords={['Leaderboard', 'Rankings', 'XP', 'Bara Coins', 'Streak']}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Trophy className="w-4 h-4" />
            {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'All-time'} Leaderboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-3">
            Top Community Members
          </h1>
          <p className="text-lg text-gray-600 font-roboto">
            Compete, earn, and climb the ranks. Updated weekly.
          </p>
        </div>

        {/* Weekly prizes (27.8.7) */}
        <Card className="mb-8 bg-gray-900 text-white border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5" />
              <h2 className="font-black font-comfortaa text-lg">Weekly prizes</h2>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Every Monday, last week's top 10 XP earners are paid Bara Coins automatically — on top of the Champ crown.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Rank 1', coins: prizes.rank1 },
                { label: 'Rank 2', coins: prizes.rank2 },
                { label: 'Rank 3', coins: prizes.rank3 },
                { label: 'Ranks 4–10', coins: prizes.rank4to10 },
              ].map((p) => (
                <div key={p.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{p.label}</div>
                  <div className="text-xl font-black flex items-center justify-center gap-1">
                    <Coins className="w-4 h-4" /> {Number(p.coins || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Rank */}
        {user && userRank && (
          <Card className="mb-8 border-2 border-purple-200 bg-purple-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Rank</p>
                  <p className="text-xl font-black text-gray-900">#{userRank}</p>
                </div>
              </div>
              <Badge className={`${getPrestigeColor(entries.find(e => e.user_id === user.id)?.current_level || 1)} font-bold px-3 py-1`}>
                {getPrestigeTier(entries.find(e => e.user_id === user.id)?.current_level || 1)}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={tab === key ? 'default' : 'outline'}
              onClick={() => setTab(key)}
              className={`flex-1 ${tab === key ? 'bg-black text-white' : ''}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Period selector (hidden for streak — streak is a running state) */}
        {tab !== 'streak' && (
          <div className="flex gap-2 mb-6">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition ${
                  period === p.key
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              {tab === 'xp' ? 'XP Rankings' : tab === 'coins' ? 'Coin Rankings' : 'Streak Rankings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No leaderboard data yet. Be the first to earn XP!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {entries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser = user?.id === entry.user_id;
                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition ${isCurrentUser ? 'bg-purple-50 ring-1 ring-purple-200' : rank <= 3 ? 'bg-gray-50/50' : ''}`}
                    >
                      <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                        {entry.user_id.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
                            {isCurrentUser ? 'You' : `User ${entry.user_id.slice(0, 6)}`}
                          </p>
                          {lastWeekTop.has(entry.user_id) && (
                            <span title="Last week's Top 10 champion" className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                              <Crown className="w-3 h-3" /> Champ
                            </span>
                          )}
                          <Badge className={`${getPrestigeColor(entry.current_level)} text-[10px] px-1.5 py-0`}>
                            Lv.{entry.current_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {getPrestigeTier(entry.current_level)} Tier
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{getValue(entry)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
