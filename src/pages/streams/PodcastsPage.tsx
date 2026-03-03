import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Mic2, Bell, Play, Clock, Headphones } from 'lucide-react';
import { useState } from 'react';

const SAMPLE_PODCASTS = [
    { title: 'The African Dream', host: 'Amara Kone', category: 'Entrepreneurship', color: 'from-amber-600 to-orange-700', episodes: 48, desc: 'Stories of founders building across the continent' },
    { title: 'Naija Tech Talk', host: 'Tunde Obi', category: 'Technology', color: 'from-blue-600 to-cyan-700', episodes: 112, desc: 'Africa\'s tech ecosystem — startups, funding & innovation' },
    { title: 'Ubuntu Conversations', host: 'Thabo Mokoena', category: 'Culture', color: 'from-green-600 to-emerald-700', episodes: 67, desc: 'Pan-African dialogues on identity, culture & unity' },
    { title: 'Accra After Dark', host: 'Ama Serwaa', category: 'True Crime', color: 'from-red-700 to-rose-800', episodes: 31, desc: 'Mysteries and untold stories from West Africa' },
    { title: 'Laugh Out Loud Africa', host: 'Basket Mouth & Friends', category: 'Comedy', color: 'from-yellow-500 to-amber-600', episodes: 85, desc: 'The funniest comedians on the continent' },
    { title: 'The Pitch Room', host: 'Keza Ngowi', category: 'Finance', color: 'from-purple-600 to-violet-700', episodes: 56, desc: 'Investment, wealth & personal finance for Africans' },
];

export default function PodcastsPage() {
    const [notifyEmail, setNotifyEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <StreamsLayout>
            <div className="min-h-screen bg-[#121212] pb-24">
                {/* Hero */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-[#121212]" />
                    <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                    <Mic2 size={36} className="text-white" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                            Bara Podcasts
                        </h1>
                        <p className="text-lg text-purple-300 mb-1 font-semibold">
                            Coming Soon
                        </p>
                        <p className="text-gray-400 mb-6 leading-relaxed max-w-lg mx-auto">
                            Africa's stories deserve to be heard. We're building a podcast platform featuring the best voices
                            from across the continent — entrepreneurs, comedians, storytellers, and thought leaders.
                        </p>

                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {['African Stories', 'True Crime', 'Comedy', 'Tech', 'Finance', 'Sports', 'Music News', 'Self-Improvement'].map((cat) => (
                                <span key={cat} className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full border border-white/5">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Notify Me */}
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
                                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2">
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

                {/* Preview: What's Coming */}
                <div className="max-w-4xl mx-auto px-6 mt-4">
                    <h2 className="text-xl font-bold text-white mb-1">Preview: What's Coming</h2>
                    <p className="text-gray-500 text-sm mb-6">Here's a taste of the podcasts we're lining up</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SAMPLE_PODCASTS.map((pod) => (
                            <div key={pod.title} className="bg-[#181818] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition group">
                                <div className={`h-28 bg-gradient-to-br ${pod.color} flex items-center justify-center relative`}>
                                    <Mic2 size={40} className="text-white/30" />
                                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <Play size={16} className="text-white ml-0.5" fill="white" />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{pod.category}</span>
                                    <h3 className="text-white font-bold text-sm mt-1 leading-tight">{pod.title}</h3>
                                    <p className="text-gray-500 text-xs mt-1">{pod.host}</p>
                                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">{pod.desc}</p>
                                    <div className="flex items-center gap-3 mt-3 text-gray-600 text-xs">
                                        <span className="flex items-center gap-1"><Headphones size={12} />{pod.episodes} episodes</span>
                                        <span className="flex items-center gap-1"><Clock size={12} />30-60 min</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it will work */}
                <div className="max-w-4xl mx-auto px-6 mt-12">
                    <h2 className="text-xl font-bold text-white mb-6">How Bara Podcasts Will Work</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { step: '1', title: 'Discover', desc: 'Browse podcasts by category, trending topics, or recommendations tailored to your interests.' },
                            { step: '2', title: 'Listen & Follow', desc: 'Stream episodes on-demand, follow your favourite shows, and get notified when new episodes drop.' },
                            { step: '3', title: 'Earn & Share', desc: 'Earn XP and coins for listening, share episodes with friends, and unlock achievements.' },
                        ].map((item) => (
                            <div key={item.step} className="bg-[#181818] rounded-xl p-5 border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 font-black text-sm flex items-center justify-center mb-3">
                                    {item.step}
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StreamsLayout>
    );
}
