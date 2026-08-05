import { useState, useEffect, useMemo } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { BookOpen, Search, ChevronRight, ArrowUpDown, Share2 } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { Link, useNavigate } from 'react-router-dom';
import { DiscoverMore } from '@/components/DiscoverMore';
import { supabase } from '@/lib/supabase';
import { useShare } from '@/context/ShareContext';
import { SectionNavButton } from '@/components/SectionNavButton';

interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  year: number;
  pages: number;
  cover_url: string;
  file_url: string;
  is_free: boolean;
  price: number;
  read_count: number;
  is_featured: boolean;
  created_at: string;
}

export default function EbooksPage() {
  const navigate = useNavigate();
  const { openShare } = useShare();
  const [searchQuery, setSearchQuery] = useState('');
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'az'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const handleShareEbook = (book: { id?: string; title: string; author?: string; description?: string; cover?: string; cover_url?: string }) => {
    openShare({
      url: `${window.location.origin}/streams/ebook/${book.id}`,
      title: `${book.title}${book.author ? ` by ${book.author}` : ''} — BARA Ebooks`,
      description: book.description?.slice(0, 160) || 'Read on BARA Ebooks',
      imageUrl: book.cover_url || book.cover,
    });
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('read_count', { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (e) {
      console.error('Error fetching ebooks:', e);
    } finally {
      setLoading(false);
    }
  };

  const genres = useMemo(() => [...new Set(ebooks.map(e => e.genre).filter(Boolean))], [ebooks]);

  const filteredEbooks = useMemo(() => {
    let result = [...ebooks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.author?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.genre?.toLowerCase().includes(q)
      );
    }

    if (selectedGenre) {
      result = result.filter(e => e.genre === selectedGenre);
    }

    if (priceFilter === 'free') result = result.filter(e => e.is_free);
    if (priceFilter === 'paid') result = result.filter(e => !e.is_free);

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => (b.read_count || 0) - (a.read_count || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'az':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [ebooks, searchQuery, selectedGenre, sortBy, priceFilter]);

  const featuredEbooks = ebooks.filter(e => e.is_featured);

  return (
    <StreamsLayout>
      <SEO
        title="BARA Ebooks — African Literature & Digital Library"
        description="Read African literature, business books, self-help, and academic resources. Your digital library of African knowledge."
        keywords={['African Books', 'Ebooks', 'African Literature', 'BARA Ebooks', 'Digital Library']}
      />

      <div className="min-h-screen pb-24">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-10 w-96 h-96 bg-gray-400 rounded-full blur-[128px]" />
          </div>
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
                  <BookOpen className="w-3.5 h-3.5" /> BARA Ebooks
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 font-comfortaa leading-tight">
                  BARA Streams — Ebooks
                </h1>
                <p className="text-gray-300 text-sm sm:text-base max-w-lg leading-relaxed mb-6">
                  Explore thousands of ebooks from African authors — fiction, non-fiction, academic, and more. Read anywhere, anytime.
                </p>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books, authors, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-lg"
                  />
                </div>
              </div>
              {/* Book stack visual */}
              {ebooks.length > 0 && (
                <div className="hidden sm:flex items-end gap-2">
                  {ebooks.slice(0, 3).map((book, i) => (
                    <div
                      key={book.id}
                      className="rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-700"
                      style={{ transform: `rotate(${(i - 1) * 5}deg) translateY(${i === 1 ? -10 : 0}px)`, width: 100, height: 150 }}
                    >
                      {book.cover_url && <img loading="lazy" src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} type="product" />
              ))}
            </div>
          ) : ebooks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No ebooks yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon, or be the first to publish one.</p>
            </div>
          ) : (
            <>
              {/* Filters & Sort Bar */}
              <section>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${!selectedGenre ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    All
                  </button>
                  {genres.map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${selectedGenre === g ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-xs font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer pr-1">
                      <option value="popular">Most Read</option>
                      <option value="newest">Newest</option>
                      <option value="az">A — Z</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                    <select value={priceFilter} onChange={e => setPriceFilter(e.target.value as any)} className="text-xs font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer pr-1">
                      <option value="all">All Prices</option>
                      <option value="free">Free Only</option>
                      <option value="paid">Paid Only</option>
                    </select>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{filteredEbooks.length} book{filteredEbooks.length !== 1 ? 's' : ''}</span>
                </div>
              </section>

              {/* Featured Ebooks (from DB) */}
              {!searchQuery && !selectedGenre && featuredEbooks.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Featured Books</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featuredEbooks.slice(0, 4).map((book) => (
                      <div key={book.id} onClick={() => navigate(`/streams/ebook/${book.id}`)} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex">
                        <div className="w-32 sm:w-36 flex-shrink-0 bg-gray-100">
                          {book.cover_url ? (
                            <img loading="lazy" src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-300" /></div>
                          )}
                        </div>
                        <div className="flex-1 p-4 flex flex-col">
                          <h3 className="font-bold text-gray-900 text-sm">{book.title}</h3>
                          <p className="text-xs text-gray-500">{book.author}</p>
                          <p className="text-xs text-gray-400 line-clamp-2 my-2">{book.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                            {book.pages > 0 && <><span>{book.pages} pages</span><span>·</span></>}
                            <span>{book.genre}</span>
                          </div>
                          <div className="mt-auto flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{book.is_free ? 'Free' : `${book.price} coins`}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/streams/ebook/${book.id}/read`); }}
                              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> {book.is_free ? 'Read Now' : 'Buy'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShareEbook(book); }}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors ml-auto"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* All Ebooks Grid */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                  {selectedGenre || (searchQuery ? `Results for "${searchQuery}"` : 'All Books')}
                </h2>
                {filteredEbooks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No ebooks found</p>
                    <p className="text-gray-400 text-sm mt-1">Try a different search, genre, or price filter</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredEbooks.map((book) => (
                      <div key={book.id} onClick={() => navigate(`/streams/ebook/${book.id}`)} className="group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg bg-gray-100">
                          {book.cover_url ? (
                            <img loading="lazy" src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-300" /></div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/streams/ebook/${book.id}/read`); }}
                              className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl"
                              aria-label="Read"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${book.is_free ? 'bg-gray-900 text-white' : 'bg-gray-500 text-white'}`}>
                              {book.is_free ? 'FREE' : `${book.price} coins`}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xs truncate">{book.title}</h3>
                        <p className="text-[11px] text-gray-500 truncate">{book.author}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span>{book.genre}</span>
                          {book.read_count > 0 && <span>· {book.read_count.toLocaleString()} reads</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* CTA Banner */}
          <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-comfortaa">Are You an Author?</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Publish your work on BARA Ebooks and reach readers across Africa and the diaspora. Self-publish with ease.
            </p>
            <Link
              to="/users/dashboard/my-ebooks"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Publish Your Book <ChevronRight className="w-4 h-4" />
            </Link>
          </section>

          <DiscoverMore exclude={['Streams']} maxItems={3} />
        </main>
      </div>
    </StreamsLayout>
  );
}
