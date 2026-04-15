import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Mail, RefreshCw, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmailQueueRow {
    id: string;
    to_email: string;
    subject: string;
    status: 'pending' | 'sent' | 'failed';
    retry_count: number;
    error_message: string | null;
    created_at: string;
    sent_at: string | null;
    metadata: Record<string, any> | null;
}

const STATUS_STYLES: Record<string, string> = {
    sent: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
};

export const AdminEmailLog = () => {
    const { toast } = useToast();
    const [rows, setRows] = useState<EmailQueueRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

    const fetchLog = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('email_queue')
                .select('id, to_email, subject, status, retry_count, error_message, created_at, sent_at, metadata')
                .order('created_at', { ascending: false })
                .limit(500);

            if (statusFilter !== 'all') query = query.eq('status', statusFilter);

            const { data, error } = await query;
            if (error) throw error;
            const all = (data || []) as EmailQueueRow[];
            setRows(all);
            setStats({
                total: all.length,
                sent: all.filter(r => r.status === 'sent').length,
                failed: all.filter(r => r.status === 'failed').length,
                pending: all.filter(r => r.status === 'pending').length,
            });
        } catch (error: any) {
            console.error('Error fetching email log:', error);
            toast({ title: 'Failed to load email log', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLog();
    }, [statusFilter]);

    const types = Array.from(
        new Set(rows.map(r => r.metadata?.type).filter(Boolean))
    ) as string[];

    const filtered = rows.filter(r => {
        if (typeFilter !== 'all' && r.metadata?.type !== typeFilter) return false;
        if (search && !(
            r.to_email.toLowerCase().includes(search.toLowerCase()) ||
            r.subject.toLowerCase().includes(search.toLowerCase())
        )) return false;
        return true;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Mail className="w-7 h-7" /> Email Log
                        </h1>
                        <p className="text-muted-foreground">Delivery history for all transactional emails.</p>
                    </div>
                    <Button onClick={fetchLog} disabled={loading} variant="outline">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Sent</div><div className="text-2xl font-bold text-green-700">{stats.sent}</div></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3 text-red-600" /> Failed</div><div className="text-2xl font-bold text-red-700">{stats.failed}</div></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-600" /> Pending</div><div className="text-2xl font-bold text-yellow-700">{stats.pending}</div></CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Search recipient or subject..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Recipient</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Retries</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Sent</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                                    ) : filtered.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No emails match the current filters.</TableCell></TableRow>
                                    ) : filtered.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-mono text-xs">{row.to_email}</TableCell>
                                            <TableCell className="max-w-xs truncate" title={row.subject}>{row.subject}</TableCell>
                                            <TableCell>{row.metadata?.type ? <Badge variant="outline">{row.metadata.type}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell><Badge className={STATUS_STYLES[row.status] || ''}>{row.status}</Badge></TableCell>
                                            <TableCell>{row.retry_count}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{row.sent_at ? formatDistanceToNow(new Date(row.sent_at), { addSuffix: true }) : '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminEmailLog;
