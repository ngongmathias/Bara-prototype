import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveScores } from '../../hooks/useLiveScores';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { Play, Calendar, User, ChevronRight } from 'lucide-react';
import { SportsTopBanner } from '../../components/sports/SportsTopBanner';
import { SportsSubNav } from '../../components/sports/SportsSubNav';

export default function SportsHome() {
    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-100 font-sans">
                {/* High-Fidelity ESPN Ticker */}
                <SportsTopBanner />

                {/* Sport-Specific Sub-Navigation */}
                <SportsSubNav />

                {/* Main Content Helper */}
                <div className="max-w-[1440px] mx-auto p-4">

                    <div className="grid grid-cols-12 gap-6">
                        {/* LEFT SIDEBAR (Quick Links) - 2 Cols */}
                        <aside className="hidden lg:block col-span-2 space-y-6">
                            <LeftSidebar />
                        </aside>

                        {/* CENTER CONTENT (Hero + News) - 7 Cols */}
                        <main className="col-span-12 lg:col-span-7 space-y-6">
                            <HeroArticle />

                            {/* Section Header */}
                            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2 mb-4">
                                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Top Stories</h2>
                                <Link to="/sports/news" className="text-blue-600 text-sm font-semibold hover:underline flex items-center">
                                    See All <ChevronRight size={16} />
                                </Link>
                            </div>

                            <NewsFeed />
                        </main>

                        {/* RIGHT SIDEBAR (Videos + Headlines) - 3 Cols */}
                        <aside className="col-span-12 lg:col-span-3 space-y-6">
                            <TopVideos />
                            <TopHeadlines />
                        </aside>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}


// Sidebar
function LeftSidebar() {
    return (
        <div className="bg-white rounded shadow-sm p-4 sticky top-4">
            <h3 className="font-bold text-xs text-gray-500 uppercase mb-4 tracking-wider">Quick Links</h3>
            <nav className="space-y-1">
                <SidebarLink to="/sports/table/39" color="bg-purple-700" label="Premier League" />
                <SidebarLink to="/sports/table/140" color="bg-orange-500" label="La Liga" />
                <SidebarLink to="/sports/table/2" color="bg-blue-900" label="Champions League" />
                <div className="h-px bg-gray-200 my-2"></div>
                <SidebarLink to="/sports/scores" color="bg-gray-800" label="All Scores" />
                <SidebarLink to="/sports/favorites" color="bg-red-600" label="My Teams" />
            </nav>
        </div>
    );
}

function SidebarLink({ to, color, label }: { to: string, color: string, label: string }) {
    return (
        <Link to={to} className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            {label}
        </Link>
    );
}


// Hero Article (Bigger, Bolder)
function HeroArticle() {
    // We ideally fetch this from DB, but for now using static or the first item
    return (
        <article className="relative bg-gray-900 h-[400px] rounded-lg overflow-hidden group cursor-pointer shadow-md">
            <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2836&auto=format&fit=crop"
                alt="Hero"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition duration-500 grayscale-[20%] group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider mb-2 inline-block">Breaking News</span>
                    <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-4 drop-shadow-lg font-roboto-condensed">
                        Mamelodi Sundowns seal historic treble with dominant derby win
                    </h1>
                    <p className="text-gray-300 text-lg line-clamp-2 md:line-clamp-none mb-4">
                        The Brazilian's relentless season concludes with yet another trophy as they outclass their rivals in a match that will be remembered for years.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        <span>By Sports Desk</span>
                        <span>•</span>
                        <span>2 Hours Ago</span>
                    </div>
                </div>
            </div>
        </article>
    );
}

// News Feed (List Layout like ESPN)
function NewsFeed() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('sports_news')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10); // Fetch MORE items
            if (data) setNews(data);
            setLoading(false);
        };
        fetchNews();
    }, []);

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
function TopVideos() {
    return (
        <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Top Videos</h3>
            </div>
            <div className="divide-y divide-gray-100">
                <VideoListItem title="Highlights: Arsenal vs Chelsea" duration="10:23" />
                <VideoListItem title="Klopp's farewell speech in full" duration="04:12" />
                <VideoListItem title="Top 10 Goals of the Season so far" duration="08:45" />
            </div>
            <div className="p-3 bg-gray-50 text-center">
                <Link to="/sports/videos" className="text-xs font-bold text-blue-600 hover:underline">View All Videos</Link>
            </div>
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

function TopHeadlines() {
    return (
        <div className="bg-white rounded shadow-sm p-4 border border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">Trending Now</h3>
            <ul className="space-y-3">
                <li className="text-sm font-medium hover:text-blue-600 cursor-pointer before:content-['•'] before:mr-2 before:text-red-500">
                    Osimhen requests final transfer decision
                </li>
                <li className="text-sm font-medium hover:text-blue-600 cursor-pointer before:content-['•'] before:mr-2 before:text-red-500">
                    Mbappe presented at Bernabeu in front of 80,000
                </li>
                <li className="text-sm font-medium hover:text-blue-600 cursor-pointer before:content-['•'] before:mr-2 before:text-red-500">
                    Springboks announce squad for upcoming test series
                </li>
            </ul>
        </div>
    );
}
