import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UltraSimpleMap } from "@/components/UltraSimpleMap";
import { CityInfo } from "@/components/CityInfo";
import { 
  MapPin, 
  Phone, 
  Crown, 
  Building, 
  ArrowLeft,
  Grid3X3,
  List,
  Globe,
  Users,
  Landmark,
  User,
  Calendar,
  Star,
  Hash,
  DollarSign,
  FileText
} from "lucide-react";
import { db } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWikipediaCountryInfo } from "@/lib/wikipedia";
import { useSponsoredBanners } from "@/hooks/useSponsoredBanners";
import { useCountryInfo } from "@/hooks/useCountryInfo";

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  wikipedia_url: string | null;
  description: string | null;
  population: number | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
  flag_emoji?: string | null;
  // Enhanced fields from Wikipedia
  president_name?: string | null;
  gdp_usd?: number | null;
  average_age?: number | null;
  largest_city?: string | null;
  largest_city_population?: number | null;
  capital_population?: number | null;
  ethnic_groups?: Array<{
    name: string;
    percentage: number;
    note?: string;
  }> | null;
  formation_date?: string | null;
  hdi_score?: number | null;
  calling_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_sq_km?: number | null;
  timezone?: string | null;
  coat_of_arms_url?: string | null;
  wikipedia_description?: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  is_premium: boolean;
  category?: {
    name: string;
    slug: string;
  };
  city?: {
    name: string;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    content: string;
    created_at: string;
  }>;
}

export const CountryDetailPage: React.FC = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const navigate = useNavigate();
  
  const [country, setCountry] = useState<Country | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [wikipediaLoading, setWikipediaLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState("");
  const [coatOfArmsLoading, setCoatOfArmsLoading] = useState(false);
  
  // Sponsored banner functionality
  const { banners: allSponsoredBanners, fetchBannerByCountry, incrementBannerClick, incrementBannerView } = useSponsoredBanners();
  
  // Filter banners to only show those enabled for country detail page
  const sponsoredBanners = allSponsoredBanners.filter(banner => banner.show_on_country_detail);
  
  // Country information from database
  const { countryInfo, loading: countryInfoLoading } = useCountryInfo(country?.id || null);

  useEffect(() => {
    if (!countrySlug) {
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 15000);

    fetchCountryData().catch(console.error);

    return () => clearTimeout(timeout);
  }, [countrySlug]);

  const fetchCountryData = async (retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      // Create a more flexible search pattern
      const searchPatterns = [
        countrySlug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
        countrySlug.replace(/-/g, ' ').toLowerCase(),
        countrySlug.replace(/-/g, ' '),
        countrySlug
      ];

      let countryData = null;
      let lastError = null;

      // Try different search patterns
      for (const pattern of searchPatterns) {
        try {
          const { data, error } = await db.countries()
            .select(`
              id,
              name,
              code,
              flag_url,
              wikipedia_url,
              description,
              population,
              capital,
              currency,
              language,
              flag_emoji
            `)
            .or(`name.ilike.%${pattern}%,name.ilike.${pattern}%,name.ilike.%${pattern}`)
            .single();

          if (error) {
            lastError = error;
            continue;
          }

          if (data) {
            countryData = data;
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (countryData) {
        // Fetch Wikipedia data to enrich country information
        setWikipediaLoading(true);
        try {
          console.log(`Fetching Wikipedia data for ${countryData.name}...`);
          const wikipediaData = await fetchWikipediaCountryInfo(countryData.name);
          
                     if (wikipediaData) {
             // Helper function to safely parse population
             const parsePopulation = (popStr: string): number | null => {
               if (!popStr) return null;
               const cleanStr = popStr.replace(/[^\d]/g, '');
               const num = parseInt(cleanStr);
               return isNaN(num) ? null : num;
             };

             // Merge Wikipedia data with database data
             const enrichedCountryData = {
               ...countryData,
               description: wikipediaData.description || countryData.description,
               flag_url: wikipediaData.flag_url || countryData.flag_url,
               coat_of_arms_url: wikipediaData.coat_of_arms_url,
               capital: wikipediaData.capital || countryData.capital,
               currency: wikipediaData.currency || countryData.currency,
               population: parsePopulation(wikipediaData.population) || countryData.population,
               language: wikipediaData.language || countryData.language,
               area: wikipediaData.area,
               gdp: wikipediaData.gdp,
               timezone: wikipediaData.timezone,
              wikipedia_description: wikipediaData.description,
              // Enhanced fields from Wikipedia
              president_name: wikipediaData.president_name,
              gdp_usd: wikipediaData.gdp_usd,
              average_age: wikipediaData.average_age,
              largest_city: wikipediaData.largest_city,
              largest_city_population: wikipediaData.largest_city_population,
              capital_population: wikipediaData.capital_population,
              ethnic_groups: wikipediaData.ethnic_groups,
              formation_date: wikipediaData.formation_date,
              hdi_score: wikipediaData.hdi_score,
              calling_code: wikipediaData.calling_code,
              latitude: wikipediaData.latitude,
              longitude: wikipediaData.longitude,
              area_sq_km: wikipediaData.area_sq_km
             };
            
            console.log(`✅ Wikipedia data fetched for ${countryData.name}`);
            setCountry(enrichedCountryData);
          } else {
            console.log(`⚠️ No Wikipedia data found for ${countryData.name}, using database data only`);
            setCountry(countryData);
          }
        } catch (wikipediaError) {
          console.error('Error fetching Wikipedia data:', wikipediaError);
          setCountry(countryData);
        } finally {
          setWikipediaLoading(false);
        }
        
        await fetchBusinesses(countryData);
        
        // Fetch sponsored banner for this country
        if (countryData.id) {
          await fetchBannerByCountry(countryData.id);
        }
      } else {
        console.error('Country not found with any search pattern:', lastError);
        setLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching country (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (error.message?.includes('Failed to fetch') || error.message?.includes('timeout'))) {
        console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchCountryData(retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      setLoading(false);
    }
  };

  const fetchBusinesses = async (countryData: Country, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      // First, try to get businesses with all related data
      let { data, error } = await db.businesses()
        .select(`
          id,
          name,
          slug,
          description,
          phone,
          website,
          address,
          latitude,
          longitude,
          logo_url,
          is_premium,
          category:categories(name, slug),
          city:cities(name),
          reviews(id, rating, content, created_at)
        `)
        .eq('status', 'active')
        .eq('country_id', countryData.id)
        .limit(50);

      if (error) {
        console.error('Error fetching businesses with relations:', error);
        
        // Fallback: try without reviews to see if that's the issue
        const { data: basicData, error: basicError } = await db.businesses()
          .select(`
            id,
            name,
            slug,
            description,
            phone,
            website,
            address,
            latitude,
            longitude,
            logo_url,
            is_premium,
            category:categories(name, slug),
            city:cities(name)
          `)
          .eq('status', 'active')
          .eq('country_id', countryData.id)
          .limit(50);

        if (basicError) {
          console.error('Error fetching businesses (basic):', basicError);
          setBusinesses(generateSampleBusinesses(countryData));
          return;
        }

        // Add empty reviews array to basic data
        data = basicData?.map((business: any) => ({
          ...business,
          reviews: []
        }));
      }

      const transformedBusinesses: Business[] = data?.map((business: any) => ({
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        phone: business.phone,
        website: business.website,
        address: business.address,
        latitude: business.latitude,
        longitude: business.longitude,
        logo_url: business.logo_url,
        is_premium: business.is_premium,
        category: business.category ? {
          name: business.category.name,
          slug: business.category.slug
        } : undefined,
        city: business.city ? {
          name: business.city.name
        } : undefined,
        reviews: business.reviews || []
      })) || [];

      console.log(`Successfully fetched ${transformedBusinesses.length} businesses for ${countryData.name}`);
      setBusinesses(transformedBusinesses);
    } catch (error) {
      console.error(`Error fetching businesses (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (error.message?.includes('Failed to fetch') || error.message?.includes('timeout'))) {
        console.log(`Retrying business fetch... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchBusinesses(countryData, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      setBusinesses(generateSampleBusinesses(countryData));
    } finally {
      setLoading(false);
    }
  };

  const generateSampleBusinesses = (countryData: Country): Business[] => {
    const sampleBusinesses = [
      {
        id: 'sample-1',
        name: `${countryData.name} Local Restaurant`,
        slug: `${countryData.name.toLowerCase().replace(/\s+/g, '-')}-local-restaurant`,
        description: `A delicious local restaurant serving traditional ${countryData.name} cuisine`,
        phone: `+${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        website: 'https://example.com',
        address: '123 Main Street',
        latitude: 30.0444 + (Math.random() - 0.5) * 0.01,
        longitude: 31.2357 + (Math.random() - 0.5) * 0.01,
        logo_url: null,
        is_premium: false,
        category: { name: 'Restaurant', slug: 'restaurant' },
        city: { name: countryData.capital || 'Capital City' },
        reviews: [{ id: '1', rating: 4.5, content: 'Great food!', created_at: '2024-01-01' }]
      },
      {
        id: 'sample-2',
        name: `${countryData.name} Grand Hotel`,
        slug: `${countryData.name.toLowerCase().replace(/\s+/g, '-')}-grand-hotel`,
        description: `A comfortable hotel in the heart of ${countryData.name}`,
        phone: `+${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        website: 'https://hotel-example.com',
        address: '456 Tourism Avenue',
        latitude: 30.0444 + (Math.random() - 0.5) * 0.01,
        longitude: 31.2357 + (Math.random() - 0.5) * 0.01,
        logo_url: null,
        is_premium: true,
        category: { name: 'Hotel', slug: 'hotel' },
        city: { name: countryData.capital || 'Capital City' },
        reviews: [{ id: '2', rating: 4.8, content: 'Excellent service!', created_at: '2024-01-02' }]
      },
      {
        id: 'sample-3',
        name: `${countryData.name} Shopping Center`,
        slug: `${countryData.name.toLowerCase().replace(/\s+/g, '-')}-shopping-center`,
        description: `Modern shopping center with local and international brands`,
        phone: `+${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        website: 'https://shopping-example.com',
        address: '789 Commercial District',
        latitude: 30.0444 + (Math.random() - 0.5) * 0.01,
        longitude: 31.2357 + (Math.random() - 0.5) * 0.01,
        logo_url: null,
        is_premium: false,
        category: { name: 'Shopping', slug: 'shopping' },
        city: { name: countryData.capital || 'Capital City' },
        reviews: [{ id: '3', rating: 4.2, content: 'Great variety of shops!', created_at: '2024-01-03' }]
      }
    ];

    console.log(`Generated ${sampleBusinesses.length} sample businesses for ${countryData.name}`);
    return sampleBusinesses;
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (business.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (business.city?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = !selectedCategory || business.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAverageRating = (business: Business): number => {
    if (!business.reviews || business.reviews.length === 0) return 0;
    const totalRating = business.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / business.reviews.length;
  };

  // Ensure language display is clean; if more than two words, default to English
  const getDisplayLanguage = (raw: string | null | undefined): string => {
    const cleaned = (raw || '').trim();
    if (!cleaned) return 'English';
    const words = cleaned.split(/\s+/).filter(Boolean);
    return words.length > 2 ? 'English' : cleaned;
  };

  const formatCountryName = (slug: string): string => {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Country coordinates mapping for map display
  const getCountryCoordinates = (countryName: string): { latitude: number; longitude: number } => {
    const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
      'Egypt': { latitude: 26.8206, longitude: 30.8025 },
      'Kenya': { latitude: -0.0236, longitude: 37.9062 },
      'Nigeria': { latitude: 9.0820, longitude: 8.6753 },
      'South Africa': { latitude: -30.5595, longitude: 22.9375 },
      'Ghana': { latitude: 7.9465, longitude: -1.0232 },
      'Ethiopia': { latitude: 9.1450, longitude: 40.4897 },
      'Tanzania': { latitude: -6.3690, longitude: 34.8888 },
      'Uganda': { latitude: 1.3733, longitude: 32.2903 },
      'Morocco': { latitude: 31.7917, longitude: -7.0926 },
      'Algeria': { latitude: 28.0339, longitude: 1.6596 },
      'Tunisia': { latitude: 33.8869, longitude: 9.5375 },
      'Libya': { latitude: 26.3351, longitude: 17.2283 },
      'Sudan': { latitude: 12.8628, longitude: 30.2176 },
      'Botswana': { latitude: -22.3285, longitude: 24.6849 },
      'Zimbabwe': { latitude: -19.0154, longitude: 29.1549 },
      'Zambia': { latitude: -13.1339, longitude: 27.8493 },
      'Malawi': { latitude: -13.2543, longitude: 34.3015 },
      'Mozambique': { latitude: -18.6657, longitude: 35.5296 },
      'Angola': { latitude: -11.2027, longitude: 17.8739 },
      'Namibia': { latitude: -22.9576, longitude: 18.4904 },
      'Rwanda': { latitude: -1.9403, longitude: 29.8739 },
      'Burundi': { latitude: -3.3731, longitude: 29.9189 },
      'Democratic Republic of the Congo': { latitude: -4.0383, longitude: 21.7587 },
      'Republic of the Congo': { latitude: -0.2280, longitude: 15.8277 },
      'Central African Republic': { latitude: 6.6111, longitude: 20.9394 },
      'Chad': { latitude: 15.4542, longitude: 18.7322 },
      'Cameroon': { latitude: 7.3697, longitude: 12.3547 },
      'Gabon': { latitude: -0.8037, longitude: 11.6094 },
      'Equatorial Guinea': { latitude: 1.6508, longitude: 10.2679 },
      'São Tomé and Príncipe': { latitude: 0.1864, longitude: 6.6131 },
      'Cape Verde': { latitude: 16.5388, longitude: -23.0418 },
      'Guinea-Bissau': { latitude: 11.8037, longitude: -15.1804 },
      'Guinea': { latitude: 9.9456, longitude: -9.6966 },
      'Sierra Leone': { latitude: 8.4606, longitude: -11.7799 },
      'Liberia': { latitude: 6.4281, longitude: -9.4295 },
      'Côte d\'Ivoire': { latitude: 7.5400, longitude: -5.5471 },
      'Burkina Faso': { latitude: 12.2383, longitude: -1.5616 },
      'Mali': { latitude: 17.5707, longitude: -3.9962 },
      'Niger': { latitude: 17.6078, longitude: 8.0817 },
      'Senegal': { latitude: 14.4974, longitude: -14.4524 },
      'Gambia': { latitude: 13.4432, longitude: -15.3101 },
      'Mauritania': { latitude: 21.0079, longitude: -10.9408 },
      'Somalia': { latitude: 5.1521, longitude: 46.1996 },
      'Djibouti': { latitude: 11.8251, longitude: 42.5903 },
      'Eritrea': { latitude: 15.1794, longitude: 39.7823 },
      'Comoros': { latitude: -11.6455, longitude: 43.3333 },
      'Seychelles': { latitude: -4.6796, longitude: 55.4920 },
      'Mauritius': { latitude: -20.3484, longitude: 57.5522 },
      'Madagascar': { latitude: -18.7669, longitude: 46.8691 },
      'Lesotho': { latitude: -29.6099, longitude: 28.2336 },
      'Eswatini': { latitude: -26.5225, longitude: 31.4659 }
    };

    // Try exact match first
    if (coordinates[countryName]) {
      return coordinates[countryName];
    }

    // Try case-insensitive match
    const countryKey = Object.keys(coordinates).find(
      key => key.toLowerCase() === countryName.toLowerCase()
    );
    
    if (countryKey) {
      return coordinates[countryKey];
    }

    // Default coordinates (center of Africa)
    return { latitude: 8.7832, longitude: 34.5085 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yp-gray-light">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Country Not Found</h1>
            <Button onClick={() => navigate('/')} className="bg-black text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <MatrixRain />
      {/* Match landing page MatrixRain visibility */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      <div className="relative z-10">
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3">
              {country.flag_url && (
                <img 
                  src={country.flag_url} 
                  alt={`${country.name} flag`}
                  className="w-12 h-8 rounded shadow-sm"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-black font-comfortaa">
                  {formatCountryName(countrySlug)}
                </h1>
                                 <p className="text-gray-600">
                   {country.capital && country.capital !== 'Territory' && ` • Capital: ${country.capital}`}
                 </p>
              </div>
            </div>
          </div>

          {/* Country Overview */}
          {(country.wikipedia_description || country.description) && (
            <div className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700">
              <p>{country.wikipedia_description || country.description}</p>
            </div>
          )}
          
          {/* Sponsored Banner Section */}
            {sponsoredBanners.length > 0 && (
            <div className="mt-6">
              <Card className="bg-white border-gray-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-black" />
                      <span className="text-sm font-medium text-gray-800">Sponsored by</span>
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-300">
                      Advertisement
                    </Badge>
                  </div>
                  
                  {sponsoredBanners.map((banner) => (
                    <div key={banner.id} className="space-y-4">
                    <a
                      href={banner.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => incrementBannerClick(banner.id)}
                      className="block group"
                    >
                        <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={banner.banner_image_url}
                          alt={banner.banner_alt_text || `${banner.company_name} banner`}
                            className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
                          onLoad={() => incrementBannerView(banner.id)}
                        />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                      </div>
                    </a>
                      
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900">{banner.company_name}</h3>
                        <p className="text-sm text-gray-600">
                          Visit {banner.company_website}
                        </p>
                        </div>
                      </div>
                  ))}
                    </CardContent>
                  </Card>
            </div>
          )}

          {/* Complete Country Information Display - Elegant Flowing Layout */}
          {countryInfo && (
            <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-lg p-8 space-y-12">
              
              {/* Essential Facts - Prominent Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Code</p>
                  <p className="text-2xl font-bold text-black">{country.code || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Capital</p>
                  <p className="text-2xl font-bold text-black">{countryInfo.capital || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Population</p>
                  <p className="text-2xl font-bold text-black">
                    {countryInfo.population ? (countryInfo.population / 1000000).toFixed(1) + 'M' : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Area</p>
                  <p className="text-2xl font-bold text-black">
                    {countryInfo.area_sq_km ? (countryInfo.area_sq_km / 1000).toFixed(0) + 'K km²' : '-'}
                  </p>
                </div>
              </div>

              {/* Detailed Information - Flowing Grid */}
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Language & Currency</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-600">Language</span>
                        <span className="text-base font-medium text-black">{countryInfo.language || '-'}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-600">Currency</span>
                        <span className="text-base font-medium text-black">{countryInfo.currency || '-'}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-600">Currency Code</span>
                        <span className="text-base font-medium text-black">{countryInfo.currency_code || '-'}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-600">Calling Code</span>
                        <span className="text-base font-medium text-black">{countryInfo.calling_code || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {countryInfo.president_name && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Leadership</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                          <span className="text-sm text-gray-600">Leader</span>
                          <span className="text-base font-medium text-black">{countryInfo.president_name}</span>
                        </div>
                        {countryInfo.government_type && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Government</span>
                            <span className="text-base font-medium text-black">{countryInfo.government_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(countryInfo.gdp_usd || countryInfo.gdp_per_capita) && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Economy</h3>
                      <div className="space-y-3">
                        {countryInfo.gdp_usd && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">GDP</span>
                            <span className="text-base font-medium text-black">
                              ${(countryInfo.gdp_usd / 1000000000).toFixed(1)}B
                            </span>
                          </div>
                        )}
                        {countryInfo.gdp_per_capita && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">GDP Per Capita</span>
                            <span className="text-base font-medium text-black">
                              ${countryInfo.gdp_per_capita.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {(countryInfo.largest_city || countryInfo.timezone) && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Geography</h3>
                      <div className="space-y-3">
                        {countryInfo.largest_city && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Largest City</span>
                            <span className="text-base font-medium text-black">{countryInfo.largest_city}</span>
                          </div>
                        )}
                        {countryInfo.timezone && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Timezone</span>
                            <span className="text-base font-medium text-black">{countryInfo.timezone}</span>
                          </div>
                        )}
                        {countryInfo.climate && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Climate</span>
                            <span className="text-base font-medium text-black">{countryInfo.climate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(countryInfo.hdi_score || countryInfo.literacy_rate || countryInfo.life_expectancy) && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Development</h3>
                      <div className="space-y-3">
                        {countryInfo.hdi_score && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">HDI Score</span>
                            <span className="text-base font-medium text-black">{countryInfo.hdi_score.toFixed(3)}</span>
                          </div>
                        )}
                        {countryInfo.literacy_rate && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Literacy Rate</span>
                            <span className="text-base font-medium text-black">{countryInfo.literacy_rate}%</span>
                          </div>
                        )}
                        {countryInfo.life_expectancy && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Life Expectancy</span>
                            <span className="text-base font-medium text-black">{countryInfo.life_expectancy} years</span>
                          </div>
                        )}
                        {countryInfo.average_age && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600">Average Age</span>
                            <span className="text-base font-medium text-black">{countryInfo.average_age} years</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(countryInfo.natural_resources || countryInfo.main_industries) && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Resources & Industry</h3>
                      <div className="space-y-3">
                        {countryInfo.natural_resources && (
                          <div className="border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600 block mb-1">Natural Resources</span>
                            <span className="text-base font-medium text-black">{countryInfo.natural_resources}</span>
                          </div>
                        )}
                        {countryInfo.main_industries && (
                          <div className="border-b border-gray-100 pb-2">
                            <span className="text-sm text-gray-600 block mb-1">Main Industries</span>
                            <span className="text-base font-medium text-black">{countryInfo.main_industries}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Country Information Available */}
          {!countryInfo && !countryInfoLoading && (
            <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-lg p-12 text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No detailed information available</h3>
              <p className="text-gray-600">
                Detailed information for {country.name} has not been added yet.
              </p>
            </div>
          )}


        </div>
      </div>

             {/* Map Section */}
       <div className="py-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <h2 className="text-2xl font-bold text-black mb-6">Map View</h2>
           <UltraSimpleMap 
             countryData={{
              name: country.name,
              capital: country.capital,
              latitude: getCountryCoordinates(country.name).latitude,
              longitude: getCountryCoordinates(country.name).longitude
             }}
             countryName={country.name}
           />
         </div>
       </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(businesses.map(b => b.category?.name).filter((name): name is string => !!name))).map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
              
              <div className="flex border border-gray-300 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No businesses have been added to this country yet'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {business.logo_url ? (
                          <img 
                            src={business.logo_url} 
                            alt={`${business.name} logo`}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <Building className="w-6 h-6 text-black" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold text-black truncate">
                          {business.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {business.category && (
                            <Badge variant="outline" className="text-xs">
                              {business.category.name}
                            </Badge>
                          )}
                          {business.city && (
                            <Badge variant="secondary" className="text-xs">
                              {business.city.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {business.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {business.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {business.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                    
                    {business.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {business.reviews && business.reviews.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Star className="w-4 h-4 text-black fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {getAverageRating(business).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({business.reviews.length} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/${countrySlug}/${business.category?.slug ?? 'business'}/${business.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-sm">
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/write-review/${business.id}`}>
                      <Button size="sm" className="bg-black text-white text-sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
