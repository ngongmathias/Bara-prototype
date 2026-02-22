import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Zap, Crown, Coins, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

const tiers = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    description: 'Get started with the essentials',
    badge: null,
    highlight: false,
    features: [
      { text: 'Basic business listing', included: true },
      { text: 'Contact information', included: true },
      { text: 'Customer reviews', included: true },
      { text: '1 event per month', included: true },
      { text: '3 marketplace posts', included: true },
      { text: 'Community access', included: true },
      { text: 'Social media links', included: false },
      { text: 'Photo gallery', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'Priority support', included: false },
      { text: 'Featured placement', included: false },
      { text: 'Verified badge', included: false },
    ],
    cta: 'Get Started Free',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Bara Pro',
    monthly: 5,
    annual: 50,
    description: 'For growing businesses and active organizers',
    badge: 'Most Popular',
    highlight: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'No ads', included: true },
      { text: 'Unlimited listings', included: true },
      { text: 'Unlimited events', included: true },
      { text: 'Social media links', included: true },
      { text: 'Photo gallery (up to 10)', included: true },
      { text: 'Business hours display', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: true },
      { text: '100 bonus Bara Coins/month', included: true },
      { text: 'Pro badge', included: true },
      { text: 'Featured placement', included: false },
    ],
    cta: 'Go Pro',
    ctaVariant: 'default' as const,
  },
  {
    name: 'Bara Elite',
    monthly: 20,
    annual: 200,
    description: 'For power users who want it all',
    badge: 'Best Value',
    highlight: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Featured placement', included: true },
      { text: 'Verified badge', included: true },
      { text: '500 bonus Bara Coins/month', included: true },
      { text: 'Unlimited media uploads', included: true },
      { text: 'API access', included: true },
      { text: 'White-label business page', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority search ranking', included: true },
      { text: 'Lead generation form', included: true },
    ],
    cta: 'Go Elite',
    ctaVariant: 'default' as const,
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { toast } = useToast();

  const handleSelectPlan = (tierName: string) => {
    if (!isSignedIn) {
      navigate('/user/sign-up');
      return;
    }
    // All plans are free during launch period
    toast({
      title: `${tierName} Plan Activated!`,
      description: tierName === 'Free'
        ? 'You\'re on the Free plan. All basic features are available!'
        : `All ${tierName} features are free during our launch period. Enjoy!`,
    });
    navigate('/users/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Pricing | Bara Afrika"
        description="Choose the plan that's right for you. Free, Pro, or Elite — grow your business on Africa's leading platform."
        keywords={['Pricing', 'Plans', 'Bara Pro', 'Bara Elite', 'Subscription']}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-roboto">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>

          {/* Launch Period Banner */}
          <div className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-6 py-4 max-w-2xl mx-auto">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-green-800">Launch Period — All Features Free!</p>
              <p className="text-xs text-green-600">We're in early access. All Pro & Elite features are unlocked for everyone. Paid subscriptions via Stripe coming soon.</p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`font-medium text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isAnnual ? 'bg-black' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`}
              />
            </button>
            <span className={`font-medium text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-800 border-0 font-semibold">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier) => (
            <div key={tier.name} className="relative">
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className={`${tier.highlight ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-100 text-blue-800'} border-0 font-bold px-3 py-1 shadow-sm`}>
                    {tier.badge}
                  </Badge>
                </div>
              )}
              <Card className={`h-full flex flex-col ${tier.highlight ? 'ring-2 ring-black shadow-xl scale-[1.02]' : 'border-gray-200'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {tier.name === 'Bara Pro' && <Crown className="w-5 h-5 text-blue-600" />}
                    {tier.name === 'Bara Elite' && <Zap className="w-5 h-5 text-yellow-500" />}
                    <CardTitle className="text-xl font-bold font-comfortaa">{tier.name}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-500 font-roboto">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-gray-900">
                      {tier.monthly === 0 ? 'Free' : `$${isAnnual ? Math.round(tier.annual / 12) : tier.monthly}`}
                    </span>
                    {tier.monthly > 0 && (
                      <span className="text-gray-500 font-roboto">/month</span>
                    )}
                    {isAnnual && tier.annual > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Billed annually at ${tier.annual}/year</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-roboto ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(tier.name)}
                    variant={tier.ctaVariant}
                    className={`w-full py-6 text-base font-semibold ${tier.highlight ? 'bg-black hover:bg-gray-800 text-white' : ''}`}
                  >
                    {tier.cta}
                    {tier.highlight && <Star className="w-4 h-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        {/* Bara Coins CTA */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 md:p-12 text-center border border-yellow-200">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-8 h-8 text-yellow-600" />
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 font-comfortaa">
              Bara Coins
            </h2>
          </div>
          <p className="text-gray-600 max-w-xl mx-auto mb-6 font-roboto">
            Boost your listings, promote events, and unlock premium features with Bara Coins.
            Earn them through activity or purchase packs for instant access.
          </p>
          <Button
            onClick={() => navigate('/store')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-base"
          >
            <Coins className="w-5 h-5 mr-2" />
            Visit Coin Store
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-comfortaa">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.' },
              { q: 'What payment methods do you accept?', a: 'During our launch period, all features are completely free! When paid plans launch, we will accept credit/debit cards via Stripe and mobile money via Paystack. M-Pesa support coming soon.' },
              { q: 'Is there a free trial for Pro or Elite?', a: 'Right now, everything is free during our launch period! Once paid plans go live, new users will get a 7-day free trial of Bara Pro.' },
              { q: 'What are Bara Coins?', a: 'Bara Coins are our virtual currency. Earn them by being active on the platform or purchase them to boost listings, promote events, and unlock features.' },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2 font-roboto">{faq.q}</h3>
                <p className="text-gray-600 text-sm font-roboto">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
