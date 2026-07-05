import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { GamificationService } from '@/lib/gamificationService';

const AD_FREE_COST_DEFAULT = 20; // fallback; live value is admin-tunable (cost.ad_free_24h)
const AD_FREE_DURATION_HOURS = 24;

let isActivating = false;

export function useAdFree() {
  const { user } = useUser();
  const [isAdFree, setIsAdFree] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState(AD_FREE_COST_DEFAULT);

  useEffect(() => {
    if (user) checkAdFreeStatus();
  }, [user]);

  useEffect(() => {
    GamificationService.getSetting('cost.ad_free_24h')
      .then((v) => { if (v > 0) setCost(v); })
      .catch(() => { /* keep default */ });
  }, []);

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
    if (isActivating) return { success: false, message: 'Processing request...' };

    isActivating = true;
    setLoading(true);

    try {
      // Check real DB status first to be extra safe
      const { data: existing } = await supabase
        .from('user_ad_free')
        .select('id')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (isAdFree || (existing && existing.length > 0)) {
        return { success: false, message: 'You already have ad-free browsing active!' };
      }

      // Spend coins (cost is admin-tunable; re-read at purchase time)
      const liveCost = await GamificationService.getSetting('cost.ad_free_24h');
      const spent = await GamificationService.spendCoins(
        user.id,
        liveCost,
        `Ad-free browsing (${AD_FREE_DURATION_HOURS}h)`
      );

      if (!spent) {
        return { success: false, message: `Not enough coins. You need ${liveCost} Bara Coins.` };
      }

      // Set expiry
      const expires = new Date();
      expires.setHours(expires.getHours() + AD_FREE_DURATION_HOURS);

      const { error } = await supabase.from('user_ad_free').insert({
        user_id: user.id,
        expires_at: expires.toISOString(),
        coins_spent: liveCost,
      });

      if (error) {
        // Refund
        await GamificationService.addCoins(user.id, liveCost, 'Ad-free refund (save failed)');
        return { success: false, message: 'Failed to activate. Coins refunded.' };
      }

      setIsAdFree(true);
      setExpiresAt(expires.toISOString());
      return { success: true, message: `Ad-free browsing active for ${AD_FREE_DURATION_HOURS} hours!` };
    } finally {
      isActivating = false;
      setLoading(false);
    }
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
    cost,
    duration: AD_FREE_DURATION_HOURS,
  };
}
