import React, { useState } from 'react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Filter, 
  Grid3x3, 
  List, 
  Star,
  TrendingUp,
  Package,
  Truck,
  Shield,
  ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MarketplacePage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItemsCount] = useState(0);

  // Mock data for demonstration
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports & Outdoors' },
    { id: 'books', name: 'Books' },
    { id: 'toys', name: 'Toys & Games' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Wireless Headphones Pro',
      price: 199.99,
      originalPrice: 299.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      rating: 4.5,
      reviews: 128,
      discount: 33,
      inStock: true,
      tag: 'Best Seller'
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      price: 349.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      rating: 4.8,
      reviews: 245,
      discount: null,
      inStock: true,
      tag: 'New Arrival'
    },
    {
      id: 3,
      name: 'Premium Backpack',
      price: 79.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      rating: 4.3,
      reviews: 89,
      discount: 38,
      inStock: true,
      tag: 'Hot Deal'
    },
    {
      id: 4,
      name: 'Coffee Maker Deluxe',
      price: 149.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop',
      rating: 4.6,
      reviews: 156,
      discount: null,
      inStock: true,
      tag: 'Trending'
    },
    {
      id: 5,
      name: 'Fitness Tracker Band',
      price: 59.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop',
      rating: 4.2,
      reviews: 201,
      discount: 40,
      inStock: true,
      tag: 'Best Value'
    },
    {
      id: 6,
      name: 'Designer Sunglasses',
      price: 129.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
      rating: 4.7,
      reviews: 76,
      discount: null,
      inStock: false,
      tag: 'Limited Stock'
    },
  ];

  const ProductCard = ({ product }: { product: typeof featuredProducts[0] }) => (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            -{product.discount}%
          </Badge>
        )}
        {product.tag && (
          <Badge className="absolute top-3 right-3 bg-brand-blue text-white">
            {product.tag}
          </Badge>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviews})</span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          )}
        </div>
        
        {product.inStock ? (
          <Badge variant="outline" className="mb-3 text-green-600 border-green-600">
            In Stock
          </Badge>
        ) : (
          <Badge variant="outline" className="mb-3 text-red-600 border-red-600">
            Out of Stock
          </Badge>
        )}
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-brand-blue hover:bg-brand-blue-hover"
            disabled={!product.inStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-white font-roboto">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* White overlay */}
      <div className="absolute inset-0 bg-white/80 pointer-events-none" />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Top Banner Ad */}
      <div className="relative z-10">
        <TopBannerAd />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Title and Search */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-comfortaa font-bold text-black mb-6">
            Marketplace
          </h1>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search for products..."
                className="pl-12 h-14 text-base border-gray-300 focus:border-black focus:ring-black rounded-xl shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters and View Options */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Badge variant="secondary" className="text-sm">
              {featuredProducts.length} products found
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            
            {/* Cart Icon */}
            <Button variant="outline" className="relative ml-4">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Hand-picked items just for you</p>
            </div>
            <Button variant="link" className="text-brand-blue">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Trending Now Section */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-brand-blue" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-gray-600">Most popular products this week</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(1, 7).map((cat) => (
              <Button 
                key={cat.id} 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-blue-600 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Become a Seller Today!
          </h2>
          <p className="text-lg mb-6 text-purple-100">
            Start selling your products to millions of customers worldwide
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Selling
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>

      </main>
      
      {/* Bottom Banner Ad */}
      <div className="relative z-10">
        <BottomBannerAd />
      </div>

      <Footer />
    </div>
  );
};

export default MarketplacePage;
