import React from 'react';
import { LucideIcon, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Suggestion {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  searchQuery?: string;
  suggestions?: Suggestion[];
  onClearFilters?: () => void;
  showBrowseCategories?: boolean;
  browseCategoriesHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  searchQuery,
  suggestions = [],
  onClearFilters,
  showBrowseCategories = false,
  browseCategoriesHref,
}) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 font-comfortaa">
        {title}
      </h3>

      {searchQuery && (
        <p className="text-gray-500 text-sm mb-1 font-roboto">
          for "<span className="font-medium text-gray-700">{searchQuery}</span>"
        </p>
      )}

      {description && (
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 font-roboto">
          {description}
        </p>
      )}

      {!description && !searchQuery && (
        <div className="mb-6" />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Clear All Filters
          </Button>
        )}

        {showBrowseCategories && browseCategoriesHref && (
          <Button
            variant="default"
            onClick={() => navigate(browseCategoriesHref)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Browse Categories
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-8 max-w-sm mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Try instead
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  if (s.onClick) s.onClick();
                  else if (s.href) navigate(s.href);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors font-medium"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
