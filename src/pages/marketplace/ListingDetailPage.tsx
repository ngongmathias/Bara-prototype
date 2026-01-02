import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/types/marketplace';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  MessageCircle
} from 'lucide-react';
import { ReportModal } from '@/components/marketplace/ReportModal';
import { ShareModal } from '@/components/marketplace/ShareModal';
import { FavoriteButton } from '@/components/marketplace/FavoriteButton';

export const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<any>(null);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (listingId) {
      fetchListing();
      fetchRelatedListings();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(id, name, slug),
          marketplace_subcategories(id, name, slug),
          countries(id, name, code),
          marketplace_listing_images(image_url, is_primary, display_order),
          marketplace_listing_attributes(attribute_key, attribute_value)
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;

      // Transform data
      const transformedListing = {
        ...data,
        category: data.marketplace_categories,
        subcategory: data.marketplace_subcategories,
        country: data.countries,
        images: (data.marketplace_listing_images || []).sort((a: any, b: any) => 
          (a.display_order || 0) - (b.display_order || 0)
        ),
        attributes: (data.marketplace_listing_attributes || []).reduce(
          (acc: any, attr: any) => {
            acc[attr.attribute_key] = attr.attribute_value;
            return acc;
          },
          {}
        ),
      };

      setListing(transformedListing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedListings = async () => {
    try {
      const { data } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_listing_images(image_url, is_primary)
        `)
        .neq('id', listingId)
        .eq('status', 'active')
        .limit(4);

      setRelatedListings(data || []);
    } catch (error) {
      console.error('Error fetching related listings:', error);
    }
  };

  const nextImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <TopBannerAd />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600 font-roboto">Loading listing...</p>
          </div>
        </main>
        <BottomBannerAd />
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <TopBannerAd />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2 font-comfortaa">Listing Not Found</h2>
            <p className="text-gray-600 mb-4 font-roboto">This listing may have been removed or doesn't exist.</p>
            <Button onClick={() => navigate('/marketplace')} className="bg-black hover:bg-gray-800">
              Back to Marketplace
            </Button>
          </div>
        </main>
        <BottomBannerAd />
        <Footer />
      </div>
    );
  }

  const currentImage = listing.images?.[currentImageIndex]?.image_url || '/placeholder-image.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-roboto">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-black">
                🏠
              </button>
              <span className="text-gray-400">›</span>
              <button onClick={() => navigate('/marketplace')} className="text-gray-600 hover:text-black">
                Marketplace
              </button>
              <span className="text-gray-400">›</span>
              <button 
                onClick={() => navigate(`/marketplace/${listing.category?.slug}`)} 
                className="text-gray-600 hover:text-black"
              >
                {listing.category?.name}
              </button>
              <span className="text-gray-400">›</span>
              <span className="text-black font-medium truncate">{listing.title}</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Images & Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image Gallery */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <img 
                      src={currentImage} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {listing.images?.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-roboto">
                          {currentImageIndex + 1} / {listing.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {listing.images?.length > 1 && (
                    <div className="p-4 flex gap-2 overflow-x-auto">
                      {listing.images.map((img: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                            idx === currentImageIndex ? 'border-black' : 'border-gray-200'
                          }`}
                        >
                          <img 
                            src={img.image_url} 
                            alt={`${listing.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title & Price */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-black mb-2 font-comfortaa">
                        {listing.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-roboto">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.country?.name}
                          {listing.location_details && `, ${listing.location_details}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {listing.view_count || 0} views
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <FavoriteButton listingId={listing.id} />
                      <ShareModal listingId={listing.id} title={listing.title} />
                      <ReportModal listingId={listing.id} />
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-black font-comfortaa">
                    {listing.currency} {parseFloat(listing.price).toLocaleString()}
                    {listing.price_type === 'monthly' && <span className="text-xl text-gray-600"> /month</span>}
                    {listing.price_type === 'yearly' && <span className="text-xl text-gray-600"> /year</span>}
                  </div>
                </div>

                {/* Car Overview / Key Specs */}
                {Object.keys(listing.attributes).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-black mb-4 font-comfortaa">Car Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                      {Object.entries(listing.attributes).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 font-roboto capitalize mb-1">
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-base font-medium text-black font-roboto">
                              {value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-black mb-4 font-comfortaa">Seller Information</h2>
                  <div className="space-y-3">
                    {listing.seller_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-black font-roboto">{listing.seller_name}</span>
                      </div>
                    )}
                    {listing.seller_type && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700 font-roboto capitalize">{listing.seller_type}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-black mb-4 font-comfortaa">Location</h2>
                  <div className="flex items-start gap-2 text-gray-700 font-roboto">
                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      {listing.location_details && <p className="font-medium">{listing.location_details}</p>}
                      <p>{listing.country?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Posted Date */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-roboto">
                    <Calendar className="w-4 h-4" />
                    <span>Posted on: {new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-black mb-4 font-comfortaa">Description</h2>
                  <div className="text-gray-700 whitespace-pre-line font-roboto">
                    {listing.description}
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Card */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                  <h3 className="text-lg font-bold text-black mb-4 font-comfortaa">Contact Seller</h3>
                  
                  <div className="space-y-3 mb-6">
                    {listing.contact_phone && (
                      <a href={`tel:${listing.contact_phone}`} className="block">
                        <Button className="w-full bg-black hover:bg-gray-800 font-roboto">
                          <Phone className="w-4 h-4 mr-2" />
                          Call {listing.contact_phone}
                        </Button>
                      </a>
                    )}
                    {listing.contact_whatsapp && (
                      <a 
                        href={`https://wa.me/${listing.contact_whatsapp.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-roboto">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp {listing.contact_whatsapp}
                        </Button>
                      </a>
                    )}
                    {listing.contact_email && (
                      <a href={`mailto:${listing.contact_email}`} className="block">
                        <Button variant="outline" className="w-full font-roboto">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </a>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 font-roboto">
                      <p className="mb-2"><strong>Category:</strong> {listing.category?.name}</p>
                      {listing.subcategory && (
                        <p className="mb-2"><strong>Type:</strong> {listing.subcategory.name}</p>
                      )}
                      <p><strong>Listed:</strong> {new Date(listing.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <h4 className="font-bold text-black mb-2 font-comfortaa">Safety Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1 font-roboto">
                    <li>• Meet in a safe, public location</li>
                    <li>• Check the item before you buy</li>
                    <li>• Pay only after collecting the item</li>
                    <li>• Don't share personal information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Related Listings */}
            {relatedListings.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-black mb-6 font-comfortaa">Similar Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedListings.map((item: any) => {
                    const primaryImage = item.marketplace_listing_images?.find((img: any) => img.is_primary)?.image_url 
                      || item.marketplace_listing_images?.[0]?.image_url 
                      || '/placeholder-image.jpg';
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/marketplace/listing/${item.id}`)}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow text-left"
                      >
                        <div className="aspect-video bg-gray-100">
                          <img 
                            src={primaryImage} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-lg font-bold text-black mb-1 font-comfortaa">
                            {item.currency} {parseFloat(item.price).toLocaleString()}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 font-roboto">
                            {item.title}
                          </h3>
                          <div className="text-xs text-gray-600 font-roboto">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default ListingDetailPage;
