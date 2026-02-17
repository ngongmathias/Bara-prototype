import { useState } from 'react';
import { useParams } from 'react-router-dom';

// Top Navigation Bar Component
function TopNavBar() {
    return (
        <nav className="bg-black text-white">
            <div className="flex items-stretch h-12">
                {/* Logo */}
                <div className="bg-red-600 flex items-center px-4">
                    <span className="font-bold text-xl">ESPN</span>
                </div>

                {/* Navigation Links */}
                <div className="flex items-stretch flex-1">
                    <NavLink label="Football" active />
                    <NavLink label="NBA" />
                    <NavLink label="NFL" />
                    <NavLink label="MLB" />
                    <NavLink label="More Sports" />
                </div>

                {/* Right Icons */}
                <div className="flex items-center px-4 gap-4">
                    <button className="hover:text-gray-300">Fantasy</button>
                    <button className="hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ label, active = false }: { label: string; active?: boolean }) {
    return (
        <a
            href="#"
            className={`px-4 flex items-center text-sm font-semibold hover:bg-gray-800 transition ${active ? 'bg-gray-800' : ''
                }`}
        >
            {label}
        </a>
    );
}

// Mock team data
const mockTeam = {
    id: 1,
    name: "Manchester United",
    shortName: "Man United",
    league: "Premier League",
    stadium: "Old Trafford",
    position: 5,
    points: 58,
    wins: 17,
    draws: 7,
    losses: 9,
    form: ["W", "L", "W", "W", "D"], // Last 5 matches
    topScorers: [
        { name: "Marcus Rashford", goals: 18, assists: 5 },
        { name: "Bruno Fernandes", goals: 12, assists: 10 },
        { name: "Anthony Martial", goals: 8, assists: 3 }
    ],
    nextFixture: {
        opponent: "Arsenal",
        date: "March 15, 2024",
        time: "17:30",
        venue: "Emirates Stadium",
        competition: "Premier League"
    },
    squad: [
        { number: 1, name: "David De Gea", position: "Goalkeeper", nationality: "ESP" },
        { number: 8, name: "Bruno Fernandes", position: "Midfielder", nationality: "POR" },
        { number: 10, name: "Marcus Rashford", position: "Forward", nationality: "ENG" },
        { number: 14, name: "Christian Eriksen", position: "Midfielder", nationality: "DEN" },
        { number: 18, name: "Casemiro", position: "Midfielder", nationality: "BRA" },
        { number: 25, name: "Jadon Sancho", position: "Forward", nationality: "ENG" }
    ],
    fixtures: [
        { opponent: "Arsenal", date: "March 15", competition: "Premier League", venue: "Away" },
        { opponent: "Brighton", date: "March 22", competition: "Premier League", venue: "Home" },
        { opponent: "Liverpool", date: "March 29", competition: "FA Cup", venue: "Home" }
    ]
};

export default function TeamPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'overview' | 'squad' | 'fixtures' | 'results' | 'stats'>('overview');

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNavBar />

            {/* Team Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-start gap-6">
                        {/* Team Logo */}
                        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                            MUN
                        </div>

                        {/* Team Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold">{mockTeam.name}</h1>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                                    {mockTeam.league}
                                </span>
                            </div>
                            <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Stadium:</span>
                                    <span className="font-semibold">{mockTeam.stadium}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Position:</span>
                                    <span className="font-bold text-lg">{mockTeam.position}th</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Points:</span>
                                    <span className="font-bold text-lg">{mockTeam.points}</span>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-gray-500 text-sm font-semibold">Form:</span>
                                <div className="flex gap-1">
                                    {mockTeam.form.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${result === 'W' ? 'bg-green-600 text-white' :
                                                result === 'L' ? 'bg-red-600 text-white' :
                                                    'bg-gray-400 text-white'
                                                }`}
                                        >
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-green-600">{mockTeam.wins}</div>
                                <div className="text-xs text-gray-500 uppercase">Wins</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-600">{mockTeam.draws}</div>
                                <div className="text-xs text-gray-500 uppercase">Draws</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-600">{mockTeam.losses}</div>
                                <div className="text-xs text-gray-500 uppercase">Losses</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                            Overview
                        </TabButton>
                        <TabButton active={activeTab === 'squad'} onClick={() => setActiveTab('squad')}>
                            Squad
                        </TabButton>
                        <TabButton active={activeTab === 'fixtures'} onClick={() => setActiveTab('fixtures')}>
                            Fixtures
                        </TabButton>
                        <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')}>
                            Results
                        </TabButton>
                        <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
                            Stats
                        </TabButton>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'overview' && <OverviewTab team={mockTeam} />}
                {activeTab === 'squad' && <SquadTab squad={mockTeam.squad} />}
                {activeTab === 'fixtures' && <FixturesTab fixtures={mockTeam.fixtures} />}
                {activeTab === 'results' && <ResultsTab />}
                {activeTab === 'stats' && <StatsTab />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-2 font-semibold border-b-2 transition ${active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
        >
            {children}
        </button>
    );
}

function OverviewTab({ team }: { team: typeof mockTeam }) {
    return (
        <div className="grid grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="col-span-2 space-y-6">
                {/* Next Fixture */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h2 className="text-xl font-bold mb-4">Next Fixture</h2>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                        <div className="text-sm text-gray-600 mb-2">{team.nextFixture.competition}</div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                                    MUN
                                </div>
                                <div className="text-2xl font-bold">vs</div>
                                <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-lg">
                                    ARS
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">{team.nextFixture.date}</div>
                                <div className="text-gray-600">{team.nextFixture.time}</div>
                                <div className="text-sm text-gray-500">{team.nextFixture.venue}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team News */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h2 className="text-xl font-bold mb-4">Team News</h2>
                    <div className="space-y-3">
                        <NewsItem
                            title="Rashford returns to training ahead of Arsenal clash"
                            time="2 hours ago"
                        />
                        <NewsItem
                            title="Ten Hag discusses tactics for crucial match"
                            time="5 hours ago"
                        />
                        <NewsItem
                            title="Injury update: Varane expected back next week"
                            time="1 day ago"
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Top Scorers */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h2 className="text-lg font-bold mb-4">Top Scorers</h2>
                    <div className="space-y-3">
                        {team.topScorers.map((player, index) => (
                            <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0">
                                <div>
                                    <div className="font-semibold">{player.name}</div>
                                    <div className="text-xs text-gray-500">{player.assists} assists</div>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{player.goals}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h2 className="text-lg font-bold mb-4">Season Stats</h2>
                    <div className="space-y-3">
                        <StatRow label="Goals Scored" value="54" />
                        <StatRow label="Goals Conceded" value="38" />
                        <StatRow label="Clean Sheets" value="12" />
                        <StatRow label="Yellow Cards" value="47" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SquadTab({ squad }: { squad: typeof mockTeam.squad }) {
    const groupedByPosition = {
        Goalkeeper: squad.filter(p => p.position === 'Goalkeeper'),
        Midfielder: squad.filter(p => p.position === 'Midfielder'),
        Forward: squad.filter(p => p.position === 'Forward')
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {Object.entries(groupedByPosition).map(([position, players]) => (
                <div key={position} className="border-b last:border-0">
                    <div className="bg-gray-50 px-6 py-3 font-bold text-gray-700 border-b">
                        {position}s
                    </div>
                    <div className="divide-y">
                        {players.map((player) => (
                            <div key={player.number} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                                    {player.number}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{player.name}</div>
                                    <div className="text-sm text-gray-500">{player.position}</div>
                                </div>
                                <div className="text-sm text-gray-500">{player.nationality}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function FixturesTab({ fixtures }: { fixtures: typeof mockTeam.fixtures }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border divide-y">
            {fixtures.map((fixture, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-gray-500 min-w-[80px]">{fixture.date}</div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">vs {fixture.opponent}</span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {fixture.competition}
                                </span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">{fixture.venue}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ResultsTab() {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
            <div className="text-lg">No recent results to display</div>
        </div>
    );
}

function StatsTab() {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
            <div className="text-lg">Detailed stats coming soon</div>
        </div>
    );
}

function NewsItem({ title, time }: { title: string; time: string }) {
    return (
        <div className="flex items-start gap-3 pb-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
            <div className="flex-1">
                <div className="font-semibold text-sm leading-snug">{title}</div>
                <div className="text-xs text-gray-500 mt-1">{time}</div>
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center pb-2 border-b last:border-0">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );
}
