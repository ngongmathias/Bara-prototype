import { useState } from 'react';
import { useParams } from 'react-router-dom';

// Mock artist data
const mockArtist = {
    id: 1,
    name: "Burna Boy",
    verified: true,
    monthlyListeners: "28.5M",
    followers: "15.2M",
    bio: "Grammy-winning Nigerian singer, songwriter and record producer. Known for his unique blend of Afrobeats, dancehall, reggae, and American rap.",
    headerGradient: "from-orange-600 to-red-600",
    topTracks: [
        { id: 1, title: "Last Last", plays: "450M", duration: "2:47", album: "Love, Damini", coverColor: "bg-orange-500" },
        { id: 2, title: "Ye", plays: "380M", duration: "3:14", album: "Outside", coverColor: "bg-yellow-500" },
        { id: 3, title: "On the Low", plays: "320M", duration: "3:52", album: "African Giant", coverColor: "bg-blue-500" },
        { id: 4, title: "Kilometre", plays: "280M", duration: "3:42", album: "Love, Damini", coverColor: "bg-orange-500" },
        { id: 5, title: "It's Plenty", plays: "215M", duration: "3:28", album: "Love, Damini", coverColor: "bg-orange-500" }
    ],
    albums: [
        { id: 1, title: "Love, Damini", year: "2022", coverColor: "bg-orange-500" },
        { id: 2, title: "Twice as Tall", year: "2020", coverColor: "bg-purple-600" },
        { id: 3, title: "African Giant", year: "2019", coverColor: "bg-blue-600" },
        { id: 4, title: "Outside", year: "2018", coverColor: "bg-yellow-600" }
    ],
    appearsOn: [
        { title: "Afrobeats Hits", type: "Playlist", coverColor: "bg-green-500" },
        { title: "Top Global", type: "Playlist", coverColor: "bg-pink-500" }
    ]
};

export default function ArtistPage() {
    const { id } = useParams();
    const [following, setFollowing] = useState(false);
    const [likedTracks, setLikedTracks] = useState<number[]>([]);

    const toggleLike = (trackId: number) => {
        setLikedTracks(prev =>
            prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
        );
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Hero Header */}
            <div className={`bg-gradient-to-b ${mockArtist.headerGradient} pt-20 pb-6 px-8`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end gap-6">
                        {/* Artist Image */}
                        <div className="w-56 h-56 rounded-full shadow-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <div className="text-8xl">🎤</div>
                        </div>

                        {/* Artist Info */}
                        <div className="flex-1 pb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <span className="text-sm font-semibold">Verified Artist</span>
                            </div>
                            <h1 className="text-8xl font-bold mb-6 leading-none">{mockArtist.name}</h1>
                            <div className="text-sm font-semibold">
                                {mockArtist.monthlyListeners} monthly listeners
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-gradient-to-b from-black/40 to-black px-8 pt-6 pb-4">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    {/* Play Button */}
                    <button className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 hover:bg-[#1ed760] transition flex items-center justify-center shadow-xl">
                        <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>

                    {/* Shuffle Button */}
                    <button className="text-gray-400 hover:text-white transition">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                        </svg>
                    </button>

                    {/* Follow Button */}
                    <button
                        onClick={() => setFollowing(!following)}
                        className={`px-8 py-3 rounded-full font-semibold transition ${following
                            ? 'border border-gray-400 text-white hover:border-white'
                            : 'border border-gray-400 text-white hover:border-white hover:scale-105'
                            }`}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>

                    {/* More Options */}
                    <button className="text-gray-400 hover:text-white transition">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content Sections */}
            <div className="px-8 pt-8">
                <div className="max-w-7xl mx-auto">
                    {/* Popular Tracks */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Popular</h2>
                        <div className="space-y-2">
                            {mockArtist.topTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="grid grid-cols-[16px_4fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-white/10 cursor-pointer items-center"
                                >
                                    {/* Track Number / Play Button */}
                                    <div className="text-gray-400 group-hover:text-white">
                                        <span className="group-hover:hidden">{index + 1}</span>
                                        <svg className="w-4 h-4 hidden group-hover:block" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>

                                    {/* Track Info */}
                                    <div className="flex gap-3 items-center min-w-0">
                                        <div className={`w-10 h-10 ${track.coverColor} rounded flex-shrink-0`}></div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold truncate group-hover:text-[#1DB954] transition">
                                                {track.title}
                                            </div>
                                            <div className="text-sm text-gray-400">{track.plays} plays</div>
                                        </div>
                                    </div>

                                    {/* Album */}
                                    <div className="text-sm text-gray-400 truncate">
                                        {track.album}
                                    </div>

                                    {/* Duration and Heart */}
                                    <div className="flex items-center justify-end gap-4">
                                        <button
                                            onClick={() => toggleLike(track.id)}
                                            className={`opacity-0 group-hover:opacity-100 transition ${likedTracks.includes(track.id) ? 'text-[#1DB954] opacity-100' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <svg className="w-4 h-4" fill={likedTracks.includes(track.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                        <span className="text-sm text-gray-400 min-w-[40px] text-right">{track.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 text-sm font-semibold text-gray-400 hover:text-white transition">
                            See more
                        </button>
                    </section>

                    {/* Discography */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Discography</h2>
                            <button className="text-sm font-semibold text-gray-400 hover:text-white">Show all</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {mockArtist.albums.map((album) => (
                                <div key={album.id} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer group">
                                    <div className="relative mb-4">
                                        <div className={`w-full aspect-square ${album.coverColor} rounded shadow-lg`}></div>

                                        {/* Play Button on Hover */}
                                        <button className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                                            <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-base mb-1 truncate">{album.title}</h3>
                                    <p className="text-sm text-gray-400">{album.year} • Album</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* About */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <div className="bg-[#181818] rounded-lg p-8 relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${mockArtist.headerGradient} opacity-20`}></div>
                            <div className="relative">
                                <div className="text-5xl font-bold mb-4">{mockArtist.followers}</div>
                                <div className="text-sm text-gray-400 mb-6">Followers</div>
                                <p className="text-gray-300 leading-relaxed max-w-3xl">
                                    {mockArtist.bio}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
