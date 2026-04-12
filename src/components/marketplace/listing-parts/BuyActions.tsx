import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CheckCircle, Minus, Plus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { VariantSelector, Variant } from './VariantSelector';
import { BuyNowModal } from './BuyNowModal';

/**
 * Shared purchase actions block for all marketplace detail pages.
 * Renders: VariantSelector (hidden if no variants) + Quantity + Add to Cart + Buy Now.
 *
 * Drop this into any detail page where buyers can purchase or cart an item.
 * For non-cartable categories (Property, Motors, Jobs, Services, Businesses, Pets)
 * pass `cartable={false}` to hide Add to Cart.
 */
interface BuyActionsProps {
  listing: any;
  cartable?: boolean;
  buyable?: boolean;
}

export const BuyActions: React.FC<BuyActionsProps> = ({
  listing,
  cartable = true,
  buyable = true,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showBuyNow, setShowBuyNow] = useState(false);

  if (!listing || listing.status !== 'active') return null;
  if (user?.id === listing.created_by) return null;

  const price = selectedVariant?.price_override ?? parseFloat(listing.price) ?? 0;
  const image =
    listing.marketplace_listing_images?.find((i: any) => i.is_primary)?.image_url ||
    listing.marketplace_listing_images?.[0]?.image_url;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/user/sign-up?redirect_url=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      await addToCart({
        listing_id: listing.id,
        variant_id: selectedVariant?.id || null,
        quantity,
        title: listing.title,
        price,
        currency: listing.currency,
        image_url: image,
        variant_label: selectedVariant?.label,
        seller_user_id: listing.created_by,
      });
      toast({ title: 'Added to cart', description: listing.title });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/user/sign-up?redirect_url=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setShowBuyNow(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Variant selector (hidden if no variants) */}
        <VariantSelector
          listingId={listing.id}
          basePrice={parseFloat(listing.price) || 0}
          currency={listing.currency}
          onVariantSelect={setSelectedVariant}
        />

        {/* Quantity stepper (only if cartable) */}
        {cartable && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-gray-100 rounded-l-lg"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 hover:bg-gray-100 rounded-r-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {buyable && (
            <Button
              onClick={handleBuyNow}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Buy Now
            </Button>
          )}
          {cartable && (
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full h-12 border-blue-600 text-blue-700 hover:bg-blue-50"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>

      {showBuyNow && (
        <BuyNowModal
          listing={listing}
          selectedVariant={selectedVariant}
          onClose={() => setShowBuyNow(false)}
        />
      )}
    </>
  );
};
