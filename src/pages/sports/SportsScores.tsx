import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

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

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Page Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <h1 className="text-3xl font-comfortaa font-semibold">Scores & Fixtures</h1>
                    </div>
                </div>

                {/* Date Selector */}
                <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-2 overflow-x-auto py-4">
                            {days.map((day, index) => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(day)}
                                    className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition ${selectedDate === day
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="text-sm">{day}</div>
                                    <div className="text-xs mt-1">{dates[index]}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Matches */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {mockMatches.map((match) => (
                                <MatchRow key={match.id} match={match} />
                            ))}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h2 className="font-comfortaa font-semibold text-lg mb-4">Top News</h2>
                                <div className="space-y-4">
                                    <NewsCard
                                        title="Transfer deadline day: All the latest moves"
                                        time="2 hours ago"
                                        source="Bara Sports"
                                    />
                                    <NewsCard
                                        title="Champions League draw: Key matchups revealed"
                                        time="5 hours ago"
                                        source="Bara Sports"
                                    />
                                    <NewsCard
                                        title="Injury update: Star player out for 3 weeks"
                                        time="1 day ago"
                                        source="Bara Sports"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

function MatchRow({ match }: { match: Match }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition cursor-pointer">
            {/* League Header */}
            <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{match.league}</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${match.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                            match.status === 'FT' ? 'bg-gray-200 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                        }`}>
                        {match.status}
                    </span>
                </div>
            </div>

            {/* Match Details */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                            {match.homeTeam.substring(0, 3).toUpperCase()}
                        </div>
                        <span className="font-semibold">{match.homeTeam}</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4 px-6">
                        <span className="text-2xl font-bold">{match.homeScore}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-2xl font-bold">{match.awayScore}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-semibold">{match.awayTeam}</span>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                            {match.awayTeam.substring(0, 3).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Venue */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                    {match.venue}
                </div>
            </div>
        </div>
    );
}

function NewsCard({ title, time, source }: { title: string; time: string; source: string }) {
    return (
        <div className="pb-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <h3 className="font-semibold text-sm leading-snug mb-1">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{source}</span>
                <span>•</span>
                <span>{time}</span>
            </div>
        </div>
    );
}
