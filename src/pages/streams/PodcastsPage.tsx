import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Mic2, Play, Search } from 'lucide-react';

const PODCAST_CATEGORIES = [
    { title: 'True Crime', color: 'bg-[#503750]', image: 'https://images.unsplash.com/photo-1453873531674-215ee3ac451f?w=400&h=400&fit=crop' },
    { title: 'Comedy', color: 'bg-[#af2896]', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=400&fit=crop' },
    { title: 'Finance', color: 'bg-[#1e3264]', image: 'https://images.unsplash.com/photo-1611974714024-462cd297bc2f?w=400&h=400&fit=crop' },
    { title: 'African Stories', color: 'bg-[#e8115b]', image: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?w=400&h=400&fit=crop' },
    { title: 'Self-Improvement', color: 'bg-[#006450]', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop' },
    { title: 'Technology', color: 'bg-[#148a08]', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop' },
    { title: 'Music News', color: 'bg-[#dc148c]', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
    { title: 'Sports', color: 'bg-[#27856a]', image: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=400&h=400&fit=crop' }
];

export default function PodcastsPage() {
    return (
        <StreamsLayout>
            <div className="min-h-screen bg-[#121212] p-8 pb-24 pt-16">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-4xl font-black text-white mb-6 tracking-tight">Podcasts</h1>

                        {/* Search Bar Placeholder */}
                        <div className="relative max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search podcasts..."
                                className="w-full bg-[#242424] text-white py-3 pl-12 pr-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            />
                        </div>
                    </header>

                    {/* Popular Categories */}
                    <section>
                        <h2 className="text-2xl font-black text-white mb-6">Browse all</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {PODCAST_CATEGORIES.map((cat, idx) => (
                                <div
                                    key={idx}
                                    className={`${cat.color} aspect-square rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:brightness-110 transition-all shadow-xl`}
                                >
                                    <h3 className="text-2xl font-black text-white break-words leading-tight tracking-tighter max-w-[80%] uppercase drop-shadow-lg">
                                        {cat.title}
                                    </h3>
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="absolute bottom-[-10px] right-[-10px] w-[60%] aspect-square object-cover shadow-2xl rotate-[25deg] group-hover:scale-110 transition-transform duration-500 rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Featured Shows Placeholder */}
                    <section className="mt-12">
                        <h2 className="text-2xl font-black text-white mb-6">Popular shows</h2>
                        <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-[#181818] p-4 rounded-lg cursor-pointer hover:bg-[#282828] transition-all duration-300 group flex flex-col min-w-[200px] snap-start border border-white/5">
                                    <div className="relative mb-4 aspect-square shadow-2xl rounded-lg overflow-hidden">
                                        <img
                                            src={`https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop&q=80&sig=${i}`}
                                            className="w-full h-full object-cover"
                                            alt="Podcast show"
                                        />
                                        <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10">
                                            <Mic2 size={24} fill="black" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold truncate text-white mb-1 text-sm tracking-tight">The African Tech Show</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2">Daily updates on technology and innovation across the continent.</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </StreamsLayout>
    );
}
