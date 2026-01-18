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

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: any;
  subcategories: string[];
}

const categories: Category[] = [
  {
    id: 'motors',
    name: 'Vehicles',
    slug: 'motors',
    icon: Car,
    subcategories: ['Cars for Sale', 'Cars for Rent', 'Motorcycles', 'Boats', 'Trucks & Commercial Vehicles', 'Auto Accessories', 'Auto Parts & Spare Parts', 'Heavy Vehicles', 'Buses']
  },
  {
    id: 'property-sale',
    name: 'Properties',
    slug: 'property-sale',
    icon: Key,
    subcategories: ['Apartments for Sale', 'Apartments for Rent', 'Villas for Sale', 'Villas for Rent', 'Townhouses for Sale', 'Townhouses for Rent', 'Penthouses', 'Residential Land', 'Commercial for Sale', 'Commercial for Rent']
  },
  {
    id: 'mobile-tablets',
    name: 'Mobiles & Tablets',
    slug: 'mobile-tablets',
    icon: Smartphone,
    subcategories: ['Mobile Phones', 'Tablets', 'Accessories', 'Smart Watches', 'Mobile Numbers']
  },
  {
    id: 'jobs',
    name: 'Jobs',
    slug: 'jobs',
    icon: Briefcase,
    subcategories: ['Accounting, Finance & Banking', 'Engineering', 'IT & Software', 'Sales', 'Marketing', 'Healthcare', 'Education & Training', 'Hospitality & Tourism', 'Customer Service', 'Administration']
  },
  {
    id: 'furniture-garden',
    name: 'Home & Office Furniture - Decor',
    slug: 'furniture-garden',
    icon: Package,
    subcategories: ['Furniture', 'Office Furniture', 'Home Decor', 'Garden & Outdoor', 'Lighting', 'Curtains & Blinds', 'Carpets & Rugs']
  },
  {
    id: 'electronics',
    name: 'Electronics & Appliances',
    slug: 'electronics',
    icon: Tv,
    subcategories: ['TV - Audio - Video', 'Computers - Accessories', 'Cameras', 'Home Appliances', 'Video Games', 'Gaming Consoles', 'Air Conditioners', 'Washing Machines', 'Refrigerators']
  },
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    slug: 'fashion',
    icon: ShoppingBag,
    subcategories: ["Women's Clothing", "Men's Clothing", 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Beauty Products', 'Perfumes', 'Sunglasses']
  },
  {
    id: 'pets',
    name: 'Pets - Birds - Ornamental fish',
    slug: 'pets',
    icon: Users,
    subcategories: ['Dogs', 'Cats', 'Birds', 'Fish', 'Pet Accessories', 'Pet Food', 'Pet Services', 'Livestock']
  },
  {
    id: 'kids-babies',
    name: 'Kids & Babies',
    slug: 'kids-babies',
    icon: Baby,
    subcategories: ['Baby & Mom Healthcare', 'Baby Clothing', 'Baby Furniture', 'Toys', 'Strollers', 'Car Seats', 'Baby Gear', 'Kids Clothing', 'Kids Shoes']
  },
  {
    id: 'hobbies',
    name: 'Hobbies',
    slug: 'hobbies',
    icon: Palette,
    subcategories: ['Antiques - Collectibles', 'Bicycles', 'Books', 'Music Instruments', 'Sports Equipment', 'Camping & Outdoor', 'Art & Crafts']
  },
  {
    id: 'business-industrial',
    name: 'Businesses & Industrial',
    slug: 'business-industrial',
    icon: Building2,
    subcategories: ['Agriculture', 'Construction', 'Equipment', 'Industrial Machinery', 'Restaurants', 'Retail Businesses', 'Manufacturing']
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    icon: Wrench,
    subcategories: ['Business', 'Car', 'Domestic', 'Education', 'Health', 'IT & Web', 'Legal Services', 'Moving & Storage', 'Event Services']
  }
];

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
