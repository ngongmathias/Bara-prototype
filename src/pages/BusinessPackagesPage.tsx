import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Check, Loader2, Megaphone } from 'lucide-react';

interface Package {
    id: string;
    name: string;
    description: string | null;
    price_usd: number;
    period: 'month' | 'year' | 'one_time';
    features: string[];
    sort_order: number;
}

const periodLabel = (p: Package['period']) => (p === 'month' ? '/month' : p === 'year' ? '/year' : ' one-time');

/**
 * 27.8.4 — public business packages page. Payments aren't integrated yet
 * (Phase 15), so the CTA creates a pending_payment subscription, notifies
 * the admins, and the team completes the sale manually.
 */
export default function BusinessPackagesPage() {
    const { user, isSignedIn } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState<string | null>(null);
    const [mySubs, setMySubs] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from('business_packages')
                .select('*')
                .eq('active', true)
                .order('sort_order');
            setPackages(((data || []) as any[]).map((p) => ({ ...p, features: Array.isArray(p.features) ? p.features : [] })));
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        supabase
            .from('business_package_subscriptions')
            .select('package_id, status')
            .eq('clerk_user_id', user.id)
            .in('status', ['pending_payment', 'active'])
            .then(({ data }) => {
                const map: Record<string, string> = {};
                (data || []).forEach((s: any) => { map[s.package_id] = s.status; });
                setMySubs(map);
            });
    }, [user?.id]);

    const request = async (pkg: Package) => {
        if (!isSignedIn || !user) {
            navigate(`/user/sign-in?redirect_url=${encodeURIComponent('/packages')}`);
            return;
        }
        setRequesting(pkg.id);
        try {
            const { data, error } = await supabase.rpc('business_package_subscribe', {
                p_user_id: user.id,
                p_package_id: pkg.id,
                p_contact_email: user.primaryEmailAddress?.emailAddress || null,
                p_contact_phone: null,
                p_note: null,
            });
            if (error) throw error;
            const r = data as any;
            if (r?.success) {
                setMySubs((prev) => ({ ...prev, [pkg.id]: 'pending_payment' }));
                toast({
                    title: 'Request received!',
                    description: 'Our team will contact you shortly to complete payment and activate your package.',
                });
            } else if (r?.error === 'already_subscribed') {
                toast({ title: 'Already requested', description: 'You already have this package requested or active.' });
            } else {
                toast({ title: 'Could not send request', description: 'Please try again.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Could not send request', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setRequesting(null);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Business Packages | BARA Afrika"
                description="Business packages on BARA Afrika — ad quotas, featured placement and storefront promotion."
            />
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-full mb-4">
                        <Megaphone className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-3">Business packages</h1>
                    <p className="text-lg text-gray-600 font-roboto max-w-2xl mx-auto">
                        Put your business in front of the BARA Afrika community — ad quotas, featured placement
                        and storefront promotion. Pick a package and our team handles the rest.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
                ) : packages.length === 0 ? (
                    <div className="text-center text-gray-400 italic py-16">
                        Packages are being finalized — check back soon or contact hello@baraafrika.com.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg, idx) => {
                            const highlighted = idx === 1 && packages.length >= 3;
                            const subStatus = mySubs[pkg.id];
                            return (
                                <div
                                    key={pkg.id}
                                    className={`rounded-2xl p-6 flex flex-col border-2 ${
                                        highlighted ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-200'
                                    }`}
                                >
                                    <h2 className="text-xl font-black font-comfortaa mb-1">{pkg.name}</h2>
                                    {pkg.description && (
                                        <p className={`text-sm mb-4 ${highlighted ? 'text-gray-300' : 'text-gray-500'}`}>{pkg.description}</p>
                                    )}
                                    <div className="mb-5">
                                        <span className="text-4xl font-black">${Number(pkg.price_usd).toFixed(0)}</span>
                                        <span className={`text-sm font-bold ${highlighted ? 'text-gray-400' : 'text-gray-500'}`}>{periodLabel(pkg.period)}</span>
                                    </div>
                                    <ul className="space-y-2.5 mb-6 flex-1">
                                        {pkg.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2 text-sm">
                                                <Check size={15} className={`mt-0.5 flex-shrink-0 ${highlighted ? 'text-white' : 'text-gray-900'}`} />
                                                <span className={highlighted ? 'text-gray-200' : 'text-gray-700'}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        onClick={() => request(pkg)}
                                        disabled={requesting === pkg.id || !!subStatus}
                                        className={`w-full h-11 font-black rounded-xl ${
                                            highlighted
                                                ? 'bg-white text-gray-900 hover:bg-gray-100'
                                                : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {requesting === pkg.id ? <Loader2 className="animate-spin" size={16} />
                                            : subStatus === 'active' ? 'Active'
                                            : subStatus === 'pending_payment' ? 'Requested — we’ll be in touch'
                                            : 'Get this package'}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-10 max-w-xl mx-auto">
                    Online payment is coming soon. For now, requesting a package sends your details to our team —
                    we'll contact you to complete payment and activate it manually.
                </p>
            </main>

            <Footer />
        </div>
    );
}
