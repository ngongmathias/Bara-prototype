import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  listing_id: string;
  reviewer_user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

interface ReviewsSectionProps {
  listingId: string;
  sellerId?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ listingId, sellerId }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from('marketplace_reviews')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    const items = (data || []) as Review[];
    setReviews(items);
    if (user) {
      const mine = items.find((r) => r.reviewer_user_id === user.id);
      setUserReview(mine || null);
    }
    setLoading(false);
  }, [listingId, user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please sign in to leave a review', variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }
    if (user.id === sellerId) {
      toast({ title: "You can't review your own listing", variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    // Check if buyer has a completed transaction
    const { data: txn } = await supabase
      .from('marketplace_transactions')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_user_id', user.id)
      .eq('status', 'completed')
      .limit(1);

    const isVerified = (txn || []).length > 0;

    const { error } = await supabase.from('marketplace_reviews').upsert(
      {
        listing_id: listingId,
        reviewer_user_id: user.id,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
        is_verified_purchase: isVerified,
      },
      { onConflict: 'listing_id,reviewer_user_id' }
    );

    if (error) {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    } else {
      toast({ title: 'Review submitted!' });
      setShowForm(false);
      setRating(0);
      setTitle('');
      setBody('');

      // Update aggregate on listing
      const { data: agg } = await supabase
        .from('marketplace_reviews')
        .select('rating')
        .eq('listing_id', listingId);
      if (agg && agg.length > 0) {
        const avg = agg.reduce((s: number, r: any) => s + r.rating, 0) / agg.length;
        await supabase
          .from('marketplace_listings')
          .update({ avg_rating: Math.round(avg * 10) / 10, review_count: agg.length })
          .eq('id', listingId);
      }

      fetchReviews();
    }
    setSubmitting(false);
  };

  const handleHelpful = async (reviewId: string) => {
    await supabase.rpc('increment_helpful', { review_id: reviewId }).catch(() => {
      // If RPC doesn't exist, do a manual increment
      supabase
        .from('marketplace_reviews')
        .update({ helpful_count: reviews.find((r) => r.id === reviewId)!.helpful_count + 1 })
        .eq('id', reviewId)
        .then(() => fetchReviews());
    });
    fetchReviews();
  };

  const StarDisplay = ({ value, size = 'w-4 h-4' }: { value: number; size?: string }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  if (loading) return null;

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 font-comfortaa">Reviews</h2>

      {/* Summary */}
      {reviews.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="text-center sm:text-left">
            <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
            <StarDisplay value={Math.round(avgRating)} size="w-5 h-5" />
            <p className="text-sm text-gray-500 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-right text-gray-600">{star}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No reviews yet. Be the first to review!</p>
      )}

      {/* Write review button */}
      {user && user.id !== sellerId && !userReview && !showForm && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="mb-6"
        >
          <Star className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      )}

      {userReview && !showForm && (
        <p className="text-sm text-gray-500 mb-6">You have already reviewed this listing.</p>
      )}

      {/* Review form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Your Review</h3>

          {/* Star picker */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
              >
                <Star
                  className={`w-7 h-7 cursor-pointer transition-colors ${
                    s <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 self-center">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 text-sm"
            maxLength={100}
          />
          <textarea
            placeholder="Share your experience..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm min-h-[80px]"
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting} size="sm">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setTitle('');
                setBody('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <StarDisplay value={review.rating} />
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            {review.title && (
              <h4 className="font-medium text-gray-900 text-sm">{review.title}</h4>
            )}
            {review.body && <p className="text-sm text-gray-700 mt-1">{review.body}</p>}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                <ThumbsUp className="w-3 h-3" />
                Helpful ({review.helpful_count})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
