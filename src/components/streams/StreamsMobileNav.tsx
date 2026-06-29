import { Home, Search, Library, Mic2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  { to: '/streams', icon: Home, label: 'Home', match: (p: string) => p === '/streams' || p.startsWith('/streams/music') },
  { to: '/streams/search', icon: Search, label: 'Search', match: (p: string) => p.startsWith('/streams/search') },
  { to: '/streams/library', icon: Library, label: 'Library', match: (p: string) => p.startsWith('/streams/library') || p.startsWith('/streams/liked') },
  { to: '/streams/creator', icon: Mic2, label: 'Creator', match: (p: string) => p.startsWith('/streams/creator') },
];

/**
 * Mobile-only bottom navigation for the Streams section (the sidebar is
 * desktop-only). Fixed to the bottom; the mini-player raises above it on
 * Streams routes so they stack like a music app.
 */
export function StreamsMobileNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 z-[150] flex items-stretch"
      aria-label="Streams navigation"
    >
      {ITEMS.map(({ to, icon: Icon, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
              active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} className={active ? 'text-gray-900' : 'text-gray-500'} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
