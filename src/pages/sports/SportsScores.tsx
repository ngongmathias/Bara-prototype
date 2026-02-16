import { useState } from 'react';

interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: 'LIVE' | 'FT' | 'HT';
    minute?: number;
    league: string;
    venue: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
}

const mockMatches: Match[] = [
    {
        id: '1',
        league: 'English League Championship',
        homeTeam: 'Coventry City',
        awayTeam: 'Middlesbrough',
        homeScore: 2,
        awayScore: 1,
        status: 'FT',
        venue: 'The Coventry Building Society Arena, Coventry, England',
    },
    {
        id: '2',
        league: 'Spanish LALIGA',
        homeTeam: 'Girona',
        awayTeam: 'Barcelona',
        homeScore: 1,
        awayScore: 1,
        status: 'FT',
        venue: 'Estadi Montilivi, Girona, Spain',
    },
    {
        id: '3',
        league: 'Italian Serie A',
        homeTeam: 'Cagliari',
        awayTeam: 'Lecce',
        homeScore: 0,
        awayScore: 2,
        status: 'FT',
        venue: 'Unipol Domus, Cagliari, Italy',
    },
];

export default function SportsScores() {
    const [selectedDate, setSelectedDate] = useState('MON');

    const days = ['FRI', 'SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'];
    const dates = ['12 FEB', '13 FEB', '14 FEB', '16 FEB', '17 FEB', '18 FEB', '19 FEB'];

    // Group matches by league
    const groupedMatches = mockMatches.reduce((acc, match) => {
        if (!acc[match.league]) {
            acc[match.league] = [];
        }
        acc[match.league].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-4">Soccer Scores</h1>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">‹</button>
                        {days.map((day, index) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(day)}
                                className={`flex-1 text-center py-3 rounded transition ${selectedDate === day
                                        ? 'bg-black text-white font-bold'
                                        : 'hover:bg-gray-100'
                                    }`}
                            >
                                <div className="text-xs">{day}</div>
                                <div className="text-sm">{dates[index]}</div>
                            </button>
                        ))}
                        <button className="p-2 hover:bg-gray-100 rounded">›</button>
                        <button className="p-2 hover:bg-gray-100 rounded border border-gray-300">
                            📅
                        </button>
                    </div>
                </div>
            </div>

            {/* Matches Grid */}
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
                {/* Matches List */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <p className="text-gray-600">Monday, February 16, 2026</p>

                    {Object.entries(groupedMatches).map(([league, matches]) => (
                        <div key={league} className="bg-white rounded-lg overflow-hidden">
                            {/* League Header */}
                            <div className="bg-gray-100 px-4 py-2 font-semibold">
                                {league}
                            </div>

                            {/* Match Rows */}
                            {matches.map((match) => (
                                <MatchRow key={match.id} match={match} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Right Sidebar - News */}
                <aside className="col-span-12 lg:col-span-3">
                    <div className="bg-white rounded-lg p-4">
                        <h2 className="font-bold mb-4">Football News</h2>
                        <div className="space-y-4">
                            <NewsCard
                                title="PSG coach Luis Enrique slams 'worthless' Ousmane Dembélé take"
                                time="1h"
                                source="ESPN News Services"
                            />
                            <NewsCard
                                title="Madrid's Arbeloa on Benfica: We want to win, it's not about revenge"
                                time="1h"
                                source="Alex Kirkland"
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function MatchRow({ match }: { match: Match }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-b last:border-b-0">
            <div
                className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Score/Competition Icon */}
                    <div className="col-span-1 text-center">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {match.league.substring(0, 2)}
                        </div>
                    </div>

                    {/* Teams */}
                    <div className="col-span-6 lg:col-span-7">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{match.homeTeam}</span>
                            </div>
                            <span className="font-bold text-lg">{match.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{match.awayTeam}</span>
                            </div>
                            <span className="font-bold text-lg">{match.awayScore}</span>
                        </div>
                        {match.minute && (
                            <div className="text-xs text-red-600 font-semibold mt-1">
                                {match.minute}'
                            </div>
                        )}
                        {match.status === 'FT' && (
                            <div className="text-xs text-gray-500 mt-1">Full Time</div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-5 lg:col-span-4 flex gap-2 justify-end">
                        <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
                            Gamecast
                        </button>
                        <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
                            Statistics
                        </button>
                    </div>
                </div>

                {/* Venue */}
                <div className="text-xs text-gray-500 mt-2">{match.venue}</div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 py-3 bg-gray-50 border-t">
                    <p className="text-sm text-gray-600">
                        Match details and statistics would appear here...
                    </p>
                </div>
            )}
        </div>
    );
}

function NewsCard({ title, time, source }: { title: string; time: string; source: string }) {
    return (
        <article className="cursor-pointer hover:underline">
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500">{time} • {source}</p>
        </article>
    );
}
