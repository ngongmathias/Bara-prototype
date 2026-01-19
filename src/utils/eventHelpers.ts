/**
 * Event utility functions for calculating real-time event status
 */

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Calculate the real-time status of an event based on current date/time
 * @param startDate - Event start date (ISO string or Date)
 * @param endDate - Event end date (ISO string or Date)
 * @param storedStatus - Status stored in database (used for cancelled events)
 * @returns The current status of the event
 */
export function calculateEventStatus(
  startDate: string | Date,
  endDate: string | Date,
  storedStatus?: EventStatus
): EventStatus {
  // If event is cancelled, always return cancelled
  if (storedStatus === 'cancelled') {
    return 'cancelled';
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Event has ended
  if (end < now) {
    return 'completed';
  }

  // Event is currently happening
  if (start <= now && end >= now) {
    return 'ongoing';
  }

  // Event hasn't started yet
  return 'upcoming';
}

/**
 * Get a human-readable status label
 */
export function getEventStatusLabel(status: EventStatus): string {
  const labels: Record<EventStatus, string> = {
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status];
}

/**
 * Get status badge color classes for UI
 */
export function getEventStatusColor(status: EventStatus): string {
  const colors: Record<EventStatus, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status];
}

/**
 * Check if an event is in the past
 */
export function isEventPast(endDate: string | Date): boolean {
  return new Date(endDate) < new Date();
}

/**
 * Check if an event is currently happening
 */
export function isEventOngoing(startDate: string | Date, endDate: string | Date): boolean {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
}

/**
 * Check if an event is in the future
 */
export function isEventUpcoming(startDate: string | Date): boolean {
  return new Date(startDate) > new Date();
}
