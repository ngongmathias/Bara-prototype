import { useState, useEffect, useMemo } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { BookOpen, Star, Search, ChevronRight, TrendingUp, Heart, ArrowUpDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiscoverMore } from '@/components/DiscoverMore';
import { supabase } from '@/lib/supabase';

// Sample ebook data — will be replaced with Supabase data when content is uploaded
const FEATURED_BOOKS = [
  {
    id: '1',
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    description: 'A masterful novel set during the Nigerian Civil War, exploring love, loyalty, and the horrors of conflict.',
    genre: 'Historical Fiction',
    year: 2006,
    pages: 448,
    rating: 4.8,
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    price: 'Free',
  },
  {
    id: '2',
    title: 'Born a Crime',
    author: 'Trevor Noah',
    description: 'Stories from a South African childhood — a memoir of growing up as a mixed-race child under apartheid.',
    genre: 'Memoir',
    year: 2016,
    pages: 304,
    rating: 4.7,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    price: 'Free',
  },
  {
    id: '3',
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    description: 'The classic story of Okonkwo and the clash between traditional Igbo society and colonial forces.',
    genre: 'Literary Fiction',
    year: 1958,
    pages: 209,
    rating: 4.6,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    price: 'Free',
  },
  {
    id: '4',
    title: 'Americanah',
    author: 'Chimamanda Ngozi Adichie',
    description: 'A powerful story of love, race, and identity following a young Nigerian woman\'s journey between Africa and America.',
    genre: 'Contemporary Fiction',
    year: 2013,
    pages: 477,
    rating: 4.5,
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    price: 'Free',
  },
];

const BOOK_CATEGORIES = [
  { name: 'African Literature', count: 234, icon: '📚' },
  { name: 'Business & Finance', count: 156, icon: '💼' },
  { name: 'Self-Help', count: 189, icon: '🌟' },
  { name: 'History', count: 112, icon: '🏛️' },
  { name: 'Science & Tech', count: 87, icon: '🔬' },
  { name: 'Poetry', count: 65, icon: '✍️' },
  { name: 'Children\'s Books', count: 143, icon: '🧒' },
  { name: 'Academic', count: 98, icon: '🎓' },
];

const NEW_RELEASES = [
  { id: '5', title: 'The Promise', author: 'Damon Galgut', genre: 'Literary Fiction', rating: 4.3, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop' },
  { id: '6', title: 'Remote Control', author: 'Nnedi Okofor', genre: 'Sci-Fi', rating: 4.4, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop' },
  { id: '7', title: 'My Sister, the Serial Killer', author: 'Oyinkan Braithwaite', genre: 'Thriller', rating: 4.2, cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop' },
  { id: '8', title: 'The Old Drift', author: 'Namwali Serpell', genre: 'Epic Fiction', rating: 4.5, cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=450&fit=crop' },
  { id: '9', title: 'Kintu', author: 'Jennifer Nansubuga Makumbi', genre: 'Historical', rating: 4.6, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop' },
  { id: '10', title: 'We Need New Names', author: 'NoViolet Bulawayo', genre: 'Coming-of-Age', rating: 4.1, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop' },
];

interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  year: number;
  pages: number;
  cover_url: string;
  is_free: boolean;
  price: number;
  download_count: number;
  is_featured: boolean;
  created_at: string;
}

export default function EbooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'az'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('download_count', { ascending: false });

      if (error || !data || data.length === 0) {
        setUsingFallback(true);
      } else {
        setEbooks(data);
        setUsingFallback(false);
      }
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const genres = useMemo(() => [...new Set(ebooks.map(e => e.genre).filter(Boolean))], [ebooks]);

  const filteredEbooks = useMemo(() => {
    let result = usingFallback ? [] : [...ebooks];

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
        result.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'az':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [ebooks, searchQuery, selectedGenre, sortBy, priceFilter, usingFallback]);

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
                  Your Digital<br />African Library
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
              <div className="hidden sm:flex items-end gap-2">
                {FEATURED_BOOKS.slice(0, 3).map((book, i) => (
                  <div
                    key={book.id}
                    className="rounded-lg overflow-hidden shadow-2xl border-2 border-white/20"
                    style={{ transform: `rotate(${(i - 1) * 5}deg) translateY(${i === 1 ? -10 : 0}px)`, width: 100, height: 150 }}
                  >
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
            </div>
          ) : usingFallback ? (
            <>
              {/* Fallback: show sample data */}
              {/* Categories */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Browse Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BOOK_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
                      <span className="text-2xl mb-2 block">{cat.icon}</span>
                      <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                      <p className="text-xs text-gray-400">{cat.count} books</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Featured Books (fallback) */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Featured Books</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FEATURED_BOOKS.map((book) => (
                    <div key={book.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex">
                      <div className="w-32 sm:w-36 flex-shrink-0">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-sm">{book.title}</h3>
                        <p className="text-xs text-gray-500">{book.author}</p>
                        <p className="text-xs text-gray-400 line-clamp-2 my-2 leading-relaxed">{book.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <span>{book.pages} pages</span><span>·</span><span>{book.genre}</span>
                        </div>
                        <div className="mt-auto">
                          <span className="text-sm font-bold text-gray-900">{book.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* New Releases (fallback) */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">New Releases</h2>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x -mx-2 px-2">
                  {NEW_RELEASES.map((book) => (
                    <div key={book.id} className="group flex-shrink-0 w-[140px] sm:w-[160px] snap-start cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-xs truncate">{book.title}</h3>
                      <p className="text-[11px] text-gray-500 truncate">{book.author}</p>
                      <p className="text-[10px] text-gray-400">{book.genre}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
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
                      <option value="popular">Most Downloaded</option>
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
                      <div key={book.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex">
                        <div className="w-32 sm:w-36 flex-shrink-0 bg-gray-100">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
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
                            <button className="ml-auto flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                              <BookOpen className="w-3.5 h-3.5" /> Read Now
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
                      <div key={book.id} className="group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg bg-gray-100">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-300" /></div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute top-2 left-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${book.is_free ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                              {book.is_free ? 'FREE' : `${book.price} coins`}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xs truncate">{book.title}</h3>
                        <p className="text-[11px] text-gray-500 truncate">{book.author}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span>{book.genre}</span>
                          {book.download_count > 0 && <span>· {book.download_count.toLocaleString()} downloads</span>}
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
              to="/streams/creator"
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
