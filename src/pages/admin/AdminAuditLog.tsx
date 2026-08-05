import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminPageGuide } from "@/components/admin/AdminPageGuide";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/lib/supabase";
import { Loader2, ScrollText, Search, ShieldAlert } from "lucide-react";

interface LogEntry {
    id: string;
    admin_email: string;
    action: string;
    target_user_id: string | null;
    target_email: string | null;
    details: Record<string, unknown> | null;
    created_at: string;
}

// §L12 — reads the same admin_activity_log table admin-management actions
// already wrote to; log_admin_action (20260805_admin_command_center.sql)
// is what finally let content actions write to it too.
export const AdminAuditLog = () => {
    const { isSuperAdmin, loading: roleLoading } = useAdminRole();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (roleLoading) return;
        if (!isSuperAdmin) { setLoading(false); return; }
        supabase
            .from('admin_activity_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200)
            .then(({ data }) => { setLogs(data || []); setLoading(false); });
    }, [roleLoading, isSuperAdmin]);

    const filtered = logs.filter(l =>
        !search.trim() ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
        (l.target_email || '').toLowerCase().includes(search.toLowerCase())
    );

    if (!roleLoading && !isSuperAdmin) {
        return (
            <AdminLayout title="Audit Log" subtitle="Admin action history">
                <div className="p-12 text-center">
                    <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Super Admin access required.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Audit Log" subtitle="Who did what, and when">
            <div className="mb-4 w-full flex justify-end">
                <AdminPageGuide
                    title="Audit Log"
                    description="A record of destructive admin actions — deletes, takedowns, bulk operations (§L12)."
                    features={["Search by action, admin, or target", "Most recent 200 entries"]}
                    workflow={["Search to investigate a specific change", "Cross-reference with the moderation queue for takedowns"]}
                />
            </div>
            <div className="p-6 space-y-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search action, admin, or target..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                </div>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="p-12 text-center">
                                <ScrollText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No actions logged yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filtered.map(log => (
                                    <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                                            <p className="text-sm text-gray-500">by {log.admin_email}{log.target_email ? ` — target: ${log.target_email}` : ''}</p>
                                            {log.details && (
                                                <p className="text-xs text-gray-400 mt-1 font-mono truncate">{JSON.stringify(log.details)}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
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
