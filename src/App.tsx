import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CountrySelectionProvider } from "@/context/CountrySelectionContext";
import { useAuthLogging } from "@/hooks/useAuthLogging";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Test Supabase connection early
import "@/lib/testSupabase";
import { LandingPageFinal as LandingPage } from "./pages/LandingPageFinal";
import { TestRSSPage } from "./pages/TestRSSPage";
import ListingsPage from "./pages/ListingsPage";
import CategoryListingsPage from "./pages/CategoryListingsPage";
import NotFound from "./pages/NotFound";
import { WriteReviewPage } from "./pages/WriteReviewPage";
import { ClaimListingPage } from "./pages/ClaimListingPage";
import AdvertisePage from "./pages/AdvertisePage";
import ContactUsPage from "./pages/ContactUsPage";
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
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminManagement } from "./pages/admin/AdminManagement";
import { AdminRSSFeeds } from "./pages/admin/AdminRSSFeeds";
import { AdminSettings } from "./pages/admin/AdminSettings";
import ContactMessagesPage from "./pages/admin/ContactMessagesPage";
import AdminGamification from "./pages/admin/AdminGamification";
import AdminRevenue from "./pages/admin/AdminRevenue";
import { AdminBannerAds } from "./pages/admin/AdminBannerAds";
import { AdminAuthGuard } from "./components/admin/AdminAuthGuard";
import { UserAuthGuard } from "./components/users/UserAuthGuard";
import { MapTestPage } from "./pages/MapTestPage";
import FaqPage from "./pages/FaqPage";
// import { SimpleMapTest } from "./pages/SimpleMapTest";
import { UltraSimpleMap } from "./components/UltraSimpleMap";
import { EventsPage } from "./pages/EventsPage";
import { ToolsPage } from "./pages/ToolsPage";
import CommunitiesPage from "./pages/communities";
import MarketplacePage from "./pages/MarketplacePage";
import CategoryPage from "./pages/marketplace/CategoryPage";
import PropertyPage from "./pages/marketplace/PropertyPage";
import MotorsPage from "./pages/marketplace/MotorsPage";
import ClassifiedsPage from "./pages/marketplace/ClassifiedsPage";
import JobsPage from "./pages/marketplace/JobsPage";
import ListingDetailPage from "./pages/marketplace/ListingDetailPage";
import CategoryDetailRouter from "./pages/marketplace/CategoryDetailRouter";
import PostListing from "./pages/marketplace/PostListing";
import CategoryPostForm from "./pages/marketplace/CategoryPostForm";
import MyListings from "./pages/marketplace/MyListings";
import SearchResults from "./pages/marketplace/SearchResults";
import { AllCategoriesPage } from "./pages/marketplace/AllCategoriesPage";
import MyFavorites from "./pages/marketplace/MyFavorites";
import EditListing from "./pages/marketplace/EditListing";
import { CommunityPage } from "./pages/communities/CommunityPage";
import UserSignInPage from "./pages/user/UserSignInPage";
import UserSignUpPage from "./pages/user/UserSignUpPage";
import { UserDashboard, UserDashboardHome } from "./pages/users/UserDashboard";
import { UserEventsPage } from "./pages/users/UserEventsPage";
import { UserProfilePage } from "./pages/users/UserProfilePage";
import { UserBannerSubmission } from "./pages/users/UserBannerSubmission";
import UserSettingsPage from "./pages/users/UserSettingsPage";
import ProfileThemesPage from "./pages/users/ProfileThemesPage";
import AdvertiseCheckoutPage from "./pages/AdvertiseCheckoutPage";
import { SponsorCountryPage } from "./pages/SponsorCountryPage";
import { AdminSponsoredBanners } from "./pages/admin/AdminSponsoredBanners";
import { AdminSlideshowImages } from "./pages/admin/AdminSlideshowImages";
import AdminEventsSlideshow from "./pages/admin/AdminEventsSlideshow";
import AdminPopups from "./pages/admin/AdminPopups";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminMarketplaceCategories from "./pages/admin/AdminMarketplaceCategories";
import { AdminStreamsDashboard } from "./pages/admin/streams/AdminStreamsDashboard";
import { AdminArtists } from "./pages/admin/streams/AdminArtists";
import { AdminSongs } from "./pages/admin/streams/AdminSongs";
import { AdminAlbums } from "./pages/admin/streams/AdminAlbums";
import { AdminSportsDashboard } from "./pages/admin/sports/AdminSportsDashboard";
import AdminSportsNews from "./pages/admin/sports/AdminSportsNews";
import AdminSportsVideos from "./pages/admin/sports/AdminSportsVideos";
import { MainLayout } from "./components/layout/MainLayout";
import BlogPage from "./pages/BlogPage";
import BlogPostDetail from "./pages/BlogPostDetail";
import UserBlogEditor from "./pages/UserBlogEditor";
import AdminBlog from "./pages/admin/AdminBlog";
import TestEmailPage from "./pages/TestEmailPage";
import PricingPage from "./pages/PricingPage";
import CoinStorePage from "./pages/CoinStorePage";
import InvitePage from "./pages/InvitePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BusinessPremiumPage from "./pages/BusinessPremiumPage";
import AffiliatePage from "./pages/AffiliatePage";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AuthFinishPage from "./pages/auth/AuthFinishPage";
import SSOCallbackPage from "./pages/auth/SSOCallbackPage";
import SportsHome from "./pages/sports/SportsHome";
import SportsScores from "./pages/sports/SportsScores";
import MatchCenter from "./pages/sports/MatchCenter";
import TeamPage from "./pages/sports/TeamPage";
import LeagueTablePage from "./pages/sports/LeagueTablePage";
import SportsSchedule from "./pages/sports/SportsSchedule";
import SportsStats from "./pages/sports/SportsStats";
import SportsPredictions from "./pages/sports/SportsPredictions";
import SportsTeams from "./pages/sports/SportsTeams";
import SportsNewsDetail from "./pages/sports/SportsNewsDetail";
import StreamsHome from "./pages/streams/StreamsHome";
import PlaylistPage from "./pages/streams/PlaylistPage";
import ArtistPage from "./pages/streams/ArtistPage";
import ArtistsPage from "./pages/streams/ArtistsPage";
import TrendingSongsPage from "./pages/streams/TrendingSongsPage";
import NewReleasesPage from "./pages/streams/NewReleasesPage";
import LikedSongsPage from "./pages/streams/LikedSongsPage";
import LibraryPage from "./pages/streams/LibraryPage";
import ArtistDashboard from "@/pages/streams/ArtistDashboard";
import ArtistVerificationPage from "./pages/streams/ArtistVerificationPage";
import PodcastsPage from "./pages/streams/PodcastsPage";
import SearchPage from "./pages/SearchPage";
import TestSportsApi from "./pages/TestSportsApi";
import { UserTicketsPage } from "./pages/users/UserTicketsPage";
import { UserAnalytics } from "./pages/users/UserAnalytics";
import { OrganizerRegistrationsPage } from "./pages/users/OrganizerRegistrationsPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import { CookieConsent } from "./components/CookieConsent";
import { NotificationsProvider } from "./context/NotificationsContext";
import { InboxPage } from "./pages/messages/InboxPage";
import { ChatWindow } from "./pages/messages/ChatWindow";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";

const queryClient = new QueryClient();

import { useWelcomeEmail } from "@/hooks/useWelcomeEmail";

const AppRoutes = () => {
  // Use the auth logging hook to track all authentication events
  useAuthLogging();
  // Check and send welcome email if needed
  useWelcomeEmail();

  const { i18n } = useTranslation();

  // Keep document language and direction in sync with current i18n language
  useEffect(() => {
    const lang = i18n.language || 'en';
    const rtlLangs = ['ar', 'fa', 'ur', 'he'];
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <NotificationsProvider>
      <ScrollToTop />
      <CookieConsent />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test-rss" element={<TestRSSPage />} />
        <Route path="/test-email" element={<TestEmailPage />} />

        {/* Mini-Apps Routes - Isolated with wildcard catch-alls to prevent fall-through */}
        <Route path="/streams/*">
          <Route index element={<StreamsHome />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
          <Route path="artist/:id" element={<ArtistPage />} />
          <Route path="artists" element={<ArtistsPage />} />
          <Route path="trending" element={<TrendingSongsPage />} />
          <Route path="new-releases" element={<NewReleasesPage />} />
          <Route path="liked" element={<UserAuthGuard><LikedSongsPage /></UserAuthGuard>} />
          <Route path="library" element={<UserAuthGuard><LibraryPage /></UserAuthGuard>} />
          <Route path="podcasts" element={<PodcastsPage />} />
          <Route path="creator" element={<UserAuthGuard><ArtistDashboard /></UserAuthGuard>} />
          <Route path="verification" element={<ArtistVerificationPage />} />
          <Route path="*" element={<StreamsHome />} /> {/* Fallback within streams context */}
        </Route>

        <Route path="/sports/*">
          <Route index element={<SportsHome />} />
          <Route path="scores" element={<SportsScores />} />
          <Route path="news/:id" element={<SportsNewsDetail />} />
          <Route path="game/:id" element={<MatchCenter />} />
          <Route path="match/:id" element={<MatchCenter />} />
          <Route path="team/:id" element={<TeamPage />} />
          <Route path="predictions" element={<SportsPredictions />} />
          <Route path="table/:id" element={<LeagueTablePage />} />

          {/* Dynamic Sport Routes */}
          <Route path=":sport" element={<SportsHome />} />
          <Route path=":sport/scores" element={<SportsScores />} />
          <Route path=":sport/fixtures" element={<SportsScores />} />
          <Route path=":sport/schedule" element={<SportsSchedule />} />
          <Route path=":sport/standings" element={<LeagueTablePage />} />
          <Route path=":sport/table/:id" element={<LeagueTablePage />} />
          <Route path=":sport/tables" element={<LeagueTablePage />} />
          <Route path=":sport/teams" element={<SportsTeams />} />
          <Route path=":sport/team/:id" element={<TeamPage />} />
          <Route path=":sport/stats" element={<SportsStats />} />
          <Route path=":sport/transfers" element={<SportsHome />} />
          <Route path=":sport/leagues" element={<SportsHome />} />
          <Route path=":sport/series" element={<SportsHome />} />
          <Route path=":sport/rankings" element={<SportsHome />} />
          <Route path=":sport/p4p" element={<SportsHome />} />
          <Route path=":sport/upcoming" element={<SportsHome />} />
          <Route path=":sport/tournaments" element={<SportsHome />} />
          <Route path=":sport/countries" element={<SportsHome />} />
          <Route path=":sport/cricinfo" element={<SportsHome />} />
          <Route path=":sport/bpi" element={<SportsHome />} />
          <Route path=":sport/power-rankings" element={<SportsHome />} />
          <Route path=":sport/draft" element={<SportsHome />} />
          <Route path=":sport/fpi" element={<SportsHome />} />

          <Route path="*" element={<SportsHome />} />
        </Route>

        {/* Events Routes - Specific */}
        <Route path="/events/*">
          <Route index element={<EventsPage />} />
          <Route path=":eventId" element={<EventsPage />} />
          <Route path="*" element={<EventsPage />} />
        </Route>

        {/* Communities Routes */}
        <Route path="/communities" element={
          <MainLayout>
            <CommunitiesPage />
          </MainLayout>
        } />
        <Route path="/communities/:communitySlug" element={
          <MainLayout>
            <CommunityPage />
          </MainLayout>
        } />

        {/* Country and City Detail Routes - More specific than business listings */}
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
        <Route path="/cities/:citySlug" element={<CityDetailPage />} />

        {/* Marketplace Routes - Isolated with wildcard to prevent fall-through */}
        <Route path="/marketplace/*">
          <Route index element={<MarketplacePage />} />
          <Route path="categories" element={<AllCategoriesPage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="post" element={<PostListing />} />
          <Route path="my-listings" element={<MyListings />} />
          <Route path="listing/:listingId" element={<CategoryDetailRouter />} />
          <Route path="edit/:listingId" element={<EditListing />} />
          <Route path="favorites" element={<MyFavorites />} />
          <Route path="property-sale" element={<PropertyPage />} />
          <Route path="property-rent" element={<PropertyPage />} />
          <Route path="motors" element={<MotorsPage />} />
          <Route path="classifieds" element={<ClassifiedsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path=":categorySlug" element={<CategoryPage />} />
          <Route path="*" element={<MarketplacePage />} />
        </Route>

        {/* Blog Routes - Isolated */}
        <Route path="/blog/*">
          <Route index element={<BlogPage />} />
          <Route path="write" element={<UserBlogEditor />} />
          <Route path="edit/:id" element={<UserBlogEditor />} />
          <Route path=":slug" element={<BlogPostDetail />} />
          <Route path="*" element={<BlogPage />} />
        </Route>
        {/* Messaging Routes - Isolated */}
        <Route path="/messages/*">
          <Route index element={<UserAuthGuard><InboxPage /></UserAuthGuard>} />
          <Route path=":conversationId" element={<UserAuthGuard><ChatWindow /></UserAuthGuard>} />
          <Route path="*" element={<UserAuthGuard><InboxPage /></UserAuthGuard>} />
        </Route>

        {/* User Dashboard Routes - Isolated */}
        <Route path="/users/*">
          <Route path="dashboard" element={<UserAuthGuard><UserDashboard /></UserAuthGuard>}>
            <Route index element={<UserDashboardHome />} />
            <Route path="events" element={<UserEventsPage />} />
            <Route path="events/:eventId/registrations" element={<OrganizerRegistrationsPage />} />
            <Route path="tickets" element={<UserTicketsPage />} />
            <Route path="analytics" element={<UserAnalytics />} />
            <Route path="banner-submissions" element={<UserBannerSubmission />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="settings" element={<UserSettingsPage />} />
            <Route path="themes" element={<ProfileThemesPage />} />
          </Route>
          <Route path="*" element={<UserAuthGuard><UserDashboard /></UserAuthGuard>} />
        </Route>

        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/categories" element={<CategoriesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/ask-question" element={<AskQuestionPage />} />
        <Route path="/writeareview" element={<WriteReviewPage />} />
        <Route path="/claim-listing" element={<ClaimListingPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Advertise Routes */}
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/advertise/checkout" element={<AdvertiseCheckoutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/store" element={<CoinStorePage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/business-premium" element={<BusinessPremiumPage />} />
        <Route path="/partners" element={<AffiliatePage />} />
        <Route path="/sponsor-country" element={<SponsorCountryPage />} />

        {/* Authentication Routes - Extremely specific */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/user/sign-in" element={<UserSignInPage />} />
        <Route path="/user/sign-up" element={<UserSignUpPage />} />
        <Route path="/sso-callback" element={<SSOCallbackPage />} />
        <Route path="/auth/finish" element={<AuthFinishPage />} />

        {/* Admin Routes - Isolated with wildcard to prevent fall-through */}
        <Route path="/admin/*">
          <Route index element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
          <Route path="cities" element={<AdminAuthGuard><AdminCities /></AdminAuthGuard>} />
          <Route path="countries" element={<AdminAuthGuard><AdminCountries /></AdminAuthGuard>} />
          <Route path="country-info" element={<AdminAuthGuard><AdminCountryInfo /></AdminAuthGuard>} />
          <Route path="businesses" element={<AdminAuthGuard><AdminBusinesses /></AdminAuthGuard>} />
          <Route path="events" element={<AdminAuthGuard><AdminEvents /></AdminAuthGuard>} />
          <Route path="events-slideshow" element={<AdminAuthGuard><AdminEventsSlideshow /></AdminAuthGuard>} />
          <Route path="sponsored-ads" element={<AdminAuthGuard><AdminSponsoredAds /></AdminAuthGuard>} />
          <Route path="sponsored-banners" element={<AdminAuthGuard><AdminSponsoredBanners /></AdminAuthGuard>} />
          <Route path="categories" element={<AdminAuthGuard><AdminCategories /></AdminAuthGuard>} />
          <Route path="reports" element={<AdminAuthGuard><AdminReports /></AdminAuthGuard>} />
          <Route path="reviews" element={<AdminAuthGuard><AdminReviews /></AdminAuthGuard>} />
          <Route path="users" element={<AdminAuthGuard><AdminUsers /></AdminAuthGuard>} />
          <Route path="admin-management" element={<AdminAuthGuard><AdminManagement /></AdminAuthGuard>} />
          <Route path="rss-feeds" element={<AdminAuthGuard><AdminRSSFeeds /></AdminAuthGuard>} />
          <Route path="settings" element={<AdminAuthGuard><AdminSettings /></AdminAuthGuard>} />
          <Route path="gamification" element={<AdminAuthGuard><AdminGamification /></AdminAuthGuard>} />
          <Route path="revenue" element={<AdminAuthGuard><AdminRevenue /></AdminAuthGuard>} />
          <Route path="contact-messages" element={<AdminAuthGuard><ContactMessagesPage /></AdminAuthGuard>} />
          <Route path="banner-ads" element={<AdminAuthGuard><AdminBannerAds /></AdminAuthGuard>} />
          <Route path="blog" element={<AdminAuthGuard><AdminBlog /></AdminAuthGuard>} />
          <Route path="blog/new" element={<AdminAuthGuard><AdminBlogEditor /></AdminAuthGuard>} />
          <Route path="blog/edit/:id" element={<AdminAuthGuard><AdminBlogEditor /></AdminAuthGuard>} />
          <Route path="slideshow-images" element={<AdminAuthGuard><AdminSlideshowImages /></AdminAuthGuard>} />
          <Route path="popups" element={<AdminAuthGuard><AdminPopups /></AdminAuthGuard>} />
          <Route path="marketplace" element={<AdminAuthGuard><AdminMarketplace /></AdminAuthGuard>} />
          <Route path="marketplace-categories" element={<AdminAuthGuard><AdminMarketplaceCategories /></AdminAuthGuard>} />
          <Route path="streams" element={<AdminAuthGuard><AdminStreamsDashboard /></AdminAuthGuard>} />
          <Route path="streams/artists" element={<AdminAuthGuard><AdminArtists /></AdminAuthGuard>} />
          <Route path="streams/songs" element={<AdminAuthGuard><AdminSongs /></AdminAuthGuard>} />
          <Route path="streams/albums" element={<AdminAuthGuard><AdminAlbums /></AdminAuthGuard>} />
          <Route path="sports" element={<AdminAuthGuard><AdminSportsDashboard /></AdminAuthGuard>} />
          <Route path="sports/news" element={<AdminAuthGuard><AdminSportsNews /></AdminAuthGuard>} />
          <Route path="sports/videos" element={<AdminAuthGuard><AdminSportsVideos /></AdminAuthGuard>} />
          <Route path="*" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
        </Route>

        {/* Business Listings Dynamic Routes - MUST BE AT BOTTOM TO PREVENT INTERCEPTION */}
        <Route path="/:city/search" element={<ListingsPage />} />
        <Route path="/:city/:category" element={<CategoryListingsPage />} />
        <Route path="/:city/:category/:businessId" element={<BusinessDetailPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationsProvider>
  );
};

// Auth logging wrapper
const AuthLogger = () => {
  useAuthLogging();
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CountrySelectionProvider>
          <AudioPlayerProvider>
            <BrowserRouter>
              <AuthLogger />
              <AppRoutes />
            </BrowserRouter>
          </AudioPlayerProvider>
        </CountrySelectionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
