import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle,
  Star,
  Zap,
  Crown,
  Loader2,
  Send,
  ArrowLeft,
  BarChart3,
  Eye,
  Globe,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Ad Packages ── */
type PlanKey = 'starter' | 'growth' | 'enterprise';
interface PlanInfo {
  name: string;
  price: number;
  tagline: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: boolean;
}

const plans: Record<PlanKey, PlanInfo> = {
  starter: {
    name: 'Starter',
    price: 29,
    tagline: 'Perfect for small businesses just starting out',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Sidebar ad placement on 1 country page',
      'Basic monthly performance report',
      'Up to 1 active banner at a time',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    price: 79,
    tagline: 'Best value — reach more people, faster',
    icon: <Star className="w-6 h-6" />,
    highlight: true,
    features: [
      'Homepage banner rotation',
      'Featured in up to 3 country pages',
      'Click & impression analytics dashboard',
      'Up to 3 active banners',
      'Priority email support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    tagline: 'Maximum visibility across the platform',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Hero banner on homepage',
      'Top placement in ALL category pages',
      'Full analytics suite with weekly reports',
      'Unlimited active banners',
      'Dedicated account manager',
      'Custom campaign strategy sessions',
    ],
  },
};

const AdvertiseCheckoutPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('growth');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    contactName: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.email || !form.contactName) {
      toast({ title: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const plan = plans[selectedPlan];

      // Email to the user — confirmation
      await supabase.from('email_queue').insert({
        to_email: form.email,
        subject: `📢 Advertising Request Received — ${plan.name} Plan`,
        html_content: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <div style="background:#000;padding:24px;text-align:center">
              <h1 style="color:#facc15;margin:0">Bara Afrika</h1>
              <p style="color:#ccc;margin:4px 0">Advertise with Africa's Community</p>
            </div>
            <div style="padding:24px;background:#fff">
              <h2>Hi ${form.contactName},</h2>
              <p>Thank you for your interest in advertising on Bara Afrika!</p>
              <p>We've received your <strong>${plan.name} Plan ($${plan.price}/mo)</strong> request and our team will contact you within <strong>24 hours</strong> with payment instructions and next steps.</p>
              <h3>Your Request Summary:</h3>
              <ul>
                <li><strong>Plan:</strong> ${plan.name} — $${plan.price}/month</li>
                <li><strong>Business:</strong> ${form.businessName}</li>
                <li><strong>Contact:</strong> ${form.contactName}</li>
                <li><strong>Email:</strong> ${form.email}</li>
                ${form.phone ? `<li><strong>Phone:</strong> ${form.phone}</li>` : ''}
              </ul>
              ${form.message ? `<p><strong>Additional notes:</strong> ${form.message}</p>` : ''}
              <p style="margin-top:24px;color:#666">— The Bara Afrika Sales Team</p>
            </div>
          </div>
        `,
        metadata: { type: 'advertising_request_confirmation', plan: selectedPlan, business: form.businessName },
      });

      // Email to admin — full details
      await supabase.from('email_queue').insert({
        to_email: 'sales@baraafrika.com',
        subject: `💰 New Advertising Request: ${plan.name} Plan — ${form.businessName}`,
        html_content: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2>🔔 New Advertising Request</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Plan</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${plan.name} — $${plan.price}/mo</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Business</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${form.businessName}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Contact</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${form.contactName}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #eee"><a href="mailto:${form.email}">${form.email}</a></td></tr>
              ${form.phone ? `<tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${form.phone}</td></tr>` : ''}
            </table>
            ${form.message ? `<h3>Additional Message:</h3><p>${form.message}</p>` : ''}
            <p style="margin-top:24px;color:#666">Reply to this email to start the conversation.</p>
          </div>
        `,
        metadata: { type: 'advertising_request_admin', plan: selectedPlan, business: form.businessName },
      });

      setSubmitted(true);
      toast({ title: '✅ Request Sent!', description: 'Our team will contact you within 24 hours.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to submit. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const plan = plans[selectedPlan];

  return (
    <>
      <Header />
      <TopBannerAd />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back link */}
          <Link to="/advertise" className="inline-flex items-center text-gray-500 hover:text-black mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Advertise
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-comfortaa text-black mb-3">
              Choose Your Advertising Plan
            </h1>
            <p className="text-gray-600 text-lg font-roboto max-w-2xl mx-auto">
              Select the plan that fits your business. Our team will set everything up for you — no technical work needed.
            </p>
          </div>

          {submitted ? (
            /* ── Success State ── */
            <Card className="max-w-xl mx-auto text-center p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold font-comfortaa mb-3">Request Submitted! 🎉</h2>
              <p className="text-gray-600 font-roboto mb-2">
                You selected the <strong>{plan.name} Plan (${plan.price}/mo)</strong>.
              </p>
              <p className="text-gray-600 font-roboto mb-8">
                Our sales team will reach out to <strong>{form.email}</strong> within 24 hours with payment options and onboarding instructions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-black hover:bg-gray-800">
                  <Link to="/">Go Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/advertise">Back to Advertise</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* ── Plan Selection ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {(Object.entries(plans) as [PlanKey, PlanInfo][]).map(([key, p]) => {
                  const isActive = selectedPlan === key;
                  return (
                    <Card
                      key={key}
                      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${isActive ? 'ring-2 ring-yellow-400 shadow-xl' : 'hover:ring-1 hover:ring-gray-300'
                        } ${p.highlight ? 'border-yellow-400' : ''}`}
                      onClick={() => setSelectedPlan(key)}
                    >
                      {p.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-black text-yellow-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {p.icon}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300'
                            }`}>
                            {isActive && <CheckCircle className="w-4 h-4 text-black" />}
                          </div>
                        </div>
                        <CardTitle className="text-xl font-comfortaa mt-3">{p.name}</CardTitle>
                        <p className="text-sm text-gray-500 font-roboto">{p.tagline}</p>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-black">${p.price}</span>
                          <span className="text-gray-500 text-sm">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 font-roboto">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* ── What You're Getting (summary strip) ── */}
              <div className="bg-black text-white rounded-2xl p-6 mb-10 flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-yellow-400" />
                  <span className="font-roboto text-sm">100K+ Monthly Visitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="font-roboto text-sm">African Diaspora Audience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-yellow-400" />
                  <span className="font-roboto text-sm">20+ Country Pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <span className="font-roboto text-sm">Real-Time Analytics</span>
                </div>
              </div>

              {/* ── Contact & Submit Form ── */}
              <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader className="text-center border-b pb-6">
                  <CardTitle className="text-xl font-comfortaa">
                    Submit Your {plan.name} Plan Request
                  </CardTitle>
                  <p className="text-sm text-gray-500 font-roboto mt-1">
                    Fill in your details and our team will set everything up — no payment needed right now.
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-roboto">Business Name *</Label>
                        <Input
                          value={form.businessName}
                          onChange={e => setForm({ ...form, businessName: e.target.value })}
                          placeholder="e.g. Kigali Coffee Co."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="font-roboto">Contact Name *</Label>
                        <Input
                          value={form.contactName}
                          onChange={e => setForm({ ...form, contactName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-roboto">Email Address *</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="you@business.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="font-roboto">Phone (optional)</Label>
                        <Input
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          placeholder="+250 ..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="font-roboto">Anything else we should know?</Label>
                      <Textarea
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us about your campaign goals, target audience, or budget..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Plan summary */}
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold font-comfortaa">{plan.name} Plan</p>
                        <p className="text-sm text-gray-500 font-roboto">{plan.features.length} features included</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${plan.price}</p>
                        <p className="text-xs text-gray-500">/month</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 text-base"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
                      ) : (
                        <><Send className="w-5 h-5 mr-2" /> Submit Advertising Request</>
                      )}
                    </Button>
                    <p className="text-xs text-gray-400 text-center font-roboto">
                      No payment charged now. Our sales team will contact you within 24h with setup instructions.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <BottomBannerAd />
      <Footer />
    </>
  );
};

export default AdvertiseCheckoutPage;
