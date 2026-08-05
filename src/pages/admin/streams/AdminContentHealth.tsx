import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageGuide } from "@/components/admin/AdminPageGuide";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAdminRole } from "@/hooks/useAdminRole";
import { logAdminAction } from "@/lib/adminAuditLog";
import { Link } from "react-router-dom";
import { AlertTriangle, Music, Disc, Mic2, Loader2, Trash2, ExternalLink } from "lucide-react";

interface DeadAudioSong { id: string; title: string; file_url: string; }
interface IncompleteSong { id: string; title: string; missing: string[]; }
interface EmptyAlbum { id: string; title: string; artist_name?: string; }
interface UnclaimedArtist { id: string; name: string; is_seed: boolean; }

// §L7 — content-health checks. Each one only ever needed a handful of rows
// to demonstrate the problem (fix actions are per-item, so pulling every
// offending row would just be wasted bandwidth on a large catalog).
const SAMPLE_LIMIT = 50;

export const AdminContentHealth = () => {
    const { toast } = useToast();
    const { canDelete } = useAdminRole();
    const [loading, setLoading] = useState(true);
    const [deadAudio, setDeadAudio] = useState<DeadAudioSong[]>([]);
    const [incompleteSongs, setIncompleteSongs] = useState<IncompleteSong[]>([]);
    const [emptyAlbums, setEmptyAlbums] = useState<EmptyAlbum[]>([]);
    const [unclaimedArtists, setUnclaimedArtists] = useState<UnclaimedArtist[]>([]);
    const [deletingAlbum, setDeletingAlbum] = useState<string | null>(null);

    useEffect(() => { runChecks(); }, []);

    const runChecks = async () => {
        setLoading(true);
        try {
            const [songsRes, albumsRes, songAlbumIdsRes, artistsRes] = await Promise.all([
                supabase.from('songs').select('id, title, file_url, cover_url, duration').limit(2000),
                supabase.from('albums').select('id, title, artists(name)'),
                supabase.from('songs').select('album_id').not('album_id', 'is', null),
                supabase.from('artists').select('id, name, user_id, is_seed').is('user_id', null).limit(SAMPLE_LIMIT),
            ]);

            const songs = songsRes.data || [];
            const dead = songs.filter(s => !s.file_url || s.file_url.includes('soundhelix.com')).slice(0, SAMPLE_LIMIT);
            setDeadAudio(dead.map(s => ({ id: s.id, title: s.title, file_url: s.file_url || '(empty)' })));

            const incomplete = songs
                .filter(s => !s.cover_url || !s.duration)
                .slice(0, SAMPLE_LIMIT)
                .map(s => ({
                    id: s.id,
                    title: s.title,
                    missing: [!s.cover_url && 'cover', !s.duration && 'duration'].filter(Boolean) as string[],
                }));
            setIncompleteSongs(incomplete);

            const albumIdsWithSongs = new Set((songAlbumIdsRes.data || []).map((r: any) => r.album_id));
            const empty = (albumsRes.data || [])
                .filter((a: any) => !albumIdsWithSongs.has(a.id))
                .slice(0, SAMPLE_LIMIT)
                .map((a: any) => ({ id: a.id, title: a.title, artist_name: a.artists?.name }));
            setEmptyAlbums(empty);

            setUnclaimedArtists((artistsRes.data || []).map((a: any) => ({ id: a.id, name: a.name, is_seed: a.is_seed })));
        } catch (error) {
            console.error('Content health check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmptyAlbum = async (album: EmptyAlbum) => {
        if (!confirm(`Delete "${album.title}"? It has zero tracks, so nothing else is affected.`)) return;
        setDeletingAlbum(album.id);
        try {
            const { error } = await supabase.from('albums').delete().eq('id', album.id);
            if (error) throw error;
            await logAdminAction('delete_empty_album', { title: album.title });
            setEmptyAlbums(prev => prev.filter(a => a.id !== album.id));
            toast({ title: 'Deleted', description: `"${album.title}" removed.` });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setDeletingAlbum(null);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Content Health" subtitle="Catalog integrity checks">
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Content Health" subtitle="Catalog integrity checks">
            <div className="mb-4 w-full flex justify-end">
                <AdminPageGuide
                    title="Content Health"
                    description="Finds catalog problems that are otherwise invisible until a user hits them (§L7)."
                    features={["Dead/external audio URLs", "Songs missing cover or duration", "Albums with zero tracks", "Unclaimed (no user_id) artists"]}
                    workflow={["Review each panel", "Fix in the relevant admin page, or delete empty albums directly here"]}
                />
            </div>
            <div className="p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-orange-500" /> Dead / external audio URLs</CardTitle>
                        <CardDescription>Missing `file_url`, or pointing at the SoundHelix seed CDN (known to time out — STREAMS_MASTER_PLAN.md §7 environment notes).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deadAudio.length === 0 ? <p className="text-sm text-gray-400 italic">None found.</p> : (
                            <div className="space-y-2">
                                {deadAudio.map(s => (
                                    <div key={s.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{s.title}</p>
                                            <p className="text-xs text-gray-400 truncate">{s.file_url}</p>
                                        </div>
                                        <Link to="/admin/streams/songs" className="flex-shrink-0 ml-3"><Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1" />Fix</Button></Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Music className="h-4 w-4 text-orange-500" /> Songs missing cover or duration</CardTitle>
                        <CardDescription>Breaks player UI (blank artwork) or progress bars (unknown length).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {incompleteSongs.length === 0 ? <p className="text-sm text-gray-400 italic">None found.</p> : (
                            <div className="space-y-2">
                                {incompleteSongs.map(s => (
                                    <div key={s.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                                        <div className="min-w-0 flex items-center gap-2">
                                            <span className="font-medium truncate">{s.title}</span>
                                            {s.missing.map(m => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}
                                        </div>
                                        <Link to="/admin/streams/songs" className="flex-shrink-0 ml-3"><Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1" />Fix</Button></Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Disc className="h-4 w-4 text-orange-500" /> Albums with zero tracks</CardTitle>
                        <CardDescription>Shows up in browse/search with nothing to play.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {emptyAlbums.length === 0 ? <p className="text-sm text-gray-400 italic">None found.</p> : (
                            <div className="space-y-2">
                                {emptyAlbums.map(a => (
                                    <div key={a.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{a.title}</p>
                                            {a.artist_name && <p className="text-xs text-gray-400 truncate">{a.artist_name}</p>}
                                        </div>
                                        <Button
                                            variant="outline" size="sm" className="flex-shrink-0 ml-3 text-red-600 hover:text-red-700"
                                            disabled={!canDelete || deletingAlbum === a.id}
                                            title={!canDelete ? 'Requires admin or super_admin role' : undefined}
                                            onClick={() => handleDeleteEmptyAlbum(a)}
                                        >
                                            {deletingAlbum === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Mic2 className="h-4 w-4 text-orange-500" /> Unclaimed artists (no user_id)</CardTitle>
                        <CardDescription>Admin-seeded artist profiles nobody owns yet — expected for seed data, worth reviewing for real ones. Showing up to {SAMPLE_LIMIT}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {unclaimedArtists.length === 0 ? <p className="text-sm text-gray-400 italic">None found.</p> : (
                            <div className="space-y-2">
                                {unclaimedArtists.map(a => (
                                    <div key={a.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{a.name}</span>
                                            {a.is_seed && <Badge variant="outline" className="text-[10px]">seed</Badge>}
                                        </div>
                                        <Link to="/admin/streams/artists" className="flex-shrink-0 ml-3"><Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1" />View</Button></Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};
