import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Event as DatabaseEvent } from '@/lib/eventsService';

interface EventsCalendarViewProps {
  events: DatabaseEvent[];
  onEventClick: (event: DatabaseEvent) => void;
}

export const EventsCalendarView = ({ events, onEventClick }: EventsCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.start_date.startsWith(dateStr));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = 
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`p-2 border border-gray-200 min-h-[100px] ${
            isToday ? 'bg-orange-50 border-orange-300' : 'bg-white'
          } hover:bg-gray-50 transition-colors`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className="w-full text-left text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded truncate transition-colors"
                title={event.title}
              >
                {event.title}
              </button>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-orange-500" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-50 border border-orange-300 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 rounded"></div>
          <span>Event</span>
        </div>
      </div>
    </div>
  );
};
