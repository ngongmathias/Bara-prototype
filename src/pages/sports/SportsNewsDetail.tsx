import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '@/components/sports/SportsTopBanner';
import { SportsSubNav } from '@/components/sports/SportsSubNav';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
    id: string;
    title: string;
    content: string;
    summary?: string;
    image_url?: string;
    category?: string;
    author?: string;
    source_url?: string;
    created_at: string;
    updated_at?: string;
}

export default function SportsNewsDetail() {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchArticle(id);
        }
    }, [id]);

    const fetchArticle = async (articleId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sports_news')
                .select('*')
                .eq('id', articleId)
                .single();

            if (error) throw error;
            setArticle(data);

            // Fetch related articles from same category
            if (data?.category) {
                const { data: related } = await supabase
                    .from('sports_news')
                    .select('*')
                    .eq('category', data.category)
                    .neq('id', articleId)
                    .order('created_at', { ascending: false })
                    .limit(4);
                setRelatedNews(related || []);
            }
        } catch (error) {
            console.error('Error fetching article:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: article?.title, url });
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            toast({ title: "Copied", description: "Link copied to clipboard!" });
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-100">
                    <SportsTopBanner />
                    <SportsSubNav />
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-[400px] bg-gray-200 rounded" />
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-4 bg-gray-200 rounded" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!article) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-100">
                    <SportsTopBanner />
                    <SportsSubNav />
                    <div className="max-w-4xl mx-auto p-6 text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
                        <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
                        <Link to="/sports">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Sports
                            </Button>
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <SEO
                title={article.title}
                description={article.summary || article.content?.substring(0, 160)}
                keywords={[article.category || 'Sports', 'News', 'Bara Afrika Sports']}
            />
            <div className="min-h-screen bg-gray-100">
                <SportsTopBanner />
                <SportsSubNav />

                <div className="max-w-[1200px] mx-auto p-4">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Main Article */}
                        <article className="col-span-12 lg:col-span-8">
                            {/* Back link */}
                            <Link
                                to="/sports"
                                className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4 font-semibold"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Sports Home
                            </Link>

                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Category badge */}
                                {article.category && (
                                    <div className="px-6 pt-6">
                                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                                            {article.category}
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight px-6 pt-4 pb-2 font-roboto-condensed">
                                    {article.title}
                                </h1>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-4 px-6 pb-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User size={14} />
                                        {article.author || 'Staff Writer'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {formatDate(article.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {formatTime(article.created_at)}
                                    </span>
                                </div>

                                {/* Hero image */}
                                {article.image_url && (
                                    <div className="px-6">
                                        <img
                                            src={article.image_url}
                                            alt={article.title}
                                            className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Share bar */}
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Share</span>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 rounded-full hover:bg-gray-100 transition"
                                        title="Share"
                                    >
                                        <Share2 size={16} className="text-gray-600" />
                                    </button>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full hover:bg-blue-50 transition"
                                    >
                                        <Twitter size={16} className="text-blue-400" />
                                    </a>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full hover:bg-blue-50 transition"
                                    >
                                        <Facebook size={16} className="text-blue-600" />
                                    </a>
                                </div>

                                {/* Article content */}
                                <div className="px-6 py-6 prose prose-lg max-w-none text-gray-800 leading-relaxed">
                                    {article.content ? (
                                        article.content.split('\n').map((paragraph, idx) => (
                                            paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">Full article content is not available.</p>
                                    )}
                                </div>

                                {/* Source link */}
                                {article.source_url && (
                                    <div className="px-6 pb-6">
                                        <a
                                            href={article.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            Read original source →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </article>

                        {/* Sidebar - Related News */}
                        <aside className="col-span-12 lg:col-span-4">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                                        Related Stories
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {relatedNews.length > 0 ? (
                                        relatedNews.map(item => (
                                            <Link
                                                key={item.id}
                                                to={`/sports/news/${item.id}`}
                                                className="flex gap-3 p-4 hover:bg-gray-50 transition group"
                                            >
                                                {item.image_url && (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        className="w-20 h-14 object-cover rounded flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition line-clamp-2">
                                                        {item.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-400 mt-1 block">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-sm text-gray-500">
                                            No related stories found.
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 text-center">
                                    <Link to="/sports" className="text-xs font-bold text-blue-600 hover:underline">
                                        View All News
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
