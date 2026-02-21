import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
import { MarketplaceListing, MarketplaceCategory, MarketplaceSubcategory } from '@/types/marketplace';
import { MapPin, Gauge, Calendar } from 'lucide-react';
import { VehicleCard } from '@/components/marketplace/SpecializedCards';

export const MotorsPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [popularMakes, setPopularMakes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [city, setCity] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [year, setYear] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get('country') || '');

  useEffect(() => {
    fetchInitialData();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      fetchListings();
    }
  }, [category, selectedCountry, make, year, priceRange]);

  const fetchInitialData = async () => {
    try {
      const { data: categoryData } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('slug', 'motors')
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

      // Popular makes
      setPopularMakes(['Mercedes-Benz', 'Toyota', 'BMW', 'Nissan', 'Land Rover', 'Ford', 'Porsche', 'Audi']);

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
              <button onClick={() => navigate('/marketplace')} className="text-gray-600 hover:text-black">
                Marketplace
              </button>
              <span className="text-gray-400">›</span>
              <button onClick={() => navigate('/marketplace/motors')} className="text-gray-600 hover:text-black">
                Motors
              </button>
              <span className="text-gray-400">›</span>
              <span className="text-black font-medium">Used Cars</span>
            </div>
          </div>
        </section>

        {/* Title */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-black font-comfortaa">
              Used Cars for Sale • {totalAds.toLocaleString()} Ads
            </h1>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* City */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Make */}
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Make And Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {popularMakes.map((makeName) => (
                    <SelectItem key={makeName} value={makeName}>
                      {makeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-20000">Under $20k</SelectItem>
                  <SelectItem value="20000-40000">$20k - $40k</SelectItem>
                  <SelectItem value="40000-60000">$40k - $60k</SelectItem>
                  <SelectItem value="60000+">$60k+</SelectItem>
                </SelectContent>
              </Select>

              {/* Year */}
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Year</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2019">2019</SelectItem>
                </SelectContent>
              </Select>

              {/* Kilometers */}
              <Select value={kilometers} onValueChange={setKilometers}>
                <SelectTrigger className="bg-white font-roboto">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Kilometers</SelectItem>
                  <SelectItem value="0-50000">Under 50,000 km</SelectItem>
                  <SelectItem value="50000-100000">50k - 100k km</SelectItem>
                  <SelectItem value="100000+">100k+ km</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Button */}
              <Button variant="outline" className="font-roboto">
                Filters
              </Button>
            </div>

            {/* Popular Makes */}
            <div className="mt-3 flex flex-wrap gap-2">
              {popularMakes.slice(0, 7).map((makeName) => (
                <button
                  key={makeName}
                  onClick={() => setMake(makeName)}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-roboto"
                >
                  {makeName}
                </button>
              ))}
              <button className="px-3 py-1 text-sm text-blue-600 hover:underline font-roboto">
                View More
              </button>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-roboto">Sort:</span>
                <Select defaultValue="default">
                  <SelectTrigger className="w-32 h-8 text-sm font-roboto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg font-roboto">No cars found</p>
                <p className="text-gray-400 text-sm font-roboto mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings.map((listing) => (
                  <VehicleCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                  />
                ))}
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
