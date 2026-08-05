import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAuditLog';
import { Flag, Loader2, Ban, X } from 'lucide-react';

type ReportStatus = 'pending' | 'dismissed' | 'actioned';
type EntityType = 'song' | 'album' | 'artist' | 'playlist';

interface ReportRow {
    id: string;
    entity_type: EntityType;
    entity_id: string;
    reporter_user_id: string | null;
    reporter_email: string | null;
    category: string;
    description: string | null;
    status: ReportStatus;
    reviewer_notes: string | null;
    created_at: string;
}

const ENTITY_TABLE: Record<EntityType, string> = {
    song: 'songs',
    album: 'albums',
    artist: 'artists',
    playlist: 'playlists',
};

const ENTITY_NAME_COLUMN: Record<EntityType, string> = {
    song: 'title',
    album: 'title',
    artist: 'name',
    playlist: 'title',
};

const ENTITY_LINK: Record<EntityType, string> = {
    song: '/streams/song',
    album: '/streams/album',
    artist: '/streams/artist',
    playlist: '/streams/playlist',
};

/**
 * §F3 — admin review queue for content_reports (in-app Report action +
 * public DMCA form both feed this). Dismiss or take down (unpublish, not
 * hard delete) via content_report_review, which also notifies the owner.
 */
const AdminContentReports = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState<ReportStatus>('pending');
    const [rows, setRows] = useState<ReportRow[]>([]);
    const [entityNames, setEntityNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await supabase.rpc('content_reports_admin_list', {
                p_admin_id: user.id,
                p_status: statusFilter,
            });
            const list = (data || []) as ReportRow[];
            setRows(list);

            // Best-effort: look up a display name per reported entity, grouped
            // by table so it's a handful of queries, not one per row.
            const byType = new Map<EntityType, Set<string>>();
            list.forEach((r) => {
                if (!byType.has(r.entity_type)) byType.set(r.entity_type, new Set());
                byType.get(r.entity_type)!.add(r.entity_id);
            });
            const names: Record<string, string> = {};
            await Promise.all(
                Array.from(byType.entries()).map(async ([type, ids]) => {
                    const { data: entities } = await supabase
                        .from(ENTITY_TABLE[type])
                        .select(`id, ${ENTITY_NAME_COLUMN[type]}`)
                        .in('id', Array.from(ids));
                    (entities || []).forEach((e: any) => { names[`${type}:${e.id}`] = e[ENTITY_NAME_COLUMN[type]]; });
                })
            );
            setEntityNames(names);
        } finally {
            setLoading(false);
        }
    }, [user?.id, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const review = async (row: ReportRow, action: 'dismiss' | 'takedown') => {
        if (!user?.id) return;
        setReviewing(row.id);
        try {
            const { data, error } = await supabase.rpc('content_report_review', {
                p_admin_id: user.id,
                p_report_id: row.id,
                p_action: action,
                p_notes: notes[row.id] || null,
            });
            const result = data as { success: boolean; error?: string };
            if (error || !result?.success) {
                toast({ title: 'Review failed', description: result?.error || error?.message || 'Please try again.', variant: 'destructive' });
            } else {
                await logAdminAction(action === 'takedown' ? 'content_takedown' : 'content_report_dismissed', {
                    entity_type: row.entity_type, entity_id: row.entity_id, notes: notes[row.id] || null,
                });
                toast({
                    title: action === 'takedown' ? 'Taken down' : 'Dismissed',
                    description: action === 'takedown' ? 'The content was unpublished and the owner notified.' : 'The report was dismissed.',
                });
                load();
            }
        } finally {
            setReviewing(null);
        }
    };

    return (
        <div className="space-y-6 p-1">
            <div>
                <h1 className="text-2xl font-black font-comfortaa flex items-center gap-2">
                    <Flag size={22} /> Content Reports
                </h1>
                <p className="text-sm text-gray-500">
                    Reports from the in-app Report action and public DMCA claims. Takedown unpublishes the content
                    (not a hard delete) and notifies the owner; only supported for songs right now.
                </p>
            </div>

            <div className="flex gap-2">
                {(['pending', 'dismissed', 'actioned'] as ReportStatus[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize border-2 transition-colors ${
                            statusFilter === s ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-gray-400 italic text-sm">
                        No {statusFilter} reports.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {rows.map((row) => {
                        const name = entityNames[`${row.entity_type}:${row.entity_id}`] || row.entity_id;
                        return (
                            <Card key={row.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                        <div>
                                            <CardTitle className="text-base font-black">
                                                <a href={`${ENTITY_LINK[row.entity_type]}/${row.entity_id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {name}
                                                </a>
                                                <span className="ml-2 text-[10px] uppercase font-black bg-gray-900 text-white px-2 py-0.5 rounded-full align-middle">
                                                    {row.entity_type}
                                                </span>
                                                <span className="ml-1 text-[10px] uppercase font-black bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full align-middle">
                                                    {row.category}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>
                                                Reported by {row.reporter_email || row.reporter_user_id || 'anonymous'} · {new Date(row.created_at).toLocaleString()}
                                            </CardDescription>
                                        </div>
                                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                                            row.status === 'pending' ? 'bg-gray-100 text-gray-700'
                                            : row.status === 'actioned' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {row.description && (
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words border-l-2 border-gray-200 pl-3">{row.description}</p>
                                    )}

                                    {row.status === 'pending' ? (
                                        <div className="flex flex-wrap items-end gap-3 pt-2 border-t">
                                            <div className="flex-1 min-w-[220px]">
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Reviewer note (sent to owner on takedown)</label>
                                                <input
                                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                                                    value={notes[row.id] || ''}
                                                    onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                                                    placeholder="e.g. Confirmed unauthorized upload of copyrighted track"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => review(row, 'takedown')}
                                                disabled={reviewing === row.id || row.entity_type !== 'song'}
                                                title={row.entity_type !== 'song' ? 'Takedown is only available for songs right now' : undefined}
                                                className="bg-black text-white font-bold hover:bg-gray-800"
                                            >
                                                {reviewing === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ban className="h-4 w-4 mr-1" /> Take down</>}
                                            </Button>
                                            <Button
                                                onClick={() => review(row, 'dismiss')}
                                                disabled={reviewing === row.id}
                                                variant="outline"
                                                className="font-bold border-2"
                                            >
                                                <X className="h-4 w-4 mr-1" /> Dismiss
                                            </Button>
                                        </div>
                                    ) : (
                                        row.reviewer_notes && (
                                            <p className="text-xs text-gray-500 pt-2 border-t">Note: {row.reviewer_notes}</p>
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminContentReports;
