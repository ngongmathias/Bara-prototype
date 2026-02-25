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
  BadgeCheck,
  Music,
  TrendingUp,
  Shield,
  Star,
  Zap,
  ArrowRight,
  Check,
  Crown,
} from 'lucide-react';

const BENEFITS = [
  { icon: BadgeCheck, title: 'Verified Badge', description: 'Blue checkmark on your artist profile and all songs' },
  { icon: TrendingUp, title: 'Priority Placement', description: 'Boosted visibility in search results and recommendations' },
  { icon: Music, title: 'Unlimited Uploads', description: 'Upload unlimited songs and albums with no restrictions' },
  { icon: Shield, title: 'Content Protection', description: 'Priority DMCA takedown support for your content' },
  { icon: Star, title: 'Artist Analytics', description: 'Detailed play counts, listener demographics, and trends' },
  { icon: Zap, title: 'Early Access', description: 'First access to new platform features and tools' },
];

const COMPARISON = [
  { feature: 'Upload songs', free: '5 per month', verified: 'Unlimited' },
  { feature: 'Verified badge', free: false, verified: true },
  { feature: 'Search priority', free: false, verified: true },
  { feature: 'Analytics dashboard', free: 'Basic', verified: 'Advanced' },
  { feature: 'Content protection', free: 'Standard', verified: 'Priority' },
  { feature: 'Playlist consideration', free: 'Standard', verified: 'Priority' },
  { feature: 'Custom artist URL', free: false, verified: true },
  { feature: 'Monthly Bara Coins bonus', free: '0', verified: '50' },
];

export default function ArtistVerificationPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (!isSignedIn) {
      navigate('/user/sign-in');
      return;
    }
    setLoading(true);
    toast({
      title: 'Verified Artist Activated! ✓',
      description: 'All verification features are free during our launch period. Your badge will appear on your profile.',
    });
    setTimeout(() => {
      setLoading(false);
      navigate('/streams/creator');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Artist Verification | Bara Afrika Streams"
        description="Get verified as an artist on Bara Afrika. Blue badge, priority placement, unlimited uploads, and more for $10/month."
        keywords={['Artist Verification', 'Verified Badge', 'Music', 'Bara Streams']}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <BadgeCheck className="w-4 h-4" />
            Artist Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Stand out as a verified artist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-roboto">
            Get the blue badge, unlock premium tools, and grow your audience on Bara Afrika Streams.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="border-2 border-blue-500 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-black">Verified Artist</CardTitle>
              <div className="mt-3">
                <span className="text-4xl font-black text-gray-900">$10</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-gray-900">{b.title}</span>
                      <p className="text-xs text-gray-500">{b.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {isSignedIn ? (
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-xl"
                >
                  Get Verified
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/user/sign-in')}
                  className="w-full py-6 bg-black hover:bg-gray-800 text-white font-black text-base rounded-xl"
                >
                  Sign In to Subscribe
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <p className="text-[10px] text-gray-400 text-center">
                Cancel anytime. No long-term commitment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 font-comfortaa mb-8 text-center">Free vs Verified</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500">Feature</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500">Free Artist</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-blue-600">
                    <div className="flex items-center justify-center gap-1">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-sm">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-gray-500">{row.free}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {typeof row.verified === 'boolean' ? (
                        row.verified ? (
                          <Check className="w-4 h-4 text-blue-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="font-bold text-gray-900">{row.verified}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-comfortaa">FAQ</h2>
          <div className="space-y-6">
            {[
              { q: 'How do I get verified?', a: 'Subscribe to the Verified Artist plan and your badge will be activated within 24 hours after payment confirmation.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your account settings. Your badge remains active until the end of the billing period.' },
              { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards and mobile money via Stripe and Paystack.' },
              { q: 'Do I need to be a professional musician?', a: 'No. Any artist who uploads original music to Bara Streams can apply for verification.' },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
