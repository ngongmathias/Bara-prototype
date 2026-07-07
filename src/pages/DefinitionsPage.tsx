import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen } from 'lucide-react';

// 28.6 — Important Definitions: the platform's terms in plain language,
// drafted from the product docs for team review.
const DEFINITIONS: { term: string; definition: string }[] = [
    { term: 'BARA Coins', definition: 'The spendable in-app reward. Earned through activity (missions, achievements, level-ups, referrals, the daily spin, weekly leaderboard prizes) and spent on perks like ad-free browsing, boosts, Streak Shields and profile themes. Coins have no cash value and cannot be withdrawn or exchanged for money.' },
    { term: 'XP (Experience Points)', definition: 'Your status score. Almost every activity earns XP; it only ever goes up. XP determines your Level.' },
    { term: 'Level & Prestige Tier', definition: 'Your Level rises with XP. Levels unlock Prestige tiers — Explorer (1–10), Bronze (11+), Silver (21+), Gold (41+), Diamond (71+) — each with a real perk (free theme, double daily spins, bonus coin earnings, monthly ad-free week).' },
    { term: 'Daily Streak', definition: 'Consecutive days you open BARA Afrika. Longer streaks multiply the XP you earn (bigger at 3, 7 and 30 days). Missing a day resets it — unless a Streak Shield saves it.' },
    { term: 'Streak Shield', definition: 'A one-time protector that forgives a single missed day so your streak survives. You get one free each month and can buy more with coins.' },
    { term: 'Missions', definition: 'Small daily and weekly goals (listen to songs, browse the marketplace, share something). Completing and claiming a mission pays XP and coins.' },
    { term: 'Achievements', definition: 'One-off badges for milestones — first playlist, first ad, 7-day streak, becoming an Ambassador. Each pays a one-time XP and coin bonus.' },
    { term: 'Daily Spin', definition: 'A once-per-day prize wheel (twice a day from Silver tier) paying a random amount of coins or XP.' },
    { term: 'Referral', definition: 'Invite a friend with your personal link or code. When they join and become active, you both earn coins — with milestone bonuses at 5, 10 and 25 activated referrals (the "Ambassador" badge among them).' },
    { term: 'Ad (marketplace ad)', definition: 'An item, service, property, vehicle or job posted on the BARA Marketplace by a seller.' },
    { term: 'Listing (business listing)', definition: 'A business\'s entry in the BARA Business Directory — not a marketplace item.' },
    { term: 'Storefront', definition: 'A seller\'s own branded page on the marketplace collecting all their ads, reviews and contact details.' },
    { term: 'Boost', definition: 'A coin-paid promotion that gives an ad or a music track extra visibility for a period of time.' },
    { term: 'Verified badge', definition: 'A mark shown on business and artist accounts whose identity documents have been reviewed and approved by the BARA Afrika team.' },
    { term: 'Coin-accepting ad', definition: 'A marketplace ad whose seller chose to accept BARA Coins as payment (instead of, or alongside, cash). The buyer\'s coins transfer directly to the seller. This is barter inside the platform — not a currency exchange.' },
    { term: 'Business Package', definition: 'A paid plan for businesses (advertising quotas, featured placement, storefront promotion). Requested on the site; our team completes payment and activation with you directly until online payment launches.' },
    { term: 'Ad-free pass', definition: 'A coin-paid perk that hides banner advertising for 24 hours (Diamond-tier members get a free week monthly).' },
];

const DefinitionsPage = () => {
    const lastUpdated = 'July 7, 2026';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 font-comfortaa">Important Definitions</h1>
                    <p className="text-gray-500">Plain-language meanings of the terms used across BARA Afrika · Last updated: {lastUpdated}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border divide-y divide-gray-100 overflow-hidden">
                    {DEFINITIONS.map((d) => (
                        <div key={d.term} className="p-6 sm:px-10">
                            <h2 className="font-black text-gray-900 mb-1">{d.term}</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">{d.definition}</p>
                        </div>
                    ))}
                </div>

                <p className="text-center text-sm text-gray-500 mt-8">
                    See also:{' '}
                    <a href="/coins-and-xp" className="font-semibold text-gray-900 underline">How Coins &amp; XP work</a> ·{' '}
                    <a href="/terms" className="font-semibold text-gray-900 underline">Terms of Service</a> ·{' '}
                    <a href="/privacy" className="font-semibold text-gray-900 underline">Privacy Policy</a> ·{' '}
                    <a href="/content-terms" className="font-semibold text-gray-900 underline">Content Terms</a> ·{' '}
                    <a href="/registration-disclaimer" className="font-semibold text-gray-900 underline">Registration Disclaimer</a>
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default DefinitionsPage;
