import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Star, ArrowLeft, Search, Grid, List, Phone, Globe, Crown, Users, Sparkles, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  images: string[] | null;
  is_premium: boolean;
  is_verified: boolean;
  is_sponsored_ad: boolean;
  has_coupons: boolean;
  is_kid_friendly: boolean;
  accepts_orders_online: boolean;
  category: { name: string; slug: string } | null;
  city: { name: string } | null;
  country: { name: string; code: string } | null;
  reviews: { rating: number }[];
}

const CategoryListingsPage = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (categorySlug && categorySlug !== 'all') {
          // Fetch the category
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', categorySlug)
            .single();
          
          setCurrentCategory(catData || null);

          if (catData) {
            // Fetch businesses for this category - sponsored first, then premium, then rest
            const { data: bizData, error } = await supabase
              .from('businesses')
              .select(`
                id, name, description, address, phone, website, logo_url, images,
                is_premium, is_verified, is_sponsored_ad, has_coupons, is_kid_friendly, accepts_orders_online,
                category:categories(name, slug),
                city:cities(name),
                country:countries(name, code),
                reviews(rating)
              `)
              .eq('category_id', catData.id)
              .eq('status', 'active')
              .order('is_sponsored_ad', { ascending: false })
              .order('is_premium', { ascending: false })
              .order('name', { ascending: true });

            if (!error) {
              setBusinesses(bizData || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  const handleBusinessClick = (business: Business) => {
    const citySlug = business.city?.name?.toLowerCase().replace(/\s+/g, '-') || 'city';
    const catSlug = business.category?.slug || 'business';
    navigate(`/${citySlug}/${catSlug}/${business.id}`);
  };

  const getAverageRating = (reviews: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  const filteredBusinesses = businesses.filter(biz =>
    biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentCategory && !loading) {
    return (
      <div className="relative min-h-screen bg-white">
        <MatrixRain />
        <div className="absolute inset-0 bg-white/60 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">Category not found</h1>
            <Button onClick={() => navigate('/categories')} className="bg-black hover:bg-gray-800">
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <MatrixRain />
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button & Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">All Categories</span>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">
                  {currentCategory?.name || 'Loading...'}
                </h1>
                <p className="text-gray-500 mt-2">
                  {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search within category */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search in category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/80 border-gray-200 focus:border-black rounded-xl"
                  />
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sponsored Banner */}
          <TopBannerAd />

          {/* Business Listings */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No businesses found</h3>
              <p className="text-gray-400 mb-6">Be the first to list your business in this category</p>
              <Button onClick={() => navigate('/claim-listing')} className="bg-black hover:bg-gray-800">
                Add Your Business
              </Button>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
              : "space-y-4 mt-8"
            }>
              {filteredBusinesses.map((business, index) => {
                const businessImage = business.images?.[0] || business.logo_url;
                
                return (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    onClick={() => handleBusinessClick(business)}
                    className={`bg-white/90 backdrop-blur-sm border rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group relative ${
                      business.is_sponsored_ad 
                        ? 'border-yellow-400 ring-2 ring-yellow-200' 
                        : business.is_premium 
                          ? 'border-blue-400 ring-1 ring-blue-100' 
                          : 'border-gray-200 hover:border-black'
                    } ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    {/* Sponsored/Premium Badge */}
                    {business.is_sponsored_ad && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Sponsored
                        </Badge>
                      </div>
                    )}
                    
                    {/* Image */}
                    <div className={`bg-gray-100 flex items-center justify-center relative ${
                      viewMode === 'list' ? 'w-40 h-40 flex-shrink-0' : 'h-48'
                    }`}>
                      {businessImage ? (
                        <img src={businessImage} alt={business.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-16 h-16 text-gray-300" />
                      )}
                      
                      {/* Premium crown overlay */}
                      {business.is_premium && !business.is_sponsored_ad && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-600 text-white text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg text-black group-hover:underline line-clamp-1">{business.name}</h3>
                        {business.is_verified && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">✓ Verified</Badge>
                        )}
                      </div>
                      
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {business.has_coupons && (
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                            <Tag className="w-3 h-3 mr-1" />
                            Coupons
                          </Badge>
                        )}
                        {business.is_kid_friendly && (
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                            <Users className="w-3 h-3 mr-1" />
                            Kid Friendly
                          </Badge>
                        )}
                        {business.accepts_orders_online && (
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                            <Globe className="w-3 h-3 mr-1" />
                            Order Online
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {business.reviews && business.reviews.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(getAverageRating(business.reviews)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{getAverageRating(business.reviews).toFixed(1)}</span>
                          <span className="text-sm text-gray-400">({business.reviews.length})</span>
                        </div>
                      )}
                      
                      {business.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{business.description}</p>
                      )}
                      
                      <div className="mt-3 space-y-1">
                        {business.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        {business.city && business.country && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{business.city.name}, {business.country.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom Banner */}
          <div className="mt-12">
            <BottomBannerAd />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListingsPage;
