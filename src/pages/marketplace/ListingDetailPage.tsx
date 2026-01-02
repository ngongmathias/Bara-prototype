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
  Share2, 
  Heart, 
  Flag,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
                      <Button variant="outline" size="icon">
                        <Heart className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Flag className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-black font-comfortaa">
                    {listing.currency} {parseFloat(listing.price).toLocaleString()}
                    {listing.price_type === 'monthly' && <span className="text-xl text-gray-600"> /month</span>}
                    {listing.price_type === 'yearly' && <span className="text-xl text-gray-600"> /year</span>}
                  </div>
                </div>

                {/* Key Attributes */}
                {Object.keys(listing.attributes).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-black mb-4 font-comfortaa">Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(listing.attributes).map(([key, value]: [string, any]) => (
                        <div key={key} className="border-b border-gray-100 pb-2">
                          <div className="text-sm text-gray-600 font-roboto capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-base font-medium text-black font-roboto">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      <Button className="w-full bg-black hover:bg-gray-800 font-roboto">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    )}
                    {listing.contact_email && (
                      <Button variant="outline" className="w-full font-roboto">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    )}
                    {listing.contact_whatsapp && (
                      <Button variant="outline" className="w-full font-roboto">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </Button>
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
