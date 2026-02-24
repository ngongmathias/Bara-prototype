import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CountrySelectionProvider } from "@/context/CountrySelectionContext";
import { useAuthLogging } from "@/hooks/useAuthLogging";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import { ErrorBoundary } from './components/ErrorBoundary';
const LandingPage = lazy(() => import('./pages/LandingPageFinal').then(m => ({ default: m.LandingPageFinal })));

const ListingsPage = lazy(() => import('./pages/ListingsPage'));
const CategoryListingsPage = lazy(() => import('./pages/CategoryListingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const WriteReviewPage = lazy(() => import('./pages/WriteReviewPage').then(m => ({ default: m.WriteReviewPage })));
const ClaimListingPage = lazy(() => import('./pages/ClaimListingPage').then(m => ({ default: m.ClaimListingPage })));
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage').then(m => ({ default: m.BusinessDetailPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const CityDetailPage = lazy(() => import('./pages/CityDetailPage').then(m => ({ default: m.CityDetailPage })));
const CountryDetailPage = lazy(() => import('./pages/CountryDetailPage').then(m => ({ default: m.CountryDetailPage })));
const CountryListingsPage = lazy(() => import('./pages/CountryListingsPage').then(m => ({ default: m.CountryListingsPage })));
const CountriesPage = lazy(() => import('./pages/CountriesPage').then(m => ({ default: m.CountriesPage })));
const AskQuestionPage = lazy(() => import('./pages/AskQuestionPage').then(m => ({ default: m.AskQuestionPage })));
const SignInPage = lazy(() => import('./pages/SignInPage').then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCities = lazy(() => import('./pages/admin/AdminCities').then(m => ({ default: m.AdminCities })));
const AdminCountries = lazy(() => import('./pages/admin/AdminCountries').then(m => ({ default: m.AdminCountries })));
const AdminCountryInfo = lazy(() => import('./pages/admin/AdminCountryInfo').then(m => ({ default: m.AdminCountryInfo })));
const AdminBusinesses = lazy(() => import('./pages/admin/AdminBusinesses').then(m => ({ default: m.AdminBusinesses })));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents').then(m => ({ default: m.AdminEvents })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminSponsoredAds = lazy(() => import('./pages/admin/AdminSponsoredAds').then(m => ({ default: m.AdminSponsoredAds })));
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement').then(m => ({ default: m.AdminManagement })));
const AdminRSSFeeds = lazy(() => import('./pages/admin/AdminRSSFeeds').then(m => ({ default: m.AdminRSSFeeds })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const ContactMessagesPage = lazy(() => import('./pages/admin/ContactMessagesPage'));
const AdminGamification = lazy(() => import('./pages/admin/AdminGamification'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminBannerAds = lazy(() => import('./pages/admin/AdminBannerAds').then(m => ({ default: m.AdminBannerAds })));
import { AdminAuthGuard } from "./components/admin/AdminAuthGuard";
import { UserAuthGuard } from "./components/users/UserAuthGuard";
const FaqPage = lazy(() => import('./pages/FaqPage'));
import { UltraSimpleMap } from "./components/UltraSimpleMap";
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const CommunitiesPage = lazy(() => import('./pages/communities'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const CategoryPage = lazy(() => import('./pages/marketplace/CategoryPage'));
const PropertyPage = lazy(() => import('./pages/marketplace/PropertyPage'));
const MotorsPage = lazy(() => import('./pages/marketplace/MotorsPage'));
const ClassifiedsPage = lazy(() => import('./pages/marketplace/ClassifiedsPage'));
const JobsPage = lazy(() => import('./pages/marketplace/JobsPage'));
const ListingDetailPage = lazy(() => import('./pages/marketplace/ListingDetailPage'));
const CategoryDetailRouter = lazy(() => import('./pages/marketplace/CategoryDetailRouter'));
const PostListing = lazy(() => import('./pages/marketplace/PostListing'));
const CategoryPostForm = lazy(() => import('./pages/marketplace/CategoryPostForm'));
const MyListings = lazy(() => import('./pages/marketplace/MyListings'));
const SearchResults = lazy(() => import('./pages/marketplace/SearchResults'));
const AllCategoriesPage = lazy(() => import('./pages/marketplace/AllCategoriesPage').then(m => ({ default: m.AllCategoriesPage })));
const MyFavorites = lazy(() => import('./pages/marketplace/MyFavorites'));
const EditListing = lazy(() => import('./pages/marketplace/EditListing'));
const CommunityPage = lazy(() => import('./pages/communities/CommunityPage').then(m => ({ default: m.CommunityPage })));
const UserSignInPage = lazy(() => import('./pages/user/UserSignInPage'));
const UserSignUpPage = lazy(() => import('./pages/user/UserSignUpPage'));
const UserDashboard = lazy(() => import('./pages/users/UserDashboard').then(m => ({ default: m.UserDashboard })));
const UserDashboardHome = lazy(() => import('./pages/users/UserDashboard').then(m => ({ default: m.UserDashboardHome })));
const UserEventsPage = lazy(() => import('./pages/users/UserEventsPage').then(m => ({ default: m.UserEventsPage })));
const UserProfilePage = lazy(() => import('./pages/users/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const UserBannerSubmission = lazy(() => import('./pages/users/UserBannerSubmission').then(m => ({ default: m.UserBannerSubmission })));
const UserSettingsPage = lazy(() => import('./pages/users/UserSettingsPage'));
const ProfileThemesPage = lazy(() => import('./pages/users/ProfileThemesPage'));
const AdvertiseCheckoutPage = lazy(() => import('./pages/AdvertiseCheckoutPage'));
const SponsorCountryPage = lazy(() => import('./pages/SponsorCountryPage').then(m => ({ default: m.SponsorCountryPage })));
const AdminSponsoredBanners = lazy(() => import('./pages/admin/AdminSponsoredBanners').then(m => ({ default: m.AdminSponsoredBanners })));
const AdminSlideshowImages = lazy(() => import('./pages/admin/AdminSlideshowImages').then(m => ({ default: m.AdminSlideshowImages })));
const AdminEventsSlideshow = lazy(() => import('./pages/admin/AdminEventsSlideshow'));
const AdminPopups = lazy(() => import('./pages/admin/AdminPopups'));
const AdminMarketplace = lazy(() => import('./pages/admin/AdminMarketplace'));
const AdminMarketplaceCategories = lazy(() => import('./pages/admin/AdminMarketplaceCategories'));
const AdminStreamsDashboard = lazy(() => import('./pages/admin/streams/AdminStreamsDashboard').then(m => ({ default: m.AdminStreamsDashboard })));
const AdminArtists = lazy(() => import('./pages/admin/streams/AdminArtists').then(m => ({ default: m.AdminArtists })));
const AdminSongs = lazy(() => import('./pages/admin/streams/AdminSongs').then(m => ({ default: m.AdminSongs })));
const AdminAlbums = lazy(() => import('./pages/admin/streams/AdminAlbums').then(m => ({ default: m.AdminAlbums })));
const AdminSportsDashboard = lazy(() => import('./pages/admin/sports/AdminSportsDashboard').then(m => ({ default: m.AdminSportsDashboard })));
const AdminSportsNews = lazy(() => import('./pages/admin/sports/AdminSportsNews'));
const AdminSportsVideos = lazy(() => import('./pages/admin/sports/AdminSportsVideos'));
import { MainLayout } from "./components/layout/MainLayout";
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const UserBlogEditor = lazy(() => import('./pages/UserBlogEditor'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));

const PricingPage = lazy(() => import('./pages/PricingPage'));
const CoinStorePage = lazy(() => import('./pages/CoinStorePage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const BusinessPremiumPage = lazy(() => import('./pages/BusinessPremiumPage'));
const AffiliatePage = lazy(() => import('./pages/AffiliatePage'));
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor'));
const AuthFinishPage = lazy(() => import('./pages/auth/AuthFinishPage'));
const SSOCallbackPage = lazy(() => import('./pages/auth/SSOCallbackPage'));
const SportsHome = lazy(() => import('./pages/sports/SportsHome'));
const SportsScores = lazy(() => import('./pages/sports/SportsScores'));
const MatchCenter = lazy(() => import('./pages/sports/MatchCenter'));
const TeamPage = lazy(() => import('./pages/sports/TeamPage'));
const LeagueTablePage = lazy(() => import('./pages/sports/LeagueTablePage'));
const SportsSchedule = lazy(() => import('./pages/sports/SportsSchedule'));
const SportsStats = lazy(() => import('./pages/sports/SportsStats'));
const SportsPredictions = lazy(() => import('./pages/sports/SportsPredictions'));
const SportsTeams = lazy(() => import('./pages/sports/SportsTeams'));
const SportsNewsDetail = lazy(() => import('./pages/sports/SportsNewsDetail'));
const StreamsHome = lazy(() => import('./pages/streams/StreamsHome'));
const PlaylistPage = lazy(() => import('./pages/streams/PlaylistPage'));
const ArtistPage = lazy(() => import('./pages/streams/ArtistPage'));
const ArtistsPage = lazy(() => import('./pages/streams/ArtistsPage'));
const TrendingSongsPage = lazy(() => import('./pages/streams/TrendingSongsPage'));
const NewReleasesPage = lazy(() => import('./pages/streams/NewReleasesPage'));
const LikedSongsPage = lazy(() => import('./pages/streams/LikedSongsPage'));
const LibraryPage = lazy(() => import('./pages/streams/LibraryPage'));
import ArtistDashboard from "@/pages/streams/ArtistDashboard";
const ArtistVerificationPage = lazy(() => import('./pages/streams/ArtistVerificationPage'));
const PodcastsPage = lazy(() => import('./pages/streams/PodcastsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

const UserTicketsPage = lazy(() => import('./pages/users/UserTicketsPage').then(m => ({ default: m.UserTicketsPage })));
const UserAnalytics = lazy(() => import('./pages/users/UserAnalytics').then(m => ({ default: m.UserAnalytics })));
const OrganizerRegistrationsPage = lazy(() => import('./pages/users/OrganizerRegistrationsPage').then(m => ({ default: m.OrganizerRegistrationsPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
import { CookieConsent } from "./components/CookieConsent";
import { NotificationsProvider } from "./context/NotificationsContext";
const InboxPage = lazy(() => import('./pages/messages/InboxPage').then(m => ({ default: m.InboxPage })));
const ChatWindow = lazy(() => import('./pages/messages/ChatWindow').then(m => ({ default: m.ChatWindow })));
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

      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />


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
      </Suspense>
    </NotificationsProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CountrySelectionProvider>
            <AudioPlayerProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AudioPlayerProvider>
          </CountrySelectionProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
