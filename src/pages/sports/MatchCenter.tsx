import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchDetails } from '../../hooks/useLiveScores';
import type { Match, MatchEvent, MatchStatistic, Lineup } from '../../types/sports';

export default function MatchCenter() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'summary' | 'stats' | 'lineups'>('summary');

    // Fetch real match data from API
    const fixtureId = id ? parseInt(id) : undefined;
    const { match, events, statistics, lineups, isLoading, error } = useMatchDetails(fixtureId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin text-6xl mb-4">⚽</div>
                        <p className="text-gray-600">Loading match details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNavBar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            {error?.message || 'Unable to load match details. The match may not exist or the API limit may be reached.'}
                        </p>
                        <a href="/sports" className="text-blue-600 hover:underline">
                            ← Back to Sports Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <TopNavBar />

            {/* Match Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    {/* League & Venue Info */}
                    <div className="text-sm text-gray-600 mb-4">
                        {match.league.name} · {match.fixture.venue.name}, {match.fixture.venue.city}
                    </div>

                    {/* Score Display */}
                    <div className="flex items-center justify-center gap-8 mb-6">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1 max-w-xs">
                            <img
                                src={match.teams.home.logo}
                                alt={match.teams.home.name}
                                className="w-20 h-20 object-contain mb-3"
                            />
                            <h2 className="text-2xl font-bold text-center">{match.teams.home.name}</h2>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4">
                                <span className="text-5xl font-bold">{match.goals.home ?? 0}</span>
                                <span className="text-3xl text-gray-400">-</span>
                                <span className="text-5xl font-bold">{match.goals.away ?? 0}</span>
                            </div>
                            <div className={`mt-2 px-3 py-1 text-sm font-semibold rounded ${['LIVE', '1H', '2H', 'HT'].includes(match.fixture.status.short)
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-gray-800 text-white'
                                }`}>
                                {match.fixture.status.long}
                                {match.fixture.status.elapsed && ` (${match.fixture.status.elapsed}')`}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1 max-w-xs">
                            <img
                                src={match.teams.away.logo}
                                alt={match.teams.away.name}
                                className="w-20 h-20 object-contain mb-3"
                            />
                            <h2 className="text-2xl font-bold text-center">{match.teams.away.name}</h2>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="text-center text-sm text-gray-600">
                        {new Date(match.fixture.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-8">
                        <TabButton
                            active={activeTab === 'summary'}
                            onClick={() => setActiveTab('summary')}
                        >
                            Summary
                        </TabButton>
                        <TabButton
                            active={activeTab === 'stats'}
                            onClick={() => setActiveTab('stats')}
                        >
                            Stats
                        </TabButton>
                        <TabButton
                            active={activeTab === 'lineups'}
                            onClick={() => setActiveTab('lineups')}
                        >
                            Lineups
                        </TabButton>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {activeTab === 'summary' && <SummaryTab match={match} events={events} statistics={statistics} />}
                {activeTab === 'stats' && <StatsTab match={match} statistics={statistics} />}
                {activeTab === 'lineups' && <LineupsTab lineups={lineups} />}
            </div>
        </div>
    );
}

// Top Navigation Bar (same as other pages)
function TopNavBar() {
    const [isMoreSportsOpen, setIsMoreSportsOpen] = useState(false);

    return (
        <nav className="bg-black text-white">
            <div className="flex items-center justify-between px-4 h-12">
                <div className="flex items-center gap-6">
                    <div className="bg-[#CC0000] px-3 py-1 font-bold text-xl">ESPN</div>
                    <a href="#" className="text-sm hover:underline">Football</a>
                    <a href="#" className="text-sm hover:underline">NBA</a>
                    <a href="#" className="text-sm hover:underline">NFL</a>
                    <a href="#" className="text-sm hover:underline">MLB</a>
                    <a href="#" className="text-sm hover:underline">Cricket</a>
                    <div className="relative">
                        <button
                            onClick={() => setIsMoreSportsOpen(!isMoreSportsOpen)}
                            className="text-sm hover:underline"
                        >
                            More Sports
                        </button>
                        {isMoreSportsOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white text-black shadow-lg rounded p-4 w-48 z-50">
                                <a href="#" className="block py-1 hover:underline text-sm">Tennis</a>
                                <a href="#" className="block py-1 hover:underline text-sm">Golf</a>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <a href="#" className="text-sm hover:underline">Fantasy</a>
                    <button className="text-white">🔍</button>
                    <button className="text-white">👤</button>
                </div>
            </div>
        </nav>
    );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-2 font-semibold border-b-4 transition ${active
                ? 'border-blue-600 text-black'
                : 'border-transparent text-gray-600 hover:text-black'
                }`}
        >
            {children}
        </button>
    );
}

function SummaryTab({ match, events, statistics }: {
    match: Match;
    events: MatchEvent[] | undefined;
    statistics: MatchStatistic[] | undefined;
}) {
    // Extract basic stats for sidebar
    const homeStats = statistics?.find(s => s.team.id === match.teams.home.id);
    const awayStats = statistics?.find(s => s.team.id === match.teams.away.id);

    const getStat = (statType: string) => {
        const homeStat = homeStats?.statistics.find(s => s.type === statType);
        const awayStat = awayStats?.statistics.find(s => s.type === statType);
        return {
            home: homeStat?.value || 0,
            away: awayStat?.value || 0
        };
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Match Events</h3>
                    {(!events || events.length === 0) ? (
                        <p className="text-gray-500 text-center py-8">No events available for this match</p>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event, idx) => (
                                <EventCard key={idx} event={event} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-4">
                <div className="bg-white rounded-lg p-4">
                    <h3 className="font-bold mb-4">Key Stats</h3>
                    {statistics && statistics.length > 0 ? (
                        <div className="space-y-4">
                            <StatBar
                                label="Ball Possession"
                                homeValue={parseFloat(getStat('Ball Possession').home?.toString().replace('%', '') || '0')}
                                awayValue={parseFloat(getStat('Ball Possession').away?.toString().replace('%', '') || '0')}
                                unit="%"
                            />
                            <StatBar
                                label="Total Shots"
                                homeValue={parseInt(getStat('Total Shots').home?.toString() || '0')}
                                awayValue={parseInt(getStat('Total Shots').away?.toString() || '0')}
                            />
                            <StatBar
                                label="Shots on Goal"
                                homeValue={parseInt(getStat('Shots on Goal').home?.toString() || '0')}
                                awayValue={parseInt(getStat('Shots on Goal').away?.toString() || '0')}
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No statistics available</p>
                    )}
                </div>
            </aside>
        </div>
    );
}

function EventCard({ event }: { event: MatchEvent }) {
    const getIcon = () => {
        if (event.type === 'Goal') return '⚽';
        if (event.type === 'Card') return event.detail.includes('Yellow') ? '🟨' : '🟥';
        if (event.type === 'subst') return '🔄';
        return '•';
    };

    return (
        <div className="flex items-start gap-4 border-l-4 border-blue-600 pl-4">
            <div className="flex-shrink-0 w-12 text-center">
                <div className="text-2xl">{getIcon()}</div>
                <div className="text-xs font-bold mt-1">{event.time.elapsed}'</div>
            </div>
            <div className="flex-1">
                <div className="font-semibold">
                    {event.type === 'Goal' && `Goal - ${event.player.name}`}
                    {event.type === 'Card' && `${event.detail} - ${event.player.name}`}
                    {event.type === 'subst' && `Substitution - ${event.player.name} → ${event.assist?.name || 'Unknown'}`}
                    {!['Goal', 'Card', 'subst'].includes(event.type) && `${event.detail} - ${event.player.name}`}
                </div>
                {event.type === 'Goal' && event.assist && (
                    <div className="text-sm text-gray-600">Assist: {event.assist.name}</div>
                )}
                {event.comments && (
                    <div className="text-sm text-gray-600">{event.comments}</div>
                )}
            </div>
        </div>
    );
}

function StatBar({ label, homeValue, awayValue, unit = '' }: { label: string; homeValue: number; awayValue: number; unit?: string }) {
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{homeValue}{unit}</span>
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold">{awayValue}{unit}</span>
            </div>
            <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="bg-blue-600"
                    style={{ width: `${homePercent}%` }}
                ></div>
                <div
                    className="bg-red-600"
                    style={{ width: `${awayPercent}%` }}
                ></div>
            </div>
        </div>
    );
}

function StatsTab({ match, statistics }: { match: Match; statistics: MatchStatistic[] | undefined }) {
    if (!statistics || statistics.length === 0) {
        return (
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Match Statistics</h3>
                <p className="text-gray-500 text-center py-12">No statistics available for this match</p>
            </div>
        );
    }

    const homeStats = statistics.find(s => s.team.id === match.teams.home.id);
    const awayStats = statistics.find(s => s.team.id === match.teams.away.id);

    const statTypes = homeStats?.statistics.map(s => s.type) || [];

    return (
        <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-6">Match Statistics</h3>
            <div className="space-y-6">
                {statTypes.map((statType) => {
                    const homeStat = homeStats?.statistics.find(s => s.type === statType);
                    const awayStat = awayStats?.statistics.find(s => s.type === statType);

                    // Parse values, handling percentages
                    const homeVal = parseFloat(homeStat?.value?.toString().replace('%', '') || '0');
                    const awayVal = parseFloat(awayStat?.value?.toString().replace('%', '') || '0');
                    const unit = homeStat?.value?.toString().includes('%') ? '%' : '';

                    return (
                        <StatBar
                            key={statType}
                            label={statType}
                            homeValue={homeVal}
                            awayValue={awayVal}
                            unit={unit}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function LineupsTab({ lineups }: { lineups: Lineup[] | undefined }) {
    if (!lineups || lineups.length === 0) {
        return (
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Starting Lineups</h3>
                <p className="text-gray-500 text-center py-12">Lineups not available for this match</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-6">Starting Lineups</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {lineups.map((lineup, idx) => (
                    <div key={idx}>
                        <div className="flex items-center gap-3 mb-4">
                            <img src={lineup.team.logo} alt={lineup.team.name} className="w-8 h-8" />
                            <h4 className="font-bold text-lg">{lineup.team.name} ({lineup.formation})</h4>
                        </div>
                        <div className="space-y-2">
                            {lineup.startXI.map((player) => (
                                <div key={player.player.id} className="p-2 bg-gray-50 rounded text-sm flex items-center gap-2">
                                    <span className="font-semibold text-gray-600 w-6">{player.number}</span>
                                    <span>{player.player.name}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{player.pos}</span>
                                </div>
                            ))}
                        </div>

                        {/* Substitutes */}
                        {lineup.substitutes.length > 0 && (
                            <>
                                <h5 className="font-bold text-sm mt-4 mb-2 text-gray-600">Substitutes</h5>
                                <div className="space-y-1">
                                    {lineup.substitutes.map((player) => (
                                        <div key={player.player.id} className="p-2 bg-gray-50 rounded text-sm flex items-center gap-2 opacity-70">
                                            <span className="font-semibold text-gray-600 w-6">{player.number}</span>
                                            <span>{player.player.name}</span>
                                            <span className="text-xs text-gray-500 ml-auto">{player.pos}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
