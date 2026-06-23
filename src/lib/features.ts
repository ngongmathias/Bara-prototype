// Central feature flags.
//
// Paid music is deferred: until real payments (cash-backed coins / Stripe) exist,
// every song streams in full for free and the price + purchase/preview UI is
// hidden. The pricing columns and purchase plumbing are kept intact, so flipping
// this back to `true` restores paid music with no rework.
export const PAID_MUSIC_ENABLED = false;
