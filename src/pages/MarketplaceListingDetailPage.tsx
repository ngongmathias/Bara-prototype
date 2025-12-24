import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin,
  Eye,
  Share2
} from "lucide-react";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category_id: string;
  country: string;
  city: string | null;
  condition: 'new' | 'used' | 'refurbished';
  seller_name: string;
  seller_phone: string;
  seller_email: string | null;
  seller_whatsapp: string | null;
  status: 'active' | 'sold' | 'inactive';
  view_count: number;
  created_at: string;
  marketplace_categories?: { name: string };
  marketplace_listing_images?: Array<{ id: string; image_url: string; display_order: number }>;
}

const MarketplaceListingDetailPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount();
      if (user) {
        checkIfFavorited();
      }
    }
  }, [listingId, user]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name),
          marketplace_listing_images(id, image_url, display_order)
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;
      
      if (data.marketplace_listing_images) {
        data.marketplace_listing_images.sort((a: any, b: any) => a.display_order - b.display_order);
      }
      
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_marketplace_view_count', { listing_id: listingId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const checkIfFavorited = async () => {
    if (!user || !listingId) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Listing removed from your saved items"
        });
      } else {
        const { error } = await supabase
          .from('marketplace_favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Listing saved to your favorites"
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive"
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact the seller",
        variant: "destructive"
      });
      return;
    }

    if (!listing) return;

    try {
      const { data: existingThread, error: fetchError } = await supabase
        .from('marketplace_chat_threads')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingThread) {
        navigate(`/user/messages?listing=${listing.id}`);
      } else {
        const { data: newThread, error: createError } = await supabase
          .from('marketplace_chat_threads')
          .insert({
            listing_id: listing.id,
            buyer_id: user.id,
            seller_id: listing.seller_name
          })
          .select()
          .single();

        if (createError) throw createError;
        navigate(`/user/messages?listing=${listing.id}`);
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Check out this listing: ${listing?.title}`,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Listing link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
            <Button onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = listing.marketplace_listing_images || [];
  const categoryName = listing.marketplace_categories?.name || 'Uncategorized';

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      <TopBannerAd />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={images[selectedImageIndex]?.image_url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index ? 'border-black' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={`${listing.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No images available</p>
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-comfortaa font-bold text-black">{listing.title}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={isFavorited ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                <Badge variant="outline">{categoryName}</Badge>
                <Badge className={
                  listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                  listing.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {listing.condition}
                </Badge>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {listing.view_count} views
                </span>
              </div>

              <div className="text-4xl font-bold text-black mb-4">
                ${listing.price.toLocaleString()}
              </div>

              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{listing.city ? `${listing.city}, ` : ''}{listing.country}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-medium">{listing.seller_name}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleContactSeller}
                    className="w-full bg-[#e64600] hover:bg-[#cc3d00]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                  
                  {listing.seller_phone && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `tel:${listing.seller_phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {listing.seller_phone}
                    </Button>
                  )}
                  
                  {listing.seller_whatsapp && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {listing.seller_email && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `mailto:${listing.seller_email}`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {listing.status === 'sold' && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-700">This item has been sold</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default MarketplaceListingDetailPage;
