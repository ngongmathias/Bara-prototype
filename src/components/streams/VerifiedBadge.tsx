import { Check } from 'lucide-react';

/**
 * Verified-artist badge (Phase 17.4.1): a filled black circle with a white
 * checkmark. No colored rings — design system is black/white/gray only.
 * Use on a dark surface via `variant="onDark"` to flip to white/black.
 */
export function VerifiedBadge({
  size = 16,
  variant = 'default',
  className = '',
  title = 'Verified artist',
}: {
  size?: number;
  variant?: 'default' | 'onDark';
  className?: string;
  title?: string;
}) {
  const colors = variant === 'onDark' ? 'bg-white text-black' : 'bg-gray-900 text-white';
  return (
    <span
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center rounded-full flex-shrink-0 ${colors} ${className}`}
      style={{ width: size, height: size }}
    >
      <Check size={Math.round(size * 0.62)} strokeWidth={3.5} />
    </span>
  );
}
