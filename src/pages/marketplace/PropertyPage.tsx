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
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

export const PropertyPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [popularLocations, setPopularLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [purpose, setPurpose] = useState<string>(categorySlug === 'property-sale' ? 'Buy' : 'Rent');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [beds, setBeds] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get('country') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || '');
  const [filterTab, setFilterTab] = useState<string>('All');

  useEffect(() => {
    fetchInitialData();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      fetchListings();
    }
  }, [category, selectedCountry, selectedSubcategory, propertyType, beds]);

  const fetchInitialData = async () => {
    try {
      const { data: categoryData } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      setCategory(categoryData);

      if (categoryData) {
        const { data: subcatData } = await supabase
          .from('marketplace_subcategories')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('display_order');

        setSubcategories(subcatData || []);
      }

      const { data: countriesData } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');

      setCountries(countriesData || []);
      
      // Get popular locations from existing listings
      if (categoryData?.id) {
        const { data: locationsData } = await supabase
          .from('marketplace_listings')
          .select('location_details')
          .eq('category_id', categoryData.id)
          .limit(10);
        
        const locations = [...new Set(locationsData?.map(l => l.location_details?.split(',')[0]).filter(Boolean))];
        setPopularLocations(locations.slice(0, 5));
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    if (!category) return;

    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_listing_images(image_url, is_primary),
          marketplace_listing_attributes(attribute_key, attribute_value)
        `)
        .eq('category_id', category.id)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedCountry && selectedCountry !== 'all') {
        query = query.eq('country_id', selectedCountry);
      }

      if (selectedSubcategory && selectedSubcategory !== 'all') {
        query = query.eq('subcategory_id', selectedSubcategory);
      }

      const { data } = await query;

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
    }
  };

  const totalAds = listings.length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-roboto">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-black">🏠</button>
              <span className="text-gray-400">›</span>
              <button onClick={() => navigate('/marketplace')} className="text-gray-600 hover:text-black">
                Marketplace
              </button>
              <span className="text-gray-400">›</span>
              <span className="text-black font-medium">{category?.name}</span>
            </div>
          </div>
        </section>

        {/* Title */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-black font-comfortaa">
              {category?.name} • {totalAds.toLocaleString()} Ads
            </h1>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Purpose */}
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>

              {/* Location */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Enter location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Property Type */}
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="All in Residential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {subcategories.map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-100000">Under $100k</SelectItem>
                  <SelectItem value="100000-250000">$100k - $250k</SelectItem>
                  <SelectItem value="250000-500000">$250k - $500k</SelectItem>
                  <SelectItem value="500000+">$500k+</SelectItem>
                </SelectContent>
              </Select>

              {/* Beds */}
              <Select value={beds} onValueChange={setBeds}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Beds</SelectItem>
                  <SelectItem value="1">1 Bed</SelectItem>
                  <SelectItem value="2">2 Beds</SelectItem>
                  <SelectItem value="3">3 Beds</SelectItem>
                  <SelectItem value="4">4 Beds</SelectItem>
                  <SelectItem value="5+">5+ Beds</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Button */}
              <Button variant="outline" className="font-roboto">
                Filters
              </Button>
            </div>

            {/* Popular Locations */}
            {popularLocations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {popularLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-roboto"
                  >
                    {loc}
                  </button>
                ))}
                <button className="px-3 py-1 text-sm text-blue-600 hover:underline font-roboto">
                  View More
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-4 py-3">
              {['All', 'Ready', 'Off Plan'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-full font-roboto text-sm transition-colors ${
                    filterTab === tab
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600 font-roboto">Show Verified First</span>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-roboto">Sort:</span>
                <Select defaultValue="popular">
                  <SelectTrigger className="w-32 h-8 text-sm font-roboto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" className="font-roboto">
                Save Search
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-64 h-48 bg-gray-200"></div>
                      <div className="flex-1 p-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg font-roboto">No properties found</p>
                <p className="text-gray-400 text-sm font-roboto mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings.map((listing) => {
                  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url || 
                                     listing.images?.[0]?.image_url || 
                                     '/placeholder.jpg';
                  const bedrooms = listing.attributes?.bedrooms || 'N/A';
                  const bathrooms = listing.attributes?.bathrooms || 'N/A';
                  const sqft = listing.attributes?.sqft || 'N/A';

                  return (
                    <div
                      key={listing.id}
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Image */}
                        <div className="relative w-full sm:w-64 h-48 bg-gray-100 flex-shrink-0">
                          <img
                            src={primaryImage}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                          {listing.is_featured && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                              PREMIUM
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            📷 {listing.images?.length || 1}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-4">
                          <div className="text-2xl font-bold text-black mb-2 font-comfortaa">
                            {listing.currency} {listing.price?.toLocaleString()}
                            {categorySlug === 'property-rent' && <span className="text-sm font-normal"> Yearly</span>}
                          </div>

                          <div className="text-sm text-gray-600 mb-2 font-roboto">
                            {listing.attributes?.property_type || 'Property'}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-700 mb-2 font-roboto">
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" /> {bedrooms} beds
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" /> {bathrooms} baths
                            </span>
                            <span className="flex items-center gap-1">
                              <Maximize className="w-4 h-4" /> {sqft} sqft
                            </span>
                          </div>

                          <h3 className="font-medium text-black mb-2 group-hover:underline font-roboto">
                            {listing.title}
                          </h3>

                          <div className="flex items-center gap-1 text-sm text-gray-500 font-roboto">
                            <MapPin className="w-4 h-4" />
                            {listing.location_details || 'Location not specified'}
                          </div>
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

export default PropertyPage;
