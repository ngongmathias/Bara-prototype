import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  SlidersHorizontal, 
  X,
  Package,
  MapPin,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountrySelection } from '@/context/CountrySelectionContext';

export const SearchResultsNew = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedCountry } = useCountrySelection();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState(searchParams.get('country') || selectedCountry?.id || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, []);

  useEffect(() => {
    performSearch();
  }, [searchParams, selectedCountryFilter]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data } = await supabase
        .from('countries')
        .select('id, name, code, flag_url')
        .order('name');
      
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Get category ID if filtering by category
      let categoryId = null;
      const categoryParam = searchParams.get('category');
      
      if (categoryParam) {
        const { data: categoryData } = await supabase
          .from('marketplace_categories')
          .select('id')
          .eq('slug', categoryParam)
          .maybeSingle();
        
        categoryId = categoryData?.id;
      }

      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name, slug),
          countries(name, code, flag_url),
          marketplace_listing_images(image_url, is_primary)
        `)
        .eq('status', 'active');

      // Search query
      const searchQuery = searchParams.get('q');
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_details.ilike.%${searchQuery}%`);
      }

      // Category filter
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Country filter - use selected country from context or URL param
      const countryParam = searchParams.get('country') || selectedCountryFilter;
      if (countryParam) {
        query = query.eq('country_id', countryParam);
      }

      // Price filters
      const minPriceParam = searchParams.get('min_price');
      const maxPriceParam = searchParams.get('max_price');
      if (minPriceParam) {
        query = query.gte('price', parseFloat(minPriceParam));
      }
      if (maxPriceParam) {
        query = query.lte('price', parseFloat(maxPriceParam));
      }

      // Condition filter
      const conditionParam = searchParams.get('condition');
      if (conditionParam) {
        query = query.eq('condition', conditionParam);
      }

      // Featured filter
      const featuredParam = searchParams.get('featured');
      if (featuredParam === 'true') {
        query = query.eq('is_featured', true);
      }

      // Sorting
      const sortParam = searchParams.get('sort') || 'recent';
      switch (sortParam) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default: // recent
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformed = (data || []).map((listing: any) => ({
        ...listing,
        category: listing.marketplace_categories,
        country: listing.countries,
        images: listing.marketplace_listing_images || [],
      }));

      setResults(transformed);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    
    setSearchParams(params);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    if (selectedCountryFilter && selectedCountryFilter !== 'all') {
      params.set('country', selectedCountryFilter);
    } else {
      params.delete('country');
    }
    
    if (minPrice) {
      params.set('min_price', minPrice);
    } else {
      params.delete('min_price');
    }
    
    if (maxPrice) {
      params.set('max_price', maxPrice);
    } else {
      params.delete('max_price');
    }
    
    if (condition && condition !== 'all') {
      params.set('condition', condition);
    } else {
      params.delete('condition');
    }
    
    if (sortBy) {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }
    
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCountryFilter(selectedCountry?.id || 'all');
    setMinPrice('');
    setMaxPrice('');
    setCondition('all');
    setSortBy('recent');
    
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }
    
    setSearchParams(params);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedCountryFilter && selectedCountryFilter !== selectedCountry?.id,
    minPrice,
    maxPrice,
    condition,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBannerAd />
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search marketplace..."
                  className="pl-10 h-12 font-roboto"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6 relative"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </form>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="font-roboto">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <Select value={selectedCountryFilter} onValueChange={setSelectedCountryFilter}>
                      <SelectTrigger className="font-roboto">
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
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="font-roboto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="font-roboto"
                    />
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="font-roboto">
                        <SelectValue placeholder="Any Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Condition</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="font-roboto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 font-comfortaa">
              {loading ? 'Searching...' : `${results.length} results`}
              {searchParams.get('q') && ` for "${searchParams.get('q')}"`}
            </h1>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
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
          ) : results.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-roboto mb-2">No results found</p>
              <p className="text-gray-400 text-sm font-roboto">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((listing) => {
                const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
                                   listing.images?.[0]?.image_url;

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
                      {listing.is_featured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                          FEATURED
                        </div>
                      )}
                      {listing.condition && (
                        <div className="absolute top-2 left-2 bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded shadow">
                          {listing.condition.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="text-xl font-bold text-blue-600 mb-2 font-comfortaa">
                        {listing.currency} {parseFloat(listing.price).toLocaleString()}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 font-roboto">
                        {listing.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600 font-roboto">
                          <MapPin className="w-3 h-3 mr-1" />
                          {listing.country?.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 font-roboto">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default SearchResultsNew;
