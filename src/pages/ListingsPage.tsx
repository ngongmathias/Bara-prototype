import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Globe as GlobeIcon, Star, Building2, ChevronDown } from "lucide-react";
import { BusinessService, Business } from "@/lib/businessService";
import { motion } from "framer-motion";
import { db } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const ListingsPage = () => {
  const { t } = useTranslation();
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const categoryName = category
    ? category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "All Businesses";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await db.categories()
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const data = await BusinessService.getBusinessesByCategory(category || "");
        setBusinesses(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [category]);

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !location || 
      business.city?.name.toLowerCase().includes(location.toLowerCase()) ||
      business.country?.name.toLowerCase().includes(location.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const handleSearch = () => {
    // Search is already filtered in real-time
    console.log("Searching for:", searchTerm, "in", location);
  };

  const handleBusinessClick = (business: Business) => {
    const countrySlug = business.country?.name.toLowerCase().replace(/\s+/g, "-") || "";
    const citySlug = business.city?.name.toLowerCase().replace(/\s+/g, "-") || "";
    const businessSlug = business.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${countrySlug}/${citySlug}/${businessSlug}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/category/${categorySlug}`);
  };

  const handleManageListing = () => {
    navigate("/claim-listing");
  };

  const getAverageRating = (business: Business) => {
    if (!business.reviews || business.reviews.length === 0) return 0;
    const totalRating = business.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / business.reviews.length;
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Main Content - Seamless, no sections */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-comfortaa font-bold text-black mb-2">
            Search • Explore • Connect • Grow<sup className="text-lg">℠</sup>
          </h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Find Business Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Find a business"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              {/* Location Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              {/* Find Button */}
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-black hover:bg-gray-800 text-white font-roboto font-semibold rounded-lg"
              >
                FIND
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Browse Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-comfortaa font-bold text-black text-center mb-8">
            Browse Categories
          </h2>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((cat, index) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-black hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Building2 className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-sm font-roboto font-medium text-black text-center">
                    {cat.name}
                  </p>
                </motion.button>
              ))}
            </div>
          )}

          {categories.length > 12 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/categories")}
                className="rounded-full px-8"
              >
                View All Categories
              </Button>
            </div>
          )}
        </motion.div>

        {/* Manage Listing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16 text-center"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
            <h3 className="text-xl font-comfortaa font-bold text-black mb-4">
              Manage your free listing.
            </h3>
            <p className="text-gray-600 font-roboto mb-6">
              Claim your business listing and start connecting with customers today.
            </p>
            <Button
              onClick={handleManageListing}
              className="bg-black hover:bg-gray-800 text-white font-roboto font-semibold px-8 py-3 rounded-lg"
            >
              Claim Your Listing
            </Button>
          </div>
        </motion.div>

        {/* Results Section */}
        {(searchTerm || location) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-comfortaa font-bold text-black mb-2">
                {categoryName}
              </h2>
              <p className="text-gray-600 font-roboto">
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
              </p>
            </div>

            {/* Business Cards Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-roboto font-semibold text-gray-900 mb-2">
                  No businesses found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? `No results for "${searchTerm}"` : "Try adjusting your search"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBusinesses.map((business, index) => {
                  const avgRating = getAverageRating(business);
                  const reviewCount = business.reviews?.length || 0;

                  return (
                    <motion.div
                      key={business.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => handleBusinessClick(business)}
                      className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                      {/* Logo */}
                      <div className="flex items-center gap-3 mb-4">
                        {business.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt={business.name}
                            className="w-14 h-14 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                            <Building2 className="w-7 h-7 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-comfortaa font-bold text-black text-base truncate group-hover:text-gray-700 transition-colors">
                            {business.name}
                          </h3>
                          {business.is_premium && (
                            <span className="inline-block text-xs bg-black text-white px-2 py-0.5 rounded-full mt-1">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      {reviewCount > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(avgRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {avgRating.toFixed(1)} ({reviewCount})
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {business.city?.name}, {business.country?.name}
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        {business.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${business.phone}`;
                            }}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        )}
                        {business.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(business.website, "_blank");
                            }}
                          >
                            <GlobeIcon className="w-3 h-3 mr-1" />
                            Visit
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
