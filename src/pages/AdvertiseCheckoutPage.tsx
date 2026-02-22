import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle,
  Zap,
  Crown,
  Loader2,
  ArrowLeft,
  MousePointer2,
  TrendingUp,
  Coins
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdvertiseCheckoutPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [plan, setPlan] = useState<'pro' | 'elite'>('pro');
  const [bid, setBid] = useState(0.25);
  const [dailyBudget, setDailyBudget] = useState(10);

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      // In a real app, this would trigger a payment gateway
      // For the prototype, we simulate a successful onboarding
      toast({
        title: "Welcome to Bara Prime!",
        description: "Your account is being upgraded. Our team will contact you for banner creative assets.",
      });
      setTimeout(() => navigate('/users/dashboard'), 2000);
    } catch (error) {
      toast({ title: "Error", description: "Failed to process request.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <TopBannerAd />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/advertise" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Overview
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration side */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-8 text-center">
                <CardTitle className="text-2xl font-black font-comfortaa">Bara Prime Setup</CardTitle>
                <CardDescription>Configure your performance parameters.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Plan Selection */}
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Select Your Tier</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPlan('pro')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${plan === 'pro' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                      <Crown className={`mb-3 ${plan === 'pro' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="font-bold text-lg">Bara Pro</div>
                      <div className="text-xl font-black text-blue-600">$5/mo</div>
                    </button>
                    <button
                      onClick={() => setPlan('elite')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${plan === 'elite' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                      <Zap className={`mb-3 ${plan === 'elite' ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <div className="font-bold text-lg">Bara Elite</div>
                      <div className="text-xl font-black text-yellow-600">$20/mo</div>
                    </button>
                  </div>
                </div>

                {/* Auction Settings */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Auction Bidding</Label>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <MousePointer2 size={10} />
                      CPC Model
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                      <div>
                        <div className="font-bold text-sm">Bid Per Click</div>
                        <div className="text-xs text-gray-500">Suggested: $0.25 - $0.50</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg">$</span>
                        <Input
                          type="number"
                          value={bid}
                          onChange={e => setBid(parseFloat(e.target.value))}
                          className="w-24 text-right font-black text-lg bg-transparent border-none focus-visible:ring-0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                      <div>
                        <div className="font-bold text-sm">Daily Budget</div>
                        <div className="text-xs text-gray-500">Minimum: $5.00</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg">$</span>
                        <Input
                          type="number"
                          value={dailyBudget}
                          onChange={e => setDailyBudget(parseFloat(e.target.value))}
                          className="w-24 text-right font-black text-lg bg-transparent border-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary side */}
          <div className="space-y-6">
            <Card className="bg-black text-white border-none rounded-2xl p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8">Order Summary</h3>
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">{plan === 'pro' ? 'Bara Pro' : 'Bara Elite'}</span>
                  <span className="font-bold">${plan === 'pro' ? '19.00' : '79.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Setup Fee</span>
                  <span className="font-bold text-green-500">FREE</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="font-bold">Total Now</span>
                  <span className="text-3xl font-black text-blue-500">${plan === 'pro' ? '19.00' : '79.00'}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                {submitting ? 'Processing...' : 'Secure Upgrade'}
              </Button>

              <p className="mt-4 text-[10px] text-center text-gray-500 uppercase font-bold tracking-widest">
                Instant ROI tracking enabled
              </p>
            </Card>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Coins size={20} /></div>
                <div>
                  <div className="text-sm font-bold">Earn as you go</div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Bara Points Engine</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get <span className="text-blue-600 font-bold">500 Welcome Coins</span> when you upgrade to Pro today! Use them for marketplace boosts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdvertiseCheckoutPage;
