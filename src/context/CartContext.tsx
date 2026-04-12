import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { createAuthenticatedSupabaseClient } from '@/lib/supabase';

export interface CartItem {
  id?: string; // DB id (only for synced items)
  listing_id: string;
  variant_id: string | null;
  quantity: number;
  // Denormalized for display (not persisted)
  title?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  variant_label?: string;
  seller_user_id?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (listingId: string, variantId: string | null) => Promise<void>;
  updateQuantity: (listingId: string, variantId: string | null, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  count: 0,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  loading: false,
});

export const useCart = () => useContext(CartContext);

const LOCAL_KEY = 'bara_cart';

function readLocalCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthenticatedClient = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token available');
    return createAuthenticatedSupabaseClient(token);
  }, [getToken]);

  // Load cart on mount
  useEffect(() => {
    if (user) {
      syncFromDb();
    } else {
      setItems(readLocalCart());
    }
  }, [user?.id]);

  const syncFromDb = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = await getAuthenticatedClient();
    const { data } = await supabase
      .from('marketplace_cart_items')
      .select(`
        id, listing_id, variant_id, quantity,
        listing:marketplace_listings(title, price, currency, created_by, marketplace_listing_images(image_url, is_primary)),
        variant:marketplace_listing_variants(label, price_override)
      `)
      .eq('user_id', user.id);

    const cartItems: CartItem[] = (data || []).map((row: any) => {
      const img = row.listing?.marketplace_listing_images?.find((i: any) => i.is_primary)?.image_url
        || row.listing?.marketplace_listing_images?.[0]?.image_url;
      return {
        id: row.id,
        listing_id: row.listing_id,
        variant_id: row.variant_id,
        quantity: row.quantity,
        title: row.listing?.title,
        price: row.variant?.price_override ?? row.listing?.price,
        currency: row.listing?.currency,
        image_url: img,
        variant_label: row.variant?.label,
        seller_user_id: row.listing?.created_by,
      };
    });
    setItems(cartItems);
    writeLocalCart(cartItems);
    setLoading(false);
  };

  const addToCart = useCallback(async (item: Omit<CartItem, 'id'>) => {
    const existing = items.find(
      (i) => i.listing_id === item.listing_id && i.variant_id === item.variant_id
    );
    let updated: CartItem[];
    if (existing) {
      updated = items.map((i) =>
        i.listing_id === item.listing_id && i.variant_id === item.variant_id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      updated = [...items, { ...item }];
    }
    setItems(updated);
    writeLocalCart(updated);

    if (user) {
      const supabase = await getAuthenticatedClient();
      await supabase.from('marketplace_cart_items').upsert(
        {
          user_id: user.id,
          listing_id: item.listing_id,
          variant_id: item.variant_id || null,
          quantity: existing ? existing.quantity + item.quantity : item.quantity,
        },
        { onConflict: 'user_id,listing_id,variant_id' }
      );
    }
  }, [items, user, getAuthenticatedClient]);

  const removeFromCart = useCallback(async (listingId: string, variantId: string | null) => {
    const updated = items.filter(
      (i) => !(i.listing_id === listingId && i.variant_id === variantId)
    );
    setItems(updated);
    writeLocalCart(updated);

    if (user) {
      const supabase = await getAuthenticatedClient();
      let query = supabase
        .from('marketplace_cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }
      await query;
    }
  }, [items, user, getAuthenticatedClient]);

  const updateQuantity = useCallback(async (listingId: string, variantId: string | null, qty: number) => {
    if (qty <= 0) return removeFromCart(listingId, variantId);
    const updated = items.map((i) =>
      i.listing_id === listingId && i.variant_id === variantId
        ? { ...i, quantity: qty }
        : i
    );
    setItems(updated);
    writeLocalCart(updated);

    if (user) {
      const supabase = await getAuthenticatedClient();
      let query = supabase
        .from('marketplace_cart_items')
        .update({ quantity: qty })
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }
      await query;
    }
  }, [items, user, removeFromCart, getAuthenticatedClient]);

  const clearCart = useCallback(async () => {
    setItems([]);
    writeLocalCart([]);
    if (user) {
      const supabase = await getAuthenticatedClient();
      await supabase.from('marketplace_cart_items').delete().eq('user_id', user.id);
    }
  }, [user, getAuthenticatedClient]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, addToCart, removeFromCart, updateQuantity, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
