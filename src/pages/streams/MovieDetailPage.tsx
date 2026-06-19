import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { supabase } from '@/lib/supabase';
import { useShare } from '@/context/ShareContext';
import { ArrowLeft, Play, Star, Clock, Eye, Share2, Loader2, User } from 'lucide-react';

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

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openShare } = useShare();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchMovie(id);
  }, [id]);

  const fetchMovie = async (movieId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.from('movies').select('*').eq('id', movieId).single();
      if (data) {
        setMovie(data);
        // Fetch related by same genre
        const { data: rel } = await supabase
          .from('movies')
          .select('id,title,poster_url,genre,year,rating,is_free')
          .eq('genre', data.genre)
          .neq('id', movieId)
          .limit(6);
        setRelated(rel || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StreamsLayout>
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      </StreamsLayout>
    );
  }

  if (!movie) {
    return (
      <StreamsLayout>
        <div className="flex flex-col items-center py-32 gap-4">
          <p className="text-gray-500 text-lg">Movie not found.</p>
          <button onClick={() => navigate('/streams/movies')} className="text-sm underline text-gray-600">
            Back to Movies
          </button>
        </div>
      </StreamsLayout>
    );
  }

  const handleShare = () => {
    openShare({
      url: `${window.location.origin}/streams/movie/${movie.id}`,
      title: movie.title,
      description: movie.description?.slice(0, 160),
      imageUrl: movie.poster_url || movie.backdrop_url,
    });
  };

  const cast = movie.cast_members?.length ? movie.cast_members : movie.actors ? movie.actors.split(',').map(s => s.trim()) : [];

  return (
    <StreamsLayout>
      <SEO
        title={`${movie.title} — BARA Streams`}
        description={movie.description?.slice(0, 160)}
        image={movie.poster_url || movie.backdrop_url}
        type="video.episode"
      />

      <div className="min-h-screen pb-24">
        {/* Backdrop hero */}
        <div className="relative h-[300px] sm:h-[420px] overflow-hidden">
          <img
            loading="lazy" src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <button
            onClick={() => navigate('/streams/movies')}
            className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 px-3 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Movies
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-20 relative z-10 pb-12">
          <div className="flex gap-6 items-end mb-8">
            {/* Poster */}
            <img
              loading="lazy" src={movie.poster_url}
              alt={movie.title}
              className="w-28 sm:w-40 flex-shrink-0 rounded-xl shadow-2xl border-2 border-white/20"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'; }}
            />
            <div className="pb-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-white/70 text-sm">{movie.year}</span>
                {movie.genre && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{movie.genre}</span>}
                {movie.is_free && <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">FREE</span>}
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{movie.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-white/70 text-sm flex-wrap">
                {movie.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" fill="currentColor" /> {movie.rating}</span>}
                {movie.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDuration(movie.duration_minutes)}</span>}
                {movie.view_count > 0 && <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {movie.view_count.toLocaleString()} views</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg">
              <Play className="w-5 h-5" fill="white" /> Watch Now
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl transition-colors backdrop-blur-sm border border-white/20"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            {movie.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed">{movie.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {movie.director && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Director</p>
                  <p className="font-medium text-gray-800">{movie.director}</p>
                </div>
              )}
              {movie.country && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Country</p>
                  <p className="font-medium text-gray-800">{movie.country}</p>
                </div>
              )}
              {movie.language && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Language</p>
                  <p className="font-medium text-gray-800">{movie.language.toUpperCase()}</p>
                </div>
              )}
              {movie.producers && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Producers</p>
                  <p className="font-medium text-gray-800">{movie.producers}</p>
                </div>
              )}
              {movie.writers && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Writers</p>
                  <p className="font-medium text-gray-800">{movie.writers}</p>
                </div>
              )}
            </div>

            {cast.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Cast</h2>
                <div className="flex flex-wrap gap-2">
                  {cast.map((name, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700">
                      <User className="w-3 h-3 text-gray-400" /> {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related movies */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">More {movie.genre}</h2>
              <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-2 px-2 snap-x">
                {related.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => { navigate(`/streams/movie/${m.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="group flex-shrink-0 w-[140px] snap-start cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-md">
                      <img
                        loading="lazy" src={(m as any).poster_url}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'; }}
                      />
                      {(m as any).is_free && <div className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">FREE</div>}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{m.title}</p>
                    <p className="text-xs text-gray-500">{(m as any).year} · {m.genre}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </StreamsLayout>
  );
}
