import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

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
    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token available');
    return createAuthenticatedSupabaseClient(token);
  };

  const checkFavorite = async () => {
    if (!user) return;

    try {
      const supabase = await getAuthenticatedClient();
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite:', error);
        return;
      }
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error in checkFavorite:', error);
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
        const { error: insertError } = await supabase
          .from('marketplace_favorites')
          .upsert({
            user_id: user.id,
            listing_id: listingId,
          }, { onConflict: 'user_id,listing_id' });
        if (insertError) {
          console.error('Error adding favorite:', insertError);
        } else {
          setIsFavorite(true);
        }
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
