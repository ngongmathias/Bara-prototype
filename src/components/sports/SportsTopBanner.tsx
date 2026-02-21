import React, { useState, useEffect } from 'react';
import { useLiveScores, useFixtures } from '../../hooks/useLiveScores';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Trophy, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { SPORTS_CONFIG } from '@/config/sportsConfig';

export const SportsTopBanner = () => {
    const { sport: sportSlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeSport = (sportSlug && SPORTS_CONFIG[sportSlug as keyof typeof SPORTS_CONFIG]) || SPORTS_CONFIG.football;

    // Sync filters from URL
    const selectedLeagueId = searchParams.get('league') ? parseInt(searchParams.get('league')!) : undefined;
    const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data: matches, isLoading, error } = useFixtures({
        sport: activeSport.slug,
        league: selectedLeagueId,
        date: selectedDate,
        enabled: true
    });

    const isSuspended = (error as any)?.message === 'SPORTS_API_SUSPENDED';

    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'all') {
            searchParams.delete('league');
        } else {
            searchParams.set('league', val);
        }
        setSearchParams(searchParams);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchParams.set('date', e.target.value);
        setSearchParams(searchParams);
    };

    if (isLoading) {
        return (
            <div className="bg-[#121212] border-b border-white/10 h-[52px] flex items-center px-4 overflow-hidden">
                <div className="flex gap-4 animate-pulse w-full">
                    <div className="h-8 w-24 bg-white/5 rounded"></div>
                    <div className="h-8 w-24 bg-white/5 rounded"></div>
                    <div className="flex gap-4 flex-1 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-8 w-32 bg-white/5 rounded shrink-0"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#111] border-b border-white/10 text-white relative group h-[52px] flex items-center overflow-hidden w-full font-roboto-condensed">
            {/* League Selector (ESPN Style) */}
            <div className="h-full flex items-center bg-[#1a1a1a] z-20 shrink-0">
                <div className="relative h-full flex items-center px-3 border-r border-white/10 hover:bg-white/5 transition-colors group/select">
                    <select
                        value={selectedLeagueId || 'all'}
                        onChange={handleLeagueChange}
                        className="appearance-none bg-transparent text-[11px] font-black uppercase tracking-tight pr-5 pl-1 cursor-pointer outline-none z-10"
                    >
                        <option value="all" className="bg-[#1a1a1a]">Top Events</option>
                        {activeSport.scoreboardLeagues?.map(league => (
                            <option key={league.id} value={league.id} className="bg-[#1a1a1a]">
                                {league.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 text-gray-400 group-hover/select:text-white transition-colors" />
                </div>

                {/* Date Selector */}
                <div className="relative h-full flex items-center px-3 border-r border-white/10 hover:bg-white/5 transition-colors group/date overflow-hidden max-w-[100px]">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="appearance-none bg-transparent text-[11px] font-black uppercase tracking-tight cursor-pointer outline-none z-10 w-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-2">
                        <span className="text-[11px] font-black uppercase mr-1">
                            {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        <ChevronDown size={12} className="text-gray-400 group-hover/date:text-white transition-colors" />
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-[200px] top-1/2 -translate-y-1/2 z-20 bg-black/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-white/20 hover:scale-110"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex items-center space-x-0 overflow-x-auto scrollbar-hide h-full snap-x snap-mandatory flex-1"
            >
                {isSuspended ? (
                    <div className="px-6 flex items-center gap-2 border-r border-gray-100 h-full">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">
                            Service Offline • API Suspended
                        </span>
                    </div>
                ) : matches && matches.length > 0 ? (
                    matches.map((match: any) => (
                        <MatchTile key={match.fixture?.id || match.id} match={match} sport={activeSport.slug} />
                    ))
                ) : (
                    <div className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                        No {activeSport.name} matches for this selection
                    </div>
                )}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-[80px] top-1/2 -translate-y-1/2 z-20 bg-black/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-white/20 hover:scale-110"
            >
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Scores Link */}
            <Link
                to={`/sports/${activeSport.slug}/scores`}
                className="h-full px-5 border-l border-white/10 flex items-center justify-center bg-[#1a1a1a] hover:bg-white/5 transition-colors z-20 shrink-0 group/link"
            >
                <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">Scores</span>
                <ChevronRight size={14} className="ml-1 text-gray-500 group-hover:text-red-500 transition-colors" />
            </Link>
        </div>
    );
};

const MatchTile = ({ match, sport }: { match: any, sport: string }) => {
    const isFootball = sport === 'football';
    const isBasketball = sport === 'nba' || sport === 'basketball';
    const isCricket = sport === 'cricket';

    const status = match.fixture?.status?.short || match.status?.short || match.status || '';
    const isLive = ['1H', '2H', 'HT', 'LIVE', 'ET', 'P', '1Q', '2Q', '3Q', '4Q', 'OT'].includes(status);
    const isFinished = status === 'FT' || status === 'AOT' || status === 'Finished';

    let homeScore: string | number = 0;
    let awayScore: string | number = 0;

    if (isFootball) {
        homeScore = match.goals?.home ?? 0;
        awayScore = match.goals?.away ?? 0;
    } else if (isBasketball) {
        homeScore = match.scores?.home?.total ?? 0;
        awayScore = match.scores?.away?.total ?? 0;
    } else if (isCricket) {
        const home = match.scores?.home || {};
        const away = match.scores?.away || {};
        homeScore = home.runs ? `${home.runs}/${home.wickets || 0}` : '0';
        awayScore = away.runs ? `${away.runs}/${away.wickets || 0}` : '0';
    } else {
        homeScore = match.goals?.home ?? match.scores?.home?.total ?? 0;
        awayScore = match.goals?.away ?? match.scores?.away?.total ?? 0;
    }

    const homeTeam = match.teams?.home || {};
    const awayTeam = match.teams?.away || {};

    return (
        <Link
            to={`/sports/${sport}/match/${match.fixture?.id || match.id}`}
            className="flex flex-col justify-center h-full px-5 border-r border-white/10 hover:bg-white/5 transition-colors min-w-[150px] relative group snap-start overflow-hidden"
        >
            <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {homeTeam.logo && <img src={homeTeam.logo} alt="" className="w-3.5 h-3.5 object-contain" />}
                        <span className={`text-[11px] font-bold tracking-tight uppercase truncate ${isFinished && (homeScore < awayScore) ? 'text-gray-500' : 'text-white'}`}>
                            {homeTeam.code || homeTeam.name?.substring(0, 3)}
                        </span>
                    </div>
                    <span className={`text-[12px] font-black ${isFinished && (homeScore < awayScore) ? 'text-gray-500' : 'text-white'}`}>
                        {homeScore}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {awayTeam.logo && <img src={awayTeam.logo} alt="" className="w-3.5 h-3.5 object-contain" />}
                        <span className={`text-[11px] font-bold tracking-tight uppercase truncate ${isFinished && (awayScore < homeScore) ? 'text-gray-500' : 'text-white'}`}>
                            {awayTeam.code || awayTeam.name?.substring(0, 3)}
                        </span>
                    </div>
                    <span className={`text-[12px] font-black ${isFinished && (awayScore < homeScore) ? 'text-gray-500' : 'text-white'}`}>
                        {awayScore}
                    </span>
                </div>
            </div>

            <div className="mt-1 flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isLive ? 'text-red-500 flex items-center gap-1' : 'text-gray-500'}`}>
                    {isLive && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>}
                    {status} {isLive && (match.fixture?.status?.elapsed || match.status?.timer || '') + (isFootball ? "'" : "")}
                </span>
            </div>
        </Link>
    );
};
