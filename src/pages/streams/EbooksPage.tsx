import { useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { BookOpen, Star, Search, Filter, ChevronRight, TrendingUp, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiscoverMore } from '@/components/DiscoverMore';

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

export default function EbooksPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <StreamsLayout>
      <SEO
        title="BARA Ebooks — African Literature & Digital Library"
        description="Read African literature, business books, self-help, and academic resources. Your digital library of African knowledge."
        keywords={['African Books', 'Ebooks', 'African Literature', 'BARA Ebooks', 'Digital Library']}
      />

      <div className="min-h-screen pb-24">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-[128px]" />
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
                <p className="text-amber-100 text-sm sm:text-base max-w-lg leading-relaxed mb-6">
                  Explore thousands of ebooks from African authors — fiction, non-fiction, academic, and more. Read anywhere, anytime.
                </p>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books, authors, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-lg"
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
          {/* Categories */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Browse Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BOOK_CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-700 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.count} books</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Books */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Featured Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURED_BOOKS.map((book) => (
                <div key={book.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex">
                  <div className="w-32 sm:w-36 flex-shrink-0">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{book.title}</h3>
                        <p className="text-xs text-gray-500">{book.author}</p>
                      </div>
                      <button className="p-1.5 hover:bg-gray-100 rounded-full transition">
                        <Heart className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{book.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500" fill="currentColor" /> {book.rating}</span>
                      <span>·</span>
                      <span>{book.pages} pages</span>
                      <span>·</span>
                      <span>{book.genre}</span>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-600">{book.price}</span>
                      <button className="ml-auto flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                        <BookOpen className="w-3.5 h-3.5" /> Read Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New Releases */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">New Releases</h2>
              </div>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x -mx-2 px-2">
              {NEW_RELEASES.map((book) => (
                <div key={book.id} className="group flex-shrink-0 w-[140px] sm:w-[160px] snap-start cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" fill="currentColor" /> {book.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs truncate">{book.title}</h3>
                  <p className="text-[11px] text-gray-500 truncate">{book.author}</p>
                  <p className="text-[10px] text-gray-400">{book.genre}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-comfortaa">Are You an Author?</h2>
            <p className="text-amber-100 mb-6 max-w-md mx-auto">
              Publish your work on BARA Ebooks and reach readers across Africa and the diaspora. Self-publish with ease.
            </p>
            <Link
              to="/streams/creator"
              className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors"
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
