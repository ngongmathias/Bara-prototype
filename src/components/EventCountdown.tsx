import { useEffect, useState } from 'react';

interface EventCountdownProps {
  startDate: Date | null;
  endDate: Date | null;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const EventCountdown = ({ startDate, endDate }: EventCountdownProps) => {
  const [now, setNow] = useState(() => Date.now());

  const effectiveStart = startDate ?? endDate;
  const effectiveEnd = endDate ?? startDate;

  useEffect(() => {
    if (!effectiveStart) return;
    const msUntilStart = effectiveStart.getTime() - now;
    const isLive = effectiveEnd && now >= effectiveStart.getTime() && now <= effectiveEnd.getTime();
    // Update every second if live or within an hour; otherwise once a minute.
    const tick = isLive || Math.abs(msUntilStart) < 60 * 60 * 1000 ? 1000 : 60000;
    const t = window.setInterval(() => setNow(Date.now()), tick);
    return () => window.clearInterval(t);
  }, [effectiveStart?.getTime(), effectiveEnd?.getTime(), now]);

  if (!effectiveStart) return null;

  const startMs = effectiveStart.getTime();
  const endMs = (effectiveEnd ?? effectiveStart).getTime();

  if (now >= startMs && now <= endMs) {
    return (
      <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider font-comfortaa">Live Now</span>
      </div>
    );
  }

  if (now > endMs) {
    return (
      <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full">
        <span className="text-xs font-bold uppercase tracking-wider font-comfortaa">Ended</span>
      </div>
    );
  }

  const diffMs = startMs - now;
  // Only show countdown if under 60 days away, otherwise just the start date
  const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
  if (diffMs > SIXTY_DAYS) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const cells: Array<{ value: string; label: string }> = [];
  if (days > 0) cells.push({ value: days.toString(), label: days === 1 ? 'day' : 'days' });
  cells.push({ value: pad(hours), label: 'hrs' });
  cells.push({ value: pad(minutes), label: 'min' });
  if (days === 0) cells.push({ value: pad(seconds), label: 'sec' });

  return (
    <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-comfortaa">
        Starts in
      </span>
      <div className="flex items-center gap-2">
        {cells.map((cell, i) => (
          <div key={i} className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900 font-comfortaa tabular-nums">
              {cell.value}
            </span>
            <span className="text-[10px] uppercase text-gray-500 font-roboto">{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
