import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Fetches the marketplace_partners row associated with a listing's owner.
 * Non-blocking — returns null until loaded, never throws.
 * Feeds <SellerTrustCard /> and the storefront link.
 */
export function useListingPartner(ownerUserId: string | null | undefined) {
  const [partner, setPartner] = useState<any | null>(null);

  useEffect(() => {
    if (!ownerUserId) {
      setPartner(null);
      return;
    }
    let cancelled = false;
    supabase
      .from('marketplace_partners')
      .select('*')
      .eq('owner_user_id', ownerUserId)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (!cancelled && data) setPartner(data);
        },
        () => {}
      );
    return () => {
      cancelled = true;
    };
  }, [ownerUserId]);

  return partner;
}
