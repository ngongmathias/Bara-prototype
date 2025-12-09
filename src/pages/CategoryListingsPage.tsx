import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Star, ArrowLeft, Search, Grid, List, Phone, Globe, Crown, Users, Sparkles, Tag, Map, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { CityMapLeaflet } from "@/components/CityMapLeaflet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  is_premium: boolean;
  is_verified: boolean;
  is_sponsored_ad: boolean;
  has_coupons: boolean;
  is_kid_friendly: boolean;
  accepts_orders_online: boolean;
  category: { name: string; slug: string } | null;
  city: { name: string } | null;
  country: { name: string; code: string } | null;
  reviews: { rating: number }[];
}

type FilterType = 'all' | 'order-online' | 'kid-friendly' | 'coupons' | 'verified';
type SortType = 'default' | 'highest-rated' | 'most-reviewed' | 'newest';

const CategoryListingsPage = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list'); // Default to list like YP
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('default');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (categorySlug && categorySlug !== 'all') {
          // Fetch the category
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', categorySlug)
            .single();
          
          setCurrentCategory(catData || null);

          if (catData) {
            // Fetch businesses for this category - sponsored first, then premium, then rest
            const { data: bizData, error } = await supabase
              .from('businesses')
              .select(`
                *,
                category:categories(name, slug),
                city:cities(name),
                country:countries(name, code),
                reviews(rating)
              `)
              .eq('category_id', catData.id)
              .eq('status', 'active')
              .order('is_sponsored_ad', { ascending: false })
              .order('is_premium', { ascending: false })
              .order('name', { ascending: true });

            if (error) {
              console.error("Error fetching businesses:", error);
            } else {
              console.log("Fetched businesses:", bizData?.length, bizData);
              setBusinesses(bizData || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  const handleBusinessClick = (business: Business) => {
    const citySlug = business.city?.name?.toLowerCase().replace(/\s+/g, '-') || 'city';
    const catSlug = business.category?.slug || 'business';
    navigate(`/${citySlug}/${catSlug}/${business.id}`);
  };

  const getAverageRating = (reviews: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  // Apply filters and sorting
  const filteredBusinesses = businesses
    .filter(biz => {
      // Search filter
      const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Feature filters
      if (activeFilter === 'order-online' && !biz.accepts_orders_online) return false;
      if (activeFilter === 'kid-friendly' && !biz.is_kid_friendly) return false;
      if (activeFilter === 'coupons' && !biz.has_coupons) return false;
      if (activeFilter === 'verified' && !biz.is_verified) return false;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'highest-rated':
          return getAverageRating(b.reviews) - getAverageRating(a.reviews);
        case 'most-reviewed':
          return (b.reviews?.length || 0) - (a.reviews?.length || 0);
        case 'newest':
          return 0; // Would need created_at field
        default:
          // Default: sponsored first, then premium
          if (a.is_sponsored_ad !== b.is_sponsored_ad) return a.is_sponsored_ad ? -1 : 1;
          if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
          return a.name.localeCompare(b.name);
      }
    });

  // Get businesses with valid coordinates for map view
  const businessesWithCoords = filteredBusinesses.filter(b => b.latitude && b.longitude);
  
  // Calculate map center from businesses
  const mapCenter = businessesWithCoords.length > 0
    ? {
        lat: businessesWithCoords.reduce((sum, b) => sum + (b.latitude || 0), 0) / businessesWithCoords.length,
        lng: businessesWithCoords.reduce((sum, b) => sum + (b.longitude || 0), 0) / businessesWithCoords.length
      }
    : { lat: 0, lng: 0 };

  if (!currentCategory && !loading) {
    return (
      <div className="relative min-h-screen bg-white">
        <MatrixRain />
        <div className="absolute inset-0 bg-white/60 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">Category not found</h1>
            <Button onClick={() => navigate('/categories')} className="bg-black hover:bg-gray-800">
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <MatrixRain />
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button & Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">All Categories</span>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">
                  {currentCategory?.name || 'Loading...'}
                </h1>
                <p className="text-gray-500 mt-2">
                  {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search within category */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search in category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/80 border-gray-200 focus:border-black rounded-xl"
                  />
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="Map View"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* YP-Style Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4"
          >
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: '≡' },
                { key: 'order-online', label: 'Order Online' },
                { key: 'kid-friendly', label: 'Kid Friendly' },
                { key: 'coupons', label: 'Coupons' },
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key as FilterType)}
                  className={activeFilter === filter.key ? 'bg-gray-800 text-white' : ''}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Sort Dropdown - Right aligned like YP */}
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    Sort: <span className="font-semibold ml-1">{sortBy === 'default' ? 'Default' : sortBy === 'highest-rated' ? 'Highest Rated' : sortBy === 'most-reviewed' ? 'Most Reviewed' : 'Newest'}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('default')}>Default</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('highest-rated')}>Highest Rated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('most-reviewed')}>Most Reviewed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Sponsored Banner */}
          <TopBannerAd />

          {/* Business Listings */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No businesses found</h3>
              <p className="text-gray-400 mb-6">Be the first to list your business in this category</p>
              <Button onClick={() => navigate('/claim-listing')} className="bg-black hover:bg-gray-800">
                Add Your Business
              </Button>
            </motion.div>
          ) : viewMode === 'map' ? (
            /* Map View */
            <div className="mt-8">
              {businessesWithCoords.length > 0 ? (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <CityMapLeaflet
                    cityName={currentCategory?.name || 'Businesses'}
                    latitude={mapCenter.lat}
                    longitude={mapCenter.lng}
                    businesses={businessesWithCoords.map(b => ({
                      id: b.id,
                      name: b.name,
                      latitude: b.latitude!,
                      longitude: b.longitude!,
                      address: b.address || '',
                      category: b.category?.name || '',
                      is_premium: b.is_premium,
                      is_verified: b.is_verified
                    }))}
                    height="500px"
                  />
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                  <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No locations available</h3>
                  <p className="text-gray-400">Businesses in this category don't have location data yet</p>
                </div>
              )}
              
              {/* Business list below map */}
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-700">{filteredBusinesses.length} Results</h3>
                {filteredBusinesses.slice(0, 5).map((business) => (
                  <div
                    key={business.id}
                    onClick={() => handleBusinessClick(business)}
                    className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {business.logo_url ? (
                        <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-black truncate">{business.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{business.address}</p>
                    </div>
                    {business.is_premium && <Badge className="bg-blue-600 text-white text-xs">Premium</Badge>}
                  </div>
                ))}
                {filteredBusinesses.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setViewMode('list')}
                  >
                    View all {filteredBusinesses.length} results
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* YP-Style List/Grid View */
            <div className="flex gap-8 mt-6">
              {/* Main Content Area */}
              <div className="flex-1">
                {viewMode === 'list' ? (
                  /* YP-Style List View */
                  <div className="space-y-0 border-t border-gray-200">
                    {filteredBusinesses.map((business, index) => {
                      const businessImage = business.images?.[0] || business.logo_url;
                      const listingNumber = index + 1;
                      
                      return (
                        <div
                          key={business.id}
                          className={`border-b border-gray-200 py-4 ${
                            business.is_sponsored_ad ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <div 
                              className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden cursor-pointer"
                              onClick={() => handleBusinessClick(business)}
                            >
                              {businessImage ? (
                                <img src={businessImage} alt={business.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="w-12 h-12 text-gray-300" />
                                </div>
                              )}
                            </div>
                            
                            {/* Middle: Business Info */}
                            <div className="flex-1 min-w-0">
                              {/* Business Name */}
                              <div className="flex items-start gap-2">
                                {!business.is_sponsored_ad && (
                                  <span className="text-gray-500 font-medium">{listingNumber}.</span>
                                )}
                                <h3 
                                  className="text-blue-600 hover:underline font-semibold cursor-pointer text-lg"
                                  onClick={() => handleBusinessClick(business)}
                                >
                                  {business.name}
                                </h3>
                                {business.is_sponsored_ad && (
                                  <Badge className="bg-blue-600 text-white text-xs ml-2">Ad</Badge>
                                )}
                              </div>
                              
                              {/* Category Tags */}
                              <p className="text-sm text-gray-600 mt-1">
                                {business.category?.name}
                                {business.has_coupons && ', Coupons Available'}
                                {business.is_kid_friendly && ', Kid Friendly'}
                              </p>
                              
                              {/* Action Links - YP Style */}
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                {business.website && (
                                  <a 
                                    href={`https://${business.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Website
                                  </a>
                                )}
                                {business.address && (
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Directions
                                  </a>
                                )}
                                <span 
                                  className="text-blue-600 hover:underline cursor-pointer"
                                  onClick={() => handleBusinessClick(business)}
                                >
                                  More Info
                                </span>
                              </div>
                              
                              {/* Rating */}
                              {business.reviews && business.reviews.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${i < Math.floor(getAverageRating(business.reviews)) ? 'text-orange-500 fill-current' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">({business.reviews.length})</span>
                                </div>
                              )}
                              
                              {/* Description snippet */}
                              {business.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  "{business.description}"
                                </p>
                              )}
                            </div>
                            
                            {/* Right Side: Phone & Address */}
                            <div className="text-right flex-shrink-0 w-48">
                              {business.phone && (
                                <a 
                                  href={`tel:${business.phone}`}
                                  className="text-lg font-semibold text-green-700 hover:underline block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {business.phone}
                                </a>
                              )}
                              {business.address && (
                                <p className="text-sm text-gray-600 mt-1">{business.address}</p>
                              )}
                              {business.city && (
                                <p className="text-sm text-gray-500">{business.city.name}</p>
                              )}
                              {business.is_verified && (
                                <Badge variant="outline" className="mt-2 text-xs border-green-500 text-green-600">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBusinesses.map((business, index) => {
                      const businessImage = business.images?.[0] || business.logo_url;
                      
                      return (
                        <motion.div
                          key={business.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.05, 0.3) }}
                          onClick={() => handleBusinessClick(business)}
                          className={`bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group relative ${
                            business.is_sponsored_ad 
                              ? 'border-blue-400 ring-2 ring-blue-200' 
                              : business.is_premium 
                                ? 'border-blue-400 ring-1 ring-blue-100' 
                                : 'border-gray-200 hover:border-black'
                          }`}
                        >
                          {business.is_sponsored_ad && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge className="bg-blue-600 text-white text-xs">Ad</Badge>
                            </div>
                          )}
                          
                          <div className="bg-gray-100 h-48 flex items-center justify-center relative">
                            {businessImage ? (
                              <img src={businessImage} alt={business.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-16 h-16 text-gray-300" />
                            )}
                            {business.is_premium && !business.is_sponsored_ad && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-600 text-white text-xs">Premium</Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-lg text-black group-hover:underline line-clamp-1">{business.name}</h3>
                              {business.is_verified && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">✓ Verified</Badge>
                              )}
                            </div>
                            
                            {business.reviews && business.reviews.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < Math.floor(getAverageRating(business.reviews)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-400">({business.reviews.length})</span>
                              </div>
                            )}
                            
                            {business.description && (
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{business.description}</p>
                            )}
                            
                            <div className="mt-3 space-y-1">
                              {business.address && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{business.address}</span>
                                </div>
                              )}
                              {business.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  <span>{business.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Right Sidebar - YP Style */}
              {viewMode === 'list' && (
                <div className="w-72 flex-shrink-0 hidden lg:block">
                  {/* Popular in Category */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Popular {currentCategory?.name}</h3>
                    <div className="space-y-2">
                      {filteredBusinesses.slice(0, 3).map((biz) => (
                        <div 
                          key={biz.id}
                          className="text-sm text-blue-600 hover:underline cursor-pointer"
                          onClick={() => handleBusinessClick(biz)}
                        >
                          {biz.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Manage Listing CTA */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 text-center">
                    <h3 className="font-semibold text-gray-800 mb-2">Manage your</h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">free listing</p>
                    <p className="text-sm text-gray-600 mb-4">Update your business information in a few steps.</p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => navigate('/claim-listing')}
                    >
                      Claim Your Listing
                    </Button>
                  </div>
                  
                  {/* Featured Businesses */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Featured {currentCategory?.name}</h3>
                    <div className="space-y-3">
                      {filteredBusinesses.filter(b => b.is_premium).slice(0, 3).map((biz) => (
                        <div 
                          key={biz.id}
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2"
                          onClick={() => handleBusinessClick(biz)}
                        >
                          <p className="text-sm font-medium text-blue-600 hover:underline">{biz.name}</p>
                          {biz.phone && (
                            <p className="text-xs text-gray-600">{biz.phone}</p>
                          )}
                          {biz.address && (
                            <p className="text-xs text-gray-500 truncate">{biz.address}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Banner */}
          <div className="mt-12">
            <BottomBannerAd />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListingsPage;
