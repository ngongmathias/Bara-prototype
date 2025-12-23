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
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-comfortaa font-bold text-black mb-3">
            Join millions of users to buy and sell anything across Africa
          </h1>
        </section>

        {/* Category tabs - dubizzle style */}
        <section className="mb-12">
          <div className="flex gap-0 overflow-x-auto border-b border-gray-200">
            {categoryTabs.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeCategory === cat.id || (activeCategory === null && idx === 0)
                    ? 'border-black text-black bg-gray-50'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Country grid with subcategory links */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8">
            {popularCountries.map((country) => (
              <div key={country.id} className="space-y-3">
                <h3 className="font-semibold text-black text-base">{country.name}</h3>
                <div className="space-y-2">
                  {categoryTabs.slice(0, 5).map((cat) => (
                    <button
                      key={`${country.id}-${cat.id}`}
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set('category', cat.id);
                        params.set('country', country.id);
                        navigate(`/marketplace/search?${params.toString()}`);
                      }}
                      className="block text-sm text-blue-600 hover:underline text-left"
                    >
                      {cat.label} in {country.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
