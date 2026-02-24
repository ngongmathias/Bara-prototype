import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, MapPin, User, Flag, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';

interface Review {
    id: string;
    user_id: string;
    rating: number;
    title: string | null;
    content: string;
    images: string[] | null;
    created_at: string;
    user_profile?: {
        full_name: string;
        // avatar_url?
    }
}

export const ReviewList = ({ businessId }: { businessId: string }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [helpfulClicks, setHelpfulClicks] = useState<string[]>([]);
    const { user } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        fetchReviews();
    }, [businessId]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await db.reviews()
                .select('*')
                .eq('business_id', businessId)
                .eq('status', 'approved') // Only show approved reviews? Or pending if user is owner?
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHelpful = (reviewId: string) => {
        if (helpfulClicks.includes(reviewId)) {
            setHelpfulClicks(prev => prev.filter(id => id !== reviewId));
        } else {
            setHelpfulClicks(prev => [...prev, reviewId]);
            toast({ title: "Thanks for your feedback!" });
        }
    };

    const handleReport = (reviewId: string) => {
        toast({ title: "Review reported", description: "Our team will review this shortly." });
    };

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-lg">
                <Star className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this business!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold font-comfortaa mb-4">Reviews ({reviews.length})</h3>

            {reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{review.user_profile?.full_name || 'Anonymous User'}</div>
                                <div className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                </div>
                            </div>
                        </div>

                        <div className="flex bg-yellow-100 px-2 py-1 rounded text-yellow-800 text-sm font-bold items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {review.rating}
                        </div>
                    </div>

                    <h4 className="font-bold mt-4 text-sm md:text-base">{review.title}</h4>
                    <p className="text-gray-700 mt-2 text-sm">{review.content}</p>

                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {review.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Review"
                                    className="h-20 w-20 object-cover rounded border"
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t flex gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={helpfulClicks.includes(review.id) ? "text-blue-600" : "text-gray-500"}
                            onClick={() => handleHelpful(review.id)}
                        >
                            <ThumbsUp className={`h-4 w-4 mr-1.5 ${helpfulClicks.includes(review.id) ? "fill-current" : ""}`} />
                            Helpful
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleReport(review.id)}
                        >
                            <Flag className="h-4 w-4 mr-1.5" />
                            Report
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
