import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RealBaraLogo } from '@/components/landing/RealBaraLogo';
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

export const LandingPageV3 = () => {
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
    <div className="relative min-h-screen bg-black">
      {/* Simple gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black opacity-50" />

      {/* Main Content - Centered Vertically */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 py-16 gap-16">
        
        {/* Logo - Top */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <RealBaraLogo />
        </motion.div>

        {/* Country Dropdown - Middle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-6 px-8 rounded-xl shadow-2xl flex items-center justify-between group transition-all duration-300"
            >
              <span className="flex items-center gap-4 text-xl">
                {selectedCountry ? (
                  <>
                    <span className="text-3xl">{selectedCountry.flag_emoji}</span>
                    <span>{selectedCountry.name}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-7 h-7" />
                    <span>Choose Your Country</span>
                  </>
                )}
              </span>
              <ChevronDown 
                className={`w-6 h-6 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200"
                >
                  {/* Search */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Country List */}
                  <div className="max-h-80 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <motion.button
                        key={country.id}
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full px-6 py-4 text-left flex items-center gap-4 text-black border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <span className="text-3xl">{country.flag_emoji}</span>
                        <span className="text-lg font-medium">{country.name}</span>
                      </motion.button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-6 py-12 text-center text-gray-400">
                        No countries found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mini Apps Grid - Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {miniApps.map((app, index) => {
              const Icon = app.icon;
              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMiniAppClick(app.path)}
                  className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-xl p-6 transition-all duration-300"
                >
                  {/* Content */}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-white/10 group-hover:bg-white/20 rounded-lg transition-colors duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{app.title}</h3>
                      <p className="text-xs text-gray-400">{app.description}</p>
                    </div>
                  </div>

                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-xl bg-white/5" />
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
