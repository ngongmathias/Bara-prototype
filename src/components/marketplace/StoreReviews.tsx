import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { createAuthenticatedSupabaseClient, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

interface StoreReview {
    id: string;
    reviewer_user_id: string;
    rating: number;
    body: string | null;
    created_at: string;
}

interface StoreReviewsProps {
    partnerId: string;
    ownerUserId: string;
}

const StarRow: React.FC<{ value: number; onChange?: (v: number) => void; size?: number }> = ({ value, onChange, size = 20 }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
            <button
                key={n}
                type="button"
                disabled={!onChange}
                onClick={() => onChange?.(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={onChange ? 'cursor-pointer' : 'cursor-default'}
            >
                <Star
                    className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    style={{ width: size, height: size }}
                />
            </button>
        ))}
    </div>
);

export const StoreReviews: React.FC<StoreReviewsProps> = ({ partnerId, ownerUserId }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [reviews, setReviews] = useState<StoreReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [myReviewId, setMyReviewId] = useState<string | null>(null);

    const isOwner = !!user && user.id === ownerUserId;

    const load = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('store_reviews')
            .select('id, reviewer_user_id, rating, body, created_at')
            .eq('partner_id', partnerId)
            .order('created_at', { ascending: false })
            .limit(50);
        const rows = (data || []) as StoreReview[];
        setReviews(rows);
        if (user) {
            const mine = rows.find(r => r.reviewer_user_id === user.id);
            if (mine) {
                setMyReviewId(mine.id);
                setRating(mine.rating);
                setBody(mine.body ?? '');
            }
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, [partnerId, user?.id]);

    const submit = async () => {
        if (!user) { navigate('/user/sign-in'); return; }
        setSubmitting(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('No auth token');
            const client = await createAuthenticatedSupabaseClient(token);

            if (myReviewId) {
                const { error } = await client
                    .from('store_reviews')
                    .update({ rating, body: body.trim() || null, updated_at: new Date().toISOString() })
                    .eq('id', myReviewId);
                if (error) throw error;
                toast({ title: 'Review updated' });
            } else {
                const { error } = await client
                    .from('store_reviews')
                    .insert({ partner_id: partnerId, reviewer_user_id: user.id, rating, body: body.trim() || null });
                if (error) throw error;
                toast({ title: 'Thanks for your review!' });
            }
            await load();
        } catch (error: any) {
            console.error('Store review error:', error);
            toast({ title: 'Could not save review', description: error.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold font-comfortaa mb-1">Store Reviews</h2>
                <p className="text-sm text-muted-foreground">What other buyers say about this store.</p>
            </div>

            {!isOwner && (
                <div className="border rounded-xl p-4 bg-white">
                    <div className="text-sm font-bold mb-2">{myReviewId ? 'Your review' : 'Leave a review'}</div>
                    <div className="mb-3"><StarRow value={rating} onChange={setRating} size={24} /></div>
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share your experience with this store (optional)"
                        rows={3}
                    />
                    <div className="mt-3">
                        <Button onClick={submit} disabled={submitting}>
                            {submitting ? 'Saving...' : myReviewId ? 'Update review' : 'Submit review'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="text-sm text-muted-foreground">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</div>
                ) : reviews.map(r => (
                    <div key={r.id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between mb-1">
                            <StarRow value={r.rating} size={16} />
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                        </div>
                        {r.body && <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.body}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};
