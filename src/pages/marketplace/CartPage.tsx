import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, count } = useCart();

  // Group items by seller
  const bySeller = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.seller_user_id || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const currency = items[0]?.currency || 'USD';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black font-comfortaa">Shopping Cart</h1>
              <p className="text-gray-600 font-roboto mt-1">
                {count} {count === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {items.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-1" /> Clear Cart
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/marketplace')} variant="outline">
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(bySeller).map(([sellerId, sellerItems]) => (
                <div key={sellerId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                    Seller #{sellerId.slice(-6)}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {sellerItems.map((item) => (
                      <div
                        key={`${item.listing_id}-${item.variant_id}`}
                        className="flex gap-4 p-4"
                      >
                        <img
                          src={item.image_url || '/placeholder.jpg'}
                          alt={item.title || 'Item'}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/marketplace/ad/${item.listing_id}`)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium text-gray-900 truncate cursor-pointer hover:underline"
                            onClick={() => navigate(`/marketplace/ad/${item.listing_id}`)}
                          >
                            {item.title || 'Item'}
                          </h3>
                          {item.variant_label && (
                            <p className="text-xs text-gray-500">{item.variant_label}</p>
                          )}
                          <div className="text-blue-600 font-bold mt-1">
                            {item.currency} {(item.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.listing_id, item.variant_id, item.quantity - 1)
                              }
                              className="p-1.5 hover:bg-gray-100 rounded-l-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.listing_id, item.variant_id, item.quantity + 1)
                              }
                              className="p-1.5 hover:bg-gray-100 rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.listing_id, item.variant_id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {currency} {total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Items from {Object.keys(bySeller).length} seller{Object.keys(bySeller).length > 1 ? 's' : ''}. Each seller will receive a separate purchase request.
                </p>
                <Button
                  onClick={() => navigate('/marketplace/my-purchases')}
                  className="w-full bg-black hover:bg-gray-800 text-white h-12 font-semibold"
                >
                  Contact Sellers <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
