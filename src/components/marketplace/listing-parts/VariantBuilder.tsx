import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Package } from 'lucide-react';
import type { VariantDimension } from '@/config/categoryFieldConfigs';

export interface VariantRow {
  label: string;
  attributes: Record<string, string>;
  price_override: string; // empty = use base price
  quantity: string;
  image_url: string;
}

interface VariantBuilderProps {
  dimensions: VariantDimension[];
  variants: VariantRow[];
  onVariantsChange: (variants: VariantRow[]) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const friendlyDimLabel = (key: string, label: string): string => {
  const map: Record<string, string> = {
    size: 'Available Sizes',
    color: 'Available Colors',
    storage: 'Storage Options',
    material: 'Material Options',
  };
  return map[key] || label;
};

export const VariantBuilder: React.FC<VariantBuilderProps> = ({
  dimensions,
  variants,
  onVariantsChange,
  enabled,
  onEnabledChange,
}) => {
  const [dimValues, setDimValues] = useState<Record<string, string[]>>({});
  const [customInput, setCustomInput] = useState<Record<string, string>>({});

  useEffect(() => {
    const init: Record<string, string[]> = {};
    dimensions.forEach((d) => {
      init[d.key] = [];
    });
    setDimValues(init);
  }, [dimensions]);

  const togglePreset = (key: string, value: string) => {
    setDimValues((prev) => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const addCustomValue = (key: string) => {
    const value = customInput[key]?.trim();
    if (!value) return;
    setDimValues((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) return prev;
      return { ...prev, [key]: [...current, value] };
    });
    setCustomInput((prev) => ({ ...prev, [key]: '' }));
  };

  const generateVariants = () => {
    const activeDims = dimensions.filter((d) => (dimValues[d.key] || []).length > 0);
    if (activeDims.length === 0) return;

    // Cartesian product
    const combos: Record<string, string>[] = [{}];
    for (const dim of activeDims) {
      const values = dimValues[dim.key];
      const newCombos: Record<string, string>[] = [];
      for (const combo of combos) {
        for (const val of values) {
          newCombos.push({ ...combo, [dim.key]: val });
        }
      }
      combos.length = 0;
      combos.push(...newCombos);
    }

    const newVariants: VariantRow[] = combos.map((attrs) => ({
      label: Object.values(attrs).join(' / '),
      attributes: attrs,
      price_override: '',
      quantity: '1',
      image_url: '',
    }));

    onVariantsChange(newVariants);
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const removeVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  const setAllQuantity = (qty: string) => {
    onVariantsChange(variants.map((v) => ({ ...v, quantity: qty })));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 font-comfortaa">
            Multiple Items / Options
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {enabled ? 'Yes, I have options' : 'Single item'}
          </span>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
      </div>

      {!enabled && (
        <p className="text-sm text-gray-500">
          Turn this on if you have multiple of the same item (e.g. different sizes, colors, or quantities).
        </p>
      )}

      {enabled && (
        <div className="space-y-6">
          {/* Dimension value pickers */}
          {dimensions.map((dim) => (
            <div key={dim.key}>
              <Label className="text-sm font-medium">{friendlyDimLabel(dim.key, dim.label)}</Label>
              <p className="text-xs text-gray-500 mb-2">
                Pick which {dim.label.toLowerCase()} options you have, or type your own
              </p>

              {dim.presets && dim.presets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {dim.presets.map((preset) => {
                    const selected = (dimValues[dim.key] || []).includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => togglePreset(dim.key, preset)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          selected
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={customInput[dim.key] || ''}
                  onChange={(e) =>
                    setCustomInput((prev) => ({ ...prev, [dim.key]: e.target.value }))
                  }
                  placeholder={`Type a custom ${dim.label.toLowerCase()} and press Enter...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomValue(dim.key);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCustomValue(dim.key)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Show selected custom values */}
              {(dimValues[dim.key] || []).filter(
                (v) => !dim.presets?.includes(v)
              ).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(dimValues[dim.key] || [])
                    .filter((v) => !dim.presets?.includes(v))
                    .map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-900"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => togglePreset(dim.key, v)}
                          className="ml-1 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}

          {/* Generate button */}
          <Button type="button" variant="default" onClick={generateVariants} className="w-full">
            Create Options
            {Object.values(dimValues).some((v) => v.length > 0) && (
              <span className="ml-2 text-xs opacity-75">
                ({Object.values(dimValues).reduce((acc, v) => acc * Math.max(v.length, 1), 1)}{' '}
                combinations)
              </span>
            )}
          </Button>

          {/* Variant rows */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">
                  {variants.length} Option{variants.length > 1 ? 's' : ''}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Set all quantities:</span>
                  <Input
                    type="number"
                    min="0"
                    className="w-20 h-8 text-sm"
                    placeholder="Qty"
                    onChange={(e) => setAllQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_100px_80px_40px] gap-2 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <span>Option</span>
                  <span>Special Price</span>
                  <span>In Stock</span>
                  <span></span>
                </div>
                {variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_100px_80px_40px] gap-2 px-3 py-2 border-t items-center"
                  >
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {variant.label}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price_override}
                      onChange={(e) => updateVariant(idx, 'price_override', e.target.value)}
                      placeholder="Same"
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={variant.quantity}
                      onChange={(e) => updateVariant(idx, 'quantity', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                "Special Price" — leave blank to use the same price as above. Only fill in if a specific option costs more or less.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
