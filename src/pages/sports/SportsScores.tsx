import { useState, useEffect } from 'react';

import { Link, useParams, useSearchParams } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout';

import { SportsTopBanner } from '../../components/sports/SportsTopBanner';

import { SportsSubNav } from '../../components/sports/SportsSubNav';

import { useFixtures } from '../../hooks/useLiveScores';

import { SPORTS_CONFIG } from '@/config/sportsConfig';

import type { Match } from '../../types/sports';

import { ChevronRight, Calendar as CalendarIcon, Filter, Trophy, Clock } from 'lucide-react';



export default function SportsScores() {

    const { sport: sportSlug } = useParams();

    const [searchParams, setSearchParams] = useSearchParams();

    const activeSport = (sportSlug && SPORTS_CONFIG[sportSlug as keyof typeof SPORTS_CONFIG]) || SPORTS_CONFIG.football;



    // Filters from URL

    const selectedLeagueId = searchParams.get('league') ? parseInt(searchParams.get('league')!) : undefined;

    const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];



    const { data: fixtures, isLoading, error } = useFixtures({

        sport: activeSport.slug,

        league: selectedLeagueId,

        date: selectedDate,

        enabled: true

    });



    const isSuspended = (error as any)?.message === 'SPORTS_API_SUSPENDED';



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



    const handleDateChange = (date: string) => {

        searchParams.set('date', date);

        setSearchParams(searchParams);

    };



    // Date navigation options (last 3, next 7)

    const dateOptions = [];

    for (let i = -3; i <= 7; i++) {

        const d = new Date();

        d.setDate(d.getDate() + i);

        dateOptions.push({

            full: d.toISOString().split('T')[0],

            day: d.toLocaleDateString('en-US', { weekday: 'short' }),

            date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

        });

    }



    return (

        <MainLayout>

            <div className="min-h-screen bg-[#f7f7f7] font-roboto-condensed">

                <SportsTopBanner />

                <SportsSubNav />



                <div className="bg-white border-b sticky top-[104px] z-30 shadow-sm overflow-hidden">

                    <div className="max-w-7xl mx-auto px-4 flex items-center h-14">

                        <div className="flex items-center gap-2 mr-6 border-r pr-6 h-full border-gray-100">

                            <h1 className="text-xl font-black uppercase tracking-tighter text-gray-900">{activeSport.name} Scores</h1>

                        </div>



                        <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar scroll-smooth flex-1">

                            {dateOptions.map((opt) => (

                                <button

                                    key={opt.full}

                                    onClick={() => handleDateChange(opt.full)}

                                    className={`flex-shrink-0 min-w-[80px] px-3 py-1.5 rounded transition-all border text-center ${selectedDate === opt.full

                                        ? 'bg-[#cc0000] text-white border-[#cc0000] shadow-sm'

                                        : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'

                                        }`}

                                >

                                    <div className={`text-[10px] font-black uppercase ${selectedDate === opt.full ? 'text-white/80' : 'text-gray-400'}`}>

                                        {opt.day}

                                    </div>

                                    <div className="text-xs font-black uppercase tracking-tighter">{opt.date}</div>

                                </button>

                            ))}

                        </div>

                    </div>

                </div>



                <div className="max-w-7xl mx-auto px-4 py-8">

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Main Content */}

                        <div className="lg:col-span-3 space-y-8">

                            {isSuspended ? (

                                <div className="bg-[#fff3f3] border border-[#ffcccc] rounded-lg p-6 flex items-start gap-4">

                                    <div className="bg-[#cc0000] p-2 rounded-full shrink-0">

                                        <Trophy size={20} className="text-white" />

                                    </div>

                                    <div className="flex-1">

                                        <h3 className="text-sm font-black uppercase tracking-tight text-[#cc0000]">Sports Data Service Interrupted</h3>

                                        <p className="text-xs text-[#660000] mt-1 font-medium leading-relaxed">

                                            The API subscription is currently suspended. Please visit <a href="https://dashboard.api-football.com" target="_blank" className="font-black underline mx-0.5">dashboard.api-football.com</a> to resume service.

                                        </p>

                                        <button

                                            onClick={() => window.location.reload()}

                                            className="mt-3 px-4 py-1.5 bg-[#cc0000] text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-700 transition-colors"

                                        >

                                            Retry

                                        </button>

                                    </div>

                                </div>

                            ) : isLoading ? (

                                <div className="space-y-6">

                                    {[1, 2, 3].map(i => (

                                        <div key={i} className="h-48 bg-white rounded shadow-sm animate-pulse border border-gray-100"></div>

                                    ))}

                                </div>

                            ) : leagueGroups.length > 0 ? (

                                leagueGroups.map((group: any) => (

                                    <div key={group.league.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">

                                        <div className="bg-[#1a1a1a] px-5 py-3 flex items-center justify-between">

                                            <div className="flex items-center gap-3">

                                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center p-1.5">

                                                    <img src={group.league.logo} alt="" className="w-full h-full object-contain" />

                                                </div>

                                                <div>

                                                    <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">{group.league.name}</h2>

                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{group.matches[0].league.country}</p>

                                                </div>

                                            </div>

                                            <Link to={`/sports/${activeSport.slug}/table/${group.league.id}`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-1">

                                                Standings <ChevronRight size={12} />

                                            </Link>

                                        </div>

                                        <div className="divide-y divide-gray-100">

                                            {group.matches.map((match: Match) => (

                                                <MatchRow key={match.fixture.id} match={match} sport={activeSport.slug} />

                                            ))}

                                        </div>

                                    </div>

                                ))

                            ) : (

                                <div className="bg-white rounded-lg p-20 text-center border border-gray-200 shadow-sm">

                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">

                                        <Clock size={40} className="text-gray-300" />

                                    </div>

                                    <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tighter">No events found</h3>

                                    <p className="text-gray-500 mt-2 font-medium">There are no matches scheduled for the selected date and filters.</p>

                                    <button

                                        onClick={() => setSearchParams({ date: new Date().toISOString().split('T')[0] })}

                                        className="mt-6 px-6 py-2 bg-black text-white rounded font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors"

                                    >

                                        Go to Today

                                    </button>

                                </div>

                            )}

                        </div>



                        {/* Sidebar: Filters & Top Events */}

                        <div className="space-y-6">

                            <div className="bg-white rounded shadow-sm border border-gray-200 p-5">

                                <div className="flex items-center gap-2 mb-4">

                                    <Filter size={16} className="text-gray-400" />

                                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Featured Leagues</h2>

                                </div>

                                <div className="space-y-1">

                                    <button

                                        onClick={() => { searchParams.delete('league'); setSearchParams(searchParams); }}

                                        className={`w-full text-left px-3 py-2 rounded text-xs font-black uppercase tracking-tighter transition ${!selectedLeagueId ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}

                                    >

                                        All Events

                                    </button>

                                    {activeSport.scoreboardLeagues?.map(league => (

                                        <button

                                            key={league.id}

                                            onClick={() => { searchParams.set('league', league.id.toString()); setSearchParams(searchParams); }}

                                            className={`w-full text-left px-3 py-2 rounded text-xs font-black uppercase tracking-tighter transition ${selectedLeagueId === league.id ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}

                                        >

                                            {league.name}

                                        </button>

                                    ))}

                                </div>

                            </div>



                            <div className="bg-[#cc0000] rounded shadow-lg p-5 text-white">

                                <Trophy size={20} className="mb-3 opacity-80" />

                                <h3 className="font-black text-lg uppercase leading-tight mb-2">Track Your Favorites</h3>

                                <p className="text-xs font-medium text-white/80 leading-relaxed">Sign in to follow your favorite teams and get personalized score notifications and news updates across all your devices.</p>

                                <Link to="/sign-in" className="mt-4 inline-block bg-white text-[#cc0000] px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">Sign In Now</Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </MainLayout>

    );

}



function MatchRow({ match, sport }: { match: Match, sport: string }) {

    const isLive = ['1H', '2H', 'HT', 'LIVE', 'ET', 'P', '1Q', '2Q', '3Q', '4Q', 'OT'].includes(match.fixture.status.short);

    const isFinished = match.fixture.status.short === 'FT' || match.fixture.status.short === 'AOT';

    const isFootball = sport === 'football';



    let homeScore = match.goals.home ?? 0;

    let awayScore = match.goals.away ?? 0;



    return (

        <Link

            to={`/sports/${sport}/match/${match.fixture.id}`}

            className="block p-5 hover:bg-gray-50 transition-colors group border-l-2 border-transparent hover:border-[#cc0000]"

        >

            <div className="flex items-center">

                <div className="w-24 shrink-0 pr-6 mr-6 flex flex-col items-center justify-center border-r border-gray-100">

                    <span className={`text-[12px] font-black uppercase tracking-tighter ${isLive ? 'text-[#cc0000]' : 'text-gray-400'}`}>

                        {match.fixture.status.short}

                    </span>

                    {isLive && (

                        <div className="flex items-center gap-1 mt-1">

                            <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse"></span>

                            <span className="text-[10px] font-black text-[#cc0000]">{match.fixture.status.elapsed}'</span>

                        </div>

                    )}

                    {!isLive && !isFinished && (

                        <div className="text-[11px] font-black text-gray-900 mt-0.5">

                            {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                        </div>

                    )}

                </div>



                <div className="flex-grow grid grid-cols-2 gap-8">

                    <div className="flex flex-col items-end gap-3 order-1">

                        <div className="flex items-center gap-4 w-full justify-end">

                            <span className={`text-[15px] font-black uppercase tracking-tighter ${isFinished && homeScore < awayScore ? 'text-gray-400' : 'text-gray-900'}`}>

                                {match.teams.home.name}

                            </span>

                            <img src={match.teams.home.logo} alt="" className="w-8 h-8 object-contain" />

                            <span className={`text-2xl font-black w-10 text-right ${isFinished && homeScore < awayScore ? 'text-gray-400' : 'text-gray-900'}`}>

                                {homeScore}

                            </span>

                        </div>

                    </div>



                    <div className="flex flex-col items-start gap-3 order-2">

                        <div className="flex items-center gap-4 w-full justify-start">

                            <span className={`text-2xl font-black w-10 text-left ${isFinished && awayScore < homeScore ? 'text-gray-400' : 'text-gray-900'}`}>

                                {awayScore}

                            </span>

                            <img src={match.teams.away.logo} alt="" className="w-8 h-8 object-contain" />

                            <span className={`text-[15px] font-black uppercase tracking-tighter ${isFinished && awayScore < homeScore ? 'text-gray-400' : 'text-gray-900'}`}>

                                {match.teams.away.name}

                            </span>

                        </div>

                    </div>

                </div>



                <div className="ml-8 outline outline-1 outline-gray-200 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:bg-gray-900 group-hover:outline-gray-900">

                    <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />

                </div>

            </div>

        </Link>

    );

}

