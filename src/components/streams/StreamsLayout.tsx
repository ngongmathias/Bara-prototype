import { MainLayout } from '@/components/layout/MainLayout';
import { StreamsSidebar } from './StreamsSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export function StreamsLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <MainLayout>
            <div className="flex min-h-[calc(100vh-64px)] bg-black overflow-hidden">
                <StreamsSidebar className="w-64 flex-shrink-0 hidden lg:flex border-r border-white/5 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto" />
                <div className="flex-grow min-w-0 bg-gradient-to-b from-gray-900 to-black relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </MainLayout>
    );
}
