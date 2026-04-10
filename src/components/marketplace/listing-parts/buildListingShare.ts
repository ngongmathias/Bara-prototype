/**
 * Builds the payload for the global ShareDialog (useShare hook) from a
 * marketplace listing. Kept as a plain function (not a hook) so each page
 * can still call openShare() inline and add category-specific description
 * tweaks if it wants to.
 */
export function buildListingShare(listing: any) {
  const priceLabel =
    listing?.price != null
      ? `${listing.currency || ''} ${parseFloat(listing.price).toLocaleString()}`.trim()
      : '';
  const locationLabel = listing?.country?.name || '';
  const fallbackDescription = [priceLabel, locationLabel].filter(Boolean).join(' — ');

  return {
    url: `${window.location.origin}/marketplace/ad/${listing.id}`,
    title: listing.title,
    description:
      listing.description?.slice(0, 160) || fallbackDescription || undefined,
    imageUrl:
      listing.images?.[0]?.image_url ||
      listing.marketplace_listing_images?.[0]?.image_url,
  };
}
