import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { GamificationService } from '@/lib/gamificationService';

export interface ProfileTheme {
  id: string;
  name: string;
  description: string;
  cost: number;
  preview: string; // CSS gradient or color
  textColor: string;
  accentColor: string;
}

export const PROFILE_THEMES: ProfileTheme[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'Clean and simple',
    cost: 0,
    preview: 'bg-gradient-to-br from-gray-100 to-gray-200',
    textColor: 'text-gray-900',
    accentColor: 'bg-gray-900',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink tones',
    cost: 30,
    preview: 'bg-gradient-to-br from-orange-400 to-pink-500',
    textColor: 'text-white',
    accentColor: 'bg-orange-500',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue and teal vibes',
    cost: 30,
    preview: 'bg-gradient-to-br from-blue-500 to-teal-400',
    textColor: 'text-white',
    accentColor: 'bg-blue-600',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green tones',
    cost: 30,
    preview: 'bg-gradient-to-br from-green-600 to-emerald-400',
    textColor: 'text-white',
    accentColor: 'bg-green-600',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark and sleek',
    cost: 50,
    preview: 'bg-gradient-to-br from-gray-900 to-indigo-900',
    textColor: 'text-white',
    accentColor: 'bg-indigo-600',
  },
  {
    id: 'gold',
    name: 'Gold Rush',
    description: 'Premium golden shimmer',
    cost: 75,
    preview: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    textColor: 'text-yellow-900',
    accentColor: 'bg-yellow-500',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Electric purple and pink',
    cost: 75,
    preview: 'bg-gradient-to-br from-purple-600 to-pink-500',
    textColor: 'text-white',
    accentColor: 'bg-purple-600',
  },
  {
    id: 'african',
    name: 'African Pride',
    description: 'Pan-African colors',
    cost: 100,
    preview: 'bg-gradient-to-br from-red-600 via-yellow-500 to-green-600',
    textColor: 'text-white',
    accentColor: 'bg-red-600',
  },
];

export function useProfileTheme() {
  const { user } = useUser();
  const [activeThemeId, setActiveThemeId] = useState('default');
  const [ownedThemes, setOwnedThemes] = useState<string[]>(['default']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchUserThemes();
  }, [user]);

  const fetchUserThemes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profile_themes')
      .select('theme_id, is_active')
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      const owned = data.map((d: any) => d.theme_id);
      setOwnedThemes(['default', ...owned]);
      const active = data.find((d: any) => d.is_active);
      if (active) setActiveThemeId(active.theme_id);
    }
  };

  const purchaseTheme = async (themeId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Please sign in.' };

    const theme = PROFILE_THEMES.find((t) => t.id === themeId);
    if (!theme) return { success: false, message: 'Theme not found.' };

    if (ownedThemes.includes(themeId)) {
      return { success: false, message: 'You already own this theme.' };
    }

    setLoading(true);

    if (theme.cost > 0) {
      const spent = await GamificationService.spendCoins(
        user.id,
        theme.cost,
        `Profile theme: ${theme.name}`
      );
      if (!spent) {
        setLoading(false);
        return { success: false, message: `Not enough coins. You need ${theme.cost} Bara Coins.` };
      }
    }

    const { error } = await supabase.from('user_profile_themes').insert({
      user_id: user.id,
      theme_id: themeId,
      is_active: false,
    });

    if (error) {
      if (theme.cost > 0) {
        await GamificationService.addCoins(user.id, theme.cost, 'Theme refund (save failed)');
      }
      setLoading(false);
      return { success: false, message: 'Failed to purchase. Coins refunded.' };
    }

    setOwnedThemes((prev) => [...prev, themeId]);
    setLoading(false);
    return { success: true, message: `${theme.name} theme unlocked!` };
  };

  const activateTheme = async (themeId: string): Promise<boolean> => {
    if (!user) return false;
    if (!ownedThemes.includes(themeId)) return false;

    // Deactivate all
    await supabase
      .from('user_profile_themes')
      .update({ is_active: false })
      .eq('user_id', user.id);

    if (themeId !== 'default') {
      await supabase
        .from('user_profile_themes')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('theme_id', themeId);
    }

    setActiveThemeId(themeId);
    return true;
  };

  const activeTheme = PROFILE_THEMES.find((t) => t.id === activeThemeId) || PROFILE_THEMES[0];

  return {
    activeTheme,
    activeThemeId,
    ownedThemes,
    loading,
    purchaseTheme,
    activateTheme,
    themes: PROFILE_THEMES,
  };
}
