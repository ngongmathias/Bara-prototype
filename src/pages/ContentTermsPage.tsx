import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, Shield, Scale, Mail, AlertTriangle } from 'lucide-react';

// 27.8.8 — Content Terms for music (and other creator) uploads. Linked from
// the rights-declaration checkbox on the song/album upload flows.
const ContentTermsPage = () => {
    const lastUpdated = 'July 6, 2026';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 font-comfortaa">Content Terms</h1>
                    <p className="text-gray-500">Last updated: {lastUpdated}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-gray-900" /> 1. Ownership Warranty
                        </h2>
                        <p className="mb-3">
                            By uploading music, albums, or any other creative content to BARA Afrika, you represent and
                            warrant that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You own all rights to the content, <strong>or</strong> you hold a valid license from the rights holder(s) to distribute it;</li>
                            <li>The content does not infringe any copyright, trademark, performer's right, or other intellectual-property right of any third party;</li>
                            <li>All featured artists, producers, songwriters, and other contributors you credit have consented to the upload;</li>
                            <li>Any samples, beats, or interpolations used in the content are properly cleared or licensed.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Scale className="h-5 w-5 text-gray-900" /> 2. License You Grant to BARA Afrika
                        </h2>
                        <p>
                            You retain full ownership of your content. By uploading, you grant BARA Afrika a
                            non-exclusive, worldwide, royalty-free license to host, store, reproduce, stream, and
                            display the content on the platform, and to generate previews, thumbnails, and other
                            derivative assets needed to operate the service (for example cover-art resizing or
                            audio previews). This license ends when you delete the content from the platform,
                            except for copies already cached or shared by other users under platform features.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-gray-900" /> 3. Liability for Infringement
                        </h2>
                        <p>
                            You are solely responsible for the content you upload. If a third party claims the
                            content infringes their rights, you agree to indemnify BARA Afrika against losses
                            arising from that claim. Uploading infringing content may lead to removal of the
                            content, suspension of your creator privileges, or termination of your account —
                            and repeat infringers will be permanently banned.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-gray-900" /> 4. Takedown Requests
                        </h2>
                        <p>
                            If you believe content on BARA Afrika infringes your rights, email{' '}
                            <a href="mailto:hello@baraafrika.com" className="font-semibold text-gray-900 underline">
                                hello@baraafrika.com
                            </a>{' '}
                            with (a) the URL of the content, (b) proof of your ownership or authority, and (c) your
                            contact details. We review takedown requests promptly and will remove content that is
                            shown to infringe.
                        </p>
                    </section>

                    <hr />

                    <p className="text-sm text-gray-500">
                        These Content Terms supplement our{' '}
                        <a href="/terms" className="font-semibold text-gray-900 underline">Terms of Service</a>. If the
                        two conflict for uploaded content, these Content Terms control.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ContentTermsPage;
