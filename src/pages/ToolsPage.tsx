import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Compass, 
  Clock, 
  DollarSign, 
  Ruler, 
  QrCode,
  Thermometer,
  Calendar,
  Hash,
  Globe
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalculatorTool } from '@/components/tools/CalculatorTool';
import { CompassTool } from '@/components/tools/CompassTool';
import { WorldClockTool } from '@/components/tools/WorldClockTool';
import { CurrencyConverterTool } from '@/components/tools/CurrencyConverterTool';
import { UnitConverterTool } from '@/components/tools/UnitConverterTool';
import { QRGeneratorTool } from '@/components/tools/QRGeneratorTool';
import { TemperatureConverterTool } from '@/components/tools/TemperatureConverterTool';
import { DateCalculatorTool } from '@/components/tools/DateCalculatorTool';
import { HashGeneratorTool } from '@/components/tools/HashGeneratorTool';
import { CountryCompareTool } from '@/components/tools/CountryCompareTool';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'calculation' | 'conversion' | 'utility' | 'africa';
}

export const ToolsPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const tools: Tool[] = [
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'Basic and scientific calculator',
      icon: <Calculator className="w-8 h-8" />,
      component: <CalculatorTool />,
      category: 'calculation'
    },
    {
      id: 'compass',
      name: 'Compass',
      description: 'Digital compass with direction finder',
      icon: <Compass className="w-8 h-8" />,
      component: <CompassTool />,
      category: 'utility'
    },
    {
      id: 'world-clock',
      name: 'World Clock',
      description: 'View time across African countries',
      icon: <Clock className="w-8 h-8" />,
      component: <WorldClockTool />,
      category: 'africa'
    },
    {
      id: 'currency-converter',
      name: 'Currency Converter',
      description: 'Convert between African currencies',
      icon: <DollarSign className="w-8 h-8" />,
      component: <CurrencyConverterTool />,
      category: 'conversion'
    },
    {
      id: 'unit-converter',
      name: 'Unit Converter',
      description: 'Convert length, weight, volume, etc.',
      icon: <Ruler className="w-8 h-8" />,
      component: <UnitConverterTool />,
      category: 'conversion'
    },
    {
      id: 'qr-generator',
      name: 'QR Code Generator',
      description: 'Create QR codes instantly',
      icon: <QrCode className="w-8 h-8" />,
      component: <QRGeneratorTool />,
      category: 'utility'
    },
    {
      id: 'temperature',
      name: 'Temperature Converter',
      description: 'Convert Celsius, Fahrenheit, Kelvin',
      icon: <Thermometer className="w-8 h-8" />,
      component: <TemperatureConverterTool />,
      category: 'conversion'
    },
    {
      id: 'date-calculator',
      name: 'Date Calculator',
      description: 'Calculate days between dates',
      icon: <Calendar className="w-8 h-8" />,
      component: <DateCalculatorTool />,
      category: 'calculation'
    },
    {
      id: 'hash-generator',
      name: 'Hash Generator',
      description: 'Generate MD5, SHA-1, SHA-256 hashes',
      icon: <Hash className="w-8 h-8" />,
      component: <HashGeneratorTool />,
      category: 'utility'
    },
    {
      id: 'country-compare',
      name: 'Country Compare',
      description: 'Compare African countries side-by-side',
      icon: <Globe className="w-8 h-8" />,
      component: <CountryCompareTool />,
      category: 'africa'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'calculation', label: 'Calculation' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'utility', label: 'Utility' },
    { id: 'africa', label: 'Africa-Focused' }
  ];

  const filteredTools = categoryFilter === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === categoryFilter);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6">Bara Tools</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful mini apps to help you calculate, convert, and explore. All free, all simple.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelectedTool(tool)}
              className="group cursor-pointer border border-gray-200 rounded-2xl p-6 hover:border-black transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-1">{tool.name}</h3>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No tools found in this category</p>
          </div>
        )}
      </section>

      {/* Tool Dialog */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedTool?.icon}
              {selectedTool?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedTool?.component}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
