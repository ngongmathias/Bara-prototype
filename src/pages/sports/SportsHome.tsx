import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveScores } from '../../hooks/useLiveScores';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

export default function SportsHome() {
    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Score Ticker */}
                <LiveScoreTicker />

                {/* Main Layout - 3 Column Grid */}
                <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-4 p-4">
                    {/* Left Sidebar */}
                    <aside className="col-span-12 lg:col-span-2 bg-white rounded-lg p-4">
                        <LeftSidebar />
                    </aside>

                    {/* Main Content */}
                    <main className="col-span-12 lg:col-span-7">
                        <HeroArticle />
                        <NewsFeed />
                    </main>

                    {/* Right Sidebar */}
                    <aside className="col-span-12 lg:col-span-3">
                        <TopVideos />
                        <TopHeadlines />
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}

// Live Score Ticker Component
function LiveScoreTicker() {
    // Fetch live scores from API
    const { data: liveMatches, isLoading, error } = useLiveScores({
        enabled: true,
        refetchInterval: 60000 // Auto-refresh every 60 seconds
    });

    if (error) {
        // Silently fail - show empty ticker if API fails
        return (
            <div className="bg-white border-b border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-2">
                    <span className="text-sm text-gray-500">Scores unavailable</span>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-white border-b border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-2">
                    <span className="text-sm text-gray-500 animate-pulse">Loading scores...</span>
                </div>
            </div>
        );
    }

    // If no matches, show friendly message
    if (!liveMatches || liveMatches.length === 0) {
        return (
            <div className="bg-white border-b border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-2">
                    <span className="text-sm text-gray-500">No live matches at the moment</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-gray-200 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
                {liveMatches.map((match) => {
                    const isLive = ['1H', '2H', 'HT', 'LIVE'].includes(match.fixture.status.short);
                    const isFinal = match.fixture.status.short === 'FT';

                    return (
                        <Link
                            key={match.fixture.id}
                            to={`/sports/match/${match.fixture.id}`}
                            className="block"
                        >
                            <ScoreCard
                                homeTeam={match.teams.home.name}
                                awayTeam={match.teams.away.name}
                                homeScore={match.goals.home}
                                awayScore={match.goals.away}
                                status={isLive ? 'LIVE' : isFinal ? 'FT' : new Date(match.fixture.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                minute={match.fixture.status.elapsed}
                                competition={match.league.name}
                                homeTeamLogo={match.teams.home.logo}
                                awayTeamLogo={match.teams.away.logo}
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

// TopNavBar removed - now using MainLayout for consistent header/footer

// Score Card Component
function ScoreCard({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    minute,
    competition,
    homeTeamLogo,
    awayTeamLogo
}: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    minute?: number | null;
    competition: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
}) {
    const isLive = status === 'LIVE';
    const isFinal = status === 'FT';

    return (
        <div className="flex-shrink-0 bg-white border border-gray-200 rounded shadow-sm px-4 py-3 min-w-[200px] hover:shadow-md cursor-pointer transition">
            {/* Competition Badge */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">{competition}</span>
                {isLive && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                        LIVE
                    </span>
                )}
                {isFinal && (
                    <span className="text-xs font-semibold text-gray-500">FT</span>
                )}
            </div>

            {/* Teams and Scores */}
            <div className="space-y-2">
                {/* Home Team */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {homeTeamLogo ? (
                            <img src={homeTeamLogo} alt={homeTeam} className="w-6 h-6 object-contain flex-shrink-0" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0"></div>
                        )}
                        <span className="font-semibold text-sm truncate">{homeTeam}</span>
                    </div>
                    {homeScore !== null && (
                        <span className="font-bold text-lg ml-2">{homeScore}</span>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {awayTeamLogo ? (
                            <img src={awayTeamLogo} alt={awayTeam} className="w-6 h-6 object-contain flex-shrink-0" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0"></div>
                        )}
                        <span className="font-semibold text-sm truncate">{awayTeam}</span>
                    </div>
                    {awayScore !== null && (
                        <span className="font-bold text-lg ml-2">{awayScore}</span>
                    )}
                </div>
            </div>

            {/* Status/Time */}
            {!isLive && !isFinal && homeScore === null && (
                <div className="text-xs text-gray-600 mt-2 text-center">{status}</div>
            )}
            {isLive && minute && (
                <div className="text-xs text-red-600 font-semibold mt-2 text-center">{minute}'</div>
            )}
        </div>
    );
}

// Left Sidebar Component
function LeftSidebar() {
    return (
        <div className="space-y-6">
            {/* Customize ESPN */}
            <div>
                <h3 className="font-comfortaa font-semibold text-sm mb-3">Customize Bara Sports</h3>
                <button className="w-full bg-black text-white py-2 rounded-full font-semibold text-sm hover:bg-gray-800 transition mb-2">
                    Create Account
                </button>
                <button className="w-full text-blue-600 text-sm hover:underline">
                    Log In
                </button>
            </div>

            {/* Quick Links */}
            <div>
                <h3 className="font-bold text-sm mb-2">Quick Links</h3>
                <nav className="space-y-1">
                    <Link to="/sports/table/2" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-blue-900"></div>
                        UEFA Champions League
                    </Link>
                    <Link to="/sports/table/39" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-purple-700"></div>
                        English Premier League
                    </Link>
                    <Link to="/sports/table/140" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-orange-500"></div>
                        La Liga
                    </Link>
                    <Link to="/sports/scores" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-gray-600"></div>
                        All Scores
                    </Link>
                </nav>
            </div>

            {/* Favorites */}
            <div>
                <h3 className="font-comfortaa font-semibold text-sm mb-3">Favorites</h3>
                <div className="space-y-2">
                    <FixtureCard
                        homeTeam="WOL"
                        awayTeam="ARS"
                        score="1&2 - 18:30 PM"
                        league="English Premier League"
                    />
                    <FixtureCard
                        homeTeam="ARS"
                        awayTeam="CHE"
                        score="4 - FT"
                        league="English Emirates FA Cup"
                    />
                </div>
            </div>

            {/* ESPN Apps */}
            <div>
                <h3 className="font-bold text-sm mb-2">ESPN Apps</h3>
                <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                    📱 ESPN App
                </a>
            </div>

            {/* ESPN Sites */}
            <div>
                <h3 className="font-bold text-sm mb-2">ESPN Sites</h3>
                <a href="#" className="flex items-center gap-2 text-sm hover:underline text-blue-600">
                    🏏 ESPNcricinfo
                </a>
            </div>
        </div>
    );
}

function FixtureCard({ homeTeam, awayTeam, score, league }: { homeTeam: string; awayTeam: string; score: string; league: string }) {
    return (
        <div className="text-xs border-l-2 border-gray-300 pl-2 py-1 hover:border-blue-600 cursor-pointer">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span className="font-semibold">{homeTeam}</span>
                </div>
                <span></span>
            </div>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span className="font-semibold">{awayTeam}</span>
                </div>
                <span className="font-bold">{score}</span>
            </div>
            <div className="text-gray-500">{league}</div>
        </div>
    );
}

// Hero Article Component
function HeroArticle() {
    return (
        <article className="bg-white rounded-lg overflow-hidden mb-4">
            <div className="relative h-80 bg-gradient-to-br from-purple-900 to-blue-900">
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-white text-3xl font-bold mb-2">
                        Real Madrid broke Mourinho... Now he could break them with Benfica
                    </h1>
                    <p className="text-gray-200 text-sm">
                        Real Madrid know enough about ex-coach José Mourinho to expect a sting in the tail when they meet his Benfica team in their Champions League playoff.
                    </p>
                    <div className="text-gray-400 text-xs mt-2">17h • Mark Ogden</div>
                </div>
            </div>
        </article>
    );
}

// News Feed Component
function NewsFeed() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('sports_news')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (data) setNews(data);
            setLoading(false);
        };
        fetchNews();
    }, []);

    if (loading) return <div className="p-4 bg-white rounded-lg">Loading news...</div>;

    if (news.length === 0) {
        return (
            <div className="space-y-4">
                <NewsCard
                    title="Orlando Pirates and Mamelodi Sundowns clash in PSL title race six-pointer"
                    category="PSL"
                    time="14h"
                    author="Lorenz Kohler"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {news.map(item => (
                <NewsCard
                    key={item.id}
                    title={item.title}
                    category={item.category}
                    time={new Date(item.created_at).toLocaleDateString()}
                    author={item.author}
                />
            ))}
        </div>
    );
}

function NewsCard({ title, category, time, author }: { title: string; category: string; time: string; author: string }) {
    return (
        <article className="bg-white rounded-lg p-4 hover:shadow-md transition cursor-pointer">
            <div className="text-xs font-semibold text-red-600 mb-2">{category}</div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <div className="text-sm text-gray-500">{time} • {author}</div>
        </article>
    );
}

// Top Videos Component
function TopVideos() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            const { data } = await supabase
                .from('sports_videos')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (data) setVideos(data);
            setLoading(false);
        };
        fetchVideos();
    }, []);

    return (
        <div className="bg-white rounded-lg p-4 mb-4">
            <h2 className="font-bold mb-3">Top Videos</h2>
            <div className="space-y-3">
                {loading ? (
                    <div className="text-sm text-gray-500">Loading videos...</div>
                ) : videos.length > 0 ? (
                    videos.map(video => (
                        <VideoCard
                            key={video.id}
                            title={video.title}
                            duration={video.duration}
                            league={video.league}
                            isPlaying={video.is_live}
                        />
                    ))
                ) : (
                    <>
                        <VideoCard
                            title="Slot believes Szoboszlai has what it takes to become a future Liverpool captain"
                            duration="1:26"
                            league="English FA Cup"
                            isPlaying={true}
                        />
                        <VideoCard
                            title="Arbeloa: Vinicius Jr is one of the best players in the world"
                            duration="0:55"
                            league="Spanish LALIGA"
                            isPlaying={false}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

function VideoCard({ title, duration, league, isPlaying }: { title: string; duration: string; league: string; isPlaying: boolean }) {
    return (
        <div className="cursor-pointer group">
            <div className="w-full h-20 bg-gray-200 rounded mb-2 relative overflow-hidden">
                {/* Video thumbnail placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>

                {/* Duration badge */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {duration}
                </div>

                {/* Play overlay appears on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition">
                        <div className="text-black text-xl opacity-0 group-hover:opacity-100 transition">▶</div>
                    </div>
                </div>
            </div>

            {isPlaying && (
                <div className="flex items-center gap-1 text-[#CC0000] text-xs font-semibold mb-1">
                    <span className="text-[#CC0000]">🔴</span> Now Playing
                </div>
            )}

            <p className="text-sm font-semibold mb-1 line-clamp-2">{title}</p>
            <p className="text-xs text-gray-500">{league}</p>
        </div>
    );
}

// Top Headlines Component
function TopHeadlines() {
    return (
        <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold mb-3">Top Headlines</h2>
            <div className="space-y-3">
                <HeadlineCard title="Ronaldo's coach: Al Nassr lack 'economic power'" />
                <HeadlineCard title="Bayern's Kane 'proud' to score 500th career goal" />
                <HeadlineCard title="Edwards, Wemby set tone for competitive ASG" />
            </div>
        </div>
    );
}

function HeadlineCard({ title }: { title: string }) {
    return (
        <a href="#" className="block text-sm hover:underline">
            {title}
        </a>
    );
}
