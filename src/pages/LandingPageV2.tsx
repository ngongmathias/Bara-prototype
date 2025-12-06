import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MatrixRain } from '@/components/landing/MatrixRain';
import { InteractiveLogo } from '@/components/landing/InteractiveLogo';
import { useCountrySelection } from '@/context/CountrySelectionContext';
import { 
  Globe, 
  Store, 
  Calendar, 
  ShoppingBag, 
  Users, 
  Megaphone,
  Search,
  ChevronDown,
  Sparkles
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
  gradient: string;
}

const miniApps: MiniApp[] = [
  {
    id: 'advertise',
    title: 'BARA Advertise',
    description: 'Promote your business',
    icon: Megaphone,
    path: '/advertise',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'countries',
    title: 'BARA Countries',
    description: 'Explore African nations',
    icon: Globe,
    path: '/countries',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'listings',
    title: 'BARA Listings',
    description: 'Browse businesses',
    icon: Store,
    path: '/listings',
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    id: 'events',
    title: 'BARA Events',
    description: 'Discover happenings',
    icon: Calendar,
    path: '/events',
    gradient: 'from-orange-600 to-red-600',
  },
  {
    id: 'marketplace',
    title: 'BARA Marketplace',
    description: 'Shop products',
    icon: ShoppingBag,
    path: '/marketplace',
    gradient: 'from-yellow-600 to-orange-600',
  },
  {
    id: 'communities',
    title: 'BARA Communities',
    description: 'Join local groups',
    icon: Users,
    path: '/communities',
    gradient: 'from-indigo-600 to-purple-600',
  },
];

export const LandingPageV2 = () => {
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
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Simple Matrix Rain Background */}
      <MatrixRain />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          
          {/* LEFT: Interactive Logo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-start"
          >
            <InteractiveLogo />
          </motion.div>

          {/* CENTER: Country Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Sparkles className="w-8 h-8 text-gold-400 mx-auto mb-3" />
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                Your Gateway to Africa
              </p>
            </motion.div>

            {/* Country Dropdown */}
            <div className="relative w-full max-w-md">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-bold py-6 px-8 rounded-2xl shadow-2xl flex items-center justify-between group transition-all duration-300"
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
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-gray-900/95 backdrop-blur-xl border border-gold-400/30 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    {/* Search */}
                    <div className="p-4 border-b border-gold-400/20">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-black/50 border border-gold-400/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Country List */}
                    <div className="max-h-80 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <motion.button
                          key={country.id}
                          whileHover={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                          onClick={() => handleCountrySelect(country)}
                          className="w-full px-6 py-4 text-left flex items-center gap-4 text-white border-b border-gold-400/10 last:border-b-0 transition-colors"
                        >
                          <span className="text-3xl">{country.flag_emoji}</span>
                          <span className="text-lg">{country.name}</span>
                        </motion.button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-6 py-12 text-center text-gray-500">
                          No countries found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT: Mini Apps Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            {miniApps.map((app, index) => {
              const Icon = app.icon;
              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMiniAppClick(app.path)}
                  className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gold-400/50 rounded-xl p-6 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-black/50 rounded-lg group-hover:bg-gold-400/20 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{app.title}</h3>
                      <p className="text-xs text-gray-400">{app.description}</p>
                    </div>
                  </div>

                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

        </div>
      </div>
    </div>
  );
};
