import { Link } from 'react-router-dom';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminWorkQueue } from '@/hooks/useAdminWorkQueue';

/**
 * "What needs you today", at the top of the admin dashboard.
 *
 * The console has 48 pages and none of them announces that it has work waiting.
 * Everything below is a queue an admin previously had to remember to visit —
 * which is why ten event registrations went unconfirmed for six months.
 *
 * Rows with nothing pending are hidden rather than listed as zeros: a list of
 * eight "0"s is noise, and the point is that a non-empty queue stands out.
 */
export const AdminWorkQueue = () => {
  const { items, loading, actionable, refresh } = useAdminWorkQueue();

  if (loading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  // In normal operation the hook always returns one row per queue. An empty
  // list means it never ran (no signed-in user — e.g. local admin preview), and
  // claiming "nothing is waiting" would be a lie, so render nothing instead.
  if (items.length === 0) return null;

  const waiting = items.filter((i) => (i.count ?? 0) > 0);
  const unreadable = items.filter((i) => i.count === null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">
          Needs attention
          {actionable > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-gray-900 text-white text-xs font-bold align-middle">
              {actionable}
            </span>
          )}
        </CardTitle>
        <button
          onClick={refresh}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Refresh work queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </CardHeader>

      <CardContent>
        {waiting.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-600">
            <Check className="w-4 h-4 text-gray-400" />
            Nothing is waiting on you right now.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {waiting.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.href}
                  className="flex items-center justify-between gap-3 py-3 group"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full text-xs font-bold ${
                        item.informational
                          ? 'bg-gray-100 text-gray-600 border border-gray-200'
                          : 'bg-gray-900 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                    <span className="text-sm text-gray-800 truncate">{item.label}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 transition-colors flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* A queue that can't be read is worse than an empty one — it looks
            clear when it isn't. Say so instead of showing a silent zero. */}
        {unreadable.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            Couldn't read: {unreadable.map((i) => i.label.toLowerCase()).join(', ')}.
            You may not have permission, or a migration may be outstanding.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
