import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { SEO } from '@/components/SEO';
import { Loader2, Play, Pause, BadgeCheck, Share2, Radio } from 'lucide-react';
import { useShare } from '@/context/ShareContext';
import { FollowUserButton } from '@/components/FollowUserButton';
import { VerifiedBadge } from '@/components/streams/VerifiedBadge';

export default function ArtistPage() {
    const { id } = useParams();
    const { play, currentSong, isPlaying, togglePlay, startRadio } = useAudioPlayer();
    const { openShare } = useShare();
    const [artist, setArtist] = useState<any>(null);
    const [topTracks, setTopTracks] = useState<Song[]>([]);
    const [featuredOnTracks, setFeaturedOnTracks] = useState<(Song & { primary_artist: string; plays: number })[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
    const [artistPicks, setArtistPicks] = useState<(Song & { note?: string })[]>([]);
    const [relatedArtists, setRelatedArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Artist Details
                const { data: artistData } = await supabase
                    .from('artists')
                    .select('*')
                    .eq('id', id)
                    .single();
                setArtist(artistData);

                // Fetch Top Tracks (by plays)
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*, albums(title, cover_url)')
                    .eq('artist_id', id)
                    .order('plays', { ascending: false })
                    .limit(5);

                if (songsData) {
                    const formattedSongs = songsData.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: artistData?.name || 'Unknown Artist',
                        file_url: song.file_url,
                        cover_url: song.cover_url || song.albums?.cover_url || '/placeholder-music.png',
                        duration: song.duration,
                        artist_id: song.artist_id,
                        album_id: song.album_id,
                        album_title: song.albums?.title,
                        plays: song.plays || 0,
                    }));
                    setTopTracks(formattedSongs);
                }

                // Fetch songs this artist is featured on
                try {
                    const { data: featuredData } = await supabase
                        .from('song_artists')
                        .select('song_id, songs(id, title, file_url, cover_url, duration, plays, artist_id, album_id, artists(name))')
                        .eq('artist_id', id)
                        .eq('role', 'featured')
                        .order('display_order');
                    if (featuredData) {
                        const formatted = featuredData
                            .filter((f: any) => f.songs)
                            .map((f: any) => ({
                                id: f.songs.id,
                                title: f.songs.title,
                                artist: f.songs.artists?.name || 'Unknown Artist',
                                file_url: f.songs.file_url,
                                cover_url: f.songs.cover_url || '/placeholder-music.png',
                                duration: f.songs.duration,
                                artist_id: f.songs.artist_id,
                                album_id: f.songs.album_id,
                                primary_artist: f.songs.artists?.name || 'Unknown Artist',
                                plays: f.songs.plays || 0,
                            }));
                        setFeaturedOnTracks(formatted);
                    }
                } catch { /* song_artists table may not exist yet */ }

                // Fetch Artist Picks
                try {
                    const { data: picksData } = await supabase
                        .from('artist_picks')
                        .select('display_order, note, songs(id, title, file_url, cover_url, duration, artist_id, album_id, albums(title))')
                        .eq('artist_id', id)
                        .order('display_order')
                        .limit(5);
                    if (picksData) {
                        setArtistPicks(picksData.filter((p: any) => p.songs).map((p: any) => ({
                            id: p.songs.id,
                            title: p.songs.title,
                            artist: artistData?.name || 'Unknown Artist',
                            file_url: p.songs.file_url,
                            cover_url: p.songs.cover_url || '/placeholder-music.png',
                            duration: p.songs.duration,
                            artist_id: p.songs.artist_id,
                            album_id: p.songs.album_id,
                            album_title: p.songs.albums?.title,
                            note: p.note,
                        })));
                    }
                } catch { /* artist_picks table may not exist yet */ }

                // Fetch Albums
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*')
                    .eq('artist_id', id)
                    .order('release_date', { ascending: false });
                setAlbums(albumsData || []);

                // Fetch related artists ("Fans also like")
                try {
                    const collected = new Map<string, any>();
                    // Tier 1: same genre + same country
                    if (artistData?.genre && artistData?.country) {
                        const { data } = await supabase
                            .from('artists')
                            .select('id, name, image_url, genre, country, is_verified, monthly_listeners')
                            .eq('genre', artistData.genre)
                            .eq('country', artistData.country)
                            .neq('id', id)
                            .order('monthly_listeners', { ascending: false, nullsFirst: false })
                            .limit(6);
                        (data || []).forEach((a: any) => collected.set(a.id, a));
                    }
                    // Tier 2: same genre
                    if (collected.size < 6 && artistData?.genre) {
                        const { data } = await supabase
                            .from('artists')
                            .select('id, name, image_url, genre, country, is_verified, monthly_listeners')
                            .eq('genre', artistData.genre)
                            .neq('id', id)
                            .order('monthly_listeners', { ascending: false, nullsFirst: false })
                            .limit(6);
                        (data || []).forEach((a: any) => { if (!collected.has(a.id)) collected.set(a.id, a); });
                    }
                    // Tier 3: same country
                    if (collected.size < 6 && artistData?.country) {
                        const { data } = await supabase
                            .from('artists')
                            .select('id, name, image_url, genre, country, is_verified, monthly_listeners')
                            .eq('country', artistData.country)
                            .neq('id', id)
                            .order('monthly_listeners', { ascending: false, nullsFirst: false })
                            .limit(6);
                        (data || []).forEach((a: any) => { if (!collected.has(a.id)) collected.set(a.id, a); });
                    }
                    setRelatedArtists(Array.from(collected.values()).slice(0, 6));
                } catch (err) {
                    console.error('Error fetching related artists:', err);
                }

            } catch (error) {
                console.error('Error fetching artist data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePlaySong = (song: Song) => {
        play(song);
    };

    if (loading) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
                </div>
            </StreamsLayout>
        );
    }

    if (!artist) {
        return (
            <StreamsLayout>
                <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
                    <p>Artist not found.</p>
                </div>
            </StreamsLayout>
        );
    }

    const artistSchema = {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        "name": artist.name,
        "image": artist.banner_url || artist.image_url,
        "description": artist.bio || `Listen to ${artist.name} on Bara Afrika Streams.`,
        "track": topTracks.map(track => ({
            "@type": "MusicRecording",
            "name": track.title,
            "url": `${window.location.origin}/streams/artist/${id}`
        })),
        "album": albums.map(album => ({
            "@type": "MusicAlbum",
            "name": album.title,
            "image": album.cover_url
        }))
    };

    return (
        <StreamsLayout>
            <SEO
                title={artist.name}
                description={`Explore ${artist.name}'s music, top tracks, and albums on Bara Afrika. Discover the best of African sounds.`}
                image={artist.banner_url}
                type="music.song" // Or just keep as website/article if music.group isn't standard OG type
                keywords={[artist.name, 'African Music', 'Bara Streams', 'African Artist']}
                schemaData={artistSchema}
            />
            <div className="min-h-screen bg-white text-gray-900 pb-24">
                {/* Hero Header */}
                <div className="bg-gradient-to-b from-gray-600 to-gray-100 pt-20 pb-6 px-8 relative">
                    {artist.banner_url && (
                        <div className="absolute inset-0 z-0">
                            <img loading="lazy" src={artist.banner_url} alt="Banner" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-gray-100"></div>
                        </div>
                    )}
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex items-end gap-6 pb-6">
                            {/* Artist Info */}
                            <div className="flex-1">
                                {artist.is_verified && (
                                <div className="flex items-center gap-2 mb-3">
                                    <VerifiedBadge size={22} />
                                    <span className="text-sm font-bold">Verified Artist</span>
                                </div>
                                )}
                                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-none tracking-tighter text-gray-900">{artist.name}</h1>
                                <p className="text-sm font-bold text-gray-600">
                                    {(() => {
                                        const ownPlays = topTracks.reduce((acc, t) => acc + ((t as any).plays || 0), 0);
                                        const featPlays = featuredOnTracks.reduce((acc, t) => acc + (t.plays || 0), 0);
                                        const totalPlays = ownPlays + featPlays;
                                        // Estimate monthly listeners as ~30% of total plays (reasonable approximation)
                                        const listeners = Math.max(totalPlays * 0.3, artist.monthly_listeners || 0);
                                        return listeners > 0 ? `${Math.round(listeners).toLocaleString()} monthly listeners` : 'New Artist';
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-gray-50 px-8 pt-6 pb-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-8">
                        {/* Play Button */}
                        {topTracks.length > 0 && (
                            <button
                                onClick={() => handlePlaySong(topTracks[0])}
                                className="w-14 h-14 rounded-full bg-gray-900 hover:scale-105 transition flex items-center justify-center shadow-xl active:scale-95"
                            >
                                <Play fill="white" className="w-6 h-6 ml-1 text-white" />
                            </button>
                        )}

                        {/* Radio — infinite autoplay seeded from this artist */}
                        {topTracks.length > 0 && (
                            <button
                                onClick={() => startRadio(topTracks[0])}
                                className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-full hover:border-gray-900 hover:text-gray-900 transition"
                                title="Start a radio based on this artist"
                            >
                                <Radio size={18} /> Radio
                            </button>
                        )}

                        {/* Follow Button — persists via user_follows */}
                        {artist.user_id ? (
                            <FollowUserButton targetUserId={artist.user_id} variant="pill" />
                        ) : null}

                        {/* Share Button */}
                        <button
                            onClick={() => openShare({
                                url: `${window.location.origin}/streams/artist/${id}`,
                                title: `${artist.name} — Bara Afrika Streams`,
                                description: artist.bio || `Listen to ${artist.name} on Bara Afrika Streams.`,
                                imageUrl: artist.banner_url || artist.image_url,
                            })}
                            className="p-2 rounded-full hover:bg-gray-200 transition text-gray-600 hover:text-gray-900"
                            title="Share artist"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="px-8 pt-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Popular Tracks */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-comfortaa font-semibold mb-6">Popular</h2>
                            <div className="space-y-2">
                                {topTracks.map((track, index) => (
                                    <div
                                        key={track.id}
                                        className="grid grid-cols-[16px_4fr_2fr_minmax(80px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-gray-100 cursor-pointer items-center"
                                        onClick={() => handlePlaySong(track)}
                                    >
                                        {/* Track Number / Play Button */}
                                        <div className="text-gray-500 flex justify-center w-8">
                                            {currentSong?.id === track.id && isPlaying ? (
                                                <div className="flex items-end gap-[2px] h-3">
                                                    <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '60%' }}></div>
                                                    <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                                                    <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }}></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className={`group-hover:hidden ${currentSong?.id === track.id ? 'text-gray-900' : ''}`}>{index + 1}</span>
                                                    <Play fill="white" className="w-4 h-4 hidden group-hover:block" />
                                                </>
                                            )}
                                        </div>

                                        {/* Track Info */}
                                        <div className="flex gap-3 items-center min-w-0">
                                            <img loading="lazy" src={track.cover_url} alt={track.title} className="w-10 h-10 object-cover rounded" />
                                            <div className="min-w-0 flex-1">
                                                <div className={`font-bold truncate transition text-sm ${currentSong?.id === track.id ? 'text-gray-900' : 'text-gray-900'}`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span>{((track as any).plays || 0).toLocaleString()} plays</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Album */}
                                        <div className="text-sm text-gray-500 truncate hidden md:block">
                                            {track.album_title || 'Single'}
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center justify-end gap-4">
                                            <span className="text-sm text-gray-500 min-w-[40px] text-right">
                                                {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '-:-'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Artist's Picks */}
                        {(artistPicks.length > 0 || topTracks.length > 0) && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-comfortaa font-semibold mb-6">Artist's Pick{artistPicks.length > 1 ? 's' : ''}</h2>
                                <div className="flex flex-wrap gap-4">
                                    {(artistPicks.length > 0 ? artistPicks : [topTracks[0]]).map((track) => (
                                        <div key={track.id} className="flex items-start gap-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-5 max-w-sm w-full sm:w-auto">
                                            <img
                                                loading="lazy" src={track.cover_url}
                                                alt={track.title}
                                                className="w-20 h-20 rounded-lg object-cover shadow-md flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                                    {(track as any).note || 'Posted by the artist'}
                                                </p>
                                                <h3 className="font-bold text-gray-900 truncate">{track.title}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5">{track.album_title || 'Single'}</p>
                                                <button
                                                    onClick={() => handlePlaySong(track)}
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
                                                >
                                                    <Play fill="currentColor" className="w-4 h-4" />
                                                    Play now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Discography */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-comfortaa font-semibold">Discography</h2>
                            </div>
                            <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4">
                                {albums.map((album) => (
                                    <div key={album.id} className="bg-white border border-gray-100 p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer group min-w-[180px] flex flex-col">
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                loading="lazy" src={album.cover_url || '/placeholder-music.png'}
                                                alt={album.title}
                                                className="w-full h-full object-cover rounded shadow-lg"
                                            />
                                            <button className="absolute right-2 bottom-2 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 active:scale-95" aria-label="Play"><Play fill="white" className="w-5 h-5 ml-1 text-white" /></button>
                                        </div>
                                        <h3 className="font-bold text-sm mb-1 truncate">{album.title}</h3>
                                        <p className="text-xs text-gray-500">{new Date(album.release_date).getFullYear()} • Album</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Featured On */}
                        {featuredOnTracks.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-comfortaa font-semibold mb-6">Featured On</h2>
                                <div className="space-y-2">
                                    {featuredOnTracks.map((track, index) => (
                                        <div
                                            key={track.id}
                                            className="grid grid-cols-[16px_4fr_2fr_minmax(80px,1fr)] gap-4 px-4 py-2 rounded group hover:bg-gray-100 cursor-pointer items-center"
                                            onClick={() => handlePlaySong(track)}
                                        >
                                            <div className="text-gray-500 flex justify-center w-8">
                                                {currentSong?.id === track.id && isPlaying ? (
                                                    <div className="flex items-end gap-[2px] h-3">
                                                        <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '60%' }}></div>
                                                        <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                                                        <div className="w-[3px] bg-gray-900 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }}></div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className={`group-hover:hidden ${currentSong?.id === track.id ? 'text-gray-900' : ''}`}>{index + 1}</span>
                                                        <Play fill="white" className="w-4 h-4 hidden group-hover:block" />
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex gap-3 items-center min-w-0">
                                                <img loading="lazy" src={track.cover_url} alt={track.title} className="w-10 h-10 object-cover rounded" />
                                                <div className="min-w-0 flex-1">
                                                    <div className={`font-bold truncate transition text-sm ${currentSong?.id === track.id ? 'text-gray-900' : 'text-gray-900'}`}>
                                                        {track.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {track.primary_artist} ft. {artist.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate hidden md:block">
                                                {track.plays.toLocaleString()} plays
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <span className="text-sm text-gray-500 min-w-[40px] text-right">
                                                    {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '-:-'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Fans Also Like */}
                        {relatedArtists.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-comfortaa font-semibold mb-6">Fans Also Like</h2>
                                <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4">
                                    {relatedArtists.map((a) => (
                                        <Link
                                            key={a.id}
                                            to={`/streams/artist/${a.id}`}
                                            className="bg-white border border-gray-100 p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer min-w-[160px] flex flex-col items-center text-center"
                                        >
                                            <img
                                                loading="lazy" src={a.image_url || '/placeholder-music.png'}
                                                alt={a.name}
                                                className="w-28 h-28 rounded-full object-cover shadow-md mb-3"
                                            />
                                            <div className="flex items-center gap-1 justify-center">
                                                <h3 className="font-bold text-sm truncate">{a.name}</h3>
                                                {a.is_verified && <VerifiedBadge size={16} />}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{a.genre || 'Artist'}</p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </StreamsLayout>
    );
}
