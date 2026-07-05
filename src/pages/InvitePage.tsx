import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { ReferralService } from '@/lib/referralService';
import {
  Users,
  Copy,
  Check,
  Gift,
  Coins,
  Share2,
  Mail,
  ArrowRight,
  Trophy,
  Zap,
  Star,
} from 'lucide-react';

const REFERRAL_REWARDS = [
  { milestone: 1, reward: '50 Bara Coins per friend', icon: Coins },
  { milestone: 5, reward: '300 Bara Coins + Ambassador Badge', icon: Star },
  { milestone: 10, reward: '1,000 Bara Coins', icon: Trophy },
  { milestone: 25, reward: '3,000 Bara Coins + Exclusive Profile Theme', icon: Zap },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Share your link',
    description: 'Copy your unique referral link and share it with friends, family, or on social media.',
  },
  {
    step: 2,
    title: 'Friend signs up',
    description: 'When someone signs up using your link, they get 25 bonus Bara Coins to start.',
  },
  {
    step: 3,
    title: 'You both earn',
    description: 'When your friend claims their first mission, you earn 50 Bara Coins. Hit milestones for bigger rewards!',
  },
];

export default function InvitePage() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);

  const [code, setCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [activated, setActivated] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const stats = await ReferralService.getReferralStats(user.id);
      if (cancelled) return;
      setCode(stats.code);
      setTotal(stats.total);
      setActivated(stats.activated);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const referralCode = code || '········';
  const referralLink = `${window.location.origin}/user/sign-up?ref=${code || ''}`;
  const nextMilestone = [5, 10, 25].find((m) => m > activated) ?? null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Share it with your friends.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  const handleEmailInvite = async () => {
    if (!emailInput.trim()) return;
    setSending(true);
    try {
      const subject = encodeURIComponent(`Join me on Bara Afrika!`);
      const body = encodeURIComponent(
        `Hey!\n\nI've been using Bara Afrika — it's an amazing platform for the African diaspora with events, marketplace, music, and more.\n\nSign up with my link and get 25 free Bara Coins:\n${referralLink}\n\nSee you there!`
      );
      window.location.href = `mailto:${emailInput}?subject=${subject}&body=${body}`;
      setEmailInput('');
      toast({ title: 'Email client opened', description: 'Send the invite to your friend!' });
    } finally {
      setSending(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Bara Afrika',
          text: 'Join me on Bara Afrika and get 25 free Bara Coins!',
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Invite Friends | Bara Afrika"
        description="Invite friends to Bara Afrika and earn Bara Coins. Both you and your friend get rewarded!"
        keywords={['Referral', 'Invite', 'Bara Coins', 'Rewards']}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Gift className="w-4 h-4" />
            Referral Program
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Invite friends, earn rewards
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-roboto">
            Share Bara Afrika with your network. You earn <strong>50 Bara Coins</strong> for every friend who joins and
            gets started, and they get <strong>25 Bara Coins</strong> to begin.
          </p>
        </div>

        {/* Referral Link Card */}
        {isSignedIn ? (
          <Card className="mb-12 border-2 border-gray-200 bg-gray-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gray-700" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-white font-mono text-sm"
                />
                <Button onClick={handleCopy} variant="outline" className="flex-shrink-0 min-w-[100px]" disabled={!code}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="bg-white"
                  />
                  <Button onClick={handleEmailInvite} disabled={sending || !emailInput.trim()} className="flex-shrink-0 bg-black hover:bg-gray-800">
                    <Mail className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
                <Button onClick={handleShare} variant="outline" className="flex-shrink-0">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Live stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{total}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Invited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{activated}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Activated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{nextMilestone ? nextMilestone - activated : '—'}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {nextMilestone ? `To ${nextMilestone}` : 'Maxed'}
                  </div>
                </div>
              </div>

              {nextMilestone && (
                <div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all"
                      style={{ width: `${Math.min(100, (activated / nextMilestone) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    {activated} of {nextMilestone} activated referrals toward your next milestone.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Your code: <strong className="text-gray-900 font-mono">{referralCode}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-12 text-center py-8">
            <CardContent>
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign in to get your referral link</h3>
              <p className="text-gray-600 mb-4">Create an account or sign in to start inviting friends.</p>
              <Button onClick={() => navigate(`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)} className="bg-black hover:bg-gray-800">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 font-comfortaa mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 font-roboto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Rewards */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 font-comfortaa mb-8 text-center">Milestone Rewards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REFERRAL_REWARDS.map((tier) => {
              const Icon = tier.icon;
              const reached = activated >= tier.milestone;
              return (
                <Card key={tier.milestone} className={`text-center transition-shadow ${reached ? 'border-2 border-black' : 'hover:shadow-md'}`}>
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-7 h-7 text-gray-900" />
                    </div>
                    <Badge variant="outline" className="mb-2 font-bold">
                      {tier.milestone} {tier.milestone === 1 ? 'Referral' : 'Referrals'}
                    </Badge>
                    <p className="text-sm font-bold text-gray-900 mt-2">{tier.reward}</p>
                    {reached && (
                      <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider mt-2 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Unlocked
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-comfortaa">Referral FAQ</h2>
          <div className="space-y-6">
            {[
              { q: 'When do I get my coins?', a: 'Your friend gets their 25 coins as soon as they finish signing up. You get your 50 coins when they claim their first mission — that’s when the referral activates.' },
              { q: 'Is there a limit to how many people I can refer?', a: 'No limit! Refer as many friends as you want and keep earning.' },
              { q: 'Can I refer someone who already has an account?', a: 'No, referral rewards only apply to new sign-ups.' },
              { q: 'Do my referral coins expire?', a: 'No, Bara Coins never expire. Use them whenever you want.' },
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
