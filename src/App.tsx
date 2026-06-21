import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HelmetProvider } from 'react-helmet-async';

import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SongContextMenuProvider } from "@/components/streams/SongContextMenu";

import { CountrySelectionProvider } from "@/context/CountrySelectionContext";

import { useAuthLogging } from "@/hooks/useAuthLogging";

import { ScrollToTop } from "@/components/ScrollToTop";

import { useEffect, lazy, Suspense } from "react";

import { useTranslation } from "react-i18next";



// Test Supabase connection early

import "@/lib/testSupabase";

import { LandingPageFinal as LandingPage } from "./pages/LandingPageFinal";

import NewsPage from "./pages/NewsPage";

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

import { AdminCountryGallery } from "./pages/admin/AdminCountryGallery";

import { AdminCountryKeyListings } from "./pages/admin/AdminCountryKeyListings";

import { AdminBusinesses } from "./pages/admin/AdminBusinesses";

import { AdminEventsEnhanced as AdminEvents } from "./pages/admin/AdminEventsEnhanced";

import { AdminReviews } from "./pages/admin/AdminReviews";

import { AdminSponsoredAds } from "./pages/admin/AdminSponsoredAds";

import { AdminReports } from "./pages/admin/AdminReports";

import { AdminCategories } from "./pages/admin/AdminCategories";

import { AdminUsers } from "./pages/admin/AdminUsers";

import { AdminManagement } from "./pages/admin/AdminManagement";

import { AdminRSSFeeds } from "./pages/admin/AdminRSSFeeds";

import { AdminEmailLog } from "./pages/admin/AdminEmailLog";

import { AdminSettings } from "./pages/admin/AdminSettings";

import ContactMessagesPage from "./pages/admin/ContactMessagesPage";

import AdminGamification from "./pages/admin/AdminGamification";

import AdminRevenue from "./pages/admin/AdminRevenue";

import { AdminBannerAds } from "./pages/admin/AdminBannerAds";

import { AdminAuthGuard } from "./components/admin/AdminAuthGuard";

import { UserAuthGuard } from "./components/users/UserAuthGuard";

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

import MyAds from "./pages/marketplace/MyAds";
import MyPurchases from "./pages/marketplace/MyPurchases";
import CartPage from "./pages/marketplace/CartPage";

import SearchResults from "./pages/marketplace/SearchResults";

import { AllCategoriesPage } from "./pages/marketplace/AllCategoriesPage";

import MyFavorites from "./pages/marketplace/MyFavorites";

import EditListing from "./pages/marketplace/EditListing";

import MarketplaceStorefront from "./pages/marketplace/MarketplaceStorefront";

import StorefrontEditor from "./pages/marketplace/StorefrontEditor";
import StoreAnalyticsPage from "./pages/marketplace/StoreAnalyticsPage";

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

import { AdminPodcasts } from "./pages/admin/streams/AdminPodcasts";

import { AdminMovies } from "./pages/admin/streams/AdminMovies";

import { AdminEbooks } from "./pages/admin/streams/AdminEbooks";

import { AdminSportsDashboard } from "./pages/admin/sports/AdminSportsDashboard";

import AdminSportsNews from "./pages/admin/sports/AdminSportsNews";

import AdminSportsVideos from "./pages/admin/sports/AdminSportsVideos";

import { AdminTeams } from "./pages/admin/sports/AdminTeams";

import { AdminLeagues } from "./pages/admin/sports/AdminLeagues";

import { AdminTournaments } from "./pages/admin/sports/AdminTournaments";

import { MainLayout } from "./components/layout/MainLayout";

import BlogPage from "./pages/BlogPage";

import BlogPostDetail from "./pages/BlogPostDetail";

import BlogContributorGuidelines from "./pages/BlogContributorGuidelines";

import UserBlogEditor from "./pages/UserBlogEditor";

import AdminBlog from "./pages/admin/AdminBlog";

import PricingPage from "./pages/PricingPage";

import CoinStorePage from "./pages/CoinStorePage";

import InvitePage from "./pages/InvitePage";

import LeaderboardPage from "./pages/LeaderboardPage";
import GamificationPage from "./pages/GamificationPage";

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

// /streams pages are route code-split (lazy) to shrink the initial bundle — they
// load on demand behind the <Suspense> boundary on the /streams route block.
const StreamsHome = lazy(() => import("./pages/streams/StreamsHome"));
const StreamsHub = lazy(() => import("./pages/streams/StreamsHub"));
const PlaylistPage = lazy(() => import("./pages/streams/PlaylistPage"));
const ArtistPage = lazy(() => import("./pages/streams/ArtistPage"));
const ArtistsPage = lazy(() => import("./pages/streams/ArtistsPage"));
const TrendingSongsPage = lazy(() => import("./pages/streams/TrendingSongsPage"));
const NewReleasesPage = lazy(() => import("./pages/streams/NewReleasesPage"));
const AlbumPage = lazy(() => import("./pages/streams/AlbumPage"));
const GenrePage = lazy(() => import("./pages/streams/GenrePage"));
const MusicSearchPage = lazy(() => import("./pages/streams/MusicSearchPage"));
const LikedSongsPage = lazy(() => import("./pages/streams/LikedSongsPage"));
const SongPage = lazy(() => import("./pages/streams/SongPage"));
const CreditPage = lazy(() => import("./pages/streams/CreditPage"));
const LibraryPage = lazy(() => import("./pages/streams/LibraryPage"));
const ListeningStatsPage = lazy(() => import("./pages/streams/ListeningStatsPage"));
const ArtistDashboard = lazy(() => import("@/pages/streams/ArtistDashboard"));
const ArtistVerificationPage = lazy(() => import("./pages/streams/ArtistVerificationPage"));
const UploadSongPage = lazy(() => import("./pages/streams/UploadSongPage"));
const CreateAlbumPage = lazy(() => import("./pages/streams/CreateAlbumPage"));
const PodcastsPage = lazy(() => import("./pages/streams/PodcastsPage"));
const MoviesPage = lazy(() => import("./pages/streams/MoviesPage"));
const MovieDetailPage = lazy(() => import("./pages/streams/MovieDetailPage"));
const EbooksPage = lazy(() => import("./pages/streams/EbooksPage"));
const EbookDetailPage = lazy(() => import("./pages/streams/EbookDetailPage"));

import SportsNewsList from "./pages/sports/SportsNewsList";

import SearchPage from "./pages/SearchPage";

import { UserTicketsPage } from "./pages/users/UserTicketsPage";

import { UserAnalytics } from "./pages/users/UserAnalytics";

import { UserMyMusic } from "./pages/users/UserMyMusic";

import { UserMyPodcasts } from "./pages/users/UserMyPodcasts";

import { UserMyEbooks } from "./pages/users/UserMyEbooks";

import { UserCreatorAnalytics } from "./pages/users/UserCreatorAnalytics";

import { UserMyBlogPosts } from "./pages/users/UserMyBlogPosts";

import { UserMyPlaylists } from "./pages/users/UserMyPlaylists";

import { UserSavedItems } from "./pages/users/UserSavedItems";

import { OrganizerRegistrationsPage } from "./pages/users/OrganizerRegistrationsPage";
import { OrganizerAnalyticsPage } from "./pages/users/OrganizerAnalyticsPage";

import TermsOfServicePage from "./pages/TermsOfServicePage";

import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

import { CookieConsent } from "./components/CookieConsent";

import { NotificationsProvider } from "./context/NotificationsContext";

import { InboxPage } from "./pages/messages/InboxPage";

import { ChatWindow } from "./pages/messages/ChatWindow";

import { AudioPlayerProvider } from "@/context/AudioPlayerContext";

import { ShareProvider } from "@/context/ShareContext";
import { CartProvider } from "@/context/CartContext";
import { GlobalPlayer } from "@/components/streams/GlobalPlayer";



const queryClient = new QueryClient();



import { useWelcomeEmail } from "@/hooks/useWelcomeEmail";

// Minimal monochrome fallback shown while a lazy (code-split) route chunk loads.
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  </div>
);

// Layout route for /streams/*: hoists SongContextMenuProvider above every
// Streams page so pages can call useSongContextMenu() in their own body
// (the provider previously lived inside StreamsLayout, i.e. *below* its
// consumers, which threw and blanked those pages).
const StreamsRouteLayout = () => (
  <SongContextMenuProvider>
    <Outlet />
  </SongContextMenuProvider>
);

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



      <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/" element={<LandingPage />} />



        {/* Mini-Apps Routes - Isolated with wildcard catch-alls to prevent fall-through */}

        <Route path="/streams/*" element={<StreamsRouteLayout />}>

          <Route index element={<StreamsHub />} />

          <Route path="music" element={<StreamsHome />} />

          <Route path="music/*" element={<StreamsHome />} />

          <Route path="search" element={<MusicSearchPage />} />

          <Route path="playlist/:id" element={<PlaylistPage />} />

          <Route path="artist/:id" element={<ArtistPage />} />

          <Route path="artists" element={<ArtistsPage />} />

          <Route path="trending" element={<TrendingSongsPage />} />

          <Route path="new-releases" element={<NewReleasesPage />} />

          <Route path="album/:id" element={<AlbumPage />} />

          <Route path="genres" element={<GenrePage />} />

          <Route path="genre/:slug" element={<GenrePage />} />

          <Route path="liked" element={<UserAuthGuard><LikedSongsPage /></UserAuthGuard>} />

          <Route path="library" element={<UserAuthGuard><LibraryPage /></UserAuthGuard>} />

          <Route path="stats" element={<UserAuthGuard><ListeningStatsPage /></UserAuthGuard>} />

          <Route path="podcasts" element={<PodcastsPage />} />

          <Route path="movies" element={<MoviesPage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />

          <Route path="ebooks" element={<EbooksPage />} />
          <Route path="ebook/:id" element={<EbookDetailPage />} />

          <Route path="creator" element={<UserAuthGuard><ArtistDashboard /></UserAuthGuard>} />

          <Route path="creator/upload" element={<UserAuthGuard><UploadSongPage /></UserAuthGuard>} />

          <Route path="creator/albums" element={<UserAuthGuard><CreateAlbumPage /></UserAuthGuard>} />

          <Route path="verification" element={<ArtistVerificationPage />} />

          <Route path="song/:id" element={<SongPage />} />
          <Route path="producer/:id" element={<CreditPage />} />
          <Route path="songwriter/:id" element={<CreditPage />} />

          <Route path="*" element={<StreamsHub />} /> {/* Fallback within streams context */}

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



          <Route path="news" element={<SportsNewsList />} />

          <Route path=":sport/news" element={<SportsNewsList />} />



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

          <Route path="my-ads" element={<MyAds />} />

          <Route path="my-purchases" element={<MyPurchases />} />

          <Route path="cart" element={<CartPage />} />

          <Route path="listing/:listingId" element={<CategoryDetailRouter />} />

          <Route path="ad/:listingId" element={<CategoryDetailRouter />} />

          <Route path="edit/:listingId" element={<EditListing />} />

          <Route path="edit-ad/:listingId" element={<EditListing />} />

          <Route path="store/:slug" element={<MarketplaceStorefront />} />

          <Route path="storefront/edit" element={<StorefrontEditor />} />
          <Route path="storefront/analytics" element={<StoreAnalyticsPage />} />

          <Route path="favorites" element={<MyFavorites />} />

          <Route path="property-sale" element={<PropertyPage />} />

          <Route path="property-rent" element={<PropertyPage />} />

          <Route path="motors" element={<MotorsPage />} />

          <Route path="classifieds" element={<ClassifiedsPage />} />

          <Route path="jobs" element={<JobsPage />} />

          <Route path=":categorySlug" element={<CategoryPage />} />

          <Route path="*" element={<MarketplacePage />} />

        </Route>



        {/* News Route */}

        <Route path="/news" element={<NewsPage />} />



        {/* Blog Routes - Isolated */}

        <Route path="/blog/*">

          <Route index element={<BlogPage />} />

          <Route path="write" element={<UserBlogEditor />} />

          <Route path="edit/:id" element={<UserBlogEditor />} />

          <Route path="guidelines" element={<BlogContributorGuidelines />} />

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

            <Route path="my-music" element={<UserMyMusic />} />

            <Route path="my-podcasts" element={<UserMyPodcasts />} />

            <Route path="my-ebooks" element={<UserMyEbooks />} />

            <Route path="creator-analytics" element={<UserCreatorAnalytics />} />

            <Route path="my-blog" element={<UserMyBlogPosts />} />
            <Route path="my-playlists" element={<UserMyPlaylists />} />

            <Route path="saved" element={<UserSavedItems />} />
            <Route path="organizer-analytics" element={<OrganizerAnalyticsPage />} />

          </Route>

          <Route path="*" element={<UserAuthGuard><UserDashboard /></UserAuthGuard>} />

        </Route>



        <Route path="/tools" element={<ToolsPage />} />

        <Route path="/about" element={<AboutUsPage />} />

        <Route path="/listings" element={<ListingsPage />} />

        <Route path="/listings/categories" element={<CategoriesPage />} />

        <Route path="/listings/category/:categorySlug" element={<CategoryListingsPage />} />

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

        <Route path="/gamification" element={<GamificationPage />} />

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

          <Route path="country-gallery" element={<AdminAuthGuard><AdminCountryGallery /></AdminAuthGuard>} />

          <Route path="country-key-listings" element={<AdminAuthGuard><AdminCountryKeyListings /></AdminAuthGuard>} />

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

          <Route path="email-log" element={<AdminAuthGuard><AdminEmailLog /></AdminAuthGuard>} />

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

          <Route path="streams/podcasts" element={<AdminAuthGuard><AdminPodcasts /></AdminAuthGuard>} />

          <Route path="streams/movies" element={<AdminAuthGuard><AdminMovies /></AdminAuthGuard>} />

          <Route path="streams/ebooks" element={<AdminAuthGuard><AdminEbooks /></AdminAuthGuard>} />

          <Route path="sports" element={<AdminAuthGuard><AdminSportsDashboard /></AdminAuthGuard>} />

          <Route path="sports/news" element={<AdminAuthGuard><AdminSportsNews /></AdminAuthGuard>} />

          <Route path="sports/videos" element={<AdminAuthGuard><AdminSportsVideos /></AdminAuthGuard>} />

          <Route path="sports/teams" element={<AdminAuthGuard><AdminTeams /></AdminAuthGuard>} />

          <Route path="sports/leagues" element={<AdminAuthGuard><AdminLeagues /></AdminAuthGuard>} />

          <Route path="sports/tournaments" element={<AdminAuthGuard><AdminTournaments /></AdminAuthGuard>} />

          <Route path="*" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />

        </Route>



        {/* Business Listings Dynamic Routes - MUST BE AT BOTTOM TO PREVENT INTERCEPTION */}

        <Route path="/:city/search" element={<ListingsPage />} />

        <Route path="/:city/:category" element={<CategoryListingsPage />} />

        <Route path="/:city/:category/:businessId" element={<BusinessDetailPage />} />



        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
      </ErrorBoundary>

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
          <ShareProvider>
          <CartProvider>

            <BrowserRouter>

              <AuthLogger />

              <AppRoutes />

              <GlobalPlayer />

            </BrowserRouter>

          </CartProvider>
          </ShareProvider>
          </AudioPlayerProvider>

        </CountrySelectionProvider>

      </TooltipProvider>

    </QueryClientProvider>

  </HelmetProvider>

);



export default App;

