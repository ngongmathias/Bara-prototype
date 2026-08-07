// Central feature flags.
//
// Paid music is deferred: until real payments (cash-backed coins / Stripe) exist,
// every song streams in full for free and the price + purchase/preview UI is
// hidden. The pricing columns and purchase plumbing are kept intact, so flipping
// this back to `true` restores paid music with no rework.
export const PAID_MUSIC_ENABLED = false;

// Coin-based sports predictions are paused pending a compliance/economy review
// (betting mechanics). Flip to true to re-enable.
export const SPORTS_BETTING_ENABLED = false;

// The multi-seller cart is hidden until payments land (Phase 15).
//
// It was never finished: the summary told the buyer "each seller will receive a
// separate purchase request", but the CTA only navigated to My Purchases — no
// transaction was created and no seller was ever contacted. Rather than ship a
// checkout that cannot charge anyone, the entry points are hidden and single-item
// "Buy Now" (which does create a real `marketplace_transactions` row) carries the
// flow. CartPage, CartContext and the cart route are all left intact, so flipping
// this to `true` alongside the payment work restores it.
export const MARKETPLACE_CART_ENABLED = false;
