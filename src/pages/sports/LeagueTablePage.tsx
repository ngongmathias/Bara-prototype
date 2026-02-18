import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStandings } from '../../hooks/useTeamData';
import { MainLayout } from '@/components/layout/MainLayout';

export default function LeagueTablePage() {
    const { id } = useParams();
    const leagueId = id ? parseInt(id) : 39; // Default to Premier League (39)

    // Fetch real standings from API (hardcoded to 2024 for free API tier)
    const { data: standings, isLoading, error } = useStandings({
        league: leagueId,
        season: 2024
    });

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

    if (error || !standings || standings.length === 0) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 py-12">
                        <div className="bg-white rounded-lg p-8 text-center">
                            <div className="text-6xl mb-4">❌</div>
                            <h2 className="text-2xl font-bold mb-2">League Table Not Available</h2>
                            <p className="text-gray-600 mb-6">
                                {error?.message || 'Unable to load league standings. The league may not exist or the API limit may be reached.'}
                            </p>
                            <a href="/sports" className="text-blue-600 hover:underline">
                                ← Back to Sports Home
                            </a>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const leagueStandings = standings[0];
    const teams = leagueStandings.league.standings[0]; // Get main standings

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Page Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-comfortaa font-semibold mb-1">{leagueStandings.league.name}</h1>
                                <div className="text-gray-600">Season {leagueStandings.league.season}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* League Table */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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
                                                src={team.team.logo}
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

                    {/* Legend */}
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
                </div>
            </div>
        </MainLayout>
    );
}
