import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStandings } from '../../hooks/useTeamData';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { SponsorshipBanner } from '../../components/sports/SponsorshipBanner';

export default function LeagueTablePage() {
    const { id } = useParams();
    const leagueId = id ? parseInt(id) : 39; // Default to Premier League (39)

    // Fetch real standings from API (hardcoded to 2024 for free API tier)
    const { data: standings, isLoading, error } = useStandings({
        league: leagueId,
        season: 2024
    });

    // There used to be a four-row hardcoded Premier League table here (Liverpool
    // 60pts, Man City 58, …) rendered whenever the API errored or returned
    // nothing — indistinguishable from live standings. Since `season` is pinned
    // to 2024, that fallback was very likely what most visitors actually saw.
    // Show nothing rather than invented league positions.
    const teams = standings ?? [];
    const hasTable = !error && teams.length > 0;

    const getLeagueName = (id: number) => {
        switch (id) {
            case 39: return "Premier League";
            case 140: return "La Liga";
            case 135: return "Serie A";
            case 78: return "Bundesliga";
            case 61: return "Ligue 1";
            default: return "League Table";
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin text-6xl mb-4">⚽</div>
                        <p className="text-gray-600">Loading league table...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                <SportsTopBanner />
                <SportsSubNav />
                {/* Page Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-comfortaa font-semibold mb-1">{getLeagueName(leagueId)}</h1>
                                <div className="text-gray-600">Season 2024</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* League Table */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <SponsorshipBanner />
                    </div>
                    {!hasTable ? (
                        <div className="bg-white rounded-lg shadow-sm border px-6 py-16 text-center">
                            <h2 className="text-lg font-comfortaa font-semibold text-gray-900 mb-2">
                                Standings aren't available right now
                            </h2>
                            <p className="text-sm text-gray-500 max-w-md mx-auto font-roboto">
                                We couldn't load the {getLeagueName(leagueId)} table. Please check back shortly.
                            </p>
                        </div>
                    ) : (
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                                {/* Table Header */}
                                <div className="grid grid-cols-[60px_1fr_60px_60px_60px_60px_80px_80px_80px_70px_120px] gap-2 px-4 py-3 bg-gray-50 border-b font-semibold text-xs text-gray-600 uppercase">
                                    <div className="text-center">Pos</div>
                                    <div>Team</div>
                                    <div className="text-center">PL</div>
                                    <div className="text-center">W</div>
                                    <div className="text-center">D</div>
                                    <div className="text-center">L</div>
                                    <div className="text-center">GF</div>
                                    <div className="text-center">GA</div>
                                    <div className="text-center">GD</div>
                                    <div className="text-center">Pts</div>
                                    <div className="text-center">Form</div>
                                </div>

                                {/* Table Rows */}
                                <div>
                                    {teams.map((team) => {
                                        // Parse form string into array (e.g., "WWDLW" -> ["W","W","D","L","W"])
                                        const formArray = team.form ? team.form.split('').slice(-5) : [];

                                        return (
                                            <div
                                                key={team.rank}
                                                className={`grid grid-cols-[60px_1fr_60px_60px_60px_60px_80px_80px_80px_70px_120px] gap-2 px-4 py-4 border-b hover:bg-gray-50 cursor-pointer transition ${team.rank <= 4 ? 'border-l-4 border-l-blue-500' :
                                                    team.rank >= 18 ? 'border-l-4 border-l-red-500' :
                                                        ''
                                                    }`}
                                            >
                                                {/* Position */}
                                                <div className="flex items-center justify-center font-bold text-gray-700">
                                                    {team.rank}
                                                </div>

                                                {/* Team Name */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img
                                                        loading="lazy" src={team.team.logo}
                                                        alt={team.team.name}
                                                        className="w-8 h-8 object-contain flex-shrink-0"
                                                    />
                                                    <span className="font-semibold truncate">{team.team.name}</span>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center justify-center text-gray-600">{team.all.played}</div>
                                                <div className="flex items-center justify-center text-gray-600">{team.all.win}</div>
                                                <div className="flex items-center justify-center text-gray-600">{team.all.draw}</div>
                                                <div className="flex items-center justify-center text-gray-600">{team.all.lose}</div>
                                                <div className="flex items-center justify-center text-gray-600">{team.all.goals.for}</div>
                                                <div className="flex items-center justify-center text-gray-600">{team.all.goals.against}</div>
                                                <div className={`flex items-center justify-center font-semibold ${team.goalsDiff > 0 ? 'text-green-600' :
                                                    team.goalsDiff < 0 ? 'text-red-600' :
                                                        'text-gray-600'
                                                    }`}>
                                                    {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                                                </div>
                                                <div className="flex items-center justify-center font-bold text-lg">{team.points}</div>

                                                {/* Form */}
                                                <div className="flex items-center justify-center gap-1">
                                                    {formArray.length > 0 ? (
                                                        formArray.map((result, index) => (
                                                            <div
                                                                key={index}
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${result === 'W' ? 'bg-green-600 text-white' :
                                                                    result === 'L' ? 'bg-red-600 text-white' :
                                                                        'bg-gray-400 text-white'
                                                                    }`}
                                                            >
                                                                {result}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">N/A</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Legend — only meaningful when a table is actually rendered */}
                    {hasTable && (
                        <div className="mt-6 flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-gray-600">Champions League</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                <span className="text-gray-600">Relegation</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
