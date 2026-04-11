import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { getSoldLabel } from '@/config/categoryFieldConfigs';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { ReviewsSection } from '@/components/marketplace/listing-parts/ReviewsSection';
import { QASection } from '@/components/marketplace/listing-parts/QASection';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Flag,
  MapPin,
  Calendar,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  User,
  Clock,
  CheckCircle,
  X,
  MessageCircle,
  Star,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { MessagingService } from '@/lib/MessagingService';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { ShareDialog } from '@/components/ShareDialog';
import { VariantSelector, type Variant } from '@/components/marketplace/listing-parts/VariantSelector';
import { BuyNowModal } from '@/components/marketplace/listing-parts/BuyNowModal';

export const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [showBuyNow, setShowBuyNow] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Fire-and-forget lead capture
  const recordLead = (contactType: string) => {
    if (!listing || !listing.created_by) return; // seller_user_id is NOT NULL
    try {
      supabase.from('marketplace_leads').insert({
        ad_id: listing.id,
        seller_user_id: listing.created_by,
        buyer_user_id: user?.id || null,
        contact_type: contactType,
        buyer_name: user?.fullName || null,
        buyer_email: user?.primaryEmailAddress?.emailAddress || null,
        metadata: { source: 'ad_detail_page' },
      }).then(() => {}, () => {});
      // Increment contact_clicks counter
      supabase.rpc('increment_listing_views', { listing_id: listing.id }).then(() => {}, () => {});
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount();
    }
  }, [listingId]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(id, name, slug),
          countries(id, name, code, flag_url),
          marketplace_listing_images(id, image_url, display_order, is_primary)
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;

      const transformedListing = {
        ...data,
        category: data.marketplace_categories,
        country: data.countries,
        images: (data.marketplace_listing_images || []).sort((a: any, b: any) => a.display_order - b.display_order),
      };

      setListing(transformedListing);

      // Fetch partner/seller profile for trust signals (non-blocking)
      if (data.created_by) {
        supabase
          .from('marketplace_partners')
          .select('*')
          .eq('owner_user_id', data.created_by)
          .maybeSingle()
          .then(({ data: partnerData }) => {
            if (partnerData) setPartner(partnerData);
          }, () => {});
      }

      // Fetch related listings
      if (data.category_id) {
        fetchRelatedListings(data.category_id, data.id);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedListings = async (categoryId: string, currentListingId: string) => {
    try {
      const { data } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name),
          countries(name),
          marketplace_listing_images(image_url, is_primary)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .neq('id', currentListingId)
        .limit(4);

      if (data) {
        setRelatedListings(data.map(item => ({
          ...item,
          category: item.marketplace_categories,
          country: item.countries,
          images: item.marketplace_listing_images || [],
        })));
      }
    } catch (error) {
      console.error('Error fetching related listings:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_listing_views', { listing_id: listingId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (listing?.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (listing?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleBaraChat = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to chat with sellers.' });
      navigate('/user/sign-in');
      return;
    }

    if (listing?.user_id && user.id === listing.user_id) {
      toast({ title: 'Cannot chat', description: 'This is your own listing.', variant: 'destructive' });
      return;
    }

    if (!listing?.user_id) {
      toast({ title: 'Error', description: 'Seller information missing.', variant: 'destructive' });
      return;
    }

    try {
      recordLead('chat');
      const conversationId = await MessagingService.startConversation(user.id, listing.user_id);
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to start chat', variant: 'destructive' });
    }
  };

  const handleWhatsAppContact = () => {
    if (listing?.seller_whatsapp) {
      recordLead('whatsapp');
      const message = encodeURIComponent(`Hi, I'm interested in your ad: ${listing.title}`);
      const whatsappUrl = `https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handlePhoneContact = () => {
    if (listing?.seller_phone) {
      recordLead('phone');
      window.location.href = `tel:${listing.seller_phone}`;
    }
  };

  const handleEmailContact = () => {
    if (listing?.seller_email) {
      recordLead('email');
      const subject = encodeURIComponent(`Inquiry about: ${listing.title}`);
      const body = encodeURIComponent(`Hi,\n\nI'm interested in your ad "${listing.title}".\n\nPlease provide more details.\n\nThank you!`);
      window.location.href = `mailto:${listing.seller_email}?subject=${subject}&body=${body}`;
    }
  };

  const submitOffer = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to make an offer', variant: 'destructive' });
      return;
    }
    if (!listing?.created_by) {
      toast({ title: 'Cannot submit offer', description: 'Seller information is unavailable', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid offer amount', variant: 'destructive' });
      return;
    }
    setSubmittingOffer(true);
    try {
      const { error } = await supabase.from('marketplace_offers').insert({
        ad_id: listing.id,
        buyer_user_id: user.id,
        seller_user_id: listing.created_by,
        amount,
        currency: listing.currency || 'USD',
        message: offerMessage || null,
        status: 'pending',
      });
      if (error) throw error;
      recordLead('offer');
      toast({ title: 'Offer sent!', description: 'The seller has been notified.' });
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferMessage('');
    } catch (err) {
      console.error('Error submitting offer:', err);
      toast({ title: 'Error', description: 'Failed to submit offer', variant: 'destructive' });
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleShare = () => setShowShareDialog(true);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for reporting',
        variant: 'destructive',
      });
      return;
    }

    try {
      await supabase.from('marketplace_reports').insert({
        listing_id: listingId,
        reason: reportReason,
        status: 'pending',
      });

      toast({
        title: 'Report Submitted',
        description: 'Thank you for reporting. We will review this listing.',
      });
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBannerAd />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBannerAd />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryImage = listing.images?.[currentImageIndex]?.image_url || listing.images?.[0]?.image_url;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": listing.title,
    "image": listing.images?.map((img: any) => img.image_url) || [],
    "description": listing.description,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": listing.currency,
      "price": listing.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": listing.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <SEO
        title={`${listing.title} | ${listing.category?.name}`}
        description={listing.description?.substring(0, 160)}
        image={primaryImage}
        type="website"
        schemaData={productSchema}
      />
      <TopBannerAd />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => navigate('/marketplace')} className="hover:text-blue-600">
            Marketplace
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate(`/marketplace/search?category=${listing.category?.slug}`)} className="hover:text-blue-600">
            {listing.category?.name}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="relative aspect-video bg-gray-100">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {listing.is_featured && (
                    <Badge className="bg-yellow-400 text-yellow-900 font-semibold">
                      FEATURED
                    </Badge>
                  )}
                  {listing.condition && (
                    <Badge className="bg-white text-gray-700">
                      {listing.condition.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                        }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Additional Details */}
            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(listing.attributes).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 pb-2">
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-gray-900 font-medium">{value as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {listing.location_details && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Location</h2>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{listing.location_details}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Seller Info and Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
              <div className="text-3xl font-bold text-blue-600 mb-2 font-comfortaa">
                {listing.currency} {parseFloat(listing.price).toLocaleString()}
              </div>
              {listing.price_type && listing.price_type !== 'fixed' && (
                <div className="text-sm text-gray-600 mb-4 capitalize">
                  {listing.price_type}
                </div>
              )}

              <div className="text-lg font-semibold text-gray-900 mb-4">
                {listing.title}
              </div>

              {/* Variant Selector */}
              {listingId && (
                <div className="mb-4">
                  <VariantSelector
                    listingId={listingId}
                    basePrice={parseFloat(listing.price) || 0}
                    currency={listing.currency}
                    onVariantSelect={setSelectedVariant}
                  />
                </div>
              )}

              {/* Meta Info */}
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {listing.country?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {listing.views_count || 0} views
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleBaraChat}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on Bara
                </Button>

                {listing.status === 'active' && listing.created_by !== user?.id && (
                  <Button
                    onClick={() => setShowBuyNow(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                )}

                <Button
                  onClick={() => setShowOfferModal(true)}
                  variant="outline"
                  className="w-full h-12 border-amber-500 text-amber-700 hover:bg-amber-50"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Make an Offer
                </Button>

                {listing.seller_whatsapp && (
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
                  >
                    <FaWhatsapp className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </Button>
                )}

                {listing.seller_phone && (
                  <Button
                    onClick={handlePhoneContact}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Seller
                  </Button>
                )}

                {listing.seller_email && (
                  <Button
                    onClick={handleEmailContact}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Send Email
                  </Button>
                )}

                {listing.seller_website && (
                  <Button
                    onClick={() => window.open(listing.seller_website, '_blank')}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  {partner?.logo_url ? (
                    <img src={partner.logo_url} alt={partner.display_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {partner?.slug ? (
                      <button
                        onClick={() => navigate(`/marketplace/store/${partner.slug}`)}
                        className="font-medium text-gray-900 hover:underline truncate block text-left"
                      >
                        {partner.display_name || listing.seller_name}
                      </button>
                    ) : (
                      <div className="font-medium text-gray-900 truncate">{listing.seller_name}</div>
                    )}
                    <div className="text-xs text-gray-600 capitalize">{partner?.business_type || listing.seller_type}</div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {partner?.verification_level && partner.verification_level !== 'unverified' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      {partner.verification_level === 'id_verified' && 'ID Verified'}
                      {partner.verification_level === 'business_verified' && 'Business Verified'}
                      {partner.verification_level === 'phone_verified' && 'Phone Verified'}
                      {partner.verification_level === 'email_verified' && 'Email Verified'}
                    </span>
                  )}
                  {partner?.rating_count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      {Number(partner.avg_rating).toFixed(1)} ({partner.rating_count})
                    </span>
                  )}
                  {partner?.response_time_hours != null && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Replies in ~{partner.response_time_hours}h
                    </span>
                  )}
                </div>

                {partner?.member_since && (
                  <div className="text-xs text-gray-500">
                    Member since {new Date(partner.member_since).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="flex-1"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Safety Tips</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Meet in a safe public place</li>
                <li>• Check the item before you buy</li>
                <li>• Pay only after collecting item</li>
                <li>• Don't share personal information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
              Similar Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((item) => {
                const itemImage = item.images?.find((img: any) => img.is_primary)?.image_url ||
                  item.images?.[0]?.image_url;
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/marketplace/ad/${item.id}`)}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative w-full h-48 bg-gray-100">
                      {itemImage && (
                        <img
                          src={itemImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.status === 'sold' && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <div className="bg-red-600 text-white text-xl font-bold px-5 py-2 rounded-lg transform -rotate-12">
                            {getSoldLabel(item.category?.slug || '')}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-xl font-bold text-blue-600 mb-2">
                        {item.currency} {parseFloat(item.price).toLocaleString()}
                      </div>
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {item.country?.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Share Dialog */}
      {listing && (
        <ShareDialog
          open={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          url={`${window.location.origin}/marketplace/ad/${listing.id}`}
          title={listing.title}
          description={`${listing.currency} ${parseFloat(listing.price || 0).toLocaleString()} — ${listing.country?.name || ''}`}
          imageUrl={listing.images?.[0]?.image_url}
        />
      )}

      {/* Buy Now Modal */}
      {showBuyNow && listing && (
        <BuyNowModal
          listing={listing}
          selectedVariant={selectedVariant}
          onClose={() => setShowBuyNow(false)}
        />
      )}

      {/* Make Offer Modal */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOfferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Make an Offer</h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Asking price: <span className="font-semibold">{listing?.currency} {parseFloat(listing?.price || 0).toLocaleString()}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your offer ({listing?.currency})</label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                placeholder="Enter amount"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[80px]"
                placeholder="Add a note for the seller..."
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowOfferModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={submitOffer}
                  disabled={submittingOffer || !offerAmount}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {submittingOffer ? 'Sending...' : 'Send Offer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Report Listing</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Please tell us why you're reporting this listing
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
                placeholder="Describe the issue..."
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Submit Report
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && primaryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={primaryImage}
              alt={listing.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {listing.images && listing.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {listing && (
        <div className="max-w-7xl mx-auto px-4">
          <ReviewsSection listingId={listing.id} sellerId={listing.created_by} />
          <QASection listingId={listing.id} sellerId={listing.created_by} />
        </div>
      )}

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default ListingDetailPage;
