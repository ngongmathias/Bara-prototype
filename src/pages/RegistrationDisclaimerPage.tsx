import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, UserCheck, Shield, Bell, AlertTriangle } from 'lucide-react';

// 28.6 — Registration Disclaimer, linked from the sign-up forms.
const RegistrationDisclaimerPage = () => {
    const lastUpdated = 'July 7, 2026';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
                        <UserCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 font-comfortaa">Registration Disclaimer</h1>
                    <p className="text-gray-500">Last updated: {lastUpdated}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <UserCheck className="h-5 w-5 text-gray-900" /> 1. Creating an Account
                        </h2>
                        <p className="mb-3">By registering on BARA Afrika you confirm that:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You are at least <strong>13 years old</strong> (or the minimum digital-consent age in your country, if higher);</li>
                            <li>The information you provide — name, date of birth, gender, country, phone number and email — is <strong>accurate and yours</strong>;</li>
                            <li>You are creating the account for yourself, not on behalf of another person without their consent;</li>
                            <li>You will keep your login credentials confidential and are responsible for all activity on your account.</li>
                        </ul>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-gray-900" /> 2. How Your Data Is Used
                        </h2>
                        <p>
                            The details collected at registration are used to create and secure your account,
                            personalise your experience (for example your country's content), enable platform
                            features such as messaging, rewards and verification, and meet our legal obligations.
                            Full detail — including retention periods and your rights — is in our{' '}
                            <a href="/privacy" className="font-semibold text-gray-900 underline">Privacy Policy</a>.
                            We never sell your personal data.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-gray-900" /> 3. Communications
                        </h2>
                        <p>
                            We send transactional emails you cannot opt out of (account security, purchase and
                            moderation notices). Non-essential emails — like weekly recaps — are optional and can
                            be switched off in your settings at any time.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-gray-900" /> 4. Rewards Are Not Money
                        </h2>
                        <p>
                            Your account includes BARA Coins and XP, earned through activity on the platform.
                            These are rewards inside BARA Afrika only: they have <strong>no cash value</strong>, cannot be
                            withdrawn or exchanged for money, and may be adjusted or removed if earned through
                            abuse or in error. See{' '}
                            <a href="/coins-and-xp" className="font-semibold text-gray-900 underline">How Coins &amp; XP work</a>{' '}
                            and <a href="/definitions" className="font-semibold text-gray-900 underline">Important Definitions</a>.
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-gray-900" /> 5. Suspension & Termination
                        </h2>
                        <p>
                            Accounts registered with false information, used to impersonate others, or used to
                            abuse the platform (including its rewards economy) may be suspended or terminated.
                            You may delete your account at any time.
                        </p>
                    </section>

                    <hr />

                    <p className="text-sm text-gray-500">
                        Registering constitutes acceptance of this disclaimer together with our{' '}
                        <a href="/terms" className="font-semibold text-gray-900 underline">Terms of Service</a> and{' '}
                        <a href="/privacy" className="font-semibold text-gray-900 underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RegistrationDisclaimerPage;
