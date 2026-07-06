import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ReferralService } from '@/lib/referralService';
import { useShare } from '@/context/ShareContext';
import { UserPlus, Copy, Check, ArrowRight, Share2 } from 'lucide-react';

// 27.8.5 — dashboard referral card: personal code, invited/activated counts,
// copy-link button. The full program lives at /invite.
export const ReferralCard = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { openShare } = useShare();
    const [stats, setStats] = useState<{ code: string | null; total: number; activated: number }>({ code: null, total: 0, activated: 0 });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        ReferralService.getReferralStats(user.id).then(setStats);
    }, [user?.id]);

    const referralLink = `${window.location.origin}/user/sign-up?ref=${stats.code || ''}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: 'Failed to copy', description: 'Please copy the link manually.', variant: 'destructive' });
        }
    };

    const handleShare = () => {
        if (!stats.code) return;
        openShare({
            url: referralLink,
            title: 'Join me on BARA Afrika',
            description: 'Sign up with my invite link and we both earn Bara Coins!',
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-gray-900" />
                    Invite friends, earn coins
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                    Share your invite link — when a friend joins and gets active, you <span className="font-semibold text-gray-900">both</span> earn Bara Coins.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-black text-gray-900">{stats.total}</div>
                        <div className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Invited</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-black text-gray-900">{stats.activated}</div>
                        <div className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Activated</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-600 truncate font-mono">
                        {stats.code ? referralLink : 'Loading your link…'}
                    </div>
                    <Button onClick={handleCopy} disabled={!stats.code} variant="outline" size="sm" className="flex-shrink-0 h-auto">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
                <Button
                    onClick={handleShare}
                    disabled={!stats.code}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold"
                >
                    <Share2 className="w-4 h-4 mr-2" /> Share my invite link
                </Button>
                <button
                    onClick={() => navigate('/invite')}
                    className="text-xs font-bold text-gray-900 hover:underline flex items-center gap-1"
                >
                    See the full referral program <ArrowRight size={12} />
                </button>
            </CardContent>
        </Card>
    );
};

export default ReferralCard;
