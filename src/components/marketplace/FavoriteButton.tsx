import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ listingId, className = '' }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, listingId]);

  const checkFavorite = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('marketplace_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/sign-in');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('marketplace_favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId,
          });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
      />
    </button>
  );
};
