import {
  Car,
  Key,
  Smartphone,
  Briefcase,
  ShoppingBag,
  PawPrint,
  Wrench,
  Baby,
  Package,
  Palette,
  Tv,
  Building2,
  Refrigerator,
  AirVent,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  subcategories: string[];
}

/**
 * Single source of truth for the marketplace main categories + subcategories
 * (Phase 25.4 — "4 Main Categories", option B: the four finer-grained
 * electronics categories replace the old "Electronics & Appliances" +
 * "Mobile & Tablets" buckets; everything else stays).
 *
 * Consumed by MarketplacePage (tiles + mega-menu) and AllCategoriesPage.
 * Keep slugs in sync with:
 *   - DB tables marketplace_categories / marketplace_subcategories
 *   - src/config/categoryFieldConfigs.ts (post-ad form fields)
 *   - AdminMarketplaceCategories HARDCODED_CATEGORY_SLUGS
 */
export const marketplaceCategories: Category[] = [
  {
    id: 'motors',
    name: 'Vehicles',
    slug: 'motors',
    icon: Car,
    subcategories: ['Cars for Sale', 'Cars for Rent', 'Motorcycles', 'Boats', 'Trucks & Commercial Vehicles', 'Auto Accessories', 'Auto Parts & Spare Parts', 'Heavy Vehicles', 'Buses'],
  },
  {
    id: 'property-sale',
    name: 'Properties',
    slug: 'property-sale',
    icon: Key,
    subcategories: ['Apartments for Sale', 'Apartments for Rent', 'Villas for Sale', 'Villas for Rent', 'Townhouses for Sale', 'Townhouses for Rent', 'Penthouses', 'Residential Land', 'Commercial for Sale', 'Commercial for Rent'],
  },
  // ---- Phase 25.4 electronics restructure (option B) ----
  {
    id: 'mobile-tablets',
    name: 'Mobile Phones & Tablets',
    slug: 'mobile-tablets',
    icon: Smartphone,
    subcategories: ['Mobile Phones', 'Tablets & E-Readers', 'Accessories', 'Wearable Tech'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: Tv,
    subcategories: ['TVs', 'Home Audio', 'Portable Audio', 'Video', 'Computers, Laptops & Notebooks', 'Computer Accessories & Components', 'Gaming & Accessories', 'Cameras', 'Camera Accessories', 'Smart Home', 'Vehicle Electronics', 'Specialized Electronics'],
  },
  {
    id: 'appliances',
    name: 'Appliances',
    slug: 'appliances',
    icon: Refrigerator,
    subcategories: ['Refrigerators & Freezers', 'Ovens & Ranges', 'Dishwashers', 'Microwaves', 'Range Hoods & Ventilation', 'Food Prep', 'Cooking & Heating', 'Coffee & Espresso', 'Cleaning Appliances', 'Washing Machines & Dryers'],
  },
  {
    id: 'climate-control',
    name: 'Climate Control',
    slug: 'climate-control',
    icon: AirVent,
    subcategories: ['Air Conditioners', 'Fans', 'Heaters', 'Air Purifiers & Dehumidifiers'],
  },
  // -------------------------------------------------------
  {
    id: 'jobs',
    name: 'Jobs',
    slug: 'jobs',
    icon: Briefcase,
    subcategories: ['Accounting, Finance & Banking', 'Engineering', 'IT & Software', 'Sales', 'Marketing', 'Healthcare', 'Education & Training', 'Hospitality & Tourism', 'Customer Service', 'Administration'],
  },
  {
    id: 'furniture-garden',
    name: 'Home & Office Furniture - Decor',
    slug: 'furniture-garden',
    icon: Package,
    subcategories: ['Furniture', 'Office Furniture', 'Home Decor', 'Garden & Outdoor', 'Lighting', 'Curtains & Blinds', 'Carpets & Rugs'],
  },
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    slug: 'fashion',
    icon: ShoppingBag,
    subcategories: ["Women's Clothing", "Men's Clothing", 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Beauty Products', 'Perfumes', 'Sunglasses'],
  },
  {
    id: 'pets',
    name: 'Pets - Birds - Ornamental fish',
    slug: 'pets',
    icon: PawPrint,
    subcategories: ['Dogs', 'Cats', 'Birds', 'Fish', 'Pet Accessories', 'Pet Food', 'Pet Services', 'Livestock'],
  },
  {
    id: 'kids-babies',
    name: 'Kids & Babies',
    slug: 'kids-babies',
    icon: Baby,
    subcategories: ['Baby & Mom Healthcare', 'Baby Clothing', 'Baby Furniture', 'Toys', 'Strollers', 'Car Seats', 'Baby Gear', 'Kids Clothing', 'Kids Shoes'],
  },
  {
    id: 'hobbies',
    name: 'Hobbies',
    slug: 'hobbies',
    icon: Palette,
    subcategories: ['Antiques - Collectibles', 'Bicycles', 'Books', 'Music Instruments', 'Sports Equipment', 'Camping & Outdoor', 'Art & Crafts'],
  },
  {
    id: 'business-industrial',
    name: 'Businesses & Industrial',
    slug: 'business-industrial',
    icon: Building2,
    subcategories: ['Agriculture', 'Construction', 'Equipment', 'Industrial Machinery', 'Restaurants', 'Retail Businesses', 'Manufacturing'],
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    icon: Wrench,
    subcategories: ['Business', 'Car', 'Domestic', 'Education', 'Health', 'IT & Web', 'Legal Services', 'Moving & Storage', 'Event Services'],
  },
];
