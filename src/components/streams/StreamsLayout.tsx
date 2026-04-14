import { MainLayout } from '@/components/layout/MainLayout';
import { StreamsSidebar } from './StreamsSidebar';
import { SongContextMenuProvider } from './SongContextMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Music, Film, BookOpen, Headphones, Gamepad2, LayoutGrid } from 'lucide-react';

const STREAM_TABS = [
    { label: 'Hub', to: '/streams', icon: LayoutGrid, exact: true },
    { label: 'Music', to: '/streams/music', icon: Music },
    { label: 'Movies', to: '/streams/movies', icon: Film },
    { label: 'Ebooks', to: '/streams/ebooks', icon: BookOpen },
    { label: 'Podcasts', to: '/streams/podcasts', icon: Headphones },
    { label: 'Gaming', to: '/streams/gaming', icon: Gamepad2 },
];

export function StreamsLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <MainLayout>
            <SongContextMenuProvider>
            <div className="flex min-h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
                <StreamsSidebar className="w-64 flex-shrink-0 hidden lg:flex border-r border-gray-200 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto" />
                <div className="flex-grow min-w-0 bg-white relative">
                    {/* Content-type navigation bar */}
                    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                        <nav className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
                            {STREAM_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = tab.exact
                                    ? location.pathname === tab.to
                                    : location.pathname.startsWith(tab.to);
                                return (
                                    <Link
                                        key={tab.to}
                                        to={tab.to}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                                            isActive
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
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
            </SongContextMenuProvider>
        </MainLayout>
    );
}
