import { Home, Search, Library, Plus, Heart, Globe, Mic2, Film, BookOpen, Headphones, Gamepad2, BarChart3 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GamificationService } from '@/lib/gamificationService';
import { useUser } from '@clerk/clerk-react';
import { XPProgressBar } from '../gamification/XPProgressBar';
import { CreatePlaylistModal } from './CreatePlaylistModal';

export function StreamsSidebar({ className = "" }: { className?: string }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user: clerkUser } = useUser();

    const isActive = (path: string) => location.pathname === path;

    const handleCreatePlaylist = () => {
        if (!clerkUser) {
            navigate(`/user/sign-in?redirect_url=${encodeURIComponent(location.pathname)}`);
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <div className={`bg-white text-gray-600 flex flex-col gap-2 p-2 ${className}`}>
            {/* Top Navigation Card */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <XPProgressBar />
                <SidebarLink to="/streams" icon={<Home size={24} />} label="Home" active={isActive('/streams')} />
                <SidebarLink to="/streams/search" icon={<Search size={24} />} label="Search" active={isActive('/streams/search')} />
                <SidebarLink to="/streams/stats" icon={<BarChart3 size={24} />} label="Your Stats" active={isActive('/streams/stats')} />
                <SidebarLink to="/streams/creator" icon={<Mic2 size={24} className="text-gray-900" />} label="Creator Portal" active={isActive('/streams/creator')} />
            </div>

            {/* Browse Content Types */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Browse</p>
                <SidebarLink to="/streams/music" icon={<Home size={20} />} label="Music" active={location.pathname.includes('/streams/music')} />
                <SidebarLink to="/streams/movies" icon={<Film size={20} />} label="Movies" active={location.pathname.includes('/streams/movies')} />
                <SidebarLink to="/streams/ebooks" icon={<BookOpen size={20} />} label="Ebooks" active={location.pathname.includes('/streams/ebooks')} />
                <SidebarLink to="/streams/podcasts" icon={<Headphones size={20} />} label="Podcasts" active={location.pathname.includes('/streams/podcasts')} />
                <SidebarLink to="/streams/gaming" icon={<Gamepad2 size={20} />} label="Gaming" active={location.pathname.includes('/streams/gaming')} />
            </div>

            {/* Library Card */}
            <div className="bg-gray-50 rounded-lg flex-grow flex flex-col overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-200">
                    <Link to="/streams/library" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition cursor-pointer">
                        <Library size={24} />
                        <span className="font-bold">Your Library</span>
                    </Link>
                    <button
                        onClick={handleCreatePlaylist}
                        className="p-1 hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-gray-900"
                     aria-label="Add"><Plus size={20} /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-2 space-y-4 scrollbar-hide">
                    {/* Create Playlist Card */}
                    <div className="bg-white p-4 rounded-lg space-y-4 border border-gray-100">
                        <div className="space-y-1">
                            <h4 className="text-gray-900 font-bold text-sm">
                                {clerkUser ? 'Create a new playlist' : 'Create your first playlist'}
                            </h4>
                            <p className="text-gray-500 text-xs">
                                {clerkUser ? 'Organize your favorite tracks' : 'Sign in to start creating playlists'}
                            </p>
                        </div>
                        <button
                            onClick={handleCreatePlaylist}
                            className="bg-gray-900 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-gray-800 transition active:scale-95 flex items-center gap-2"
                        >
                            {clerkUser ? 'Create playlist' : 'Sign in'}
                        </button>
                    </div>

                    {/* Find Podcasts Card */}
                    <div className="bg-white p-4 rounded-lg space-y-4 border border-gray-100">
                        <div className="space-y-1">
                            <h4 className="text-gray-900 font-bold text-sm">Let's find some podcasts to follow</h4>
                            <p className="text-gray-500 text-xs">We'll keep you updated on new episodes</p>
                        </div>
                        <Link
                            to="/streams/podcasts"
                            className="inline-block bg-gray-900 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-gray-800 transition active:scale-95"
                        >
                            Browse podcasts
                        </Link>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="p-4 mt-auto space-y-6">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-400 font-medium">
                        <a href="#" className="hover:underline">Legal</a>
                        <a href="#" className="hover:underline">Safety & Privacy Center</a>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Cookies</a>
                        <a href="#" className="hover:underline">About Ads</a>
                        <a href="#" className="hover:underline">Accessibility</a>
                    </div>

                    <button className="flex items-center gap-1 text-gray-700 border border-gray-300 rounded-full px-3 py-1 text-xs font-bold hover:border-gray-500 hover:scale-105 transition">
                        <Globe size={14} />
                        <span>English</span>
                    </button>
                </div>
            </div>
            <CreatePlaylistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={async () => {
                    if (clerkUser) {
                        await GamificationService.addXP(clerkUser.id, await GamificationService.getSetting('xp.playlist_create'), 'Created a new playlist');
                        await GamificationService.awardAchievement(clerkUser.id, 'playlist_creator');
                    }
                }}
            />
        </div>
    );
}

function SidebarLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link to={to} className={`flex items-center gap-4 transition font-bold text-sm sm:text-base ${active ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
