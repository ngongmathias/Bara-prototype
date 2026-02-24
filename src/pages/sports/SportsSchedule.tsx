import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { useFixtures } from '../../hooks/useLiveScores';
import type { Match } from '../../types/sports';
import { ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function SportsSchedule() {
    // Start from tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [selectedDate, setSelectedDate] = useState(tomorrow.toLocaleDateString('en-CA'));

    // Generate next 7 days starting from tomorrow
    const getDates = () => {
        const result = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            result.push({
                full: d.toLocaleDateString('en-CA'),
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
                                        ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-600'
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
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-xl font-black uppercase tracking-tighter text-gray-900 border-l-4 border-red-600 pl-3">
                                    Upcoming Schedule
                                </h1>
                            </div>

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
                                                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">{group.league.name}</h2>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.matches.map((match: Match) => (
                                                <ScheduleRow key={match.fixture.id} match={match} />
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
                            <div className="bg-[#121212] rounded-lg p-6 shadow-xl border border-white/5 text-white">
                                <h2 className="text-lg font-black uppercase tracking-tighter mb-4 text-red-500 italic">Ticket Alert</h2>
                                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                    Major European leagues are heading into the season finale. Book your tickets now for the upcoming derbies!
                                </p>
                                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-md uppercase tracking-tighter transition-colors">
                                    Browse Tickets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

function ScheduleRow({ match }: { match: Match }) {
    return (
        <div className="p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center">
                {/* Time Column */}
                <div className="w-24 shrink-0 border-r border-gray-100 pr-4 mr-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-900 mb-1">
                        <Clock className="w-3 h-3 text-red-600" />
                        <span className="text-xs font-black">
                            {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        GMT+2
                    </div>
                </div>

                {/* Teams */}
                <div className="flex-grow space-y-3">
                    {/* Home Team */}
                    <div className="flex items-center gap-3">
                        <img src={match.teams.home.logo} alt="" className="w-6 h-6 object-contain" />
                        <span className="text-sm font-bold text-gray-900">{match.teams.home.name}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3">
                        <img src={match.teams.away.logo} alt="" className="w-6 h-6 object-contain" />
                        <span className="text-sm font-bold text-gray-900">{match.teams.away.name}</span>
                    </div>
                </div>

                {/* Match Center Link */}
                <Link
                    to={`/sports/match/${match.fixture.id}`}
                    className="ml-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Match Centre <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
