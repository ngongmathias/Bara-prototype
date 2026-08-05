import { useState } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Matches /streams/song/:id, /streams/album/:id, /streams/artist/:id,
// /streams/playlist/:id — the entity types content_reports understands.
function parseContentUrl(url: string): { entityType: string; entityId: string } | null {
    const match = url.match(/\/streams\/(song|album|artist|playlist)\/([a-f0-9-]{36})/i);
    if (!match) return null;
    return { entityType: match[1].toLowerCase(), entityId: match[2] };
}

/**
 * §F2 — public, no-login copyright/DMCA claim form. Feeds the same
 * content_reports queue as the in-app Report action (§F1), category fixed
 * to 'copyright' and always anonymous (reporter_email only, no user id).
 */
export default function DMCAPage() {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !description.trim()) {
            toast({ title: 'Missing fields', description: 'Please fill in your name, email, and a description.', variant: 'destructive' });
            return;
        }
        const parsed = parseContentUrl(contentUrl.trim());
        if (!parsed) {
            toast({
                title: "Couldn't find that content",
                description: 'Paste the full Bara Streams link to the song, album, artist, or playlist (e.g. https://bara.africa/streams/song/...).',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase.rpc('content_report_submit', {
                p_entity_type: parsed.entityType,
                p_entity_id: parsed.entityId,
                p_category: 'copyright',
                p_description: `Claimant: ${name.trim()}\n\n${description.trim()}`,
                p_reporter_email: email.trim(),
            });
            const result = data as { success: boolean; error?: string };
            if (error || !result?.success) throw new Error(result?.error || error?.message || 'Failed to submit claim');
            setSubmitted(true);
        } catch (err: any) {
            toast({ title: "Couldn't submit claim", description: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="DMCA / Copyright Claim | Bara Afrika"
                description="File a copyright infringement claim for content on Bara Afrika Streams. No account required."
            />
            <Header />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <ShieldAlert className="w-4 h-4" /> Copyright / DMCA
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-comfortaa mb-3">
                        File a copyright claim
                    </h1>
                    <p className="text-gray-600">
                        If you believe content on Bara Afrika Streams infringes your copyright, tell us here — no account
                        needed. See our <Link to="/streams/guidelines" className="underline font-bold text-gray-900">content guidelines</Link> for what we allow.
                        For anything else, use the in-app <span className="font-bold">Report</span> button instead.
                    </p>
                </div>

                {submitted ? (
                    <div className="border-2 border-gray-900 rounded-2xl p-8 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto text-gray-900 mb-4" />
                        <h2 className="text-xl font-black text-gray-900 mb-2">Claim submitted</h2>
                        <p className="text-gray-600">
                            We've received your claim and will review it. We'll follow up at {email} if we need more information.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Your name</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Link to the content</Label>
                            <Input
                                value={contentUrl}
                                onChange={(e) => setContentUrl(e.target.value)}
                                placeholder="https://.../streams/song/..."
                                className="h-12"
                            />
                            <p className="text-xs text-gray-500">Paste the Bara Streams link to the song, album, artist, or playlist.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Describe the infringement</Label>
                            <textarea
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 min-h-[120px] resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's the work being infringed, and how do you hold the rights to it?"
                            />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full py-6 bg-gray-900 text-white font-black text-base rounded-xl hover:bg-black">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Submit claim
                        </Button>
                    </form>
                )}
            </main>

            <Footer />
        </div>
    );
}
