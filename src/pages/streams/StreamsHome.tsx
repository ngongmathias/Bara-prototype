import { useEffect, useState, useRef } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { PullToRefresh } from '@/components/PullToRefresh';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { Play, Pause, Clock, Search, Star, Sparkles } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { DiscoverMore } from '@/components/DiscoverMore';
import { useUser } from '@clerk/clerk-react';
import { GENRES } from './GenrePage';
import { VerifiedBadge } from '@/components/streams/VerifiedBadge';

// Batch-fetch featured artists for a list of song IDs and return a map: songId -> "ft. A, B"
async function fetchFeaturedArtistsMap(songIds: string[]): Promise<Record<string, string>> {
    if (songIds.length === 0) return {};
    const { data } = await supabase
        .from('song_artists')
        .select('song_id, artists(name)')
        .in('song_id', songIds)
        .eq('role', 'featured');
    const map: Record<string, string[]> = {};
    if (data) {
        for (const entry of data as any[]) {
            const name = entry.artists?.name;
            if (name) {
                if (!map[entry.song_id]) map[entry.song_id] = [];
                map[entry.song_id].push(name);
            }
        }
    }
    const result: Record<string, string> = {};
    for (const [songId, names] of Object.entries(map)) {
        result[songId] = ` ft. ${names.join(', ')}`;
    }
    return result;
}

export default function StreamsHome() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { play, currentSong, isPlaying, playAlbum } = useAudioPlayer();
    const { user: clerkUser } = useUser();
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [popularArtists, setPopularArtists] = useState<any[]>([]);
    const [newReleases, setNewReleases] = useState<any[]>([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
    const [platformPlaylists, setPlatformPlaylists] = useState<any[]>([]);
    const [promotedSongs, setPromotedSongs] = useState<(Song & { featured_badge?: string })[]>([]);
    const [personalizedSongs, setPersonalizedSongs] = useState<Song[]>([]);
    const [featuredArtistsMap, setFeaturedArtistsMap] = useState<Record<string, string>>({});
    const [spotlight, setSpotlight] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Trending Songs
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*, artists(name)')
                    .order('plays', { ascending: false })
                    .limit(20);

                if (songsData) {
                    const formattedSongs: Song[] = songsData.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artists?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id,
                        price: song.price ?? null,
                    }));
                    setTrendingSongs(formattedSongs);
                }

                // Popular Artists
                const { data: artistsData } = await supabase
                    .from('artists')
                    .select('*')
                    .eq('is_verified', true)
                    .limit(20);
                setPopularArtists(artistsData || []);

                // New Releases (Albums)
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*, artists(name)')
                    .order('release_date', { ascending: false })
                    .limit(10);
                setNewReleases(albumsData || []);

                // Platform Playlists (Made For You)
                const { data: playlistData } = await supabase
                    .from('playlists')
                    .select('*')
                    .eq('created_by', 'platform')
                    .eq('is_public', true)
                    .limit(6);
                setPlatformPlaylists(playlistData || []);

                // Artist Spotlight
                try {
                    const today = new Date().toISOString().split('T')[0];
                    const { data: spotlightData } = await supabase
                        .from('featured_artists')
                        .select('*, artists(id, name, image_url, bio, genre)')
                        .lte('start_date', today)
                        .gte('end_date', today)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    setSpotlight(spotlightData);
                } catch { /* featured_artists table may not exist yet */ }

                // Promoted Songs (Platform Picks / Editor's Choice)
                try {
                    const { data: promotedData } = await supabase
                        .from('songs')
                        .select('*, artists(name)')
                        .not('featured_badge', 'is', null)
                        .order('plays', { ascending: false })
                        .limit(10);
                    if (promotedData && promotedData.length > 0) {
                        setPromotedSongs(promotedData.map(song => ({
                            id: song.id,
                            title: song.title,
                            artist: song.artists?.name || 'Unknown Artist',
                            file_url: song.file_url,
                            cover_url: song.cover_url || '/placeholder-music.png',
                            duration: song.duration,
                            artist_id: song.artist_id,
                            album_id: song.album_id,
                            featured_badge: song.featured_badge,
                            price: song.price ?? null,
                        })));
                    }
                } catch { /* featured_badge column may not exist yet */ }

                // Recently Played + Personalized recommendations
                if (clerkUser) {
                    try {
                        const { data: historyData } = await supabase
                            .from('play_history')
                            .select('song_id, played_at, songs(*, artists(name))')
                            .eq('user_id', clerkUser.id)
                            .order('played_at', { ascending: false })
                            .limit(50);

                        if (historyData) {
                            // Deduplicate recently played
                            const seen = new Set<string>();
                            const unique: Song[] = [];
                            const artistPlayCount: Record<string, number> = {};

                            for (const entry of historyData) {
                                const song = (entry as any).songs;
                                if (song) {
                                    if (!seen.has(song.id)) {
                                        seen.add(song.id);
                                        unique.push({
                                            id: song.id,
                                            title: song.title,
                                            artist: song.artists?.name || 'Unknown Artist',
                                            file_url: song.file_url,
                                            cover_url: song.cover_url || '/placeholder-music.png',
                                            duration: song.duration,
                                            artist_id: song.artist_id,
                                            album_id: song.album_id,
                                        });
                                    }
                                    if (song.artist_id) {
                                        artistPlayCount[song.artist_id] = (artistPlayCount[song.artist_id] || 0) + 1;
                                    }
                                }
                            }
                            setRecentlyPlayed(unique.slice(0, 10));

                            // Build personalized mix from top 3 artists
                            const topArtistIds = Object.entries(artistPlayCount)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([id]) => id);

                            if (topArtistIds.length > 0) {
                                const { data: personalData } = await supabase
                                    .from('songs')
                                    .select('*, artists(name)')
                                    .in('artist_id', topArtistIds)
                                    .not('id', 'in', `(${unique.slice(0, 10).map(s => `'${s.id}'`).join(',')})`)
                                    .order('plays', { ascending: false })
                                    .limit(12);

                                if (personalData && personalData.length > 0) {
                                    setPersonalizedSongs(personalData.map(song => ({
                                        id: song.id,
                                        title: song.title,
                                        artist: song.artists?.name || 'Unknown Artist',
                                        file_url: song.file_url,
                                        cover_url: song.cover_url || '/placeholder-music.png',
                                        duration: song.duration,
                                        artist_id: song.artist_id,
                                        album_id: song.album_id,
                                    })));
                                }
                            }
                        }
                    } catch {
                        // Silently fail - history not critical
                    }
                }

            } catch (error) {
                console.error('Error fetching streams data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clerkUser?.id, refreshKey]);

    const handleRefresh = async () => {
        setRefreshKey(k => k + 1);
        await new Promise(r => setTimeout(r, 600));
    };

    // Fetch featured artists for all displayed songs
    useEffect(() => {
        const allIds = [
            ...trendingSongs.map(s => s.id),
            ...promotedSongs.map(s => s.id),
            ...personalizedSongs.map(s => s.id),
            ...recentlyPlayed.map(s => s.id),
        ];
        const unique = [...new Set(allIds)];
        if (unique.length === 0) return;
        fetchFeaturedArtistsMap(unique).then(setFeaturedArtistsMap).catch(() => {});
    }, [trendingSongs, promotedSongs, personalizedSongs, recentlyPlayed]);

    const handlePlaySong = (song: Song) => play(song);

    const handlePlayArtist = async (artistId: string) => {
        try {
            const { data: songsData } = await supabase
                .from('songs')
                .select('*, artists(name)')
                .eq('artist_id', artistId)
                .order('plays', { ascending: false })
                .limit(1);
            if (songsData && songsData.length > 0) {
                const song = songsData[0];
                play({
                    id: song.id, title: song.title,
                    artist: song.artists?.name || 'Unknown Artist',
                    file_url: song.file_url, cover_url: song.cover_url || '/placeholder-music.png',
                    duration: song.duration,
                });
            }
        } catch (error) { console.error('Error playing artist top song:', error); }
    };

    const handlePlayPlaylist = async (playlistId: string) => {
        try {
            const { data: playlistSongsData } = await supabase
                .from('playlist_songs')
                .select('song_id, position, songs(*, artists(name))')
                .eq('playlist_id', playlistId)
                .order('position', { ascending: true });
            if (playlistSongsData && playlistSongsData.length > 0) {
                const songs: Song[] = playlistSongsData.map((ps: any) => ({
                    id: ps.songs.id, title: ps.songs.title,
                    artist: ps.songs.artists?.name || 'Unknown Artist',
                    file_url: ps.songs.file_url, cover_url: ps.songs.cover_url || '/placeholder-music.png',
                    duration: ps.songs.duration, artist_id: ps.songs.artist_id, album_id: ps.songs.album_id,
                }));
                playAlbum(songs, 0);
            } else {
                toast({ title: 'Empty playlist', description: 'This playlist has no songs yet.' });
            }
        } catch (error) { console.error('Error playing playlist:', error); }
    };

    const handlePlayAlbum = async (albumId: string) => {
        try {
            const { data: songsData } = await supabase
                .from('songs').select('*, artists(name)')
                .eq('album_id', albumId).order('track_number', { ascending: true });
            if (songsData && songsData.length > 0) {
                playAlbum(songsData.map(song => ({
                    id: song.id, title: song.title,
                    artist: song.artists?.name || 'Unknown Artist',
                    file_url: song.file_url, cover_url: song.cover_url || '/placeholder-music.png',
                    duration: song.duration,
                })), 0);
            }
        } catch (error) { console.error('Error playing album:', error); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/streams/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const getBadgeStyle = (badge: string) => {
        if (badge === 'platform_pick') return 'bg-gray-900 text-white';
        if (badge === 'editors_choice') return 'bg-gray-700 text-white';
        return 'bg-gray-700 text-white';
    };

    const getBadgeLabel = (badge: string) => {
        if (badge === 'platform_pick') return 'Platform Pick';
        if (badge === 'editors_choice') return "Editor's Choice";
        return badge;
    };

    return (
        <StreamsLayout>
            <SEO
                title="Music Streams"
                description="Listen to the latest trending African music, explore popular artists, and discover new releases on Bara Afrika Streams."
                keywords={['African Music', 'Music Streaming', 'Bara Streams', 'Afrobeats', 'Highlife']}
            />
            <PullToRefresh onRefresh={handleRefresh}>
            <div className="min-h-screen pb-32">
                <main className="p-4 sm:p-8 max-w-[1400px] mx-auto">
                    {/* Greeting + Search */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-gray-900">
                            BARA Streams — Music
                        </h1>
                        <form onSubmit={handleSearch} className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search songs, artists, albums..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900 rounded-full text-gray-900 placeholder-gray-500 outline-none transition-all text-sm font-medium"
                            />
                            {searchQuery.trim() && (
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-700 transition"
                                >
                                    Search
                                </button>
                            )}
                        </form>
                    </div>

                    {loading ? (
                        <div className="space-y-8 sm:space-y-12">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <SkeletonCard key={i} type="product" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 sm:space-y-12">
                            {/* Quick Access Tiles */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                <QuickAccessTile title="Liked Songs" gradient="from-gray-700 to-gray-800" icon="💜" to="/streams/liked" />
                                <QuickAccessTile title="Afrobeats Mix" gradient="from-gray-600 to-gray-700" icon="🌍" to="/streams/search?q=Afrobeats" />
                                <QuickAccessTile title="Amapiano Mix" gradient="from-gray-500 to-gray-600" icon="🎹" to="/streams/search?q=Amapiano" />
                            </div>

                            {/* Browse by genre */}
                            <Section title="Browse by genre" showAllLink="/streams/genres">
                                {GENRES.slice(0, 8).map((g, i) => (
                                    <Link
                                        key={g.slug}
                                        to={`/streams/genre/${g.slug}`}
                                        className={`relative aspect-[4/3] min-w-[180px] sm:min-w-[200px] snap-start rounded-xl overflow-hidden bg-gradient-to-br ${['from-gray-900 to-gray-700', 'from-gray-700 to-gray-500', 'from-gray-800 to-gray-600', 'from-gray-600 to-gray-400'][i % 4]} p-5 flex flex-col justify-end group shadow-sm hover:shadow-xl transition-shadow`}
                                    >
                                        <h3 className="text-2xl font-black text-white leading-none tracking-tight" style={{ fontFamily: 'Comfortaa, sans-serif' }}>{g.name}</h3>
                                    </Link>
                                ))}
                            </Section>

                            {/* Artist Spotlight */}
                            {spotlight?.artists && (
                                <Link
                                    to={`/streams/artist/${spotlight.artists.id}`}
                                    className="relative block w-full rounded-xl overflow-hidden group"
                                >
                                    <div className="flex flex-col sm:flex-row items-center bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 sm:p-10 gap-6">
                                        <img
                                            src={spotlight.artists.image_url || '/placeholder-artist.png'}
                                            alt={spotlight.artists.name}
                                            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl flex-shrink-0"
                                        />
                                        <div className="flex-1 text-center sm:text-left">
                                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Artist Spotlight</p>
                                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Comfortaa, sans-serif' }}>
                                                {spotlight.artists.name}
                                            </h2>
                                            {spotlight.headline && (
                                                <p className="text-lg text-gray-300 mt-1">{spotlight.headline}</p>
                                            )}
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                                {spotlight.description || spotlight.artists.bio || ''}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handlePlayArtist(spotlight.artists.id);
                                                }}
                                                className="mt-4 inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-gray-200 transition text-sm"
                                            >
                                                <Play size={16} fill="currentColor" /> Play top tracks
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Platform Picks / Editor's Choice */}
                            {promotedSongs.length > 0 && (
                                <Section title="Platform Picks" subtitle="Curated by our editors">
                                    {promotedSongs.map(song => (
                                        <div key={song.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start shadow-sm">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img
                                                    loading="lazy" src={song.cover_url}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover rounded-md shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }}
                                                />
                                                {song.featured_badge && (
                                                    <div className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full ${getBadgeStyle(song.featured_badge)}`}>
                                                        {getBadgeLabel(song.featured_badge)}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10"
                                                >
                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{song.title}</h3>
                                            <p className="text-xs text-gray-500 truncate mt-auto">
                                                {song.artist}{featuredArtistsMap[song.id] || ''}
                                                {song.price && song.price > 0 && <span className="ml-1.5 text-[10px] font-bold text-gray-700">${song.price.toFixed(2)}</span>}
                                            </p>
                                        </div>
                                    ))}
                                </Section>
                            )}

                            {/* Made For You - Curated Mixes */}
                            <Section title="Made For You">
                                {platformPlaylists.length > 0 ? (
                                    platformPlaylists.map(pl => (
                                        <div key={pl.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start shadow-xl">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img loading="lazy" src={pl.cover_url} alt={pl.title} className="w-full h-full object-cover rounded-md shadow-xl"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }} />
                                                <button onClick={() => handlePlayPlaylist(pl.id)}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                    <Play size={24} fill="white" className="ml-1" />
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{pl.title}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest line-clamp-2">{pl.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    [
                                        { id: '1', title: 'Discover Weekly', desc: 'Personalized for you', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
                                        { id: '2', title: 'Daily Mix 1', desc: 'Afrobeats & Highlife', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
                                        { id: '3', title: 'Daily Mix 2', desc: 'Amapiano Beats', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
                                        { id: '4', title: 'Release Radar', desc: 'New from artists you follow', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' }
                                    ].map(mix => (
                                        <div key={mix.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start shadow-xl">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img loading="lazy" src={mix.cover} alt={mix.title} className="w-full h-full object-cover rounded-md shadow-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                <button
                                                    onClick={() => { if (trendingSongs.length > 0) { playAlbum(trendingSongs, 0); } else { toast({ title: 'No songs yet', description: 'Check back soon for personalized mixes.' }); } }}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                    <Play size={24} fill="white" className="ml-1" />
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{mix.title}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{mix.desc}</p>
                                        </div>
                                    ))
                                )}
                            </Section>

                            {/* Personalized "Your Mix" - only for users with history */}
                            {personalizedSongs.length > 0 && (
                                <Section title="Your Daily Mix" subtitle="Based on what you've been listening to">
                                    {personalizedSongs.map(song => (
                                        <div key={song.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img loading="lazy" src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded-md shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }} />
                                                <div className="absolute top-2 left-2 bg-gray-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Sparkles size={8} /> For You
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{song.title}</h3>
                                            <p className="text-xs text-gray-500 truncate mt-auto">
                                                {song.artist}{featuredArtistsMap[song.id] || ''}
                                                {song.price && song.price > 0 && <span className="ml-1.5 text-[10px] font-bold text-gray-700">${song.price.toFixed(2)}</span>}
                                            </p>
                                        </div>
                                    ))}
                                </Section>
                            )}

                            {/* Recently Played */}
                            <Section title="Recently played">
                                {recentlyPlayed.length > 0 ? (
                                    recentlyPlayed.map(song => (
                                        <div key={song.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img loading="lazy" src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded-md shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }} />
                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Clock size={10} /> Played
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{song.title}</h3>
                                            <p className="text-xs text-gray-500 truncate mt-auto">
                                                {song.artist}{featuredArtistsMap[song.id] || ''}
                                                {song.price && song.price > 0 && <span className="ml-1.5 text-[10px] font-bold text-gray-700">${song.price.toFixed(2)}</span>}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="min-w-[280px] flex flex-col items-center justify-center py-10 px-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                                        <Clock size={32} className="text-gray-300 mb-3" />
                                        <p className="text-gray-500 text-sm font-medium">Your listening history will appear here</p>
                                        <p className="text-gray-400 text-xs mt-1">Start playing a song to get started</p>
                                    </div>
                                )}
                            </Section>

                            {/* Trending Songs */}
                            <Section title="Trending songs" showAllLink="/streams/trending">
                                {trendingSongs.length > 0 ? (
                                    trendingSongs.map(song => (
                                        <div key={song.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img loading="lazy" src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded-md shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }} />
                                                <button onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                    {currentSong?.id === song.id && isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{song.title}</h3>
                                            <p className="text-xs text-gray-500 truncate mt-auto">
                                                {song.artist}{featuredArtistsMap[song.id] || ''}
                                                {song.price && song.price > 0 && <span className="ml-1.5 text-[10px] font-bold text-gray-700">${song.price.toFixed(2)}</span>}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="min-w-full py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                                        <p className="text-gray-500">No trending songs found. Use Admin panel to seed.</p>
                                    </div>
                                )}
                            </Section>

                            {/* Popular Artists */}
                            <Section title="Popular artists" showAllLink="/streams/artists">
                                {popularArtists.length > 0 ? (
                                    popularArtists.map(artist => (
                                        <Link key={artist.id} to={`/streams/artist/${artist.id}`} className="group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
                                            <div className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 w-full text-center">
                                                <div className="relative mb-4 aspect-square shadow-2xl">
                                                    <img loading="lazy" src={artist.image_url} alt={artist.name} className="w-full h-full object-cover rounded-full shadow-lg"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'; }} />
                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlayArtist(artist.id); }}
                                                        className="absolute bottom-6 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                        <Play size={24} fill="white" className="ml-1" />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold truncate text-gray-900 mb-1 text-sm flex items-center justify-center gap-1">{artist.name}{artist.is_verified && <VerifiedBadge size={13} />}</h3>
                                                <p className="text-xs text-gray-500">Artist</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 min-w-full py-12 text-center">No artists found.</p>
                                )}
                            </Section>

                            {/* Popular Albums and Singles */}
                            <Section title="Popular albums and singles" showAllLink="/streams/new-releases">
                                {newReleases.length > 0 ? (
                                    newReleases.map(album => (
                                        <Link to={`/streams/album/${album.id}`} key={album.id} className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
                                            <div className="relative mb-4 aspect-square shadow-2xl">
                                                <img loading="lazy" src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded-md shadow-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'; }} />
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlayAlbum(album.id); }}
                                                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                                    <Play size={24} fill="white" className="ml-1" />
                                                </button>
                                            </div>
                                            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm">{album.title}</h3>
                                            <p className="text-xs text-gray-500 truncate mt-auto">{album.artists?.name}</p>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 min-w-full py-12 text-center">No albums found.</p>
                                )}
                            </Section>

                            {/* Popular Radio */}
                            <Section title="Popular radio" showAllLink="/streams/search?q=radio">
                                {[
                                    { id: 'r1', title: 'Mike Kayihura', images: ['https://images.unsplash.com/photo-1520127873598-d22ecf253289?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop'], color: 'bg-gray-800', footer: 'With Andy Bumuntu, Yvan Buravan, Igor...' },
                                    { id: 'r2', title: 'Kivumbi King', images: ['https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=200&h=200&fit=crop'], color: 'bg-gray-700', footer: 'With Amalon, Nel Ngabo, Ish Kevin and more' },
                                    { id: 'r3', title: 'The Ben', images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1520127873598-d22ecf253289?w=200&h=200&fit=crop'], color: 'bg-gray-900', footer: 'With Meddy, Bruce Melodie, Christopher...' },
                                    { id: 'r4', title: 'Bruce Melodie', images: ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=200&h=200&fit=crop'], color: 'bg-gray-600', footer: 'With Davis D, Chriss Eazy, Juno Kizigenza and more' },
                                    { id: 'r5', title: 'Rema', images: ['https://plus.unsplash.com/premium_photo-1661601614051-9e7978280628?w=300&h=300&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1520127873598-d22ecf253289?w=200&h=200&fit=crop'], color: 'bg-gray-700', footer: 'With Shallipopi, ODUMODUBLVCK, Kizz...' }
                                ].map(radio => (
                                    <RadioCard key={radio.id} {...radio} />
                                ))}
                            </Section>

                            {/* Featured Charts */}
                            <Section title="Featured Charts" showAllLink="/streams/trending">
                                {[
                                    { id: 'c1', title: 'Top Songs Africa', type: 'Weekly Music Charts', gradient: 'from-gray-900 to-gray-700', footer: 'Your weekly update of the most played tracks...' },
                                    { id: 'c2', title: 'Top Songs Nigeria', type: 'Weekly Music Charts', gradient: 'from-gray-800 to-gray-600', footer: 'Your weekly update of the most played tracks...' },
                                    { id: 'c3', title: 'Top 50 Africa', type: 'Daily Update', gradient: 'from-gray-700 to-gray-500', footer: 'Your daily update of the most played tracks right...' },
                                    { id: 'c4', title: 'Top 50 South Africa', type: 'Daily Update', gradient: 'from-gray-800 to-gray-600', footer: 'Your daily update of the most played tracks right...' },
                                    { id: 'c5', title: 'Viral 50 Africa', type: 'Daily Update', gradient: 'from-gray-600 to-gray-400', footer: 'Your daily update of the most viral tracks right...' }
                                ].map(chart => (
                                    <ChartCard key={chart.id} {...chart} />
                                ))}
                            </Section>
                        </div>
                    )}
                </main>
            </div>
            </PullToRefresh>
            <DiscoverMore exclude={['Streams']} maxItems={3} />
        </StreamsLayout>
    );
}

function QuickAccessTile({ title, gradient, icon, to }: { title: string; gradient: string; icon: string; to: string }) {
    return (
        <Link to={to} className="bg-gray-100 rounded-md flex items-center gap-4 cursor-pointer hover:bg-gray-200 transition-all duration-300 group overflow-hidden relative">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <span className="text-xl sm:text-2xl">{icon}</span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate pr-12">{title}</h3>
            <button className="absolute right-2 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95" aria-label="Play"><Play size={20} fill="white" className="ml-1" /></button>
        </Link>
    );
}

function RadioCard({ title, images, color, footer }: { title: string; images: string[]; color: string; footer: string }) {
    return (
        <div className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
            <div className={`relative mb-4 aspect-square shadow-2xl rounded-md overflow-hidden ${color}`}>
                <div className="absolute top-2 right-2 text-[10px] font-black tracking-tighter text-white opacity-80 uppercase">Radio</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img loading="lazy" src={images[1]} className="absolute w-[40%] aspect-square rounded-full border-2 border-black/20 left-[10%] z-0 scale-90 translate-y-2 opacity-80" alt="" />
                    <img loading="lazy" src={images[2]} className="absolute w-[40%] aspect-square rounded-full border-2 border-black/20 right-[10%] z-0 scale-90 translate-y-2 opacity-80" alt="" />
                    <img loading="lazy" src={images[0]} className="w-[60%] aspect-square rounded-full border-4 border-black/20 z-10 shadow-2xl" alt="" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white leading-tight tracking-tighter truncate">{title}</h3>
                </div>
                <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-20" aria-label="Play"><Play size={24} fill="white" className="ml-1" /></button>
            </div>
            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{title} Radio</h3>
            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{footer}</p>
        </div>
    );
}

function ChartCard({ title, type, gradient, footer }: { title: string; type: string; gradient: string; footer: string }) {
    return (
        <div className="bg-white border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group flex flex-col min-w-[180px] sm:min-w-[200px] snap-start">
            <div className={`relative mb-4 aspect-square shadow-2xl rounded-md overflow-hidden bg-gradient-to-br ${gradient}`}>
                <div className="absolute top-4 left-4">
                    <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full rotate-45" />
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h4 className="text-3xl font-black text-white leading-none tracking-tighter mb-2 overflow-hidden break-words">{title.split(' ').join('\n')}</h4>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                    <div className="h-4 w-[2px] bg-white/40" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">{type}</span>
                </div>
                <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-20" aria-label="Play"><Play size={24} fill="white" className="ml-1" /></button>
            </div>
            <h3 className="font-bold truncate text-gray-900 mb-1 text-sm tracking-tight">{title}</h3>
            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{footer}</p>
        </div>
    );
}

function Section({ title, subtitle, children, showAllLink }: { title: string; subtitle?: string; children: React.ReactNode; showAllLink?: string }) {
    return (
        <div className="mb-12">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight hover:underline cursor-pointer">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {showAllLink && (
                    <Link to={showAllLink} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors hover:underline mt-1">
                        Show all
                    </Link>
                )}
            </div>
            <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 snap-x -mx-2 px-2">
                {children}
            </div>
        </div>
    );
}
