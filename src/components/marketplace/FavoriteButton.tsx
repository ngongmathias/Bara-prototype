import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ listingId, className = '' }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, listingId]);

  const getAuthenticatedClient = async () => {
    const token = await getToken();
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    });
  };

  const checkFavorite = async () => {
    if (!user) return;

    try {
      const supabase = await getAuthenticatedClient();
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
      navigate('/user/sign-in');
      return;
    }

    setLoading(true);
    try {
      const supabase = await getAuthenticatedClient();
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
