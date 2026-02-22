import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLiveScores } from '../../hooks/useLiveScores';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { Play, Calendar, User, ChevronRight, Trophy } from 'lucide-react';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';
import { SPORTS_CONFIG } from '@/config/sportsConfig';
import { SEO } from '@/components/SEO';

export default function SportsHome() {
    const { sport: sportSlug } = useParams();
    const activeSport = (sportSlug && SPORTS_CONFIG[sportSlug as keyof typeof SPORTS_CONFIG]) || SPORTS_CONFIG.football;

    return (
        <MainLayout>
            <SEO
                title={`${activeSport.name} Scores & News`}
                description={`Get the latest ${activeSport.name} live scores, match schedules, standings, and top stories on Bara Afrika Sports.`}
                keywords={[activeSport.name, 'Live Scores', 'Sports News', 'League Table', 'Match Schedule']}
            />
            <div className="min-h-screen bg-gray-100 font-sans text-left">
                {/* High-Fidelity ESPN Ticker */}
                <SportsTopBanner />

                {/* Sport-Specific Sub-Navigation */}
                <SportsSubNav />

                {/* Main Content Area */}
                <div className="max-w-[1440px] mx-auto p-4">
                    <div className="grid grid-cols-12 gap-6">
                        {/* LEFT SIDEBAR (Quick Links) - 2 Cols */}
                        <aside className="hidden lg:block col-span-2 space-y-6">
                            <LeftSidebar activeSport={activeSport} />
                        </aside>

                        {/* CENTER CONTENT (Hero + News) - 7 Cols */}
                        <main className="col-span-12 lg:col-span-7 space-y-6">
                            <HeroArticle activeSport={activeSport} />

                            {/* Sport-Specific Specialized Data (BPI, FPI, Rankings) */}
                            <SportSpecialMetrics activeSport={activeSport} />

                            {/* Section Header */}
                            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2 mb-4">
                                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">
                                    {activeSport.name} Top Stories
                                </h2>
                                <Link to={`/sports/${activeSport.slug}/news`} className="text-blue-600 text-sm font-semibold hover:underline flex items-center">
                                    See All <ChevronRight size={16} />
                                </Link>
                            </div>

                            <NewsFeed activeSport={activeSport} />
                        </main>

                        {/* RIGHT SIDEBAR (Videos + Headlines) - 3 Cols */}
                        <aside className="col-span-12 lg:col-span-3 space-y-6">
                            <TopVideos activeSport={activeSport} />
                            <TopHeadlines activeSport={activeSport} />
                        </aside>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}


// Sidebar
function LeftSidebar({ activeSport }: { activeSport: any }) {
    return (
        <div className="bg-white rounded shadow-sm p-4 sticky top-4 text-left">
            <h3 className="font-bold text-xs text-gray-500 uppercase mb-4 tracking-wider">Popular {activeSport.name}</h3>
            <nav className="space-y-1">
                {activeSport.featuredLeagues.map((league: any) => (
                    <SidebarLink key={league.id} to={`/sports/${activeSport.slug}/table/${league.id}`} label={league.name} />
                ))}

                {activeSport.groups?.map((group: any, idx: number) => (
                    <div key={idx} className="pt-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{group.title}</h4>
                        {group.leagues.slice(0, 3).map((item: any) => (
                            <SidebarLink key={item.id} to={`/sports/${activeSport.slug}/team/${item.id}`} label={item.name} />
                        ))}
                    </div>
                ))}

                <div className="h-px bg-gray-200 my-2"></div>
                <SidebarLink to={`/sports/${activeSport.slug}/scores`} label="All Scores" />
                <SidebarLink to="/sports/favorites" label="My Teams" />
            </nav>
        </div>
    );
}





// Hero Article (Bigger, Bolder)
function HeroArticle({ activeSport }: { activeSport: any }) {
    // Content should ideally match the sport
    const heroTitle = activeSport.id === 'football'
        ? "Mamelodi Sundowns seal historic treble with dominant derby win"
        : `${activeSport.name} Season Preview: Everything you need to know`;

    return (
        <article className="relative bg-gray-900 h-[400px] rounded-lg overflow-hidden group cursor-pointer shadow-md text-left">
            <img
                src={activeSport.id === 'football'
                    ? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2836&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2836&auto=format&fit=crop"
                }
                alt="Hero"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition duration-500 grayscale-[20%] group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider mb-2 inline-block">Featured</span>
                    <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-4 drop-shadow-lg font-roboto-condensed">
                        {heroTitle}
                    </h1>
                    <p className="text-gray-300 text-lg line-clamp-2 md:line-clamp-none mb-4">
                        Comprehensive coverage of the latest developments across the sport, from breaking team news to expert analysis and highlights.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        <span>By Sports Desk</span>
                        <span>•</span>
                        <span>{activeSport.name}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}

// News Feed (List Layout like ESPN)
function NewsFeed({ activeSport }: { activeSport: any }) {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            let query = supabase
                .from('sports_news')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter by category if not home
            if (activeSport.id !== 'football' || activeSport.slug !== 'football') {
                query = query.ilike('category', activeSport.name);
            }

            const { data } = await query.limit(10);
            if (data) setNews(data);
            setLoading(false);
        };
        fetchNews();
    }, [activeSport]);

    if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded"></div>)}</div>;

    return (
        <div className="space-y-4">
            {news.map(item => (
                <NewsListItem key={item.id} item={item} />
            ))}
            {news.length === 0 && <div className="p-8 text-center text-gray-500">No news articles found. Populating feed...</div>}
        </div>
    );
}

function NewsListItem({ item }: { item: any }) {
    return (
        <Link to={`/sports/news/${item.id}`} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-lg hover:shadow-lg hover:border-blue-200 transition group">
            <div className="w-1/3 md:w-48 aspect-video bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
            </div>
            <div className="flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-tighter">{item.category}</span>
                    <span className="text-xs text-gray-400">• {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <User size={12} /> {item.author || 'Staff Writer'}
                </div>
            </div>
        </Link>
    );
}

// Right Sidebar Components
function TopVideos({ activeSport }: { activeSport: any }) {
    return (
        <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100 text-left">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">{activeSport.name} Videos</h3>
            </div>
            <div className="divide-y divide-gray-100">
                <VideoListItem title={`${activeSport.name} Weekly Highlights`} duration="10:23" />
                <VideoListItem title="Player Spotlight: Top Performer" duration="04:12" />
                <VideoListItem title="Fan Reactions: Season Opener" duration="08:45" />
            </div>
            <div className="p-3 bg-gray-50 text-center">
                <Link to={`/sports/${activeSport.slug}/videos`} className="text-xs font-bold text-blue-600 hover:underline">View All Videos</Link>
            </div>
        </div>
    );
}

// Sport-Specific Special Metrics (ESPN Exclusive Feel)
function SportSpecialMetrics({ activeSport }: { activeSport: any }) {
    if (activeSport.id === 'football') {
        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg p-5 text-white shadow-lg">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Transfer Tracker</h4>
                    <p className="text-xl font-black mb-2">January Window Live Updates</p>
                    <Link to="/sports/football/transfers" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition inline-block uppercase">View All Moves</Link>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Champions League</h4>
                        <p className="text-lg font-bold text-gray-900">Quarter Finals Draw</p>
                        <p className="text-xs text-gray-500 font-medium">Coming Friday March 14</p>
                    </div>
                    <Trophy className="text-yellow-500 w-10 h-10 opacity-20" />
                </div>
            </div>
        );
    }

    if (activeSport.id === 'nba') {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-orange-600 p-2 text-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Basketball Power Index (BPI)</span>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                    <MetricCard rank="1" team="Celtics" score="94.2" label="Title Prob" />
                    <MetricCard rank="2" team="Nuggets" score="88.7" label="Title Prob" />
                    <MetricCard rank="3" team="Thunder" score="84.1" label="Title Prob" />
                </div>
            </div>
        );
    }

    if (activeSport.id === 'nfl') {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden text-left">
                <div className="bg-blue-800 p-2 text-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Football Power Index (FPI)</span>
                </div>
                <div className="p-4 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b pb-1">Super Bowl LIX Projection</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700 font-roboto-condensed">Kansas City Chiefs</span>
                            <span className="text-lg font-black text-blue-700 tracking-tighter">24.2%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: '24.2%' }}></div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b pb-1">Projected No. 1 Pick</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700 font-roboto-condensed">Chicago Bears</span>
                            <span className="text-lg font-black text-orange-600 tracking-tighter">18.5%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: '18.5%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeSport.id === 'cricket') {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden text-left">
                <div className="bg-green-700 p-2 text-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">ICC Test Rankings</span>
                </div>
                <div className="p-4 grid grid-cols-4 gap-2">
                    <RankingSlot rank="1" team="Australia" points="124" />
                    <RankingSlot rank="2" team="India" points="120" />
                    <RankingSlot rank="3" team="England" points="115" />
                    <RankingSlot rank="4" team="South Africa" points="103" />
                </div>
                <div className="p-2 border-t text-center">
                    <Link to="/sports/cricket/rankings" className="text-[10px] font-black text-green-700 hover:underline uppercase tracking-widest">Full Rankings</Link>
                </div>
            </div>
        );
    }

    return null;
}

function MetricCard({ rank, team, score, label }: { rank: string, team: string, score: string, label: string }) {
    return (
        <div className="bg-gray-50 rounded p-3 text-center border border-gray-100">
            <span className="text-[9px] font-black text-gray-400 block mb-1">RANK {rank}</span>
            <p className="text-sm font-black text-gray-900 mb-1">{team}</p>
            <p className="text-2xl font-black text-orange-600 tracking-tighter">{score}%</p>
            <span className="text-[9px] font-bold text-gray-500 uppercase">{label}</span>
        </div>
    );
}

function RankingSlot({ rank, team, points }: { rank: string, team: string, points: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-400">{rank}</span>
            <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">{team}</p>
            <p className="text-sm font-bold text-green-600">{points}</p>
        </div>
    );
}

function VideoListItem({ title, duration }: { title: string, duration: string }) {
    return (
        <div className="p-3 flex gap-3 hover:bg-gray-50 cursor-pointer group">
            <div className="w-24 aspect-video bg-gray-800 rounded relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-red-600 transition">
                        <Play size={10} fill="white" className="text-white ml-0.5" />
                    </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/90 text-[10px] text-white px-1 rounded">{duration}</span>
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold leading-snug group-hover:text-blue-600 transition line-clamp-2">{title}</h4>
            </div>
        </div>
    );
}

function TopHeadlines({ activeSport }: { activeSport: any }) {
    return (
        <div className="bg-white rounded shadow-sm p-4 border border-gray-100 text-left">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">Trending {activeSport.name}</h3>
            <ul className="space-y-3">
                <li className="text-sm font-medium hover:text-red-600 cursor-pointer before:content-['•'] before:mr-2 before:text-red-500">
                    {activeSport.name} Championship Race Heats Up
                </li>
                <li className="text-sm font-medium hover:text-red-600 cursor-pointer before:content-['•'] before:mr-2 before:text-red-500">
                    Upcoming {activeSport.name} Draft Analysis
                </li>
                <li className="text-sm font-medium hover:text-red-600 cursor-pointer before:content-['•'] before:mr-2 before:text-red-500">
                    Injury Report: Star Player to Miss Match
                </li>
            </ul>
        </div>
    );
}

function SidebarLink({ to, label }: { to: string, label: string }) {
    return (
        <Link to={to} className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-gray-50 p-2 rounded transition">
            <div className={`w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-600`}></div>
            {label}
        </Link>
    );
}



