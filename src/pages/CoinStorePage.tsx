import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Sparkles, Zap, ShoppingBag, Music, TrendingUp, Gift, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { GamificationService } from '@/lib/gamificationService';
import { useAdFree } from '@/hooks/useAdFree';
import { ShieldOff } from 'lucide-react';

// Packs are priced and ready, but not purchasable until the payment
// integration lands — the UI below states that plainly rather than
// advertising them as claimable (it previously rendered "FREE" over every
// pack with a button that always failed).
const coinPacks = [
  { id: 'starter', name: 'Starter', coins: 100, bonus: 0, price: 1.99, popular: false, icon: Coins },
  { id: 'popular', name: 'Popular', coins: 300, bonus: 50, price: 4.99, popular: true, icon: Sparkles },
  { id: 'power', name: 'Power', coins: 700, bonus: 150, price: 9.99, popular: false, icon: Zap },
  { id: 'elite', name: 'Elite', coins: 2000, bonus: 500, price: 24.99, popular: false, icon: TrendingUp },
];

// Only perks that actually exist and can be paid for. "Event Highlight" and
// "Business Premium Badge" used to be listed here with hardcoded prices but
// have no implementation anywhere — no settings key, no call site — so they
// were advertising features nobody could buy. Costs are read live from
// gamification_settings so this page can't go stale when an admin retunes.
const spendOptions = [
  {
    icon: ShoppingBag,
    title: 'Marketplace Spotlight',
    settingKey: 'cost.listing_boost',
    to: '/marketplace/post',
    where: 'Choose it while posting an ad',
    description: 'Boost your listing to the top of its category',
  },
  {
    icon: Music,
    title: 'Track Boost',
    settingKey: 'cost.track_boost',
    to: '/streams/creator',
    where: 'From your Creator dashboard',
    description: 'Push your track to the top of the trending feed for 24 hours',
  },
];

export default function CoinStorePage() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activateAdFree, isAdFree, timeRemaining, cost: adFreeCost, duration: adFreeHours } = useAdFree();
  const [activatingAdFree, setActivatingAdFree] = useState(false);
  const [spendCosts, setSpendCosts] = useState<Record<string, number>>({});

  // Read the real prices rather than trusting hardcoded copy — an admin can
  // retune these live in Admin → Gamification.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        spendOptions.map(async (o) => [o.settingKey, await GamificationService.getSetting(o.settingKey)] as const)
      );
      if (!cancelled) setSpendCosts(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAdFree = async () => {
    if (!isSignedIn || !user) {
      navigate(`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setActivatingAdFree(true);
    try {
      const res = await activateAdFree();
      toast({
        title: res.success ? 'Ad-free activated!' : 'Could not activate',
        description: res.message,
        variant: res.success ? undefined : 'destructive',
      });
    } finally {
      setActivatingAdFree(false);
    }
  };

  // Coin packs are not purchasable yet — the cards render as "coming soon"
  // and their buttons are disabled, so this is only reachable via keyboard
  // edge cases. Kept honest rather than removed.
  // TODO: grant coins via a secure Edge Function once payments are integrated.
  const handlePurchase = async (_packId: string) => {
    toast({
      title: 'Coin packs are not on sale yet',
      description: 'You can earn coins today through missions, the daily spin, and levelling up.',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Bara Coin Store | Bara Afrika"
        description="Purchase Bara Coins to boost listings, promote events, and unlock premium features on Bara Afrika."
        keywords={['Bara Coins', 'Virtual Currency', 'Boost', 'Premium']}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Coins className="w-4 h-4" />
            Bara Coin Store
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Power up your presence
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-roboto">
            Bara Coins let you boost listings, promote events, and stand out from the crowd.
            Right now every coin is earned — buying them is coming soon.
          </p>
        </div>

        {/* Coin Packs — priced but not yet purchasable */}
        <div className="max-w-3xl mx-auto mb-8 border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-gray-700 font-roboto flex-1">
            <span className="font-bold text-gray-900">Coin packs aren&apos;t on sale yet.</span>{' '}
            We&apos;re finishing card and mobile-money payments. Until then, everything below
            is earnable for free.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/rewards')}
            className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold shrink-0"
          >
            Ways to earn <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {coinPacks.map((pack) => {
            const Icon = pack.icon;
            const totalCoins = pack.coins + pack.bonus;

            return (
              <div key={pack.id} className="relative">
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gray-900 text-white border-0 font-bold px-3 py-1 shadow-sm">
                      Best Value
                    </Badge>
                  </div>
                )}
                <Card className={`h-full flex flex-col border-2 ${pack.popular ? 'border-gray-900' : 'border-gray-200'}`}>
                  <CardHeader className="bg-gray-50 rounded-t-lg pb-4">
                    <div className="flex items-center justify-between">
                      <Icon className="w-8 h-8 text-gray-700" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{pack.name}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900">{pack.coins.toLocaleString()}</span>
                        <Coins className="w-5 h-5 text-gray-500" />
                      </div>
                      {pack.bonus > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Gift className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-sm font-bold text-gray-700">+{pack.bonus} bonus coins</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-4">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl font-black text-gray-900">${pack.price}</span>
                      <span className="text-sm text-gray-500 font-roboto">
                        for {totalCoins.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-roboto">
                      Not on sale yet — coming with card &amp; mobile money payments.
                    </p>
                  </CardContent>

                  <div className="px-6 pb-6">
                    <Button
                      disabled
                      className="w-full py-5 font-bold bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed"
                    >
                      Coming soon
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* How to Earn Coins */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-2xl font-black text-gray-900 font-comfortaa mb-6 text-center">
            Earn Coins for Free
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { action: 'Daily Spin', reward: 'up to 50', desc: 'Spin the wheel once a day' },
              { action: 'Complete Missions', reward: 'coins + XP', desc: 'Daily goals on the Rewards page' },
              { action: 'Level Up', reward: 'coins', desc: 'Every new level pays a bonus' },
              { action: 'Achievements', reward: 'coins + XP', desc: 'Unlock milestone badges' },
            ].map((item) => (
              <div key={item.action} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-gray-900" />
                  <span className="font-bold text-gray-900 text-sm">{item.action}</span>
                </div>
                <div className="text-lg font-black text-gray-900 mb-1">{item.reward}</div>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What to Spend On */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-gray-900 font-comfortaa mb-8 text-center">
            What Can You Do With Coins?
          </h2>

          {/* Actionable perk: Ad-Free (the one perk that needs no context) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-gray-900 text-white rounded-xl mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldOff className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">Ad-Free Browsing</h3>
                <Badge variant="outline" className="text-xs font-bold text-white border-white/40 bg-white/10">
                  {adFreeCost} coins / {adFreeHours}h
                </Badge>
              </div>
              <p className="text-sm text-gray-300 font-roboto">
                {isAdFree
                  ? `Active${timeRemaining() ? ` — ${timeRemaining()} left` : ''}. Enjoy an ad-free BARA.`
                  : 'Spend coins to remove ads across BARA for 24 hours.'}
              </p>
            </div>
            <Button
              onClick={handleAdFree}
              disabled={activatingAdFree || isAdFree}
              className="bg-white hover:bg-gray-100 text-gray-900 font-bold flex-shrink-0"
            >
              {isAdFree ? 'Active' : activatingAdFree ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating…</> : 'Activate'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spendOptions.map((option) => {
              const Icon = option.icon;
              const cost = spendCosts[option.settingKey];
              return (
                <button
                  key={option.title}
                  onClick={() => navigate(option.to)}
                  className="flex gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-sm transition text-left w-full"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900">{option.title}</h3>
                      <Badge variant="outline" className="text-xs font-bold text-gray-700 border-gray-300 bg-gray-100">
                        {cost != null ? `${cost} coins` : '—'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-roboto mb-2">{option.description}</p>
                    <span className="text-xs font-bold text-gray-900 inline-flex items-center gap-1">
                      {option.where} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA to Rewards — memberships don't exist yet, so no membership promises here */}
        <div className="text-center bg-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-white font-comfortaa mb-3">
            Want even more coins?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6 font-roboto">
            Keep your daily streak alive, complete missions and unlock achievements — every one pays coins.
          </p>
          <Button
            onClick={() => navigate('/rewards')}
            className="bg-white hover:bg-gray-200 text-black font-bold px-8 py-6 text-base"
          >
            See how rewards work
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
