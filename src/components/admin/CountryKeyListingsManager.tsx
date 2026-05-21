import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Building2, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
    COUNTRY_KEY_LISTING_TYPES,
    COUNTRY_KEY_LISTING_TYPE_LABELS,
    COUNTRY_KEY_LISTING_TYPE_PLURALS,
    countWords,
    KEY_LISTING_DESCRIPTION_MAX_WORDS,
    KEY_LISTING_LOGO_MAX_BYTES,
    type CountryKeyListingType,
} from '@/lib/countryKeyListingTypes';

interface KeyListing {
    id: string;
    listing_type: CountryKeyListingType;
    name: string;
    description: string | null;
    web_link: string | null;
    logo_url: string | null;
    logo_storage_path: string | null;
    address: string | null;
    telephone: string | null;
    display_order: number;
}

interface CountryKeyListingsManagerProps {
    countryId: string;
    countryName: string;
}

interface FormState {
    listing_type: CountryKeyListingType;
    name: string;
    description: string;
    web_link: string;
    address: string;
    telephone: string;
}

const emptyForm = (): FormState => ({
    listing_type: 'government_ministry',
    name: '',
    description: '',
    web_link: '',
    address: '',
    telephone: '',
});

export const CountryKeyListingsManager = ({ countryId, countryName }: CountryKeyListingsManagerProps) => {
    const { user } = useUser();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [listings, setListings] = useState<KeyListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
    const [existingLogoPath, setExistingLogoPath] = useState<string | null>(null);
    const [removeExistingLogo, setRemoveExistingLogo] = useState(false);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('country_key_listings')
            .select('id, listing_type, name, description, web_link, logo_url, logo_storage_path, address, telephone, display_order')
            .eq('country_id', countryId)
            .order('listing_type', { ascending: true })
            .order('display_order', { ascending: true })
            .order('name', { ascending: true });
        if (data) setListings(data as KeyListing[]);
        setLoading(false);
    };

    useEffect(() => { load(); }, [countryId]);

    const openNew = () => {
        setEditingId(null);
        setForm(emptyForm());
        setLogoFile(null);
        setExistingLogoUrl(null);
        setExistingLogoPath(null);
        setRemoveExistingLogo(false);
        setDialogOpen(true);
    };

    const openEdit = (item: KeyListing) => {
        setEditingId(item.id);
        setForm({
            listing_type: item.listing_type,
            name: item.name,
            description: item.description || '',
            web_link: item.web_link || '',
            address: item.address || '',
            telephone: item.telephone || '',
        });
        setLogoFile(null);
        setExistingLogoUrl(item.logo_url);
        setExistingLogoPath(item.logo_storage_path);
        setRemoveExistingLogo(false);
        setDialogOpen(true);
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        e.target.value = '';
        if (!file) return;
        if (file.size > KEY_LISTING_LOGO_MAX_BYTES) {
            toast({
                title: 'Logo too large',
                description: 'Please upload a logo under 5 MB.',
                variant: 'destructive',
            });
            return;
        }
        setLogoFile(file);
        setRemoveExistingLogo(false);
    };

    const validate = (): string | null => {
        if (!form.name.trim()) return 'Name is required.';
        if (form.web_link && !/^https:\/\//i.test(form.web_link.trim())) {
            return 'Web link must start with https://.';
        }
        if (countWords(form.description) > KEY_LISTING_DESCRIPTION_MAX_WORDS) {
            return `Description must be ${KEY_LISTING_DESCRIPTION_MAX_WORDS} words or fewer.`;
        }
        return null;
    };

    const handleSave = async () => {
        const error = validate();
        if (error) {
            toast({ title: error, variant: 'destructive' });
            return;
        }
        setSaving(true);
        try {
            let nextLogoUrl: string | null = existingLogoUrl;
            let nextLogoPath: string | null = existingLogoPath;

            if (removeExistingLogo) {
                if (existingLogoPath) {
                    await supabase.storage.from('country-key-listing-logos').remove([existingLogoPath]);
                }
                nextLogoUrl = null;
                nextLogoPath = null;
            }

            if (logoFile) {
                // Delete previous if replacing.
                if (existingLogoPath && existingLogoPath !== nextLogoPath) {
                    await supabase.storage.from('country-key-listing-logos').remove([existingLogoPath]).catch(() => {});
                }
                const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
                const filename = `${crypto.randomUUID()}.${ext}`;
                const path = `${countryId}/${filename}`;
                const { error: uploadErr } = await supabase.storage
                    .from('country-key-listing-logos')
                    .upload(path, logoFile, { contentType: logoFile.type, upsert: false });
                if (uploadErr) throw uploadErr;
                const { data: { publicUrl } } = supabase.storage
                    .from('country-key-listing-logos')
                    .getPublicUrl(path);
                nextLogoUrl = publicUrl;
                nextLogoPath = path;
            }

            const payload = {
                country_id: countryId,
                listing_type: form.listing_type,
                name: form.name.trim(),
                description: form.description.trim() || null,
                web_link: form.web_link.trim() || null,
                address: form.address.trim() || null,
                telephone: form.telephone.trim() || null,
                logo_url: nextLogoUrl,
                logo_storage_path: nextLogoPath,
            };

            if (editingId) {
                const { error: updErr } = await supabase
                    .from('country_key_listings')
                    .update(payload)
                    .eq('id', editingId);
                if (updErr) throw updErr;
                toast({ title: 'Listing updated' });
            } else {
                const sameTypeCount = listings.filter((l) => l.listing_type === form.listing_type).length;
                const { error: insErr } = await supabase
                    .from('country_key_listings')
                    .insert({
                        ...payload,
                        display_order: sameTypeCount,
                        created_by_clerk_id: user?.id ?? null,
                    });
                if (insErr) throw insErr;
                toast({ title: 'Listing added' });
            }

            setDialogOpen(false);
            await load();
        } catch (err: any) {
            console.error(err);
            toast({
                title: 'Save failed',
                description: err?.message || 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item: KeyListing) => {
        if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
        try {
            if (item.logo_storage_path) {
                await supabase.storage.from('country-key-listing-logos').remove([item.logo_storage_path]).catch(() => {});
            }
            const { error } = await supabase
                .from('country_key_listings')
                .delete()
                .eq('id', item.id);
            if (error) throw error;
            toast({ title: 'Listing deleted' });
            await load();
        } catch (err) {
            console.error(err);
            toast({ title: 'Delete failed', variant: 'destructive' });
        }
    };

    const grouped = COUNTRY_KEY_LISTING_TYPES
        .map((type) => ({ type, items: listings.filter((l) => l.listing_type === type) }))
        .filter((g) => g.items.length > 0);

    const descriptionWordCount = countWords(form.description);
    const overWordLimit = descriptionWordCount > KEY_LISTING_DESCRIPTION_MAX_WORDS;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Key Listings — {countryName}</h3>
                    <p className="text-xs text-gray-500">
                        Important institutions: ministries, regulators, agencies, sports federations, charities, NGOs.
                    </p>
                </div>
                <Button onClick={openNew} className="bg-black hover:bg-gray-800 text-white">
                    <Plus size={16} className="mr-2" />
                    Add listing
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : grouped.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center">
                    <p className="text-sm text-gray-600">No key listings yet for {countryName}.</p>
                </div>
            ) : (
                grouped.map(({ type, items }) => (
                    <div key={type}>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            {COUNTRY_KEY_LISTING_TYPE_PLURALS[type]} <span className="text-gray-400">({items.length})</span>
                        </h4>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 bg-white border border-gray-200 rounded p-3"
                                >
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {item.logo_url ? (
                                            <img src={item.logo_url} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 leading-tight">{item.name}</p>
                                        {item.web_link && (
                                            <p className="text-xs text-gray-500 truncate">{item.web_link}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => openEdit(item)}
                                            aria-label="Edit"
                                        >
                                            <Edit size={14} />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(item)}
                                            aria-label="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Key Listing' : 'Add Key Listing'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="kl-type">Type</Label>
                            <Select
                                value={form.listing_type}
                                onValueChange={(v) => setForm({ ...form, listing_type: v as CountryKeyListingType })}
                            >
                                <SelectTrigger id="kl-type" className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRY_KEY_LISTING_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {COUNTRY_KEY_LISTING_TYPE_LABELS[t]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="kl-name">Name *</Label>
                            <Input
                                id="kl-name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1"
                                placeholder="e.g. Ministry of Health"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="kl-desc">Description</Label>
                                <span className={`text-xs ${overWordLimit ? 'text-red-600' : 'text-gray-500'}`}>
                                    {descriptionWordCount} / {KEY_LISTING_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </div>
                            <Textarea
                                id="kl-desc"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="mt-1"
                                rows={4}
                                placeholder="Brief description (max 100 words)"
                            />
                        </div>

                        <div>
                            <Label htmlFor="kl-link">Web link</Label>
                            <Input
                                id="kl-link"
                                value={form.web_link}
                                onChange={(e) => setForm({ ...form, web_link: e.target.value })}
                                className="mt-1"
                                placeholder="https://example.gov"
                                type="url"
                            />
                            <p className="text-xs text-gray-500 mt-1">Must start with https://</p>
                        </div>

                        <div>
                            <Label>Logo</Label>
                            <div className="mt-1 flex items-center gap-3">
                                <div className="w-16 h-16 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logoFile ? (
                                        <img src={URL.createObjectURL(logoFile)} alt="" className="w-full h-full object-contain" />
                                    ) : existingLogoUrl && !removeExistingLogo ? (
                                        <img src={existingLogoUrl} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-7 h-7 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                        onChange={handleLogoFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                            <Upload size={14} className="mr-1" />
                                            {logoFile ? 'Replace logo' : existingLogoUrl ? 'Replace logo' : 'Upload logo'}
                                        </Button>
                                        {(existingLogoUrl || logoFile) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setLogoFile(null);
                                                    setRemoveExistingLogo(true);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">Square icon recommended. JPEG / PNG / WebP / SVG.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="kl-addr">Address</Label>
                                <Input
                                    id="kl-addr"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="mt-1"
                                    placeholder="Street, city"
                                />
                            </div>
                            <div>
                                <Label htmlFor="kl-tel">Telephone</Label>
                                <Input
                                    id="kl-tel"
                                    value={form.telephone}
                                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                    className="mt-1"
                                    placeholder="+250 …"
                                    type="tel"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-black hover:bg-gray-800 text-white">
                            {saving && <Loader2 size={14} className="animate-spin mr-2" />}
                            {editingId ? 'Save changes' : 'Add listing'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CountryKeyListingsManager;
