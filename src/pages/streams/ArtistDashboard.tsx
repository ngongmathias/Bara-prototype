import { useState, useEffect } from "react";
import { StreamsLayout } from "@/components/streams/StreamsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Music, Disc, TrendingUp, Users, Plus, Upload, BarChart3, Play, Pause,
    Zap, Share2, Star, MoreHorizontal, Eye, Clock, Calendar, Edit2, Trash2, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { GamificationService } from "@/lib/gamificationService";
import { MonetizationService } from "@/lib/monetizationService";
import { getMonthlyListeners } from "@/lib/artistStats";
import { EditSongModal } from "@/components/streams/EditSongModal";
import { EditAlbumModal } from "@/components/streams/EditAlbumModal";
import { EditArtistProfileModal } from "@/components/streams/EditArtistProfileModal";
import { VerifyNudge } from "@/components/VerifyNudge";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import { supabase, createAuthenticatedSupabaseClient } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MySong {
    id: string;
    title: string;
    file_url: string;
    cover_url: string | null;
    genre: string | null;
    plays: number;
    duration: number;
    created_at: string;
    album_id: string | null;
    albums?: { title: string } | null;
}

interface MyAlbum {
    id: string;
    title: string;
    cover_url: string | null;
    release_date: string | null;
    created_at: string;
    songs: { id: string }[];
}

type TabType = 'overview' | 'songs' | 'albums' | 'analytics';

export default function ArtistDashboard() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { toast } = useToast();
    const { play, currentSong, isPlaying, togglePlay } = useAudioPlayer();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [artistId, setArtistId] = useState<string | null>(null);
    const [artistName, setArtistName] = useState('');
    const [songs, setSongs] = useState<MySong[]>([]);
    const [albums, setAlbums] = useState<MyAlbum[]>([]);
    const [featuredOnSongs, setFeaturedOnSongs] = useState<(MySong & { primary_artist: string })[]>([]);
    const [picks, setPicks] = useState<{ id: string; song_id: string; display_order: number; note: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBoosting, setIsBoosting] = useState(false);
    const [dailyStreams, setDailyStreams] = useState<Array<{ date: string; count: number }>>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [monthlyListeners, setMonthlyListeners] = useState(0);
    const [editingSong, setEditingSong] = useState<MySong | null>(null);
    const [editingAlbum, setEditingAlbum] = useState<MyAlbum | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);

    const ownPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const featuredPlays = featuredOnSongs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const stats = {
        tracks: songs.length,
        albums: albums.length,
        totalPlays: ownPlays,
        featuredPlays,
        monthlyListeners,
    };

    useEffect(() => {
        if (user?.id) fetchMyData();
    }, [user?.id]);

    const fetchMyData = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            // Find artist profile for this user
            const { data: artist } = await supabase
                .from('artists')
                .select('id, name')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!artist) {
                setLoading(false);
                return;
            }

            setArtistId(artist.id);
            setArtistName(artist.name);

            // Fetch songs and albums for this artist
            const [songsRes, albumsRes] = await Promise.all([
                supabase
                    .from('songs')
                    .select('id, title, file_url, cover_url, genre, plays, duration, created_at, album_id, albums(title)')
                    .eq('artist_id', artist.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('albums')
                    .select('id, title, cover_url, release_date, created_at, songs(id)')
                    .eq('artist_id', artist.id)
                    .order('created_at', { ascending: false })
            ]);

            setSongs(songsRes.data || []);
            setAlbums(albumsRes.data || []);

            // Fetch streams-over-time (last 30 days) from play_history for this artist's songs
            const songIds = (songsRes.data || []).map((s: any) => s.id);
            if (songIds.length > 0) {
                try {
                    const since = new Date();
                    since.setDate(since.getDate() - 30);
                    const { data: plays } = await supabase
                        .from('play_history')
                        .select('played_at')
                        .in('song_id', songIds)
                        .gte('played_at', since.toISOString());

                    const byDay = new Map<string, number>();
                    (plays || []).forEach((row: any) => {
                        const d = new Date(row.played_at);
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        byDay.set(key, (byDay.get(key) || 0) + 1);
                    });
                    const buckets: Array<{ date: string; count: number }> = [];
                    for (let i = 29; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        buckets.push({ date: key, count: byDay.get(key) || 0 });
                    }
                    setDailyStreams(buckets);
                } catch (err) {
                    console.warn('Could not fetch daily streams', err);
                }
            }

            // Real monthly listeners = distinct users who played this artist's
            // songs in the last 30 days (no fabricated numbers).
            setMonthlyListeners(await getMonthlyListeners(songIds));

            // Follower count (best-effort)
            try {
                const { count } = await supabase
                    .from('artist_followers')
                    .select('*', { count: 'exact', head: true })
                    .eq('artist_id', artist.id);
                setFollowerCount(count || 0);
            } catch { /* table may not exist */ }

            // Fetch songs this artist is featured on
            try {
                const { data: featuredData } = await supabase
                    .from('song_artists')
                    .select('song_id, songs(id, title, file_url, cover_url, genre, plays, duration, created_at, album_id, artist_id, artists(name), albums(title))')
                    .eq('artist_id', artist.id)
                    .eq('role', 'featured');
                if (featuredData) {
                    setFeaturedOnSongs(
                        featuredData
                            .filter((f: any) => f.songs)
                            .map((f: any) => ({
                                id: f.songs.id,
                                title: f.songs.title,
                                file_url: f.songs.file_url,
                                cover_url: f.songs.cover_url,
                                genre: f.songs.genre,
                                plays: f.songs.plays || 0,
                                duration: f.songs.duration,
                                created_at: f.songs.created_at,
                                album_id: f.songs.album_id,
                                albums: f.songs.albums,
                                primary_artist: f.songs.artists?.name || 'Unknown Artist',
                            }))
                    );
                }
            } catch { /* song_artists table may not exist */ }

            // Fetch artist picks
            try {
                const { data: picksData } = await supabase
                    .from('artist_picks')
                    .select('id, song_id, display_order, note')
                    .eq('artist_id', artist.id)
                    .order('display_order');
                setPicks(picksData || []);
            } catch { /* artist_picks table may not exist */ }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePick = async (songId: string) => {
        if (!artistId) return;
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) return;
            const client = await createAuthenticatedSupabaseClient(token);
            const existing = picks.find(p => p.song_id === songId);
            if (existing) {
                await client.from('artist_picks').delete().eq('id', existing.id);
                setPicks(prev => prev.filter(p => p.id !== existing.id));
                toast({ title: 'Pick removed' });
            } else {
                if (picks.length >= 5) {
                    toast({ title: 'Max 5 picks', description: 'Remove one before adding another.' });
                    return;
                }
                const nextOrder = picks.length > 0 ? Math.max(...picks.map(p => p.display_order)) + 1 : 0;
                const { data, error } = await client
                    .from('artist_picks')
                    .insert({ artist_id: artistId, song_id: songId, display_order: nextOrder })
                    .select('id, song_id, display_order, note')
                    .single();
                if (error) throw error;
                if (data) setPicks(prev => [...prev, data]);
                toast({ title: 'Added to your picks' });
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message });
        }
    };

    const formatDuration = (sec: number) => {
        if (!sec || isNaN(sec)) return '--:--';
        return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
    };

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleDeleteSong = async (songId: string) => {
        if (!confirm('Delete this song? This cannot be undone.')) return;
        const { error } = await supabase.from('songs').delete().eq('id', songId);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Deleted', description: 'Song removed.' });
            setSongs(prev => prev.filter(s => s.id !== songId));
        }
    };

    const handlePlaySong = (song: MySong) => {
        play({
            id: song.id,
            title: song.title,
            artist: artistName,
            cover_url: song.cover_url || '/placeholder-music.png',
            file_url: song.file_url,
            duration: song.duration || 0
        });
    };

    const tabs: { key: TabType; label: string; icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'songs', label: 'My Songs', icon: Music },
        { key: 'albums', label: 'My Albums', icon: Disc },
        { key: 'analytics', label: 'Analytics', icon: TrendingUp },
    ];

    // No artist profile yet
    if (!loading && !artistId) {
        return (
            <StreamsLayout>
                <div className="p-8 pb-32 flex flex-col items-center justify-center min-h-[60vh]">
                    <Music size={64} className="text-gray-300 mb-6" />
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome to Creator Portal</h1>
                    <p className="text-gray-500 mb-8 text-center max-w-md">
                        Upload your first song to create your artist profile. Your music catalog and stats will appear here.
                    </p>
                    <Link to="/streams/creator/upload">
                        <Button className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 text-lg">
                            <Upload className="mr-2" size={20} />
                            Upload Your First Song
                        </Button>
                    </Link>
                </div>
            </StreamsLayout>
        );
    }

    return (
        <StreamsLayout>
            <div className="p-6 md:p-8 pb-32">
                {/* Verification nudge (27.8.2) — unverified artists with uploads */}
                <div className="mb-6">
                    <VerifyNudge accountType="artist" context="Your music is live on BARA Streams." />
                </div>

                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1">Creator Portal</h1>
                        <p className="text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{artistName || user?.fullName}</span></p>
                    </div>
                    {artistId && (
                        <Button variant="outline" onClick={() => setEditingProfile(true)} className="flex-shrink-0">
                            <Edit2 size={16} className="mr-2" /> Edit Profile
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === tab.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-gray-400" size={40} />
                    </div>
                ) : (
                    <>
                        {/* === OVERVIEW TAB === */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    {[
                                        { label: 'Total Streams', value: stats.totalPlays.toLocaleString(), icon: Play, color: 'bg-gray-100 text-gray-700' },
                                        { label: 'Featured Streams', value: stats.featuredPlays.toLocaleString(), icon: Star, color: 'bg-gray-100 text-gray-700' },
                                        { label: 'Tracks', value: stats.tracks, icon: Music, color: 'bg-gray-100 text-gray-700' },
                                        { label: 'Monthly Listeners', value: stats.monthlyListeners.toLocaleString(), icon: Users, color: 'bg-gray-100 text-gray-700' }
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                        >
                                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                                                <CardContent className="pt-5 pb-4">
                                                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                                                        <stat.icon size={20} />
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">{stat.label}</div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link to="/streams/creator/upload">
                                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform shadow-lg">
                                            <Upload className="text-white mb-3" size={28} />
                                            <h3 className="font-bold text-lg text-white">Upload Music</h3>
                                            <p className="text-white/80 text-sm">Release a new single or track</p>
                                        </div>
                                    </Link>
                                    <Link to="/streams/creator/albums">
                                        <div className="bg-gray-900 p-6 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors shadow-lg">
                                            <Plus className="text-gray-900 mb-3" size={28} />
                                            <h3 className="font-bold text-lg text-white">Create Album</h3>
                                            <p className="text-gray-400 text-sm">Organize tracks into an EP or Album</p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Featured On */}
                                {featuredOnSongs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Featured On</h2>
                                        <div className="space-y-2">
                                            {featuredOnSongs.slice(0, 5).map((song, i) => (
                                                <motion.div
                                                    key={song.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                                >
                                                    <button
                                                        onClick={() => handlePlaySong(song)}
                                                        className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-colors"
                                                    >
                                                        {currentSong?.id === song.id && isPlaying ? (
                                                            <Pause size={16} fill="currentColor" />
                                                        ) : (
                                                            <Play size={16} fill="currentColor" className="ml-0.5" />
                                                        )}
                                                    </button>
                                                    <img
                                                        loading="lazy" src={song.cover_url || '/placeholder-music.png'}
                                                        alt={song.title}
                                                        className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate">{song.title}</div>
                                                        <div className="text-xs text-gray-500">
                                                            by {song.primary_artist} &middot; {(song.plays || 0).toLocaleString()} plays
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:block">
                                                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Recent Songs */}
                                {songs.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Releases</h2>
                                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('songs')} className="text-gray-500">
                                                View All ({songs.length})
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {songs.slice(0, 5).map((song, i) => (
                                                <motion.div
                                                    key={song.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                                >
                                                    <button
                                                        onClick={() => handlePlaySong(song)}
                                                        className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-colors"
                                                    >
                                                        {currentSong?.id === song.id && isPlaying ? (
                                                            <Pause size={16} fill="currentColor" />
                                                        ) : (
                                                            <Play size={16} fill="currentColor" className="ml-0.5" />
                                                        )}
                                                    </button>
                                                    <img
                                                        loading="lazy" src={song.cover_url || '/placeholder-music.png'}
                                                        alt={song.title}
                                                        className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate">{song.title}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {song.albums?.title || 'Single'} &middot; {formatDate(song.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><Play size={12} />{(song.plays || 0).toLocaleString()}</span>
                                                        <span className="font-mono">{formatDuration(song.duration)}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* === SONGS TAB === */}
                        {activeTab === 'songs' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">{songs.length} Tracks</h2>
                                    <Link to="/streams/creator/upload">
                                        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                                            <Upload size={16} className="mr-2" /> Upload New
                                        </Button>
                                    </Link>
                                </div>

                                {songs.length === 0 ? (
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="py-12 text-center">
                                            <Music size={48} className="text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No tracks yet. Upload your first song!</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="w-12">#</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead className="hidden md:table-cell">Album</TableHead>
                                                    <TableHead className="hidden md:table-cell">Genre</TableHead>
                                                    <TableHead className="text-center"><Play size={14} /></TableHead>
                                                    <TableHead className="hidden sm:table-cell"><Clock size={14} /></TableHead>
                                                    <TableHead className="hidden lg:table-cell"><Calendar size={14} /></TableHead>
                                                    <TableHead className="w-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {songs.map((song, i) => (
                                                    <TableRow key={song.id} className="group hover:bg-gray-50">
                                                        <TableCell>
                                                            <button
                                                                onClick={() => handlePlaySong(song)}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-gray-900 transition-all"
                                                            >
                                                                {currentSong?.id === song.id && isPlaying ? (
                                                                    <Pause size={14} fill="currentColor" />
                                                                ) : (
                                                                    <span className="group-hover:hidden text-xs font-medium">{i + 1}</span>
                                                                )}
                                                                <Play size={14} fill="currentColor" className="hidden group-hover:block ml-0.5" />
                                                            </button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    loading="lazy" src={song.cover_url || '/placeholder-music.png'}
                                                                    alt={song.title}
                                                                    className="w-10 h-10 rounded object-cover bg-gray-200"
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                                />
                                                                <span className={`font-medium truncate ${currentSong?.id === song.id ? 'text-gray-900' : 'text-gray-900'}`}>
                                                                    {song.title}
                                                                    {picks.some(p => p.song_id === song.id) && (
                                                                        <Star size={12} className="inline ml-1 fill-gray-900 text-gray-900" />
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                                                            {song.albums?.title || <Badge variant="secondary" className="text-xs">Single</Badge>}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {song.genre && <Badge variant="outline" className="text-xs">{song.genre}</Badge>}
                                                        </TableCell>
                                                        <TableCell className="text-center font-semibold text-sm">
                                                            {(song.plays || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell text-gray-500 font-mono text-sm">
                                                            {formatDuration(song.duration)}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell text-gray-400 text-xs">
                                                            {formatDate(song.created_at)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                                        <MoreHorizontal size={16} />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => {
                                                                        navigator.clipboard.writeText(`${window.location.origin}/streams/song/${song.id}`);
                                                                        toast({ title: 'Copied!', description: 'Song link copied to clipboard.' });
                                                                    }}>
                                                                        <Share2 size={14} className="mr-2" /> Copy Link
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setEditingSong(song)}>
                                                                        <Edit2 size={14} className="mr-2" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => togglePick(song.id)}>
                                                                        <Star size={14} className={`mr-2 ${picks.some(p => p.song_id === song.id) ? 'fill-gray-900 text-gray-900' : ''}`} />
                                                                        {picks.some(p => p.song_id === song.id) ? 'Remove Pick' : 'Add to Picks'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDeleteSong(song.id)} className="text-gray-700">
                                                                        <Trash2 size={14} className="mr-2" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === ALBUMS TAB === */}
                        {activeTab === 'albums' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">{albums.length} Albums</h2>
                                    <Link to="/streams/creator/albums">
                                        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                                            <Plus size={16} className="mr-2" /> Create Album
                                        </Button>
                                    </Link>
                                </div>

                                {albums.length === 0 ? (
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="py-12 text-center">
                                            <Disc size={48} className="text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No albums yet. Create your first album!</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {albums.map((album, i) => (
                                            <motion.div
                                                key={album.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                            >
                                                <Card onClick={() => setEditingAlbum(album)} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer">
                                                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                                        {album.cover_url ? (
                                                            <img loading="lazy" src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Disc size={64} className="text-gray-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                                                            <Edit2 size={22} /> <span className="font-bold text-sm">Edit</span>
                                                        </div>
                                                    </div>
                                                    <CardContent className="pt-4 pb-4">
                                                        <h3 className="font-bold text-gray-900 truncate">{album.title}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {album.songs?.length || 0} tracks &middot; {album.release_date ? formatDate(album.release_date) : formatDate(album.created_at)}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === ANALYTICS TAB === */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>

                                {/* Streams over time (30 days) */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Streams (Last 30 Days)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {dailyStreams.length === 0 || dailyStreams.every((d) => d.count === 0) ? (
                                            <p className="text-gray-500 text-center py-8 text-sm">No streams recorded in the last 30 days yet.</p>
                                        ) : (
                                            <>
                                                <div className="flex items-end gap-1 h-40">
                                                    {(() => {
                                                        const max = Math.max(...dailyStreams.map((d) => d.count), 1);
                                                        return dailyStreams.map((d) => {
                                                            const pct = (d.count / max) * 100;
                                                            return (
                                                                <div
                                                                    key={d.date}
                                                                    className="flex-1 bg-gray-900/20 hover:bg-gray-900 transition-colors rounded-t relative group"
                                                                    style={{ height: `${pct}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
                                                                    title={`${d.date}: ${d.count} streams`}
                                                                >
                                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                                                                        {d.count}
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                                                    <span>{dailyStreams[0]?.date.slice(5)}</span>
                                                    <span>{dailyStreams[Math.floor(dailyStreams.length / 2)]?.date.slice(5)}</span>
                                                    <span>Today</span>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Total last 30 days</span>
                                                    <span className="font-bold text-gray-900">
                                                        {dailyStreams.reduce((acc, d) => acc + d.count, 0).toLocaleString()} streams
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Followers */}
                                <Card className="border-none shadow-sm">
                                    <CardContent className="pt-5 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-500 font-medium mb-1">Followers</div>
                                            <div className="text-3xl font-black text-gray-900">{followerCount.toLocaleString()}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 text-right max-w-[180px]">
                                            Follower growth chart coming soon — needs historical snapshots.
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Songs by Plays */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Top Performing Tracks</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {songs.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">Upload songs to see analytics.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {[...songs]
                                                    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
                                                    .slice(0, 10)
                                                    .map((song, i) => {
                                                        const maxPlays = Math.max(...songs.map(s => s.plays || 1));
                                                        const pct = ((song.plays || 0) / maxPlays) * 100;
                                                        return (
                                                            <div key={song.id} className="flex items-center gap-4">
                                                                <span className="text-sm font-bold text-gray-400 w-6 text-right">{i + 1}</span>
                                                                <img
                                                                    loading="lazy" src={song.cover_url || '/placeholder-music.png'}
                                                                    alt={song.title}
                                                                    className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0"
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-gray-900 text-sm truncate">{song.title}</div>
                                                                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                                        <motion.div
                                                                            className="h-full bg-gray-900 rounded-full"
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${pct}%` }}
                                                                            transition={{ delay: i * 0.1, duration: 0.6 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-right">
                                                                    {(song.plays || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="pt-5">
                                            <div className="text-sm text-gray-500 font-medium mb-1">Avg. Streams per Track</div>
                                            <div className="text-3xl font-black text-gray-900">
                                                {songs.length > 0 ? Math.round(stats.totalPlays / songs.length).toLocaleString() : '0'}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="pt-5">
                                            <div className="text-sm text-gray-500 font-medium mb-1">Total Listening Time</div>
                                            <div className="text-3xl font-black text-gray-900">
                                                {(() => {
                                                    const totalSec = songs.reduce((acc, s) => acc + ((s.plays || 0) * (s.duration || 0)), 0);
                                                    const hours = Math.floor(totalSec / 3600);
                                                    return hours > 0 ? `${hours.toLocaleString()}h` : `${Math.floor(totalSec / 60)}m`;
                                                })()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="pt-5">
                                            <div className="text-sm text-gray-500 font-medium mb-1">Latest Release</div>
                                            <div className="text-lg font-bold text-gray-900 truncate">
                                                {songs.length > 0 ? songs[0].title : 'N/A'}
                                            </div>
                                            {songs.length > 0 && (
                                                <div className="text-xs text-gray-400">{formatDate(songs[0].created_at)}</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Promote section */}
                                <Card className="border-none shadow-sm border-l-4 border-l-gray-900">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Zap className="text-gray-900" size={20} />
                                            Promote Your Track
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-500 mb-4">Boost your latest release to the top of the "Trending" feed for 24 hours.</p>
                                        <Button
                                            className="bg-gray-900 text-white hover:bg-black font-bold flex items-center gap-2"
                                            disabled={isBoosting || songs.length === 0}
                                            onClick={async () => {
                                                if (!user || songs.length === 0) return;
                                                setIsBoosting(true);
                                                try {
                                                    const trackId = songs[0].id;
                                                    const boostCost = await GamificationService.getSetting('cost.track_boost');
                                                    const success = await GamificationService.spendCoins(user.id, boostCost, "Track Boost: " + trackId);
                                                    if (success) {
                                                        await supabase.from('songs').update({
                                                            is_premium: true,
                                                            boosted_until: new Date(Date.now() + 86400000).toISOString()
                                                        }).eq('id', trackId);
                                                        await MonetizationService.trackInteraction(trackId, 'song', 'click', 0.50);
                                                        toast({ title: "Success", description: `"${songs[0].title}" promoted! -${boostCost} Coins.` });
                                                    } else {
                                                        toast({ title: "Error", description: "Insufficient Bara Coins!", variant: 'destructive' });
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    toast({ title: "Error", description: "Not enough coins to promote.", variant: 'destructive' });
                                                } finally {
                                                    setIsBoosting(false);
                                                }
                                            }}
                                        >
                                            <Star size={18} className={isBoosting ? "animate-spin" : ""} />
                                            {isBoosting ? "Boosting..." : "Boost Now (50 Coins)"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </div>

            {editingSong && artistId && (
                <EditSongModal
                    song={{
                        id: editingSong.id,
                        title: editingSong.title,
                        genre: editingSong.genre,
                        album_id: editingSong.album_id,
                        cover_url: editingSong.cover_url,
                    }}
                    artistId={artistId}
                    albums={albums.map((a) => ({ id: a.id, title: a.title }))}
                    onClose={() => setEditingSong(null)}
                    onSaved={fetchMyData}
                />
            )}

            {editingAlbum && artistId && (
                <EditAlbumModal
                    album={{ id: editingAlbum.id, title: editingAlbum.title, cover_url: editingAlbum.cover_url }}
                    artistId={artistId}
                    onClose={() => setEditingAlbum(null)}
                    onSaved={fetchMyData}
                />
            )}

            {editingProfile && artistId && (
                <EditArtistProfileModal
                    artistId={artistId}
                    onClose={() => setEditingProfile(false)}
                    onSaved={fetchMyData}
                />
            )}
        </StreamsLayout>
    );
}

