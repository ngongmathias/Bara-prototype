import { useState, useEffect } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { Play, Star, Clock, Filter, Search, ChevronRight, TrendingUp, Eye, Share2 } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';
import { Link, useNavigate } from 'react-router-dom';
import { DiscoverMore } from '@/components/DiscoverMore';
import { supabase } from '@/lib/supabase';
import { useShare } from '@/context/ShareContext';
import { SectionNavButton } from '@/components/SectionNavButton';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  year: number;
  duration_minutes: number;
  rating: number;
  poster_url: string;
  backdrop_url: string;
  director: string;
  producers: string;
  writers: string;
  actors: string;
  cast_members: string[];
  country: string;
  language: string;
  is_featured: boolean;
  is_free: boolean;
  view_count: number;
}

interface MovieCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

const FALLBACK_FEATURED = [
  { id: '1', title: 'The Woman King', description: 'The story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey.', genre: 'Action', year: 2022, duration_minutes: 135, rating: 4.5, poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop', director: 'Gina Prince-Bythewood', cast_members: ['Viola Davis','Thuso Mbedu'], country: 'USA/Benin', language: 'en', is_featured: true, is_free: true, view_count: 245000 },
  { id: '2', title: 'Lionheart', description: 'When her father falls ill, Adaeze steps up to manage the family business.', genre: 'Comedy', year: 2018, duration_minutes: 95, rating: 4.2, poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', director: 'Genevieve Nnaji', cast_members: ['Genevieve Nnaji'], country: 'Nigeria', language: 'en', is_featured: true, is_free: true, view_count: 189000 },
  { id: '3', title: 'Rafiki', description: 'Two young women in Nairobi find love in a society that does not accept them.', genre: 'Drama', year: 2018, duration_minutes: 83, rating: 4.3, poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', director: 'Wanuri Kahiu', cast_members: ['Samantha Mugatsia'], country: 'Kenya', language: 'sw', is_featured: true, is_free: true, view_count: 67000 },
];

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Nollywood', slug: 'nollywood', description: "Nigeria's vibrant film industry", image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop' },
  { id: '2', name: 'Documentaries', slug: 'documentaries', description: 'Real stories from across Africa', image_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=250&fit=crop' },
  { id: '3', name: 'Short Films', slug: 'short-films', description: 'Powerful stories told in minutes', image_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=250&fit=crop' },
  { id: '4', name: 'Drama', slug: 'drama', description: 'Emotional cinema', image_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop' },
  { id: '5', name: 'Comedy', slug: 'comedy', description: 'African humor', image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop' },
  { id: '6', name: 'Action', slug: 'action', description: 'High-energy films', image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop' },
];

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function MoviesPage() {
  const navigate = useNavigate();
  const { openShare } = useShare();
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch movies
      const { data: moviesData, error: movErr } = await supabase
        .from('movies')
        .select('*')
        .order('view_count', { ascending: false });

      if (movErr || !moviesData || moviesData.length === 0) {
        setMovies(FALLBACK_FEATURED as Movie[]);
        setCategories(FALLBACK_CATEGORIES as MovieCategory[]);
        setUsingFallback(true);
      } else {
        setMovies(moviesData);
        setUsingFallback(false);

        // Fetch categories
        const { data: catData } = await supabase
          .from('movie_categories')
          .select('*')
          .order('name', { ascending: true });
        setCategories(catData || FALLBACK_CATEGORIES as MovieCategory[]);
      }
    } catch {
      setMovies(FALLBACK_FEATURED as Movie[]);
      setCategories(FALLBACK_CATEGORIES as MovieCategory[]);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const featuredMovies = movies.filter(m => m.is_featured);
  const featured = featuredMovies[0] || movies[0];
  const trendingMovies = [...movies].sort((a, b) => b.view_count - a.view_count).slice(0, 10);
  const filteredMovies = searchQuery
    ? movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.genre?.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  return (
    <StreamsLayout>
      <SEO
        title="BARA Movies — African Cinema & Nollywood"
        description="Watch Nollywood films, African cinema, documentaries, and short films. Stream stories from across the continent."
        keywords={['African Movies', 'Nollywood', 'African Cinema', 'BARA Movies']}
      />

      <div className="min-h-screen pb-24">
        {loading ? (
          <div className="px-6 sm:px-10 pt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} type="product" />
            ))}
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="px-6 sm:px-10 pt-8 pb-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">BARA Streams — Movies</h1>
            </div>

            {/* Hero / Featured Movie */}
            {featured && (
              <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
                <img
                  loading="lazy" src={featured.backdrop_url}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  <span className="inline-block bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    Featured
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 font-comfortaa">{featured.title}</h1>
                  <p className="text-gray-300 text-sm sm:text-base max-w-xl mb-4 leading-relaxed">{featured.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-white" fill="currentColor" /> {featured.rating}</span>
                    <span>{featured.year}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDuration(featured.duration_minutes)}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{featured.genre}</span>
                    {featured.is_free && <span className="bg-gray-900 px-2 py-0.5 rounded text-xs font-bold">FREE</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-5">
                    {featured.director && <span>Dir: {featured.director}</span>}
                    {featured.producers && <span>Prod: {featured.producers}</span>}
                    {featured.writers && <span>Written by: {featured.writers}</span>}
                    {(featured.actors || (featured.cast_members && featured.cast_members.length > 0)) && (
                      <span>Cast: {featured.actors || featured.cast_members?.join(', ')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-lg transition-colors" aria-label="Play"><Play className="w-5 h-5" fill="white" /> Watch Now
                    </button>
                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-lg transition-colors backdrop-blur-sm">
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                  {categories.map((cat) => (
                    <div key={cat.id} className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[16/10]">
                      <img loading="lazy" src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-bold text-sm">{cat.name}</h3>
                        <p className="text-gray-300 text-xs">{cat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-900" />
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Now</h2>
                  </div>
                  <button className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    See all <ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x -mx-2 px-2">
                  {trendingMovies.map((movie) => (
                    <div key={movie.id} onClick={() => navigate(`/streams/movie/${movie.id}`)} className="group flex-shrink-0 w-[160px] sm:w-[180px] snap-start cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                        <img
                          loading="lazy" src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <button className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl" aria-label="Play"><Play className="w-5 h-5 ml-0.5" fill="white" /></button>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 text-white" fill="currentColor" /> {movie.rating}
                        </div>
                        {movie.is_free && (
                          <div className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm truncate">{movie.title}</h3>
                      <p className="text-xs text-gray-500">{movie.year} · {movie.genre}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {movie.view_count?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* All Movies / Search Results */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                  {searchQuery ? `Results for "${searchQuery}"` : "Editor's Picks"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(searchQuery ? filteredMovies : featuredMovies.length > 0 ? featuredMovies : movies.slice(0, 6)).map((movie) => (
                    <div key={movie.id} onClick={() => navigate(`/streams/movie/${movie.id}`)} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          loading="lazy" src={movie.backdrop_url || movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <button className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl" aria-label="Play"><Play className="w-6 h-6 ml-0.5" fill="white" /></button>
                        </div>
                        {movie.is_free && (
                          <div className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-900">{movie.title}</h3>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3 text-gray-900" fill="currentColor" /> {movie.rating}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{movie.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{movie.year}</span>
                          <span>·</span>
                          <span>{formatDuration(movie.duration_minutes)}</span>
                          <span>·</span>
                          <span>{movie.genre}</span>
                        </div>
                        <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                          {movie.director && <p><span className="text-gray-500 font-medium">Director:</span> {movie.director}</p>}
                          {movie.producers && <p><span className="text-gray-500 font-medium">Producers:</span> {movie.producers}</p>}
                          {movie.writers && <p><span className="text-gray-500 font-medium">Writers:</span> {movie.writers}</p>}
                          {(movie.actors || (movie.cast_members && movie.cast_members.length > 0)) && (
                            <p><span className="text-gray-500 font-medium">Cast:</span> {movie.actors || movie.cast_members?.join(', ')}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {movie.view_count?.toLocaleString()} views</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); openShare({ url: `${window.location.origin}/streams/movie/${movie.id}`, title: movie.title, description: movie.description?.slice(0, 160), imageUrl: movie.poster_url || movie.backdrop_url }); }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {searchQuery && filteredMovies.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-semibold">No movies found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </section>

              {/* CTA Banner */}
              <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 sm:p-12 text-white text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-comfortaa">Have a Film to Share?</h2>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  Are you a filmmaker? Upload your movies to BARA Streams and reach audiences across Africa and the diaspora.
                </p>
                <Link
                  to="/streams/creator"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Upload Your Film <ChevronRight className="w-4 h-4" />
                </Link>
              </section>

              <DiscoverMore exclude={['Streams']} maxItems={3} />
            </main>
          </>
        )}
      </div>
    </StreamsLayout>
  );
}
