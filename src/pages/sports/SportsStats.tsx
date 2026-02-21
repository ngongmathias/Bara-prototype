import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { useTopScorers } from '../../hooks/useTeamData';
import { ChevronRight, Target, ShieldCheck, User } from 'lucide-react';

const MAJOR_LEAGUES = [
    { id: 39, name: "Premier League", country: "England" },
    { id: 140, name: "La Liga", country: "Spain" },
    { id: 135, name: "Serie A", country: "Italy" },
    { id: 78, name: "Bundesliga", country: "Germany" },
    { id: 61, name: "Ligue 1", country: "France" }
];

export default function SportsStats() {
    const [selectedLeague, setSelectedLeague] = useState(MAJOR_LEAGUES[0]);

    const { data: scorers, isLoading } = useTopScorers({
        league: selectedLeague.id,
        season: 2024
    });

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                <SportsTopBanner />
                <SportsSubNav />

                {/* Page Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-8 h-8 text-black" />
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Statistical Leaders</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Player performance metrics and season-long goal-scoring charts.</p>
                    </div>
                </div>

                {/* League Filter */}
                <div className="bg-white border-b sticky top-[104px] z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
                            {MAJOR_LEAGUES.map((league) => (
                                <button
                                    key={league.id}
                                    onClick={() => setSelectedLeague(league)}
                                    className={`px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedLeague.id === league.id
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                                        }`}
                                >
                                    {league.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Stats View */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Top Scorers column (Main) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-600" />
                                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Top Goal Scorers</h2>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Season 2023/24</span>
                                </div>

                                {isLoading ? (
                                    <div className="p-6 space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse w-full"></div>
                                        ))}
                                    </div>
                                ) : (scorers && scorers.length > 0) ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[320px]">
                                            <thead>
                                                <tr className="bg-gray-100/50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <th className="px-4 md:px-6 py-3">Rank</th>
                                                    <th className="px-4 md:px-6 py-3">Player</th>
                                                    <th className="px-4 md:px-6 py-3 text-right text-red-600">G</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {scorers.slice(0, 10).map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                                        <td className="px-4 md:px-6 py-4 font-black text-xs text-gray-400">
                                                            #{index + 1}
                                                        </td>
                                                        <td className="px-4 md:px-6 py-4">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <div className="relative shrink-0">
                                                                    <img
                                                                        src={item.player.photo}
                                                                        alt=""
                                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm"
                                                                    />
                                                                    <img
                                                                        src={item.statistics[0].team.logo}
                                                                        alt=""
                                                                        className="w-3 h-3 md:w-4 md:h-4 absolute -bottom-1 -right-1 bg-white rounded-full shadow-sm"
                                                                    />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-[11px] md:text-xs font-black text-gray-900 group-hover:text-red-600 transform transition-transform group-hover:translate-x-1 uppercase tracking-tighter truncate">
                                                                        {item.player.name}
                                                                    </div>
                                                                    <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                                        {item.statistics[0].team.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 md:px-6 py-4 text-right">
                                                            <span className="text-lg md:text-xl font-black italic text-gray-900 leading-none">
                                                                {item.statistics[0].goals.total || 0}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-20 text-center">
                                        <h3 className="text-lg font-black uppercase tracking-tighter text-gray-400">No data available</h3>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar - Other Metric Categories */}
                        <div className="space-y-6">
                            <StatSummaryCard
                                icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
                                title="Clean Sheets"
                                lead="Coming Soon"
                                description="Defensive performance metrics for all keepers in the league."
                            />
                            <StatSummaryCard
                                icon={<Target className="w-5 h-5 text-blue-600" />}
                                title="Assists"
                                lead="Coming Soon"
                                description="The most creative playmakers in the current competition."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

function StatSummaryCard({ icon, title, lead, description }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h3>
            </div>
            <div className="mb-4">
                <span className="text-2xl font-black italic text-gray-300 uppercase leading-none">{lead}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
