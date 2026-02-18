import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Eye, Database, Lock, Globe, UserCheck, Mail, Settings } from 'lucide-react';

const PrivacyPolicyPage = () => {
    const lastUpdated = 'February 18, 2026';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: {lastUpdated}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Eye className="h-5 w-5 text-green-600" /> 1. Information We Collect
                        </h2>
                        <p className="mb-3">We collect information in several ways:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Name, email address, profile photo provided during sign-up via Clerk authentication.</li>
                            <li><strong>Content You Create:</strong> Events, listings, reviews, and other content you post on the Platform.</li>
                            <li><strong>Transaction Data:</strong> Ticket registrations, payment confirmations, and related booking information.</li>
                            <li><strong>Usage Data:</strong> Pages visited, search queries, interactions with features, and device information.</li>
                            <li><strong>Location Data:</strong> Country and city preferences you select; we do not track precise GPS location.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Database className="h-5 w-5 text-green-600" /> 2. How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide, maintain, and improve the Platform</li>
                            <li>To process event registrations and ticket purchases</li>
                            <li>To send transactional emails (registration confirmations, welcome emails)</li>
                            <li>To display relevant events, listings, and content based on your location preferences</li>
                            <li>To enforce our Terms of Service and protect user safety</li>
                            <li>To communicate important updates about the Platform</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Lock className="h-5 w-5 text-green-600" /> 3. Data Security
                        </h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-3">
                            <li>Encrypted data transmission (HTTPS/TLS)</li>
                            <li>Row Level Security (RLS) policies on our database ensuring users can only access their own data</li>
                            <li>Authentication handled by Clerk, a SOC 2 Type II certified provider</li>
                            <li>Regular security reviews and updates</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Globe className="h-5 w-5 text-green-600" /> 4. Data Sharing
                        </h2>
                        <p className="mb-3">We do not sell your personal information. We may share data with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Event Organizers:</strong> Your name and email when you register for their events.</li>
                            <li><strong>Service Providers:</strong> Supabase (database hosting), Clerk (authentication), and email services — only as needed to operate the Platform.</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <UserCheck className="h-5 w-5 text-green-600" /> 5. Your Rights
                        </h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Rectification:</strong> Update or correct your information via your profile settings</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                            <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                        </ul>
                        <p className="mt-3">
                            To exercise these rights, contact us at{' '}
                            <a href="mailto:privacy@baraafrika.com" className="text-green-600 hover:underline">
                                privacy@baraafrika.com
                            </a>.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Settings className="h-5 w-5 text-green-600" /> 6. Cookies & Tracking
                        </h2>
                        <p>
                            We use essential cookies for authentication and session management. We do not use
                            third-party advertising cookies. Analytics cookies are used to understand how
                            users interact with the Platform and to improve the user experience. You can manage
                            cookie preferences through your browser settings.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-green-600" /> 7. Children's Privacy
                        </h2>
                        <p>
                            The Platform is not intended for users under 13 years of age. We do not knowingly
                            collect information from children under 13. If we become aware that we have collected
                            such information, we will take steps to delete it.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-green-600" /> 8. Contact Us
                        </h2>
                        <p>
                            For privacy-related inquiries, contact our Data Protection team at{' '}
                            <a href="mailto:privacy@baraafrika.com" className="text-green-600 hover:underline">
                                privacy@baraafrika.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
