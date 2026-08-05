import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Heart, Sparkles } from 'lucide-react';
import { useSignInNudge } from '@/context/SignInNudgeContext';

export const SignInNudgeSheet = () => {
    const { open, reason, close: onClose } = useSignInNudge();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignIn = () => {
        onClose();
        navigate(`/user/sign-in?redirect_url=${encodeURIComponent(location.pathname + location.search)}`);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[300] p-0 md:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 sm:p-8 relative"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                            <Heart className="text-white" size={24} fill="white" />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            {reason || "Create a free account to like songs, save your favourites, and pick up right where you left off."}
                        </p>

                        <button
                            onClick={handleSignIn}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
                        >
                            <Sparkles size={16} /> Sign In / Create Account
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
                        >
                            Maybe later
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
