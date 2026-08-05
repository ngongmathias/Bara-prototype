import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { supabase } from '@/lib/supabase';
import { useShare } from '@/context/ShareContext';
import { ArrowLeft, BookOpen, Star, BookOpenCheck, Share2, Loader2, User, Calendar, Hash } from 'lucide-react';

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre?: string;
  year?: number;
  pages?: number;
  cover_url?: string;
  file_url?: string;
  is_free: boolean;
  price?: number;
  read_count?: number;
}

export default function EbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openShare } = useShare();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEbook(id);
  }, [id]);

  const fetchEbook = async (ebookId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('ebooks').select('*').eq('id', ebookId).single();
      setEbook(!error && data ? data : null);
    } catch {
      setEbook(null);
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

  if (!ebook) {
    return (
      <StreamsLayout>
        <div className="flex flex-col items-center py-32 gap-4">
          <BookOpen className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500 text-lg">Ebook not found.</p>
          <button onClick={() => navigate('/streams/ebooks')} className="text-sm underline text-gray-600">
            Back to Ebooks
          </button>
        </div>
      </StreamsLayout>
    );
  }

  const handleShare = () => {
    openShare({
      url: `${window.location.origin}/streams/ebook/${ebook.id}`,
      title: `${ebook.title}${ebook.author ? ` by ${ebook.author}` : ''} — BARA Ebooks`,
      description: ebook.description?.slice(0, 160) || `${ebook.genre || 'Ebook'} on BARA`,
      imageUrl: ebook.cover_url,
    });
  };

  return (
    <StreamsLayout>
      <SEO
        title={`${ebook.title} — BARA Ebooks`}
        description={ebook.description?.slice(0, 160) || `${ebook.title} by ${ebook.author}`}
        image={ebook.cover_url}
        type="article"
      />

      <div className="min-h-screen pb-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-8">
          <button
            onClick={() => navigate('/streams/ebooks')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Ebooks
          </button>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-0">
              {/* Cover */}
              <div className="sm:w-56 flex-shrink-0 bg-gray-100">
                {ebook.cover_url ? (
                  <img
                    loading="lazy" src={ebook.cover_url}
                    alt={ebook.title}
                    className="w-full h-64 sm:h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-6 sm:p-8">
                {ebook.genre && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {ebook.genre}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">{ebook.title}</h1>
                {ebook.author && (
                  <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {ebook.author}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                  {ebook.year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ebook.year}</span>}
                  {ebook.pages && <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> {ebook.pages} pages</span>}
                  {ebook.read_count != null && ebook.read_count > 0 && (
                    <span className="flex items-center gap-1"><BookOpenCheck className="w-3.5 h-3.5" /> {ebook.read_count.toLocaleString()} reads</span>
                  )}
                </div>

                {ebook.description && (
                  <p className="text-gray-600 leading-relaxed text-sm mb-6">{ebook.description}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/streams/ebook/${ebook.id}/read`)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    {ebook.is_free ? 'Read Free' : `Buy · ${ebook.price} coins`}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StreamsLayout>
  );
}
