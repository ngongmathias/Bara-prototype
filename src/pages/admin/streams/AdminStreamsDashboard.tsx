import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Music, Disc, Mic2, Film, Headphones, BookOpen, Sprout, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase, db } from "@/lib/supabase";
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell,
} from 'recharts';

interface Stats {
    totalArtists: number;
    totalAlbums: number;
    totalSongs: number;
    totalPlays: number;
    playsToday: number;
    playsThisWeek: number;
}

interface VerticalActivity { label: string; icon: any; activeListeners: number; totalItems: number; seedItems: number; }
interface UploadDay { day: string; Songs: number; Movies: number; Podcasts: number; Ebooks: number; }
interface TopItem { id: string; title: string; subtitle: string; value: number; }
interface BucketInfo { id: string; public: boolean; fileSizeLimit: number | null; }

const COLORS = ['#111827', '#9ca3af'];

function daysAgoIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
}

function dayLabel(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function countDistinctUsers(table: string, dateColumn: string, since: string): Promise<number> {
    try {
        const { data } = await supabase.from(table).select('user_id').gte(dateColumn, since);
        return new Set((data || []).map((r: any) => r.user_id)).size;
    } catch { return 0; }
}

async function fetchUploadsPerDay(): Promise<UploadDay[]> {
    const since = daysAgoIso(13);
    const [songs, movies, podcasts, ebooks] = await Promise.all([
        supabase.from('songs').select('created_at').gte('created_at', since),
        supabase.from('movies').select('created_at').gte('created_at', since),
        supabase.from('podcasts').select('created_at').gte('created_at', since),
        supabase.from('ebooks').select('created_at').gte('created_at', since),
    ]);

    const buckets = new Map<string, UploadDay>();
    for (let i = 13; i >= 0; i--) {
        const iso = daysAgoIso(i);
        const key = iso.slice(0, 10);
        buckets.set(key, { day: dayLabel(iso), Songs: 0, Movies: 0, Podcasts: 0, Ebooks: 0 });
    }
    const tally = (rows: any[] | null, field: keyof UploadDay) => {
        for (const row of rows || []) {
            const key = (row.created_at || '').slice(0, 10);
            const bucket = buckets.get(key);
            if (bucket) (bucket[field] as number)++;
        }
    };
    tally(songs.data, 'Songs');
    tally(movies.data, 'Movies');
    tally(podcasts.data, 'Podcasts');
    tally(ebooks.data, 'Ebooks');
    return Array.from(buckets.values());
}

// Storage size totals would need a full recursive walk of every bucket's
// (often per-record) subfolders — too slow for a dashboard page load.
// Reporting configured buckets + their caps is the honest, fast alternative.
async function fetchBuckets(): Promise<BucketInfo[]> {
    try {
        const { data } = await supabase.storage.listBuckets();
        const relevant = ['music', 'podcasts', 'movies', 'ebooks'];
        return (data || [])
            .filter((b: any) => relevant.includes(b.id))
            .map((b: any) => ({ id: b.id, public: b.public, fileSizeLimit: b.file_size_limit ?? null }));
    } catch { return []; }
}

export const AdminStreamsDashboard = () => {
    const [stats, setStats] = useState<Stats>({ totalArtists: 0, totalAlbums: 0, totalSongs: 0, totalPlays: 0, playsToday: 0, playsThisWeek: 0 });
    const [verticals, setVerticals] = useState<VerticalActivity[]>([]);
    const [uploadsPerDay, setUploadsPerDay] = useState<UploadDay[]>([]);
    const [seedSplit, setSeedSplit] = useState<{ name: string; value: number }[]>([]);
    const [topSongs, setTopSongs] = useState<TopItem[]>([]);
    const [topArtists, setTopArtists] = useState<TopItem[]>([]);
    const [buckets, setBuckets] = useState<BucketInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const since7d = daysAgoIso(7);
            const sinceToday = daysAgoIso(0);

            const [
                artistCount, albumCount, songCount, songsForPlays,
                playsTodayCount, playsWeekCount,
                musicListeners, podcastListeners, movieWatchers, ebookReaders,
                seedCounts,
                topSongsData, topArtistsData,
                uploads, bucketInfo,
            ] = await Promise.all([
                db.artists().select('*', { count: 'exact', head: true }),
                db.albums().select('*', { count: 'exact', head: true }),
                db.songs().select('*', { count: 'exact', head: true }),
                db.songs().select('plays'),
                supabase.from('play_history').select('*', { count: 'exact', head: true }).gte('played_at', sinceToday),
                supabase.from('play_history').select('*', { count: 'exact', head: true }).gte('played_at', since7d),
                countDistinctUsers('play_history', 'played_at', since7d),
                countDistinctUsers('podcast_listen_history', 'listened_at', since7d),
                countDistinctUsers('movie_watch_progress', 'updated_at', since7d),
                countDistinctUsers('ebook_reading_progress', 'updated_at', since7d),
                Promise.all([
                    supabase.from('songs').select('*', { count: 'exact', head: true }).eq('is_seed', true),
                    supabase.from('movies').select('*', { count: 'exact', head: true }).eq('is_seed', true),
                    supabase.from('artists').select('*', { count: 'exact', head: true }).eq('is_seed', true),
                    supabase.from('podcasts').select('*', { count: 'exact', head: true }).eq('is_seed', true),
                ]),
                supabase.from('songs').select('id, title, plays, artists(name)').order('plays', { ascending: false }).limit(5),
                supabase.from('artists').select('id, name, monthly_listeners').order('monthly_listeners', { ascending: false, nullsFirst: false }).limit(5),
                fetchUploadsPerDay(),
                fetchBuckets(),
            ]);

            const totalPlays = (songsForPlays.data || []).reduce((acc: number, s: any) => acc + (s.plays || 0), 0);

            setStats({
                totalArtists: artistCount.count || 0,
                totalAlbums: albumCount.count || 0,
                totalSongs: songCount.count || 0,
                totalPlays,
                playsToday: playsTodayCount.count || 0,
                playsThisWeek: playsWeekCount.count || 0,
            });

            setVerticals([
                { label: 'Music listeners', icon: Music, activeListeners: musicListeners, totalItems: songCount.count || 0, seedItems: seedCounts[0].count || 0 },
                { label: 'Movie watchers', icon: Film, activeListeners: movieWatchers, totalItems: 0, seedItems: seedCounts[1].count || 0 },
                { label: 'Podcast listeners', icon: Headphones, activeListeners: podcastListeners, totalItems: 0, seedItems: seedCounts[3].count || 0 },
                { label: 'Ebook readers', icon: BookOpen, activeListeners: ebookReaders, totalItems: 0, seedItems: 0 },
            ]);

            const totalSeed = (seedCounts[0].count || 0) + (seedCounts[1].count || 0) + (seedCounts[2].count || 0) + (seedCounts[3].count || 0);
            const totalContent = (songCount.count || 0) + (artistCount.count || 0);
            setSeedSplit([
                { name: 'Seed / demo', value: totalSeed },
                { name: 'Real content', value: Math.max(0, totalContent - totalSeed) },
            ]);

            setTopSongs((topSongsData.data || []).map((s: any) => ({ id: s.id, title: s.title, subtitle: s.artists?.name || 'Unknown Artist', value: s.plays || 0 })));
            setTopArtists((topArtistsData.data || []).map((a: any) => ({ id: a.id, title: a.name, subtitle: 'Artist', value: a.monthly_listeners || 0 })));
            setUploadsPerDay(uploads);
            setBuckets(bucketInfo);
        } catch (error) {
            console.error("Error fetching dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Streams Dashboard" subtitle="Manage music content and metrics">
            <div className="mb-4 w-full flex justify-end">
                <AdminPageGuide
                    title="Streams Dashboard"
                    description="Real activity and content-health metrics for Bara Streams (§L6)."
                    features={["Plays today/week", "Active listeners per vertical", "Top songs & artists", "Uploads per day", "Seed vs real content split", "Storage bucket config"]}
                    workflow={["Check plays/listener trends for a pulse on activity", "Use the seed-vs-real split to gauge launch readiness", "Jump to manage each content type"]}
                />
            </div>
            <div className="p-6 space-y-6">
                {/* Top-line stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
                            <Mic2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.totalArtists}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                            <Music className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.totalSongs}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Plays Today</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.playsToday.toLocaleString()}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Plays This Week</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.playsThisWeek.toLocaleString()}</div></CardContent>
                    </Card>
                </div>

                {/* Active listeners per vertical */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {verticals.map((v) => (
                        <Card key={v.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{v.label}</CardTitle>
                                <v.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{v.activeListeners}</div>
                                <p className="text-xs text-gray-400">active in the last 7 days</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Uploads per day */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">New content per day</CardTitle>
                            <CardDescription>Last 14 days, across all four verticals.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px]">
                            {loading ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">Loading...</div> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={uploadsPerDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="Songs" stackId="a" fill="#111827" />
                                        <Bar dataKey="Movies" stackId="a" fill="#4b5563" />
                                        <Bar dataKey="Podcasts" stackId="a" fill="#9ca3af" />
                                        <Bar dataKey="Ebooks" stackId="a" fill="#d1d5db" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Seed vs real split */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2"><Sprout className="h-4 w-4" /> Seed vs Real</CardTitle>
                            <CardDescription>Songs, movies, artists & podcasts.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px]">
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie data={seedSplit} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {seedSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 text-xs font-bold">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-900 rounded-sm" /> Seed / demo</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-sm" /> Real</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top songs */}
                    <Card>
                        <CardHeader><CardTitle className="text-lg font-bold">Top Songs</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {topSongs.length === 0 && <p className="text-sm text-gray-400 italic">No songs yet.</p>}
                            {topSongs.map((s, i) => (
                                <div key={s.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate"><span className="text-gray-400 mr-2">#{i + 1}</span>{s.title} <span className="text-gray-400">— {s.subtitle}</span></span>
                                    <span className="font-bold flex-shrink-0 ml-2">{s.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Top artists */}
                    <Card>
                        <CardHeader><CardTitle className="text-lg font-bold">Top Artists</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {topArtists.length === 0 && <p className="text-sm text-gray-400 italic">No artists yet.</p>}
                            {topArtists.map((a, i) => (
                                <div key={a.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate"><span className="text-gray-400 mr-2">#{i + 1}</span>{a.title}</span>
                                    <span className="font-bold flex-shrink-0 ml-2">{a.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Storage buckets */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2"><HardDrive className="h-4 w-4" /> Storage Buckets</CardTitle>
                            <CardDescription>Configured limits — exact usage needs a recursive scan, skipped here for page speed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {buckets.map((b) => (
                                <div key={b.id} className="flex items-center justify-between text-sm">
                                    <span className="capitalize">{b.id}</span>
                                    <span className="text-gray-500">{b.fileSizeLimit ? `${Math.round(b.fileSizeLimit / 1024 / 1024)}MB cap` : '—'}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic2 className="h-5 w-5 text-gray-700" />
                                Manage Artists
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4 text-sm">Add, edit, or remove artists from the platform.</p>
                            <Link to="/admin/streams/artists">
                                <Button className="w-full">Go to Artists</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Music className="h-5 w-5 text-gray-700" />
                                Manage Songs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4 text-sm">Upload and manage individual music tracks.</p>
                            <Link to="/admin/streams/songs">
                                <Button className="w-full">Go to Songs</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Disc className="h-5 w-5 text-gray-700" />
                                Manage Albums
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4 text-sm">Create and manage albums or EP collections.</p>
                            <Link to="/admin/streams/albums">
                                <Button className="w-full">Go to Albums</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Headphones className="h-5 w-5 text-gray-700" />
                                Manage Podcasts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4 text-sm">Add and manage podcast shows and episodes.</p>
                            <Link to="/admin/streams/podcasts">
                                <Button className="w-full">Go to Podcasts</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Film className="h-5 w-5 text-gray-700" />
                                Manage Movies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4 text-sm">Upload and manage movie content and catalog.</p>
                            <Link to="/admin/streams/movies">
                                <Button className="w-full">Go to Movies</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-gray-700" />
                                Content Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4 text-sm">Find dead audio URLs, missing covers, and orphaned content.</p>
                            <Link to="/admin/streams/content-health">
                                <Button className="w-full">Go to Content Health</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};
