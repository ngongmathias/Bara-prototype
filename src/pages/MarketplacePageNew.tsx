import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Car,
  Home,
  Smartphone,
  Briefcase,
  ShoppingBag,
  Users,
  Wrench,
  Baby,
  Package,
  Palette,
  ChevronRight,
  MapPin,
  ChevronDown,
  Tv,
  Shirt,
  PawPrint,
  Music,
  Building2
} from "lucide-react";
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { supabase } from '@/lib/supabase';

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
    name: 'Motors',
    slug: 'motors',
    icon: Car,
    subcategories: ['Cars for Sale', 'Cars for Rent', 'Motorcycles', 'Boats', 'Auto Accessories', 'Auto Parts']
  },
  {
    id: 'property',
    name: 'Properties',
    slug: 'property',
    icon: Home,
    subcategories: ['Apartments for Sale', 'Apartments for Rent', 'Villas for Sale', 'Villas for Rent', 'Land', 'Commercial']
  },
  {
    id: 'mobiles-tablets',
    name: 'Mobiles & Tablets',
    slug: 'mobiles-tablets',
    icon: Smartphone,
    subcategories: ['Mobile Phones', 'Tablets', 'Accessories', 'Smart Watches', 'Mobile Numbers']
  },
  {
    id: 'jobs',
    name: 'Jobs',
    slug: 'jobs',
    icon: Briefcase,
    subcategories: ['Accounting', 'Engineering', 'IT & Software', 'Sales', 'Marketing', 'Healthcare']
  },
  {
    id: 'home-furniture',
    name: 'Home & Office Furniture - Decor',
    slug: 'home-furniture',
    icon: Package,
    subcategories: ['Furniture', 'Office Furniture', 'Home Decor', 'Garden & Outdoor', 'Lighting']
  },
  {
    id: 'electronics',
    name: 'Electronics & Appliances',
    slug: 'electronics',
    icon: Smartphone,
    subcategories: ['TV - Audio - Video', 'Computers - Accessories', 'Cameras', 'Home Appliances', 'Video Games']
  },
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    slug: 'fashion',
    icon: ShoppingBag,
    subcategories: ["Women's Clothing", "Men's Clothing", 'Shoes', 'Bags', 'Watches', 'Beauty Products']
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    icon: Wrench,
    subcategories: ['Business', 'Car', 'Domestic', 'Education', 'Health', 'IT & Web']
  },
  {
    id: 'kids-babies',
    name: 'Kids & Babies',
    slug: 'kids-babies',
    icon: Baby,
    subcategories: ['Baby & Mom Healthcare', 'Baby Clothing', 'Baby Furniture', 'Toys', 'Strollers']
  },
  {
    id: 'pets',
    name: 'Pets - Birds - Ornamental fish',
    slug: 'pets',
    icon: Users,
    subcategories: ['Dogs', 'Cats', 'Birds', 'Fish', 'Pet Accessories', 'Pet Services']
  },
  {
    id: 'hobbies',
    name: 'Hobbies',
    slug: 'hobbies',
    icon: Palette,
    subcategories: ['Antiques - Collectibles', 'Bicycles', 'Books', 'Music', 'Sports Equipment', 'Art']
  },
  {
    id: 'businesses',
    name: 'Businesses & Industrial',
    slug: 'businesses',
    icon: Briefcase,
    subcategories: ['Agriculture', 'Construction', 'Equipment', 'Industrial', 'Restaurants', 'Retail']
  }
];

const MarketplacePageNew = () => {
  const navigate = useNavigate();
  const { selectedCountry } = useCountrySelection();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedListings();
  }, [selectedCountry]);

  const fetchFeaturedListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name, slug),
          countries(name, code, flag_url),
          marketplace_listing_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (selectedCountry) {
        query = query.eq('country_id', selectedCountry.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setFeaturedListings(data || []);
    } catch (error) {
      console.error('Error fetching featured listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    if (selectedCountry) {
      params.set('country', selectedCountry.id);
    }

    navigate(`/marketplace/search?${params.toString()}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    
    if (selectedCountry) {
      params.set('country', selectedCountry.id);
    }

    navigate(`/marketplace/search?${params.toString()}`);
  };

  const handleSubcategoryClick = (categorySlug: string, subcategory: string) => {
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    params.set('subcategory', subcategory);
    
    if (selectedCountry) {
      params.set('country', selectedCountry.id);
    }

    navigate(`/marketplace/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Header />
      <TopBannerAd />

      {/* Top Bar - Search and Post Ad */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find Cars, Mobile Phones and more..."
                  className="pl-12 h-12 text-base font-roboto"
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <Search className="w-5 h-5" />
              </Button>
            </form>

            {/* Post Ad Button */}
            <Button
              onClick={() => navigate('/marketplace/post')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 h-12 whitespace-nowrap"
            >
              Post Your Ad
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.slice(0, 6).map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-blue-600"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
            <button
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">More Categories</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <span className="text-white font-semibold">Verify your account</span>
              <span className="text-white/90 ml-2">and stay unique</span>
            </div>
          </div>
          <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 h-9 text-sm">
            Verify now
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
            Popular Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const emoji = category.id === 'motors' ? '🚗' : 
                           category.id === 'property' ? '🏠' :
                           category.id === 'mobiles-tablets' ? '📱' :
                           category.id === 'jobs' ? '💼' :
                           category.id === 'home-furniture' ? '🛋️' :
                           category.id === 'electronics' ? '📺' :
                           category.id === 'fashion' ? '👗' :
                           category.id === 'services' ? '🔧' :
                           category.id === 'kids-babies' ? '👶' :
                           category.id === 'pets' ? '🐾' :
                           category.id === 'hobbies' ? '🎨' : '🏢';
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{emoji}</span>
                    <div className="flex-1">
                      <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left font-comfortaa"
                      >
                        {category.name}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.subcategories.slice(0, 5).map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => handleSubcategoryClick(category.slug, subcategory)}
                        className="block text-sm text-blue-600 hover:underline text-left font-roboto"
                      >
                        {subcategory}
                      </button>
                    ))}
                    {category.subcategories.length > 5 && (
                      <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 font-roboto"
                      >
                        All in {category.name}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-comfortaa">
                Featured Listings
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate('/marketplace/search?featured=true')}
                className="font-roboto"
              >
                View All
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredListings.map((listing) => {
                  const primaryImage = listing.marketplace_listing_images?.find((img: any) => img.is_primary)?.image_url ||
                                     listing.marketplace_listing_images?.[0]?.image_url;

                  return (
                    <div
                      key={listing.id}
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="relative w-full h-48 bg-gray-100">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                          FEATURED
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="text-xl font-bold text-blue-600 mb-2 font-comfortaa">
                          {listing.currency} {parseFloat(listing.price).toLocaleString()}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 font-roboto">
                          {listing.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-600 font-roboto">
                          <span>{listing.countries?.name}</span>
                          <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default MarketplacePageNew;
