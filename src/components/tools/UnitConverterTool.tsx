import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const UnitConverterTool: React.FC = () => {
  const [value, setValue] = useState('1');
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');

  const units = {
    length: {
      meter: { name: 'Meter', factor: 1 },
      kilometer: { name: 'Kilometer', factor: 0.001 },
      centimeter: { name: 'Centimeter', factor: 100 },
      mile: { name: 'Mile', factor: 0.000621371 },
      yard: { name: 'Yard', factor: 1.09361 },
      foot: { name: 'Foot', factor: 3.28084 },
      inch: { name: 'Inch', factor: 39.3701 }
    },
    weight: {
      kilogram: { name: 'Kilogram', factor: 1 },
      gram: { name: 'Gram', factor: 1000 },
      pound: { name: 'Pound', factor: 2.20462 },
      ounce: { name: 'Ounce', factor: 35.274 },
      ton: { name: 'Metric Ton', factor: 0.001 }
    },
    volume: {
      liter: { name: 'Liter', factor: 1 },
      milliliter: { name: 'Milliliter', factor: 1000 },
      gallon: { name: 'Gallon (US)', factor: 0.264172 },
      quart: { name: 'Quart', factor: 1.05669 },
      cup: { name: 'Cup', factor: 4.22675 }
    }
  };

  const convert = () => {
    const val = parseFloat(value) || 0;
    const categoryUnits = units[category as keyof typeof units];
    const fromFactor = categoryUnits[fromUnit as keyof typeof categoryUnits]?.factor || 1;
    const toFactor = categoryUnits[toUnit as keyof typeof categoryUnits]?.factor || 1;
    return (val * (toFactor / fromFactor)).toFixed(4);
  };

  const currentUnits = units[category as keyof typeof units];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Tabs value={category} onValueChange={(val) => {
        setCategory(val);
        const newUnits = Object.keys(units[val as keyof typeof units]);
        setFromUnit(newUnits[0]);
        setToUnit(newUnits[1] || newUnits[0]);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="length">Length</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>

        <TabsContent value={category} className="space-y-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Value"
                  className="text-lg"
                />
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currentUnits).map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        {unit.name}
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
                    {Object.entries(currentUnits).map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-black text-black">
                {value} {currentUnits[fromUnit as keyof typeof currentUnits]?.name} = {convert()} {currentUnits[toUnit as keyof typeof currentUnits]?.name}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
