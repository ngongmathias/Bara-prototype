import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Show banner after a small delay
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
        // Initialize analytics logic here if needed
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:p-6"
                >
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 pr-8">
                            <h3 className="font-semibold text-gray-900 mb-1">We value your privacy</h3>
                            <p className="text-sm text-gray-600">
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                                By clicking "Accept", you consent to our use of cookies.
                                Read our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button variant="outline" onClick={handleDecline} className="flex-1 md:flex-none whitespace-nowrap">
                                Decline
                            </Button>
                            <Button onClick={handleAccept} className="flex-1 md:flex-none whitespace-nowrap bg-blue-600 hover:bg-blue-700">
                                Accept
                            </Button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 md:hidden"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
