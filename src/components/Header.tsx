import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Globe,
  List,
  ShoppingBag,
  Calendar,
  User,
  LogOut,
  Settings,
  ChevronDown,
  FileText,
  ChevronRight,
  MapPin,
  Wrench,
  Coins,
  Music,
  Trophy,
  Users,
  Newspaper,
  LayoutGrid,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { GoogleTranslate } from './GoogleTranslate';
import { db } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { XPProgressBar } from './gamification/XPProgressBar';
import { useGamification } from '@/hooks/useGamification';
import { getPrestigeTier } from '@/lib/gamificationService';
import { scrollToTop } from '@/lib/scrollToTop';
import { useCountrySelection } from '@/context/CountrySelectionContext';

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
}

/** Mini-app navigation items in the order specified by the team (March 1 meeting) */
const MINI_APPS = [
  { label: 'BARA Global', short: 'Global', to: '/countries', icon: Globe, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Events', short: 'Events', to: '/events', icon: Calendar, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Streams', short: 'Streams', to: '/streams', icon: Music, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Listings', short: 'Listings', to: '/listings', icon: List, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Marketplace', short: 'Market', to: '/marketplace', icon: ShoppingBag, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Sports', short: 'Sports', to: '/sports', icon: Trophy, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA News', short: 'News', to: '/news', icon: Newspaper, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Blog', short: 'Blog', to: '/blog', icon: FileText, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Communities', short: 'Communities', to: '/communities', icon: Users, color: 'text-gray-900', bg: 'bg-gray-100' },
  { label: 'BARA Tools', short: 'Tools', to: '/tools', icon: Wrench, color: 'text-gray-900', bg: 'bg-gray-100' },
];

// Primary apps shown directly in the nav bar (first 6)
const PRIMARY_APPS = MINI_APPS.slice(0, 6);
// Overflow apps shown in "More" dropdown
const MORE_APPS = MINI_APPS.slice(6);

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { selectedCountry, setSelectedCountry } = useCountrySelection();
  const { profile } = useGamification();

  const [countries, setCountries] = useState<Country[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAppsExpanded, setMobileAppsExpanded] = useState(true);
  const [mobileCountriesExpanded, setMobileCountriesExpanded] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await db.countries()
          .select('id, name, code, flag_url, wikipedia_url, description, population, capital, currency, language')
          .order('name', { ascending: true });
        if (error) {
          console.error('Error fetching countries:', error);
        } else if (data) {
          setCountries(data);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    if (megaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [megaMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry({ id: country.id, name: country.name, code: country.code, flag_url: country.flag_url || undefined });
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-[9997] backdrop-blur-md bg-white/90 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center flex-shrink-0">
            <img src="/bara-3.png" className="h-8 w-auto" alt="BARA" />
            <img src="/bara-1-removebg-preview.png" className="h-8 w-auto ml-1" alt="BARA Afrika" />
          </Link>

          {/* ─── Desktop: Center — Primary nav links + More dropdown ─── */}
          <nav className="hidden lg:flex items-center flex-1 justify-center gap-0.5" ref={megaMenuRef}>
            {PRIMARY_APPS.map((app) => {
              const Icon = app.icon;
              const isActive = location.pathname.startsWith(app.to);
              return (
                <Link
                  key={app.to}
                  to={app.to}
                  onClick={scrollToTop}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? app.color : ''}`} />
                  {app.short}
                </Link>
              );
            })}

            {/* More dropdown for overflow apps */}
            <div className="relative">
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  megaMenuOpen
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                More
                <ChevronDown className={`w-3 h-3 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {megaMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  {MORE_APPS.map((app) => {
                    const Icon = app.icon;
                    return (
                      <Link
                        key={app.to}
                        to={app.to}
                        onClick={() => { setMegaMenuOpen(false); scrollToTop(); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${app.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${app.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{app.short}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* ─── Desktop: Right — Country, Language, Coins, Notifications, Profile ─── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Country Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedCountry ? selectedCountry.code : 'RW'}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto" align="end">
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.id}
                    onClick={() => handleCountrySelect(country)}
                    className={selectedCountry?.id === country.id ? 'bg-gray-100 font-medium' : ''}
                  >
                    {country.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language (Google Translate) */}
            <GoogleTranslate />

            {/* Bara Coins */}
            {isSignedIn && profile && (
              <Link
                to="/store"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-sm font-bold text-gray-900 transition-colors"
                title="Bara Coins"
              >
                <Coins className="w-3.5 h-3.5 text-gray-700" />
                {profile.bara_coins.toLocaleString()}
              </Link>
            )}

            {/* Notifications */}
            {isSignedIn && <NotificationBell />}

            {/* Profile / Auth */}
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-visible ring-2 ring-white shadow-sm ring-offset-1">
                    <div className={`absolute inset-[-3px] rounded-full -z-10 ${profile ? (
                      getPrestigeTier(profile.current_level) === 'Diamond' ? 'bg-gradient-to-tr from-blue-400 via-cyan-300 to-blue-400 animate-shimmer bg-[length:200%_100%]' :
                      getPrestigeTier(profile.current_level) === 'Gold' ? 'bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-600 animate-shimmer bg-[length:200%_100%]' :
                      getPrestigeTier(profile.current_level) === 'Silver' ? 'bg-gradient-to-tr from-slate-400 to-slate-200' :
                      getPrestigeTier(profile.current_level) === 'Bronze' ? 'bg-gradient-to-tr from-amber-700 to-amber-500' :
                      'bg-gray-200 opacity-50'
                    ) : 'bg-transparent'}`} />
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName || 'User'} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-700" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-3 p-3 border-b">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName || 'User'} className="h-10 w-10 rounded-full border-2 border-white ring-1 ring-black/5" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-700" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <XPProgressBar />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/users/dashboard')}>
                    <User className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/users/dashboard/events')}>
                    <Calendar className="w-4 h-4 mr-2" /> My Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/users/dashboard/profile')}>
                    <Settings className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-gray-700">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/user/sign-up')} className="hidden xl:inline-flex text-sm">
                  Sign Up
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/user/sign-in')} className="text-sm">
                  Sign In
                </Button>
              </div>
            )}
          </div>

          {/* ─── Mobile: Coins + Hamburger ─── */}
          <div className="flex lg:hidden items-center gap-2">
            {isSignedIn && profile && (
              <Link
                to="/store"
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-bold text-gray-900"
              >
                <Coins className="w-3 h-3 text-gray-700" />
                {profile.bara_coins.toLocaleString()}
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Full-Screen Menu (Portal) ─── */}
      {isMobileMenuOpen && typeof document !== 'undefined' &&
        createPortal(
          <div className="lg:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-[2147483646]" onClick={closeMobileMenu} />

            {/* Slide-in Panel */}
            <div className="fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white shadow-2xl z-[2147483647] flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-base font-bold font-comfortaa">Menu</h2>
                <button onClick={closeMobileMenu} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">

                {/* User Card */}
                <div className="p-4 border-b">
                  {isSignedIn ? (
                    <div className="flex items-center gap-3">
                      <img
                        className="h-11 w-11 rounded-full object-cover border-2 border-blue-200"
                        src={user?.imageUrl || '/default-avatar.png'}
                        alt={user?.fullName || 'User'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user?.fullName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Welcome to BARA!</p>
                      <Button
                        variant="default"
                        className="w-full"
                        size="sm"
                        onClick={() => { navigate('/user/sign-in'); closeMobileMenu(); }}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>

                {/* Country & Language Row */}
                <div className="grid grid-cols-2 gap-3 p-4 border-b">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Country</p>
                    <button
                      onClick={() => setMobileCountriesExpanded(!mobileCountriesExpanded)}
                      className="text-sm font-medium text-gray-800 flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedCountry?.name || 'Rwanda'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${mobileCountriesExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Language</p>
                    <GoogleTranslate />
                  </div>
                </div>

                {/* Country Expansion */}
                {mobileCountriesExpanded && (
                  <div className="max-h-48 overflow-y-auto border-b bg-gray-50 p-2">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => { handleCountrySelect(country); setMobileCountriesExpanded(false); }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                          selectedCountry?.id === country.id ? 'bg-gray-200 font-medium text-gray-900' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mini-Apps */}
                <div className="p-4">
                  <button
                    onClick={() => setMobileAppsExpanded(!mobileAppsExpanded)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
                  >
                    Mini-Apps
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileAppsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAppsExpanded && (
                    <div className="space-y-0.5">
                      {MINI_APPS.map((app) => {
                        const Icon = app.icon;
                        return (
                          <Link
                            key={app.to}
                            to={app.to}
                            onClick={() => { closeMobileMenu(); scrollToTop(); }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-lg ${app.bg} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${app.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{app.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Account Actions */}
                {isSignedIn && (
                  <div className="p-4 border-t">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</p>
                    <div className="space-y-0.5">
                      <button onClick={() => { navigate('/users/dashboard'); closeMobileMenu(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                        <User className="w-4 h-4" /> Dashboard
                      </button>
                      <button onClick={() => { navigate('/users/dashboard/events'); closeMobileMenu(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" /> My Events
                      </button>
                      <button onClick={() => { navigate('/users/dashboard/profile'); closeMobileMenu(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                        <Settings className="w-4 h-4" /> Profile & Settings
                      </button>
                      <button onClick={() => { signOut(); closeMobileMenu(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="p-3 border-t text-center">
                <p className="text-[10px] text-gray-400">BARA Afrika · One Land. One People. One Future.</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
