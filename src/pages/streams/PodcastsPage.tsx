import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Mic2, Bell, Play, Clock, Headphones, Pause, Loader2, Users, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { DiscoverMore } from '@/components/DiscoverMore';

const FALLBACK_PODCASTS = [
    { id: '1', title: 'The African Dream', host: 'Amara Kone', category: 'Entrepreneurship', cover_url: '', subscriber_count: 12400, description: 'Stories of founders building across the continent' },
    { id: '2', title: 'Naija Tech Talk', host: 'Tunde Obi', category: 'Technology', cover_url: '', subscriber_count: 8900, description: "Africa's tech ecosystem — startups, funding & innovation" },
    { id: '3', title: 'Ubuntu Conversations', host: 'Thabo Mokoena', category: 'Culture', cover_url: '', subscriber_count: 6700, description: 'Pan-African dialogues on identity, culture & unity' },
    { id: '4', title: 'Accra After Dark', host: 'Ama Serwaa', category: 'True Crime', cover_url: '', subscriber_count: 15200, description: 'Mysteries and untold stories from West Africa' },
    { id: '5', title: 'Laugh Out Loud Africa', host: 'Basket Mouth & Friends', category: 'Comedy', cover_url: '', subscriber_count: 21000, description: 'The funniest comedians on the continent' },
    { id: '6', title: 'The Pitch Room', host: 'Keza Ngowi', category: 'Finance', cover_url: '', subscriber_count: 9800, description: 'Investment, wealth & personal finance for Africans' },
];

const CATEGORY_COLORS: Record<string, string> = {
    'Entrepreneurship': 'from-gray-700 to-gray-900',
    'Technology': 'from-gray-600 to-gray-800',
    'Culture': 'from-gray-800 to-black',
    'True Crime': 'from-gray-700 to-gray-900',
    'Comedy': 'from-gray-500 to-gray-700',
    'Finance': 'from-gray-600 to-gray-800',
};

interface Podcast {
    id: string;
    title: string;
    host: string;
    description: string;
    category: string;
    cover_url: string;
    subscriber_count: number;
    is_featured?: boolean;
    created_at?: string;
}

interface Episode {
    id: string;
    podcast_id: string;
    title: string;
    description: string;
    audio_url: string;
    duration: number;
    episode_number: number;
    season_number: number;
    published_at: string;
    play_count: number;
}

export default function PodcastsPage() {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);
    const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null);
    const [notifyEmail, setNotifyEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Search, filter & sort
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'az'>('popular');

    useEffect(() => {
        fetchPodcasts();
    }, []);

    const fetchPodcasts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('podcasts')
                .select('*')
                .order('subscriber_count', { ascending: false });

            if (error || !data || data.length === 0) {
                setPodcasts(FALLBACK_PODCASTS as Podcast[]);
                setUsingFallback(true);
            } else {
                setPodcasts(data);
                setUsingFallback(false);
            }
        } catch {
            setPodcasts(FALLBACK_PODCASTS as Podcast[]);
            setUsingFallback(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchEpisodes = async (podcastId: string) => {
        const { data } = await supabase
            .from('podcast_episodes')
            .select('*')
            .eq('podcast_id', podcastId)
            .order('episode_number', { ascending: false });
        setEpisodes(data || []);
    };

    const handleSelectPodcast = (podcast: Podcast) => {
        if (selectedPodcast?.id === podcast.id) {
            setSelectedPodcast(null);
            setEpisodes([]);
        } else {
            setSelectedPodcast(podcast);
            if (!usingFallback) fetchEpisodes(podcast.id);
        }
    };

    const handlePlayEpisode = (episode: Episode) => {
        if (playingEpisodeId === episode.id) {
            audioRef.current?.pause();
            setPlayingEpisodeId(null);
            return;
        }
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = episode.audio_url;
        audioRef.current.play().catch(console.error);
        setPlayingEpisodeId(episode.id);
        audioRef.current.onended = () => setPlayingEpisodeId(null);
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
    };

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const categories = [...new Set(podcasts.map(p => p.category))];

    const filteredPodcasts = useMemo(() => {
        let result = [...podcasts];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.host?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Sort
        switch (sortBy) {
            case 'popular':
                result.sort((a, b) => (b.subscriber_count || 0) - (a.subscriber_count || 0));
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                break;
            case 'az':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return result;
    }, [podcasts, searchQuery, selectedCategory, sortBy]);

    const featuredPodcasts = podcasts.filter(p => p.is_featured);

    return (
        <StreamsLayout>
            <SEO
                title="BARA Podcasts — African Voices & Stories"
                description="Discover podcasts from Africa's best voices — entrepreneurs, comedians, storytellers, and thought leaders."
                keywords={['African Podcasts', 'BARA Podcasts', 'African Stories', 'Podcast Streaming']}
            />
            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Hero */}
                <div className="relative overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50">
                    <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full animate-pulse opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl shadow-gray-500/30">
                                    <Mic2 size={36} className="text-white" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                            BARA Streams — Podcasts
                        </h1>
                        <p className="text-gray-500 mb-6 leading-relaxed max-w-lg mx-auto">
                            Africa's stories deserve to be heard. Discover podcasts from the continent's best voices —
                            entrepreneurs, comedians, storytellers, and thought leaders.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-md mx-auto mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search podcasts, hosts, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-200 shadow-sm"
                            />
                        </div>

                        {/* Categories (clickable filters) */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${!selectedCategory ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                All
                            </button>
                            {(categories.length > 0 ? categories : ['African Stories', 'True Crime', 'Comedy', 'Tech', 'Finance', 'Sports', 'Music News', 'Self-Improvement']).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Notify Me (show only when using fallback data) */}
                        {usingFallback && (
                            !submitted ? (
                                <form onSubmit={handleNotify} className="flex gap-2 max-w-sm mx-auto">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={notifyEmail}
                                        onChange={(e) => setNotifyEmail(e.target.value)}
                                        required
                                        className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500/50 border border-gray-200 transition-all"
                                    />
                                    <button type="submit" className="bg-gray-900 text-white py-3 px-6 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-500/20 flex items-center gap-2">
                                        <Bell size={16} />
                                        Notify Me
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-sm mx-auto">
                                    <p className="text-gray-900 font-bold text-sm flex items-center justify-center gap-2">
                                        <Bell size={16} />
                                        You'll be notified when Podcasts launches!
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <>
                        {/* Featured Podcasts */}
                        {featuredPodcasts.length > 0 && (
                            <div className="max-w-6xl mx-auto px-6 mt-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Featured Shows</h2>
                                <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x -mx-2 px-2">
                                    {featuredPodcasts.map((pod) => (
                                        <div key={pod.id} onClick={() => handleSelectPodcast(pod)} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start cursor-pointer group">
                                            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                                <div className={`h-36 bg-gradient-to-br ${CATEGORY_COLORS[pod.category] || 'from-gray-600 to-gray-800'} relative flex items-end p-4`}>
                                                    {pod.cover_url ? (
                                                        <img loading="lazy" src={pod.cover_url} alt={pod.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <Mic2 size={48} className="absolute top-4 right-4 text-white/20" />
                                                    )}
                                                    <div className="relative z-10">
                                                        <span className="bg-white/90 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{pod.category}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-gray-900 font-bold text-base leading-tight">{pod.title}</h3>
                                                    <p className="text-gray-500 text-sm mt-1">{pod.host}</p>
                                                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{pod.description}</p>
                                                    <div className="flex items-center gap-3 mt-3 text-gray-500 text-xs">
                                                        <span className="flex items-center gap-1"><Users size={12} />{pod.subscriber_count?.toLocaleString()} subscribers</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Podcasts */}
                        <div className="max-w-6xl mx-auto px-6 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {selectedCategory ? selectedCategory : 'All Shows'}
                                        {searchQuery && ` — "${searchQuery}"`}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {usingFallback ? "Here's a taste of the podcasts we're lining up" : `${filteredPodcasts.length} show${filteredPodcasts.length !== 1 ? 's' : ''} found`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value as any)}
                                        className="text-xs font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                                    >
                                        <option value="popular">Most Popular</option>
                                        <option value="newest">Newest</option>
                                        <option value="az">A — Z</option>
                                    </select>
                                </div>
                            </div>

                            {filteredPodcasts.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                    <Mic2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No podcasts found</p>
                                    <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredPodcasts.map((pod) => (
                                    <div key={pod.id}>
                                        <div
                                            onClick={() => handleSelectPodcast(pod)}
                                            className={`bg-white border rounded-xl overflow-hidden hover:border-gray-300 transition group cursor-pointer ${selectedPodcast?.id === pod.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100'}`}
                                        >
                                            <div className={`h-28 bg-gradient-to-br ${CATEGORY_COLORS[pod.category] || 'from-gray-600 to-gray-800'} flex items-center justify-center relative`}>
                                                {pod.cover_url ? (
                                                    <img loading="lazy" src={pod.cover_url} alt={pod.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Mic2 size={40} className="text-white/30" />
                                                )}
                                                <div className="absolute bottom-2 right-2 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                    <Play size={16} className="text-white ml-0.5" fill="white" />
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{pod.category}</span>
                                                <h3 className="text-gray-900 font-bold text-sm mt-1 leading-tight">{pod.title}</h3>
                                                <p className="text-gray-500 text-xs mt-1">{pod.host}</p>
                                                <p className="text-gray-600 text-xs mt-2 line-clamp-2">{pod.description}</p>
                                                <div className="flex items-center gap-3 mt-3 text-gray-600 text-xs">
                                                    <span className="flex items-center gap-1"><Users size={12} />{pod.subscriber_count?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Episodes panel (expanded) */}
                                        {selectedPodcast?.id === pod.id && episodes.length > 0 && (
                                            <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                                                <h4 className="font-bold text-gray-900 text-sm">Episodes</h4>
                                                {episodes.map((ep) => (
                                                    <div key={ep.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group/ep">
                                                        <button
                                                            onClick={() => handlePlayEpisode(ep)}
                                                            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition"
                                                        >
                                                            {playingEpisodeId === ep.id ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{ep.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{ep.description}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                                                            <span className="flex items-center gap-1"><Clock size={12} />{formatDuration(ep.duration)}</span>
                                                            <span className="flex items-center gap-1"><Headphones size={12} />{ep.play_count?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How it will work */}
                        <div className="max-w-4xl mx-auto px-6 mt-12">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">How BARA Podcasts Works</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { step: '1', title: 'Discover', desc: 'Browse podcasts by category, trending topics, or recommendations tailored to your interests.' },
                                    { step: '2', title: 'Listen & Follow', desc: 'Stream episodes on-demand, follow your favourite shows, and get notified when new episodes drop.' },
                                    { step: '3', title: 'Earn & Share', desc: 'Earn XP and coins for listening, share episodes with friends, and unlock achievements.' },
                                ].map((item) => (
                                    <div key={item.step} className="bg-white border border-gray-100 rounded-xl p-5">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-900 font-black text-sm flex items-center justify-center mb-3">
                                            {item.step}
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-sm mb-1">{item.title}</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <DiscoverMore exclude={['Streams']} maxItems={3} />
        </StreamsLayout>
    );
}
