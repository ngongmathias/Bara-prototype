import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { COUNTRIES } from '@/data/countries';
import {
    VerificationService,
    REQUIRED_DOCS,
    VerificationAccountType,
    VerificationRequestSummary,
} from '@/lib/verificationService';
import { ShieldCheck, Upload, X, Loader2, CheckCircle, Clock, FileText } from 'lucide-react';

/**
 * 27.8.2 — user-facing verification form for businesses & artists.
 * Fields + documents go to an admin review queue; approval grants the
 * verified badge the UI already renders.
 */
export default function VerifyAccountPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [accountType, setAccountType] = useState<VerificationAccountType>('business');
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState<VerificationRequestSummary[]>([]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            navigate(`/user/sign-in?redirect_url=${encodeURIComponent('/verify-account')}`);
            return;
        }
        if (user?.id) {
            VerificationService.myRequests(user.id).then(setRequests);
            setContactEmail(user.primaryEmailAddress?.emailAddress || '');
        }
    }, [isLoaded, isSignedIn, user?.id]);

    const existing = requests.find((r) => r.account_type === accountType);

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid = selected.filter((f) => {
            if (f.size > 20 * 1024 * 1024) {
                toast({ title: 'File too large', description: `${f.name} is over 20MB.`, variant: 'destructive' });
                return false;
            }
            return true;
        });
        setFiles((prev) => [...prev, ...valid].slice(0, 6));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        if (!name.trim()) return toast({ title: 'Missing name', description: accountType === 'business' ? 'Please enter your legal/business name.' : 'Please enter your artist name.', variant: 'destructive' });
        if (!country) return toast({ title: 'Missing country', description: 'Please select your country.', variant: 'destructive' });
        if (!contactEmail.trim() && !contactPhone.trim()) return toast({ title: 'Missing contact', description: 'Please provide an email or phone number.', variant: 'destructive' });
        if (files.length === 0) return toast({ title: 'Documents required', description: 'Please upload at least one supporting document.', variant: 'destructive' });

        setSubmitting(true);
        try {
            const docPaths: string[] = [];
            for (const file of files) {
                docPaths.push(await VerificationService.uploadDoc(user.id, file));
            }
            const result = await VerificationService.submit(user.id, accountType, {
                name: name.trim(),
                country,
                contact_email: contactEmail.trim() || null,
                contact_phone: contactPhone.trim() || null,
                website: website.trim() || null,
                notes: notes.trim() || null,
            }, docPaths);

            if (result.success) {
                toast({ title: 'Request submitted!', description: 'Our team will review your documents and get back to you.' });
                setFiles([]);
                setName('');
                setNotes('');
                VerificationService.myRequests(user.id).then(setRequests);
            } else {
                const msg = result.error === 'already_pending' ? 'You already have a pending request for this account type.'
                    : result.error === 'already_verified' ? 'This account type is already verified.'
                    : 'Could not submit your request. Please try again.';
                toast({ title: 'Not submitted', description: msg, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Upload failed', description: error?.message || 'Could not upload your documents.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-900 focus:ring-gray-900';

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO title="Get Verified | BARA Afrika" description="Verify your business or artist account on BARA Afrika." />
            <Header />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-full mb-4">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-comfortaa mb-2">Get verified</h1>
                    <p className="text-gray-600">
                        A verified badge tells buyers and listeners your account is the real thing.
                        Submit your details and documents — our team reviews every request by hand.
                    </p>
                </div>

                {/* Existing request status */}
                {requests.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {requests.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                                {r.status === 'approved' ? <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0" />
                                    : r.status === 'pending' ? <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    : <X className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-gray-900 capitalize">
                                        {r.account_type} verification — {r.status === 'approved' ? 'Verified' : r.status}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Submitted {new Date(r.created_at).toLocaleDateString()}
                                        {r.status === 'rejected' && r.reviewer_notes ? ` — ${r.reviewer_notes}` : ''}
                                        {r.status === 'rejected' ? ' You can submit a new request below.' : ''}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                    {/* Account type */}
                    <div>
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2 block">I'm verifying a…</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['business', 'artist'] as VerificationAccountType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setAccountType(t)}
                                    className={`py-3 rounded-xl font-bold text-sm capitalize border-2 transition-colors ${
                                        accountType === t ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            {accountType === 'business' ? 'Legal / business name *' : 'Artist name *'}
                        </Label>
                        <Input className={inputCls} value={name} onChange={(e) => setName(e.target.value)}
                            placeholder={accountType === 'business' ? 'e.g. Bara Trading Ltd' : 'e.g. Maj theGeezer'} />
                    </div>

                    <div>
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Country *</Label>
                        <select
                            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none h-10"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                            <option value="" disabled>Select…</option>
                            {[...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                                <option key={c.iso2} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Contact email</Label>
                            <Input className={inputCls} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Contact phone</Label>
                            <Input className={inputCls} type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+250 712 345 678" />
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Website or social link (optional)</Label>
                        <Input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
                    </div>

                    {/* Documents */}
                    <div>
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2 block">Supporting documents *</Label>
                        <ul className="text-xs text-gray-500 space-y-1 mb-3 list-disc pl-4">
                            {REQUIRED_DOCS[accountType].map((d) => <li key={d}>{d}</li>)}
                        </ul>
                        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFilesSelect} />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 hover:border-gray-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50"
                        >
                            <Upload className="mx-auto mb-2 text-gray-500" size={24} />
                            <p className="text-sm font-bold text-gray-900">Click to add documents</p>
                            <p className="text-xs text-gray-500">JPG, PNG or PDF — up to 20MB each, max 6 files</p>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {files.map((f, i) => (
                                    <div key={`${f.name}_${i}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm text-gray-700 truncate">
                                            <FileText size={14} className="flex-shrink-0" /> {f.name}
                                        </span>
                                        <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-gray-900 flex-shrink-0">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Anything else we should know? (optional)</Label>
                        <textarea
                            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none min-h-[80px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                        Your documents are stored privately and only visible to the BARA Afrika review team.
                    </p>

                    <Button
                        type="submit"
                        disabled={submitting || existing?.status === 'pending' || existing?.status === 'approved'}
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-black rounded-xl disabled:opacity-50"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Uploading…</span>
                        ) : existing?.status === 'pending' ? 'Request pending review' : existing?.status === 'approved' ? 'Already verified' : 'Submit for review'}
                    </Button>
                </form>
            </main>

            <Footer />
        </div>
    );
}
