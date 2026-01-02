import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing, MarketplaceSubcategory } from '@/types/marketplace';
import { Search, MapPin } from 'lucide-react';

export const ClassifiedsPage = () => {
  const navigate = useNavigate();
  
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [featuredListings, setFeaturedListings] = useState<MarketplaceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get classifieds category
      const { data: categoryData } = await supabase
        .from('marketplace_categories')
        .select('id')
        .eq('slug', 'classifieds')
        .single();

      if (categoryData) {
        // Fetch subcategories with counts
        const { data: subcatData } = await supabase
          .from('marketplace_subcategories')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('display_order');

        setSubcategories(subcatData || []);

        // Fetch featured listings
        const { data: listingsData } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            marketplace_listing_images(image_url, is_primary)
          `)
          .eq('category_id', categoryData.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6);

        const transformed = (listingsData || []).map((listing: any) => ({
          ...listing,
          images: listing.marketplace_listing_images || [],
        }));

        setFeaturedListings(transformed);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock category counts
  const categoryData = [
    { name: 'FURNITURE, HOME & GARDEN', count: 54969 },
    { name: 'HOME APPLIANCES', count: 15358 },
    { name: 'MOBILE PHONES & TABLETS', count: 11241 },
    { name: 'SPORTS EQUIPMENT', count: 9202 },
    { name: 'ELECTRONICS', count: 6870 },
    { name: 'COMPUTERS & NETWORKING', count: 6315 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative h-64 flex items-center justify-center"
          style={{
            backgroundImage: 'url(/classifieds-hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4 font-comfortaa">
              Your favorite place for great deals on secondhand items
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for classifieds"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white font-roboto"
              />
            </div>
          </div>
        </section>

        {/* Category Counts */}
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categoryData.map((cat) => (
                <button
                  key={cat.name}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-black transition-colors text-center"
                >
                  <div className="text-sm font-medium text-gray-700 mb-1 font-roboto">
                    {cat.name}
                  </div>
                  <div className="text-lg font-bold text-black font-comfortaa">
                    {cat.count.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Banner */}
        <section className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-black font-comfortaa">Got a verified badge yet?</div>
                  <div className="text-sm text-gray-600 font-roboto">Get more visibility | Enhance your credibility</div>
                </div>
              </div>
              <Button className="bg-black text-white hover:bg-gray-800 font-roboto">
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-black mb-6 font-comfortaa">Featured Listings</h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : featuredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-roboto">No featured listings available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredListings.map((listing) => {
                  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url || 
                                     listing.images?.[0]?.image_url || 
                                     '/placeholder.jpg';

                  return (
                    <div
                      key={listing.id}
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="text-lg font-bold text-black font-comfortaa">
                        {listing.currency} {listing.price?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700 font-roboto line-clamp-1">
                        {listing.title}
                      </div>
                      <div className="text-xs text-gray-500 font-roboto">
                        {listing.location_details?.split(',')[0] || 'Location'}
                      </div>
                      <div className="text-xs text-gray-400 font-roboto">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default ClassifiedsPage;
