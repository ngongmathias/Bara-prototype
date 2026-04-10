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
  Building2,
  Shield,
  Users,
  TrendingUp,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { MonetizationService } from '@/lib/monetizationService';
import { GamificationService } from '@/lib/gamificationService';
import { useUser } from '@clerk/clerk-react';
import { useShare } from "@/context/ShareContext";
import {
  useListingContact,
  useListingPartner,
  SellerTrustCard,
  ReportListingModal,
  buildListingShare,
} from '@/components/marketplace/listing-parts';

export const BusinessDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openShare } = useShare();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  const { user } = useUser();
  const partner = useListingPartner(listing?.created_by);
  const {
    handleWhatsApp: handleWhatsAppContact,
    handlePhone: handlePhoneContact,
    handleEmail: handleEmailContact,
  } = useListingContact(listing, {
    itemNoun: 'business',
    source: 'business_detail_page',
    whatsappMessage: (l) => `Hi, I'm interested in your business: ${l.title}`,
    emailSubject: (l) => `Business Inquiry: ${l.title}`,
    emailBody: (l) => `Hi,\n\nI'm interested in your business "${l.title}".\n\nPlease provide more details.\n\nThank you!`,
  });

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount();
      // Phase 7: Track as a 'click' interaction for ROI analytics
      MonetizationService.trackInteraction(listingId, 'listing', 'click');

      // Phase 8: Daily Mission progress
      if (user) {
        GamificationService.trackMissionProgress(user.id, 'daily_market_view');
      }
    }
  }, [listingId, user?.id]);

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
        .limit(6);

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

  const handleShare = () => {
    if (!listing) return;
    openShare(buildListingShare(listing));
    if (user) {
      try { GamificationService.trackMissionProgress(user.id, "daily_social_share"); } catch {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBannerAd />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const businessType = listing.attributes?.business_type || 'N/A';
  const industry = listing.attributes?.industry || 'N/A';
  const establishedYear = listing.attributes?.established_year || 'N/A';
  const employees = listing.attributes?.employees || 'N/A';
  const revenue = listing.attributes?.revenue || 'N/A';
  const equipmentIncluded = listing.attributes?.equipment_included || 'N/A';
  const leaseTerms = listing.attributes?.lease_terms || 'N/A';
  const reasonForSale = listing.attributes?.reason_for_sale || 'N/A';
  const features = listing.attributes?.features || [];
  const primaryImage = listing.images?.[0]?.image_url;

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <TopBannerAd />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="lg:col-span-2 space-y-6">
            {primaryImage && (
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.is_featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-400 text-yellow-900 font-semibold">
                        FEATURED
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-comfortaa">
                {listing.title}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Type</div>
                    <div className="font-semibold text-gray-900 capitalize text-sm">{businessType.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Industry</div>
                    <div className="font-semibold text-gray-900 capitalize text-sm">{industry}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Established</div>
                    <div className="font-semibold text-gray-900">{establishedYear}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Employees</div>
                    <div className="font-semibold text-gray-900">{employees}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Business Overview</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Business Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Revenue
                  </span>
                  <span className="font-medium text-gray-900">{revenue}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Equipment</span>
                  <span className="font-medium text-gray-900 capitalize">{equipmentIncluded}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Lease Terms</span>
                  <span className="font-medium text-gray-900 capitalize">{leaseTerms}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Reason for Sale</span>
                  <span className="font-medium text-gray-900 capitalize">{reasonForSale.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {features.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Key Features</h2>
                <ul className="space-y-3">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 capitalize">{feature.replace('_', ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">Location</h2>
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                <span className="text-lg">{listing.location_details || listing.country?.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
              <div className="text-4xl font-bold text-blue-600 mb-2 font-comfortaa">
                {listing.currency} {parseFloat(listing.price).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-6">
                Asking Price
              </div>

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
                    Call Owner
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

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Business Owner</h3>
                <SellerTrustCard partner={partner} listing={listing} />
              </div>

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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                Due Diligence Tips
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Review financial statements</li>
                <li>• Verify licenses and permits</li>
                <li>• Check lease agreements</li>
                <li>• Assess customer base</li>
                <li>• Consult legal/financial advisors</li>
              </ul>
            </div>
          </div>
        </div>

        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
              Similar Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((item) => {
                const itemImage = item.images?.find((img: any) => img.is_primary)?.image_url ||
                  item.images?.[0]?.image_url;
                const itemBusinessType = item.attributes?.business_type || '';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/marketplace/ad/${item.id}`);
                    }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    {itemImage && (
                      <div className="relative w-full h-48 bg-gray-100">
                        <img
                          src={itemImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-xl font-bold text-blue-600 mb-2">
                        {item.currency} {parseFloat(item.price).toLocaleString()}
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2 capitalize">
                        {itemBusinessType.replace('_', ' ')}
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

      <ReportListingModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        listingId={listingId!}
      />

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default BusinessDetail;
