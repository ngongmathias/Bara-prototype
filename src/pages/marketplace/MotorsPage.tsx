import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { MotorListing, MarketplaceSubcategory } from '@/types/marketplace';
import { Search, SlidersHorizontal, MapPin, Gauge, Calendar, Settings } from 'lucide-react';

export const MotorsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [listings, setListings] = useState<MotorListing[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [selectedCountry, selectedSubcategory, minPrice, maxPrice, selectedYear, selectedMake]);

  const fetchInitialData = async () => {
    try {
      // Fetch subcategories
      const { data: categoryData } = await supabase
        .from('marketplace_categories')
        .select('id')
        .eq('slug', 'motors')
        .single();

      if (categoryData) {
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
    try {
      setLoading(true);
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_listing_images(image_url, is_primary),
          marketplace_listing_attributes(attribute_key, attribute_value)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      // Apply filters
      if (selectedCountry) {
        query = query.eq('country_id', selectedCountry);
      }

      if (selectedSubcategory) {
        query = query.eq('subcategory_id', selectedSubcategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include attributes as object
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

  const handleSearch = () => {
    fetchListings();
  };

  const popularMakes = ['Mercedes-Benz', 'Toyota', 'BMW', 'Nissan', 'Land Rover', 'Ford', 'Porsche', 'Audi'];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Hero Section - Minimalist */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6 font-comfortaa">
              Motors
            </h1>

            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for cars, motorcycles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 border-gray-300 font-roboto"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-black text-white hover:bg-gray-800 h-12 px-8 font-roboto"
              >
                Search
              </Button>
            </div>

            {/* Subcategory Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={!selectedSubcategory ? 'default' : 'outline'}
                onClick={() => setSelectedSubcategory('')}
                className={`whitespace-nowrap font-roboto ${
                  !selectedSubcategory ? 'bg-black text-white' : 'border-gray-300'
                }`}
              >
                All Motors
              </Button>
              {subcategories.map((subcat) => (
                <Button
                  key={subcat.id}
                  variant={selectedSubcategory === subcat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubcategory(subcat.id)}
                  className={`whitespace-nowrap font-roboto ${
                    selectedSubcategory === subcat.id ? 'bg-black text-white' : 'border-gray-300'
                  }`}
                >
                  {subcat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Make Filter */}
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Make & Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Makes</SelectItem>
                  {popularMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Year</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
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
          </div>
        </section>

        {/* Popular Makes Quick Filter */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {popularMakes.map((make) => (
                <Button
                  key={make}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMake(make)}
                  className="whitespace-nowrap border-gray-300 font-roboto text-sm"
                >
                  {make}
                </Button>
              ))}
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
                <p className="text-gray-500 text-lg font-roboto">No vehicles found</p>
                <p className="text-gray-400 text-sm font-roboto mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url || 
                                     listing.images?.[0]?.image_url || 
                                     '/placeholder-car.jpg';

                  return (
                    <div
                      key={listing.id}
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer group"
                    >
                      {/* Image */}
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

                      {/* Content */}
                      <div className="p-4">
                        {/* Price */}
                        <div className="text-2xl font-bold text-black mb-2 font-comfortaa">
                          {listing.currency} {listing.price?.toLocaleString()}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-black mb-2 group-hover:underline font-roboto">
                          {listing.title}
                        </h3>

                        {/* Specs */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-roboto">
                          {listing.attributes?.year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {listing.attributes.year}
                            </div>
                          )}
                          {listing.attributes?.kilometers && (
                            <div className="flex items-center gap-1">
                              <Gauge className="w-4 h-4" />
                              {listing.attributes.kilometers} km
                            </div>
                          )}
                          {listing.attributes?.transmission && (
                            <div className="flex items-center gap-1">
                              <Settings className="w-4 h-4" />
                              {listing.attributes.transmission}
                            </div>
                          )}
                        </div>

                        {/* Location */}
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

export default MotorsPage;
