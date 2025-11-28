import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ChevronDown, Building2, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Default fallback images in case database images fail to load
const defaultHeroSlides: string[] = [
  "/Homepage/jeremy-pelletier-MoPM7OM3D18-unsplash.jpg",
  "/Homepage/rabah-al-shammary-VV08UXxnhnc-unsplash.jpg",
  "/Homepage/pexels-followalice-667200.jpg",
  "/Homepage/pexels-julie-holmes-9538-51809.jpg",
  "/Homepage/pexels-pixabay-70080.jpg",
  "/Homepage/1.jpg",
  "/Homepage/pexels-laukevtravel-26924196.jpg",
  "/Homepage/pexels-blue-ox-studio-218748-2014342.jpg",
  "/Homepage/pexels-mwauraken-29093739.jpg",
];
import { db } from "@/lib/supabase";
import { BusinessService, Business } from "@/lib/businessService";
import { toast } from "sonner";

// Update interface to represent countries instead of cities
interface Country {
  id: string;
    name: string;
    code: string;
  flag_emoji?: string;
  flag_url?: string;
  business_count?: number; // Count of businesses in this country
}

export const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<string[]>(defaultHeroSlides);
  const [slidesLoading, setSlidesLoading] = useState(true);

  // Background slideshow (8 seconds interval)
  useEffect(() => {
    if (heroSlides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Fetch slideshow images from database
  useEffect(() => {
    const fetchSlideshowImages = async () => {
      try {
        const { data, error } = await db.slideshow_images()
          .select('image_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching slideshow images:', error);
          // Use default images if database fetch fails
          setHeroSlides(defaultHeroSlides);
        } else if (data && data.length > 0) {
          // Use database images
          const imageUrls = data.map(item => item.image_url);
          setHeroSlides(imageUrls);
          setCurrentSlide(0); // Reset to first slide
        } else {
          // No active images in database, use defaults
          setHeroSlides(defaultHeroSlides);
          setCurrentSlide(0); // Reset to first slide
        }
      } catch (error) {
        console.error('Error fetching slideshow images:', error);
        setHeroSlides(defaultHeroSlides);
      } finally {
        setSlidesLoading(false);
      }
    };

    fetchSlideshowImages();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Fetch countries that have businesses, with business count
        const { data, error } = await db.businesses()
          .select(`
            country_id,
            countries (
            id,
            name,
              code,
              flag_emoji,
              flag_url
            )
          `)
          .not('country_id', 'is', null);

        if (error) {
          console.error('Error fetching countries:', error);
        } else {
          // Process the data to get unique countries with business counts
          const countryMap = new Map<string, Country>();
          
          data?.forEach((business: any) => {
            if (business.countries) {
              const country = business.countries;
              if (countryMap.has(country.id)) {
                countryMap.get(country.id)!.business_count!++;
        } else {
                countryMap.set(country.id, {
                  id: country.id,
                  name: country.name,
                  code: country.code,
                  flag_emoji: country.flag_emoji,
                  flag_url: country.flag_url,
                  business_count: 1
                });
              }
            }
          });

          // Convert to array and sort by business count (descending) then by name
          const countriesArray = Array.from(countryMap.values())
            .sort((a, b) => {
              if (b.business_count! !== a.business_count!) {
                return b.business_count! - a.business_count!;
              }
              return a.name.localeCompare(b.name);
            });

          setCountries(countriesArray);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Search businesses as user types (tokenized, live matching)
  useEffect(() => {
    const searchBusinesses = async () => {
      const trimmed = searchTerm.trim();
      if (trimmed.length < 2) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }

      setSearchLoading(true);
      try {
        const countryName = location.split(',')[0]?.trim();
        const options: { country?: string } = {};
        if (countryName) {
          options.country = countryName;
        }
        // Fetch a broader set from backend, then rank client-side by keyword coverage
        const results = await BusinessService.searchBusinesses(trimmed, options, 100);

        // Tokenize input into keywords (min length 2), match across multiple fields
        const keywords = trimmed
          .toLowerCase()
          .split(/\s+/)
          .filter(k => k.length >= 2);

        const scored = results.map(b => {
          const haystack = [
            b.name,
            b.description || '',
            b.address || '',
            b.website || '',
            b.category?.name || '',
            b.city?.name || '',
            b.country?.name || ''
          ].join(' ').toLowerCase();

          let score = 0;
          let allMatch = true;
          for (const kw of keywords) {
            const idx = haystack.indexOf(kw);
            if (idx === -1) {
              allMatch = false;
            } else {
              // Boost closer-to-start matches a little
              score += 10 + Math.max(0, 5 - Math.floor(idx / 20));
            }
          }

          // Exact name starts-with boost
          if (b.name.toLowerCase().startsWith(trimmed.toLowerCase())) {
            score += 20;
          }
          // Premium visibility boost
          if (b.is_premium) score += 5;

          return { b, score, allMatch };
        })
        .filter(x => x.allMatch || keywords.length === 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.b)
        .slice(0, 20);

        setSearchResults(scored);
        setIsSearchOpen(true);
      } catch (error) {
        console.error('Error searching businesses:', error);
        setSearchResults([]);
        // Don't show error to user, just show no results
      } finally {
        setSearchLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchBusinesses, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, location]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search results when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    
    try {
      const countryName = location.split(',')[0]?.trim();
      const options: { country?: string } = {};
      if (countryName) {
        options.country = countryName;
      }
      
      const results = await BusinessService.searchBusinesses(trimmed, options, 100);
      
      if (results.length === 0) {
        toast.error(
          `No businesses found for "${trimmed}"${countryName ? ` in ${countryName}` : ''}. Please try a different search term.`,
          {
            description: "The business you're looking for is not available in our database.",
            duration: 5000,
          }
        );
        return;
      }
      
      // Navigate to search results if businesses are found
      if (countryName) {
        const countrySlug = countryName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/${countrySlug}/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      toast.error(
        "Search failed. Please try again.",
        {
          description: "There was an error processing your search request.",
          duration: 4000,
        }
      );
    }
  };

  const handleBusinessClick = (business: Business) => {
    // Navigate to business detail page
    const countryName = business.country?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
    const categorySlug = business.category?.slug || 'business';
    navigate(`/${countryName}/${categorySlug}/${business.id}`);
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const formatCountryDisplay = (country: Country) => {
    const flag = country.flag_emoji || (country.flag_url ? '🏳️' : '');
    return `${flag} ${country.name}`;
  };

  const getAverageRating = (business: Business) => {
    if (!business.reviews || business.reviews.length === 0) return 0;
    const totalRating = business.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / business.reviews.length;
  };

  return (
    <section className="relative">
      {/* Hero Image Background */}
      <div
        className="relative h-[100vh] sm:h-[65vh] md:h-[80vh] lg:h-[80vh] bg-cover bg-center bg-no-repeat transition-background duration-700"
           style={{ 
          backgroundImage: slidesLoading ? 'none' : `url(${heroSlides[currentSlide]})`,
             filter: 'brightness(1.2)'
        }}
      >
        {slidesLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading slideshow...</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-[#202124] bg-opacity-30"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-3 sm:px-4 md:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-comfortaa font-bold text-white text-center mb-4 sm:mb-6 md:mb-8 px-2 leading-tight">
            {t('homepage.hero.title')}<sup className="text-xs sm:text-sm md:text-base">℠</sup>
          </h1>
          
          {/* Search Form */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl bg-white rounded-xl shadow-xl p-4 sm:p-5 md:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3 md:gap-4">
              {/* Business Search Input */}
              <div className="flex-1 relative search-container min-w-0 bg-white rounded-lg overflow-hidden">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5F6368] w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder={t('homepage.hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setIsSearchOpen(true);
                  }}
                  className="pl-8 sm:pl-10 h-11 sm:h-12 font-roboto border-[#E8EAED] focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] text-sm sm:text-base rounded-lg transition-all duration-200"
                />
                
                {/* Search Results Dropdown */}
                {isSearchOpen && (searchResults.length > 0 || searchLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8EAED] rounded-lg shadow-xl z-50 max-h-60 sm:max-h-80 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-3 sm:p-4 text-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4285F4] mx-auto"></div>
                        <p className="text-xs text-yp-gray-dark mt-1">{t('common.loading')}</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.length === 0 ? (
                          <div className="p-3 sm:p-4 text-center text-[#5F6368]">
                            <p className="text-sm">No businesses found</p>
                            <p className="text-xs text-[#5F6368] mt-1">No businesses found. Please try a different search term.</p>
                          </div>
                        ) : (
                          searchResults.map((business) => {
                            const avgRating = getAverageRating(business);
                            const reviewCount = business.reviews?.length || 0;
                            
                            return (
                              <div
                                key={business.id}
                                onClick={() => handleBusinessClick(business)}
                                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-[#F8F9FA] cursor-pointer border-b border-[#E8EAED] last:border-b-0 transition-colors"
                              >
                                <div className="flex-shrink-0">
                                  {business.logo_url ? (
                                    <img 
                                      src={business.logo_url} 
                                      alt={business.name}
                                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center">
                                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#5F6368]" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-[#202124] truncate text-sm sm:text-base">{business.name}</h4>
                                  <p className="text-xs sm:text-sm text-[#5F6368] truncate">
                                    {business.category?.name} • {business.country?.name}
                                  </p>
                                  {reviewCount > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Crown className="w-3 h-3 text-yellow-500 fill-current" />
                                      <span className="text-xs text-[#5F6368]">
                                        {avgRating.toFixed(1)} ({reviewCount})
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {business.is_premium && (
                                  <div className="flex-shrink-0">
                                    <span className="text-xs bg-[#4285F4] text-white px-2 py-1 rounded-full">
                                      Premium
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Location Dropdown */}
              <div className="flex-1 relative min-w-0 bg-white rounded-lg overflow-hidden">
                <DropdownMenu open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5F6368] w-4 h-4 sm:w-5 sm:h-5" />
                      <Input
                        type="text"
                        placeholder={t('homepage.hero.locationPlaceholder')}
                        value={location}
                        readOnly
                        className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-11 sm:h-12 font-roboto border-[#E8EAED] focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] cursor-pointer text-sm sm:text-base rounded-lg transition-all duration-200"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5F6368] w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-60 overflow-y-auto bg-white border border-[#E8EAED] shadow-xl rounded-lg">
                    <div className="p-2">
                      <h3 className="text-sm font-roboto font-semibold text-[#202124] mb-2 px-2">QUICK LOCATIONS</h3>
                      
                      {/* Default blank country option for global search */}
                      {/* <DropdownMenuItem
                        onClick={() => {
                          setLocation("");
                          setIsLocationOpen(false);
                          navigate("/search");
                        }}
                        className={`dropdown-menu-item-override font-roboto px-2 py-2 cursor-pointer hover:bg-yp-gray-light ${
                          location === "" ? "bg-yp-gray-light text-yp-blue" : "text-yp-dark"
                        }`}
                      >
                        Global Search
                      </DropdownMenuItem> */}
                      
                      {loading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4285F4] mx-auto"></div>
                          <p className="text-xs text-yp-gray-dark mt-1">{t('common.loading')}</p>
                        </div>
                      ) : (
                        countries.map((country) => (
                          <DropdownMenuItem
                            key={country.id}
                            onClick={() => {
                              setLocation(country.name);
                              setIsLocationOpen(false);
                              const countrySlug = country.name.toLowerCase().replace(/\s+/g, '-');
                              navigate(`/${countrySlug}/search`);
                            }}
                            className={`dropdown-menu-item-override font-roboto px-2 py-2 cursor-pointer hover:bg-[#F8F9FA] ${
                              location === country.name ? "bg-[#F8F9FA] text-[#4285F4]" : "text-[#202124]"
                            }`}
                          >
                            {formatCountryDisplay(country)}
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-4 py-2 rounded-r-lg font-roboto font-medium transition-all duration-300 flex items-center justify-center min-w-[100px] touch-manipulation h-11 sm:h-12 text-sm sm:text-base"
              >
                {t('homepage.hero.searchButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
