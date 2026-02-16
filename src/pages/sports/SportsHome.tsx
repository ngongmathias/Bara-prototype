import { useState } from 'react';

export default function SportsHome() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Score Ticker */}
            <div className="bg-white border-b border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
                    {/* Mock match cards */}
                    <ScoreCard
                        homeTeam="GAL"
                        awayTeam="JUV"
                        homeScore={0}
                        awayScore={2}
                        status="FT"
                        competition="UCL"
                    />
                    <ScoreCard
                        homeTeam="SLB"
                        awayTeam="RMA"
                        homeScore={1}
                        awayScore={0}
                        status="LIVE"
                        minute={67}
                        competition="UCL"
                    />
                    <ScoreCard
                        homeTeam="ATA"
                        awayTeam="PSG"
                        homeScore={null}
                        awayScore={null}
                        status="19:00"
                        competition="UCL"
                    />
                </div>
            </div>

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

// Score Card Component
function ScoreCard({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    minute,
    competition
}: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    minute?: number;
    competition: string;
}) {
    const isLive = status === 'LIVE';

    return (
        <div className="flex-shrink-0 border border-gray-200 rounded px-3 py-2 min-w-[140px] hover:bg-gray-50 cursor-pointer transition">
            <div className="text-xs text-gray-500 mb-1">{competition}</div>
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{homeTeam}</span>
                {homeScore !== null ? (
                    <span className="font-bold">{homeScore}</span>
                ) : null}
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{awayTeam}</span>
                {awayScore !== null ? (
                    <span className="font-bold">{awayScore}</span>
                ) : null}
            </div>
            <div className={`text-xs mt-1 ${isLive ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {isLive ? `${minute}'` : status}
            </div>
        </div>
    );
}

// Left Sidebar Component
function LeftSidebar() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-sm mb-2">Quick Links</h3>
                <nav className="space-y-1">
                    <a href="#" className="block text-sm hover:underline">UEFA Champions League</a>
                    <a href="#" className="block text-sm hover:underline">English Premier League</a>
                    <a href="#" className="block text-sm hover:underline">Basketball Africa League</a>
                    <a href="#" className="block text-sm hover:underline">Boxing</a>
                </nav>
            </div>
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
                />
            </div>
        </div>
    );
}

function VideoCard({ title, duration, league }: { title: string; duration: string; league: string }) {
    return (
        <div className="cursor-pointer">
            <div className="w-full h-20 bg-gray-200 rounded mb-2 relative">
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {duration}
                </div>
            </div>
            <p className="text-sm font-semibold mb-1">{title}</p>
            <p className="text-xs text-gray-500">{league</p>
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
