import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { useFixtures } from '../../hooks/useLiveScores';
import type { Match } from '../../types/sports';
import { ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const mockMatches: any[] = [
    {
        fixture: { id: 1, date: '2024-02-21T20:00:00Z', status: { short: 'FT' } },
        league: { id: 1, name: 'English League Championship', logo: '' },
        teams: { home: { name: 'Coventry City', logo: '' }, away: { name: 'Middlesbrough', logo: '' } },
        goals: { home: 2, away: 1 }
    }
];

export default function SportsScores() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Generate last 2 days and next 4 days for the selector
    const getDates = () => {
        const result = [];
        for (let i = -2; i <= 4; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            result.push({
                full: d.toISOString().split('T')[0],
                day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()
            });
        }
        return result;
    };

    const dateOptions = getDates();

    const { data: fixtures, isLoading } = useFixtures({
        date: selectedDate
    });

    // Group fixtures by league
    const groupedFixtures = fixtures?.reduce((acc: Record<string, { league: any, matches: Match[] }>, match: Match) => {
        const leagueId = match.league.id;
        if (!acc[leagueId]) {
            acc[leagueId] = {
                league: match.league,
                matches: []
            };
        }
        acc[leagueId].matches.push(match);
        return acc;
    }, {});

    const leagueGroups = groupedFixtures ? Object.values(groupedFixtures) : [];

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* High-Fidelity Navigation Tier */}
                <SportsTopBanner />
                <SportsSubNav />

                {/* Date Selector */}
                <div className="bg-white border-b sticky top-[104px] z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
                            {dateOptions.map((opt) => (
                                <button
                                    key={opt.full}
                                    onClick={() => setSelectedDate(opt.full)}
                                    className={`flex-shrink-0 min-w-[100px] px-4 py-2 rounded-md transition-all border ${selectedDate === opt.full
                                        ? 'bg-black text-white border-black shadow-md scale-105'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                                        }`}
                                >
                                    <div className="text-[10px] font-bold tracking-tighter opacity-70">{opt.day}</div>
                                    <div className="text-xs font-black">{opt.date}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Matches */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-40 bg-white rounded-lg animate-pulse border border-gray-100 shadow-sm"></div>
                                    ))}
                                </div>
                            ) : leagueGroups.length > 0 ? (
                                leagueGroups.map((group: any) => (
                                    <div key={group.league.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <img src={group.league.logo} alt="" className="w-5 h-5 object-contain" />
                                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-800">{group.league.name}</h2>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.matches.map((match: Match) => (
                                                <MatchRow key={match.fixture.id} match={match} />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                                    <div className="text-4xl mb-4">📅</div>
                                    <h3 className="font-black text-xl text-gray-900 uppercase tracking-tighter">No Events Scheduled</h3>
                                    <p className="text-gray-500 mt-2">There are no matches currently scheduled for this date.</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h2 className="font-comfortaa font-semibold text-lg mb-4">Top News</h2>
                                <div className="space-y-4">
                                    <NewsCard
                                        title="Transfer deadline day: All the latest moves"
                                        time="2 hours ago"
                                        source="Bara Sports"
                                    />
                                    <NewsCard
                                        title="Champions League draw: Key matchups revealed"
                                        time="5 hours ago"
                                        source="Bara Sports"
                                    />
                                    <NewsCard
                                        title="Injury update: Star player out for 3 weeks"
                                        time="1 day ago"
                                        source="Bara Sports"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

function MatchRow({ match }: { match: Match }) {
    const isLive = ['1H', '2H', 'HT', 'LIVE', 'ET', 'P'].includes(match.fixture.status.short);
    const isFinished = match.fixture.status.short === 'FT';

    return (
        <Link
            to={`/sports/match/${match.fixture.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors group"
        >
            <div className="flex items-center">
                {/* Time/Status Column */}
                <div className="w-20 shrink-0 border-r border-gray-100 pr-4 mr-4 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isLive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                        {isLive ? `${match.fixture.status.elapsed}'` : match.fixture.status.short}
                    </span>
                    {!isLive && !isFinished && (
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>

                {/* Teams & Scores */}
                <div className="flex-grow space-y-2">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={match.teams.home.logo} alt="" className="w-5 h-5 object-contain" />
                            <span className={`text-sm font-bold tracking-tight ${isFinished && match.goals.home! < match.goals.away! ? 'text-gray-500' : 'text-gray-900'}`}>
                                {match.teams.home.name}
                            </span>
                        </div>
                        <span className={`text-lg font-black ${isFinished && match.goals.home! < match.goals.away! ? 'text-gray-500' : 'text-gray-900'}`}>
                            {match.goals.home ?? '-'}
                        </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={match.teams.away.logo} alt="" className="w-5 h-5 object-contain" />
                            <span className={`text-sm font-bold tracking-tight ${isFinished && match.goals.away! < match.goals.home! ? 'text-gray-500' : 'text-gray-900'}`}>
                                {match.teams.away.name}
                            </span>
                        </div>
                        <span className={`text-lg font-black ${isFinished && match.goals.away! < match.goals.home! ? 'text-gray-500' : 'text-gray-900'}`}>
                            {match.goals.away ?? '-'}
                        </span>
                    </div>
                </div>

                {/* Details Link */}
                <div className="ml-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <div className="bg-gray-100 p-1.5 rounded-full">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function NewsCard({ title, time, source }: { title: string; time: string; source: string }) {
    return (
        <div className="pb-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <h3 className="font-semibold text-sm leading-snug mb-1">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{source}</span>
                <span>•</span>
                <span>{time}</span>
            </div>
        </div>
    );
}
