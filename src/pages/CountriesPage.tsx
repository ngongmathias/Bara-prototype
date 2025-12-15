import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, ArrowRight, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Country {
  id: string;
  name: string;
  code: string;
  slug: string;
  flag_url: string | null;
  flag_emoji: string | null;
  description: string | null;
  population: number | null;
  capital: string | null;
}

export const CountriesPage = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      console.log('Fetching countries from Supabase...');
      // Note: 'slug' column doesn't exist - we'll generate it from name
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code, flag_url, flag_emoji, description, population, capital')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching countries:', error.message, error.details, error.hint);
        // Don't throw, just log - we have fallback in globe
      }
      
      if (data && data.length > 0) {
        // Generate slug from name since the column doesn't exist
        const countriesWithSlug = data.map(country => ({
          ...country,
          slug: country.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }));
        console.log(`✅ Loaded ${countriesWithSlug.length} countries from database`);
        setCountries(countriesWithSlug);
      } else {
        console.log('No countries returned from database');
      }
    } catch (error) {
      console.error('Exception fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (country.capital?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const formatPopulation = (pop: number | null) => {
    if (!pop) return null;
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toString();
  };

  const handleCountryClick = (country: Country) => {
    navigate(`/countries/${country.slug}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative min-h-screen bg-white">
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              
              {/* Left: Title & Search */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black tracking-tight leading-none mb-6">
                  EXPLORE
                  <br />
                  <span className="text-gray-400">AFRICA</span>
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
                  Discover {countries.length} African nations. Find businesses, events, 
                  and opportunities across the continent.
                </p>

                {/* Search Box */}
                <div className="relative max-w-md">
                  <div className={`relative transition-all duration-300 ${isSearchFocused ? 'transform scale-105' : ''}`}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search countries, capitals..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        setIsSearchFocused(true);
                        if (searchQuery) setShowDropdown(true);
                      }}
                      onBlur={() => {
                        setIsSearchFocused(false);
                        // Delay hiding dropdown to allow click
                        setTimeout(() => setShowDropdown(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredCountries.length > 0) {
                          navigate(`/countries/${filteredCountries[0].slug}`);
                        }
                        if (e.key === 'Escape') {
                          clearSearch();
                        }
                      }}
                      className="w-full pl-12 pr-12 py-4 text-base bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showDropdown && searchQuery && filteredCountries.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
                      >
                        {filteredCountries.slice(0, 6).map((country, index) => (
                          <motion.button
                            key={country.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleCountryClick(country)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                          >
                            <span className="text-2xl">{country.flag_emoji || '🌍'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-black truncate">{country.name}</p>
                              <p className="text-xs text-gray-500">{country.capital}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300" />
                          </motion.button>
                        ))}
                        {filteredCountries.length > 6 && (
                          <div className="px-4 py-2 text-xs text-gray-400 text-center bg-gray-50">
                            +{filteredCountries.length - 6} more results
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-8 mt-8">
                  <div>
                    <p className="text-3xl font-black text-black">{countries.length}</p>
                    <p className="text-xs uppercase tracking-wider text-gray-400">Countries</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-black">54</p>
                    <p className="text-xs uppercase tracking-wider text-gray-400">African Nations</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-black">1.4B</p>
                    <p className="text-xs uppercase tracking-wider text-gray-400">Population</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Countries List */}
        <div className="py-16 bg-gradient-to-b from-transparent to-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-black mb-2">All Countries</h2>
              <p className="text-gray-500">
                {searchQuery 
                  ? `${filteredCountries.length} results for "${searchQuery}"`
                  : `Browse all ${countries.length} countries on BARA`
                }
              </p>
            </motion.div>

            {/* Countries Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white/50 rounded-xl p-4 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredCountries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No countries found</h3>
                <p className="text-gray-400 mb-4">Try a different search term</p>
                <button
                  onClick={clearSearch}
                  className="text-black font-medium hover:underline"
                >
                  Clear search
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredCountries.map((country, index) => (
                  <motion.div
                    key={country.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleCountryClick(country)}
                    className="group bg-white/70 backdrop-blur-sm rounded-xl p-4 cursor-pointer border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300"
                  >
                    {/* Flag */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">
                        {country.flag_emoji || '🌍'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                        {country.code}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-black transition-colors">
                      {country.name}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {country.capital && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {country.capital}
                        </span>
                      )}
                    </div>

                    {/* Population */}
                    {formatPopulation(country.population) && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        {formatPopulation(country.population)}
                      </div>
                    )}

                    {/* Arrow on hover */}
                    <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-black" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
