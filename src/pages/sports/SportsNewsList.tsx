import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SportsTopBanner } from '@/components/sports/SportsTopBanner';
import { SportsSubNav } from '@/components/sports/SportsSubNav';
import { SPORTS_CONFIG } from '@/config/sportsConfig';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';

interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    image_url: string;
    sport: string;
    published_at: string;
    source: string;
}

export default function SportsNewsList() {
    const { sport: sportSlug } = useParams();
    const activeSport = (sportSlug && SPORTS_CONFIG[sportSlug as keyof typeof SPORTS_CONFIG]) || SPORTS_CONFIG.football;
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('sports_news')
                    .select('*')
                    .order('published_at', { ascending: false })
                    .limit(30);

                if (sportSlug) {
                    query = query.eq('sport', sportSlug);
                }

                const { data, error } = await query;
                if (error) throw error;
                setArticles(data || []);
            } catch (err) {
                console.error('Error fetching sports news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [sportSlug]);

    return (
        <MainLayout>
            <SEO
                title={`${activeSport.name} News`}
                description={`Latest ${activeSport.name} news, analysis, and top stories on Bara Afrika Sports.`}
                keywords={[activeSport.name, 'Sports News', 'Africa Sports', 'Match Reports']}
            />
            <div className="min-h-screen bg-gray-100 font-sans text-left">
                <SportsTopBanner />
                <SportsSubNav />

                <div className="max-w-[1200px] mx-auto p-4 py-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                        {activeSport.name} News
                    </h1>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                            <p className="text-gray-500 text-lg font-bold mb-2">No news articles yet</p>
                            <p className="text-gray-400">Check back soon for the latest {activeSport.name} news and updates.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    to={`/sports/news/${article.id}`}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex overflow-hidden group"
                                >
                                    {article.image_url && (
                                        <div className="w-48 h-32 flex-shrink-0">
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4 flex-1 min-w-0">
                                        <h2 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                            {article.title}
                                        </h2>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.summary}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(article.published_at).toLocaleDateString()}
                                            </span>
                                            {article.source && <span>{article.source}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center pr-4">
                                        <ChevronRight className="text-gray-300 group-hover:text-red-600 transition-colors" size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
