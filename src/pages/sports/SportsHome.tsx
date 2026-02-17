import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveScores } from '../../hooks/useLiveScores';

export default function SportsHome() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <TopNavBar />

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

// Top Navigation Bar Component
function TopNavBar() {
    const [isMoreSportsOpen, setIsMoreSportsOpen] = useState(false);

    return (
        <nav className="bg-black text-white">
            <div className="flex items-center justify-between px-4 h-12">
                {/* ESPN Logo + Sports */}
                <div className="flex items-center gap-6">
                    <div className="bg-[#CC0000] px-3 py-1 font-bold text-xl">ESPN</div>
                    <a href="#" className="text-sm hover:underline">Football</a>
                    <a href="#" className="text-sm hover:underline">NBA</a>
                    <a href="#" className="text-sm hover:underline">NFL</a>
                    <a href="#" className="text-sm hover:underline">MLB</a>
                    <a href="#" className="text-sm hover:underline">Cricket</a>
                    <a href="#" className="text-sm hover:underline">Boxing</a>
                    <a href="#" className="text-sm hover:underline">Rugby</a>
                    <div className="relative">
                        <button
                            onClick={() => setIsMoreSportsOpen(!isMoreSportsOpen)}
                            className="text-sm hover:underline"
                        >
                            More Sports
                        </button>
                        {isMoreSportsOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white text-black shadow-lg rounded p-4 w-48 z-50">
                                <a href="#" className="block py-1 hover:underline text-sm">Tennis</a>
                                <a href="#" className="block py-1 hover:underline text-sm">Golf</a>
                                <a href="#" className="block py-1 hover:underline text-sm">F1</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <a href="#" className="text-sm hover:underline">Fantasy</a>
                    <a href="/search" className="text-white hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </a>
                    <button className="text-white">👤</button>
                </div>
            </div>
        </nav>
    );
}

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
                <h3 className="font-bold text-sm mb-3">Customize ESPN</h3>
                <button className="w-full bg-blue-600 text-white py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition mb-2">
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
                    <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-blue-900"></div>
                        UEFA Champions League
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-purple-700"></div>
                        English Premier League
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-orange-500"></div>
                        Basketball Africa League
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                        <div className="w-5 h-5 rounded-full bg-gray-600"></div>
                        Boxing
                    </a>
                </nav>
            </div>

            {/* Fixtures */}
            <div>
                <h3 className="font-bold text-sm mb-2">Fixtures</h3>
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
    return (
        <div className="space-y-4">
            <NewsCard
                title="Orlando Pirates and Mamelodi Sundowns clash in PSL title race six-pointer"
                category="PSL"
                time="14h"
                author="Lorenz Kohler"
            />
            <NewsCard
                title="FA Cup: Wrexham to host Chelsea in fifth round"
                category="FA CUP"
                time="1d"
                author="ESPN"
            />
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
    return (
        <div className="bg-white rounded-lg p-4 mb-4">
            <h2 className="font-bold mb-3">Top Videos</h2>
            <div className="space-y-3">
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
                <VideoCard
                    title="Gibbs hails Arsenal's ability to 'bounce back' this season"
                    duration="1:52"
                    league="English Premier League"
                    isPlaying={false}
                />
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
