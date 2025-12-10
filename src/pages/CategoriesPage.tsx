import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "@/lib/supabase";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { Users, UtensilsCrossed, Stethoscope, Wrench, HardHat, Zap, Car, Home, Scale, Bed, Plane, Building, Wine, Scissors, BookOpen, Coffee, Film, Heart, Users as UsersIcon, User, Church, Leaf, Palette, Landmark, Hospital, Book, ShoppingBag, Building2, Trees, Pill, Mail, Gamepad2, GraduationCap, Truck, CreditCard, Smartphone, ArrowLeft, Search, ArrowRight } from "lucide-react";

// Icon mapping for categories
const iconMap: { [key: string]: any } = {
  'airports': Plane,
  'banks': Building,
  'bars': Wine,
  'barbers': Scissors,
  'bookstores': BookOpen,
  'cafes': Coffee,
  'cinemas-theatres': Film,
  'clinics': Stethoscope,
  'clubs-professional': UsersIcon,
  'clubs-leisure': UsersIcon,
  'dentists': Stethoscope,
  'doctors': User,
  'faith': Church,
  'farms': Leaf,
  'galleries-art': Palette,
  'government': Landmark,
  'hospitals': Hospital,
  'hotels': Bed,
  'lawyers': Scale,
  'libraries': Book,
  'markets': ShoppingBag,
  'museums': Building2,
  'parks': Trees,
  'pharmacies': Pill,
  'post-offices': Mail,
  'recreation': Gamepad2,
  'real-estate': Home,
  'restaurants': UtensilsCrossed,
  'salons': Scissors,
  'schools': GraduationCap,
  'services': Wrench,
  'shopping': ShoppingBag,
  'tours': Car,
  'transportation': Truck,
  'universities': GraduationCap,
  'utilities': Zap,
  'auto-repair': Wrench,
  'coffee-shops': Coffee,
  'gyms-fitness': Users,
  'beauty-salons': Scissors,
  'pet-services': Heart
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export const CategoriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categories, error } = await db
          .categories()
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
        } else {
          setCategories(categories || []);
          setFilteredCategories(categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(`categories.${category.slug}`).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories, t]);

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/listings/category/${categorySlug}`);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <MatrixRain />
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <h1 className="text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
              CATEGORIES
            </h1>
            <p className="text-lg text-gray-500 max-w-xl">
              Browse {categories.length} business categories across Africa
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 focus:border-black focus:outline-none transition-all"
              />
            </div>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCategories.map((category, index) => {
              const IconComponent = iconMap[category.slug] || Home;
              const translatedName = t(`categories.${category.slug}`, { defaultValue: category.name });
              
              return (
                <motion.div 
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  whileHover={{ y: -4 }}
                  className="group bg-white/70 backdrop-blur-sm rounded-xl p-5 cursor-pointer border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-black mb-1 group-hover:underline">
                    {translatedName}
                  </h3>
                  
                  {category.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Arrow */}
                  <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-black" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories found</h3>
              <p className="text-gray-400">Try a different search term</p>
            </motion.div>
          )}

          {/* Stats */}
          {!searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500">
                Showing <span className="font-bold text-black">{filteredCategories.length}</span> categories
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};