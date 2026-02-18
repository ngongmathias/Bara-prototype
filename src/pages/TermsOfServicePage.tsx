import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, FileText, Users, Globe, AlertTriangle, Scale, Mail } from 'lucide-react';

const TermsOfServicePage = () => {
    const lastUpdated = 'February 18, 2026';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                    <p className="text-gray-500">Last updated: {lastUpdated}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-blue-600" /> 1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using Bara Afrika ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the Platform. We reserve the right to update
                            these terms at any time, and your continued use constitutes acceptance of any changes.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-blue-600" /> 2. User Accounts
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must provide accurate and complete information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You must be at least 13 years old to use the Platform.</li>
                            <li>You agree not to create multiple accounts for fraudulent purposes.</li>
                            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Globe className="h-5 w-5 text-blue-600" /> 3. Use of the Platform
                        </h2>
                        <p className="mb-3">You agree to use the Platform only for lawful purposes. You may not:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Post false, misleading, or fraudulent content</li>
                            <li>Upload harmful, offensive, or illegal material</li>
                            <li>Attempt to gain unauthorized access to other users' accounts</li>
                            <li>Use automated tools to scrape or extract data from the Platform</li>
                            <li>Interfere with the proper functioning of the Platform</li>
                            <li>Use the Platform to spam or harass other users</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-blue-600" /> 4. Content & Listings
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You retain ownership of content you post, but grant Bara Afrika a non-exclusive license to display and distribute it on the Platform.</li>
                            <li>Event organizers are responsible for the accuracy of their event information.</li>
                            <li>Business listings must represent real, operating businesses.</li>
                            <li>Marketplace listings must accurately describe the items or services offered.</li>
                            <li>We reserve the right to remove content that violates these terms or applicable laws.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Scale className="h-5 w-5 text-blue-600" /> 5. Payments & Transactions
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Ticket purchases and payment arrangements are between the buyer and the event organizer.</li>
                            <li>Bara Afrika facilitates the connection but is not a party to transactions between users.</li>
                            <li>Refund policies are determined by individual event organizers.</li>
                            <li>For manual payments (mobile money, bank transfers), users must follow the organizer's instructions.</li>
                            <li>Bara Afrika is not liable for disputes between buyers and sellers.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-blue-600" /> 6. Limitation of Liability
                        </h2>
                        <p>
                            The Platform is provided "as is" without warranties of any kind. Bara Afrika shall not be liable for
                            any indirect, incidental, special, or consequential damages arising from your use of the Platform.
                            Our total liability shall not exceed the amount you have paid to Bara Afrika in the twelve (12) months
                            preceding the claim.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-blue-600" /> 7. Intellectual Property
                        </h2>
                        <p>
                            The Bara Afrika name, logo, and all related trademarks are the property of Bara Afrika.
                            You may not use our intellectual property without prior written consent. The Platform's design,
                            features, and functionalities are protected by copyright and other intellectual property laws.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-blue-600" /> 8. Contact Us
                        </h2>
                        <p>
                            If you have questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:support@baraafrika.com" className="text-blue-600 hover:underline">
                                support@baraafrika.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsOfServicePage;
