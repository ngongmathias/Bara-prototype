import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { useTeam, useTeamStatistics, useTeamFixtures } from '../../hooks/useTeamData';
import { SEO } from '@/components/SEO';
import { ChevronRight, Calendar, MapPin, Users, BarChart3, Clock, Trophy, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import type { Match, Team, Lineup } from '../../types/sports';

export default function TeamPage() {
    const { id } = useParams();
    const teamId = id ? parseInt(id) : undefined;
    const [activeTab, setActiveTab] = useState<'overview' | 'squad' | 'fixtures' | 'stats'>('overview');

    const { data: team, isLoading: teamLoading } = useTeam(teamId);
    const { data: fixtures, isLoading: fixturesLoading } = useTeamFixtures({ teamId, season: 2024 });
    const { data: stats, isLoading: statsLoading } = useTeamStatistics({ teamId, league: 39, season: 2024 });
    const { user, isSignedIn } = useUser();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const isLoading = teamLoading || fixturesLoading || statsLoading;

    // Check if user follows this team
    useEffect(() => {
        if (!isSignedIn || !teamId) return;
        const checkFollow = async () => {
            const { data } = await supabase
                .from('user_favorite_teams')
                .select('id')
                .eq('user_id', user!.id)
                .eq('team_id', teamId)
                .maybeSingle();
            setIsFollowing(!!data);
        };
        checkFollow();
    }, [isSignedIn, teamId, user]);

    const toggleFollow = async () => {
        if (!isSignedIn || !teamId || !team) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase
                    .from('user_favorite_teams')
                    .delete()
                    .eq('user_id', user!.id)
                    .eq('team_id', teamId);
                setIsFollowing(false);
            } else {
                await supabase
                    .from('user_favorite_teams')
                    .insert({
                        user_id: user!.id,
                        team_id: teamId,
                        team_name: team.name,
                        team_logo: team.logo,
                    });
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Follow toggle failed:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin text-4xl">⚽</div>
                </div>
            </MainLayout>
        );
    }

    if (!team) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Team Not Found</h2>
                        <Link to="/sports" className="text-red-600 font-bold hover:underline mt-4 block">Back to Sports</Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const nextMatch = fixtures?.find(f => new Date(f.fixture.date) > new Date());
    const pastMatches = fixtures?.filter(f => new Date(f.fixture.date) <= new Date()).reverse().slice(0, 5);

    const teamSchema = {
        "@context": "https://schema.org",
        "@type": "SportsTeam",
        "name": team.name,
        "logo": team.logo,
        "sport": "Soccer",
        "location": {
            "@type": "Place",
            "name": team.venue.name,
            "address": team.venue.city
        }
    };

    return (
        <MainLayout>
            <SEO
                title={`${team.name} - News, Stats & Fixtures`}
                description={`Stay updated with ${team.name} scores, upcoming matches, squad details, and performance statistics on Bara Afrika Sports.`}
                image={team.logo}
                type="website"
                schemaData={teamSchema}
            />
            <div className="min-h-screen bg-gray-50">
                <SportsTopBanner />
                <SportsSubNav />

                {/* Team Header - High Fidelity */}
                <div className="bg-[#121212] text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>
                    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full flex items-center justify-center p-6 backdrop-blur-sm border border-white/10">
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                    <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Club Profile</span>
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {team.country}
                                    </span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
                                    {team.name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        <span className="font-bold">Est. {team.founded || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span className="font-bold">{team.venue?.name || 'Home Stadium'}</span>
                                    </div>
                                </div>
                                {/* Follow Team Button */}
                                <button
                                    onClick={toggleFollow}
                                    disabled={followLoading || !isSignedIn}
                                    className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${isFollowing
                                        ? 'bg-white text-black hover:bg-gray-200'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                        } ${!isSignedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Heart size={16} className={isFollowing ? 'fill-red-500 text-red-500' : ''} />
                                    {isFollowing ? 'Following' : 'Follow Team'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white border-b sticky top-[104px] z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-8 overflow-x-auto no-scrollbar">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                                Overview
                            </TabButton>
                            <TabButton active={activeTab === 'fixtures'} onClick={() => setActiveTab('fixtures')}>
                                Schedule
                            </TabButton>
                            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
                                Stats
                            </TabButton>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {/* Next Match Card */}
                                {nextMatch && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Next Match</h3>
                                        </div>
                                        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center md:text-right">
                                                    <div className="text-xl font-black uppercase tracking-tighter">{nextMatch.teams.home.name}</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Home</div>
                                                </div>
                                                <img src={nextMatch.teams.home.logo} alt="" className="w-16 h-16 object-contain" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-black italic text-red-600 mb-1 uppercase tracking-tighter">VS</div>
                                                <div className="text-xs font-black bg-gray-100 px-3 py-1 rounded-full">{new Date(nextMatch.fixture.date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <img src={nextMatch.teams.away.logo} alt="" className="w-16 h-16 object-contain" />
                                                <div className="text-center md:text-left">
                                                    <div className="text-xl font-black uppercase tracking-tighter">{nextMatch.teams.away.name}</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Away</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                                            <Link to={`/sports/match/${nextMatch.fixture.id}`} className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors flex items-center justify-center gap-2">
                                                Game Details <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Results */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 border-l-4 border-red-600 pl-3">Recent Results</h3>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                                        {pastMatches?.map(m => (
                                            <div key={m.fixture.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <span className="text-[10px] font-black text-gray-400 w-12">{new Date(m.fixture.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                    <div className="flex items-center gap-2">
                                                        <img src={m.teams.home.id === team.id ? m.teams.away.logo : m.teams.home.logo} alt="" className="w-5 h-5 object-contain" />
                                                        <span className="text-sm font-bold tracking-tight">{m.teams.home.id === team.id ? m.teams.away.name : m.teams.home.name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-2 py-1 rounded text-xs font-black ${(m.teams.home.id === team.id && m.goals.home! > m.goals.away!) || (m.teams.away.id === team.id && m.goals.away! > m.goals.home!) ? 'bg-green-100 text-green-700' :
                                                        m.goals.home === m.goals.away ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {m.goals.home} - {m.goals.away}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Stats */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <BarChart3 className="w-5 h-5 text-red-600" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Season Summary</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <StatItem label="Games Played" value={stats?.fixtures?.played?.total || '0'} />
                                        <StatItem label="Goals For" value={stats?.goals?.for?.total?.total || '0'} />
                                        <StatItem label="Goals Against" value={stats?.goals?.against?.total?.total || '0'} />
                                        <StatItem label="Clean Sheets" value={stats?.clean_sheet?.total || '0'} />
                                    </div>
                                </div>

                                <div className="bg-[#121212] rounded-xl shadow-xl border border-white/5 p-6 text-white text-center">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Official Store</h3>
                                    <p className="text-xs text-gray-400 mb-6">Support the club with the latest official kits and merchandise.</p>
                                    <button className="w-full bg-red-600 hover:bg-red-700 py-3 rounded text-xs font-black uppercase tracking-widest transition-colors">
                                        Shop Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fixtures' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="divide-y divide-gray-100">
                                {fixtures?.filter(f => new Date(f.fixture.date) > new Date()).map(f => (
                                    <div key={f.fixture.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center pr-6 border-r border-gray-100">
                                                <div className="text-sm font-black uppercase tracking-tighter">{new Date(f.fixture.date).toLocaleDateString([], { weekday: 'short' })}</div>
                                                <div className="text-xs text-gray-400 font-bold">{new Date(f.fixture.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <img src={f.teams.home.logo} alt="" className="w-8 h-8 object-contain" />
                                                <span className="text-base font-bold tracking-tight">{f.teams.home.name}</span>
                                                <span className="text-xs font-black text-gray-400 mx-2">VS</span>
                                                <img src={f.teams.away.logo} alt="" className="w-8 h-8 object-contain" />
                                                <span className="text-base font-bold tracking-tight">{f.teams.away.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-bold">{new Date(f.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <Link to={`/sports/match/${f.fixture.id}`} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest text-gray-900 transition-colors">
                                                Preview
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="p-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Advanced Analytics Coming Soon</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">We are currently integrating deeper Opta-style statistics for individual player performances and tactical analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-2 text-xs font-black uppercase tracking-widest border-b-4 transition whitespace-nowrap ${active
                ? 'border-red-600 text-black'
                : 'border-transparent text-gray-400 hover:text-black'
                }`}
        >
            {children}
        </button>
    );
}

function StatItem({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            <span className="text-xl font-black italic text-gray-900 leading-none">{value}</span>
        </div>
    );
}
