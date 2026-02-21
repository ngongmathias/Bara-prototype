import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Mic2, Bell } from 'lucide-react';
import { useState } from 'react';

export default function PodcastsPage() {
    const [notifyEmail, setNotifyEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would call an API to save the email
        setSubmitted(true);
    };

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-[#121212] flex items-center justify-center p-8 pb-24">
                <div className="max-w-lg w-full text-center">
                    {/* Icon */}
                    <div className="relative mx-auto w-32 h-32 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                <Mic2 size={48} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
                        Podcasts
                    </h1>
                    <p className="text-xl text-gray-400 mb-2 font-medium">
                        Coming Soon
                    </p>
                    <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
                        We're building an incredible podcast experience featuring African stories,
                        tech talks, comedy, and more. Stay tuned for the launch!
                    </p>

                    {/* Categories Preview */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {['African Stories', 'True Crime', 'Comedy', 'Tech', 'Finance', 'Sports', 'Music News', 'Self-Improvement'].map((cat) => (
                            <span
                                key={cat}
                                className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full border border-white/5"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>

                    {/* Notify Me Form */}
                    {!submitted ? (
                        <form onSubmit={handleNotify} className="flex gap-2 max-w-sm mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                required
                                className="flex-1 bg-[#242424] text-white py-3 px-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                            >
                                <Bell size={16} />
                                Notify Me
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 max-w-sm mx-auto">
                            <p className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
                                <Bell size={16} />
                                You'll be notified when Podcasts launches!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </StreamsLayout>
    );
}
