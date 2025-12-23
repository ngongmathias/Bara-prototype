import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export const DateCalculatorTool: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const calculateDifference = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);

    return { days: diffDays, weeks: diffWeeks, months: diffMonths, years: diffYears };
  };

  const diff = calculateDifference();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-lg"
          />
        </div>

        {diff && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-black mb-4">Time Difference</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-black">{diff.days}</div>
                <div className="text-sm text-gray-500 mt-1">Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-black">{diff.weeks}</div>
                <div className="text-sm text-gray-500 mt-1">Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-black">{diff.months}</div>
                <div className="text-sm text-gray-500 mt-1">Months</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-black">{diff.years}</div>
                <div className="text-sm text-gray-500 mt-1">Years</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
