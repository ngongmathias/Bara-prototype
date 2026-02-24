import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Sparkles, Zap, ShoppingBag, Calendar, Music, TrendingUp, Gift, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { GamificationService } from '@/lib/gamificationService';

const coinPacks = [
  {
    id: 'starter',
    name: 'Starter',
    coins: 100,
    bonus: 0,
    price: 1.99,
    popular: false,
    icon: Coins,
    color: 'from-gray-100 to-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    id: 'popular',
    name: 'Popular',
    coins: 300,
    bonus: 50,
    price: 4.99,
    popular: true,
    icon: Sparkles,
    color: 'from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-300',
  },
  {
    id: 'power',
    name: 'Power',
    coins: 700,
    bonus: 150,
    price: 9.99,
    popular: false,
    icon: Zap,
    color: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'elite',
    name: 'Elite',
    coins: 2000,
    bonus: 500,
    price: 24.99,
    popular: false,
    icon: TrendingUp,
    color: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
  },
];

const spendOptions = [
  {
    icon: ShoppingBag,
    title: 'Marketplace Spotlight',
    cost: '50 coins',
    description: 'Boost your listing to the top of its category for 7 days',
  },
  {
    icon: Calendar,
    title: 'Event Highlight',
    cost: '75 coins',
    description: 'Feature your event with a banner on the events page',
  },
  {
    icon: TrendingUp,
    title: 'Business Premium Badge',
    cost: '100 coins',
    description: 'Get a verified badge and priority in search for 30 days',
  },
  {
    icon: Music,
    title: 'Track Boost',
    cost: '50 coins',
    description: 'Push your track to the top of the trending feed for 24 hours',
  },
];

export default function CoinStorePage() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packId: string) => {
    if (!isSignedIn || !user) {
      navigate('/user/sign-in');
      return;
    }

    toast({
      title: 'Store Under Maintenance',
      description: 'Coin purchases are temporarily disabled while we upgrade our payment system. Please check back later.',
    });
    return;

    // TODO: Move coin granting to a secure Edge Function with Stripe webhook
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Coins className="w-4 h-4" />
            Bara Coin Store
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Power up your presence
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-roboto">
            Bara Coins let you boost listings, promote events, and stand out from the crowd.
            Earn them through activity or buy packs below.
          </p>
        </div>

        {/* Coin Packs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {coinPacks.map((pack) => {
            const Icon = pack.icon;
            const totalCoins = pack.coins + pack.bonus;
            const rate = (pack.price / totalCoins).toFixed(3);

            return (
              <div key={pack.id} className="relative">
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-yellow-400 text-yellow-900 border-0 font-bold px-3 py-1 shadow-sm">
                      Best Value
                    </Badge>
                  </div>
                )}
                <Card className={`h-full flex flex-col border-2 ${pack.popular ? 'border-yellow-400 shadow-lg ring-1 ring-yellow-200' : pack.borderColor} hover:shadow-md transition-shadow`}>
                  <CardHeader className={`bg-gradient-to-br ${pack.color} rounded-t-lg pb-4`}>
                    <div className="flex items-center justify-between">
                      <Icon className="w-8 h-8 text-gray-700" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{pack.name}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900">{pack.coins.toLocaleString()}</span>
                        <Coins className="w-5 h-5 text-yellow-600" />
                      </div>
                      {pack.bonus > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Gift className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-sm font-bold text-green-700">+{pack.bonus} bonus coins!</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-4">
                    <div className="text-3xl font-black text-green-600 mb-1">
                      FREE
                    </div>
                    <p className="text-xs text-gray-500 font-roboto">
                      Limited time — grab your coins now!
                    </p>
                  </CardContent>

                  <div className="px-6 pb-6">
                    <Button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={purchasing && selectedPack === pack.id}
                      className={`w-full py-5 font-bold ${pack.popular ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-black hover:bg-gray-800 text-white'}`}
                    >
                      {purchasing && selectedPack === pack.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                      ) : (
                        <>Claim {totalCoins.toLocaleString()} Coins</>
                      )}
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
              { action: 'Daily Login', reward: '+5 coins', desc: 'Log in every day' },
              { action: 'Write a Review', reward: '+10 coins', desc: 'Review a business' },
              { action: 'Create an Event', reward: '+15 coins', desc: 'Host a community event' },
              { action: 'Refer a Friend', reward: '+50 coins', desc: 'When they sign up' },
            ].map((item) => (
              <div key={item.action} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-gray-900 text-sm">{item.action}</span>
                </div>
                <div className="text-lg font-black text-yellow-600 mb-1">{item.reward}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spendOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.title} className="flex gap-4 p-6 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-yellow-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{option.title}</h3>
                      <Badge variant="outline" className="text-xs font-bold text-yellow-700 border-yellow-300 bg-yellow-50">
                        {option.cost}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-roboto">{option.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA to Pricing */}
        <div className="text-center bg-black rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-white font-comfortaa mb-3">
            Want even more coins?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6 font-roboto">
            Bara Pro members get 100 bonus coins every month. Elite members get 500.
          </p>
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-base"
          >
            View Plans
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
