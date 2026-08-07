import { useEffect, useState } from 'react';

/**
 * Shown while a lazy (code-split) route chunk loads.
 *
 * A bare spinner is fine on a fast connection but dishonest on a slow one:
 * on 2G/3G a chunk can take tens of seconds, and if the request fails in a way
 * that never rejects (a captive portal, a hung connection) the spinner is
 * permanent with no way out. So after SLOW_MS we admit it is taking a while and
 * offer a reload — mobile-data conditions are the norm for this audience, not
 * the edge case.
 */
const SLOW_MS = 10_000;

export const RouteFallback = () => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSlow(true), SLOW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
        <span className="sr-only">Loading…</span>
        {isSlow && (
          <div className="mt-2 max-w-xs">
            <p className="text-sm font-roboto text-gray-600 mb-3">
              This is taking longer than usual. Your connection may be slow.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Reload the page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
