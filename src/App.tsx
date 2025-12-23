import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CountrySelectionProvider } from "@/context/CountrySelectionContext";
import { useAuthLogging } from "@/hooks/useAuthLogging";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Test Supabase connection early
import "@/lib/testSupabase";
import { LandingPageFinal as LandingPage } from "./pages/LandingPageFinal";
import ListingsPage from "./pages/ListingsPage";
import CategoryListingsPage from "./pages/CategoryListingsPage";
import NotFound from "./pages/NotFound";
import { WriteReviewPage } from "./pages/WriteReviewPage";
import { ClaimListingPage } from "./pages/ClaimListingPage";
import  AdvertisePage from "./pages/AdvertisePage";
import  ContactUsPage from "./pages/ContactUsPage";
import AboutUsPage from "./pages/AboutUsPage";
import { BusinessDetailPage } from "./pages/BusinessDetailPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CityDetailPage } from "./pages/CityDetailPage";
import { CountryDetailPage } from "./pages/CountryDetailPage";
import { CountryListingsPage } from "./pages/CountryListingsPage";
import { CountriesPage } from "./pages/CountriesPage";
import { AskQuestionPage } from "./pages/AskQuestionPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCities } from "./pages/admin/AdminCities";
import { AdminCountries } from "./pages/admin/AdminCountries";
import { AdminCountryInfo } from "./pages/admin/AdminCountryInfo";
import { AdminBusinesses } from "./pages/admin/AdminBusinesses";
import { AdminEventsEnhanced as AdminEvents } from "./pages/admin/AdminEventsEnhanced";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminSponsoredAds } from "./pages/admin/AdminSponsoredAds";
import { AdminReports } from "./pages/admin/AdminReportsNew";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminManagement } from "./pages/admin/AdminManagement";
import { AdminRSSFeeds } from "./pages/admin/AdminRSSFeeds";
import { AdminSettings } from "./pages/admin/AdminSettings";
import ContactMessagesPage from "./pages/admin/ContactMessagesPage";
import { AdminBannerAds } from "./pages/admin/AdminBannerAds";
import { AdminAuthGuard } from "./components/admin/AdminAuthGuard";
import { UserAuthGuard } from "./components/users/UserAuthGuard";
import { MapTestPage } from "./pages/MapTestPage";
import FaqPage from "./pages/FaqPage";
// import { SimpleMapTest } from "./pages/SimpleMapTest";
import { UltraSimpleMap } from "./components/UltraSimpleMap";
import MarketplacePage from "./pages/MarketplacePage";
import {EventsPage} from "./pages/EventsPage";
import { ToolsPage } from "./pages/ToolsPage";
import CommunitiesPage from "./pages/communities";
import { CommunityPage } from "./pages/communities/CommunityPage";
import UserSignInPage from "./pages/user/UserSignInPage";
import UserSignUpPage from "./pages/user/UserSignUpPage";
import { UserDashboard } from "./pages/users/UserDashboard";
import { UserEventsPage } from "./pages/users/UserEventsPage";
import { UserProfilePage } from "./pages/users/UserProfilePage";
import { UserBannerSubmission } from "./pages/users/UserBannerSubmission";
import UserSettingsPage from "./pages/users/UserSettingsPage";
import AdvertiseCheckoutPage from "./pages/AdvertiseCheckoutPage";
import { SponsorCountryPage } from "./pages/SponsorCountryPage";
import { AdminSponsoredBanners } from "./pages/admin/AdminSponsoredBanners";
import { AdminSlideshowImages } from "./pages/admin/AdminSlideshowImages";
import AdminEventsSlideshow from "./pages/admin/AdminEventsSlideshow";
import AdminPopups from "./pages/admin/AdminPopups";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const AppRoutes = () => {
  // Use the auth logging hook to track all authentication events
  useAuthLogging();
  const { i18n } = useTranslation();

  // Keep document language and direction in sync with current i18n language
  useEffect(() => {
    const lang = i18n.language || 'en';
    const rtlLangs = ['ar', 'fa', 'ur', 'he'];
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <>
      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/business-listings" element={<ListingsPage />} />
      <Route path="/writeareview" element={<WriteReviewPage />} />
      <Route path="/write-review/:businessId" element={<WriteReviewPage />} />
      <Route path="/claim-listing" element={<ClaimListingPage />} />
      <Route path="/advertise" element={<AdvertisePage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/ask-question" element={<AskQuestionPage />} />
      <Route path="/listings/categories" element={<CategoriesPage />} />
      <Route path="/listings/category/:categorySlug" element={<CategoryListingsPage />} />
      <Route path="/:city/search" element={<ListingsPage />} />
      <Route path="/:city/:category" element={<CategoryListingsPage />} />
      <Route path="/:city/:category/:businessId" element={<BusinessDetailPage />} />
      <Route path="/cities/:citySlug" element={<CityDetailPage />} />
      <Route path="/countries" element={
        <MainLayout>
          <CountriesPage />
        </MainLayout>
      } />
      <Route path="/countries/:countrySlug/listings" element={
        <MainLayout>
          <CountryListingsPage />
        </MainLayout>
      } />
      <Route path="/countries/:countrySlug" element={
        <MainLayout>
          <CountryDetailPage />
        </MainLayout>
      } />
      
      {/* New Navigation Pages */}
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventsPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/advertise/checkout" element={<AdvertiseCheckoutPage />} />
      <Route path="/sponsor-country" element={<SponsorCountryPage />} />
      
      {/* Authentication Routes */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/user/sign-in" element={<UserSignInPage />} />
      <Route path="/user/sign-up" element={<UserSignUpPage />} />
      <Route path="/user/settings" element={<UserSettingsPage />} />
      
      {/* User Dashboard Routes */}
      <Route path="/users/dashboard" element={
        <UserAuthGuard>
          <UserDashboard />
        </UserAuthGuard>
      }>
        <Route index element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Dashboard Home</h2><p>Welcome to your dashboard!</p></div>} />
        <Route path="events" element={<UserEventsPage />} />
        <Route path="banner-submissions" element={<UserBannerSubmission />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>
      
      {/* Community Pages */}
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/communities/:communityId" element={<CommunityPage />} />
      
      {/* <Route path="/googlemaps" element={<GoogleMapsTest />} /> */}
      <Route path="/map-test" element={<MapTestPage />} />
      {/* <Route path="/simple-map-test" element={<SimpleMapTest />} */}
    {/* <Route path="/callback-map-test" element={
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Callback Map Test</h1>
        <CityMapLeafletCallback
          cityName="Cairo"
          latitude={30.0444}
          longitude={31.2357}
          businesses={[
            {
              id: 'test-1',
              name: 'Test Restaurant',
              description: 'A test restaurant',
              phone: '+1234567890',
              website: 'https://example.com',
              address: '123 Test St',
              latitude: 30.0444 + 0.001,
              longitude: 31.2357 + 0.001,
              category: { name: 'Restaurant', slug: 'restaurant' },
              reviews: []
            }
          ]}
          height="500px"
        />
      </div>
    } /> */}
    <Route path="/ultra-simple-map" element={
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Ultra Simple Map Test</h1>
        <UltraSimpleMap 
          cityName="Cairo"
          latitude={30.0444}
          longitude={31.2357}
        />
      </div>
    } />
      
      {/* Admin Routes - Protected by AdminAuthGuard */}
      <Route path="/admin" element={
        <AdminAuthGuard>
          <AdminDashboard />
        </AdminAuthGuard>
      } />
      <Route path="/admin/cities" element={
        <AdminAuthGuard>
          <AdminCities />
        </AdminAuthGuard>
      } />
      <Route path="/admin/countries" element={
        <AdminAuthGuard>
          <AdminCountries />
        </AdminAuthGuard>
      } />
      <Route path="/admin/country-info" element={
        <AdminAuthGuard>
          <AdminCountryInfo />
        </AdminAuthGuard>
      } />
      <Route path="/admin/businesses" element={
        <AdminAuthGuard>
          <AdminBusinesses />
        </AdminAuthGuard>
      } />
      <Route path="/admin/events" element={
        <AdminAuthGuard>
          <AdminEvents />
        </AdminAuthGuard>
      } />
      <Route path="/admin/sponsored-ads" element={
        <AdminAuthGuard>
          <AdminSponsoredAds />
        </AdminAuthGuard>
      } />
      <Route path="/admin/categories" element={
        <AdminAuthGuard>
          <AdminCategories />
        </AdminAuthGuard>
      } />
      <Route path="/admin/reports" element={
        <AdminAuthGuard>
          <AdminReports />
        </AdminAuthGuard>
      } />
      <Route path="/admin/reviews" element={
        <AdminAuthGuard>
          <AdminReviews />
        </AdminAuthGuard>
      } />
      <Route path="/admin/users" element={
        <AdminAuthGuard>
          <AdminUsers />
        </AdminAuthGuard>
      } />
      <Route path="/admin/admin-management" element={
        <AdminAuthGuard>
          <AdminManagement />
        </AdminAuthGuard>
      } />
      <Route path="/admin/rss-feeds" element={
        <AdminAuthGuard>
          <AdminRSSFeeds />
        </AdminAuthGuard>
      } />
      <Route path="/admin/settings" element={
        <AdminAuthGuard>
          <AdminSettings />
        </AdminAuthGuard>
      } />
      <Route path="/admin/contact-messages" element={
        <AdminAuthGuard>
          <ContactMessagesPage />
        </AdminAuthGuard>
      } />
      <Route path="/admin/banner-ads" element={
        <AdminAuthGuard>
          <AdminBannerAds />
        </AdminAuthGuard>
      } />
      <Route path="/admin/sponsored-banners" element={
        <AdminAuthGuard>
          <AdminSponsoredBanners />
        </AdminAuthGuard>
      } />
      <Route path="/admin/slideshow-images" element={
        <AdminAuthGuard>
          <AdminSlideshowImages />
        </AdminAuthGuard>
      } />
      <Route path="/admin/popups" element={
        <AdminAuthGuard>
          <AdminPopups />
        </AdminAuthGuard>
      } />
      <Route path="/admin/events-slideshow" element={
        <AdminAuthGuard>
          <AdminEventsSlideshow />
        </AdminAuthGuard>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CountrySelectionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CountrySelectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;







