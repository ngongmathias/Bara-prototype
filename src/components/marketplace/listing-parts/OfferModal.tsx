import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Shared "Make an Offer" modal.
 *
 * Guards on both `user` (buyer_user_id NOT NULL) and `listing.created_by`
 * (seller_user_id NOT NULL). Seeded ads with null created_by will surface a
 * friendly error rather than throwing a 23502 constraint violation.
 */
export interface OfferModalProps {
  open: boolean;
  onClose: () => void;
  listing: any;
  /** Called after a successful insert so pages can record a local lead/notification. */
  onSubmitted?: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  open,
  onClose,
  listing,
  onSubmitted,
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to make an offer',
        variant: 'destructive',
      });
      return;
    }
    if (!listing?.created_by) {
      toast({
        title: 'Cannot submit offer',
        description: 'Seller information is unavailable',
        variant: 'destructive',
      });
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid offer amount',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('marketplace_offers').insert({
        ad_id: listing.id,
        buyer_user_id: user.id,
        seller_user_id: listing.created_by,
        amount: parsed,
        currency: listing.currency || 'USD',
        message: message || null,
        status: 'pending',
      });
      if (error) throw error;
      toast({ title: 'Offer sent!', description: 'The seller has been notified.' });
      setAmount('');
      setMessage('');
      onSubmitted?.();
      onClose();
    } catch (err) {
      console.error('Error submitting offer:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit offer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Make an Offer</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Asking price:{' '}
              <span className="font-semibold">
                {listing?.currency} {parseFloat(listing?.price || 0).toLocaleString()}
              </span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your offer ({listing?.currency})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Enter amount"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[80px]"
              placeholder="Add a note for the seller..."
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !amount}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? 'Sending...' : 'Send Offer'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
