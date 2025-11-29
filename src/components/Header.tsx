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
  ChevronRight,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LanguageSelector } from "./LanguageSelector";
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

  return (
    <header className="bg-background border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
        {/* Single Row Layout (Default - when there's enough space) */}
        <div className="flex items-center justify-between h-20 min-[2000px]:flex">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 mr-8">
            <Link to="/" onClick={scrollToTop}>
              <div className="flex items-center py-4">
                <img src="/bara-3.png" className="h-12 w-auto" alt="Logo picture" />
                <img src="/bara-1-removebg-preview.png" className="h-12 w-auto ml-2" alt="Logo picture" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Single Row (only when space allows) */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
            <Link to="/" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto text-base">
                <List className="w-5 h-5 mr-2" />
                {t('navigation.listings')}
              </Button>
            </Link>
            
            <Link to="/marketplace" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto text-base">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t('navigation.marketplace')}
              </Button>
            </Link>
            
            <Link to="/events" onClick={scrollToTop}>
              <Button variant="ghost" className="font-roboto text-base">
                <Calendar className="w-5 h-5 mr-2" />
                {t('navigation.events')}
              </Button>
            </Link>

            {/* Users Menu - Show dropdown when signed in, link when not signed in */}
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-roboto text-base">
                    <User className="w-5 h-5 mr-2" />
                    {user?.fullName || user?.firstName || 'User'}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
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
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <UserNavLink />
            )}

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

            {/* Admin Link */}
            <AdminNavLink />

            {/* Search by Country Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="font-roboto">
                  {selectedCountry ? formatCountryDisplay(selectedCountry as Country) : t('navigation.searchByCountry')}
                  <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 border border-border shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                sideOffset={8}
              >
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yp-blue mx-auto"></div>
                    <p className="text-xs mt-1">{t('common.loading')}</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {countries.map((country) => (
                      <DropdownMenuItem
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        className="dropdown-menu-item-override font-roboto button cursor-pointer"
                      >
                        <span>{formatCountryDisplay(country)}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Authentication Section */}
            <div className="flex items-center ml-4">
              {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10 p-0 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50 transition-colors"
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
                  <DropdownMenuContent className="w-56 shadow-lg rounded-lg border border-gray-200" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                      <div className="flex-shrink-0">
                        {user?.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.fullName || 'User'} 
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                    </div>
                      <div className="flex-1 min-w-0">
                        {user?.fullName && (
                          <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                        )}
                        {user?.primaryEmailAddress?.emailAddress && (
                          <p className="text-xs text-gray-500 truncate">
                            {user.primaryEmailAddress.emailAddress}
                          </p>
                        )}
                    </div>
                </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/user/settings')}
                      className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-500" />
                      <span>{t('navigation.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>{t('navigation.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50 transition-colors"
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
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem onClick={() => navigate('/user/sign-in')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('navigation.login')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/user/sign-up')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('navigation.signup')}</span>
                    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
              )}
            </div>
          </div>

          {/* Right Side Actions for Two-Row Layout (only when space is limited) */}
          <div className="hidden max-[1999px]:flex items-center space-x-3">
            {/* Search by Country Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="font-roboto">
                  {selectedCountry ? formatCountryDisplay(selectedCountry as Country) : t('navigation.searchByCountry')}
                  <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 border border-border shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                sideOffset={8}
              >
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yp-blue mx-auto"></div>
                    <p className="text-xs mt-1">{t('common.loading')}</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {countries.map((country) => (
                      <DropdownMenuItem
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        className="dropdown-menu-item-override font-roboto button cursor-pointer"
                      >
                        <span>{formatCountryDisplay(country)}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Authentication Section */}
            <div className="flex items-center">
              {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 w-10 p-0 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50 transition-colors"
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
                  <DropdownMenuContent className="w-56 shadow-lg rounded-lg border border-gray-200" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                      <div className="flex-shrink-0">
                        {user?.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.fullName || 'User'} 
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                    </div>
                      <div className="flex-1 min-w-0">
                        {user?.fullName && (
                          <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                        )}
                        {user?.primaryEmailAddress?.emailAddress && (
                          <p className="text-xs text-gray-500 truncate">
                            {user.primaryEmailAddress.emailAddress}
                          </p>
                        )}
                    </div>
                </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/user/settings')}
                      className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-500" />
                      <span>{t('navigation.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>{t('navigation.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50 transition-colors"
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
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem onClick={() => navigate('/user/sign-in')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('navigation.login')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/user/sign-up')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('navigation.signup')}</span>
                    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
              )}
            </div>
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
        <div className="flex md:hidden items-center justify-start space-x-2 pb-3 border-t border-gray-100 pt-3 overflow-x-auto px-4 scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <Link to="/" onClick={scrollToTop}>
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

          {/* Users Menu - Show dropdown when signed in, link when not signed in */}
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-roboto">
                  <User className="w-4 h-4 mr-1" />
                  {user?.fullName || user?.firstName || 'User'}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
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
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <UserNavLink />
          )}

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

          {/* Admin Link */}
          <AdminNavLink />
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
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform translate-x-0 z-50">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-comfortaa font-semibold text-yp-dark">Menu</h2>
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
                {/* Navigation Links */}
                <div className="space-y-3">
                  <h3 className="text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide">
                    Navigation
                  </h3>
                  <Link to="/" onClick={() => { closeMobileMenu(); scrollToTop(); }}>
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

                {/* Language Selector */}
                <div className="space-y-3">
                  <h3 className="text-sm font-comfortaa font-semibold text-gray-900 uppercase tracking-wide">
                    Language
                  </h3>
                  <div className="pl-2">
                    <LanguageSelector />
                  </div>
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
                  BARA App - Connect with Local Businesses
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};