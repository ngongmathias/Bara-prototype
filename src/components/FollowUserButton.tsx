import React, { useEffect, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { createAuthenticatedSupabaseClient, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FollowUserButtonProps {
    targetUserId: string;
    className?: string;
    variant?: 'solid' | 'pill';
}

export const FollowUserButton: React.FC<FollowUserButtonProps> = ({
    targetUserId,
    className = '',
    variant = 'solid',
}) => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const isSelf = !!user && user.id === targetUserId;

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const { count } = await supabase
                .from('user_follows')
                .select('id', { count: 'exact', head: true })
                .eq('followee_user_id', targetUserId);
            if (!cancelled) setFollowerCount(count ?? 0);

            if (!user || isSelf) return;
            const { data } = await supabase
                .from('user_follows')
                .select('id')
                .eq('followee_user_id', targetUserId)
                .eq('follower_user_id', user.id)
                .maybeSingle();
            if (!cancelled) setIsFollowing(!!data);
        };
        load();
        return () => { cancelled = true; };
    }, [targetUserId, user?.id, isSelf]);

    if (isSelf) return null;

    const toggle = async () => {
        if (!user) {
            navigate('/user/sign-in');
            return;
        }
        setLoading(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('No auth token');
            const client = await createAuthenticatedSupabaseClient(token);

            if (isFollowing) {
                const { error } = await client
                    .from('user_follows')
                    .delete()
                    .eq('follower_user_id', user.id)
                    .eq('followee_user_id', targetUserId);
                if (error) throw error;
                setIsFollowing(false);
                setFollowerCount(c => Math.max(0, c - 1));
                toast({ title: 'Unfollowed' });
            } else {
                const { error } = await client
                    .from('user_follows')
                    .insert({ follower_user_id: user.id, followee_user_id: targetUserId });
                if (error && error.code !== '23505') throw error;
                setIsFollowing(true);
                setFollowerCount(c => c + 1);
                toast({ title: 'Following' });
            }
        } catch (error: any) {
            console.error('Follow user error:', error);
            toast({ title: 'Could not update follow', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const base = variant === 'pill'
        ? 'rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest'
        : 'rounded-lg px-4 py-2 text-sm font-semibold';

    return (
        <button
            onClick={toggle}
            disabled={loading}
            aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
            className={`inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 ${base} ${
                isFollowing
                    ? 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-black'
            } ${className}`}
        >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? 'Following' : 'Follow'}
            {followerCount > 0 && (
                <span className="ml-1 text-[10px] font-bold opacity-80">· {followerCount}</span>
            )}
        </button>
    );
};
