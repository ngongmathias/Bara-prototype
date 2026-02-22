import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { GamificationService } from '@/lib/gamificationService';

const AD_FREE_COST = 20;
const AD_FREE_DURATION_HOURS = 24;

export function useAdFree() {
  const { user } = useUser();
  const [isAdFree, setIsAdFree] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkAdFreeStatus();
  }, [user]);

  const checkAdFreeStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_ad_free')
      .select('expires_at')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setIsAdFree(true);
      setExpiresAt(data.expires_at);
    } else {
      setIsAdFree(false);
      setExpiresAt(null);
    }
  };

  const activateAdFree = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Please sign in first.' };

    setLoading(true);

    // Check if already ad-free
    if (isAdFree) {
      setLoading(false);
      return { success: false, message: 'You already have ad-free browsing active!' };
    }

    // Spend coins
    const spent = await GamificationService.spendCoins(
      user.id,
      AD_FREE_COST,
      `Ad-free browsing (${AD_FREE_DURATION_HOURS}h)`
    );

    if (!spent) {
      setLoading(false);
      return { success: false, message: `Not enough coins. You need ${AD_FREE_COST} Bara Coins.` };
    }

    // Set expiry
    const expires = new Date();
    expires.setHours(expires.getHours() + AD_FREE_DURATION_HOURS);

    const { error } = await supabase.from('user_ad_free').insert({
      user_id: user.id,
      expires_at: expires.toISOString(),
      coins_spent: AD_FREE_COST,
    });

    if (error) {
      // Refund
      await GamificationService.addCoins(user.id, AD_FREE_COST, 'Ad-free refund (save failed)');
      setLoading(false);
      return { success: false, message: 'Failed to activate. Coins refunded.' };
    }

    setIsAdFree(true);
    setExpiresAt(expires.toISOString());
    setLoading(false);
    return { success: true, message: `Ad-free browsing active for ${AD_FREE_DURATION_HOURS} hours!` };
  };

  const timeRemaining = () => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return {
    isAdFree,
    expiresAt,
    loading,
    activateAdFree,
    timeRemaining,
    cost: AD_FREE_COST,
    duration: AD_FREE_DURATION_HOURS,
  };
}
