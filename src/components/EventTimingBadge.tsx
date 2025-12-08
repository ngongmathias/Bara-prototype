import { Clock } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture, parseISO, isWithinInterval, addHours } from 'date-fns';

interface EventTimingBadgeProps {
  startDate: string;
  endDate?: string;
  className?: string;
}

export const EventTimingBadge = ({ startDate, endDate, className = '' }: EventTimingBadgeProps) => {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : addHours(start, 3); // Default 3 hour duration if no end date
  const now = new Date();

  // Check if event is happening right now
  const isHappeningNow = isWithinInterval(now, { start, end });

  // Check if event is today but hasn't started yet
  const isTodayEvent = isToday(start) && isFuture(start);

  // Check if event is tomorrow
  const isTomorrowEvent = isTomorrow(start);

  // Check if event has passed
  const hasPassed = isPast(end);

  // Determine badge content and styling
  let badgeText = '';
  let badgeClass = '';
  let showClock = true;

  if (isHappeningNow) {
    badgeText = 'Happening Now';
    badgeClass = 'bg-green-500 text-white animate-pulse';
    showClock = false;
  } else if (hasPassed) {
    badgeText = 'Ended';
    badgeClass = 'bg-gray-400 text-white';
    showClock = false;
  } else if (isTodayEvent) {
    badgeText = `Today, ${format(start, 'HH:mm')}`;
    badgeClass = 'bg-blue-500 text-white';
  } else if (isTomorrowEvent) {
    badgeText = `Tomorrow, ${format(start, 'HH:mm')}`;
    badgeClass = 'bg-purple-500 text-white';
  } else {
    badgeText = format(start, 'do MMM yy');
    badgeClass = 'bg-gray-600 text-white';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass} ${className}`}>
      {showClock && <Clock className="w-3 h-3" />}
      {isHappeningNow && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
      <span>{badgeText}</span>
    </div>
  );
};
