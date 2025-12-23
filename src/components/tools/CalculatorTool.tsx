import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

export const CalculatorTool: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '%': return a % b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '%', '+']
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        {/* Display */}
        <div className="bg-white rounded-lg p-4 text-right border border-gray-200">
          <div className="text-sm text-gray-400 h-6">
            {previousValue !== null && operation && `${previousValue} ${operation}`}
          </div>
          <div className="text-4xl font-bold text-black truncate">{display}</div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((row, i) => (
            row.map((btn) => (
              <Button
                key={btn}
                onClick={() => {
                  if (btn === '.') handleDecimal();
                  else if (['+', '-', '×', '÷', '%'].includes(btn)) handleOperation(btn);
                  else handleNumber(btn);
                }}
                variant="outline"
                className="h-14 text-xl font-semibold hover:bg-gray-100"
              >
                {btn}
              </Button>
            ))
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-14 text-lg font-semibold bg-red-50 hover:bg-red-100 text-red-600"
          >
            C
          </Button>
          <Button
            onClick={handleBackspace}
            variant="outline"
            className="h-14 text-lg font-semibold hover:bg-gray-100"
          >
            <Delete className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleEquals}
            className="h-14 text-lg font-semibold bg-black text-white hover:bg-gray-800"
          >
            =
          </Button>
        </div>
      </div>
    </div>
  );
};
