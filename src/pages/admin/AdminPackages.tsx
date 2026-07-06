import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Megaphone, Loader2, Plus, Save, X, Check } from 'lucide-react';

interface Pkg {
    id: string;
    name: string;
    description: string | null;
    price_usd: number;
    period: string;
    features: string[];
    active: boolean;
    sort_order: number;
}

interface Sub {
    id: string;
    clerk_user_id: string;
    package_id: string;
    status: string;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
}

const emptyForm = { id: '', name: '', description: '', price_usd: '', period: 'month', features: '', active: true, sort_order: '0' };

/**
 * 27.8.4 — admin CRUD for business packages + the manual-fulfillment
 * subscription queue (payments land in Phase 15; until then the team
 * activates subscriptions by hand after collecting payment).
 */
const AdminPackages = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [packages, setPackages] = useState<Pkg[]>([]);
    const [subs, setSubs] = useState<Sub[]>([]);
    const [subUsers, setSubUsers] = useState<Record<string, { name?: string; email?: string }>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<typeof emptyForm | null>(null);
    const [updatingSub, setUpdatingSub] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [{ data: pkgs }, { data: subsData }] = await Promise.all([
                supabase.from('business_packages').select('*').order('sort_order'),
                supabase.from('business_package_subscriptions').select('*').order('created_at', { ascending: false }).limit(100),
            ]);
            setPackages(((pkgs || []) as any[]).map((p) => ({ ...p, features: Array.isArray(p.features) ? p.features : [] })));
            const subRows = (subsData || []) as Sub[];
            setSubs(subRows);
            const ids = [...new Set(subRows.map((s) => s.clerk_user_id))];
            if (ids.length) {
                const { data: users } = await supabase
                    .from('clerk_users').select('clerk_user_id, full_name, email').in('clerk_user_id', ids);
                const map: Record<string, { name?: string; email?: string }> = {};
                (users || []).forEach((u: any) => { map[u.clerk_user_id] = { name: u.full_name, email: u.email }; });
                setSubUsers(map);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const startEdit = (p?: Pkg) => {
        setForm(p ? {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price_usd: String(p.price_usd),
            period: p.period,
            features: p.features.join('\n'),
            active: p.active,
            sort_order: String(p.sort_order),
        } : { ...emptyForm });
    };

    const save = async () => {
        if (!user?.id || !form) return;
        if (!form.name.trim()) return toast({ title: 'Name required', variant: 'destructive' });
        setSaving(true);
        try {
            const { data, error } = await supabase.rpc('business_package_upsert', {
                p_admin_id: user.id,
                p_id: form.id || null,
                p_name: form.name.trim(),
                p_description: form.description.trim() || null,
                p_price_usd: parseFloat(form.price_usd) || 0,
                p_period: form.period,
                p_features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
                p_active: form.active,
                p_sort_order: parseInt(form.sort_order) || 0,
            });
            if (error) throw error;
            if ((data as any)?.success) {
                toast({ title: 'Saved', description: `Package "${form.name}" saved.` });
                setForm(null);
                load();
            } else {
                toast({ title: 'Not saved', description: (data as any)?.error || 'Please try again.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Not saved', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const setSubStatus = async (sub: Sub, status: string) => {
        if (!user?.id) return;
        setUpdatingSub(sub.id);
        try {
            const { data, error } = await supabase.rpc('business_package_set_subscription_status', {
                p_admin_id: user.id,
                p_sub_id: sub.id,
                p_status: status,
            });
            if (error) throw error;
            if ((data as any)?.success) {
                toast({ title: 'Updated', description: `Subscription marked ${status.replace('_', ' ')}.` });
                load();
            } else {
                toast({ title: 'Update failed', description: (data as any)?.error, variant: 'destructive' });
            }
        } finally {
            setUpdatingSub(null);
        }
    };

    const pkgName = (id: string) => packages.find((p) => p.id === id)?.name || '—';

    return (
        <div className="space-y-6 p-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black font-comfortaa flex items-center gap-2">
                        <Megaphone size={22} /> Business Packages
                    </h1>
                    <p className="text-sm text-gray-500">
                        Paid ad/service packages (27.8.4). Payments are manual until Phase 15 — activate subscriptions here after collecting payment.
                    </p>
                </div>
                <Button onClick={() => startEdit()} className="bg-black text-white font-bold">
                    <Plus className="h-4 w-4 mr-1" /> New package
                </Button>
            </div>

            {/* Editor */}
            {form && (
                <Card className="border-2 border-black">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-black">{form.id ? 'Edit package' : 'New package'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Name</label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Price (USD)</label>
                                <Input type="number" min="0" step="0.01" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Period</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                                    value={form.period}
                                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                                >
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                    <option value="one_time">One-time</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Features (one per line — enforcement comes with Phase 15)</label>
                            <textarea
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm min-h-[100px] focus:border-gray-900 focus:outline-none"
                                value={form.features}
                                onChange={(e) => setForm({ ...form, features: e.target.value })}
                                placeholder={'10 marketplace ads per month\nFeatured placement'}
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-black" />
                                Active (visible on the public page)
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Sort</span>
                                <Input type="number" className="w-20" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                            <Button onClick={save} disabled={saving} className="bg-black text-white font-bold">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
                            </Button>
                            <Button variant="outline" onClick={() => setForm(null)} className="font-bold">
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Package list */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-black">Packages</CardTitle>
                    <CardDescription>Deactivate instead of deleting — subscriptions reference packages.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
                    ) : (
                        <div className="space-y-3">
                            {packages.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-xl flex-wrap">
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            {p.name}
                                            {!p.active && <span className="text-[9px] uppercase font-black bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>}
                                        </div>
                                        <div className="text-[11px] text-gray-400">
                                            ${Number(p.price_usd).toFixed(2)}/{p.period} · {p.features.length} features
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => startEdit(p)} className="font-bold">Edit</Button>
                                </div>
                            ))}
                            {packages.length === 0 && <div className="text-center text-gray-400 italic text-sm py-6">No packages yet.</div>}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subscription queue */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-black">Subscription requests</CardTitle>
                    <CardDescription>
                        pending_payment = the team must contact the business, collect payment, then mark Active.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {subs.map((s) => {
                            const who = subUsers[s.clerk_user_id];
                            return (
                                <div key={s.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-xl flex-wrap">
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm">{who?.name || s.clerk_user_id}</div>
                                        <div className="text-[11px] text-gray-400">
                                            {pkgName(s.package_id)} · {who?.email || s.contact_email || 'no email'} · {new Date(s.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                                            s.status === 'active' ? 'bg-gray-900 text-white'
                                            : s.status === 'pending_payment' ? 'bg-gray-100 text-gray-700'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {s.status.replace('_', ' ')}
                                        </span>
                                        {s.status === 'pending_payment' && (
                                            <Button size="sm" onClick={() => setSubStatus(s, 'active')} disabled={updatingSub === s.id} className="bg-black text-white font-bold">
                                                {updatingSub === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5 mr-1" /> Mark paid & activate</>}
                                            </Button>
                                        )}
                                        {s.status === 'active' && (
                                            <Button size="sm" variant="outline" onClick={() => setSubStatus(s, 'expired')} disabled={updatingSub === s.id} className="font-bold">
                                                Expire
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {subs.length === 0 && !loading && <div className="text-center text-gray-400 italic text-sm py-6">No subscription requests yet.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminPackages;
