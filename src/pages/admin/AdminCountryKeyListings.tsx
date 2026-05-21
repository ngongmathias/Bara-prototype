import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountryKeyListingsManager } from '@/components/admin/CountryKeyListingsManager';
import { supabase } from '@/lib/supabase';

interface Country {
    id: string;
    name: string;
    code: string;
    flag_emoji: string | null;
}

export const AdminCountryKeyListings = () => {
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
                    title="BARA Global — Country Key Listings"
                    description="Curate the directory of important institutions per country page: ministries, regulators, agencies, sports federations, charities, NGOs."
                    features={[
                        'Per-country directory grouped by 6 institution types.',
                        'Each entry: name, ≤100-word description (counter enforced), https web link, address, telephone, square icon logo (≤5 MB).',
                        'Logos stored in country-key-listing-logos bucket. Public read; only admins can write.',
                        'Public page renders entries grouped by type; section is hidden when a country has no listings.',
                    ]}
                    workflow={[
                        'Pick a country.',
                        'Click "Add listing", choose type, fill in name (required) and other fields.',
                        'Optionally upload a logo (square recommended, ≤5 MB).',
                        'Save. Use the edit/delete buttons on existing entries.',
                    ]}
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Country Key Listings</h1>
                        <p className="text-gray-600">Manage per-country institutional directory shown on the public country pages.</p>
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
                            <CountryKeyListingsManager
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

export default AdminCountryKeyListings;
