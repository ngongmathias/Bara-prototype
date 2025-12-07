import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchAssemblyLogo } from '@/components/landing/GlitchAssemblyLogo';
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { 
  Globe, 
  Store, 
  Calendar, 
  ShoppingBag, 
  Users, 
  Megaphone,
  Search,
  ChevronDown
} from 'lucide-react';
import { db } from '@/lib/supabase';

interface Country {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
}

interface MiniApp {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const miniApps: MiniApp[] = [
  {
    id: 'advertise',
    title: 'BARA Advertise',
    description: 'Promote your business',
    icon: Megaphone,
    path: '/advertise',
  },
  {
    id: 'countries',
    title: 'BARA Countries',
    description: 'Explore African nations',
    icon: Globe,
    path: '/countries',
  },
  {
    id: 'listings',
    title: 'BARA Listings',
    description: 'Browse businesses',
    icon: Store,
    path: '/listings',
  },
  {
    id: 'events',
    title: 'BARA Events',
    description: 'Discover happenings',
    icon: Calendar,
    path: '/events',
  },
  {
    id: 'marketplace',
    title: 'BARA Marketplace',
    description: 'Shop products',
    icon: ShoppingBag,
    path: '/marketplace',
  },
  {
    id: 'communities',
    title: 'BARA Communities',
    description: 'Join local groups',
    icon: Users,
    path: '/communities',
  },
];

export const LandingPageFinal = () => {
  const navigate = useNavigate();
  const { selectedCountry, setSelectedCountry } = useCountrySelection();
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await db.countries()
        .select('id, name, code, flag_emoji')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry({
      id: country.id,
      name: country.name,
      code: country.code,
      flag_emoji: country.flag_emoji
    });
    setIsDropdownOpen(false);
    navigate('/listings');
  };

  const handleMiniAppClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 py-16 gap-12">
        
        {/* Interactive Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlitchAssemblyLogo />
        </motion.div>

        {/* Country Dropdown - Clean & Modern */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-5 px-8 rounded-2xl shadow-xl flex items-center justify-between transition-all duration-300"
            >
              <span className="flex items-center gap-4 text-lg">
                {selectedCountry ? (
                  <>
                    <span className="text-2xl">{selectedCountry.flag_emoji}</span>
                    <span>{selectedCountry.name}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-6 h-6" />
                    <span>Choose Your Country</span>
                  </>
                )}
              </span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
                >
                  {/* Search */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Country List */}
                  <div className="max-h-72 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <motion.button
                        key={country.id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full px-5 py-3 text-left flex items-center gap-3 text-black border-b border-gray-50 last:border-b-0"
                      >
                        <span className="text-2xl">{country.flag_emoji}</span>
                        <span className="text-sm font-medium">{country.name}</span>
                      </motion.button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-5 py-10 text-center text-gray-400 text-sm">
                        No countries found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mini Apps - Clean Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-3xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {miniApps.map((app, index) => {
              const Icon = app.icon;
              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -4,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMiniAppClick(app.path)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl p-5 transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center gap-2.5">
                    <div className="p-2.5 bg-black rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-black mb-0.5">{app.title}</h3>
                      <p className="text-[10px] text-gray-500">{app.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
