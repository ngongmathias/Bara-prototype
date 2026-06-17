import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { 
  Car,
  Key,
  Smartphone,
  Briefcase,
  ShoppingBag,
  Users,
  Wrench,
  Baby,
  Package,
  Palette,
  Tv,
  Building2,
  ChevronRight
} from "lucide-react";

// Shared source of truth — see src/config/marketplaceCategories.ts (Phase 25.4).
import { marketplaceCategories as categories, type Category } from '@/config/marketplaceCategories';

export const AllCategoriesPage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/marketplace/search?category=${categorySlug}`);
  };

  // Helper function to convert subcategory name to slug
  const subcategoryToSlug = (subcategoryName: string): string => {
    return subcategoryName
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubcategoryClick = (categorySlug: string, subcategory: string) => {
    navigate(`/marketplace/search?category=${categorySlug}&subcategory=${subcategoryToSlug(subcategory)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Header />
      <TopBannerAd />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 font-comfortaa">
            All Categories
          </h1>
          <p className="mt-2 text-gray-600 font-roboto">
            Browse all {categories.length} categories and their subcategories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Category Header */}
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => handleCategoryClick(category.slug)}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left font-comfortaa"
                    >
                      {category.name}
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryClick(category.slug, subcategory)}
                      className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline font-roboto py-1"
                    >
                      {subcategory}
                    </button>
                  ))}
                  
                  {/* View All in Category */}
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 font-roboto pt-2 mt-2 border-t border-gray-100"
                  >
                    All in {category.name}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};
