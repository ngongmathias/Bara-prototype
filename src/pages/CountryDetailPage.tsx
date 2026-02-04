import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UltraSimpleMap } from "@/components/UltraSimpleMap";
import { 
  ArrowLeft,
  MapPin,
  Users,
  Globe,
  Building,
  Phone,
  ExternalLink,
  ChevronRight,
  Star
} from "lucide-react";
import { db } from "@/lib/supabase";
import { fetchWikipediaCountryInfo } from "@/lib/wikipedia";
import { useSponsoredBanners } from "@/hooks/useSponsoredBanners";
import { useCountryInfo } from "@/hooks/useCountryInfo";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  flag_emoji?: string | null;
  wikipedia_url: string | null;
  description: string | null;
  population: number | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
  wikipedia_description?: string | null;
  coat_of_arms_url?: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logo_url: string | null;
  is_premium: boolean;
  category?: { name: string; slug: string };
  city?: { name: string };
  reviews?: Array<{ id: string; rating: number }>;
}

// Country coordinates for map
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  'rwanda': { lat: -1.9403, lng: 29.8739 },
  'nigeria': { lat: 9.082, lng: 8.6753 },
  'ghana': { lat: 7.9465, lng: -1.0232 },
  'kenya': { lat: -0.0236, lng: 37.9062 },
  'south-africa': { lat: -30.5595, lng: 22.9375 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'ethiopia': { lat: 9.145, lng: 40.4897 },
  'tanzania': { lat: -6.369, lng: 34.8888 },
  'uganda': { lat: 1.3733, lng: 32.2903 },
  'morocco': { lat: 31.7917, lng: -7.0926 },
};

export const CountryDetailPage: React.FC = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const navigate = useNavigate();
  
  const [country, setCountry] = useState<Country | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const { banners: allSponsoredBanners, incrementBannerClick, incrementBannerView } = useSponsoredBanners();
  // Fix: Properly filter country page ads by active status, payment, and country match
  const sponsoredBanners = allSponsoredBanners.filter(banner => 
    banner.show_on_country_detail && 
    banner.is_active === true &&
    banner.payment_status === 'paid' &&
    banner.status === 'active' &&
    banner.country_id === country?.id
  );
  const { countryInfo } = useCountryInfo(country?.id || null);

  useEffect(() => {
    if (countrySlug) {
      fetchData();
    }
  }, [countrySlug]);

  const fetchData = async () => {
    try {
      const pattern = countrySlug?.replace(/-/g, ' ') || '';
      const { data, error } = await db.countries()
        .select('*')
        .or(`name.ilike.%${pattern}%,name.ilike.${pattern}%`)
        .single();

      if (error) throw error;
      
      if (data) {
        // Enrich with Wikipedia only as fallback
        const wikiData = await fetchWikipediaCountryInfo(data.name);
        setCountry({
          ...data,
          wikipedia_description: data.description || wikiData?.description,
          coat_of_arms_url: data.coat_of_arms_url || wikiData?.coat_of_arms_url,
        });

        // Fetch businesses
        const { data: bizData } = await db.businesses()
          .select(`
            id, name, slug, description, phone, website, address, logo_url, is_premium,
            category:categories(name, slug),
            city:cities(name),
            reviews(id, rating)
          `)
          .eq('country_id', data.id)
          .eq('status', 'active')
          .limit(12);
        
        setBusinesses(bizData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '—';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toString();
  };

  const getCoords = () => {
    // Use database coordinates from countryInfo first, then fallback to hardcoded coords
    if (countryInfo?.latitude && countryInfo?.longitude) {
      return { lat: countryInfo.latitude, lng: countryInfo.longitude };
    }
    const slug = countrySlug?.toLowerCase() || '';
    return COUNTRY_COORDS[slug] || { lat: 0, lng: 20 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-black mb-4">Country Not Found</h1>
          <Button onClick={() => navigate('/countries')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Countries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      
      <div className="relative z-10">
        {/* Hero Section - Full Width */}
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/countries')}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">All Countries</span>
            </motion.button>

            {/* Country Header */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Title & Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Flag, Coat of Arms & Name */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Use database flag_url if available, fallback to flagcdn.com API */}
                    <img
                      src={countryInfo?.flag_url || country.flag_url || `https://flagcdn.com/w160/${country.code.toLowerCase()}.png`}
                      alt={`${country.name} flag`}
                      className="w-24 h-16 object-cover rounded shadow-md border border-gray-200"
                      onError={(e) => {
                        // Fallback to flagcdn if database flag fails
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('flagcdn.com')) {
                          target.src = `https://flagcdn.com/w160/${country.code.toLowerCase()}.png`;
                        } else {
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center hidden">
                      <span className="text-2xl font-bold text-gray-400">{country.code}</span>
                    </div>
                    {(countryInfo?.coat_of_arms_url || country.coat_of_arms_url) && (
                      <img
                        src={countryInfo?.coat_of_arms_url || country.coat_of_arms_url}
                        alt={`${country.name} Coat of Arms`}
                        className="w-16 h-16 object-contain opacity-80"
                      />
                    )}
                  </div>
                  <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tight">
                      {country.name}
                    </h1>
                    <p className="text-gray-400 text-lg mt-1">{country.code}</p>
                  </div>
                </div>

                {/* Description - use database description first, then Wikipedia */}
                {(countryInfo?.description || country.wikipedia_description) && (
                  <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                    {(countryInfo?.description || country.wikipedia_description || '').slice(0, 300)}
                    {(countryInfo?.description || country.wikipedia_description || '').length > 300 && '...'}
                  </p>
                )}

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 mt-8">
                  {(countryInfo?.capital || country.capital) && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Capital</p>
                      <p className="text-xl font-bold text-black">{countryInfo?.capital || country.capital}</p>
                    </div>
                  )}
                  {(countryInfo?.population || country.population) && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Population</p>
                      <p className="text-xl font-bold text-black">{formatNumber(countryInfo?.population || country.population)}</p>
                    </div>
                  )}
                  {countryInfo?.area_sq_km && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Area</p>
                      <p className="text-xl font-bold text-black">{formatNumber(countryInfo.area_sq_km)} km²</p>
                    </div>
                  )}
                </div>

                {countryInfo?.monument_image_url && (
                  <div className="mt-8 max-w-xl">
                    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={countryInfo.monument_image_url}
                        alt={`${country.name} Monument`}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-3">Monument / Landmark</p>
                  </div>
                )}
              </motion.div>

              {/* Right: Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <UltraSimpleMap
                  countryData={{
                    name: country.name,
                    capital: country.capital,
                    latitude: getCoords().lat,
                    longitude: getCoords().lng
                  }}
                  countryName={country.name}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sponsored Banner */}
        {sponsoredBanners.length > 0 && (
          <div className="bg-gray-50/50">
            <div className="max-w-6xl mx-auto px-6 py-6">
              {sponsoredBanners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => incrementBannerClick(banner.id)}
                  className="block group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Sponsored</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={banner.banner_image_url}
                      alt={banner.banner_alt_text || banner.company_name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                      onLoad={() => incrementBannerView(banner.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <p className="font-bold">{banner.company_name}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Country Details - Magazine Style */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-16">
              
              {/* At a Glance */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">At a Glance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Language', value: countryInfo?.language || country.language },
                    { label: 'Currency', value: countryInfo?.currency || country.currency },
                    { label: 'Currency Code', value: countryInfo?.currency_code },
                    { label: 'Calling Code', value: countryInfo?.calling_code },
                    { label: 'Timezone', value: countryInfo?.timezone },
                    { label: 'Formation Date', value: countryInfo?.formation_date },
                  ].filter(item => item.value).map((item, i) => (
                    <div key={i} className="border-l-2 border-black pl-4">
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className="font-semibold text-black">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Economy & Development */}
              {(countryInfo?.gdp_usd || countryInfo?.hdi_score) && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Economy & Development</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {countryInfo?.gdp_usd && (
                      <div>
                        <p className="text-4xl font-black text-black">${formatNumber(countryInfo.gdp_usd)}</p>
                        <p className="text-sm text-gray-500 mt-1">GDP (USD)</p>
                      </div>
                    )}
                    {countryInfo?.gdp_per_capita && (
                      <div>
                        <p className="text-4xl font-black text-black">${countryInfo.gdp_per_capita.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">GDP Per Capita</p>
                      </div>
                    )}
                    {countryInfo?.hdi_score && (
                      <div>
                        <p className="text-4xl font-black text-black">{countryInfo.hdi_score.toFixed(3)}</p>
                        <p className="text-sm text-gray-500 mt-1">HDI Score</p>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Demographics */}
              {(countryInfo?.life_expectancy || countryInfo?.literacy_rate || countryInfo?.largest_city) && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Demographics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {countryInfo?.life_expectancy && (
                      <div>
                        <p className="text-5xl font-black text-black">{countryInfo.life_expectancy}</p>
                        <p className="text-sm text-gray-500 mt-1">Life Expectancy (years)</p>
                      </div>
                    )}
                    {countryInfo?.literacy_rate && (
                      <div>
                        <p className="text-5xl font-black text-black">{countryInfo.literacy_rate}%</p>
                        <p className="text-sm text-gray-500 mt-1">Literacy Rate</p>
                      </div>
                    )}
                    {countryInfo?.average_age && (
                      <div>
                        <p className="text-5xl font-black text-black">{countryInfo.average_age}</p>
                        <p className="text-sm text-gray-500 mt-1">Median Age</p>
                      </div>
                    )}
                  </div>

                  {/* Cities */}
                  {(countryInfo?.largest_city || countryInfo?.capital_population) && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {countryInfo?.largest_city && (
                        <div className="border-l-2 border-black pl-4">
                          <p className="text-xs text-gray-400 mb-1">Largest City</p>
                          <p className="text-2xl font-bold text-black">{countryInfo.largest_city}</p>
                          {countryInfo?.largest_city_population && (
                            <p className="text-sm text-gray-500 mt-1">{formatNumber(countryInfo.largest_city_population)} people</p>
                          )}
                        </div>
                      )}
                      {countryInfo?.capital_population && (
                        <div className="border-l-2 border-black pl-4">
                          <p className="text-xs text-gray-400 mb-1">Capital Population</p>
                          <p className="text-2xl font-bold text-black">{formatNumber(countryInfo.capital_population)}</p>
                          <p className="text-sm text-gray-500 mt-1">people</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.section>
              )}

              {/* Featured Landmark / Country Highlight */}
              {countryInfo?.ad_is_active && countryInfo?.ad_image_url && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="my-12"
                >
                  <a
                    href={countryInfo.ad_company_website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async () => {
                      if (countryInfo.id && countryInfo.ad_company_website) {
                        try {
                          await (db as any).country_info()
                            .update({ ad_click_count: (countryInfo.ad_click_count || 0) + 1 })
                            .eq('id', countryInfo.id);
                        } catch (error) {
                          console.error('Error tracking click:', error);
                        }
                      }
                    }}
                    className="block group"
                  >
                    <div className="relative rounded-2xl overflow-hidden">
                      <img
                        src={countryInfo.ad_image_url}
                        alt={countryInfo.ad_company_name || `${country.name} Landmark`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        style={{ maxHeight: '400px' }}
                        onLoad={async () => {
                          if (countryInfo.id) {
                            try {
                              await (db as any).country_info()
                                .update({ ad_view_count: (countryInfo.ad_view_count || 0) + 1 })
                                .eq('id', countryInfo.id);
                            } catch (error) {
                              console.error('Error tracking view:', error);
                            }
                          }
                        }}
                      />
                      {countryInfo.ad_company_website && (
                        <div className="absolute top-4 right-4">
                          <span className="text-[10px] text-white bg-black/60 px-2 py-1 rounded uppercase tracking-wider">
                            Sponsored
                          </span>
                        </div>
                      )}
                      {(countryInfo.ad_company_name || countryInfo.ad_tagline) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
                          <div className="max-w-2xl">
                            {countryInfo.ad_tagline && (
                              <p className="text-white/90 text-sm mb-1">{countryInfo.ad_tagline}</p>
                            )}
                            {countryInfo.ad_company_name && (
                              <p className="text-white font-bold text-lg">{countryInfo.ad_company_name}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </a>
                </motion.section>
              )}

              {/* Businesses Section */}
              {businesses.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400">Featured Businesses</h2>
                    <Link 
                      to={`/countries/${countrySlug}/listings`}
                      className="text-sm font-medium text-black hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {businesses.slice(0, 6).map((biz, i) => (
                      <motion.div
                        key={biz.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="group p-4 border border-gray-100 rounded-xl hover:border-black hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/${countrySlug}/${biz.category?.slug || 'business'}/${biz.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {biz.logo_url ? (
                              <img src={biz.logo_url} alt="" className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <Building className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-black truncate group-hover:underline">{biz.name}</h3>
                            <p className="text-xs text-gray-500">{biz.category?.name}</p>
                            {biz.reviews && biz.reviews.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-black fill-current" />
                                <span className="text-xs text-gray-600">
                                  {(biz.reviews.reduce((a, r) => a + r.rating, 0) / biz.reviews.length).toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Leadership */}
              {countryInfo?.president_name && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 bg-gray-50 rounded-2xl"
                >
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Leadership</h3>
                  {countryInfo.leader_image_url && (
                    <div className="mb-4">
                      <img
                        src={countryInfo.leader_image_url}
                        alt={countryInfo.president_name}
                        className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 mx-auto"
                      />
                    </div>
                  )}
                  <p className="text-lg font-bold text-black">{countryInfo.president_name}</p>
                  {countryInfo.government_type && (
                    <p className="text-sm text-gray-500 mt-1">{countryInfo.government_type}</p>
                  )}
                </motion.div>
              )}

              {/* Resources & Environment */}
              {(countryInfo?.natural_resources || countryInfo?.main_industries || countryInfo?.climate || countryInfo?.tourism_attractions) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 bg-gray-50 rounded-2xl"
                >
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Resources & Environment</h3>
                  {countryInfo.climate && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-1">Climate</p>
                      <p className="text-sm text-black">{countryInfo.climate}</p>
                    </div>
                  )}
                  {countryInfo.natural_resources && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-1">Natural Resources</p>
                      <p className="text-sm text-black">{countryInfo.natural_resources}</p>
                    </div>
                  )}
                  {countryInfo.main_industries && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-1">Main Industries</p>
                      <p className="text-sm text-black">{countryInfo.main_industries}</p>
                    </div>
                  )}
                  {countryInfo.tourism_attractions && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tourism Attractions</p>
                      <p className="text-sm text-black">{countryInfo.tourism_attractions}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 border border-gray-200 rounded-2xl"
              >
                <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Explore</h3>
                <div className="space-y-3">
                  <Link
                    to={`/countries/${countrySlug}/listings`}
                    className="flex items-center justify-between p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium">Browse Businesses</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/events"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-black transition-colors"
                  >
                    <span className="font-medium">Events</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/marketplace"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-black transition-colors"
                  >
                    <span className="font-medium">Marketplace</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
      <BottomBannerAd />
      <Footer />
    </div>
  );
};
