import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Globe, Crown, Search, Building2, Users, Award, ChevronDown, UtensilsCrossed, Wine, Coffee, Car, Home, Scale, Bed, Plane, Building, Scissors, BookOpen, Film, Stethoscope, User, Church, Leaf, Palette, Landmark, Hospital, Book, ShoppingBag, Trees, Pill, Mail, Gamepad2, GraduationCap, Truck, Zap, Wrench, Heart, Dumbbell, Laptop, Shield, Calculator, Megaphone, Briefcase, Camera, Calendar, Music, Sparkles, ChevronLeft, ChevronRight, Grid, List, Map } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Business, BusinessService } from "@/lib/businessService";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/supabase";
import { FeaturedBusinesses } from "@/components/FeaturedBusinesses";
import { CityMapLeaflet } from "@/components/CityMapLeaflet";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Category-specific amenities mapping (same as ListingsPage)
const getCategoryAmenities = (categorySlug: string) => {
  const amenitiesMap: { [key: string]: { icon: any; label: string }[] } = {
    'restaurants': [
      { icon: UtensilsCrossed, label: 'Food' },
      { icon: Wine, label: 'Drinks' }
    ],
    'cafes': [
      { icon: Coffee, label: 'Coffee' },
      { icon: Wine, label: 'Beverages' }
    ],
    'coffee-shops': [
      { icon: Coffee, label: 'Coffee' },
      { icon: Wine, label: 'Beverages' }
    ],
    'bars': [
      { icon: Wine, label: 'Drinks' },
      { icon: UtensilsCrossed, label: 'Snacks' }
    ],
    'hotels': [
      { icon: Bed, label: 'Accommodation' },
      { icon: Wrench, label: 'Services' }
    ],
    'hospitals': [
      { icon: Stethoscope, label: 'Medical' },
      { icon: Heart, label: 'Healthcare' }
    ],
    'clinics': [
      { icon: Stethoscope, label: 'Medical' },
      { icon: Heart, label: 'Healthcare' }
    ],
    'dentists': [
      { icon: Stethoscope, label: 'Dental' },
      { icon: Heart, label: 'Healthcare' }
    ],
    'doctors': [
      { icon: Stethoscope, label: 'Medical' },
      { icon: Heart, label: 'Healthcare' }
    ],
    'pharmacies': [
      { icon: Pill, label: 'Medication' },
      { icon: Heart, label: 'Healthcare' }
    ],
    'auto-repair': [
      { icon: Car, label: 'Automotive' },
      { icon: Wrench, label: 'Repair' }
    ],
    'car-dealerships': [
      { icon: Car, label: 'Automotive' },
      { icon: Building, label: 'Sales' }
    ],
    'real-estate': [
      { icon: Home, label: 'Properties' },
      { icon: Building, label: 'Real Estate' }
    ],
    'lawyers': [
      { icon: Scale, label: 'Legal' },
      { icon: Building, label: 'Services' }
    ],
    'banks': [
      { icon: Building, label: 'Banking' },
      { icon: Shield, label: 'Financial' }
    ],
    'schools': [
      { icon: GraduationCap, label: 'Education' },
      { icon: Book, label: 'Learning' }
    ],
    'universities': [
      { icon: GraduationCap, label: 'Higher Education' },
      { icon: Book, label: 'Learning' }
    ],
    'gyms-fitness': [
      { icon: Dumbbell, label: 'Fitness' },
      { icon: Heart, label: 'Health' }
    ],
    'beauty-salons': [
      { icon: Scissors, label: 'Beauty' },
      { icon: Heart, label: 'Wellness' }
    ],
    'salons': [
      { icon: Scissors, label: 'Beauty' },
      { icon: Heart, label: 'Wellness' }
    ],
    'spas-wellness': [
      { icon: Heart, label: 'Wellness' },
      { icon: Sparkles, label: 'Relaxation' }
    ],
    'museums': [
      { icon: Building2, label: 'Culture' },
      { icon: Palette, label: 'Art' }
    ],
    'galleries-art': [
      { icon: Palette, label: 'Art' },
      { icon: Building2, label: 'Culture' }
    ],
    'cinemas-theatres': [
      { icon: Film, label: 'Entertainment' },
      { icon: Users, label: 'Shows' }
    ],
    'shopping': [
      { icon: ShoppingBag, label: 'Retail' },
      { icon: Building, label: 'Shopping' }
    ],
    'markets': [
      { icon: ShoppingBag, label: 'Retail' },
      { icon: Building, label: 'Shopping' }
    ],
    'airports': [
      { icon: Plane, label: 'Aviation' },
      { icon: Building, label: 'Travel' }
    ],
    'transportation': [
      { icon: Truck, label: 'Transport' },
      { icon: Car, label: 'Vehicles' }
    ],
    'tours': [
      { icon: MapPin, label: 'Tourism' },
      { icon: Users, label: 'Guided Tours' }
    ],
    'recreation': [
      { icon: Gamepad2, label: 'Entertainment' },
      { icon: Users, label: 'Activities' }
    ],
    'parks': [
      { icon: Trees, label: 'Outdoors' },
      { icon: Heart, label: 'Recreation' }
    ],
    'libraries': [
      { icon: Book, label: 'Books' },
      { icon: Building, label: 'Learning' }
    ],
    'bookstores': [
      { icon: Book, label: 'Books' },
      { icon: Building, label: 'Retail' }
    ],
    'post-offices': [
      { icon: Mail, label: 'Mail' },
      { icon: Building, label: 'Services' }
    ],
    'utilities': [
      { icon: Zap, label: 'Utilities' },
      { icon: Building, label: 'Services' }
    ],
    'services': [
      { icon: Wrench, label: 'Services' },
      { icon: Building, label: 'Support' }
    ]
  };
  
  return amenitiesMap[categorySlug] || [
    { icon: Building, label: 'Services' },
    { icon: Heart, label: 'Support' }
  ];
};

export const CountryListingsPage = () => {
  const { t } = useTranslation();
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const navigate = useNavigate();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'rating' | 'name'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [country, setCountry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list'); // Default to list like YP

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set searching state when user types
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Fetch country data
  useEffect(() => {
    const fetchCountry = async () => {
      if (!countrySlug) return;
      
      try {
        setLoading(true);
        const { data, error } = await db.countries()
          .select('id, name, code, flag_url, description')
          .or(`name.ilike.%${countrySlug.replace(/-/g, ' ')}%,name.ilike.${countrySlug.replace(/-/g, ' ')}%,name.ilike.%${countrySlug.replace(/-/g, ' ')}`)
          .single();

        if (error) throw error;
        console.log('Country fetched:', data);
        setCountry(data);
      } catch (error) {
        console.error('Error fetching country:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [countrySlug]);

  // Get businesses in this country
  const { 
    data: searchResults = [], 
    isLoading: isLoadingSearch, 
    error: searchError 
  } = useBusinesses({
    countryCode: country?.code,
    searchTerm: debouncedSearchTerm.trim() || undefined
  });

  // Debug logging
  useEffect(() => {
    console.log('CountryListingsPage Debug:', {
      countrySlug,
      country: country ? { id: country.id, name: country.name, code: country.code } : null,
      searchTerm,
      debouncedSearchTerm,
      searchResultsCount: searchResults.length,
      isLoadingSearch
    });
  }, [countrySlug, country, searchTerm, debouncedSearchTerm, searchResults.length, isLoadingSearch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedFilters, sortBy, sortOrder]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const formatTitle = (str: string) => {
    return str?.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || '';
  };

  const countryName = formatTitle(countrySlug || '');

  // Handle search - now triggers automatically as user types
  const handleSearch = () => {
    // Search is handled by the hook automatically via searchTerm state
    console.log('Search triggered with term:', searchTerm);
  };

  // Handle filter toggle
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle business click
  const handleBusinessClick = async (business: Business) => {
    // Increment click count + log event
    const inc = BusinessService.incrementClickCount(business.id);
    const log = BusinessService.logBusinessClick(business.id, {
      source: 'country-listings' // Using city field to track country context
    });
    
    await Promise.race([
      Promise.allSettled([inc, log]),
      new Promise((resolve) => setTimeout(resolve, 120))
    ]);

    // Navigate to business detail
    navigate(`/countries/${countrySlug}/${business.category?.slug || 'business'}/${business.id}`);
  };

  // Filter businesses based on selected filters
  const filteredBusinesses = searchResults.filter(business => {
    if (selectedFilters.includes('premium') && !business.is_premium) return false;
    if (selectedFilters.includes('verified') && !business.is_verified) return false;
    if (selectedFilters.includes('24h') && !business.hours_of_operation?.includes('24')) return false;
    if (selectedFilters.includes('coupons') && !business.has_coupons) return false;
    if (selectedFilters.includes('order-online') && !business.accepts_orders_online) return false;
    if (selectedFilters.includes('kid-friendly') && !business.is_kid_friendly) return false;
    return true;
  });

  // Sort businesses: sponsored ads first, then by selected sort option
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    // First priority: sponsored ads
    if (a.is_sponsored_ad && !b.is_sponsored_ad) return -1;
    if (!a.is_sponsored_ad && b.is_sponsored_ad) return 1;
    
    // Second priority: selected sort option
    switch (sortBy) {
      case 'rating': {
        const ratingA = getAverageRating(a);
        const ratingB = getAverageRating(b);
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      }
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'distance':
        return sortOrder === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        if (a.is_premium && !b.is_premium) return -1;
        if (!a.is_premium && b.is_premium) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageBusinesses = sortedBusinesses.slice(startIndex, endIndex);

  // Get businesses with valid coordinates for map view
  const businessesWithCoords = sortedBusinesses.filter(b => b.latitude && b.longitude);
  
  // Calculate map center from businesses or use country default
  const mapCenter = businessesWithCoords.length > 0
    ? {
        lat: businessesWithCoords.reduce((sum, b) => sum + (b.latitude || 0), 0) / businessesWithCoords.length,
        lng: businessesWithCoords.reduce((sum, b) => sum + (b.longitude || 0), 0) / businessesWithCoords.length
      }
    : { lat: 0, lng: 20 }; // Default to Africa center

  // Calculate the display number for each business (considering pagination)
  const getDisplayNumber = (businessIndex: number) => {
    const globalIndex = startIndex + businessIndex;
    return sortedBusinesses
      .slice(0, globalIndex + 1)
      .filter(b => !b.is_sponsored_ad)
      .length;
  };

  // Calculate average rating for a business
  const getAverageRating = (business: Business) => {
    if (!business.reviews || business.reviews.length === 0) return 0;
    const totalRating = business.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / business.reviews.length;
  };

  // Get review count
  const getReviewCount = (business: Business) => {
    return business.reviews?.length || 0;
  };

  // Loading skeleton
  if (loading || isLoadingSearch) {
    return (
      <div className="min-h-screen bg-background font-roboto">
        {/* Search Header Skeleton */}
        <div className="bg-yp-yellow py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Results Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="flex gap-2 mb-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (searchError) {
    return (
      <div className="min-h-screen bg-background font-roboto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-comfortaa font-bold text-yp-dark mb-4">
              Error Loading Businesses
            </h2>
            <p className="text-gray-600 mb-6">
              {searchError.message || 'An error occurred while loading businesses. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()} className="bg-yp-blue">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-roboto">
      <Header />
      <TopBannerAd />
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 min-w-0 relative">
              <Input
                type="text"
                placeholder={`Search businesses in ${countryName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full font-roboto bg-white border-gray-300 text-sm sm:text-base pr-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSearch}
              className="bg-yp-blue text-white px-6 sm:px-8 font-roboto w-full sm:w-auto text-sm sm:text-base h-10 sm:h-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              SEARCH
            </Button>
          </div>
        </div>
      </div>

      {/* Country Info Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center space-x-4">
            {country?.flag_url && (
              <img 
                src={country.flag_url} 
                alt={`${country.name} flag`}
                className="w-8 h-6 rounded shadow-sm"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-yp-dark font-comfortaa">
                Businesses in {countryName}
              </h1>
              <p className="text-gray-600">
                {sortedBusinesses.length} businesses found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - YP Style */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <Button 
                variant={selectedFilters.length === 0 ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedFilters([])}
                className="font-roboto text-xs sm:text-sm"
              >
                <Building2 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('listings.all')}</span>
                <span className="sm:hidden">{t('listings.all')}</span>
              </Button>
              
              <Button 
                variant={selectedFilters.includes('order-online') ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => toggleFilter('order-online')}
                className="font-roboto text-xs sm:text-sm"
              >
                <Globe className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('listings.orderOnline')}</span>
                <span className="sm:hidden">Order</span>
              </Button>
              
              <Button 
                variant={selectedFilters.includes('kid-friendly') ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => toggleFilter('kid-friendly')}
                className="font-roboto text-xs sm:text-sm"
              >
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('listings.kidFriendly')}</span>
                <span className="sm:hidden">Kids</span>
              </Button>
              
              <Button 
                variant={selectedFilters.includes('coupons') ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => toggleFilter('coupons')}
                className="font-roboto text-xs sm:text-sm"
              >
                <Award className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('listings.coupons')}</span>
                <span className="sm:hidden">{t('listings.coupons')}</span>
              </Button>
              
              <Button 
                variant={selectedFilters.includes('verified') ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => toggleFilter('verified')}
                className="font-roboto text-xs sm:text-sm"
              >
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('listings.verified')}</span>
                <span className="sm:hidden">{t('listings.verified')}</span>
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto lg:ml-auto">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-600 font-roboto">{t('listings.sort')}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="font-roboto text-xs sm:text-sm">
                      <span className="font-semibold truncate">
                        {sortBy === 'default' ? t('listings.default') : 
                         sortBy === 'distance' ? t('listings.distance') : 
                         sortBy === 'rating' ? t('listings.rating') : t('listings.nameAZ')}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full sm:w-auto">
                    <DropdownMenuItem onClick={() => setSortBy('default')}>
                      <span className="font-semibold">{t('listings.default')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('distance')}>
                      <span className="font-semibold">{t('listings.distance')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('rating')}>
                      <span className="font-semibold">{t('listings.rating')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      <span className="font-semibold">{t('listings.nameAZ')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <span className="text-xs sm:text-sm text-gray-600 font-roboto">
                {sortedBusinesses.length} {t('listings.businessesFound')}
              </span>
              
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
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="flex-1">
            {sortedBusinesses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-roboto font-semibold text-gray-900 mb-2">
                  {t('listings.noBusinessesFound')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `${t('listings.noBusinessesMatching')} "${searchTerm}" in ${countryName}`
                    : `No businesses found in ${countryName}`
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFilters([]);
                  }}
                >
                  {t('listings.clearFilters')}
                </Button>
              </div>
            ) : viewMode === 'map' ? (
              /* Map View */
              <div>
                {businessesWithCoords.length > 0 ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <CityMapLeaflet
                      cityName={country?.name || 'Businesses'}
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
                    <p className="text-gray-400">Businesses in this country don't have location data yet</p>
                  </div>
                )}
                
                {/* Business list below map */}
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-gray-700">{sortedBusinesses.length} Results</h3>
                  {sortedBusinesses.slice(0, 5).map((business) => (
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
                        <h4 className="font-semibold text-gray-900 truncate">{business.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{business.address}</p>
                      </div>
                      {business.is_premium && <Badge className="bg-blue-600 text-white text-xs">Premium</Badge>}
                    </div>
                  ))}
                  {sortedBusinesses.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setViewMode('list')}
                    >
                      View all {sortedBusinesses.length} results
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* YP-Style List/Grid View with Sidebar */
              <div className="flex gap-8">
                {/* Main Content Area */}
                <div className="flex-1">
                  {viewMode === 'list' ? (
                    /* YP-Style List View */
                    <div className="space-y-0 border-t border-gray-200">
                      {currentPageBusinesses.map((business, index) => {
                        const avgRating = getAverageRating(business);
                        const reviewCount = getReviewCount(business);
                        const businessImage = business.images?.[0] || business.logo_url;
                        const listingNumber = getDisplayNumber(index);
                        
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
                                {reviewCount > 0 && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Crown 
                                          key={i} 
                                          className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'text-orange-500 fill-current' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">({reviewCount})</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Right Side: Phone & Address */}
                              <div className="text-right flex-shrink-0 w-48">
                                {business.phone && (
                                  <a 
                                    href={`tel:${business.phone}`}
                                    className="text-xl font-bold text-black hover:text-gray-700 block border-b-2 border-black pb-1"
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
                                  <Badge variant="outline" className="mt-2 text-xs border-gray-800 text-gray-800">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentPageBusinesses.map((business, index) => {
                        const avgRating = getAverageRating(business);
                        const reviewCount = getReviewCount(business);
                        const businessImage = business.images?.[0] || business.logo_url;
                        
                        return (
                          <div 
                            key={business.id} 
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                            onClick={() => handleBusinessClick(business)}
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
                                <h3 className="font-bold text-lg text-black line-clamp-1">{business.name}</h3>
                                {business.is_verified && (
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">✓ Verified</Badge>
                                )}
                              </div>
                              
                              {reviewCount > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Crown 
                                        key={i} 
                                        className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-400">({reviewCount})</span>
                                </div>
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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Right Sidebar - YP Style (only in list view) */}
                {viewMode === 'list' && (
                  <div className="w-72 flex-shrink-0 hidden lg:block">
                    {/* Popular in Country */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Popular in {country?.name}</h3>
                      <div className="space-y-2">
                        {sortedBusinesses.slice(0, 3).map((biz) => (
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
                      <p className="text-2xl font-black text-black mb-2 underline decoration-2">FREE LISTING</p>
                      <p className="text-sm text-gray-600 mb-4">Update your business information in a few steps.</p>
                      <Button 
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        onClick={() => navigate('/claim-listing')}
                      >
                        Claim Your Listing
                      </Button>
                    </div>
                    
                    {/* Featured Businesses */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Featured Businesses</h3>
                      <div className="space-y-3">
                        {sortedBusinesses.filter(b => b.is_premium).slice(0, 3).map((biz) => (
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

            {/* Pagination Component */}
            {totalPages > 1 && (
              <>
                {/* Page Info and Items Per Page */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-6 mb-2 px-4">
                  <div className="text-sm text-gray-600 font-roboto mb-2 sm:mb-0">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedBusinesses.length)} of {sortedBusinesses.length} businesses
                    {totalPages > 1 && (
                      <span className="ml-2">• Page {currentPage} of {totalPages}</span>
                    )}
                  </div>
                  
                  {/* Items Per Page Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-roboto">Show:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-3">
                          {itemsPerPage}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                          10 per page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setItemsPerPage(20)}>
                          20 per page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                          50 per page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-2 mt-4">
                  {/* Previous Page Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          className="w-10 h-10"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </>
                    )}

                    {/* Pages around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10 h-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Next Page Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Featured Businesses */}
          <div className="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
            <FeaturedBusinesses
              countrySlug={countrySlug}
              maxDisplay={6}
            />
            <div className="mt-4 flex justify-center">
              <Link to="/advertise/checkout" className="w-full">
                <Button size="sm" className="w-[58vh] sm:w-full lg:w-[58vh] md:w-[50vh] text-white" variant="secondary">
                  {t('admin.advertiseSeizure')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <BottomBannerAd />
      <Footer />
    </div>
  );
};

