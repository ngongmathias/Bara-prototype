import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { db } from "@/lib/supabase";
import { motion } from "framer-motion";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ListingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = () => {
    if (searchTerm || location) {
      navigate(`/listings/category/all?search=${searchTerm}&location=${location}`);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/listings/category/${categorySlug}`);
  };

  const handleManageListing = () => {
    navigate("/claim-listing");
  };

  return (
    <div className="relative min-h-screen bg-white font-roboto">
      {/* Matrix Rain Background - Full Page */}
      <MatrixRain />
      
      {/* Subtle white overlay to lighten the rain - match LandingPageFinal */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Top Banner Ad */}
      <div className="relative z-10">
        <TopBannerAd />
      </div>
      
      {/* All content in one continuous white background */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Title - NO BACKGROUND */}
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

        {/* Search Bar - White card, same as page background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Find a business"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-base bg-white border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 text-base bg-white border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-black hover:bg-gray-800 text-white font-roboto font-semibold rounded-lg"
              >
                FIND
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Browse Categories - NO BACKGROUND */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-comfortaa font-bold text-black text-center mb-8">
            Browse Categories
          </h2>

          {loading ? (
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
                onClick={() => navigate("/listings/categories")}
                className="rounded-full px-8 bg-white hover:bg-gray-50"
              >
                View All Categories
              </Button>
            </div>
          )}
        </motion.div>

        {/* Manage Listing - NO BACKGROUND, just white card */}
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
      </div>

      {/* Bottom Banner Ad */}
      <div className="relative z-10">
        <BottomBannerAd />
      </div>

      <Footer />
    </div>
  );
};

export default ListingsPage;
