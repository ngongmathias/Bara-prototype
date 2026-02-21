import React from 'react';
import { useLiveScores } from '../../hooks/useLiveScores';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Trophy } from 'lucide-react';

export const SportsTopBanner = () => {
    const { data: liveMatches, isLoading } = useLiveScores({
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
        <div className="bg-[#121212] border-b border-white/10 text-white relative group h-[52px] flex items-center overflow-hidden">
            {/* League Quick Select / Label */}
            <div className="h-full px-4 border-r border-white/10 flex items-center justify-center bg-[#1a1a1a] z-10 hidden md:flex shrink-0">
                <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Match Centre</span>
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
                className="flex items-center space-x-0 overflow-x-auto scrollbar-hide h-full"
            >
                {liveMatches && liveMatches.length > 0 ? (
                    liveMatches.map((match) => (
                        <MatchTile key={match.fixture.id} match={match} />
                    ))
                ) : (
                    <div className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                        No Live Matches Currently • Stay Tuned for Upcoming Fixtures
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

const MatchTile = ({ match }: { match: any }) => {
    const isLive = ['1H', '2H', 'HT', 'LIVE', 'ET', 'P'].includes(match.fixture.status.short);
    const isFinished = match.fixture.status.short === 'FT';

    return (
        <Link
            to={`/sports/match/${match.fixture.id}`}
            className="flex flex-col justify-center h-full px-6 border-r border-white/10 hover:bg-white/5 transition-colors min-w-[160px] relative group"
        >
            {/* League Indicator (Small) */}
            <div className="absolute top-1 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <img src={match.league.logo} alt={match.league.name} className="w-3 h-3 grayscale" />
            </div>

            <div className="space-y-1">
                {/* Home Team */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-4 h-4 object-contain" />
                        <span className={`text-[11px] font-bold tracking-tight uppercase ${isFinished && (match.goals.home < match.goals.away) ? 'text-gray-500' : 'text-white'}`}>
                            {match.teams.home.code || match.teams.home.name.substring(0, 3)}
                        </span>
                    </div>
                    <span className={`text-[13px] font-black ${isFinished && (match.goals.home < match.goals.away) ? 'text-gray-500' : 'text-white'}`}>
                        {match.goals.home ?? 0}
                    </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-4 h-4 object-contain" />
                        <span className={`text-[11px] font-bold tracking-tight uppercase ${isFinished && (match.goals.away < match.goals.home) ? 'text-gray-500' : 'text-white'}`}>
                            {match.teams.away.code || match.teams.away.name.substring(0, 3)}
                        </span>
                    </div>
                    <span className={`text-[13px] font-black ${isFinished && (match.goals.away < match.goals.home) ? 'text-gray-500' : 'text-white'}`}>
                        {match.goals.away ?? 0}
                    </span>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-1 flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isLive ? 'text-red-500 flex items-center gap-1' : 'text-gray-500'}`}>
                    {isLive && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>}
                    {match.fixture.status.short} {isLive && match.fixture.status.elapsed + "'"}
                </span>
            </div>
        </Link>
    );
};
