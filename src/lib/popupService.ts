import { supabase } from './supabase';

export type PopupAd = {
  id: string;
  name: string;
  image_url: string;
  link_url?: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Fetch active popup ads from the database
 * Only returns popups that are active and within their time range
 */
export const fetchActivePopups = async (): Promise<PopupAd[]> => {
  try {
    
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return [];
    }

    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('popup_ads')
      .select('*')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching popups:', error);
      return [];
    }
    return data || [];
    
  } catch (error) {
    console.error('❌ Popup service error:', error);
    return [];
  }
};

/**
 * Get a random popup from the active popups
 * This ensures variety in popup display
 */
export const getRandomPopup = (popups: PopupAd[]): PopupAd | null => {
  if (!popups || popups.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * popups.length);
  return popups[randomIndex];
};

/**
 * Check if a popup should be shown based on user preferences
 * Uses localStorage to track closed popups
 */
export const shouldShowPopup = (popupId: string, intervalSeconds: number = 15): boolean => {
  try {
    const key = `popup_closed_${popupId}`;
    const lastClosed = localStorage.getItem(key);
    
    if (!lastClosed) {
      return true; // Never shown before
    }
    
    const timeSinceClosed = (Date.now() - parseInt(lastClosed, 10)) / 1000;
    return timeSinceClosed >= intervalSeconds;
    
  } catch (error) {
    console.error('❌ Error checking popup preference:', error);
    return true; // Default to showing if there's an error
  }
};

/**
 * Mark a popup as closed in localStorage
 */
export const markPopupClosed = (popupId: string): void => {
  try {
    const key = `popup_closed_${popupId}`;
    localStorage.setItem(key, Date.now().toString());
  } catch (error) {
    console.error('❌ Error marking popup as closed:', error);
  }
};

