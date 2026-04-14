import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import { getRecent, clearRecent, RecentItem } from '@/lib/recentActivity';

export const ContinueWhereYouLeftOff = () => {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(getRecent(undefined, 12));
  }, []);

  if (items.length === 0) return null;

  const handleClear = () => {
    clearRecent();
    setItems([]);
  };

  const kindLabel = (kind: string) => {
    if (kind === 'event') return 'Event';
    if (kind === 'ad') return 'Marketplace';
    if (kind === 'song') return 'Song';
    return kind;
  };

  return (
    <section className="w-full max-w-6xl mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 font-comfortaa">Continue where you left off</h2>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={`${item.kind}-${item.id}`}
            to={item.href}
            className="flex-shrink-0 w-44 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="aspect-square bg-gray-100 relative">
              {item.imageUrl ? (
                <img
                  loading="lazy" src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-bold">
                  {item.title.charAt(0)}
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded">
                {kindLabel(item.kind)}
              </div>
            </div>
            <div className="p-3">
              <div className="font-semibold text-sm text-gray-900 line-clamp-2">{item.title}</div>
              {item.subtitle && (
                <div className="text-xs text-gray-500 mt-1 truncate">{item.subtitle}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContinueWhereYouLeftOff;
