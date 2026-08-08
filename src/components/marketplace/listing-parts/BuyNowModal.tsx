import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ShoppingBag, Loader2, Phone, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useAuthedSupabase } from '@/hooks/useAuthedSupabase';
import { GamificationService } from '@/lib/gamificationService';
import { useToast } from '@/hooks/use-toast';

interface BuyNowModalProps {
  listing: any;
  selectedVariant?: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Reserve an item and put the buyer in touch with the seller.
 *
 * Payments don't exist yet (Phase 15), so this doesn't pretend to take money.
 * It records the order, notifies the seller — which is the part that was
 * genuinely broken; the old client-side insert told nobody, and zero orders had
 * ever been created — and then hands over the seller's contact details so the
 * buyer isn't stuck waiting for a reply before they can do anything.
 *
 * The reservation is created by the `marketplace_reserve` RPC rather than a
 * browser INSERT, so the price comes from the database and identity comes from
 * the Clerk JWT.
 */
export const BuyNowModal: React.FC<BuyNowModalProps> = ({
  listing,
  selectedVariant,
  onClose,
  onSuccess,
}) => {
  const { user } = useUser();
  const { getClient } = useAuthedSupabase();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reserved, setReserved] = useState(false);

  const unitPrice = selectedVariant?.price_override ?? parseFloat(listing.price) ?? 0;
  const totalAmount = unitPrice * quantity;
  const maxQty = selectedVariant
    ? selectedVariant.quantity - selectedVariant.quantity_sold
    : 99;

  const sellerPhone: string | undefined = listing.seller_phone || undefined;
  const sellerWhatsapp: string | undefined = listing.seller_whatsapp || listing.seller_phone || undefined;
  const sellerEmail: string | undefined = listing.seller_email || undefined;

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to sign in to reserve an item.', variant: 'destructive' });
      return;
    }
    if (user.id === listing.created_by) {
      toast({ title: 'This is your own ad', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const authed = await getClient();
      const { data, error } = await authed.rpc('marketplace_reserve', {
        p_listing_id: listing.id,
        p_variant_id: selectedVariant?.id || null,
        p_quantity: quantity,
        p_message: message || null,
      });

      if (error) throw error;
      if (!data?.success) {
        const reason: Record<string, string> = {
          not_signed_in: 'Please sign in again and retry.',
          listing_unavailable: 'This ad is no longer available.',
          own_listing: 'You cannot reserve your own ad.',
        };
        throw new Error(reason[data?.error] || 'Could not reserve this item.');
      }

      // Reward: first-purchase achievement (idempotent, non-blocking)
      GamificationService.awardAchievement(user.id, 'first_purchase').catch(() => {});
      setReserved(true);
      onSuccess?.();
    } catch (err: any) {
      console.error('Reserve error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to reserve this item', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = sellerWhatsapp
    ? `https://wa.me/${sellerWhatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `Hi, I reserved "${listing.title}" on BARA. How would you like to arrange payment?`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>

        {reserved ? (
          /* Confirmation. The buyer is told exactly what happens next and given
             the seller's details immediately, so nothing is blocked on a reply. */
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Reserved
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We've told the seller. Message them to arrange payment — they'll confirm it here once it arrives.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="font-medium text-gray-900 text-sm line-clamp-2">{listing.title}</div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {listing.currency} {totalAmount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">{listing.seller_name}</div>
            </div>

            <div className="space-y-2">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 w-full h-11 rounded-md bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-colors">
                  <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                </a>
              )}
              {sellerPhone && (
                <a href={`tel:${sellerPhone}`}
                   className="flex items-center justify-center gap-2 w-full h-11 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium transition-colors">
                  <Phone className="w-4 h-4" /> {sellerPhone}
                </a>
              )}
              {sellerEmail && (
                <a href={`mailto:${sellerEmail}`}
                   className="flex items-center justify-center gap-2 w-full h-11 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium transition-colors">
                  <Mail className="w-4 h-4" /> {sellerEmail}
                </a>
              )}
              {!waLink && !sellerPhone && !sellerEmail && (
                <p className="text-xs text-gray-500 text-center py-2">
                  This seller hasn't shared contact details. They'll reach out to you.
                </p>
              )}
            </div>

            <Button onClick={onClose} variant="ghost" className="w-full mt-4 text-gray-600">
              Done — view in My Purchases later
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Reserve this item
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              No payment is taken here — you'll arrange it directly with the seller.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="font-medium text-gray-900 text-sm line-clamp-2">{listing.title}</div>
              {selectedVariant && (
                <div className="text-xs text-gray-600 mt-1">{selectedVariant.label}</div>
              )}
              <div className="text-lg font-bold text-gray-900 mt-1">
                {listing.currency} {unitPrice.toLocaleString()} {quantity > 1 && `× ${quantity}`}
              </div>
              {quantity > 1 && (
                <div className="text-sm font-semibold text-gray-700">
                  Total: {listing.currency} {totalAmount.toLocaleString()}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQty))}
                />
                {maxQty < 99 && (
                  <p className="text-xs text-gray-500 mt-1">{maxQty} available</p>
                )}
              </div>

              <div>
                <Label>Message to seller (optional)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any questions or delivery preferences..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-black hover:bg-gray-800 text-white h-12 font-semibold"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reserving...</>
                ) : (
                  <>Reserve — {listing.currency} {totalAmount.toLocaleString()}</>
                )}
              </Button>
              <p className="text-[11px] text-center text-gray-400 leading-relaxed">
                Reserving tells the seller you want this and shares their contact details with you.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
