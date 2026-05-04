import React, { useEffect, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { createAuthenticatedSupabaseClient, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FollowStoreButtonProps {
    partnerId: string;
    className?: string;
}

export const FollowStoreButton: React.FC<FollowStoreButtonProps> = ({ partnerId, className = '' }) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const { count } = await supabase
                .from('store_followers')
                .select('id', { count: 'exact', head: true })
                .eq('partner_id', partnerId);
            if (!cancelled) setFollowerCount(count ?? 0);

            if (!user) return;
            const { data } = await supabase
                .from('store_followers')
                .select('id')
                .eq('partner_id', partnerId)
                .eq('user_id', user.id)
                .maybeSingle();
            if (!cancelled) setIsFollowing(!!data);
        };
        load();
        return () => { cancelled = true; };
    }, [partnerId, user?.id]);

    const toggle = async () => {
        if (!user) {
            navigate(`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setLoading(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('No auth token');
            const client = await createAuthenticatedSupabaseClient(token);

            if (isFollowing) {
                const { error } = await client
                    .from('store_followers')
                    .delete()
                    .eq('partner_id', partnerId)
                    .eq('user_id', user.id);
                if (error) throw error;
                setIsFollowing(false);
                setFollowerCount(c => Math.max(0, c - 1));
                toast({ title: 'Store unfollowed' });
            } else {
                const { error } = await client
                    .from('store_followers')
                    .insert({ partner_id: partnerId, user_id: user.id });
                if (error && error.code !== '23505') throw error;
                setIsFollowing(true);
                setFollowerCount(c => c + 1);
                toast({ title: 'Following store', description: 'You will be notified of new ads.' });
            }
        } catch (error: any) {
            console.error('Follow store error:', error);
            toast({ title: 'Could not update follow', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            disabled={loading}
            aria-label={isFollowing ? 'Unfollow store' : 'Follow store'}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg disabled:opacity-60 ${
                isFollowing
                    ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
                    : 'bg-gray-900 hover:bg-black text-white'
            } ${className}`}
        >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? 'Following' : 'Follow'}
            {followerCount > 0 && (
                <span className="ml-1 text-xs font-bold opacity-80">· {followerCount}</span>
            )}
        </button>
    );
};
