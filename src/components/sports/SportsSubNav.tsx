import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';

export const SportsSubNav = () => {
    const location = useLocation();

    // Determine which sport/tier we are in
    const isFootball = location.pathname.includes('/sports/football') || location.pathname === '/sports';

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            {/* Top Tier: Major Sports */}
            <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between h-14">
                <div className="flex items-center space-x-8 h-full overflow-x-auto scrollbar-hide">
                    <NavLink to="/sports" end className={({ isActive }) => `text-sm font-black uppercase tracking-tighter flex items-center h-full border-b-4 transition-colors ${isActive ? 'border-red-600 text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
                        Home
                    </NavLink>
                    <SportLink to="/sports/football" label="Football" isActive={isFootball} />
                    <SportLink to="/sports/nba" label="NBA" />
                    <SportLink to="/sports/nfl" label="NFL" />
                    <SportLink to="/sports/cricket" label="Cricket" />
                    <SportLink to="/sports/boxing" label="Boxing" />
                    <div className="flex items-center gap-1 text-gray-500 hover:text-black cursor-pointer group">
                        <span className="text-sm font-black uppercase tracking-tighter">More</span>
                        <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    </div>
                </div>

                {/* Search / Context Actions */}
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

            {/* Bottom Tier: Contextual Links (e.g., for Football) */}
            {isFootball && (
                <div className="bg-gray-50 border-t border-gray-100">
                    <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-8 h-10 overflow-x-auto scrollbar-hide">
                        <ContextLink to="/sports" label="Home" />
                        <ContextLink to="/sports/scores" label="Scores" />
                        <ContextLink to="/sports/schedule" label="Schedule" />
                        <ContextLink to="/sports/standings" label="Standings" />
                        <ContextLink to="/sports/teams" label="Teams" />
                        <ContextLink to="/sports/stats" label="Stats" />
                    </div>
                </div>
            )}
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
