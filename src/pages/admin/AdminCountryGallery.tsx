import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountryGalleryManager } from '@/components/admin/CountryGalleryManager';
import { supabase } from '@/lib/supabase';

interface Country {
    id: string;
    name: string;
    code: string;
    flag_emoji: string | null;
}

export const AdminCountryGallery = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountryId, setSelectedCountryId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('countries')
                .select('id, name, code, flag_emoji')
                .order('name', { ascending: true });
            if (data) setCountries(data as Country[]);
            setLoading(false);
        };
        load();
    }, []);

    const selected = countries.find((c) => c.id === selectedCountryId) || null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <AdminPageGuide
                    title="BARA Global — Country Gallery"
                    description="Upload, reorder, and caption photos for each country page. Photos auto-resize and compress in the browser before upload. Public read; only admins can write."
                    features={[
                        'Per-country galleries — pick a country, upload its photos.',
                        'Client-side resize to 1920px on longest side; JPEG compression aiming for ~500 KB.',
                        'Hard 5 MB limit per file (oversized files are skipped with a toast).',
                        'Captions are optional. Reorder with the up/down arrows. Delete removes the row and the storage object.',
                        'Stored in the country-gallery Supabase Storage bucket; one folder per country (path country-gallery/{countryId}/{uuid}.jpg).',
                    ]}
                    workflow={[
                        'Pick a country from the dropdown.',
                        'Click "Upload photos" and select one or many image files.',
                        'Each upload is compressed in your browser, then uploaded and recorded.',
                        'Click into a caption field and tab/blur to save.',
                        'Use the up/down arrows to reorder. Use the trash icon to delete.',
                    ]}
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Country Gallery</h1>
                        <p className="text-gray-600">Manage per-country photo galleries shown on the public country pages.</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <Label htmlFor="country-select">Pick a country</Label>
                        <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                            <SelectTrigger id="country-select" className="mt-2 max-w-md" disabled={loading}>
                                <SelectValue placeholder={loading ? 'Loading countries…' : 'Select a country'} />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.flag_emoji ? `${c.flag_emoji} ` : ''}{c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selected && (
                    <Card>
                        <CardContent className="p-6">
                            <CountryGalleryManager
                                countryId={selected.id}
                                countryName={selected.name}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCountryGallery;
