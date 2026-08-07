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
import { MonetizationService } from '@/lib/monetizationService';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { PropertyCard, VehicleCard, JobCard } from '@/components/marketplace/SpecializedCards';

/** Listings per page. Matches the search results page. */
const PAGE_SIZE = 24;

export const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [subcategories, setSubcategories] = useState<MarketplaceSubcategory[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get('country') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // Don't fetch if this is a reserved slug - it should be handled by a specific route
    const reservedSlugs = ['post', 'categories', 'search', 'my-listings', 'favorites', 'edit'];
    if (categorySlug && reservedSlugs.includes(categorySlug)) {
      setLoading(false);
      return;
    }
    fetchInitialData();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      fetchListings();
    }
  }, [category, selectedCountry, selectedSubcategory, minPrice, maxPrice, page]);

  // Changing a filter invalidates the current page — staying on page 5 of a
  // freshly-filtered set shows an empty grid and reads as "no results".
  useEffect(() => {
    setPage(1);
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
        `, { count: 'exact' })
        .eq('category_id', category.id)
        .eq('status', 'active')
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedCountry && selectedCountry !== 'all') {
        query = query.eq('country_id', selectedCountry);
      }

      if (selectedSubcategory && selectedSubcategory !== 'all') {
        query = query.eq('subcategory_id', selectedSubcategory);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,seller_name.ilike.%${searchQuery.trim()}%`);
      }

      // Paginate rather than a hard .limit(20): the old cap silently hid
      // everything past the twentieth listing with no way to reach it, so a
      // category with 200 items looked like a category with 20.
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      setTotalCount(count ?? 0);

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

      // Track ROI impressions for premium listings
      transformedListings.filter(l => l.is_premium).forEach(listing => {
        MonetizationService.trackInteraction(listing.id, 'listing', 'impression');
      });
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
              /* An empty category is a supply opportunity, not a dead end.
                 "No listings found" wasted it — on a marketplace short of
                 inventory, the visitor looking for a thing is often also
                 someone who owns one. */
              <div className="text-center py-16 max-w-md mx-auto">
                <p className="text-lg font-bold text-gray-900 font-comfortaa">
                  No {category?.name?.toLowerCase()} listed here yet
                </p>
                <p className="text-gray-500 text-sm font-roboto mt-2 mb-6">
                  {selectedCountry || selectedSubcategory || searchQuery.trim()
                    ? 'Try removing a filter — or be the first to list one.'
                    : 'Be the first to list one. It takes about two minutes.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/marketplace/post')}
                    className="bg-gray-900 hover:bg-black text-white font-bold"
                  >
                    Sell yours
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/marketplace')}
                    className="font-bold"
                  >
                    Browse everything
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const props = {
                    key: listing.id,
                    listing,
                    onClick: () => navigate(`/marketplace/ad/${listing.id}`)
                  };

                  if (categorySlug?.includes('property')) {
                    return <PropertyCard {...props} />;
                  }
                  if (categorySlug === 'motors') {
                    return <VehicleCard {...props} />;
                  }
                  if (categorySlug === 'jobs') {
                    return <JobCard {...props} />;
                  }

                  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
                    listing.images?.[0]?.image_url ||
                    '/placeholder.jpg';

                  return (
                    <div
                      key={listing.id}
                      onClick={props.onClick}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer group"
                    >
                      <div className="relative h-48 bg-gray-100">
                        <img
                          loading="lazy" src={primaryImage}
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

            {!loading && totalCount > PAGE_SIZE && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500 font-roboto tabular-nums">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of{' '}
                  {totalCount.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 font-roboto tabular-nums px-2">
                    Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    Next
                  </Button>
                </div>
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
