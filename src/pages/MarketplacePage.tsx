import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Grid3x3, 
  List, 
  Star
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  discount: number | null;
  inStock: boolean;
  tag: string | null;
};

const MarketplacePage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItemsCount] = useState(0);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating_desc'>('relevance');
  const [loading, setLoading] = useState(true);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

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

  const featuredProducts: Product[] = [
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
    {
      id: 7,
      name: 'Laptop Stand Aluminum',
      price: 45.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
      rating: 4.4,
      reviews: 92,
      discount: null,
      inStock: true,
      tag: null
    },
    {
      id: 8,
      name: 'Wireless Mouse',
      price: 29.99,
      originalPrice: 49.99,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
      rating: 4.1,
      reviews: 134,
      discount: 40,
      inStock: true,
      tag: null
    },
  ];

  const ProductCard = ({ product, onQuickView }: { product: Product, onQuickView: (p: Product) => void }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <Badge className="absolute top-3 left-3 bg-black text-white">
            -{product.discount}%
          </Badge>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-5 h-5 text-gray-600 hover:text-black" />
        </button>
        <button
          onClick={() => onQuickView(product)}
          className="absolute left-3 right-3 bottom-3 bg-black text-white text-sm py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Quick View
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-gray-300'}`}
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
        
        <div className="mb-3">
          {product.inStock ? (
            <Badge variant="outline" className="text-black border-black">In Stock</Badge>
          ) : (
            <Badge variant="outline" className="text-gray-600 border-gray-400">Out of Stock</Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1" disabled={!product.inStock}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Filtering
  const filteredProducts = featuredProducts.filter((p) => {
    const matchesQuery = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const price = p.price;
    const matchesMin = !minPrice || price >= parseFloat(minPrice);
    const matchesMax = !maxPrice || price <= parseFloat(maxPrice);
    const matchesRating = p.rating >= (minRating || 0);
    const matchesStock = !inStockOnly || p.inStock;
    const matchesCategory = selectedCategory === 'all'; // dataset placeholder
    return matchesQuery && matchesMin && matchesMax && matchesRating && matchesStock && matchesCategory;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating_desc':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="relative min-h-screen bg-white font-roboto">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* White overlay - match LandingPageFinal visibility */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />

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
        <div className="flex flex-col gap-4 mb-8">
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

            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Min $" className="w-28" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span className="text-gray-500">-</span>
              <Input type="number" placeholder="Max $" className="w-28" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rating</span>
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(star === minRating ? 0 : star)}
                  className={`p-1 rounded ${minRating >= star ? 'text-black' : 'text-gray-300'}`}
                  aria-label={`Minimum ${star} stars`}
                >
                  <Star className={`w-4 h-4 ${minRating >= star ? 'fill-black text-black' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              In stock only
            </label>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Rating</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>

              {/* Cart Icon */}
              <Button variant="outline" className="relative ml-4">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-black">{cartItemsCount}</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <button onClick={() => setSelectedCategory('all')} className="px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100">Category ×</button>
            )}
            {minPrice && (
              <button onClick={() => setMinPrice('')} className="px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100">Min ${minPrice} ×</button>
            )}
            {maxPrice && (
              <button onClick={() => setMaxPrice('')} className="px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100">Max ${maxPrice} ×</button>
            )}
            {minRating > 0 && (
              <button onClick={() => setMinRating(0)} className="px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100">≥ {minRating}★ ×</button>
            )}
            {inStockOnly && (
              <button onClick={() => setInStockOnly(false)} className="px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100">In stock ×</button>
            )}
            {(selectedCategory !== 'all' || minPrice || maxPrice || minRating > 0 || inStockOnly) && (
              <button onClick={() => { setSelectedCategory('all'); setMinPrice(''); setMaxPrice(''); setMinRating(0); setInStockOnly(false); }} className="px-3 py-1 rounded-full border border-gray-400 text-sm hover:bg-gray-100">Clear all</button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Products</h2>
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="h-64 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-8 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={(p) => { setQuickViewProduct(p); setQuickViewOpen(true); }} />
              ))}
              {sortedProducts.length === 0 && (
                <p className="text-gray-600">No products match your filters.</p>
              )}
            </div>
          )}
        </div>


      </main>
      
      {/* Bottom Banner Ad */}
      <div className="relative z-10">
        <BottomBannerAd />
      </div>

      <Footer />

      {/* Quick View Modal */}
      <Dialog open={quickViewOpen} onOpenChange={(open) => { setQuickViewOpen(open); if (!open) setQuickViewProduct(null); }}>
        <DialogContent className="max-w-3xl p-0">
          {quickViewProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-white">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{quickViewProduct.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold">${quickViewProduct.price}</span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${quickViewProduct.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(quickViewProduct.rating) ? 'fill-black text-black' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm text-gray-600">({quickViewProduct.reviews})</span>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1"><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</Button>
                  <Button variant="outline" className="flex-1">View Details</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplacePage;
