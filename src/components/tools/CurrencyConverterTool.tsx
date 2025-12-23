import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CurrencyConverterTool: React.FC = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');

  const africanCurrencies = [
    { code: 'USD', name: 'US Dollar', rate: 1 },
    { code: 'NGN', name: 'Nigerian Naira', rate: 1550 },
    { code: 'GHS', name: 'Ghanaian Cedi', rate: 15.5 },
    { code: 'KES', name: 'Kenyan Shilling', rate: 155 },
    { code: 'ZAR', name: 'South African Rand', rate: 18.5 },
    { code: 'EGP', name: 'Egyptian Pound', rate: 49 },
    { code: 'RWF', name: 'Rwandan Franc', rate: 1350 },
    { code: 'TZS', name: 'Tanzanian Shilling', rate: 2600 },
    { code: 'UGX', name: 'Ugandan Shilling', rate: 3700 },
    { code: 'ETB', name: 'Ethiopian Birr', rate: 125 },
    { code: 'MAD', name: 'Moroccan Dirham', rate: 10 },
    { code: 'XOF', name: 'West African CFA Franc', rate: 620 },
    { code: 'XAF', name: 'Central African CFA Franc', rate: 620 }
  ];

  const convert = () => {
    const fromRate = africanCurrencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = africanCurrencies.find(c => c.code === toCurrency)?.rate || 1;
    const amountNum = parseFloat(amount) || 0;
    return ((amountNum / fromRate) * toRate).toFixed(2);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="text-lg"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {africanCurrencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            onClick={swapCurrencies}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold">
              {convert()}
            </div>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {africanCurrencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result Display */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-black text-black">
              {amount} {fromCurrency} = {convert()} {toCurrency}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Exchange rates are approximate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
