import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Variant {
  id: string;
  listing_id: string;
  label: string;
  attributes: Record<string, string>;
  price_override: number | null;
  quantity: number;
  quantity_sold: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

interface VariantSelectorProps {
  listingId: string;
  basePrice: number;
  currency: string;
  onVariantSelect?: (variant: Variant | null) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  listingId,
  basePrice,
  currency,
  onVariantSelect,
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('marketplace_listing_variants')
        .select('*')
        .eq('listing_id', listingId)
        .order('sort_order', { ascending: true });
      setVariants(data || []);
      setLoading(false);
    })();
  }, [listingId]);

  if (loading || variants.length === 0) return null;

  // Extract unique dimension keys from all variants
  const dimensionKeys = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes)))
  );

  // Group variants by dimension for button display
  const dimensionValues: Record<string, string[]> = {};
  dimensionKeys.forEach((key) => {
    const values = Array.from(new Set(variants.map((v) => v.attributes[key]).filter(Boolean)));
    if (values.length > 0) dimensionValues[key] = values;
  });

  // Track selected values per dimension
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  // Find matching variant based on selected attributes
  useEffect(() => {
    const match = variants.find((v) =>
      dimensionKeys.every((key) => !selectedAttrs[key] || v.attributes[key] === selectedAttrs[key])
    );
    const resolved = dimensionKeys.every((k) => !!selectedAttrs[k]) ? match || null : null;
    setSelectedVariant(resolved);
    onVariantSelect?.(resolved);
  }, [selectedAttrs, variants]);

  const handleSelect = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
    }));
  };

  const isValueAvailable = (key: string, value: string) => {
    // Check if any variant with this value is available
    return variants.some(
      (v) => v.attributes[key] === value && v.is_available && v.quantity > v.quantity_sold
    );
  };

  const displayPrice = selectedVariant?.price_override ?? basePrice;
  const inStock = selectedVariant
    ? selectedVariant.quantity - selectedVariant.quantity_sold
    : null;

  return (
    <div className="space-y-4">
      {Object.entries(dimensionValues).map(([key, values]) => (
        <div key={key}>
          <label className="text-sm font-medium text-gray-700 capitalize mb-2 block">
            {key}: {selectedAttrs[key] && <span className="text-gray-900">{selectedAttrs[key]}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedAttrs[key] === value;
              const available = isValueAvailable(key, value);
              return (
                <button
                  key={value}
                  onClick={() => handleSelect(key, value)}
                  disabled={!available}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white border-gray-900'
                      : available
                      ? 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                      : 'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <div className="flex items-center gap-4 pt-2">
          <span className="text-lg font-bold text-gray-900">
            {currency} {displayPrice.toLocaleString()}
          </span>
          {inStock !== null && inStock > 0 && (
            <span className="text-sm text-green-600 font-medium">{inStock} in stock</span>
          )}
          {inStock !== null && inStock <= 0 && (
            <span className="text-sm text-red-600 font-medium">Out of stock</span>
          )}
        </div>
      )}
    </div>
  );
};
