import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchDetails } from '../../hooks/useLiveScores';
import type { Match, MatchEvent, MatchStatistic, Lineup } from '../../types/sports';
import { MainLayout } from '@/components/layout/MainLayout';

export default function MatchCenter() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'summary' | 'stats' | 'lineups'>('summary');

    const { data: matchData, isLoading, error } = useMatchDetails(id ? parseInt(id) : 0);
    const match = matchData?.fixture;
    const events = matchData?.events;
    const statistics = matchData?.statistics;
    const lineups = matchData?.lineups;

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin text-6xl mb-4">⚽</div>
                        <p className="text-gray-600">Loading match details...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !match) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 py-12">
                        <div className="bg-white rounded-lg p-8 text-center">
                            <div className="text-6xl mb-4">❌</div>
                            <h2 className="text-2xl font-comfortaa font-semibold mb-2">Match Not Found</h2>
                            <p className="text-gray-600 mb-6">
                                {error?.message || 'Unable to load match details. The match may not exist or the API limit may be reached.'}
                            </p>
                            <a href="/sports" className="text-black hover:underline">
                                ← Back to Sports Home
                            </a>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Match Header */}
                <div className="bg-white border-b">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between mb-4">
                            {/* Home Team */}
                            <div className="flex-1 flex flex-col items-center">
                                <img
                                    src={match.teams.home.logo}
                                    alt={match.teams.home.name}
                                    className="w-20 h-20 object-contain mb-2"
                                />
                                <h2 className="font-comfortaa font-semibold text-xl text-center">{match.teams.home.name}</h2>
                            </div>

                            {/* Score */}
                            <div className="flex-1 flex flex-col items-center">
                                <div className="text-5xl font-bold mb-2">
                                    {match.goals.home} - {match.goals.away}
                                </div>
                                <div className="text-sm text-gray-600">{match.status.long}</div>
                                {match.status.elapsed && (
                                    <div className="text-sm font-semibold text-black">{match.status.elapsed}'</div>
                                )}
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex flex-col items-center">
                                <img
                                    src={match.teams.away.logo}
                                    alt={match.teams.away.name}
                                    className="w-20 h-20 object-contain mb-2"
                                />
                                <h2 className="font-comfortaa font-semibold text-xl text-center">{match.teams.away.name}</h2>
                            </div>
                        </div>

                        {/* Match Info */}
                        <div className="text-center text-sm text-gray-600">
                            {match.league.name} • {new Date(match.fixture.date).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b">
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
                                Statistics
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
        </MainLayout>
    );
}

// Helper Components
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-2 font-semibold border-b-4 transition ${active
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
                }`}
        >
            {children}
        </button>
    );
}

// Tab Components
function SummaryTab({ match, events, statistics }: { match: Match; events: MatchEvent[] | undefined; statistics: MatchStatistic[] | undefined }) {
    return (
        <div className="space-y-6">
            {/* Match Events Timeline */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="font-comfortaa font-semibold text-lg mb-4">Match Events</h3>
                {events && events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event, idx) => (
                            <EventCard key={idx} event={event} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No events recorded yet</p>
                )}
            </div>

            {/* Key Statistics */}
            {statistics && statistics.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                    <h3 className="font-comfortaa font-semibold text-lg mb-4">Key Statistics</h3>
                    <div className="space-y-4">
                        {statistics.map((stat, idx) => {
                            if (idx % 2 !== 0) return null;
                            const awayStat = statistics[idx + 1];
                            if (!awayStat) return null;

                            return (
                                <StatBar
                                    key={stat.team.id}
                                    label={stat.statistics[0]?.type || 'Stat'}
                                    homeValue={parseFloat(String(stat.statistics[0]?.value || 0).replace('%', ''))}
                                    awayValue={parseFloat(String(awayStat.statistics[0]?.value || 0).replace('%', ''))}
                                    unit={String(stat.statistics[0]?.value || '').includes('%') ? '%' : ''}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function EventCard({ event }: { event: MatchEvent }) {
    const getIcon = (type: string) => {
        if (type === 'Goal') return '⚽';
        if (type === 'Card') return event.detail === 'Yellow Card' ? '🟨' : '🟥';
        if (type === 'subst') return '🔄';
        return '•';
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
            <div className="text-2xl">{getIcon(event.type)}</div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{event.time.elapsed}'</span>
                    {event.player && <span>{event.player.name}</span>}
                    {event.detail && event.player && <span className="text-gray-500">({event.detail})</span>}
                    {event.type === 'Goal' && event.assist && event.assist.name && (
                        <span className="text-gray-500 text-sm">Assist: {event.assist.name}</span>
                    )}
                </div>
                {event.comments && (
                    <p className="text-sm text-gray-600 mt-1">{event.comments}</p>
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
            <div className="flex justify-between text-sm mb-1">
                <span>{homeValue}{unit}</span>
                <span className="font-semibold">{label}</span>
                <span>{awayValue}{unit}</span>
            </div>
            <div className="flex h-2 bg-gray-200 rounded overflow-hidden">
                <div className="bg-blue-600" style={{ width: `${homePercent}%` }}></div>
                <div className="bg-red-600" style={{ width: `${awayPercent}%` }}></div>
            </div>
        </div>
    );
}

function StatsTab({ match, statistics }: { match: Match; statistics: MatchStatistic[] | undefined }) {
    if (!statistics || statistics.length === 0) {
        return (
            <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-500">Detailed statistics not available for this match</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6">
            <h3 className="font-comfortaa font-semibold text-lg mb-6">Full Match Statistics</h3>
            <div className="space-y-4">
                {statistics[0]?.statistics.map((stat, idx) => {
                    const homeStat = statistics[0]?.statistics[idx];
                    const awayStat = statistics[1]?.statistics[idx];

                    if (!homeStat || !awayStat) return null;

                    const homeVal = parseFloat(String(homeStat.value).replace('%', ''));
                    const awayVal = parseFloat(String(awayStat.value).replace('%', ''));
                    const unit = String(homeStat.value).includes('%') ? '%' : '';

                    return (
                        <StatBar
                            key={stat.type}
                            label={stat.type}
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
            <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-500">Lineups not available for this match</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lineups.map((lineup, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <img src={lineup.team.logo} alt={lineup.team.name} className="w-12 h-12 object-contain" />
                        <div>
                            <h3 className="font-comfortaa font-semibold text-lg">{lineup.team.name}</h3>
                            <p className="text-sm text-gray-600">Formation: {lineup.formation}</p>
                        </div>
                    </div>

                    {/* Starting XI */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Starting XI</h4>
                        <div className="space-y-2">
                            {lineup.startXI.map((player, pIdx) => (
                                <div key={pIdx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                                    <span className="font-semibold text-gray-600 w-6">{player.player.number}</span>
                                    <span>{player.player.name}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{player.player.pos}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Substitutes */}
                    {lineup.substitutes && lineup.substitutes.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Substitutes</h4>
                            <div className="space-y-2">
                                {lineup.substitutes.map((player, pIdx) => (
                                    <div key={pIdx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded opacity-75">
                                        <span className="font-semibold text-gray-600 w-6">{player.player.number}</span>
                                        <span>{player.player.name}</span>
                                        <span className="text-xs text-gray-500 ml-auto">{player.player.pos}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
