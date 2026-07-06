import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamificationService, DEFAULT_ECONOMY_SETTINGS } from '@/lib/gamificationService';
import { Zap, Coins, Crown, Gift, Target, Flame, Trophy, UserPlus, ShieldAlert, ArrowRight } from 'lucide-react';

const PRESTIGE_TIERS = [
    { tier: 'Explorer', level: 'Level 1–10', perk: 'Where everyone starts.' },
    { tier: 'Bronze', level: 'Level 11+', perk: 'Exclusive Bronze profile theme, free.' },
    { tier: 'Silver', level: 'Level 21+', perk: 'Two daily spins instead of one.' },
    { tier: 'Gold', level: 'Level 41+', perk: 'Bonus coins on everything you earn.' },
    { tier: 'Diamond', level: 'Level 71+', perk: 'A free ad-free week, every month.' },
];

/**
 * 27.8.6 — user-facing "How coins & XP work" explainer. Every amount is read
 * live from gamification_settings (same keys as the admin Economy Settings
 * panel), so admin tuning changes this page too — no hardcoded numbers.
 */
export default function CoinsAndXpPage() {
    const [settings, setSettings] = useState<Record<string, number>>(() => {
        const defaults: Record<string, number> = {};
        Object.entries(DEFAULT_ECONOMY_SETTINGS).forEach(([k, v]) => { defaults[k] = v.value; });
        return defaults;
    });

    useEffect(() => {
        GamificationService.getEconomySettings().then(setSettings);
    }, []);

    const byGroup = (group: string) =>
        Object.entries(DEFAULT_ECONOMY_SETTINGS)
            .filter(([, def]) => def.group === group)
            .map(([key, def]) => ({ key, label: def.label, value: settings[key] ?? def.value }));

    const xpEarns = byGroup('XP rewards');
    const coinEarns = byGroup('Coin rewards');
    const coinCosts = byGroup('Coin costs');
    const limits = byGroup('Limits');
    const leaderboardPrizes = byGroup('Leaderboard prizes');

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="How Coins & XP Work | BARA Afrika"
                description="Plain-language guide to XP, levels, prestige perks and every way to earn and spend Bara Coins."
                keywords={['Bara Coins', 'XP', 'Levels', 'Prestige', 'Rewards']}
            />
            <Header />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-3">Coins &amp; XP, explained</h1>
                    <p className="text-lg text-gray-600 font-roboto">
                        Everything you can earn on BARA Afrika, what it's worth, and where to spend it.
                    </p>
                </div>

                {/* XP → levels → prestige */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-gray-900" />
                        <h2 className="text-2xl font-black text-gray-900 font-comfortaa">XP, Levels &amp; Prestige</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-roboto mb-4">
                        <span className="font-bold text-gray-900">XP is your status.</span> Almost everything you do earns XP.
                        XP raises your Level, and your Level unlocks Prestige tiers — each with a real perk. Daily streaks
                        multiply your XP (3 days = 1.2×, 7 days = 1.5×, 30 days = 2×), so showing up daily is the fastest way to climb.
                    </p>
                    <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden mb-4">
                        {PRESTIGE_TIERS.map((p) => (
                            <div key={p.tier} className="flex items-center gap-4 p-3.5">
                                <div className="w-24 flex-shrink-0">
                                    <div className="text-sm font-black text-gray-900">{p.tier}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{p.level}</div>
                                </div>
                                <p className="text-sm text-gray-600 font-roboto">{p.perk}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 text-[11px] uppercase font-black text-gray-400 tracking-wider border-b border-gray-200">How you earn XP</div>
                        {xpEarns.map((row) => (
                            <div key={row.key} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-700">{row.label}</span>
                                <span className="text-sm font-black text-gray-900">+{row.value.toLocaleString()} XP</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-sm text-gray-700">Missions, achievements &amp; the daily spin</span>
                            <span className="text-sm font-black text-gray-900">varies</span>
                        </div>
                    </div>
                </section>

                {/* Earning coins */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Coins className="w-5 h-5 text-gray-900" />
                        <h2 className="text-2xl font-black text-gray-900 font-comfortaa">Earning Bara Coins</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-roboto mb-4">
                        <span className="font-bold text-gray-900">Coins are your spendable reward.</span> Every way to earn them:
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        {coinEarns.map((row) => (
                            <div key={row.key} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                                <span className="text-sm text-gray-700">{row.label}</span>
                                <span className="text-sm font-black text-gray-900">
                                    {row.key === 'coins.levelup_per_level' ? `+${row.value} × your new level` : `+${row.value.toLocaleString()} coins`}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><Target size={13} /> Daily &amp; weekly missions</span>
                            <span className="text-sm font-black text-gray-900">per mission</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><Gift size={13} /> Daily spin</span>
                            <span className="text-sm font-black text-gray-900">surprise prize</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><Trophy size={13} /> Achievements</span>
                            <span className="text-sm font-black text-gray-900">per badge</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                            <span className="text-sm text-gray-700 flex items-center gap-1.5"><UserPlus size={13} /> Inviting friends</span>
                            <span className="text-sm font-black text-gray-900">you both earn</span>
                        </div>
                        {leaderboardPrizes.length > 0 && (
                            <div className="px-4 py-2.5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm text-gray-700 flex items-center gap-1.5"><Crown size={13} /> Weekly leaderboard prizes</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {leaderboardPrizes.map((row) => (
                                        <span key={row.key} className="text-[11px] font-bold bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-700">
                                            {row.label}: {row.value.toLocaleString()} coins
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        <Link to="/invite" className="font-bold text-gray-900 underline">Invite friends</Link> — when a friend
                        joins and gets active you both earn coins, with milestone bonuses as your invites grow.
                    </p>
                </section>

                {/* Spending coins */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-5 h-5 text-gray-900" />
                        <h2 className="text-2xl font-black text-gray-900 font-comfortaa">Spending Bara Coins</h2>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        {coinCosts.map((row) => (
                            <div key={row.key} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-700">{row.label}</span>
                                <span className="text-sm font-black text-gray-900">{row.value.toLocaleString()} coins</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
                            <span className="text-sm text-gray-700">Marketplace ads that accept coins</span>
                            <span className="text-sm font-black text-gray-900">seller sets the price</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        Some sellers let you pay for their marketplace ads with coins — look for the coin price on the ad.
                    </p>
                </section>

                {/* Limits */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="w-5 h-5 text-gray-900" />
                        <h2 className="text-2xl font-black text-gray-900 font-comfortaa">Fair-play limits</h2>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        {limits.map((row) => (
                            <div key={row.key} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-700">{row.label}</span>
                                <span className="text-sm font-black text-gray-900">{row.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* No cash value */}
                <div className="bg-gray-900 text-white rounded-2xl p-5 mb-10">
                    <p className="text-sm font-roboto leading-relaxed">
                        <span className="font-black">The fine print:</span> Bara Coins are a reward inside BARA Afrika.
                        They have <span className="font-black">no cash value and cannot be withdrawn</span>, exchanged for
                        money, or transferred outside the platform.
                    </p>
                </div>

                <div className="text-center">
                    <Link
                        to="/gamification"
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-6 py-3 rounded-full transition-colors"
                    >
                        See your progress <ArrowRight size={18} />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
