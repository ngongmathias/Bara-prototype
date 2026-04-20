import { useState, useEffect } from 'react';
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';

interface Props {
    onDone?: () => void;
}

export function InterestPicker({ onDone }: Props) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [categories, setCategories] = useState<{ slug: string; name: string; icon: string }[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from('event_categories')
                .select('slug, name, icon')
                .order('name');
            setCategories(data || []);
        })();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                const token = await getToken({ template: 'supabase' });
                if (!token) return;
                const client = await createAuthenticatedSupabaseClient(token);
                const { data } = await client
                    .from('user_interests')
                    .select('category_slug')
                    .eq('user_id', user.id);
                if (data) setSelected(new Set(data.map(d => d.category_slug)));
            } catch { /* table may not exist */ }
            setLoaded(true);
        })();
    }, [user?.id]);

    const toggle = (slug: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
        });
    };

    const save = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) return;
            const client = await createAuthenticatedSupabaseClient(token);
            await client.from('user_interests').delete().eq('user_id', user.id);
            if (selected.size > 0) {
                await client.from('user_interests').insert(
                    Array.from(selected).map(slug => ({ user_id: user.id, category_slug: slug }))
                );
            }
            onDone?.();
        } catch { /* ignore */ }
        setSaving(false);
    };

    if (!loaded) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900">Your Interests</h3>
                <span className="text-xs text-gray-500">Pick categories to get personalized recommendations</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(cat => (
                    <button
                        key={cat.slug}
                        onClick={() => toggle(cat.slug)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                            selected.has(cat.slug)
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        {selected.has(cat.slug) && <Check size={14} />}
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>
            <Button onClick={save} disabled={saving} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                {saving ? 'Saving...' : 'Save Interests'}
            </Button>
        </div>
    );
}
