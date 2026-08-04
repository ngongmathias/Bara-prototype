import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Mic2, Loader2, Check, X } from 'lucide-react';

type ClaimStatus = 'pending' | 'approved' | 'rejected';

interface ClaimRow {
    id: string;
    artist_id: string;
    requester_user_id: string;
    evidence: string | null;
    status: ClaimStatus;
    reviewer_notes: string | null;
    created_at: string;
    artists: { name: string; image_url: string | null } | null;
}

/**
 * §E1 — admin review queue for artist-profile claim requests (admin-seeded
 * artists with no owning user). Approving links the requester's account via
 * artist_claim_review, which sets artists.user_id.
 */
const AdminArtistClaims = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState<ClaimStatus>('pending');
    const [rows, setRows] = useState<ClaimRow[]>([]);
    const [names, setNames] = useState<Record<string, { name?: string; email?: string }>>({});
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('artist_claims')
                .select('id, artist_id, requester_user_id, evidence, status, reviewer_notes, created_at, artists(name, image_url)')
                .eq('status', statusFilter)
                .order('created_at', { ascending: false });
            const list = (data || []) as unknown as ClaimRow[];
            setRows(list);
            const ids = [...new Set(list.map((r) => r.requester_user_id))];
            if (ids.length) {
                const { data: users } = await supabase
                    .from('clerk_users')
                    .select('clerk_user_id, full_name, email')
                    .in('clerk_user_id', ids);
                const map: Record<string, { name?: string; email?: string }> = {};
                (users || []).forEach((u: any) => { map[u.clerk_user_id] = { name: u.full_name, email: u.email }; });
                setNames(map);
            }
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const review = async (row: ClaimRow, approve: boolean) => {
        if (!user?.id) return;
        setReviewing(row.id);
        try {
            const { data, error } = await supabase.rpc('artist_claim_review', {
                p_admin_id: user.id,
                p_claim_id: row.id,
                p_approve: approve,
                p_notes: notes[row.id] || null,
            });
            const result = data as { success: boolean; error?: string };
            if (error || !result?.success) {
                toast({ title: 'Review failed', description: result?.error || error?.message || 'Please try again.', variant: 'destructive' });
            } else {
                toast({
                    title: approve ? 'Approved' : 'Rejected',
                    description: approve ? 'The artist profile is now linked to their account.' : 'The requester has been notified.',
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
                    <Mic2 size={22} /> Artist Claims
                </h1>
                <p className="text-sm text-gray-500">
                    Requests to take ownership of an admin-seeded artist profile. Approving links it to the requester's account.
                </p>
            </div>

            <div className="flex gap-2">
                {(['pending', 'approved', 'rejected'] as ClaimStatus[]).map((s) => (
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
                        No {statusFilter} artist claims.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {rows.map((row) => {
                        const who = names[row.requester_user_id];
                        return (
                            <Card key={row.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                            {row.artists?.image_url && (
                                                <img src={row.artists.image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            )}
                                            <div>
                                                <CardTitle className="text-base font-black">
                                                    Claiming: {row.artists?.name || 'Unknown artist'}
                                                </CardTitle>
                                                <CardDescription>
                                                    by {who?.name || row.requester_user_id} ({who?.email || 'no email on file'}) · {new Date(row.created_at).toLocaleString()}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                                            row.status === 'pending' ? 'bg-gray-100 text-gray-700'
                                            : row.status === 'approved' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {row.evidence && (
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Evidence</div>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{row.evidence}</p>
                                        </div>
                                    )}

                                    {row.status === 'pending' ? (
                                        <div className="flex flex-wrap items-end gap-3 pt-2 border-t">
                                            <div className="flex-1 min-w-[220px]">
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Reviewer note (sent to requester on reject)</label>
                                                <input
                                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                                                    value={notes[row.id] || ''}
                                                    onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                                                    placeholder="e.g. Evidence doesn't establish ownership"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => review(row, true)}
                                                disabled={reviewing === row.id}
                                                className="bg-black text-white font-bold hover:bg-gray-800"
                                            >
                                                {reviewing === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Approve</>}
                                            </Button>
                                            <Button
                                                onClick={() => review(row, false)}
                                                disabled={reviewing === row.id}
                                                variant="outline"
                                                className="font-bold border-2"
                                            >
                                                <X className="h-4 w-4 mr-1" /> Reject
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

export default AdminArtistClaims;
