import { useState } from 'react';

// Mock search results
const mockResults = {
    teams: [
        { id: 1, name: "Manchester United", league: "Premier League", logo: "MUN" },
        { id: 2, name: "Manchester City", league: "Premier League", logo: "MCI" }
    ],
    players: [
        { id: 1, name: "Marcus Rashford", team: "Manchester United", position: "Forward" },
        { id: 2, name: "Bruno Fernandes", team: "Manchester United", position: "Midfielder" }
    ],
    songs: [
        { id: 1, title: "Last Last", artist: "Burna Boy", album: "Love, Damini", duration: "2:47", coverColor: "bg-orange-500" },
        { id: 2, title: "Calm Down", artist: "Rema", album: "Rave & Roses", duration: "3:59", coverColor: "bg-purple-500" }
    ],
    artists: [
        { id: 1, name: "Burna Boy", monthlyListeners: "28.5M", verified: true },
        { id: 2, name: "Rema", monthlyListeners: "15.2M", verified: true }
    ],
    playlists: [
        { id: 1, title: "Afrobeats Essentials", creator: "Bara Streams", trackCount: 50, coverGradient: "from-purple-600 to-blue-600" },
        { id: 2, title: "Top Hits 2024", creator: "Bara Streams", trackCount: 100, coverGradient: "from-green-600 to-teal-600" }
    ]
};

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<'all' | 'sports' | 'music'>('all');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearching(query.length > 0);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Search Header */}
            <div className="bg-gradient-to-b from-gray-900 to-black pt-16 pb-8 px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-6">Search</h1>

                    {/* Search Input */}
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search for sports, teams, songs, artists..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-white text-black pl-14 pr-4 py-4 rounded-full text-lg font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                            autoFocus
                        />
                    </div>

                    {/* Category Filters */}
                    {isSearching && (
                        <div className="flex gap-3 mt-6">
                            <CategoryPill
                                label="All"
                                active={activeCategory === 'all'}
                                onClick={() => setActiveCategory('all')}
                            />
                            <CategoryPill
                                label="Sports"
                                active={activeCategory === 'sports'}
                                onClick={() => setActiveCategory('sports')}
                            />
                            <CategoryPill
                                label="Music"
                                active={activeCategory === 'music'}
                                onClick={() => setActiveCategory('music')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Search Results */}
            <div className="px-8 pb-24">
                <div className="max-w-7xl mx-auto">
                    {!isSearching ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold mb-2">Find what you love</h2>
                            <p className="text-gray-400">Search for teams, players, songs, artists, and playlists</p>
                        </div>
                    ) : (
                        <div className="space-y-12 mt-8">
                            {/* Teams Section */}
                            {(activeCategory === 'all' || activeCategory === 'sports') && mockResults.teams.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Teams</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {mockResults.teams.map((team) => (
                                            <a
                                                key={team.id}
                                                href={`/sports/team/${team.id}`}
                                                className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition cursor-pointer flex items-center gap-4"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                    {team.logo}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-lg truncate">{team.name}</div>
                                                    <div className="text-sm text-gray-400">{team.league}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Players Section */}
                            {(activeCategory === 'all' || activeCategory === 'sports') && mockResults.players.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Players</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {mockResults.players.map((player) => (
                                            <div
                                                key={player.id}
                                                className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition cursor-pointer flex items-center gap-4"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-4xl flex-shrink-0">
                                                    ⚽
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-lg truncate">{player.name}</div>
                                                    <div className="text-sm text-gray-400">{player.position} • {player.team}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Artists Section */}
                            {(activeCategory === 'all' || activeCategory === 'music') && mockResults.artists.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Artists</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {mockResults.artists.map((artist) => (
                                            <a
                                                key={artist.id}
                                                href={`/streams/artist/${artist.id}`}
                                                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer group"
                                            >
                                                <div className="relative mb-4">
                                                    <div className="w-full aspect-square bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg flex items-center justify-center text-5xl">
                                                        🎤
                                                    </div>
                                                    <button className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                                                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <h3 className="font-semibold text-base mb-1 truncate">{artist.name}</h3>
                                                <p className="text-sm text-gray-400">
                                                    {artist.verified && (
                                                        <span className="inline-block mr-1">✓</span>
                                                    )}
                                                    Artist
                                                </p>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Songs Section */}
                            {(activeCategory === 'all' || activeCategory === 'music') && mockResults.songs.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Songs</h2>
                                    <div className="space-y-2">
                                        {mockResults.songs.map((song, index) => (
                                            <div
                                                key={song.id}
                                                className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-white/10 cursor-pointer items-center"
                                            >
                                                <div className="text-gray-400 group-hover:text-white">
                                                    <span className="group-hover:hidden">{index + 1}</span>
                                                    <svg className="w-4 h-4 hidden group-hover:block" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex gap-3 items-center min-w-0">
                                                    <div className={`w-10 h-10 ${song.coverColor} rounded flex-shrink-0`}></div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-semibold truncate group-hover:text-[#1DB954] transition">
                                                            {song.title}
                                                        </div>
                                                        <div className="text-sm text-gray-400">{song.artist}</div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-400 truncate">{song.album}</div>
                                                <div className="text-sm text-gray-400 text-right">{song.duration}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Playlists Section */}
                            {(activeCategory === 'all' || activeCategory === 'music') && mockResults.playlists.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Playlists</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {mockResults.playlists.map((playlist) => (
                                            <a
                                                key={playlist.id}
                                                href={`/streams/playlist/${playlist.id}`}
                                                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer group"
                                            >
                                                <div className="relative mb-4">
                                                    <div className={`w-full aspect-square bg-gradient-to-br ${playlist.coverGradient} rounded shadow-lg flex items-center justify-center`}>
                                                        <svg className="w-12 h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                        </svg>
                                                    </div>
                                                    <button className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                                                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <h3 className="font-semibold text-base mb-1 truncate">{playlist.title}</h3>
                                                <p className="text-sm text-gray-400">{playlist.creator} • {playlist.trackCount} songs</p>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-full font-semibold transition ${active
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
        >
            {label}
        </button>
    );
}
