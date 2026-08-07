import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, Star, Upload, AlertCircle } from 'lucide-react';
import { validateImage } from '@/utils/imageOptimization';

/**
 * A photo in the editor, whether it is already stored or was just picked.
 *
 * Keeping both in one ordered list is what makes reordering work at all: a
 * seller reordering photos does not think in terms of "saved" versus "new",
 * and if the two were held separately every newly-added photo would be stuck
 * at the end.
 */
export type EditableImage =
  | { kind: 'existing'; id: string; url: string }
  | { kind: 'new'; file: File; url: string };

interface ListingImageManagerProps {
  images: EditableImage[];
  onChange: (next: EditableImage[]) => void;
  maxImages?: number;
  /** Per-index upload state while saving: -1 failed, 0..1 progress. */
  uploadProgress?: Record<number, number>;
  disabled?: boolean;
  onError?: (message: string) => void;
}

/**
 * Add, remove, reorder and pick a primary photo.
 *
 * Reordering uses explicit move-left/move-right buttons rather than drag and
 * drop. Most of this platform's traffic is mobile, where dragging a thumbnail
 * inside a scrolling form fights the scroll gesture, and drag targets are also
 * invisible to keyboard and screen-reader users.
 *
 * The first photo is the primary one — it is what appears in search results
 * and category grids — so it is labelled rather than left implicit.
 */
export const ListingImageManager: React.FC<ListingImageManagerProps> = ({
  images,
  onChange,
  maxImages = 10,
  uploadProgress,
  disabled = false,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const room = maxImages - images.length;

    if (files.length > room) {
      onError?.(
        room === 0
          ? `You already have the maximum of ${maxImages} photos.`
          : `You can add ${room} more photo${room === 1 ? '' : 's'} — the limit is ${maxImages}.`
      );
    }

    const accepted: EditableImage[] = [];
    for (const file of files.slice(0, Math.max(0, room))) {
      const problem = validateImage(file);
      if (problem !== true) {
        onError?.(`${file.name}: ${problem}`);
        continue;
      }
      accepted.push({ kind: 'new', file, url: URL.createObjectURL(file) });
    }

    if (accepted.length) onChange([...images, ...accepted]);

    // Let the same file be picked again after a removal.
    e.target.value = '';
  };

  const remove = (index: number) => {
    const target = images[index];
    // Only object URLs we created need revoking; stored images are plain URLs.
    if (target.kind === 'new') URL.revokeObjectURL(target.url);
    onChange(images.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  const makePrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 font-roboto">
          Photos *
        </label>
        <span className="text-xs text-gray-500 font-roboto">
          {images.length} of {maxImages}
        </span>
      </div>

      {images.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-gray-600 mb-3 font-roboto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          A listing needs at least one photo.
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {images.map((image, index) => (
            <div
              key={image.kind === 'existing' ? image.id : `new-${index}-${image.file.name}`}
              className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
            >
              <img
                src={image.url}
                alt={`Listing photo ${index + 1}`}
                className="w-full h-28 object-cover"
              />

              {index === 0 && (
                <div className="absolute top-0 inset-x-0 bg-black text-white text-[10px] font-bold px-2 py-1 text-center font-roboto">
                  MAIN PHOTO
                </div>
              )}

              {/* Upload state, shown only while saving. */}
              {uploadProgress?.[index] !== undefined && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-roboto">
                  {uploadProgress[index] === -1 ? (
                    <span className="text-gray-900 font-bold">Failed</span>
                  ) : uploadProgress[index] >= 1 ? (
                    <span className="text-gray-900">Uploaded</span>
                  ) : (
                    <span className="text-gray-600">Uploading…</span>
                  )}
                </div>
              )}

              {!disabled && (
                <div className="absolute bottom-0 inset-x-0 flex items-stretch bg-black/70 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move photo ${index + 1} earlier`}
                    className="flex-1 py-1.5 text-white disabled:opacity-30 flex justify-center"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => makePrimary(index)}
                    disabled={index === 0}
                    aria-label={`Make photo ${index + 1} the main photo`}
                    className="flex-1 py-1.5 text-white disabled:opacity-30 flex justify-center"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label={`Move photo ${index + 1} later`}
                    className="flex-1 py-1.5 text-white disabled:opacity-30 flex justify-center"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="w-3 h-3 text-gray-900" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || images.length >= maxImages}
        className="w-full sm:w-auto"
      >
        <Upload className="w-4 h-4 mr-2" />
        Add photos
      </Button>
      <p className="text-xs text-gray-500 mt-2 font-roboto">
        JPEG, PNG, WebP, GIF or iPhone photos. The main photo is what buyers see first.
      </p>
    </div>
  );
};

export default ListingImageManager;
