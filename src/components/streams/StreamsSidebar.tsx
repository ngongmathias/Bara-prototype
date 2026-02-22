import { Home, Search, Library, Plus, Heart, Globe, Mic2, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { GamificationService, XP_REWARDS, COIN_REWARDS } from '@/lib/gamificationService';
import { XPProgressBar } from '../gamification/XPProgressBar';

export function StreamsSidebar({ className = "" }: { className?: string }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user: clerkUser, isSignedIn } = useUser();
    const [creating, setCreating] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleCreatePlaylist = async () => {
        try {
            setCreating(true);

            if (!isSignedIn || !clerkUser) {
                navigate('/user/sign-in?redirect_url=/streams');
                return;
            }

            // Create a new playlist using Clerk user ID
            const { data: newPlaylist, error } = await supabase
                .from('playlists')
                .insert([
                    {
                        title: 'My Playlist',
                        description: 'My new playlist',
                        user_id: clerkUser.id
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            if (newPlaylist) {
                // Gamification: Award XP for curation
                await GamificationService.addXP(clerkUser.id, XP_REWARDS.PLAYLIST_CREATE, 'Created a new playlist');
                await GamificationService.addCoins(clerkUser.id, COIN_REWARDS.PLAYLIST_CREATE, 'Created a new playlist');
                await GamificationService.awardAchievement(clerkUser.id, 'playlist_creator');
                navigate(`/streams/playlist/${newPlaylist.id}`);
            }
        } catch (err) {
            console.error('Error creating playlist:', err);
            // Fallback for demo if insert fails due to schema mismatch
            navigate('/streams/playlist/demo-new');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className={`bg-black text-gray-400 flex flex-col gap-2 p-2 ${className}`}>
            {/* Top Navigation Card */}
            <div className="bg-[#121212] rounded-lg p-4 space-y-4">
                <XPProgressBar />
                <SidebarLink to="/streams" icon={<Home size={24} />} label="Home" active={isActive('/streams')} />
                <SidebarLink to="/streams/search" icon={<Search size={24} />} label="Search" active={isActive('/streams/search')} />
                <SidebarLink to="/streams/creator" icon={<Mic2 size={24} className="text-[#1DB954]" />} label="Creator Portal" active={isActive('/streams/creator')} />
            </div>

            {/* Library Card */}
            <div className="bg-[#121212] rounded-lg flex-grow flex flex-col overflow-hidden">
                <div className="p-4 flex items-center justify-between shadow-md">
                    <Link to="/streams/library" className="flex items-center gap-3 text-gray-400 hover:text-white transition cursor-pointer">
                        <Library size={24} />
                        <span className="font-bold">Your Library</span>
                    </Link>
                    <button
                        onClick={handleCreatePlaylist}
                        disabled={creating}
                        className="p-1 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white disabled:opacity-50"
                    >
                        {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-2 space-y-4 scrollbar-hide">
                    {/* Create Playlist Card */}
                    <div className="bg-[#242424] p-4 rounded-lg space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-white font-bold text-sm">Create your first playlist</h4>
                            <p className="text-white text-xs">It's easy, we'll help you</p>
                        </div>
                        <button
                            onClick={handleCreatePlaylist}
                            disabled={creating}
                            className="bg-white text-black text-xs font-bold py-2 px-4 rounded-full hover:scale-105 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {creating && <Loader2 size={12} className="animate-spin" />}
                            Create playlist
                        </button>
                    </div>

                    {/* Find Podcasts Card */}
                    <div className="bg-[#242424] p-4 rounded-lg space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-white font-bold text-sm">Let's find some podcasts to follow</h4>
                            <p className="text-white text-xs">We'll keep you updated on new episodes</p>
                        </div>
                        <Link
                            to="/streams/podcasts"
                            className="inline-block bg-white text-black text-xs font-bold py-2 px-4 rounded-full hover:scale-105 transition active:scale-95"
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

                    <button className="flex items-center gap-1 text-white border border-gray-600 rounded-full px-3 py-1 text-xs font-bold hover:border-white hover:scale-105 transition">
                        <Globe size={14} />
                        <span>English</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link to={to} className={`flex items-center gap-4 transition font-bold text-sm sm:text-base ${active ? 'text-white' : 'hover:text-white'}`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
