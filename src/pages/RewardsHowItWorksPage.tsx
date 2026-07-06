import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';
import { Zap, Coins, Flame, Target, Gift, Trophy, ArrowRight, Crown, UserPlus } from 'lucide-react';

const PRESTIGE_PERKS = [
  { tier: 'Explorer', level: 'Level 1–10', perk: 'Where everyone starts — earn XP and climb.' },
  { tier: 'Bronze', level: 'Level 11+', perk: 'Claim an exclusive Bronze profile theme, free.' },
  { tier: 'Silver', level: 'Level 21+', perk: 'Spin the daily wheel twice a day instead of once.' },
  { tier: 'Gold', level: 'Level 41+', perk: '+5% Bara Coins on everything you earn.' },
  { tier: 'Diamond', level: 'Level 71+', perk: 'A free ad-free week, automatically, every month.' },
];

const SECTIONS = [
  {
    icon: Zap,
    title: 'XP & Levels',
    body: 'Almost everything you do on BARA earns XP — listening to music, posting in the marketplace, joining events, writing blogs and more. XP raises your Level, and your Level unlocks Prestige tiers: Explorer → Bronze → Silver → Gold → Diamond. XP is your status; it shows on your profile and the leaderboard.',
  },
  {
    icon: Coins,
    title: 'Bara Coins',
    body: 'Coins are your spendable reward. You earn them from levelling up, daily missions, achievements and the daily spin. Spend them on perks like ad-free browsing and boosting your listings or tracks. (Buying coins and paid music are coming soon.)',
  },
  {
    icon: Flame,
    title: 'Daily streak',
    body: 'Open BARA on consecutive days to build a streak. The longer your streak, the bigger your XP multiplier: 3 days = 1.2×, 7 days = 1.5×, 30 days = 2×. Your streak increases once per calendar day — come back tomorrow to keep it alive. Miss a day and it restarts.',
  },
  {
    icon: Target,
    title: 'Daily missions',
    body: 'Small daily goals — listen to a few songs, check out the marketplace, share something. Complete them and claim your XP and coins. They refresh every day.',
  },
  {
    icon: Gift,
    title: 'Daily spin',
    body: 'Spin the wheel once a day for a surprise reward — coins or XP, with bigger prizes the rarer the slice.',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    body: 'One-off badges for milestones: your first playlist, your first listing, a 7- and 30-day streak, and more. Each pays a bonus of XP and coins when you unlock it.',
  },
];

export default function RewardsHowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="How Rewards Work | BARA Afrika"
        description="Understand XP, Levels, Bara Coins, streaks, missions and achievements on BARA Afrika."
        keywords={['Bara Coins', 'XP', 'Rewards', 'Gamification', 'Streak']}
      />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-3">How rewards work</h1>
          <p className="text-lg text-gray-600 font-roboto">
            Be active on BARA, earn <span className="font-bold text-gray-900">XP</span> and{' '}
            <span className="font-bold text-gray-900">Bara Coins</span>, level up, and unlock perks.
          </p>
        </div>

        {/* The loop */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10 text-center">
          <p className="font-roboto text-gray-700 leading-relaxed">
            <span className="font-bold text-gray-900">Do anything on BARA</span> → earn{' '}
            <span className="font-bold">XP</span> (status) and sometimes <span className="font-bold">Coins</span> (spendable) →
            XP raises your <span className="font-bold">Level &amp; Tier</span> → daily <span className="font-bold">streaks</span>{' '}
            multiply your XP → <span className="font-bold">missions, achievements &amp; the daily spin</span> add bonuses.
          </p>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-1">{s.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed font-roboto">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prestige perks */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-gray-900" />
            <h2 className="text-2xl font-black text-gray-900 font-comfortaa">Prestige perks</h2>
          </div>
          <p className="text-sm text-gray-600 mb-5 font-roboto">
            Your Level unlocks Prestige tiers — and each tier is more than a badge. The higher you climb, the more you get.
          </p>
          <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
            {PRESTIGE_PERKS.map((p) => (
              <div key={p.tier} className="flex items-center gap-4 p-4">
                <div className="w-24 flex-shrink-0">
                  <div className="text-sm font-black text-gray-900">{p.tier}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{p.level}</div>
                </div>
                <p className="text-sm text-gray-600 font-roboto">{p.perk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals (27.8.5) */}
        <div className="mt-12 bg-gray-900 text-white rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-white text-gray-900 flex items-center justify-center flex-shrink-0">
              <UserPlus size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black font-comfortaa mb-1">Invite friends, earn coins</h2>
              <p className="text-sm text-gray-300 font-roboto leading-relaxed mb-4">
                Share your personal invite link. When a friend joins and gets active, you both earn
                Bara Coins — and inviting more friends unlocks milestone bonuses.
              </p>
              <Link
                to="/invite"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-bold px-5 py-2.5 rounded-full transition-colors text-sm"
              >
                Get your invite link <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 space-y-3">
          <Link
            to="/gamification"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            See your progress <ArrowRight size={18} />
          </Link>
          <p className="text-sm text-gray-500">
            Want exact amounts?{' '}
            <Link to="/coins-and-xp" className="font-bold text-gray-900 underline">
              Every earn &amp; spend option, with live numbers
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
