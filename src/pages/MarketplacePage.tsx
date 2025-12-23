import React, { useState } from 'react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categoryTabs = [
  { id: 'motors', label: 'Motors', description: 'Cars, bikes, and more' },
  { id: 'property', label: 'Property', description: 'Homes, apartments, and land' },
  { id: 'electronics', label: 'Electronics', description: 'Phones, laptops, and gadgets' },
  { id: 'fashion', label: 'Fashion & Beauty', description: 'Clothing, shoes, and accessories' },
  { id: 'services', label: 'Services', description: 'Home, business, and personal services' },
  { id: 'jobs', label: 'Jobs', description: 'Full-time, part-time, and freelance' },
];

const popularCountries = [
  { id: 'United Arab Emirates', name: 'United Arab Emirates' },
  { id: 'Rwanda', name: 'Rwanda' },
  { id: 'Nigeria', name: 'Nigeria' },
  { id: 'Ghana', name: 'Ghana' },
  { id: 'Kenya', name: 'Kenya' },
  { id: 'South Africa', name: 'South Africa' },
  { id: 'Egypt', name: 'Egypt' },
  { id: 'Morocco', name: 'Morocco' },
];

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const queryValue = searchQuery.trim();

    if (queryValue) {
      params.set('query', queryValue);
    }

    if (activeCategory) {
      params.set('category', activeCategory);
    }

    const searchUrl = params.toString()
      ? `/marketplace/search?${params.toString()}`
      : '/marketplace/search';

    navigate(searchUrl);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);

    const params = new URLSearchParams();
    const queryValue = searchQuery.trim();

    if (queryValue) {
      params.set('query', queryValue);
    }

    if (categoryId) {
      params.set('category', categoryId);
    }

    const searchUrl = params.toString()
      ? `/marketplace/search?${params.toString()}`
      : '/marketplace/search';

    navigate(searchUrl);
  };

  const handleCountryClick = (countryId: string) => {
    const params = new URLSearchParams();
    const queryValue = searchQuery.trim();

    if (queryValue) {
      params.set('query', queryValue);
    }

    if (activeCategory) {
      params.set('category', activeCategory);
    }

    params.set('country', countryId);

    const searchUrl = `/marketplace/search?${params.toString()}`;

    navigate(searchUrl);
  };

  return (
    <div className="relative min-h-screen bg-white font-roboto">

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Top Banner Ad */}
      <div className="relative z-10">
        <TopBannerAd />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero + global search */}
        <section className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-comfortaa font-bold text-black mb-4">
            Bara Marketplace
          </h1>
          <p className="max-w-2xl mx-auto text-gray-600 mb-8">
            Browse by category and country in a workflow inspired by Dubizzle, with our own clean black & white styling.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="What are you looking for?"
                className="pl-12 h-14 text-base border-gray-300 focus:border-black focus:ring-black rounded-xl shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Button type="submit" className="px-8">
                Search marketplace
              </Button>
            </div>
          </form>
        </section>

        {/* Category tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-black">Browse by category</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
            {categoryTabs.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                whileHover={{ y: -1 }}
                className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm text-left whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black'
                }`}
              >
                <div className="font-medium">{cat.label}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Country grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-black">Browse by country</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {popularCountries.map((country) => (
              <motion.button
                key={country.id}
                type="button"
                onClick={() => handleCountryClick(country.id)}
                whileHover={{ y: -2 }}
                className="border border-gray-200 rounded-lg px-4 py-3 text-left bg-white hover:border-black hover:shadow-sm transition-all"
              >
                <div className="font-medium text-black mb-1">{country.name}</div>
                <div className="text-xs text-gray-500">View listings in this country</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Coming soon note for advanced features */}
        <section className="border-t border-gray-100 pt-6 text-sm text-gray-500">
          Advanced filters, Supabase-powered results, posting listings, favorites, and messaging will appear on the
          dedicated results view at <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">/marketplace/search</code>.
        </section>
      </main>
      
      {/* Bottom Banner Ad */}
      <div className="relative z-10">
        <BottomBannerAd />
      </div>

      <Footer />
    </div>
  );
};

export default MarketplacePage;
