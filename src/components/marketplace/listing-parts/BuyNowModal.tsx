import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

interface BuyNowModalProps {
  listing: any;
  selectedVariant?: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BuyNowModal: React.FC<BuyNowModalProps> = ({
  listing,
  selectedVariant,
  onClose,
  onSuccess,
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = selectedVariant?.price_override ?? parseFloat(listing.price) ?? 0;
  const totalAmount = unitPrice * quantity;
  const maxQty = selectedVariant
    ? selectedVariant.quantity - selectedVariant.quantity_sold
    : 99;

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to sign in to purchase.', variant: 'destructive' });
      return;
    }
    if (user.id === listing.created_by) {
      toast({ title: 'Cannot buy your own item', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('marketplace_transactions').insert({
        listing_id: listing.id,
        variant_id: selectedVariant?.id || null,
        buyer_user_id: user.id,
        seller_user_id: listing.created_by,
        status: 'pending_seller',
        quantity,
        amount: totalAmount,
        currency: listing.currency,
        buyer_message: message || null,
      });

      if (error) throw error;

      toast({
        title: 'Purchase request sent!',
        description: 'The seller will be notified. You\'ll hear back soon.',
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Buy now error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to submit purchase request', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>

        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Buy Now
        </h3>
        <p className="text-sm text-gray-500 mb-4">Send a purchase request to the seller</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="font-medium text-gray-900 text-sm line-clamp-2">{listing.title}</div>
          {selectedVariant && (
            <div className="text-xs text-gray-600 mt-1">{selectedVariant.label}</div>
          )}
          <div className="text-lg font-bold text-blue-600 mt-1">
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
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <>Confirm Purchase — {listing.currency} {totalAmount.toLocaleString()}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
