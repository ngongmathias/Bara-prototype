import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { BlogCategory } from '../lib/blogService';

interface CategoryFilterProps {
  categories: BlogCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedCat = categories.find(c => c.id === selectedCategory);
  const label = selectedCat ? selectedCat.name : 'All Categories';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="mb-8 flex items-center gap-3">
      {/* Dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:border-gray-400 transition-colors shadow-sm min-w-[200px] justify-between"
        >
          <span className="flex items-center gap-2">
            {selectedCat && (
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCat.color || '#000' }} />
            )}
            {label}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30 min-w-[240px] max-h-80 overflow-y-auto">
            <button
              onClick={() => { onSelectCategory(null); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                selectedCategory === null ? 'font-bold text-black bg-gray-50' : 'text-gray-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => { onSelectCategory(category.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  selectedCategory === category.id ? 'font-bold text-black bg-gray-50' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color || '#000' }} />
                  {category.name}
                </span>
                {category.post_count > 0 && (
                  <span className="text-xs text-gray-400">({category.post_count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
