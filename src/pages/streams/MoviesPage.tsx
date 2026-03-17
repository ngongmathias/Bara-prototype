import { useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { Play, Star, Clock, Filter, Search, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiscoverMore } from '@/components/DiscoverMore';

// Sample movie data — will be replaced with Supabase data when content is uploaded
const FEATURED_MOVIES = [
  {
    id: '1',
    title: 'The Woman King',
    description: 'The story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey.',
    genre: 'Action / Drama',
    year: 2022,
    duration: '2h 15m',
    rating: 4.5,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop',
  },
  {
    id: '2',
    title: 'Lionheart',
    description: 'When her father falls ill, Adaeze steps up to manage the family business in a male-dominated industry.',
    genre: 'Comedy / Drama',
    year: 2018,
    duration: '1h 35m',
    rating: 4.2,
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop',
  },
  {
    id: '3',
    title: 'Rafiki',
    description: 'Two young women in Nairobi find love in a society that does not accept them.',
    genre: 'Romance / Drama',
    year: 2018,
    duration: '1h 23m',
    rating: 4.3,
    poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop',
  },
];

const MOVIE_CATEGORIES = [
  { name: 'Nollywood', count: 120, image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop' },
  { name: 'Documentaries', count: 45, image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=250&fit=crop' },
  { name: 'Short Films', count: 78, image: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=250&fit=crop' },
  { name: 'Drama', count: 95, image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop' },
  { name: 'Comedy', count: 67, image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop' },
  { name: 'Action', count: 42, image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=250&fit=crop' },
];

const TRENDING_MOVIES = [
  { id: '4', title: 'Milkmaid', year: 2020, genre: 'Drama', rating: 4.1, poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop' },
  { id: '5', title: 'Vaya', year: 2016, genre: 'Drama', rating: 4.4, poster: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=300&h=450&fit=crop' },
  { id: '6', title: 'Sew the Winter to My Skin', year: 2018, genre: 'Thriller', rating: 4.0, poster: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=450&fit=crop' },
  { id: '7', title: 'The Boy Who Harnessed the Wind', year: 2019, genre: 'Drama', rating: 4.6, poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop' },
  { id: '8', title: 'Atlantics', year: 2019, genre: 'Romance', rating: 4.3, poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop' },
  { id: '9', title: 'Citation', year: 2020, genre: 'Drama', rating: 4.2, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=450&fit=crop' },
];

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const featured = FEATURED_MOVIES[0];

  return (
    <StreamsLayout>
      <SEO
        title="BARA Movies — African Cinema & Nollywood"
        description="Watch Nollywood films, African cinema, documentaries, and short films. Stream stories from across the continent."
        keywords={['African Movies', 'Nollywood', 'African Cinema', 'BARA Movies']}
      />

      <div className="min-h-screen pb-24">
        {/* Hero / Featured Movie */}
        <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
          <img
            src={featured.backdrop}
            alt={featured.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Featured
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 font-comfortaa">{featured.title}</h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mb-4 leading-relaxed">{featured.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-5">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" fill="currentColor" /> {featured.rating}</span>
              <span>{featured.year}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {featured.duration}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{featured.genre}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                <Play className="w-5 h-5" fill="white" /> Watch Now
              </button>
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-lg transition-colors backdrop-blur-sm">
                More Info
              </button>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-12">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Categories */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Browse by Genre</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {MOVIE_CATEGORIES.map((cat) => (
                <div key={cat.name} className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[16/10]">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm">{cat.name}</h3>
                    <p className="text-gray-300 text-xs">{cat.count} titles</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Now</h2>
              </div>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x -mx-2 px-2">
              {TRENDING_MOVIES.map((movie) => (
                <div key={movie.id} className="group flex-shrink-0 w-[160px] sm:w-[180px] snap-start cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl">
                        <Play className="w-5 h-5 ml-0.5" fill="white" />
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" fill="currentColor" /> {movie.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate">{movie.title}</h3>
                  <p className="text-xs text-gray-500">{movie.year} · {movie.genre}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Collection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Editor's Picks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURED_MOVIES.map((movie) => (
                <div key={movie.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={movie.backdrop}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl">
                        <Play className="w-6 h-6 ml-0.5" fill="white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900">{movie.title}</h3>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500" fill="currentColor" /> {movie.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{movie.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{movie.year}</span>
                      <span>·</span>
                      <span>{movie.duration}</span>
                      <span>·</span>
                      <span>{movie.genre}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-comfortaa">Have a Film to Share?</h2>
            <p className="text-red-100 mb-6 max-w-md mx-auto">
              Are you a filmmaker? Upload your movies to BARA Streams and reach audiences across Africa and the diaspora.
            </p>
            <Link
              to="/streams/creator"
              className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              Upload Your Film <ChevronRight className="w-4 h-4" />
            </Link>
          </section>

          <DiscoverMore exclude={['Streams']} maxItems={3} />
        </main>
      </div>
    </StreamsLayout>
  );
}
