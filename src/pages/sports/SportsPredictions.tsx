import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { useFixtures } from '../../hooks/useLiveScores';
import { GamificationService } from '@/lib/gamificationService';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import type { Match } from '../../types/sports';
import {
  Trophy,
  Coins,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';

type PredictionChoice = 'home' | 'draw' | 'away';

interface Prediction {
  id?: string;
  user_id: string;
  fixture_id: number;
  prediction: PredictionChoice;
  coins_bet: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  payout: number;
  created_at?: string;
  home_team: string;
  away_team: string;
  match_date: string;
}

const BET_AMOUNTS = [5, 10, 25, 50];

const ODDS: Record<PredictionChoice, number> = {
  home: 1.8,
  draw: 3.2,
  away: 2.5,
};

export default function SportsPredictions() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { profile } = useGamification();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activeBets, setActiveBets] = useState<Record<number, { choice: PredictionChoice; amount: number }>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([]);
  const [activeTab, setActiveTab] = useState<'predict' | 'my-bets' | 'leaderboard'>('predict');
  const [predictionLeaderboard, setPredictionLeaderboard] = useState<any[]>([]);

  const { data: fixtures, isLoading, error: fixturesError } = useFixtures({
    date: selectedDate,
    enabled: true,
  });

  const errorType = fixturesError?.message?.startsWith('SPORTS_API_') ? fixturesError.message : null;
  const isApiUnavailable = !!errorType || !!fixturesError;

  const getErrorMessage = () => {
    switch (errorType) {
      case 'SPORTS_API_NO_KEY':
        return { title: 'Sports API Not Configured', desc: 'The sports data API key has not been set up yet. Contact the admin to configure VITE_API_FOOTBALL_KEY.' };
      case 'SPORTS_API_SUSPENDED':
        return { title: 'Account Being Upgraded', desc: 'Our sports data provider account is being upgraded. Match predictions will be back shortly!' };
      case 'SPORTS_API_NETWORK_ERROR':
        return { title: 'Connection Issue', desc: 'Unable to reach the sports data server. This may be a temporary network issue — please try again in a moment.' };
      case 'SPORTS_API_FORBIDDEN':
        return { title: 'Access Denied', desc: 'The sports API key may be invalid or expired. Please contact support.' };
      case 'SPORTS_API_RATE_LIMITED':
        return { title: 'Too Many Requests', desc: 'We\'ve hit the daily request limit. Predictions will refresh tomorrow — check back soon!' };
      case 'SPORTS_API_INVALID_KEY':
        return { title: 'Invalid API Key', desc: 'The sports data API key is not recognized. Please contact the admin.' };
      default:
        return { title: 'Sports Data Temporarily Unavailable', desc: 'Unable to load match data right now. Please try again later.' };
    }
  };

  // Fetch user's predictions
  useEffect(() => {
    if (user) fetchMyPredictions();
  }, [user]);

  const fetchMyPredictions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sports_predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setMyPredictions(data || []);
  };

  // Fetch prediction leaderboard
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('sports_predictions')
      .select('user_id, payout, status')
      .eq('status', 'won');

    if (data) {
      const userWins: Record<string, { wins: number; totalPayout: number }> = {};
      data.forEach((p: any) => {
        if (!userWins[p.user_id]) userWins[p.user_id] = { wins: 0, totalPayout: 0 };
        userWins[p.user_id].wins++;
        userWins[p.user_id].totalPayout += p.payout || 0;
      });
      const sorted = Object.entries(userWins)
        .map(([userId, stats]) => ({ userId, ...stats }))
        .sort((a, b) => b.totalPayout - a.totalPayout)
        .slice(0, 20);
      setPredictionLeaderboard(sorted);
    }
  };

  const handleSelectChoice = (fixtureId: number, choice: PredictionChoice) => {
    setActiveBets((prev) => ({
      ...prev,
      [fixtureId]: { choice, amount: prev[fixtureId]?.amount || 10 },
    }));
  };

  const handleSelectAmount = (fixtureId: number, amount: number) => {
    setActiveBets((prev) => ({
      ...prev,
      [fixtureId]: { ...prev[fixtureId], amount },
    }));
  };

  const handlePlaceBet = async (match: Match) => {
    if (!user || !isSignedIn) {
      navigate('/user/sign-in');
      return;
    }

    const bet = activeBets[match.fixture.id];
    if (!bet) return;

    if (!profile || profile.bara_coins < bet.amount) {
      toast({
        title: 'Not enough coins',
        description: `You need ${bet.amount} coins but have ${profile?.bara_coins || 0}. Earn more or visit the Coin Store!`,
        variant: 'destructive',
      });
      return;
    }

    // Check if already predicted this match
    const existing = myPredictions.find((p) => p.fixture_id === match.fixture.id);
    if (existing) {
      toast({
        title: 'Already predicted',
        description: 'You already placed a prediction on this match.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(match.fixture.id);

    // Spend coins
    const spent = await GamificationService.spendCoins(
      user.id,
      bet.amount,
      `Sports prediction: ${match.teams.home.name} vs ${match.teams.away.name}`
    );

    if (!spent) {
      toast({ title: 'Error', description: 'Failed to place bet.', variant: 'destructive' });
      setSubmitting(null);
      return;
    }

    const payout = Math.round(bet.amount * ODDS[bet.choice] * 10) / 10;

    // Save prediction
    const { error } = await supabase.from('sports_predictions').insert({
      user_id: user.id,
      fixture_id: match.fixture.id,
      prediction: bet.choice,
      coins_bet: bet.amount,
      payout,
      status: 'pending',
      home_team: match.teams.home.name,
      away_team: match.teams.away.name,
      match_date: match.fixture.date,
    });

    if (error) {
      // Refund coins
      await GamificationService.addCoins(user.id, bet.amount, 'Prediction refund (save failed)');
      toast({ title: 'Error', description: 'Failed to save prediction.', variant: 'destructive' });
    } else {
      toast({
        title: 'Prediction Placed!',
        description: `${bet.amount} coins on ${bet.choice === 'home' ? match.teams.home.name : bet.choice === 'away' ? match.teams.away.name : 'Draw'}. Potential payout: ${payout} coins!`,
      });
      // Refresh
      fetchMyPredictions();
      setActiveBets((prev) => {
        const next = { ...prev };
        delete next[match.fixture.id];
        return next;
      });
    }

    setSubmitting(null);
  };

  // Date navigation
  const dateOptions = [];
  for (let i = -1; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dateOptions.push({
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    });
  }

  // Only show matches that haven't started yet (NS = Not Started)
  const upcomingMatches = (fixtures || []).filter(
    (m: Match) => m.fixture.status.short === 'NS' || m.fixture.status.short === 'TBD'
  );

  const alreadyPredicted = new Set(myPredictions.map((p) => p.fixture_id));

  const stats = {
    total: myPredictions.length,
    won: myPredictions.filter((p) => p.status === 'won').length,
    lost: myPredictions.filter((p) => p.status === 'lost').length,
    pending: myPredictions.filter((p) => p.status === 'pending').length,
    totalWinnings: myPredictions.filter((p) => p.status === 'won').reduce((sum, p) => sum + (p.payout || 0), 0),
  };

  return (
    <MainLayout>
      <SEO
        title="Sports Predictions | Bara Afrika"
        description="Predict match outcomes and win Bara Coins! Place your bets on upcoming football matches."
        keywords={['Sports Predictions', 'Football Betting', 'Bara Coins', 'Match Predictions']}
      />
      <div className="min-h-screen bg-gray-50">
        <SportsTopBanner />
        <SportsSubNav />

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black font-comfortaa text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Match Predictions
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Predict outcomes and win Bara Coins!
              </p>
            </div>
            {profile && (
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm">
                <Coins className="w-4 h-4" />
                {profile.bara_coins} coins
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
            {[
              { id: 'predict' as const, label: 'Predict', icon: Target },
              { id: 'my-bets' as const, label: 'My Bets', icon: Trophy },
              { id: 'leaderboard' as const, label: 'Top Predictors', icon: Flame },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Predict Tab */}
          {activeTab === 'predict' && (
            <>
              {/* Date Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {dateOptions.map((d) => (
                  <button
                    key={d.full}
                    onClick={() => setSelectedDate(d.full)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-center transition-all ${
                      selectedDate === d.full
                        ? 'bg-black text-white font-bold'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
                    }`}
                  >
                    <div className="text-xs">{d.day}</div>
                    <div className="text-sm font-bold">{d.date}</div>
                  </button>
                ))}
              </div>

              {isApiUnavailable && !isLoading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-orange-200">
                  <Zap className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-700 mb-2">{getErrorMessage().title}</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                    {getErrorMessage().desc}
                  </p>
                  <p className="text-xs text-gray-400">You can still view your existing bets in the "My Bets" tab.</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Loading matches...</p>
                </div>
              ) : upcomingMatches.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-700 mb-1">No upcoming matches</h3>
                  <p className="text-sm text-gray-500">Try selecting a different date to find matches to predict.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMatches.map((match: Match) => {
                    const bet = activeBets[match.fixture.id];
                    const predicted = alreadyPredicted.has(match.fixture.id);
                    const matchTime = new Date(match.fixture.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Card key={match.fixture.id} className={`overflow-hidden ${predicted ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          {/* League & Time */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {match.league.logo && (
                                <img src={match.league.logo} alt="" className="w-4 h-4" />
                              )}
                              <span className="text-xs text-gray-500 font-medium">
                                {match.league.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">{matchTime}</span>
                          </div>

                          {/* Teams */}
                          <div className="grid grid-cols-3 items-center gap-2 mb-4">
                            <div className="text-center">
                              {match.teams.home.logo && (
                                <img src={match.teams.home.logo} alt="" className="w-10 h-10 mx-auto mb-1" />
                              )}
                              <p className="text-xs font-bold text-gray-800 truncate">{match.teams.home.name}</p>
                            </div>
                            <div className="text-center">
                              <span className="text-lg font-black text-gray-400">VS</span>
                            </div>
                            <div className="text-center">
                              {match.teams.away.logo && (
                                <img src={match.teams.away.logo} alt="" className="w-10 h-10 mx-auto mb-1" />
                              )}
                              <p className="text-xs font-bold text-gray-800 truncate">{match.teams.away.name}</p>
                            </div>
                          </div>

                          {predicted ? (
                            <div className="text-center py-2 bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                              <p className="text-xs font-bold text-green-700">Prediction placed!</p>
                            </div>
                          ) : (
                            <>
                              {/* Prediction Choices */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {(['home', 'draw', 'away'] as PredictionChoice[]).map((choice) => (
                                  <button
                                    key={choice}
                                    onClick={() => handleSelectChoice(match.fixture.id, choice)}
                                    className={`py-2 rounded-lg text-center transition-all border-2 ${
                                      bet?.choice === choice
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="text-[10px] uppercase font-bold">
                                      {choice === 'home' ? 'Home' : choice === 'away' ? 'Away' : 'Draw'}
                                    </div>
                                    <div className="text-sm font-black">{ODDS[choice]}x</div>
                                  </button>
                                ))}
                              </div>

                              {/* Bet Amount */}
                              {bet?.choice && (
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    {BET_AMOUNTS.map((amt) => (
                                      <button
                                        key={amt}
                                        onClick={() => handleSelectAmount(match.fixture.id, amt)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                          bet.amount === amt
                                            ? 'bg-yellow-400 text-yellow-900'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {amt} <Coins className="w-3 h-3 inline" />
                                      </button>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Potential payout:</span>
                                    <span className="font-bold text-green-600">
                                      {Math.round(bet.amount * ODDS[bet.choice] * 10) / 10} coins
                                    </span>
                                  </div>

                                  <Button
                                    onClick={() => handlePlaceBet(match)}
                                    disabled={submitting === match.fixture.id}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                  >
                                    {submitting === match.fixture.id ? (
                                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing...</>
                                    ) : (
                                      <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Place Prediction ({bet.amount} coins)
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* My Bets Tab */}
          {activeTab === 'my-bets' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total', value: stats.total, color: 'text-gray-900' },
                  { label: 'Won', value: stats.won, color: 'text-green-600' },
                  { label: 'Lost', value: stats.lost, color: 'text-red-600' },
                  { label: 'Winnings', value: `${stats.totalWinnings}`, color: 'text-yellow-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{s.label}</p>
                  </div>
                ))}
              </div>

              {!isSignedIn ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-500 mb-4">Sign in to see your predictions</p>
                  <Button onClick={() => navigate('/user/sign-in')}>Sign In</Button>
                </div>
              ) : myPredictions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-700 mb-1">No predictions yet</h3>
                  <p className="text-sm text-gray-500">Go to the Predict tab to place your first prediction!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPredictions.map((pred) => (
                    <Card key={pred.id || pred.fixture_id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {pred.home_team} vs {pred.away_team}
                            </p>
                            <p className="text-xs text-gray-500">
                              Predicted: <span className="font-bold capitalize">{pred.prediction}</span> &middot; {pred.coins_bet} coins
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={
                                pred.status === 'won'
                                  ? 'bg-green-100 text-green-800'
                                  : pred.status === 'lost'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {pred.status === 'won' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {pred.status === 'lost' && <XCircle className="w-3 h-3 mr-1" />}
                              {pred.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {pred.status}
                            </Badge>
                            {pred.status === 'won' && (
                              <p className="text-xs font-bold text-green-600 mt-1">+{pred.payout} coins</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Top Predictors
                </h3>
                <p className="text-xs text-gray-500">Users with the most prediction winnings</p>
              </div>
              {predictionLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No predictions resolved yet. Be the first!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {predictionLeaderboard.map((entry, i) => (
                    <div key={entry.userId} className="flex items-center gap-4 p-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900' :
                        i === 1 ? 'bg-gray-300 text-gray-700' :
                        i === 2 ? 'bg-orange-300 text-orange-800' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">
                          {entry.userId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-500">{entry.wins} wins</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-yellow-600 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          {entry.totalPayout}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* How It Works */}
          <div className="mt-8 bg-white rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">How Predictions Work</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Pick a Match', desc: 'Choose from upcoming matches and predict the outcome' },
                { step: '2', title: 'Bet Coins', desc: 'Wager 5–50 Bara Coins on your prediction' },
                { step: '3', title: 'Win Rewards', desc: 'Correct predictions earn you coins based on the odds' },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-2 font-black">
                    {s.step}
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">{s.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
