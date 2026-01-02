import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/supabase';
import { MarketplaceCategory } from '@/types/marketplace';
import { 
  Home, 
  Key, 
  Car, 
  Tag, 
  Briefcase, 
  Sofa, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'home': <Home className="w-6 h-6" />,
  'key': <Key className="w-6 h-6" />,
  'car': <Car className="w-6 h-6" />,
  'tag': <Tag className="w-6 h-6" />,
  'briefcase': <Briefcase className="w-6 h-6" />,
  'sofa': <Sofa className="w-6 h-6" />,
  'smartphone': <Smartphone className="w-6 h-6" />,
};

export const MarketplaceHub = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching marketplace categories...');
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      console.log('Categories response:', { data, error });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Categories loaded:', data?.length || 0);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Hero Section - Minimalist */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4 font-comfortaa">
                BARA Marketplace
              </h1>
              <p className="text-lg text-gray-600 font-roboto">
                Buy and sell anything across Africa and its diaspora communities
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8 font-comfortaa">
              Browse Categories
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/marketplace/${category.slug}`}
                    className="group border border-gray-200 rounded-lg p-6 hover:border-black transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-black mb-3">
                          {categoryIcons[category.icon] || <Tag className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2 font-comfortaa group-hover:underline">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-roboto">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-gray-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 font-comfortaa">
              Have something to sell?
            </h2>
            <p className="text-gray-600 mb-8 font-roboto">
              Post your ad and reach thousands of potential buyers
            </p>
            <Button
              onClick={() => navigate('/marketplace/post')}
              className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg font-roboto"
            >
              Post Your Ad
            </Button>
          </div>
        </section>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default MarketplaceHub;
