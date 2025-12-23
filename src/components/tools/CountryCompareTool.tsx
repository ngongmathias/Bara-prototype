import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  code: string;
  population?: number;
  capital?: string;
}

interface CountryInfo {
  population?: number;
  capital?: string;
  area_sq_km?: number;
  gdp_usd?: number;
  life_expectancy?: number;
  literacy_rate?: number;
  currency?: string;
  language?: string;
}

export const CountryCompareTool: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [country1, setCountry1] = useState<string>('');
  const [country2, setCountry2] = useState<string>('');
  const [info1, setInfo1] = useState<CountryInfo | null>(null);
  const [info2, setInfo2] = useState<CountryInfo | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (country1) fetchCountryInfo(country1, setInfo1);
  }, [country1]);

  useEffect(() => {
    if (country2) fetchCountryInfo(country2, setInfo2);
  }, [country2]);

  const fetchCountries = async () => {
    const { data } = await supabase.from('countries').select('id, name, code, population, capital').eq('is_active', true).order('name');
    if (data) setCountries(data);
  };

  const fetchCountryInfo = async (countryId: string, setter: (info: CountryInfo) => void) => {
    const { data } = await supabase.from('country_info').select('*').eq('country_id', countryId).single();
    if (data) setter(data);
  };

  const formatNumber = (num?: number) => {
    if (!num) return '—';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toString();
  };

  const comparisonFields = [
    { label: 'Population', key: 'population', format: formatNumber },
    { label: 'Capital', key: 'capital', format: (v: any) => v || '—' },
    { label: 'Area (km²)', key: 'area_sq_km', format: formatNumber },
    { label: 'GDP (USD)', key: 'gdp_usd', format: (v: any) => v ? `$${formatNumber(v)}` : '—' },
    { label: 'Life Expectancy', key: 'life_expectancy', format: (v: any) => v ? `${v} years` : '—' },
    { label: 'Literacy Rate', key: 'literacy_rate', format: (v: any) => v ? `${v}%` : '—' },
    { label: 'Currency', key: 'currency', format: (v: any) => v || '—' },
    { label: 'Language', key: 'language', format: (v: any) => v || '—' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <Select value={country1} onValueChange={setCountry1}>
          <SelectTrigger>
            <SelectValue placeholder="Select first country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-gray-400" />
        </div>

        <Select value={country2} onValueChange={setCountry2}>
          <SelectTrigger>
            <SelectValue placeholder="Select second country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {info1 && info2 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="space-y-4">
            {comparisonFields.map(field => (
              <div key={field.key} className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 pb-3">
                <div className="text-right font-semibold text-black">
                  {field.format((info1 as any)[field.key])}
                </div>
                <div className="text-center text-sm text-gray-500 font-medium">
                  {field.label}
                </div>
                <div className="text-left font-semibold text-black">
                  {field.format((info2 as any)[field.key])}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!country1 || !country2) && (
        <div className="text-center py-12 text-gray-400">
          Select two countries to compare
        </div>
      )}
    </div>
  );
};
