import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';

// Set right after a new profile row is created (sign-up + OAuth paths) so the
// invite prompt shows once the redirect lands, wherever that is.
export const REFERRAL_PROMPT_PENDING_KEY = 'bara_referral_prompt_pending';
const shownKey = (userId: string) => `bara_referral_prompt_shown_${userId}`;

/**
 * 27.8.5 — one-time post-registration referral prompt. Mounted globally;
 * renders only when the pending flag from sign-up is present and this user
 * has never seen it (localStorage). Shown once ever per user.
 */
export const InviteFriendsPrompt = () => {
    const { isSignedIn, user } = useUser();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isSignedIn || !user?.id) return;
        try {
            const pending = sessionStorage.getItem(REFERRAL_PROMPT_PENDING_KEY);
            if (pending && !localStorage.getItem(shownKey(user.id))) {
                setOpen(true);
                localStorage.setItem(shownKey(user.id), '1');
            }
            if (pending) sessionStorage.removeItem(REFERRAL_PROMPT_PENDING_KEY);
        } catch { /* storage unavailable — skip the prompt */ }
    }, [isSignedIn, user?.id]);

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4"
                onClick={() => setOpen(false)}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                        aria-label="Dismiss"
                    >
                        <X size={18} />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center mb-4">
                        <UserPlus size={22} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 font-comfortaa mb-2">Invite friends, you both earn coins</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                        Welcome to BARA Afrika! Share your personal invite link — when a friend joins and
                        gets active, you both earn Bara Coins.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setOpen(false); navigate('/invite'); }}
                            className="flex-1 bg-black hover:bg-gray-800 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                        >
                            Get my invite link
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Later
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InviteFriendsPrompt;
