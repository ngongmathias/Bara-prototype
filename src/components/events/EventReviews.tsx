import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { createAuthenticatedSupabaseClient, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

interface EventReview {
    id: string;
    reviewer_user_id: string;
    rating: number;
    body: string | null;
    photo_urls: string[];
    created_at: string;
}

interface EventReviewsProps {
    eventId: string;
    startDate: string | null;
}

const StarRow: React.FC<{ value: number; onChange?: (v: number) => void; size?: number }> = ({ value, onChange, size = 20 }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                <Star className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} style={{ width: size, height: size }} />
            </button>
        ))}
    </div>
);

export const EventReviews: React.FC<EventReviewsProps> = ({ eventId, startDate }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [reviews, setReviews] = useState<EventReview[]>([]);
    const [rating, setRating] = useState(5);
    const [body, setBody] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [myId, setMyId] = useState<string | null>(null);

    const hasStarted = startDate ? new Date(startDate) <= new Date() : false;

    const load = async () => {
        const { data } = await supabase
            .from('event_reviews')
            .select('id, reviewer_user_id, rating, body, photo_urls, created_at')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .limit(50);
        const rows = (data || []) as EventReview[];
        setReviews(rows);
        if (user) {
            const mine = rows.find(r => r.reviewer_user_id === user.id);
            if (mine) {
                setMyId(mine.id);
                setRating(mine.rating);
                setBody(mine.body ?? '');
                setPhotos(mine.photo_urls ?? []);
            }
        }
    };

    useEffect(() => { load(); }, [eventId, user?.id]);

    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        try {
            const path = `event-reviews/${eventId}/${user.id}-${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from('event-images').upload(path, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(path);
            setPhotos(p => [...p, publicUrl]);
        } catch (error: any) {
            toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const submit = async () => {
        if (!user) { navigate(`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`); return; }
        setSubmitting(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('No auth token');
            const client = await createAuthenticatedSupabaseClient(token);

            if (myId) {
                const { error } = await client
                    .from('event_reviews')
                    .update({ rating, body: body.trim() || null, photo_urls: photos, updated_at: new Date().toISOString() })
                    .eq('id', myId);
                if (error) throw error;
                toast({ title: 'Review updated' });
            } else {
                const { error } = await client
                    .from('event_reviews')
                    .insert({ event_id: eventId, reviewer_user_id: user.id, rating, body: body.trim() || null, photo_urls: photos });
                if (error) throw error;
                toast({ title: 'Thanks for your review!' });
            }
            await load();
        } catch (error: any) {
            console.error('Event review error:', error);
            toast({ title: 'Could not save review', description: error.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!hasStarted) {
        return (
            <div className="text-sm text-muted-foreground italic">
                Reviews open after the event starts.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold font-comfortaa mb-1">Attendee Reviews</h2>
                <p className="text-sm text-muted-foreground">Rate your experience and share photos from the event.</p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
                <div className="text-sm font-bold mb-2">{myId ? 'Your review' : 'Leave a review'}</div>
                <div className="mb-3"><StarRow value={rating} onChange={setRating} size={24} /></div>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What was it like? (optional)" rows={3} />
                <div className="mt-3 flex flex-wrap gap-2">
                    {photos.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-50">
                        {uploading ? '...' : '+ Photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
                    </label>
                </div>
                <div className="mt-3">
                    <Button onClick={submit} disabled={submitting}>
                        {submitting ? 'Saving...' : myId ? 'Update review' : 'Submit review'}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {reviews.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No reviews yet.</div>
                ) : reviews.map(r => (
                    <div key={r.id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between mb-1">
                            <StarRow value={r.rating} size={16} />
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                        </div>
                        {r.body && <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{r.body}</p>}
                        {r.photo_urls.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {r.photo_urls.map((url, i) => (
                                    <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" loading="lazy" />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
