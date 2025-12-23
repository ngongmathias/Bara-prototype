import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TemperatureConverterTool: React.FC = () => {
  const [value, setValue] = useState('0');
  const [fromUnit, setFromUnit] = useState('celsius');
  const [toUnit, setToUnit] = useState('fahrenheit');

  const convert = () => {
    const val = parseFloat(value) || 0;
    let celsius = val;

    if (fromUnit === 'fahrenheit') celsius = (val - 32) * 5/9;
    else if (fromUnit === 'kelvin') celsius = val - 273.15;

    let result = celsius;
    if (toUnit === 'fahrenheit') result = (celsius * 9/5) + 32;
    else if (toUnit === 'kelvin') result = celsius + 273.15;

    return result.toFixed(2);
  };

  const units = [
    { value: 'celsius', label: 'Celsius (°C)' },
    { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
    { value: 'kelvin', label: 'Kelvin (K)' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Temperature"
              className="text-lg"
            />
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold">
              {convert()}
            </div>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-black text-black">
            {value}° {fromUnit.charAt(0).toUpperCase()} = {convert()}° {toUnit.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
