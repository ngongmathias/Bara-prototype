import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing, MarketplaceCategory, MarketplaceSubcategory } from '@/types/marketplace';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';

export const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get('country') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      fetchListings();
    }
  }, [category, selectedCountry, selectedSubcategory, minPrice, maxPrice]);

  const fetchInitialData = async () => {
    try {
      // Fetch category
      const { data: categoryData, error: catError } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (catError) throw catError;
      setCategory(categoryData);

      if (categoryData) {
        // Fetch subcategories
        const { data: subcatData } = await supabase
          .from('marketplace_subcategories')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('display_order');

        setSubcategories(subcatData || []);
      }

      // Fetch countries
      const { data: countriesData } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');

      setCountries(countriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    if (!category) return;

    try {
      setLoading(true);
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_listing_images(image_url, is_primary),
          marketplace_listing_attributes(attribute_key, attribute_value)
        `)
        .eq('category_id', category.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedCountry && selectedCountry !== 'all') {
        query = query.eq('country_id', selectedCountry);
      }

      if (selectedSubcategory && selectedSubcategory !== 'all') {
        query = query.eq('subcategory_id', selectedSubcategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedListings = (data || []).map((listing: any) => ({
        ...listing,
        images: listing.marketplace_listing_images || [],
        attributes: (listing.marketplace_listing_attributes || []).reduce(
          (acc: any, attr: any) => {
            acc[attr.attribute_key] = attr.attribute_value;
            return acc;
          },
          {}
        ),
      }));

      setListings(transformedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!category && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4 font-comfortaa">Category not found</h1>
            <Button onClick={() => navigate('/marketplace')} className="bg-black text-white font-roboto">
              Back to Marketplace
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 font-comfortaa">
              {category?.name}
            </h1>
            <p className="text-gray-600 font-roboto">
              {category?.description}
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subcategory Filter */}
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="All Subcategories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {subcategories.map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-white font-roboto"
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-white font-roboto"
              />
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-gray-300 font-roboto"
                />
              </div>
              <Button
                onClick={fetchListings}
                className="bg-black text-white hover:bg-gray-800 h-12 px-8 font-roboto"
              >
                Search
              </Button>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg font-roboto">No listings found</p>
                <p className="text-gray-400 text-sm font-roboto mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url || 
                                     listing.images?.[0]?.image_url || 
                                     '/placeholder.jpg';

                  return (
                    <div
                      key={listing.id}
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer group"
                    >
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        {listing.is_featured && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                            FEATURED
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="text-2xl font-bold text-black mb-2 font-comfortaa">
                          {listing.currency} {listing.price?.toLocaleString()}
                        </div>

                        <h3 className="font-bold text-black mb-2 group-hover:underline font-roboto">
                          {listing.title}
                        </h3>

                        <div className="flex items-center gap-1 text-sm text-gray-500 font-roboto">
                          <MapPin className="w-4 h-4" />
                          {listing.location_details || 'Location not specified'}
                        </div>
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

export default CategoryPage;
