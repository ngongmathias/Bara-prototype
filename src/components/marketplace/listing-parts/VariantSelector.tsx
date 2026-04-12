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
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('marketplace_listing_variants')
        .select('*')
        .eq('listing_id', listingId)
        .order('sort_order', { ascending: true });
      if (!cancelled) {
        setVariants(data || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  // Extract unique dimension keys
  const dimensionKeys = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes || {})))
  );

  const dimensionValues: Record<string, string[]> = {};
  dimensionKeys.forEach((key) => {
    const values = Array.from(
      new Set(variants.map((v) => v.attributes?.[key]).filter(Boolean))
    );
    if (values.length > 0) dimensionValues[key] = values;
  });

  // Find matching variant based on selected attributes
  useEffect(() => {
    if (variants.length === 0) {
      setSelectedVariant(null);
      onVariantSelect?.(null);
      return;
    }
    const match = variants.find((v) =>
      dimensionKeys.every(
        (key) => !selectedAttrs[key] || v.attributes?.[key] === selectedAttrs[key]
      )
    );
    const resolved =
      dimensionKeys.every((k) => !!selectedAttrs[k]) ? match || null : null;
    setSelectedVariant(resolved);
    onVariantSelect?.(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttrs, variants]);

  if (loading || variants.length === 0) return null;

  const handleSelect = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
    }));
  };

  const isValueAvailable = (key: string, value: string) => {
    return variants.some(
      (v) =>
        v.attributes?.[key] === value &&
        v.is_available &&
        v.quantity > v.quantity_sold
    );
  };

  const displayPrice = selectedVariant?.price_override ?? basePrice;
  const inStock = selectedVariant
    ? selectedVariant.quantity - selectedVariant.quantity_sold
    : null;

  // Friendly label mapping
  const friendlyLabel = (key: string) => {
    const map: Record<string, string> = {
      size: 'Available Sizes',
      color: 'Available Colors',
      storage: 'Storage Options',
      option: 'Options',
      material: 'Materials',
      package: 'Packages',
    };
    return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="space-y-4">
      {Object.entries(dimensionValues).map(([key, values]) => (
        <div key={key}>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {friendlyLabel(key)}:{' '}
            {selectedAttrs[key] && (
              <span className="text-gray-900 font-semibold">{selectedAttrs[key]}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedAttrs[key] === value;
              const available = isValueAvailable(key, value);
              return (
                <button
                  key={value}
                  type="button"
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
            <span className="text-sm text-green-600 font-medium">
              {inStock} in stock
            </span>
          )}
          {inStock !== null && inStock <= 0 && (
            <span className="text-sm text-red-600 font-medium">Out of stock</span>
          )}
        </div>
      )}
    </div>
  );
};
