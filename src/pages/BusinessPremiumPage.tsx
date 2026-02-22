import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Star,
  TrendingUp,
  Eye,
  MapPin,
  Phone,
  Globe,
  Shield,
  Check,
  ArrowRight,
  Sparkles,
  Crown,
} from 'lucide-react';

interface Tier {
  name: string;
  price: string;
  period: string;
  badge: string | null;
  highlight: boolean;
  icon: typeof Building2;
  color: string;
  features: { text: string; included: boolean }[];
}

const TIERS: Tier[] = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    badge: null,
    highlight: false,
    icon: Building2,
    color: 'text-gray-600',
    features: [
      { text: 'Business name & address', included: true },
      { text: 'Contact phone number', included: true },
      { text: 'Customer reviews', included: true },
      { text: 'Basic category listing', included: true },
      { text: 'Photo gallery (up to 5)', included: true },
      { text: 'Priority search placement', included: false },
      { text: 'Verified badge', included: false },
      { text: 'Website link', included: false },
      { text: 'Social media links', included: false },
      { text: 'Analytics dashboard', included: false },
    ],
  },
  {
    name: 'Business Pro',
    price: '$15',
    period: '/month',
    badge: 'POPULAR',
    highlight: true,
    icon: Star,
    color: 'text-yellow-600',
    features: [
      { text: 'Everything in Basic', included: true },
      { text: 'Priority search placement', included: true },
      { text: 'Verified business badge', included: true },
      { text: 'Website & social links', included: true },
      { text: 'Photo gallery (up to 20)', included: true },
      { text: 'Business hours display', included: true },
      { text: 'Monthly analytics report', included: true },
      { text: 'Remove competitor ads', included: false },
      { text: 'Featured on homepage', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
  },
  {
    name: 'Business Elite',
    price: '$40',
    period: '/month',
    badge: 'BEST VALUE',
    highlight: false,
    icon: Crown,
    color: 'text-purple-600',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Featured on homepage', included: true },
      { text: 'Remove competitor ads', included: true },
      { text: 'Unlimited photo gallery', included: true },
      { text: 'Video showcase', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom business page URL', included: true },
      { text: 'Priority customer support', included: true },
      { text: 'Monthly 100 Bara Coins', included: true },
    ],
  },
];

const STATS = [
  { icon: Eye, value: '3x', label: 'More profile views with Pro' },
  { icon: Phone, value: '5x', label: 'More customer inquiries' },
  { icon: TrendingUp, value: '40%', label: 'Higher search ranking' },
  { icon: MapPin, value: '2x', label: 'More map appearances' },
];

export default function BusinessPremiumPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  const { toast } = useToast();

  const handleSubscribe = (tierName: string) => {
    if (tierName === 'Basic') {
      navigate('/claim-listing');
      return;
    }
    if (!isSignedIn) {
      navigate('/user/sign-in');
      return;
    }
    toast({
      title: `${tierName} Plan Activated!`,
      description: `All ${tierName} features are free during our launch period. Enjoy!`,
    });
    navigate('/users/dashboard');
  };

  const getPrice = (tier: Tier) => {
    if (tier.price === 'Free') return { display: 'Free', sub: '' };
    const monthly = parseInt(tier.price.replace('$', ''));
    if (annual) {
      const annualPrice = Math.round(monthly * 10);
      return { display: `$${annualPrice}`, sub: '/year (save 17%)' };
    }
    return { display: tier.price, sub: tier.period };
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Business Premium Plans | Bara Afrika"
        description="Upgrade your business listing on Bara Afrika. Get verified, boost visibility, and attract more customers."
        keywords={['Business Listing', 'Premium', 'Verified Business', 'Bara Afrika']}
      />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Business Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Grow your business on Bara
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-roboto">
            Upgrade your listing to reach more customers across Africa and the diaspora.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <Icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual
            <Badge className="ml-2 bg-green-100 text-green-800 text-[10px]">Save 17%</Badge>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = getPrice(tier);
            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden ${tier.highlight ? 'border-2 border-yellow-500 shadow-xl scale-[1.02]' : 'border border-gray-200'}`}
              >
                {tier.badge && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    {tier.badge}
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className={`w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-7 h-7 ${tier.color}`} />
                  </div>
                  <CardTitle className="text-xl font-black">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-black text-gray-900">{price.display}</span>
                    <span className="text-gray-500 text-sm">{price.sub}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2.5">
                        {f.included ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 flex items-center justify-center text-gray-300 flex-shrink-0">—</span>
                        )}
                        <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {isSignedIn ? (
                    <Button
                      onClick={() => handleSubscribe(tier.name)}
                      className={`w-full py-5 font-bold rounded-xl ${
                        tier.highlight
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : tier.name === 'Business Elite'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-black hover:bg-gray-800 text-white'
                      }`}
                    >
                      {tier.price === 'Free' ? 'Claim Listing' : 'Get Started'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/user/sign-in')}
                      variant="outline"
                      className="w-full py-5 font-bold rounded-xl"
                    >
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 font-comfortaa">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Claim Your Listing', desc: 'Verify your business ownership with a simple form' },
              { step: '2', title: 'Choose a Plan', desc: 'Select the tier that fits your business needs' },
              { step: '3', title: 'Grow Your Reach', desc: 'Attract more customers with enhanced visibility' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-50 rounded-2xl p-10">
          <Globe className="w-10 h-10 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-3 font-comfortaa">Ready to grow?</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Join thousands of businesses already using Bara Afrika to connect with customers.
          </p>
          <Button
            onClick={() => navigate('/claim-listing')}
            className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-5 rounded-xl"
          >
            Claim Your Free Listing
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
