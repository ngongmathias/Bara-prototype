import React from 'react';
import { useLiveScores } from '../../hooks/useLiveScores';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Trophy } from 'lucide-react';
import { SPORTS_CONFIG } from '@/config/sportsConfig';

export const SportsTopBanner = () => {
    const { sport: sportSlug } = useParams();
    const activeSport = (sportSlug && SPORTS_CONFIG[sportSlug as keyof typeof SPORTS_CONFIG]) || SPORTS_CONFIG.football;

    const { data: liveMatches, isLoading } = useLiveScores({
        sport: activeSport.slug,
        enabled: true,
        refetchInterval: 60000
    });

    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#121212] border-b border-white/10 h-[52px] flex items-center px-4 overflow-hidden">
                <div className="flex gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-8 w-32 bg-white/5 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#121212] border-b border-white/10 text-white relative group h-[52px] flex items-center overflow-hidden w-full">
            {/* League Quick Select / Label */}
            <div className="h-full px-4 border-r border-white/10 flex items-center justify-center bg-[#1a1a1a] z-10 hidden md:flex shrink-0">
                <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{activeSport.name} Scores</span>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-[110px] top-1/2 -translate-y-1/2 z-20 bg-black/80 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-white/10 hover:bg-black"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex items-center space-x-0 overflow-x-auto scrollbar-hide h-full snap-x snap-mandatory flex-1"
            >
                {liveMatches && liveMatches.length > 0 ? (
                    liveMatches.map((match: any) => (
                        <MatchTile key={match.fixture?.id || match.id} match={match} sport={activeSport.slug} />
                    ))
                ) : (
                    <div className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                        No {activeSport.name} Matches Currently • Stay Tuned
                    </div>
                )}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-white/10 hover:bg-black"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

const MatchTile = ({ match, sport }: { match: any, sport: string }) => {
    // API-Sports structure varies by sport
    const isFootball = sport === 'football';
    const isBasketball = sport === 'nba' || sport === 'basketball';
    const isCricket = sport === 'cricket';

    // Normalize Status
    const status = match.fixture?.status?.short || match.status?.short || match.status || '';
    const isLive = ['1H', '2H', 'HT', 'LIVE', 'ET', 'P', '1Q', '2Q', '3Q', '4Q', 'OT'].includes(status);
    const isFinished = status === 'FT' || status === 'AOT' || status === 'Finished';

    // Normalize Scores
    let homeScore: string | number = 0;
    let awayScore: string | number = 0;

    if (isFootball) {
        homeScore = match.goals?.home ?? 0;
        awayScore = match.goals?.away ?? 0;
    } else if (isBasketball) {
        homeScore = match.scores?.home?.total ?? 0;
        awayScore = match.scores?.away?.total ?? 0;
    } else if (isCricket) {
        // Cricket notation: 158/7 (20 ov)
        const home = match.scores?.home || {};
        const away = match.scores?.away || {};
        homeScore = home.runs ? `${home.runs}/${home.wickets || 0}` : '0';
        awayScore = away.runs ? `${away.runs}/${away.wickets || 0}` : '0';
    } else {
        // Generic fallback
        homeScore = match.goals?.home ?? match.scores?.home?.total ?? 0;
        awayScore = match.goals?.away ?? match.scores?.away?.total ?? 0;
    }

    // Teams
    const homeTeam = match.teams?.home || {};
    const awayTeam = match.teams?.away || {};

    return (
        <Link
            to={`/sports/${sport}/match/${match.fixture?.id || match.id}`}
            className="flex flex-col justify-center h-full px-6 border-r border-white/10 hover:bg-white/5 transition-colors min-w-[170px] relative group snap-start"
        >
            {/* League Indicator (Small) */}
            {match.league?.logo && (
                <div className="absolute top-1 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <img src={match.league.logo} alt={match.league.name} className="w-3 h-3 grayscale" />
                </div>
            )}

            <div className="space-y-1">
                {/* Home Team */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="w-4 h-4 object-contain" />}
                        <span className={`text-[11px] font-bold tracking-tight uppercase ${isFinished && (homeScore < awayScore) ? 'text-gray-500' : 'text-white'}`}>
                            {homeTeam.code || homeTeam.name?.substring(0, 3)}
                        </span>
                    </div>
                    <span className={`text-[13px] font-black ${isFinished && (homeScore < awayScore) ? 'text-gray-500' : 'text-white'}`}>
                        {homeScore}
                    </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="w-4 h-4 object-contain" />}
                        <span className={`text-[11px] font-bold tracking-tight uppercase ${isFinished && (awayScore < homeScore) ? 'text-gray-500' : 'text-white'}`}>
                            {awayTeam.code || awayTeam.name?.substring(0, 3)}
                        </span>
                    </div>
                    <span className={`text-[13px] font-black ${isFinished && (awayScore < homeScore) ? 'text-gray-500' : 'text-white'}`}>
                        {awayScore}
                    </span>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-1 flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isLive ? 'text-red-500 flex items-center gap-1' : 'text-gray-500'}`}>
                    {isLive && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>}
                    {status} {isLive && (match.fixture?.status?.elapsed || match.status?.timer || '') + (isFootball ? "'" : "")}
                </span>
                {isCricket && match.scores?.home?.overs && (
                    <span className="text-[8px] text-gray-400 font-medium">
                        {(status === 'LIVE' || isLive) ? `(${match.scores.home.overs} ov)` : ''}
                    </span>
                )}
            </div>
        </Link>
    );
};
