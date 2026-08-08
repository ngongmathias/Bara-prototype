import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HelmetProvider } from 'react-helmet-async';

import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { RouteFallback } from "@/components/RouteFallback";
import { SongContextMenuProvider } from "@/components/streams/SongContextMenu";

import { CountrySelectionProvider } from "@/context/CountrySelectionContext";

import { useAuthLogging } from "@/hooks/useAuthLogging";

import { useProfileCompletionGuard } from "@/hooks/useProfileCompletionGuard";

import { ScrollToTop } from "@/components/ScrollToTop";

import { useEffect, lazy, Suspense } from "react";

import { useTranslation } from "react-i18next";



import { LandingPageFinal as LandingPage } from "./pages/LandingPageFinal";

// Route code-splitting. Every page below is loaded on demand behind the
// <Suspense> boundary in AppRoutes, so a first-time visitor downloads only the
// route they asked for instead of the whole app (including all 41 admin pages).
// The landing page and NotFound stay statically imported on purpose — see
// scripts note in the plan; they are on the first-paint path.
// Site pages
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ListingsPage = lazy(() => import("./pages/ListingsPage"));
const CategoryListingsPage = lazy(() => import("./pages/CategoryListingsPage"));
const WriteReviewPage = lazy(() => import("./pages/WriteReviewPage").then((m) => ({ default: m.WriteReviewPage })));
const ClaimListingPage = lazy(() => import("./pages/ClaimListingPage").then((m) => ({ default: m.ClaimListingPage })));
const AdvertisePage = lazy(() => import("./pages/AdvertisePage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const BusinessDetailPage = lazy(() => import("./pages/BusinessDetailPage").then((m) => ({ default: m.BusinessDetailPage })));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })));
const CityDetailPage = lazy(() => import("./pages/CityDetailPage").then((m) => ({ default: m.CityDetailPage })));
const CountryDetailPage = lazy(() => import("./pages/CountryDetailPage").then((m) => ({ default: m.CountryDetailPage })));
const CountryListingsPage = lazy(() => import("./pages/CountryListingsPage").then((m) => ({ default: m.CountryListingsPage })));
const CountriesPage = lazy(() => import("./pages/CountriesPage").then((m) => ({ default: m.CountriesPage })));
const AskQuestionPage = lazy(() => import("./pages/AskQuestionPage").then((m) => ({ default: m.AskQuestionPage })));
const SignInPage = lazy(() => import("./pages/SignInPage").then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("./pages/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const EventsPage = lazy(() => import("./pages/EventsPage").then((m) => ({ default: m.EventsPage })));
const ToolsPage = lazy(() => import("./pages/ToolsPage").then((m) => ({ default: m.ToolsPage })));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const AdvertiseCheckoutPage = lazy(() => import("./pages/AdvertiseCheckoutPage"));
const SponsorCountryPage = lazy(() => import("./pages/SponsorCountryPage").then((m) => ({ default: m.SponsorCountryPage })));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostDetail = lazy(() => import("./pages/BlogPostDetail"));
const BlogContributorGuidelines = lazy(() => import("./pages/BlogContributorGuidelines"));
const UserBlogEditor = lazy(() => import("./pages/UserBlogEditor"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const CoinStorePage = lazy(() => import("./pages/CoinStorePage"));
const InvitePage = lazy(() => import("./pages/InvitePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const RewardsHowItWorksPage = lazy(() => import("./pages/RewardsHowItWorksPage"));
const BusinessPremiumPage = lazy(() => import("./pages/BusinessPremiumPage"));
const AffiliatePage = lazy(() => import("./pages/AffiliatePage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ContentTermsPage = lazy(() => import("./pages/ContentTermsPage"));
const CoinsAndXpPage = lazy(() => import("./pages/CoinsAndXpPage"));
const VerifyAccountPage = lazy(() => import("./pages/VerifyAccountPage"));
const DMCAPage = lazy(() => import("./pages/DMCAPage"));
const BusinessPackagesPage = lazy(() => import("./pages/BusinessPackagesPage"));
const RegistrationDisclaimerPage = lazy(() => import("./pages/RegistrationDisclaimerPage"));
const DefinitionsPage = lazy(() => import("./pages/DefinitionsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));

// Marketplace
const CategoryPage = lazy(() => import("./pages/marketplace/CategoryPage"));
const PropertyPage = lazy(() => import("./pages/marketplace/PropertyPage"));
const MotorsPage = lazy(() => import("./pages/marketplace/MotorsPage"));
const ClassifiedsPage = lazy(() => import("./pages/marketplace/ClassifiedsPage"));
const JobsPage = lazy(() => import("./pages/marketplace/JobsPage"));
const CategoryDetailRouter = lazy(() => import("./pages/marketplace/CategoryDetailRouter"));
const PostListing = lazy(() => import("./pages/marketplace/PostListing"));
const MyAds = lazy(() => import("./pages/marketplace/MyAds"));
const MyPurchases = lazy(() => import("./pages/marketplace/MyPurchases"));
const CartPage = lazy(() => import("./pages/marketplace/CartPage"));
const SearchResults = lazy(() => import("./pages/marketplace/SearchResults"));
const AllCategoriesPage = lazy(() => import("./pages/marketplace/AllCategoriesPage").then((m) => ({ default: m.AllCategoriesPage })));
const MyFavorites = lazy(() => import("./pages/marketplace/MyFavorites"));
const EditListing = lazy(() => import("./pages/marketplace/EditListing"));
const MarketplaceStorefront = lazy(() => import("./pages/marketplace/MarketplaceStorefront"));
const StorefrontEditor = lazy(() => import("./pages/marketplace/StorefrontEditor"));
const StoreAnalyticsPage = lazy(() => import("./pages/marketplace/StoreAnalyticsPage"));

// User dashboard & account
const UserSignInPage = lazy(() => import("./pages/user/UserSignInPage"));
const UserSignUpPage = lazy(() => import("./pages/user/UserSignUpPage"));
const UserDashboard = lazy(() => import("./pages/users/UserDashboard").then((m) => ({ default: m.UserDashboard })));
const UserDashboardHome = lazy(() => import("./pages/users/UserDashboard").then((m) => ({ default: m.UserDashboardHome })));
const UserEventsPage = lazy(() => import("./pages/users/UserEventsPage").then((m) => ({ default: m.UserEventsPage })));
const UserProfilePage = lazy(() => import("./pages/users/UserProfilePage").then((m) => ({ default: m.UserProfilePage })));
const UserBannerSubmission = lazy(() => import("./pages/users/UserBannerSubmission").then((m) => ({ default: m.UserBannerSubmission })));
const UserSettingsPage = lazy(() => import("./pages/users/UserSettingsPage"));
const ProfileThemesPage = lazy(() => import("./pages/users/ProfileThemesPage"));
const UserTicketsPage = lazy(() => import("./pages/users/UserTicketsPage").then((m) => ({ default: m.UserTicketsPage })));
const UserAnalytics = lazy(() => import("./pages/users/UserAnalytics").then((m) => ({ default: m.UserAnalytics })));
const UserMyMusic = lazy(() => import("./pages/users/UserMyMusic").then((m) => ({ default: m.UserMyMusic })));
const UserMyPodcasts = lazy(() => import("./pages/users/UserMyPodcasts").then((m) => ({ default: m.UserMyPodcasts })));
const UserMyEbooks = lazy(() => import("./pages/users/UserMyEbooks").then((m) => ({ default: m.UserMyEbooks })));
const UserCreatorAnalytics = lazy(() => import("./pages/users/UserCreatorAnalytics").then((m) => ({ default: m.UserCreatorAnalytics })));
const UserMyBlogPosts = lazy(() => import("./pages/users/UserMyBlogPosts").then((m) => ({ default: m.UserMyBlogPosts })));
const UserMyPlaylists = lazy(() => import("./pages/users/UserMyPlaylists").then((m) => ({ default: m.UserMyPlaylists })));
const UserSavedItems = lazy(() => import("./pages/users/UserSavedItems").then((m) => ({ default: m.UserSavedItems })));
const OrganizerRegistrationsPage = lazy(() => import("./pages/users/OrganizerRegistrationsPage").then((m) => ({ default: m.OrganizerRegistrationsPage })));
const OrganizerAnalyticsPage = lazy(() => import("./pages/users/OrganizerAnalyticsPage").then((m) => ({ default: m.OrganizerAnalyticsPage })));

// Sports
const SportsHome = lazy(() => import("./pages/sports/SportsHome"));
const SportsScores = lazy(() => import("./pages/sports/SportsScores"));
const MatchCenter = lazy(() => import("./pages/sports/MatchCenter"));
const TeamPage = lazy(() => import("./pages/sports/TeamPage"));
const LeagueTablePage = lazy(() => import("./pages/sports/LeagueTablePage"));
const SportsSchedule = lazy(() => import("./pages/sports/SportsSchedule"));
const SportsStats = lazy(() => import("./pages/sports/SportsStats"));
const SportsPredictions = lazy(() => import("./pages/sports/SportsPredictions"));
const SportsTeams = lazy(() => import("./pages/sports/SportsTeams"));
const SportsNewsDetail = lazy(() => import("./pages/sports/SportsNewsDetail"));
const SportsNewsList = lazy(() => import("./pages/sports/SportsNewsList"));

// Communities
const CommunitiesPage = lazy(() => import("./pages/communities"));
const CommunityPage = lazy(() => import("./pages/communities/CommunityPage").then((m) => ({ default: m.CommunityPage })));

// Messaging
const InboxPage = lazy(() => import("./pages/messages/InboxPage").then((m) => ({ default: m.InboxPage })));
const ChatWindow = lazy(() => import("./pages/messages/ChatWindow").then((m) => ({ default: m.ChatWindow })));

// Auth
const AuthFinishPage = lazy(() => import("./pages/auth/AuthFinishPage"));
const CompleteProfilePage = lazy(() => import("./pages/auth/CompleteProfilePage"));
const SSOCallbackPage = lazy(() => import("./pages/auth/SSOCallbackPage"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminCities = lazy(() => import("./pages/admin/AdminCities").then((m) => ({ default: m.AdminCities })));
const AdminCountries = lazy(() => import("./pages/admin/AdminCountries").then((m) => ({ default: m.AdminCountries })));
const AdminCountryInfo = lazy(() => import("./pages/admin/AdminCountryInfo").then((m) => ({ default: m.AdminCountryInfo })));
const AdminCountryGallery = lazy(() => import("./pages/admin/AdminCountryGallery").then((m) => ({ default: m.AdminCountryGallery })));
const AdminCountryKeyListings = lazy(() => import("./pages/admin/AdminCountryKeyListings").then((m) => ({ default: m.AdminCountryKeyListings })));
const AdminBusinesses = lazy(() => import("./pages/admin/AdminBusinesses").then((m) => ({ default: m.AdminBusinesses })));
const AdminEvents = lazy(() => import("./pages/admin/AdminEventsEnhanced").then((m) => ({ default: m.AdminEventsEnhanced })));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews").then((m) => ({ default: m.AdminReviews })));
const AdminSponsoredAds = lazy(() => import("./pages/admin/AdminSponsoredAds").then((m) => ({ default: m.AdminSponsoredAds })));
const AdminReports = lazy(() => import("./pages/admin/AdminReports").then((m) => ({ default: m.AdminReports })));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories").then((m) => ({ default: m.AdminCategories })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement").then((m) => ({ default: m.AdminManagement })));
const AdminRSSFeeds = lazy(() => import("./pages/admin/AdminRSSFeeds").then((m) => ({ default: m.AdminRSSFeeds })));
const AdminEmailLog = lazy(() => import("./pages/admin/AdminEmailLog").then((m) => ({ default: m.AdminEmailLog })));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })));
const ContactMessagesPage = lazy(() => import("./pages/admin/ContactMessagesPage"));
const AdminGamification = lazy(() => import("./pages/admin/AdminGamification"));
const AdminVerifications = lazy(() => import("./pages/admin/AdminVerifications"));
const AdminContentReports = lazy(() => import("./pages/admin/AdminContentReports"));
const AdminArtistClaims = lazy(() => import("./pages/admin/AdminArtistClaims"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminBannerAds = lazy(() => import("./pages/admin/AdminBannerAds").then((m) => ({ default: m.AdminBannerAds })));
const AdminSponsoredBanners = lazy(() => import("./pages/admin/AdminSponsoredBanners").then((m) => ({ default: m.AdminSponsoredBanners })));
const AdminSlideshowImages = lazy(() => import("./pages/admin/AdminSlideshowImages").then((m) => ({ default: m.AdminSlideshowImages })));
const AdminEventsSlideshow = lazy(() => import("./pages/admin/AdminEventsSlideshow"));
const AdminPopups = lazy(() => import("./pages/admin/AdminPopups"));
const AdminMarketplace = lazy(() => import("./pages/admin/AdminMarketplace"));
const AdminMarketplaceCategories = lazy(() => import("./pages/admin/AdminMarketplaceCategories"));
const AdminStreamsDashboard = lazy(() => import("./pages/admin/streams/AdminStreamsDashboard").then((m) => ({ default: m.AdminStreamsDashboard })));
const AdminArtists = lazy(() => import("./pages/admin/streams/AdminArtists").then((m) => ({ default: m.AdminArtists })));
const AdminSongs = lazy(() => import("./pages/admin/streams/AdminSongs").then((m) => ({ default: m.AdminSongs })));
const AdminAlbums = lazy(() => import("./pages/admin/streams/AdminAlbums").then((m) => ({ default: m.AdminAlbums })));
const AdminPodcasts = lazy(() => import("./pages/admin/streams/AdminPodcasts").then((m) => ({ default: m.AdminPodcasts })));
const AdminMovies = lazy(() => import("./pages/admin/streams/AdminMovies").then((m) => ({ default: m.AdminMovies })));
const AdminEbooks = lazy(() => import("./pages/admin/streams/AdminEbooks").then((m) => ({ default: m.AdminEbooks })));
const AdminContentHealth = lazy(() => import("./pages/admin/streams/AdminContentHealth").then((m) => ({ default: m.AdminContentHealth })));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog").then((m) => ({ default: m.AdminAuditLog })));
const AdminSportsDashboard = lazy(() => import("./pages/admin/sports/AdminSportsDashboard").then((m) => ({ default: m.AdminSportsDashboard })));
const AdminSportsNews = lazy(() => import("./pages/admin/sports/AdminSportsNews"));
const AdminSportsVideos = lazy(() => import("./pages/admin/sports/AdminSportsVideos"));
const AdminTeams = lazy(() => import("./pages/admin/sports/AdminTeams").then((m) => ({ default: m.AdminTeams })));
const AdminLeagues = lazy(() => import("./pages/admin/sports/AdminLeagues").then((m) => ({ default: m.AdminLeagues })));
const AdminTournaments = lazy(() => import("./pages/admin/sports/AdminTournaments").then((m) => ({ default: m.AdminTournaments })));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));



import NotFound from "./pages/NotFound";






































import { AdminAuthGuard } from "./components/admin/AdminAuthGuard";

import { UserAuthGuard } from "./components/users/UserAuthGuard";


// import { SimpleMapTest } from "./pages/SimpleMapTest";






















































import { MainLayout } from "./components/layout/MainLayout";



























// /streams pages are route code-split (lazy) to shrink the initial bundle — they
// load on demand behind the <Suspense> boundary on the /streams route block.
const StreamsHome = lazy(() => import("./pages/streams/StreamsHome"));
const StreamsHub = lazy(() => import("./pages/streams/StreamsHub"));
const PlaylistPage = lazy(() => import("./pages/streams/PlaylistPage"));
const ArtistPage = lazy(() => import("./pages/streams/ArtistPage"));
const ArtistsPage = lazy(() => import("./pages/streams/ArtistsPage"));
const TrendingSongsPage = lazy(() => import("./pages/streams/TrendingSongsPage"));
const ChartsPage = lazy(() => import("./pages/streams/ChartsPage"));
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
const StreamsGuidelinesPage = lazy(() => import("./pages/streams/StreamsGuidelinesPage"));
const UploadSongPage = lazy(() => import("./pages/streams/UploadSongPage"));
const CreateAlbumPage = lazy(() => import("./pages/streams/CreateAlbumPage"));
const PodcastsPage = lazy(() => import("./pages/streams/PodcastsPage"));
const PodcastShowPage = lazy(() => import("./pages/streams/PodcastShowPage"));
const MoviesPage = lazy(() => import("./pages/streams/MoviesPage"));
const MovieDetailPage = lazy(() => import("./pages/streams/MovieDetailPage"));
const MovieWatchPage = lazy(() => import("./pages/streams/MovieWatchPage"));
const EbooksPage = lazy(() => import("./pages/streams/EbooksPage"));
const EbookDetailPage = lazy(() => import("./pages/streams/EbookDetailPage"));
const EbookReaderPage = lazy(() => import("./pages/streams/EbookReaderPage"));





















import { CookieConsent } from "./components/CookieConsent";

import { InviteFriendsPrompt } from "./components/InviteFriendsPrompt";

import { NotificationsProvider } from "./context/NotificationsContext";



import { AudioPlayerProvider } from "@/context/AudioPlayerContext";

import { ShareProvider } from "@/context/ShareContext";
import { SignInNudgeProvider } from "@/context/SignInNudgeContext";
import { CartProvider } from "@/context/CartContext";
import { MARKETPLACE_CART_ENABLED } from "@/lib/features";
import { GlobalPlayer } from "@/components/streams/GlobalPlayer";
import { SignInNudgeSheet } from "@/components/SignInNudgeSheet";



const queryClient = new QueryClient();



import { useWelcomeEmail } from "@/hooks/useWelcomeEmail";

// RouteFallback (the <Suspense> spinner) and RouteErrorBoundary now live in
// their own files — both need state/lifecycle to handle slow connections and
// stale chunks after a deploy. See src/lib/chunkReload.ts for the reasoning.

// Layout route for /streams/*: hoists SongContextMenuProvider above every
// Streams page so pages can call useSongContextMenu() in their own body
// (the provider previously lived inside StreamsLayout, i.e. *below* its
// consumers, which threw and blanked those pages).
const StreamsRouteLayout = () => (
  <RouteErrorBoundary section="Streams">
    <SongContextMenuProvider>
      <Outlet />
    </SongContextMenuProvider>
  </RouteErrorBoundary>
);

// Same idea for /admin/*: 41 code-split pages behind one guard, so a failure in
// any single one should leave the rest of the console reachable.
const AdminRouteLayout = () => (
  <RouteErrorBoundary section="the admin console">
    <Outlet />
  </RouteErrorBoundary>
);

const AppRoutes = () => {

  // Use the auth logging hook to track all authentication events

  useAuthLogging();

  // Force signed-in users with an incomplete registration profile (missing
  // DOB/gender/country/phone) to /auth/complete-profile before using the app.

  useProfileCompletionGuard();

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

      <InviteFriendsPrompt />



      {/* Catches lazy-chunk failures and render errors from any route. Sits
          INSIDE the top-level <ErrorBoundary> so a broken page shows a contained
          message instead of blanking the whole app. */}
      <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
      <Routes>

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

          <Route path="charts" element={<ChartsPage />} />

          <Route path="new-releases" element={<NewReleasesPage />} />

          <Route path="album/:id" element={<AlbumPage />} />

          <Route path="genres" element={<GenrePage />} />

          <Route path="genre/:slug" element={<GenrePage />} />

          <Route path="liked" element={<UserAuthGuard><LikedSongsPage /></UserAuthGuard>} />

          <Route path="library" element={<UserAuthGuard><LibraryPage /></UserAuthGuard>} />

          <Route path="stats" element={<UserAuthGuard><ListeningStatsPage /></UserAuthGuard>} />

          <Route path="podcasts" element={<PodcastsPage />} />
          <Route path="podcast/:id" element={<PodcastShowPage />} />
          <Route path="podcast/:id/episode/:episodeId" element={<PodcastShowPage />} />

          <Route path="movies" element={<MoviesPage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="movie/:id/watch" element={<MovieWatchPage />} />

          <Route path="ebooks" element={<EbooksPage />} />
          <Route path="ebook/:id" element={<EbookDetailPage />} />
          <Route path="ebook/:id/read" element={<EbookReaderPage />} />

          <Route path="creator" element={<UserAuthGuard><ArtistDashboard /></UserAuthGuard>} />

          <Route path="creator/upload" element={<UserAuthGuard><UploadSongPage /></UserAuthGuard>} />

          <Route path="creator/albums" element={<UserAuthGuard><CreateAlbumPage /></UserAuthGuard>} />

          {/* The real, free doc-review verification flow lives at /verify-account
              (VerifyAccountPage) — this used to point at a mock $10/mo page. */}
          <Route path="verification" element={<Navigate to="/verify-account?type=artist" replace />} />

          <Route path="guidelines" element={<StreamsGuidelinesPage />} />

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

          {/* Cart checkout is hidden until payments land (MARKETPLACE_CART_ENABLED).
              The route stays registered so an old bookmark or a stale tab lands on
              the marketplace instead of the 404 catch-all. */}
          <Route
            path="cart"
            element={MARKETPLACE_CART_ENABLED ? <CartPage /> : <Navigate to="/marketplace" replace />}
          />

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
        <Route path="/content-terms" element={<ContentTermsPage />} />
        <Route path="/registration-disclaimer" element={<RegistrationDisclaimerPage />} />
        <Route path="/definitions" element={<DefinitionsPage />} />

        <Route path="/privacy" element={<PrivacyPolicyPage />} />



        {/* Advertise Routes */}

        <Route path="/advertise" element={<AdvertisePage />} />

        <Route path="/advertise/checkout" element={<AdvertiseCheckoutPage />} />

        <Route path="/pricing" element={<PricingPage />} />

        <Route path="/store" element={<CoinStorePage />} />

        <Route path="/invite" element={<InvitePage />} />

        <Route path="/leaderboard" element={<LeaderboardPage />} />

        <Route path="/gamification" element={<GamificationPage />} />

        <Route path="/rewards" element={<RewardsHowItWorksPage />} />
        <Route path="/coins-and-xp" element={<CoinsAndXpPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
        <Route path="/dmca" element={<DMCAPage />} />
        <Route path="/packages" element={<BusinessPackagesPage />} />

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

        <Route path="/auth/complete-profile" element={<CompleteProfilePage />} />



        {/* Admin Routes - Isolated with wildcard to prevent fall-through */}

        <Route path="/admin/*" element={<AdminRouteLayout />}>

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

          <Route path="verifications" element={<AdminAuthGuard><AdminVerifications /></AdminAuthGuard>} />

          <Route path="content-reports" element={<AdminAuthGuard><AdminContentReports /></AdminAuthGuard>} />

          <Route path="artist-claims" element={<AdminAuthGuard><AdminArtistClaims /></AdminAuthGuard>} />

          <Route path="packages" element={<AdminAuthGuard><AdminPackages /></AdminAuthGuard>} />

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

          <Route path="streams/content-health" element={<AdminAuthGuard><AdminContentHealth /></AdminAuthGuard>} />

          <Route path="audit-log" element={<AdminAuthGuard><AdminAuditLog /></AdminAuthGuard>} />

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
      </RouteErrorBoundary>

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

          <SignInNudgeProvider>
          <AudioPlayerProvider>
          <ShareProvider>
          <CartProvider>

            <BrowserRouter>

              <ErrorBoundary>

                <AuthLogger />

                <AppRoutes />

                <GlobalPlayer />

                <SignInNudgeSheet />

              </ErrorBoundary>

            </BrowserRouter>

          </CartProvider>
          </ShareProvider>
          </AudioPlayerProvider>
          </SignInNudgeProvider>

        </CountrySelectionProvider>

      </TooltipProvider>

    </QueryClientProvider>

  </HelmetProvider>

);



export default App;

