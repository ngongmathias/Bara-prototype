import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { 
  Heart, 
  Trash2, 
  Eye,
  MapPin,
  ArrowLeft
} from "lucide-react";

interface FavoriteListing {
  id: string;
  listing_id: string;
  created_at: string;
  marketplace_listings: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    country: string;
    city: string | null;
    condition: string;
    status: string;
    view_count: number;
    marketplace_categories: {
      name: string;
    };
    marketplace_listing_images: Array<{
      image_url: string;
      display_order: number;
    }>;
  };
}

export const UserFavoritesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select(`
          id,
          listing_id,
          created_at,
          marketplace_listings (
            id,
            title,
            description,
            price,
            country,
            city,
            condition,
            status,
            view_count,
            marketplace_categories (
              name
            ),
            marketplace_listing_images (
              image_url,
              display_order
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removed",
        description: "Listing removed from favorites"
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view favorites</h1>
          <Button onClick={() => navigate('/user/signin')}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/user/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-comfortaa font-bold text-black mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'listing' : 'listings'} saved
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Start browsing the marketplace and save listings you're interested in
              </p>
              <Button onClick={() => navigate('/marketplace')}>
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const listing = favorite.marketplace_listings;
              const firstImage = listing.marketplace_listing_images
                ?.sort((a, b) => a.display_order - b.display_order)[0];

              return (
                <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div
                    className="aspect-video bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                  >
                    {firstImage ? (
                      <img
                        src={firstImage.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-semibold text-lg cursor-pointer hover:text-[#e64600] transition-colors line-clamp-2"
                        onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      >
                        {listing.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFavorite(favorite.id)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-2xl font-bold text-black mb-3">
                      ${listing.price.toLocaleString()}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.city ? `${listing.city}, ` : ''}{listing.country}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <Badge variant="outline" className="text-xs">
                        {listing.marketplace_categories?.name}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                          listing.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {listing.condition}
                      </Badge>
                      {listing.status === 'sold' && (
                        <Badge className="text-xs bg-gray-100 text-gray-800">
                          Sold
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      {listing.view_count} views
                    </div>

                    <Button
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="w-full mt-4 bg-[#e64600] hover:bg-[#cc3d00]"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
