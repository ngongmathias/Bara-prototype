import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export const MarketplaceNav = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[64px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/marketplace')}
              className="hover:text-blue-600 font-medium"
            >
              Marketplace
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/marketplace/favorites')}
              className="relative"
              title="My Favorites"
            >
              <Heart className="w-5 h-5" />
              <span className="ml-1 hidden sm:inline">Favorites</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/marketplace/cart')}
              className="relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <span className="ml-1 hidden sm:inline">Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
