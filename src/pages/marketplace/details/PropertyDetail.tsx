import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Flag,
  MapPin,
  Calendar,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  User,
  CheckCircle,
  X,
  Bed,
  Bath,
  Maximize,
  Car,
  Home,
  Building2,
  Sofa,
  Wifi,
  Zap,
  Droplet,
  Wind,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

export const PropertyDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

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

  const handleWhatsAppContact = () => {
    if (listing?.seller_whatsapp) {
      const message = encodeURIComponent(`Hi, I'm interested in your property: ${listing.title}`);
      const whatsappUrl = `https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handlePhoneContact = () => {
    if (listing?.seller_phone) {
      window.location.href = `tel:${listing.seller_phone}`;
    }
  };

  const handleEmailContact = () => {
    if (listing?.seller_email) {
      const subject = encodeURIComponent(`Inquiry about: ${listing.title}`);
      const body = encodeURIComponent(`Hi,\n\nI'm interested in your property "${listing.title}".\n\nPlease provide more details.\n\nThank you!`);
      window.location.href = `mailto:${listing.seller_email}?subject=${subject}&body=${body}`;
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Property link copied to clipboard',
      });
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryImage = listing.images?.[currentImageIndex]?.image_url || listing.images?.[0]?.image_url;

  // Extract property-specific attributes
  const bedrooms = listing.attributes?.bedrooms || 'N/A';
  const bathrooms = listing.attributes?.bathrooms || 'N/A';
  const sqft = listing.attributes?.sqft || listing.attributes?.area || 'N/A';
  const propertyType = listing.attributes?.property_type || 'Property';
  const furnished = listing.attributes?.furnished || 'No';
  const parking = listing.attributes?.parking || 'No';
  const yearBuilt = listing.attributes?.year_built;
  const amenities = listing.attributes?.amenities || [];

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
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
            {/* Large Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="relative aspect-[16/10] bg-gray-100">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-24 h-24 text-gray-300" />
                  </div>
                )}

                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  {listing.is_featured && (
                    <Badge className="bg-yellow-400 text-yellow-900 font-semibold">
                      FEATURED
                    </Badge>
                  )}
                  {listing.price_type && listing.price_type !== 'fixed' && (
                    <Badge className="bg-blue-600 text-white capitalize">
                      {listing.price_type}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Image Grid */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {listing.images.slice(0, 8).map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video rounded overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Features - Property Specific */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Maximize className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{sqft}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-900 capitalize">{propertyType}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium text-gray-900 capitalize">{propertyType}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Furnished</span>
                  <span className="font-medium text-gray-900 capitalize">{furnished}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Parking</span>
                  <span className="font-medium text-gray-900 capitalize">{parking}</span>
                </div>
                {yearBuilt && (
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Year Built</span>
                    <span className="font-medium text-gray-900">{yearBuilt}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Condition</span>
                  <span className="font-medium text-gray-900 capitalize">{listing.condition || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium text-gray-900">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Location</h2>
              <div className="flex items-start gap-3 text-gray-700 mb-4">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                <span className="text-lg">{listing.location_details || listing.country?.name}</span>
              </div>
              {/* Map placeholder - can integrate Google Maps or Mapbox */}
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Map view coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price and Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
              <div className="text-4xl font-bold text-blue-600 mb-2 font-comfortaa">
                {listing.currency} {parseFloat(listing.price).toLocaleString()}
              </div>
              {listing.price_type && listing.price_type !== 'fixed' && (
                <div className="text-sm text-gray-600 mb-4 capitalize">
                  {listing.price_type === 'monthly' ? 'Per Month' : listing.price_type === 'yearly' ? 'Per Year' : listing.price_type}
                </div>
              )}

              <div className="text-xl font-semibold text-gray-900 mb-4">
                {listing.title}
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {bedrooms}
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {bathrooms}
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4" />
                  {sqft}
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3 mb-6">
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
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{listing.seller_name}</div>
                    <div className="text-sm text-gray-600 capitalize">{listing.seller_type}</div>
                  </div>
                </div>
                {listing.is_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Verified Seller
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {listing.country?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {listing.views_count || 0} views
                </div>
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
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                Safety Tips
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Visit the property in person</li>
                <li>• Verify ownership documents</li>
                <li>• Never pay in advance</li>
                <li>• Use secure payment methods</li>
                <li>• Check property history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
              Similar Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((item) => {
                const itemImage = item.images?.find((img: any) => img.is_primary)?.image_url ||
                                item.images?.[0]?.image_url;
                const itemBeds = item.attributes?.bedrooms || 'N/A';
                const itemBaths = item.attributes?.bathrooms || 'N/A';
                const itemSqft = item.attributes?.sqft || item.attributes?.area || 'N/A';
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/marketplace/listing/${item.id}`);
                    }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative w-full h-48 bg-gray-100">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-12 h-12 text-gray-300" />
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
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" /> {itemBeds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="w-4 h-4" /> {itemBaths}
                        </span>
                        <span className="flex items-center gap-1">
                          <Maximize className="w-4 h-4" /> {itemSqft}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
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
                <h3 className="text-xl font-bold">Report Property</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Please tell us why you're reporting this property
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

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default PropertyDetail;
