import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link, useSearchParams, Navigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AchievementHall } from '@/components/gamification/AchievementHall';
import { useGamification } from '@/hooks/useGamification';
import { GamificationService, UserMission, getPrestigeTier } from '@/lib/gamificationService';
import { useToast } from '@/hooks/use-toast';
import { Coins, Zap, Flame, Trophy, Gift, CheckCircle2, Circle, Loader2, Target } from 'lucide-react';

const GamificationPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const location = useLocation();
  const { toast } = useToast();
  const { profile, getProgress, refresh } = useGamification();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'achievements' ? 'achievements' : 'missions';

  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchMissions = async () => {
    if (!user) return;
    setLoadingMissions(true);
    const data = await GamificationService.getMissions(user.id);
    setMissions(data);
    setLoadingMissions(false);
  };

  useEffect(() => {
    if (user) fetchMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (isLoaded && !isSignedIn) {
    return <Navigate to={`/user/sign-in?redirect_url=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  const handleClaim = async (mission: UserMission) => {
    if (!user) return;
    setClaiming(mission.id);
    try {
      const ok = await GamificationService.claimMissionReward(user.id, mission.id);
      if (ok) {
        toast({ title: 'Reward claimed!', description: `+${mission.coin_reward} coins · +${mission.xp_reward} XP` });
        await fetchMissions();
        refresh();
      } else {
        toast({ title: 'Could not claim', description: 'This reward may already be claimed.', variant: 'destructive' });
      }
    } finally {
      setClaiming(null);
    }
  };

  const progress = getProgress();
  const completed = missions.filter((m) => m.is_completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Rewards — BARA Afrika" description="Your BARA Coins, XP, daily missions and achievements." />
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-comfortaa">Rewards</h1>
            <p className="text-gray-500">Earn BARA Coins and XP as you explore. Complete daily missions, unlock achievements.</p>
          </div>
          <Link to="/rewards" className="flex-shrink-0 text-sm font-bold text-gray-700 hover:text-gray-900 underline whitespace-nowrap mt-1">
            How rewards work
          </Link>
        </div>

        {/* Profile summary */}
        <Card className="border-none shadow-sm mb-6 bg-black text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 text-2xl font-black"><Coins className="w-5 h-5" />{(profile?.bara_coins ?? 0).toLocaleString()}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">Coins</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-black"><Zap className="w-5 h-5" />{(profile?.total_xp ?? 0).toLocaleString()}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">Total XP</div>
              </div>
              <div>
                <div className="text-2xl font-black">{profile?.current_level ?? 1}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">{getPrestigeTier(profile?.current_level ?? 1)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-black"><Flame className="w-5 h-5" />{profile?.daily_streak ?? 0}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">Day Streak</div>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-[11px] text-gray-300 mb-1 font-bold">
                <span>Level {profile?.current_level ?? 1}</span>
                <span>{Math.round(progress.percentage)}% to next</span>
              </div>
              <Progress value={progress.percentage} className="h-2 bg-gray-700" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mb-4">
          <Link to="/leaderboard">
            <Button variant="outline" className="font-bold border-2"><Trophy className="w-4 h-4 mr-2" /> View Leaderboard</Button>
          </Link>
        </div>

        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="missions"><Target className="w-4 h-4 mr-2" /> Daily Missions</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2" /> Achievements</TabsTrigger>
          </TabsList>

          {/* Missions */}
          <TabsContent value="missions">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-comfortaa">Daily Missions</h2>
              <span className="text-sm text-gray-500 font-bold">{completed}/{missions.length} completed</span>
            </div>

            {loadingMissions ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : missions.length === 0 ? (
              <div className="text-center text-gray-400 py-12 italic">No missions available right now. Check back tomorrow.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {missions.map((m) => {
                  const pct = m.goal > 0 ? Math.min(100, (m.current_progress / m.goal) * 100) : 0;
                  const claimable = m.is_completed && !m.claimed_at;
                  return (
                    <Card key={m.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {m.is_completed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-gray-300" />}
                            <span className={`text-sm font-bold ${m.is_completed ? 'text-gray-500' : 'text-gray-900'}`}>{m.title}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {m.xp_reward > 0 && <span className="text-[9px] font-black text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded uppercase">+{m.xp_reward} XP</span>}
                            {m.coin_reward > 0 && <span className="text-[9px] font-black text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded uppercase">+{m.coin_reward} Coins</span>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{m.description}</p>
                        <div className="mt-3 space-y-1">
                          <Progress value={pct} className="h-1.5" />
                          <div className="text-right text-[10px] text-gray-400 font-bold">{m.current_progress}/{m.goal}</div>
                        </div>
                        {claimable && (
                          <Button onClick={() => handleClaim(m)} disabled={claiming === m.id} className="w-full mt-3 bg-black text-white font-bold h-8">
                            {claiming === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Gift className="w-3.5 h-3.5 mr-1" /> Claim Reward</>}
                          </Button>
                        )}
                        {m.claimed_at && (
                          <div className="text-center text-[10px] text-green-600 font-bold py-1.5 bg-green-50 rounded-lg mt-3">REWARD CLAIMED</div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            {user && <AchievementHall userId={user.id} />}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default GamificationPage;
