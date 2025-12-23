import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CityTime {
  city: string;
  country: string;
  timezone: string;
  time: string;
  date: string;
}

export const WorldClockTool: React.FC = () => {
  const [times, setTimes] = useState<CityTime[]>([]);

  const africanCities = [
    { city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos' },
    { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo' },
    { city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi' },
    { city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg' },
    { city: 'Accra', country: 'Ghana', timezone: 'Africa/Accra' },
    { city: 'Addis Ababa', country: 'Ethiopia', timezone: 'Africa/Addis_Ababa' },
    { city: 'Kigali', country: 'Rwanda', timezone: 'Africa/Kigali' },
    { city: 'Dakar', country: 'Senegal', timezone: 'Africa/Dakar' },
    { city: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca' },
    { city: 'Dar es Salaam', country: 'Tanzania', timezone: 'Africa/Dar_es_Salaam' }
  ];

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = africanCities.map(city => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        const dateString = now.toLocaleDateString('en-US', {
          timeZone: city.timezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        return {
          ...city,
          time: timeString,
          date: dateString
        };
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {times.map((cityTime) => (
          <div
            key={cityTime.timezone}
            className="border border-gray-200 rounded-lg p-4 hover:border-black transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h3 className="font-bold text-black">{cityTime.city}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-2">{cityTime.country}</p>
                <div className="text-2xl font-black text-black">{cityTime.time}</div>
                <div className="text-sm text-gray-500 mt-1">{cityTime.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
