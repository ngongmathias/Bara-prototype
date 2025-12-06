import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MatrixRain } from '@/components/landing/MatrixRain';
import { BaraParticleText } from '@/components/landing/BaraParticleText';
import { AfricaMapLogo, BLettermarkLogo, BaraTextLogo } from '@/components/landing/BaraLogo';
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
  color: string;
}

const miniApps: MiniApp[] = [
  {
    id: 'advertise',
    title: 'BARA Advertise',
    description: 'Promote your business',
    icon: Megaphone,
    path: '/advertise',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'countries',
    title: 'BARA Countries',
    description: 'Explore African nations',
    icon: Globe,
    path: '/countries',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'listings',
    title: 'BARA Listings',
    description: 'Browse businesses',
    icon: Store,
    path: '/listings',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'events',
    title: 'BARA Events',
    description: 'Discover happenings',
    icon: Calendar,
    path: '/events',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'marketplace',
    title: 'BARA Marketplace',
    description: 'Shop products',
    icon: ShoppingBag,
    path: '/marketplace',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'communities',
    title: 'BARA Communities',
    description: 'Join local groups',
    icon: Users,
    path: '/communities',
    color: 'from-indigo-500 to-purple-500',
  },
];

export const LandingPage = () => {
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
    // Save to global context (persists across pages)
    setSelectedCountry({
      id: country.id,
      name: country.name,
      code: country.code,
      flag_emoji: country.flag_emoji
    });
    setIsDropdownOpen(false);
    // Navigate to listings page filtered by this country
    navigate('/listings');
  };

  const handleMiniAppClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Effects */}
      <MatrixRain />
      <BaraParticleText />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-between px-4 py-12 gap-12">
        {/* Left Side - BARA Logos */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center lg:items-start gap-8 lg:w-1/3"
        >
          {/* Africa Map Logo */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <AfricaMapLogo className="w-32 h-32 md:w-40 md:h-40" />
          </motion.div>

          {/* X Symbol */}
          <div className="text-gold-400 text-4xl font-bold">×</div>

          {/* B Lettermark Logo */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <BLettermarkLogo className="w-40 h-40 md:w-48 md:h-48" />
          </motion.div>

          {/* BARA Text */}
          <BaraTextLogo className="text-white text-center lg:text-left" />
        </motion.div>

        {/* Center - Country Dropdown */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 lg:w-1/3">

        {/* Big Country Dropdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl mb-16"
        >
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/10 backdrop-blur-md border-2 border-gold-400/50 rounded-2xl px-8 py-6 text-white text-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-between group"
            >
              <span className="flex items-center gap-4">
                {selectedCountry ? (
                  <>
                    <span className="text-4xl">{selectedCountry.flag_emoji}</span>
                    <span>{selectedCountry.name}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-8 h-8 text-gold-400" />
                    <span>Choose Your Country</span>
                  </>
                )}
              </span>
              <ChevronDown className={`w-8 h-8 text-gold-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 mt-4 bg-black/95 backdrop-blur-xl border-2 border-gold-400/50 rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Search */}
                <div className="p-4 border-b border-gold-400/30">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/10 border border-gold-400/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                {/* Country List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-6 py-4 text-left hover:bg-gold-400/20 transition-colors duration-200 flex items-center gap-4 text-white border-b border-gold-400/10 last:border-b-0"
                    >
                      <span className="text-3xl">{country.flag_emoji}</span>
                      <span className="text-lg font-medium">{country.name}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="px-6 py-8 text-center text-gray-400">
                      No countries found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        </div>

        {/* Right Side - Mini-App Dashboard Grid */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="lg:w-1/3"
        >
          <div className="grid grid-cols-2 gap-4">
            {miniApps.map((app, index) => {
              const Icon = app.icon;
              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMiniAppClick(app.path)}
                  className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl p-6 hover:border-gold-400/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-2 p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-gold-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{app.title}</h3>
                    <p className="text-xs text-gray-300">{app.description}</p>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl border-2 border-gold-400 animate-pulse" />
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
