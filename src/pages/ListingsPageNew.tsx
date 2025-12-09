import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Globe as GlobeIcon, Star, Building2 } from "lucide-react";
import { BusinessService, Business } from "@/lib/businessService";
import { motion } from "framer-motion";

export default function ListingsPageNew() {
  const { t } = useTranslation();
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const categoryName = category
    ? category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "All Businesses";

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
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "premium") return matchesSearch && business.is_premium;
    if (selectedFilter === "verified") return matchesSearch && business.is_verified;
    if (selectedFilter === "online") return matchesSearch && business.accepts_orders_online;
    
    return matchesSearch;
  });

  const handleBusinessClick = (business: Business) => {
    const countrySlug = business.country?.name.toLowerCase().replace(/\s+/g, "-") || "";
    const citySlug = business.city?.name.toLowerCase().replace(/\s+/g, "-") || "";
    const businessSlug = business.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${countrySlug}/${citySlug}/${businessSlug}`);
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-comfortaa font-bold text-black mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600 font-roboto">
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={`Search ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base border-gray-300 focus:border-black focus:ring-black rounded-xl shadow-sm"
            />
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            onClick={() => setSelectedFilter("all")}
            className="rounded-full font-roboto"
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "premium" ? "default" : "outline"}
            onClick={() => setSelectedFilter("premium")}
            className="rounded-full font-roboto"
          >
            Premium
          </Button>
          <Button
            variant={selectedFilter === "verified" ? "default" : "outline"}
            onClick={() => setSelectedFilter("verified")}
            className="rounded-full font-roboto"
          >
            Verified
          </Button>
          <Button
            variant={selectedFilter === "online" ? "default" : "outline"}
            onClick={() => setSelectedFilter("online")}
            className="rounded-full font-roboto"
          >
            Order Online
          </Button>
        </motion.div>

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
              {searchTerm ? `No results for "${searchTerm}"` : "No businesses in this category"}
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
      </div>
    </div>
  );
}
