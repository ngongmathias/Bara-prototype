import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { getSoldLabel } from '@/config/categoryFieldConfigs';
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
  Calendar,
  BookmarkPlus,
  Clock
} from 'lucide-react';

const SEARCH_HISTORY_KEY = 'bara.marketplace.searchHistory';
const MAX_HISTORY = 10;

const readSearchHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
};

const writeSearchHistory = (history: string[]) => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
};
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { MarketplaceNav } from '@/components/marketplace/MarketplaceNav';
import { EmptyState } from '@/components/EmptyState';

export const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedCountry } = useCountrySelection();
  const { user } = useUser();
  const { toast } = useToast();

  const saveCurrentSearch = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save searches', variant: 'destructive' });
      return;
    }
    const queryString = searchParams.toString();
    const name = searchParams.get('q') || searchParams.get('category') || 'My saved search';
    try {
      const { error } = await supabase.from('marketplace_saved_searches').insert({
        user_id: user.id,
        name,
        query_string: queryString,
        filters: Object.fromEntries(searchParams.entries()),
        email_alerts: false,
      });
      if (error) throw error;
      toast({ title: 'Search saved!', description: 'You can find it in your dashboard.' });
    } catch (err) {
      console.error('Save search failed', err);
      toast({ title: 'Error', description: 'Could not save search', variant: 'destructive' });
    }
  };
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => readSearchHistory());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState(searchParams.get('country') || selectedCountry?.id || '');
  const [selectedCurrency, setSelectedCurrency] = useState(searchParams.get('currency') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  
  // Category-specific filters - Motors/Vehicles
  const [carBrand, setCarBrand] = useState(searchParams.get('brand') || '');
  const [carBodyType, setCarBodyType] = useState(searchParams.get('body_type') || '');
  const [carYear, setCarYear] = useState(searchParams.get('year') || '');
  const [carFuelType, setCarFuelType] = useState(searchParams.get('fuel_type') || '');
  const [carTransmission, setCarTransmission] = useState(searchParams.get('transmission') || '');
  const [carMileage, setCarMileage] = useState(searchParams.get('mileage') || '');
  
  // Properties
  const [propertyBedrooms, setPropertyBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [propertyBathrooms, setPropertyBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [propertyArea, setPropertyArea] = useState(searchParams.get('area') || '');
  const [propertyFurnished, setPropertyFurnished] = useState(searchParams.get('furnished') || '');
  
  // Electronics & Mobiles
  const [electronicsBrand, setElectronicsBrand] = useState(searchParams.get('electronics_brand') || '');
  const [electronicsWarranty, setElectronicsWarranty] = useState(searchParams.get('warranty') || '');
  
  // Fashion
  const [fashionSize, setFashionSize] = useState(searchParams.get('size') || '');
  const [fashionGender, setFashionGender] = useState(searchParams.get('gender') || '');
  const [fashionBrand, setFashionBrand] = useState(searchParams.get('fashion_brand') || '');
  
  // Jobs
  const [jobType, setJobType] = useState(searchParams.get('job_type') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experience') || '');
  const [workType, setWorkType] = useState(searchParams.get('work_type') || '');
  
  // Pets
  const [petType, setPetType] = useState(searchParams.get('pet_type') || '');
  const [petAge, setPetAge] = useState(searchParams.get('pet_age') || '');
  const [petGender, setPetGender] = useState(searchParams.get('pet_gender') || '');
  
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, []);
  
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

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
  
  const fetchSubcategories = async (categorySlug: string) => {
    try {
      const { data: categoryData } = await supabase
        .from('marketplace_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();
      
      if (categoryData) {
        const { data } = await supabase
          .from('marketplace_subcategories')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('display_order');
        
        setSubcategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Get category ID if filtering by category
      let categoryId = null;
      let subcategoryId = null;
      const categoryParam = searchParams.get('category');
      const subcategoryParam = searchParams.get('subcategory');
      
      if (categoryParam) {
        const { data: categoryData } = await supabase
          .from('marketplace_categories')
          .select('id')
          .eq('slug', categoryParam)
          .maybeSingle();
        
        categoryId = categoryData?.id;
      }
      
      // Get subcategory ID if filtering by subcategory
      if (subcategoryParam) {
        const { data: subcategoryData } = await supabase
          .from('marketplace_subcategories')
          .select('id')
          .eq('slug', subcategoryParam)
          .maybeSingle();
        
        subcategoryId = subcategoryData?.id;
      }

      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name, slug),
          marketplace_subcategories(name, slug),
          countries(name, code, flag_url),
          marketplace_listing_images(image_url, is_primary)
        `)
        .eq('status', 'active');

      // Search query - search in title, description, location, and seller_name
      const searchQuery = searchParams.get('q');
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_details.ilike.%${searchQuery}%,seller_name.ilike.%${searchQuery}%`);
      }

      // Category filter
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      // Subcategory filter
      if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
      }

      // Country filter - use selected country from context or URL param
      const countryParam = searchParams.get('country') || selectedCountryFilter;
      if (countryParam) {
        query = query.eq('country_id', countryParam);
      }

      // Currency filter
      const currencyParam = searchParams.get('currency');
      if (currencyParam && currencyParam !== 'all') {
        query = query.eq('currency', currencyParam);
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
      
      // Motors attribute filters
      const brandParam = searchParams.get('brand');
      if (brandParam) query = query.contains('attributes', { make: brandParam });
      
      const bodyTypeParam = searchParams.get('body_type');
      if (bodyTypeParam) query = query.contains('attributes', { body_type: bodyTypeParam });
      
      const yearParam = searchParams.get('year');
      if (yearParam) query = query.contains('attributes', { year: yearParam });
      
      const fuelTypeParam = searchParams.get('fuel_type');
      if (fuelTypeParam) query = query.contains('attributes', { fuel_type: fuelTypeParam });
      
      const transmissionParam = searchParams.get('transmission');
      if (transmissionParam) query = query.contains('attributes', { transmission: transmissionParam });
      
      const mileageParam = searchParams.get('mileage');
      if (mileageParam) query = query.contains('attributes', { mileage: mileageParam });
      
      // Property attribute filters
      const bedroomsParam = searchParams.get('bedrooms');
      if (bedroomsParam) query = query.contains('attributes', { bedrooms: parseInt(bedroomsParam) });
      
      const bathroomsParam = searchParams.get('bathrooms');
      if (bathroomsParam) query = query.contains('attributes', { bathrooms: parseInt(bathroomsParam) });
      
      const propertyTypeParam = searchParams.get('property_type');
      if (propertyTypeParam) query = query.contains('attributes', { property_type: propertyTypeParam });
      
      const areaParam = searchParams.get('area');
      if (areaParam) query = query.contains('attributes', { area: areaParam });
      
      const furnishedParam = searchParams.get('furnished');
      if (furnishedParam) query = query.contains('attributes', { furnished: furnishedParam });
      
      // Electronics attribute filters
      const electronicsBrandParam = searchParams.get('electronics_brand');
      if (electronicsBrandParam) query = query.contains('attributes', { brand: electronicsBrandParam });
      
      const warrantyParam = searchParams.get('warranty');
      if (warrantyParam) query = query.contains('attributes', { warranty: warrantyParam });
      
      // Fashion attribute filters
      const sizeParam = searchParams.get('size');
      if (sizeParam) query = query.contains('attributes', { size: sizeParam });
      
      const genderParam = searchParams.get('gender');
      if (genderParam) query = query.contains('attributes', { gender: genderParam });
      
      const fashionBrandParam = searchParams.get('fashion_brand');
      if (fashionBrandParam) query = query.contains('attributes', { brand: fashionBrandParam });
      
      // Jobs attribute filters
      const jobTypeParam = searchParams.get('job_type');
      if (jobTypeParam) query = query.contains('attributes', { job_type: jobTypeParam });
      
      const experienceParam = searchParams.get('experience');
      if (experienceParam) query = query.contains('attributes', { experience_level: experienceParam });
      
      const workTypeParam = searchParams.get('work_type');
      if (workTypeParam) query = query.contains('attributes', { work_type: workTypeParam });
      
      // Pets attribute filters
      const petTypeParam = searchParams.get('pet_type');
      if (petTypeParam) query = query.contains('attributes', { pet_type: petTypeParam });
      
      const petAgeParam = searchParams.get('pet_age');
      if (petAgeParam) query = query.contains('attributes', { pet_age: petAgeParam });
      
      const petGenderParam = searchParams.get('pet_gender');
      if (petGenderParam) query = query.contains('attributes', { pet_gender: petGenderParam });

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

      let transformed = (data || []).map((listing: any) => ({
        ...listing,
        category: listing.marketplace_categories,
        country: listing.countries,
        images: listing.marketplace_listing_images || [],
      }));

      // Also search by store name: find stores matching the query,
      // then fetch their listings and merge (deduplicated).
      if (searchQuery) {
        const { data: matchingStores } = await supabase
          .from('marketplace_partners')
          .select('owner_user_id')
          .ilike('display_name', `%${searchQuery}%`);

        if (matchingStores && matchingStores.length > 0) {
          const storeUserIds = matchingStores.map((s: any) => s.owner_user_id);
          let storeQuery = supabase
            .from('marketplace_listings')
            .select(`
              *,
              marketplace_categories(name, slug),
              marketplace_subcategories(name, slug),
              countries(name, code, flag_url),
              marketplace_listing_images(image_url, is_primary)
            `)
            .eq('status', 'active')
            .in('created_by', storeUserIds);

          // Respect the same country filter
          const countryParam = searchParams.get('country') || selectedCountryFilter;
          if (countryParam) {
            storeQuery = storeQuery.eq('country_id', countryParam);
          }

          const { data: storeListings } = await storeQuery;

          if (storeListings) {
            const existingIds = new Set(transformed.map((l: any) => l.id));
            const extraListings = storeListings
              .filter((l: any) => !existingIds.has(l.id))
              .map((listing: any) => ({
                ...listing,
                category: listing.marketplace_categories,
                country: listing.countries,
                images: listing.marketplace_listing_images || [],
              }));
            transformed = [...transformed, ...extraListings];
          }
        }
      }

      setResults(transformed);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pushSearchHistory = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setSearchHistory((prev) => {
      const deduped = [q, ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, MAX_HISTORY);
      writeSearchHistory(deduped);
      return deduped;
    });
  };

  const removeFromHistory = (query: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((item) => item !== query);
      writeSearchHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    writeSearchHistory([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    const trimmed = searchInput.trim();

    if (trimmed) {
      params.set('q', trimmed);
      pushSearchHistory(trimmed);
    } else {
      params.delete('q');
    }

    setIsSearchFocused(false);
    setSearchParams(params);
  };

  const applyHistoryItem = (query: string) => {
    setSearchInput(query);
    const params = new URLSearchParams(searchParams);
    params.set('q', query);
    pushSearchHistory(query);
    setIsSearchFocused(false);
    setSearchParams(params);
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    if (selectedSubcategory && selectedSubcategory !== 'all') {
      params.set('subcategory', selectedSubcategory);
    } else {
      params.delete('subcategory');
    }
    
    if (selectedCountryFilter && selectedCountryFilter !== 'all') {
      params.set('country', selectedCountryFilter);
    } else {
      params.delete('country');
    }
    
    if (selectedCurrency && selectedCurrency !== 'all') {
      params.set('currency', selectedCurrency);
    } else {
      params.delete('currency');
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
    
    // Motors filters
    if (carBrand && carBrand !== 'all') params.set('brand', carBrand); else params.delete('brand');
    if (carBodyType && carBodyType !== 'all') params.set('body_type', carBodyType); else params.delete('body_type');
    if (carYear && carYear !== 'all') params.set('year', carYear); else params.delete('year');
    if (carFuelType && carFuelType !== 'all') params.set('fuel_type', carFuelType); else params.delete('fuel_type');
    if (carTransmission && carTransmission !== 'all') params.set('transmission', carTransmission); else params.delete('transmission');
    if (carMileage && carMileage !== 'all') params.set('mileage', carMileage); else params.delete('mileage');
    
    // Property filters
    if (propertyBedrooms && propertyBedrooms !== 'all') params.set('bedrooms', propertyBedrooms); else params.delete('bedrooms');
    if (propertyBathrooms && propertyBathrooms !== 'all') params.set('bathrooms', propertyBathrooms); else params.delete('bathrooms');
    if (propertyType && propertyType !== 'all') params.set('property_type', propertyType); else params.delete('property_type');
    if (propertyArea && propertyArea !== 'all') params.set('area', propertyArea); else params.delete('area');
    if (propertyFurnished && propertyFurnished !== 'all') params.set('furnished', propertyFurnished); else params.delete('furnished');
    
    // Electronics filters
    if (electronicsBrand && electronicsBrand !== 'all') params.set('electronics_brand', electronicsBrand); else params.delete('electronics_brand');
    if (electronicsWarranty && electronicsWarranty !== 'all') params.set('warranty', electronicsWarranty); else params.delete('warranty');
    
    // Fashion filters
    if (fashionSize && fashionSize !== 'all') params.set('size', fashionSize); else params.delete('size');
    if (fashionGender && fashionGender !== 'all') params.set('gender', fashionGender); else params.delete('gender');
    if (fashionBrand && fashionBrand !== 'all') params.set('fashion_brand', fashionBrand); else params.delete('fashion_brand');
    
    // Jobs filters
    if (jobType && jobType !== 'all') params.set('job_type', jobType); else params.delete('job_type');
    if (experienceLevel && experienceLevel !== 'all') params.set('experience', experienceLevel); else params.delete('experience');
    if (workType && workType !== 'all') params.set('work_type', workType); else params.delete('work_type');
    
    // Pets filters
    if (petType && petType !== 'all') params.set('pet_type', petType); else params.delete('pet_type');
    if (petAge && petAge !== 'all') params.set('pet_age', petAge); else params.delete('pet_age');
    if (petGender && petGender !== 'all') params.set('pet_gender', petGender); else params.delete('pet_gender');
    
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedCountryFilter('');
    setSelectedCurrency('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    setSortBy('recent');
    
    // Motors
    setCarBrand('all');
    setCarBodyType('all');
    setCarYear('all');
    setCarFuelType('all');
    setCarTransmission('all');
    setCarMileage('all');
    
    // Properties
    setPropertyBedrooms('all');
    setPropertyBathrooms('all');
    setPropertyType('all');
    setPropertyArea('all');
    setPropertyFurnished('all');
    
    // Electronics
    setElectronicsBrand('all');
    setElectronicsWarranty('all');
    
    // Fashion
    setFashionSize('all');
    setFashionGender('all');
    setFashionBrand('all');
    
    // Jobs
    setJobType('all');
    setExperienceLevel('all');
    setWorkType('all');
    
    // Pets
    setPetType('all');
    setPetAge('all');
    setPetGender('all');
    
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }
    
    setSearchParams(params);
  };

  const activeFiltersCount = [
    selectedCategory && selectedCategory !== 'all',
    selectedSubcategory && selectedSubcategory !== 'all',
    selectedCountryFilter && selectedCountryFilter !== 'all',
    selectedCurrency && selectedCurrency !== 'all',
    minPrice || maxPrice,
    condition && condition !== 'all',
    // Motors
    carBrand && carBrand !== 'all',
    carBodyType && carBodyType !== 'all',
    carYear && carYear !== 'all',
    carFuelType && carFuelType !== 'all',
    carTransmission && carTransmission !== 'all',
    carMileage && carMileage !== 'all',
    // Properties
    propertyBedrooms && propertyBedrooms !== 'all',
    propertyBathrooms && propertyBathrooms !== 'all',
    propertyType && propertyType !== 'all',
    propertyArea && propertyArea !== 'all',
    propertyFurnished && propertyFurnished !== 'all',
    // Electronics
    electronicsBrand && electronicsBrand !== 'all',
    electronicsWarranty && electronicsWarranty !== 'all',
    // Fashion
    fashionSize && fashionSize !== 'all',
    fashionGender && fashionGender !== 'all',
    fashionBrand && fashionBrand !== 'all',
    // Jobs
    jobType && jobType !== 'all',
    experienceLevel && experienceLevel !== 'all',
    workType && workType !== 'all',
    // Pets
    petType && petType !== 'all',
    petAge && petAge !== 'all',
    petGender && petGender !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <TopBannerAd />
      <MarketplaceNav />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative" ref={searchWrapperRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search marketplace..."
                  className="pl-10 h-12 font-roboto"
                />
                {isSearchFocused && searchHistory.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Searches</span>
                      <button
                        type="button"
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="max-h-72 overflow-y-auto">
                      {searchHistory.map((item) => (
                        <li
                          key={item}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                          onMouseDown={(e) => { e.preventDefault(); applyHistoryItem(item); }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeFromHistory(item); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
              <Button
                type="button"
                variant="outline"
                onClick={saveCurrentSearch}
                className="h-12 px-6"
                title="Save this search"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Search
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

                  {/* Subcategory Filter */}
                  {subcategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                      <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                        <SelectTrigger className="font-roboto">
                          <SelectValue placeholder="All Subcategories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subcategories</SelectItem>
                          {subcategories.map((subcat) => (
                            <SelectItem key={subcat.id} value={subcat.slug}>
                              {subcat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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

                  {/* Currency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger className="font-roboto">
                        <SelectValue placeholder="All Currencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Currencies</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="RWF">RWF (FRw)</SelectItem>
                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                        <SelectItem value="KES">KES (KSh)</SelectItem>
                        <SelectItem value="ZAR">ZAR (R)</SelectItem>
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

                  {/* Category-Specific Filters for Motors */}
                  {selectedCategory === 'motors' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                        <Select value={carBrand} onValueChange={setCarBrand}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="All Brands" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            <SelectItem value="Toyota">Toyota</SelectItem>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Nissan">Nissan</SelectItem>
                            <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                            <SelectItem value="BMW">BMW</SelectItem>
                            <SelectItem value="Audi">Audi</SelectItem>
                            <SelectItem value="Ford">Ford</SelectItem>
                            <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                            <SelectItem value="Hyundai">Hyundai</SelectItem>
                            <SelectItem value="Kia">Kia</SelectItem>
                            <SelectItem value="Mazda">Mazda</SelectItem>
                            <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
                        <Select value={carBodyType} onValueChange={setCarBodyType}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Hatchback">Hatchback</SelectItem>
                            <SelectItem value="Coupe">Coupe</SelectItem>
                            <SelectItem value="Pickup">Pickup Truck</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Wagon">Wagon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <Select value={carYear} onValueChange={setCarYear}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Year</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="2021">2021</SelectItem>
                            <SelectItem value="2020">2020</SelectItem>
                            <SelectItem value="2019">2019</SelectItem>
                            <SelectItem value="2018">2018</SelectItem>
                            <SelectItem value="2017">2017</SelectItem>
                            <SelectItem value="2016">2016</SelectItem>
                            <SelectItem value="2015">2015</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                        <Select value={carFuelType} onValueChange={setCarFuelType}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                        <Select value={carTransmission} onValueChange={setCarTransmission}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
                        <Select value={carMileage} onValueChange={setCarMileage}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="0-10000">0 - 10,000 km</SelectItem>
                            <SelectItem value="10000-30000">10,000 - 30,000 km</SelectItem>
                            <SelectItem value="30000-60000">30,000 - 60,000 km</SelectItem>
                            <SelectItem value="60000-100000">60,000 - 100,000 km</SelectItem>
                            <SelectItem value="100000+">100,000+ km</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Category-Specific Filters for Properties */}
                  {(selectedCategory === 'property-sale' || selectedCategory === 'property-rent') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                        <Select value={propertyBedrooms} onValueChange={setPropertyBedrooms}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                        <Select value={propertyBathrooms} onValueChange={setPropertyBathrooms}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                        <Select value={propertyType} onValueChange={setPropertyType}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Villa">Villa</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Area (sqm)</label>
                        <Select value={propertyArea} onValueChange={setPropertyArea}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="0-50">0 - 50 sqm</SelectItem>
                            <SelectItem value="50-100">50 - 100 sqm</SelectItem>
                            <SelectItem value="100-200">100 - 200 sqm</SelectItem>
                            <SelectItem value="200-300">200 - 300 sqm</SelectItem>
                            <SelectItem value="300+">300+ sqm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Furnished</label>
                        <Select value={propertyFurnished} onValueChange={setPropertyFurnished}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Furnished">Furnished</SelectItem>
                            <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                            <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Electronics & Mobiles Filters */}
                  {(selectedCategory === 'electronics' || selectedCategory === 'mobile-tablets') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                        <Select value={electronicsBrand} onValueChange={setElectronicsBrand}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="All Brands" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            <SelectItem value="Apple">Apple</SelectItem>
                            <SelectItem value="Samsung">Samsung</SelectItem>
                            <SelectItem value="Sony">Sony</SelectItem>
                            <SelectItem value="LG">LG</SelectItem>
                            <SelectItem value="Dell">Dell</SelectItem>
                            <SelectItem value="HP">HP</SelectItem>
                            <SelectItem value="Lenovo">Lenovo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
                        <Select value={electronicsWarranty} onValueChange={setElectronicsWarranty}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Yes">With Warranty</SelectItem>
                            <SelectItem value="No">No Warranty</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Fashion Filters */}
                  {selectedCategory === 'fashion' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <Select value={fashionGender} onValueChange={setFashionGender}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Men">Men</SelectItem>
                            <SelectItem value="Women">Women</SelectItem>
                            <SelectItem value="Unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <Select value={fashionSize} onValueChange={setFashionSize}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="XS">XS</SelectItem>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="XL">XL</SelectItem>
                            <SelectItem value="XXL">XXL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Jobs Filters */}
                  {selectedCategory === 'jobs' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                        <Select value={jobType} onValueChange={setJobType}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                            <SelectItem value="Mid Level">Mid Level</SelectItem>
                            <SelectItem value="Senior Level">Senior Level</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                        <Select value={workType} onValueChange={setWorkType}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Pets Filters */}
                  {selectedCategory === 'pets' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
                        <Select value={petType} onValueChange={setPetType}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Dog">Dog</SelectItem>
                            <SelectItem value="Cat">Cat</SelectItem>
                            <SelectItem value="Bird">Bird</SelectItem>
                            <SelectItem value="Fish">Fish</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                        <Select value={petAge} onValueChange={setPetAge}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Puppy/Kitten">Puppy/Kitten</SelectItem>
                            <SelectItem value="Young">Young</SelectItem>
                            <SelectItem value="Adult">Adult</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <Select value={petGender} onValueChange={setPetGender}>
                          <SelectTrigger className="font-roboto">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
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
            <div className="bg-white border border-gray-200 rounded-lg">
              <EmptyState
                icon={Package}
                title="No ads found"
                searchQuery={searchInput || undefined}
                description="Try different keywords, check your spelling, or remove some filters."
                onClearFilters={clearFilters}
                showBrowseCategories
                browseCategoriesHref="/marketplace"
                suggestions={[
                  { label: 'Electronics', onClick: () => { setSearchParams({ q: 'electronics' }); } },
                  { label: 'Vehicles', onClick: () => { setSearchParams({ q: 'vehicles' }); } },
                  { label: 'Fashion', onClick: () => { setSearchParams({ q: 'fashion' }); } },
                  { label: 'Property', onClick: () => { setSearchParams({ q: 'property' }); } },
                ]}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((listing) => {
                const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
                                   listing.images?.[0]?.image_url;

                return (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/marketplace/ad/${listing.id}`)}
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
                      {listing.status === 'sold' && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <div className="bg-red-600 text-white text-2xl font-bold px-6 py-3 rounded-lg transform -rotate-12">
                            {getSoldLabel(listing.category?.slug || '')}
                          </div>
                        </div>
                      )}
                      {listing.is_featured && listing.status !== 'sold' && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                          FEATURED
                        </div>
                      )}
                      {listing.condition && listing.status !== 'sold' && (
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

export default SearchResults;
