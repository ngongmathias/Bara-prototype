import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { MarketplaceCategory, MarketplaceSubcategory } from '@/types/marketplace';
import { ChevronRight } from 'lucide-react';


export const MarketplaceHub = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [displayedCountries, setDisplayedCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories();
    }
  }, [selectedCategory]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catError) throw catError;
      setCategories(categoriesData || []);
      
      // Set first category as default
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }

      // Fetch countries
      const { data: countriesData, error: countryError } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');

      if (countryError) throw countryError;
      setCountries(countriesData || []);
      
      // Show first 8 countries by default (like Dubizzle shows cities)
      if (countriesData && countriesData.length > 0) {
        setDisplayedCountries(countriesData.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    if (!selectedCategory) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_subcategories')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 font-comfortaa">
              BARA Marketplace
            </h1>
            <p className="text-gray-600 font-roboto">
              Buy and sell anything across Africa and its diaspora communities
            </p>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-roboto transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Country Columns with Subcategories */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : subcategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-roboto">No subcategories available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {displayedCountries.map((country) => (
                  <div key={country.id}>
                    <h3 className="text-lg font-bold text-black mb-3 font-comfortaa">
                      {country.name}
                    </h3>
                    <div className="space-y-2">
                      {subcategories.map((subcat) => (
                        <Link
                          key={`${country.id}-${subcat.id}`}
                          to={`/marketplace/${categories.find(c => c.id === selectedCategory)?.slug}?subcategory=${subcat.slug}&country=${country.id}`}
                          className="block text-blue-600 hover:underline font-roboto text-sm"
                        >
                          {subcat.name} in {country.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show More Countries Button */}
            {!loading && countries.length > 8 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (displayedCountries.length >= countries.length) {
                      setDisplayedCountries(countries.slice(0, 8));
                    } else {
                      setDisplayedCountries(countries);
                    }
                  }}
                  className="font-roboto"
                >
                  {displayedCountries.length >= countries.length ? 'Show Less' : `Show All ${countries.length} Countries`}
                </Button>
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
