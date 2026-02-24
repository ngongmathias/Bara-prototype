import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Play, Pause, Search as SearchIcon, Loader2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResults {
    songs: Song[];
    artists: any[];
    albums: any[];
    teams: any[];
}

export default function SearchPage() {
    const { play, currentSong, isPlaying, toggleLike, likedSongs } = useAudioPlayer();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<'all' | 'sports' | 'music'>('all');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResults>({
        songs: [],
        artists: [],
        albums: [],
        teams: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                setResults({ songs: [], artists: [], albums: [], teams: [] });
                setIsSearching(false);
                return;
            }

            setLoading(true);
            setIsSearching(true);

            try {
                // Search Songs
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*, artists(name)')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5);

                // Search Artists
                const { data: artistsData } = await supabase
                    .from('artists')
                    .select('*')
                    .ilike('name', `%${searchQuery}%`)
                    .limit(5);

                // Search Albums
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*, artists(name)')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5);

                // Search Teams (Sports)
                const { data: teamsData } = await supabase
                    .from('teams')
                    .select('*')
                    .ilike('name', `%${searchQuery}%`)
                    .limit(5);

                setResults({
                    songs: (songsData || []).map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artists?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id
                    })),
                    artists: artistsData || [],
                    albums: albumsData || [],
                    teams: teamsData || []
                });
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleGenreClick = (genre: string) => {
        setSearchQuery(genre);
        setActiveCategory('music');
        setIsSearching(true);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Search Header */}
            <div className="bg-gradient-to-b from-purple-900/20 to-black pt-16 pb-8 px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black mb-6">Search</h1>

                    {/* Search Input */}
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="What do you want to listen to?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white text-black pl-14 pr-4 py-4 rounded-full text-lg font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#1DB954]/20 transition-all"
                            autoFocus
                        />
                        {loading && (
                            <Loader2 className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#1DB954] animate-spin" />
                        )}
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
                                label="Music"
                                active={activeCategory === 'music'}
                                onClick={() => setActiveCategory('music')}
                            />
                            <CategoryPill
                                label="Sports"
                                active={activeCategory === 'sports'}
                                onClick={() => setActiveCategory('sports')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Search Results */}
            <div className="px-8 pb-24">
                <div className="max-w-7xl mx-auto">
                    {!isSearching ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
                            {/* Functional Genre Browsing */}
                            {[
                                { name: 'Afrobeats', color: 'from-orange-500 to-red-600' },
                                { name: 'Amapiano', color: 'from-yellow-500 to-orange-600' },
                                { name: 'Hip-Hop', color: 'from-blue-600 to-indigo-700' },
                                { name: 'R&B', color: 'from-pink-500 to-purple-600' },
                                { name: 'Highlife', color: 'from-green-500 to-emerald-700' },
                                { name: 'Sports News', color: 'from-blue-400 to-blue-600' },
                                { name: 'Live Matches', color: 'from-red-500 to-purple-800' },
                                { name: 'Podcasts', color: 'from-teal-500 to-cyan-600' }
                            ].map(genre => (
                                <div
                                    key={genre.name}
                                    onClick={() => handleGenreClick(genre.name)}
                                    className={`aspect-square rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all shadow-xl relative overflow-hidden bg-gradient-to-br ${genre.color} group`}
                                >
                                    <span className="text-2xl font-black tracking-tight">{genre.name}</span>
                                    <SearchIcon className="absolute -bottom-2 -right-2 w-24 h-24 text-black/20 transform rotate-12 group-hover:scale-110 transition-transform" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-12 mt-8">
                            {/* Songs Section */}
                            {(activeCategory === 'all' || activeCategory === 'music') && results.songs.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Songs</h2>
                                    <div className="space-y-2">
                                        {results.songs.map((song) => {
                                            const isCurrent = currentSong?.id === song.id;
                                            return (
                                                <div
                                                    key={song.id}
                                                    className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 rounded-lg group hover:bg-white/10 cursor-pointer items-center"
                                                    onClick={() => play(song)}
                                                >
                                                    <div className="relative w-12 h-12">
                                                        <img src={song.cover_url} className="w-12 h-12 rounded object-cover" alt="" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {isCurrent && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className={`font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</div>
                                                        <div className="text-sm text-gray-400">{song.artist}</div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                        className={`p-2 transition-colors ${likedSongs.includes(song.id) ? 'text-[#1DB954]' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white'}`}
                                                    >
                                                        <Heart size={18} fill={likedSongs.includes(song.id) ? "currentColor" : "none"} />
                                                    </button>
                                                    <div className="text-sm text-gray-500 w-12 text-right">
                                                        {typeof song.duration === 'number' && !isNaN(song.duration)
                                                            ? `${Math.floor(song.duration / 60)}:${Math.floor(song.duration % 60).toString().padStart(2, '0')}`
                                                            : '--:--'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Artists Section */}
                            {(activeCategory === 'all' || activeCategory === 'music') && results.artists.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Artists</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {results.artists.map((artist) => (
                                            <Link
                                                key={artist.id}
                                                to={`/streams/artist/${artist.id}`}
                                                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition group text-center"
                                            >
                                                <div className="relative mb-4 aspect-square">
                                                    <img
                                                        src={artist.image_url || '/placeholder-artist.png'}
                                                        className="w-full h-full object-cover rounded-full shadow-2xl"
                                                        alt={artist.name}
                                                    />
                                                    <button className="absolute bottom-4 right-0 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-2 group-hover:translate-y-0">
                                                        <Play size={20} fill="black" className="ml-1" />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold truncate text-white text-sm">{artist.name}</h3>
                                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Artist</p>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Albums Section */}
                            {(activeCategory === 'all' || activeCategory === 'music') && results.albums.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Albums</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {results.albums.map((album) => (
                                            <div
                                                key={album.id}
                                                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition group flex flex-col h-full shadow-lg"
                                            >
                                                <div className="relative mb-4 aspect-square">
                                                    <img
                                                        src={album.cover_url || '/placeholder-album.png'}
                                                        className="w-full h-full rounded-md object-cover shadow-2xl"
                                                        alt={album.title}
                                                    />
                                                    <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-2 group-hover:translate-y-0">
                                                        <Play size={20} fill="black" className="ml-1" />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold truncate text-white text-sm">{album.title}</h3>
                                                <p className="text-xs text-gray-400">{album.artists?.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Teams Section */}
                            {(activeCategory === 'all' || activeCategory === 'sports') && results.teams.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6">Sports Teams</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {results.teams.map((team) => (
                                            <div
                                                key={team.id}
                                                className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-4 cursor-pointer"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-black text-xl">
                                                    {team.short_name || team.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{team.name}</div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Football Team</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {isSearching && !loading && results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && results.teams.length === 0 && (
                                <div className="text-center py-20">
                                    <h2 className="text-2xl font-bold mb-2">No results found for "{searchQuery}"</h2>
                                    <p className="text-gray-400">Please check your spelling or try searching for something else.</p>
                                </div>
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
            className={`px-6 py-2 rounded-full font-bold transition-all ${active
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
        >
            {label}
        </button>
    );
}
