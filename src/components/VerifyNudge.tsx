import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { VerificationService, VerificationAccountType } from '@/lib/verificationService';
import { ShieldCheck, X } from 'lucide-react';

const DISMISS_DAYS = 7;
const dismissKey = (userId: string, type: string) => `bara_verify_nudge_dismissed_${type}_${userId}`;

/**
 * 27.8.2 — dismissible banner nudging unverified accounts to verify at
 * strategic stages (first ad posted, first song uploaded, storefront
 * creation). Never nags: hidden for verified/pending accounts, and a
 * dismiss hides it for 7 days (stored client-side).
 */
export const VerifyNudge = ({ accountType, context }: { accountType: VerificationAccountType; context: string }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        try {
            const until = localStorage.getItem(dismissKey(user.id, accountType));
            if (until && Date.now() < Number(until)) return;
        } catch { /* storage unavailable — still check status */ }
        VerificationService.getStatus(user.id, accountType).then((status) => {
            if (status === 'none' || status === 'rejected') setShow(true);
        });
    }, [user?.id, accountType]);

    const dismiss = () => {
        setShow(false);
        if (user?.id) {
            try {
                localStorage.setItem(dismissKey(user.id, accountType), String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
            } catch { /* ignore */ }
        }
    };

    if (!show) return null;

    return (
        <div className="bg-gray-900 text-white rounded-xl p-4 flex items-start gap-3 relative">
            <button onClick={dismiss} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Dismiss">
                <X size={16} />
            </button>
            <div className="w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} />
            </div>
            <div className="pr-6">
                <div className="font-black text-sm">Get your verified badge</div>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                    {context} Verified {accountType === 'business' ? 'businesses win more buyers' : 'artists win more listeners'} —
                    it takes a few minutes.
                </p>
                <button
                    onClick={() => navigate('/verify-account')}
                    className="mt-2 bg-white text-gray-900 hover:bg-gray-100 text-xs font-black px-4 py-1.5 rounded-full transition-colors"
                >
                    Verify my {accountType} account
                </button>
            </div>
        </div>
    );
};

export default VerifyNudge;
