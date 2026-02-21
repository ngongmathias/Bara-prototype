import React, { useState } from 'react';
import { NavLink, useLocation, Link, useParams } from 'react-router-dom';
import { ChevronDown, Search, Trophy, Users, Star, Grid } from 'lucide-react';
import { SPORTS_CONFIG, MORE_SPORTS } from '@/config/sportsConfig';

export const SportsSubNav = () => {
    const location = useLocation();
    const { sport: sportSlug } = useParams();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Determine current sport config
    const activeSport = (sportSlug && SPORTS_CONFIG[sportSlug as keyof typeof SPORTS_CONFIG]) || SPORTS_CONFIG.football;

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm font-sans" onMouseLeave={() => setOpenMenu(null)}>
            {/* Top Tier: Major Sports */}
            <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between h-14">
                <div className="flex items-center space-x-6 h-full overflow-x-auto no-scrollbar scroll-smooth">
                    <NavLink to="/sports" end className={({ isActive }) => `text-sm font-black uppercase tracking-tighter flex items-center h-full border-b-4 transition-colors whitespace-nowrap ${isActive ? 'border-red-600 text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
                        Home
                    </NavLink>

                    {Object.values(SPORTS_CONFIG).map((sport) => (
                        <div key={sport.id} className="h-full relative flex items-center" onMouseEnter={() => setOpenMenu(sport.id)}>
                            <SportLink to={`/sports/${sport.slug}`} label={sport.name} isActive={sportSlug === sport.slug || (sport.id === 'football' && !sportSlug && location.pathname === '/sports')} />

                            {openMenu === sport.id && (sport.featuredLeagues.length > 0 || (sport.groups && sport.groups.length > 0)) && (
                                <div className="absolute top-14 left-0 w-[600px] bg-white border border-gray-200 shadow-2xl rounded-b-xl p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    {sport.groups && sport.groups.length > 0 ? (
                                        // Complex groupings (like NBA Divisions / NFL Conferences)
                                        sport.groups.map((group, idx) => (
                                            <div key={idx} className="space-y-3 text-left">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b pb-1">{group.title}</h4>
                                                <div className="space-y-2">
                                                    {group.leagues.map(item => (
                                                        <Link key={item.id} to={`/sports/${sport.slug}/team/${item.id}`} className="block text-xs font-bold text-gray-700 hover:text-red-600 transition-colors">
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Standard Leagues / Teams
                                        <>
                                            <div className="space-y-3 text-left">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b pb-1">Popular Leagues</h4>
                                                <div className="space-y-2">
                                                    {sport.featuredLeagues.map(league => (
                                                        <Link key={league.id} to={`/sports/${sport.slug}/table/${league.id}`} className="flex items-center gap-2 group">
                                                            {league.logo && <img src={league.logo} alt="" className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all text-[8px]" />}
                                                            <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 truncate">{league.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-span-2 space-y-3 text-left">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b pb-1">Featured Teams</h4>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                    {sport.featuredTeams.map(team => (
                                                        <Link key={team.id} to={`/sports/${sport.slug}/team/${team.id}`} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded transition-colors group">
                                                            {team.logo && <img src={team.logo} alt="" className="w-6 h-6 object-contain" />}
                                                            <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 truncate">{team.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-3 pt-4 border-t flex justify-center gap-8">
                                        <Link to={`/sports/${sport.slug}/teams`} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">All Teams</Link>
                                        <Link to={`/sports/${sport.slug}/standings`} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">Standings</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* More Sports Dropdown */}
                    <div className="h-full relative flex items-center" onMouseEnter={() => setOpenMenu('more')}>
                        <button className="text-sm font-black uppercase tracking-tighter text-gray-500 hover:text-black flex items-center gap-1 group whitespace-nowrap">
                            More <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        </button>
                        {openMenu === 'more' && (
                            <div className="absolute top-14 left-0 w-[480px] bg-white border border-gray-200 shadow-2xl rounded-b-xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b pb-2 mb-4 text-left">More Sports</h4>
                                <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-left">
                                    {MORE_SPORTS.map(s => (
                                        <Link key={s.slug} to={`/sports/${s.slug}`} className="text-xs font-bold text-gray-700 hover:text-red-600 transition-colors uppercase tracking-tight">
                                            {s.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Teams, Players..."
                            className="bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-600 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Tier: Contextual Links */}
            <div className="bg-gray-50 border-t border-gray-100">
                <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-8 h-10 overflow-x-auto scrollbar-hide">
                    {activeSport.navItems.map((item, idx) => (
                        <ContextLink
                            key={idx}
                            to={`/sports/${activeSport.slug}${item.path ? `/${item.path}` : ''}`}
                            label={item.label}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const SportLink = ({ to, label, isActive }: { to: string, label: string, isActive?: boolean }) => (
    <NavLink
        to={to}
        className={({ isActive: linkActive }) => `text-sm font-black uppercase tracking-tighter flex items-center h-full border-b-4 transition-colors ${isActive || linkActive ? 'border-red-600 text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
    >
        {label}
    </NavLink>
);

const ContextLink = ({ to, label }: { to: string, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `text-xs font-bold uppercase tracking-tight text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap ${isActive ? 'text-red-600' : ''}`}
    >
        {label}
    </NavLink>
);

// End of file

