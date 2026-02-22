import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag, Music, Newspaper, Trophy, Gift } from 'lucide-react';
import { scrollToTop } from '@/lib/scrollToTop';

interface DiscoverItem {
  title: string;
  description: string;
  to: string;
  icon: typeof Calendar;
  color: string;
  bg: string;
}

const ALL_ITEMS: DiscoverItem[] = [
  {
    title: 'Events',
    description: 'Find concerts, festivals, and community gatherings near you',
    to: '/events',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Marketplace',
    description: 'Buy and sell cars, phones, fashion, and more',
    to: '/marketplace',
    icon: ShoppingBag,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Streams',
    description: 'Listen to trending Afrobeats, Amapiano, and more',
    to: '/streams',
    icon: Music,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Sports',
    description: 'Scores, news, and highlights from African football and more',
    to: '/sports',
    icon: Trophy,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    title: 'Blog',
    description: 'Stories, culture, and insights from the diaspora',
    to: '/blog',
    icon: Newspaper,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    title: 'Invite Friends',
    description: 'Earn 50 Bara Coins for every friend who joins',
    to: '/invite',
    icon: Gift,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
];

interface DiscoverMoreProps {
  exclude?: string[];
  maxItems?: number;
  variant?: 'light' | 'dark';
}

export function DiscoverMore({ exclude = [], maxItems = 3, variant = 'light' }: DiscoverMoreProps) {
  const items = ALL_ITEMS.filter(item => !exclude.includes(item.title)).slice(0, maxItems);

  const isDark = variant === 'dark';

  return (
    <section className={`py-10 ${isDark ? '' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-xl font-bold mb-6 font-comfortaa ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Discover More on Bara
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                onClick={scrollToTop}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
