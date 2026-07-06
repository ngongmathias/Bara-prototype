import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { VerificationService, VerificationStatus } from '@/lib/verificationService';
import { ShieldCheck, FileText, Loader2, Check, X, ExternalLink } from 'lucide-react';

interface RequestRow {
    id: string;
    clerk_user_id: string;
    account_type: 'business' | 'artist';
    status: VerificationStatus;
    submitted: Record<string, any>;
    doc_paths: string[];
    reviewer_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
}

/**
 * 27.8.2 — admin review queue for business/artist verification requests.
 * Approve grants the verified badge (artists.is_verified /
 * marketplace_partners.verification_level) inside the review RPC.
 */
const AdminVerifications = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState<VerificationStatus>('pending');
    const [rows, setRows] = useState<RequestRow[]>([]);
    const [names, setNames] = useState<Record<string, { name?: string; email?: string }>>({});
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = (await VerificationService.adminList(user.id, statusFilter)) as RequestRow[];
            setRows(data);
            const ids = [...new Set(data.map((r) => r.clerk_user_id))];
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
    }, [user?.id, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const openDoc = async (path: string) => {
        const url = await VerificationService.getDocUrl(path);
        if (url) window.open(url, '_blank', 'noopener');
        else toast({ title: 'Could not open document', variant: 'destructive' });
    };

    const review = async (row: RequestRow, approve: boolean) => {
        if (!user?.id) return;
        setReviewing(row.id);
        try {
            const result = await VerificationService.adminReview(user.id, row.id, approve, notes[row.id] || '');
            if (result.success) {
                toast({
                    title: approve ? 'Approved' : 'Rejected',
                    description: approve
                        ? 'The verified badge is now live and the user has been notified.'
                        : 'The user has been notified and can resubmit.',
                });
                load();
            } else {
                toast({ title: 'Review failed', description: result.error || 'Please try again.', variant: 'destructive' });
            }
        } finally {
            setReviewing(null);
        }
    };

    return (
        <div className="space-y-6 p-1">
            <div>
                <h1 className="text-2xl font-black font-comfortaa flex items-center gap-2">
                    <ShieldCheck size={22} /> Verification Requests
                </h1>
                <p className="text-sm text-gray-500">
                    Business & artist verification queue (27.8.2). Approving sets the verified badge automatically.
                </p>
            </div>

            <div className="flex gap-2">
                {(['pending', 'approved', 'rejected'] as VerificationStatus[]).map((s) => (
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
                        No {statusFilter} verification requests.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {rows.map((row) => {
                        const who = names[row.clerk_user_id];
                        return (
                            <Card key={row.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                        <div>
                                            <CardTitle className="text-base font-black">
                                                {row.submitted?.name || who?.name || row.clerk_user_id}
                                                <span className="ml-2 text-[10px] uppercase font-black bg-gray-900 text-white px-2 py-0.5 rounded-full align-middle">
                                                    {row.account_type}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>
                                                {who?.email || 'no email on file'} · submitted {new Date(row.created_at).toLocaleString()}
                                            </CardDescription>
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
                                    {/* Submitted fields */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                        {Object.entries(row.submitted || {}).filter(([, v]) => v).map(([k, v]) => (
                                            <div key={k}>
                                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{k.replace(/_/g, ' ')}</div>
                                                <div className="text-gray-900 font-medium break-words">{String(v)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Documents */}
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                                            Documents ({row.doc_paths?.length || 0})
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(row.doc_paths || []).map((p, i) => (
                                                <button
                                                    key={p}
                                                    onClick={() => openDoc(p)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <FileText size={13} /> Document {i + 1} <ExternalLink size={11} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {row.status === 'pending' ? (
                                        <div className="flex flex-wrap items-end gap-3 pt-2 border-t">
                                            <div className="flex-1 min-w-[220px]">
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Reviewer note (sent to user on reject)</label>
                                                <input
                                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                                                    value={notes[row.id] || ''}
                                                    onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                                                    placeholder="e.g. ID photo unreadable — please re-upload"
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

export default AdminVerifications;
