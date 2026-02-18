import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function StreamsSidebar({ className = "" }: { className?: string }) {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`bg-black text-gray-300 flex flex-col ${className}`}>
            <div className="p-6">
                <div className="space-y-4">
                    <SidebarLink to="/streams" icon={<Home />} label="Home" active={isActive('/streams')} />
                    <SidebarLink to="/streams/search" icon={<Search />} label="Search" active={isActive('/streams/search')} />
                    <SidebarLink to="/streams/library" icon={<Library />} label="Your Library" active={isActive('/streams/library')} />
                </div>

                <div className="mt-8 space-y-4">
                    <SidebarLink to="/streams/create-playlist" icon={<PlusSquare />} label="Create Playlist" />
                    <SidebarLink to="/streams/liked" icon={<Heart className="text-purple-500 fill-purple-500" />} label="Liked Songs" />
                </div>

                <div className="mt-6 border-t border-gray-800 pt-4">
                    <div className="h-40 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
                        {/* Mock Playlists */}
                        <div className="hover:text-white cursor-pointer transition text-sm">Afrobeats Essentials</div>
                        <div className="hover:text-white cursor-pointer transition text-sm">Chill Vibes</div>
                        <div className="hover:text-white cursor-pointer transition text-sm">Gym Hype</div>
                        <div className="hover:text-white cursor-pointer transition text-sm">Top 50 - South Africa</div>
                        <div className="hover:text-white cursor-pointer transition text-sm">Amapiano Grooves</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link to={to} className={`flex items-center gap-4 transition font-semibold ${active ? 'text-white' : 'hover:text-white'}`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
