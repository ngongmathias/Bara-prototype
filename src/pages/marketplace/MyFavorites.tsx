import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { Heart } from 'lucide-react';

export const MyFavorites = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select(`
          *,
          marketplace_listings(
            *,
            marketplace_categories(name, slug),
            countries(name),
            marketplace_listing_images(image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (data || []).map((fav: any) => ({
        ...fav.marketplace_listings,
        favorite_id: fav.id,
        category: fav.marketplace_listings.marketplace_categories,
        country: fav.marketplace_listings.countries,
        images: fav.marketplace_listings.marketplace_listing_images || [],
      }));

      setFavorites(transformed);
    } catch (error) {
      console.error('Error fetching favorites:', error);
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

      setFavorites(favorites.filter(f => f.favorite_id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 font-comfortaa">Sign In Required</h2>
            <p className="text-gray-600 mb-6 font-roboto">Please sign in to view your favorites</p>
            <Button onClick={() => navigate('/sign-in')} className="bg-black hover:bg-gray-800">
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black mb-8 font-comfortaa">My Favorites</h1>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-roboto mb-4">No favorites yet</p>
              <Button onClick={() => navigate('/marketplace')} className="bg-black hover:bg-gray-800">
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {favorites.map((listing) => {
                const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
                                   listing.images?.[0]?.image_url ||
                                   '/placeholder.jpg';

                return (
                  <div
                    key={listing.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div
                        onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                        className="relative w-full sm:w-48 h-48 bg-gray-100 flex-shrink-0 cursor-pointer"
                      >
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-4">
                        <div
                          onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                          className="cursor-pointer"
                        >
                          <div className="text-2xl font-bold text-black mb-2 font-comfortaa">
                            {listing.currency} {listing.price?.toLocaleString()}
                          </div>

                          <h3 className="font-medium text-black mb-2 font-roboto">
                            {listing.title}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-gray-600 font-roboto mb-4">
                            <span>{listing.category?.name}</span>
                            <span>•</span>
                            <span>{listing.country?.name}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFavorite(listing.favorite_id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-600"
                        >
                          <Heart className="w-4 h-4 mr-2 fill-current" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyFavorites;
