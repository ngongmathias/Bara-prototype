import { useState } from 'react';
import { useParams } from 'react-router-dom';

// Mock playlist data
const mockPlaylist = {
    id: 1,
    title: "Afrobeats Essentials",
    creator: "Bara Streams",
    description: "The biggest Afrobeats hits from across the continent. Updated weekly with the freshest tracks.",
    coverGradient: "from-purple-600 to-blue-600",
    trackCount: 50,
    totalDuration: "2 hr 34 min",
    tracks: [
        { number: 1, title: "Last Last", artist: "Burna Boy", album: "Love, Damini", duration: "2:47", dateAdded: "2 weeks ago" },
        { number: 2, title: "Calm Down", artist: "Rema", album: "Rave & Roses", duration: "3:59", dateAdded: "1 month ago" },
        { number: 3, title: "Buga", artist: "Kizz Daniel", album: "Buga (feat. Tekno)", duration: "2:50", dateAdded: "1 month ago" },
        { number: 4, title: "Peru", artist: "Fireboy DML", album: "Apollo", duration: "3:20", dateAdded: "2 months ago" },
        { number: 5, title: "Monalisa", artist: "Lojay, Sarz", album: "LV N ATTN", duration: "2:38", dateAdded: "2 months ago" },
        { number: 6, title: "Bandana", artist: "Fireboy DML, Asake", album: "Playboy", duration: "4:12", dateAdded: "3 months ago" },
        { number: 7, title: "Invobi", artist: "Oxlade", album: "Oxygene", duration: "3:15", dateAdded: "3 months ago" },
        { number: 8, title: "Finesse", artist: "Pheelz, BNXN", album: "Finesse", duration: "2:51", dateAdded: "4 months ago" },
        { number: 9, title: "Joha", artist: "Joeboy", album: "Alcohol", duration: "2:39", dateAdded: "4 months ago" },
        { number: 10, title: "Kilometre", artist: "Burna Boy", album: "Love, Damini", duration: "3:42", dateAdded: "5 months ago" }
    ]
};

export default function PlaylistPage() {
    const { id } = useParams();
    const [likedTracks, setLikedTracks] = useState<number[]>([]);

    const toggleLike = (trackNumber: number) => {
        setLikedTracks(prev =>
            prev.includes(trackNumber)
                ? prev.filter(n => n !== trackNumber)
                : [...prev, trackNumber]
        );
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Hero Header */}
            <div className={`bg-gradient-to-b ${mockPlaylist.coverGradient} pt-16 pb-6 px-8`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end gap-6">
                        {/* Playlist Cover */}
                        <div className={`w-56 h-56 rounded shadow-2xl bg-gradient-to-br ${mockPlaylist.coverGradient} flex items-center justify-center flex-shrink-0`}>
                            <svg className="w-24 h-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>

                        {/* Playlist Info */}
                        <div className="flex-1 pb-4">
                            <div className="text-sm font-semibold mb-2 uppercase">Playlist</div>
                            <h1 className="text-6xl font-bold mb-6 leading-tight">{mockPlaylist.title}</h1>
                            <p className="text-white/90 mb-4">{mockPlaylist.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">{mockPlaylist.creator}</span>
                                <span className="text-white/70">•</span>
                                <span className="text-white/90">{mockPlaylist.trackCount} songs</span>
                                <span className="text-white/70">•</span>
                                <span className="text-white/70">{mockPlaylist.totalDuration}</span>
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

                    {/* Heart/Like Button */}
                    <button className="text-gray-400 hover:text-white transition">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* More Options */}
                    <button className="text-gray-400 hover:text-white transition">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Track List */}
            <div className="px-8 pt-4">
                <div className="max-w-7xl mx-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-gray-800 mb-2 text-sm text-gray-400 uppercase">
                        <div className="text-center">#</div>
                        <div>Title</div>
                        <div>Album</div>
                        <div>Date added</div>
                        <div className="text-right">⏱</div>
                    </div>

                    {/* Track Rows */}
                    <div>
                        {mockPlaylist.tracks.map((track) => (
                            <TrackRow
                                key={track.number}
                                track={track}
                                isLiked={likedTracks.includes(track.number)}
                                onToggleLike={() => toggleLike(track.number)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrackRow({
    track,
    isLiked,
    onToggleLike
}: {
    track: typeof mockPlaylist.tracks[0];
    isLiked: boolean;
    onToggleLike: () => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-white/10 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Track Number / Play Button */}
            <div className="flex items-center justify-center text-gray-400 group-hover:text-white">
                {isHovered ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                ) : (
                    <span className="text-sm">{track.number}</span>
                )}
            </div>

            {/* Title and Artist */}
            <div className="flex gap-3 items-center min-w-0">
                <div className="w-10 h-10 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate group-hover:text-[#1DB954] transition">
                        {track.title}
                    </div>
                    <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                </div>
            </div>

            {/* Album */}
            <div className="flex items-center text-sm text-gray-400 truncate">
                {track.album}
            </div>

            {/* Date Added */}
            <div className="flex items-center text-sm text-gray-400">
                {track.dateAdded}
            </div>

            {/* Duration and Heart */}
            <div className="flex items-center justify-end gap-4">
                <button
                    onClick={onToggleLike}
                    className={`opacity-0 group-hover:opacity-100 transition ${isLiked ? 'text-[#1DB954] opacity-100' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                <span className="text-sm text-gray-400 min-w-[40px] text-right">{track.duration}</span>
            </div>
        </div>
    );
}
