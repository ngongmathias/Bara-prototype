import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';

/**
 * Shared contact + lead-recording logic for all 11 marketplace detail pages.
 *
 * Fixes the silent-rot bug where only ListingDetailPage.tsx was recording leads;
 * the 11 category detail pages fired WhatsApp/call/email links but never wrote
 * to marketplace_leads, so sellers couldn't see any of those buyer contacts.
 *
 * Also hardens against the NOT NULL constraint on marketplace_leads.seller_user_id
 * (seeded ads can have null created_by — those inserts would throw).
 */
export interface ListingContactOptions {
  /** Category-specific noun used in default WhatsApp/email copy. Default: "ad". */
  itemNoun?: string;
  /** Override the WhatsApp message entirely. */
  whatsappMessage?: (listing: any) => string;
  /** Override the email subject. */
  emailSubject?: (listing: any) => string;
  /** Override the email body. */
  emailBody?: (listing: any) => string;
  /** Source tag written into leads.metadata.source. Default: "ad_detail_page". */
  source?: string;
}

export interface LeadExtras {
  /** lead_type enum value from the Phase 11.7 migration. Default: "contact". */
  lead_type?: 'contact' | 'viewing' | 'test_drive' | 'application' | 'booking' | 'offer' | 'other';
  /** Extra fields merged into the leads.metadata jsonb (viewing_date, cv_url, etc.). */
  [key: string]: any;
}

export function useListingContact(listing: any, options: ListingContactOptions = {}) {
  const { user } = useUser();
  const itemNoun = options.itemNoun || 'ad';
  const source = options.source || 'ad_detail_page';

  const recordLead = useCallback(
    (contactType: string, extras: LeadExtras = {}) => {
      // Guard: marketplace_leads.seller_user_id is NOT NULL. Seeded ads may
      // have null created_by — skip the insert rather than throw.
      if (!listing || !listing.created_by) return;

      const { lead_type, ...metaExtras } = extras;

      try {
        supabase
          .from('marketplace_leads')
          .insert({
            ad_id: listing.id,
            seller_user_id: listing.created_by,
            buyer_user_id: user?.id || null,
            contact_type: contactType,
            lead_type: lead_type || 'contact',
            buyer_name: user?.fullName || null,
            buyer_email: user?.primaryEmailAddress?.emailAddress || null,
            metadata: { source, ...metaExtras },
          })
          .then(
            () => {},
            () => {}
          );

        // Non-critical side effect: bump view/contact counters.
        supabase
          .rpc('increment_listing_views', { listing_id: listing.id })
          .then(
            () => {},
            () => {}
          );
      } catch {
        /* non-critical */
      }
    },
    [listing, user, source]
  );

  const handleWhatsApp = useCallback(() => {
    if (!listing?.seller_whatsapp) return;
    recordLead('whatsapp');
    const msg = options.whatsappMessage
      ? options.whatsappMessage(listing)
      : `Hi, I'm interested in your ${itemNoun}: ${listing.title}`;
    const whatsappUrl = `https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  }, [listing, recordLead, options, itemNoun]);

  const handlePhone = useCallback(() => {
    if (!listing?.seller_phone) return;
    recordLead('phone');
    window.location.href = `tel:${listing.seller_phone}`;
  }, [listing, recordLead]);

  const handleEmail = useCallback(() => {
    if (!listing?.seller_email) return;
    recordLead('email');
    const subject = options.emailSubject
      ? options.emailSubject(listing)
      : `Inquiry about: ${listing.title}`;
    const body = options.emailBody
      ? options.emailBody(listing)
      : `Hi,\n\nI'm interested in your ${itemNoun} "${listing.title}".\n\nPlease provide more details.\n\nThank you!`;
    window.location.href = `mailto:${listing.seller_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [listing, recordLead, options, itemNoun]);

  return { recordLead, handleWhatsApp, handlePhone, handleEmail };
}
