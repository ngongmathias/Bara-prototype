import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Star, 
  Menu, 
  X, 
  Globe,
  List,
  ShoppingBag,
  Calendar,
  User,
  LogOut,
  Settings,
  Crown,
  ChevronDown,
  Shield,
  FileText,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Wrench
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LanguageSelectorWithTranslate } from "./LanguageSelectorWithTranslate";
import { AdminNavLink } from "./AdminNavLink";
import { UserNavLink } from "./UserNavLink";
import { db } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { fetchWikipediaCountryInfo } from "@/lib/wikipedia";
import { scrollToTop } from "@/lib/scrollToTop";
import { useCountrySelection } from "@/context/CountrySelectionContext";

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
  coat_of_arms_url?: string | null;
  area?: string | null;
  gdp?: string | null;
  timezone?: string | null;
  wikipedia_description?: string | null;
}

interface City {
  // Add city properties here
}

export const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [countriesExpanded, setCountriesExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { selectedCountry, setSelectedCountry } = useCountrySelection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        console.log('Fetching countries from database...');
        
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
            language
          `)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching countries:', error);
          toast({
            title: 'Error',
            description: 'Failed to load countries. Please try again.',
            variant: "destructive"
          });
        } else {
          console.log(`Fetched ${data?.length || 0} countries from database:`, data);
          
          if (data && data.length > 0) {
            setCountries(data);
          } else {
            console.warn('No countries found in database');
            setCountries([]);
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load countries. Please try again.',
          variant: "destructive"
        });
      } finally {
        setIsCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const formatCountryDisplay = (country: Country) => {
    return `${country.name} (${country.code})`;
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry({ id: country.id, name: country.name, code: country.code, flag_url: country.flag_url || undefined });
    closeMobileMenu();
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleCountriesExpanded = () => {
    setCountriesExpanded(!countriesExpanded);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
        {/* Desktop & Mobile Layout - v2.1 Compact */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" onClick={scrollToTop}>
              <div className="flex items-center py-2">
                <img src="/bara-3.png" className="h-9 w-auto" alt="Logo picture" />
                <img src="/bara-1-removebg-preview.png" className="h-9 w-auto ml-1" alt="Logo picture" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Left aligned */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 ml-4">
            <Link to="/events" onClick={scrollToTop} className="link-underline">
              <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                <Calendar className="w-4 h-4 mr-1.5" />
                {t('navigation.events')}
              </Button>
            </Link>
            
            <Link to="/blog" onClick={scrollToTop} className="link-underline">
              <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                <FileText className="w-4 h-4 mr-1.5" />
                Blog
              </Button>
            </Link>
            
            <Link to="/listings" onClick={scrollToTop} className="link-underline">
              <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                <List className="w-4 h-4 mr-1.5" />
                {t('navigation.listings')}
              </Button>
            </Link>
            
            <Link to="/marketplace" onClick={scrollToTop} className="link-underline">
              <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                {t('navigation.marketplace')}
              </Button>
            </Link>

            <Link to="/advertise" onClick={scrollToTop} className="link-underline">
              <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                <Building className="w-4 h-4 mr-1.5" />
                {t('navigation.advertise')}
              </Button>
            </Link>

            <Link to="/writeareview" onClick={scrollToTop} className="link-underline">
              <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                <Crown className="w-4 h-4 mr-1.5" />
                {t('navigation.writeReview')}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-roboto text-sm font-medium px-3 h-9 hover:bg-gray-100/50 transition-all">
                  <Wrench className="w-4 h-4 mr-1.5" />
                  Tools
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <Link to="/tools" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Wrench className="w-4 h-4 mr-2" />
                    All Tools
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link to="/tools#calculator" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer text-sm">Calculator</DropdownMenuItem>
                </Link>
                <Link to="/tools#compass" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer text-sm">Compass</DropdownMenuItem>
                </Link>
                <Link to="/tools#world-clock" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer text-sm">World Clock</DropdownMenuItem>
                </Link>
                <Link to="/tools#currency-converter" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer text-sm">Currency Converter</DropdownMenuItem>
                </Link>
                <Link to="/tools#unit-converter" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer text-sm">Unit Converter</DropdownMenuItem>
                </Link>
                <Link to="/tools#qr-generator" onClick={scrollToTop}>
                  <DropdownMenuItem className="cursor-pointer text-sm">QR Generator</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop Right Side - User, Country, Language */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Country Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-roboto text-xs h-8 px-2">
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  {selectedCountry ? selectedCountry.code : 'Country'}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yp-blue mx-auto"></div>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {countries.map((country) => (
                      <DropdownMenuItem
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                      >
                        {country.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selector with Translate */}
            <LanguageSelectorWithTranslate />

            {/* User Profile */}
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-10 w-10 p-0 rounded-full border-2 border-blue-500"
                  >
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User'} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-blue-600" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-3 p-3 border-b">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User'} 
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/users/dashboard')}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/users/dashboard/events')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    My Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/users/dashboard/profile')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                onClick={() => navigate('/user/sign-in')}
                className="font-roboto"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Second Row - Navigation Links (mobile/tablet scrollable, hidden on large desktop) */}
        <div className="relative md:hidden border-t border-gray-100">
          {/* Subtle Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-1 rounded-full shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {/* Gradient fade indicator on right to show more content */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
          
          {/* Subtle Right Arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-1 rounded-full shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center justify-start space-x-2 pb-3 pt-3 overflow-x-auto px-4 scrollbar-hide" 
            style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
          >
            <Link to="/listings" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto">
                <List className="w-4 h-4 mr-1" />
                {t('navigation.listings')}
              </Button>
            </Link>
            
            <Link to="/marketplace" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto">
                <ShoppingBag className="w-4 h-4 mr-1" />
                {t('navigation.marketplace')}
              </Button>
            </Link>
            
            <Link to="/events" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto">
                <Calendar className="w-4 h-4 mr-1" />
                {t('navigation.events')}
              </Button>
            </Link>
            
            <Link to="/blog" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto">
                <FileText className="w-4 h-4 mr-1" />
                Blog
              </Button>
            </Link>

          <Link to="/advertise" onClick={scrollToTop}>
            <Button variant="ghost" className="font-roboto">
            <Building className="w-4 h-4 mr-1" />
            {t('navigation.advertise')}
            </Button>
          </Link>
          
          <Link to="/writeareview" onClick={scrollToTop}>
            <Button variant="ghost" className="font-roboto">
              <Crown className="w-4 h-4 mr-1" />
              {t('navigation.writeReview')}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-roboto">
                <Wrench className="w-4 h-4 mr-1" />
                Tools
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <Link to="/tools" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer">
                  <Wrench className="w-4 h-4 mr-2" />
                  All Tools
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link to="/tools#calculator" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer text-sm">Calculator</DropdownMenuItem>
              </Link>
              <Link to="/tools#compass" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer text-sm">Compass</DropdownMenuItem>
              </Link>
              <Link to="/tools#world-clock" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer text-sm">World Clock</DropdownMenuItem>
              </Link>
              <Link to="/tools#currency-converter" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer text-sm">Currency Converter</DropdownMenuItem>
              </Link>
              <Link to="/tools#unit-converter" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer text-sm">Unit Converter</DropdownMenuItem>
              </Link>
              <Link to="/tools#qr-generator" onClick={scrollToTop}>
                <DropdownMenuItem className="cursor-pointer text-sm">QR Generator</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {isSignedIn ? (
            <Button variant="ghost" className="font-roboto" onClick={() => navigate('/users/dashboard')}>
              <User className="w-4 h-4 mr-1" />
              {user?.firstName || 'Account'}
            </Button>
          ) : (
            <Button variant="ghost" className="font-roboto" onClick={() => navigate('/user/sign-in')}>
              <User className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform translate-x-0 z-50">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h2 className="text-base font-comfortaa font-semibold text-yp-dark">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMobileMenu}
                  className="p-1 hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* User Profile Section - AT TOP */}
                {isSignedIn ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-12 w-12 rounded-full object-cover border-2 border-blue-300"
                        src={user?.imageUrl || '/default-avatar.png'}
                        alt={user?.fullName || 'User avatar'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {user?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                    <p className="text-lg font-bold mb-2">Welcome to BARA!</p>
                    <p className="text-sm mb-3 opacity-90">Sign in to access your dashboard and personalized features</p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                      onClick={() => {
                        navigate('/user/sign-in');
                        closeMobileMenu();
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </div>
                )}

                {/* Language & Country - PROMINENT */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">LANGUAGE</p>
                    <LanguageSelectorWithTranslate />
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">COUNTRY</p>
                    <button
                      onClick={toggleCountriesExpanded}
                      className="w-full text-left text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {selectedCountry ? selectedCountry.name : 'Select'}
                      <ChevronRight className={`w-4 h-4 inline ml-1 transition-transform ${countriesExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3">
                  <h3 className="text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide">
                    Navigation
                  </h3>
                  <Link to="/listings" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                    <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                      <List className="w-5 h-5 mr-3" />
                      {t('navigation.listings')}
                    </Button>
                  </Link>
                  <Link to="/marketplace" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                    <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                      <ShoppingBag className="w-5 h-5 mr-3" />
                      {t('navigation.marketplace')}
                    </Button>
                  </Link>
                  <Link to="/events" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                    <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                      <Calendar className="w-5 h-5 mr-3" />
                      {t('navigation.events')}
                    </Button>
                  </Link>
                  <Link to="/blog" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                    <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                      <FileText className="w-5 h-5 mr-3" />
                      Blog
                    </Button>
                  </Link>
                </div>

                {/* Business Services */}
                <div className="space-y-3">
                  <h3 className="text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide">
                    Business Services
                  </h3>
                  <Link to="/advertise" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                  <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                    <Building className="w-5 h-5 mr-3" />
                    {t('navigation.advertise')}
                  </Button>
                  </Link>
                  <Link to="/writeareview" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                    <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                      <Crown className="w-5 h-5 mr-3" />
                      {t('navigation.writeReview')}
                    </Button>
                  </Link>
                </div>

                {/* Admin Access */}
                <div className="space-y-3">
                  <h3 className="text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide">
                    Administration
                  </h3>
                  <Link to="/sign-in?redirect_url=/admin" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
                    <Button variant="ghost" className="w-full justify-start font-roboto h-12">
                      <Shield className="w-5 h-5 mr-3" />
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>

                {/* Authentication Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide">
                    Account
                  </h3>
                  {isSignedIn ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user?.imageUrl || '/default-avatar.png'}
                          alt={user?.fullName || 'User avatar'}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.fullName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-roboto h-12"
                        onClick={() => {
                          navigate('/users/dashboard');
                          closeMobileMenu();
                          scrollToTop();
                        }}
                      >
                        <User className="w-5 h-5 mr-3" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-roboto h-12"
                        onClick={() => {
                          navigate('/users/dashboard/events');
                          closeMobileMenu();
                          scrollToTop();
                        }}
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        My Events
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-roboto h-12"
                        onClick={() => {
                          navigate('/users/dashboard/profile');
                          closeMobileMenu();
                          scrollToTop();
                        }}
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-roboto h-12"
                        onClick={() => {
                          signOut();
                          closeMobileMenu();
                          scrollToTop();
                        }}
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        {t('navigation.logout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-roboto h-12"
                        onClick={() => {
                          navigate('/sign-in?redirect_url=/users/dashboard');
                          closeMobileMenu();
                          scrollToTop();
                        }}
                      >
                        <User className="w-5 h-5 mr-3" />
                        {t('navigation.login')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-roboto h-12"
                        onClick={() => {
                          navigate('/sign-up');
                          closeMobileMenu();
                          scrollToTop();
                        }}
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        {t('navigation.signup')}
                      </Button>
                    </>
                  )}
                </div>

                {/* Countries Section */}
                <div className="space-y-3">
                  <button
                    onClick={toggleCountriesExpanded}
                    className="w-full flex items-center justify-between text-left text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide hover:text-yp-blue transition-colors duration-200"
                  >
                    <span>{t('navigation.searchByCountry')}</span>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        countriesExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    countriesExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    {isCountriesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yp-blue mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-1">{t('common.loading')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pl-4 max-h-[600px] overflow-y-auto">
                        {countries.map((country) => (
                          <Button
                            key={country.id}
                            variant="ghost"
                            className={`w-full justify-start font-roboto h-10 text-sm transition-all duration-200 ${
                              countries.length > 0 && (selectedCountry?.id === country.id 
                                ? "bg-yp-blue text-white shadow-md" 
                                : "hover:bg-gray-100 text-gray-700"
                            )}`}
                            onClick={() => handleCountrySelect(country)}
                          >
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4" />
                              <span>{formatCountryDisplay(country)}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 font-roboto text-center">
                  BARA App - Connect with Local Businesses ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

