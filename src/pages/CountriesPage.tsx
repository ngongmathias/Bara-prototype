import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, Users, TrendingUp, Search } from 'lucide-react';
import { db } from '@/lib/supabase';
import { Input } from '@/components/ui/input';

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

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await db.countries()
        .select('id, name, code, slug, flag_url, flag_emoji, description, population, capital')
        .order('name', { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPopulation = (pop: number | null) => {
    if (!pop) return 'N/A';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                BARA Countries
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore African nations and discover businesses, events, and opportunities across the continent
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search countries by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No countries found</h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map((country, index) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                onClick={() => navigate(`/countries/${country.slug}`)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500"
              >
                {/* Flag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {country.flag_emoji ? (
                      <span className="text-5xl">{country.flag_emoji}</span>
                    ) : country.flag_url ? (
                      <img 
                        src={country.flag_url} 
                        alt={`${country.name} flag`}
                        className="w-16 h-12 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {country.code}
                  </span>
                </div>

                {/* Country Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {country.name}
                </h3>

                {/* Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {country.capital && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>Capital: {country.capital}</span>
                    </div>
                  )}
                  {country.population && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Population: {formatPopulation(country.population)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {country.description && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {country.description}
                  </p>
                )}

                {/* View Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-blue-600 font-semibold">
                    <span className="text-sm">Explore {country.name}</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && filteredCountries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredCountries.length}</span> of{' '}
              <span className="font-bold">{countries.length}</span> countries
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
