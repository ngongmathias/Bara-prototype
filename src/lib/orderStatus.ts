/**
 * One vocabulary for every order on BARA — marketplace, event tickets,
 * business packages and advertising.
 *
 * Payments don't exist yet (Phase 15), so people settle by mobile money or cash
 * and someone confirms it by hand. That's fine — it's how most trade here works
 * anyway. What isn't fine is the buyer not knowing what happens next: before
 * this, "Awaiting Seller" was the whole message, four different pages spelled
 * the same states differently, and ten event registrations sat pending since
 * February because nobody was ever told to act on them.
 *
 * So each status carries three things, and the third is the important one:
 *   label     — two words, same everywhere
 *   badge     — monochrome, per the platform design rule
 *   nextStep  — what happens now, in a sentence, addressed to whoever is reading
 *
 * The two axes are kept separate deliberately, mirroring the database:
 *   fulfilment (`status`)      — has the thing been handed over?
 *   payment    (`payment_status`) — has the money arrived?
 * Phase 15's webhook will flip payment automatically without touching
 * fulfilment, which is exactly why they aren't one column.
 */

export type PaymentStatus = 'pending' | 'confirmed' | 'refunded' | 'failed';

export type FulfilmentStatus =
  | 'pending_seller'
  | 'confirmed'
  | 'completed'
  | 'cancelled_buyer'
  | 'cancelled_seller'
  | 'expired';

interface StatusPresentation {
  label: string;
  badge: string;
  /** Addressed to the buyer. */
  buyerNextStep: string;
  /** Addressed to the seller / organizer / admin. */
  ownerNextStep: string;
}

const NEUTRAL = 'bg-gray-100 text-gray-700 border border-gray-200';
const ACTIVE = 'bg-gray-900 text-white';
const QUIET = 'bg-gray-50 text-gray-500 border border-gray-200';

export const PAYMENT_STATUS: Record<PaymentStatus, StatusPresentation> = {
  pending: {
    label: 'Awaiting payment',
    badge: NEUTRAL,
    buyerNextStep:
      'Contact the seller to arrange payment. They confirm here once it arrives.',
    ownerNextStep:
      'Agree payment with the buyer, then mark this as paid so they know you received it.',
  },
  confirmed: {
    label: 'Paid',
    badge: ACTIVE,
    buyerNextStep: 'Payment confirmed. Arrange collection or delivery with the seller.',
    ownerNextStep: 'Payment confirmed. Hand over the item to complete the order.',
  },
  refunded: {
    label: 'Refunded',
    badge: QUIET,
    buyerNextStep: 'This order was refunded.',
    ownerNextStep: 'This order was refunded.',
  },
  failed: {
    label: 'Payment failed',
    badge: QUIET,
    buyerNextStep: 'Payment did not go through. Contact the seller to try again.',
    ownerNextStep: 'Payment did not go through for this order.',
  },
};

export const FULFILMENT_STATUS: Record<FulfilmentStatus, StatusPresentation> = {
  pending_seller: {
    label: 'Reserved',
    badge: NEUTRAL,
    buyerNextStep: 'The seller has been notified. You can message them now if you like.',
    ownerNextStep: 'A buyer is waiting on you. Get in touch to arrange payment.',
  },
  confirmed: {
    label: 'Confirmed',
    badge: ACTIVE,
    buyerNextStep: 'The seller confirmed your order. Arrange collection or delivery.',
    ownerNextStep: 'You confirmed this order. Complete it once the buyer has the item.',
  },
  completed: {
    label: 'Completed',
    badge: ACTIVE,
    buyerNextStep: 'This order is complete.',
    ownerNextStep: 'This order is complete.',
  },
  cancelled_buyer: {
    label: 'Cancelled',
    badge: QUIET,
    buyerNextStep: 'You cancelled this order.',
    ownerNextStep: 'The buyer cancelled this order.',
  },
  cancelled_seller: {
    label: 'Declined',
    badge: QUIET,
    buyerNextStep: 'The seller could not fulfil this order.',
    ownerNextStep: 'You declined this order.',
  },
  expired: {
    label: 'Expired',
    badge: QUIET,
    buyerNextStep: 'This reservation expired without being confirmed.',
    ownerNextStep: 'This reservation expired without being confirmed.',
  },
};

/** Orders older than this with nothing happening are surfaced for chasing. */
export const STALE_AFTER_DAYS = 3;

export const isStale = (createdAt: string | Date, paymentStatus: string): boolean => {
  if (paymentStatus !== 'pending') return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
};

/** "3 days ago" — plain, for showing how long someone has been waiting. */
export const waitingFor = (createdAt: string | Date): string => {
  const ms = Date.now() - new Date(createdAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return '';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'}`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return 'less than an hour';
};

const FALLBACK: StatusPresentation = {
  label: 'Unknown',
  badge: QUIET,
  buyerNextStep: '',
  ownerNextStep: '',
};

export const paymentStatus = (value: string | null | undefined): StatusPresentation =>
  PAYMENT_STATUS[(value ?? '') as PaymentStatus] ?? FALLBACK;

export const fulfilmentStatus = (value: string | null | undefined): StatusPresentation =>
  FULFILMENT_STATUS[(value ?? '') as FulfilmentStatus] ?? FALLBACK;

/**
 * The single status worth showing on a row.
 *
 * Fulfilment wins once an order is finished or dead — "Completed" or
 * "Cancelled" is the whole story and the payment state is noise. While an order
 * is live, payment is what both sides are actually waiting on.
 */
export const primaryStatus = (
  fulfilment: string | null | undefined,
  payment: string | null | undefined
): StatusPresentation => {
  const terminal: FulfilmentStatus[] = [
    'completed',
    'cancelled_buyer',
    'cancelled_seller',
    'expired',
  ];
  if (terminal.includes((fulfilment ?? '') as FulfilmentStatus)) {
    return fulfilmentStatus(fulfilment);
  }
  return paymentStatus(payment);
};
