import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { useStandings } from '../../hooks/useTeamData';
import { ChevronRight, Search, Trophy } from 'lucide-react';

const MAJOR_LEAGUES = [
    { id: 39, name: "Premier League", country: "England" },
    { id: 140, name: "La Liga", country: "Spain" },
    { id: 135, name: "Serie A", country: "Italy" },
    { id: 78, name: "Bundesliga", country: "Germany" },
    { id: 61, name: "Ligue 1", country: "France" },
    { id: 2, name: "Champions League", country: "World" }
];

export default function SportsTeams() {
    const [selectedLeague, setSelectedLeague] = useState(MAJOR_LEAGUES[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: standings, isLoading } = useStandings({
        league: selectedLeague.id,
        season: 2024
    });

    const filteredTeams = standings?.filter(s =>
        s.team.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                <SportsTopBanner />
                <SportsSubNav />

                {/* Hero / Header */}
                <div className="bg-[#121212] text-white py-12 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Browse Teams</h1>
                        </div>
                        <p className="text-gray-400 max-w-2xl font-medium text-sm md:text-base mx-auto md:mx-0">
                            Explore the world's most elite clubs. Select a league below to filter teams or search for your favorite squad.
                        </p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white border-b sticky top-[104px] z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            {MAJOR_LEAGUES.map((league) => (
                                <button
                                    key={league.id}
                                    onClick={() => setSelectedLeague(league)}
                                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all border whitespace-nowrap ${selectedLeague.id === league.id
                                        ? 'bg-black text-white border-black'
                                        : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                                        }`}
                                >
                                    {league.name}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Find a team..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-md text-sm focus:ring-2 focus:ring-red-600 min-w-[240px] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Grid */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="aspect-square bg-white rounded-xl animate-pulse border border-gray-100 shadow-sm"></div>
                            ))}
                        </div>
                    ) : filteredTeams.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredTeams.map((standing) => (
                                <Link
                                    key={standing.team.id}
                                    to={`/sports/team/${standing.team.id}`}
                                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-red-600 hover:shadow-xl transition-all group group"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center p-3 group-hover:scale-110 transition-transform">
                                            <img
                                                src={standing.team.logo}
                                                alt={standing.team.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter text-gray-900 group-hover:text-red-600 transition-colors">
                                            {standing.team.name}
                                        </h3>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            {selectedLeague.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-20 text-center border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tighter">No Teams Found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or selecting a different league.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
