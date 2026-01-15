import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PropertyDetail from './details/PropertyDetail';
import MotorsDetail from './details/MotorsDetail';
import JobsDetail from './details/JobsDetail';
import ElectronicsDetail from './details/ElectronicsDetail';
import FashionDetail from './details/FashionDetail';
import ServicesDetail from './details/ServicesDetail';
import FurnitureDetail from './details/FurnitureDetail';
import PetsDetail from './details/PetsDetail';
import KidsDetail from './details/KidsDetail';
import HobbiesDetail from './details/HobbiesDetail';
import BusinessDetail from './details/BusinessDetail';
import ListingDetailPageNew from './ListingDetailPageNew';

/**
 * Category Detail Router
 * Routes to the appropriate detail page based on the listing's category
 * 
 * Category Mappings:
 * 1. Properties -> PropertyDetail
 * 2. Motors -> MotorsDetail
 * 3. Jobs -> JobsDetail
 * 4. Electronics -> ElectronicsDetail
 * 5. Fashion & Beauty -> FashionDetail
 * 6. Services -> ServicesDetail
 * 7. Home & Furniture -> FurnitureDetail
 * 8. Pets & Birds -> PetsDetail
 * 9. Kids & Babies -> KidsDetail
 * 10. Hobbies -> HobbiesDetail
 * 11. Businesses & Industrial -> BusinessDetail
 * 12. Everything else -> ListingDetailPageNew (generic)
 */

export const CategoryDetailRouter = () => {
  const { listingId } = useParams();
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!listingId) return;

      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('marketplace_categories(slug)')
          .eq('id', listingId)
          .single();

        if (error) throw error;

        const slug = data?.marketplace_categories?.slug;
        setCategorySlug(slug || null);
      } catch (error) {
        console.error('Error fetching category:', error);
        setCategorySlug(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route based on category slug
  if (!categorySlug) {
    return <ListingDetailPageNew />;
  }

  // 1. Properties
  if (
    categorySlug.includes('property') ||
    categorySlug.includes('properties') ||
    categorySlug.includes('real-estate') ||
    categorySlug.includes('for-sale') ||
    categorySlug.includes('for-rent') ||
    categorySlug.includes('apartment') ||
    categorySlug.includes('house') ||
    categorySlug.includes('villa') ||
    categorySlug.includes('land') ||
    categorySlug.includes('commercial')
  ) {
    return <PropertyDetail />;
  }

  // 2. Motors/Vehicles
  if (
    categorySlug.includes('motor') ||
    categorySlug.includes('car') ||
    categorySlug.includes('vehicle') ||
    categorySlug.includes('auto') ||
    categorySlug.includes('motorcycle') ||
    categorySlug.includes('bike') ||
    categorySlug.includes('truck') ||
    categorySlug.includes('boat') ||
    categorySlug.includes('bus')
  ) {
    return <MotorsDetail />;
  }

  // 3. Jobs
  if (
    categorySlug.includes('job') ||
    categorySlug.includes('career') ||
    categorySlug.includes('employment') ||
    categorySlug.includes('work') ||
    categorySlug.includes('hiring')
  ) {
    return <JobsDetail />;
  }

  // 4. Electronics/Mobiles
  if (
    categorySlug.includes('mobile') ||
    categorySlug.includes('phone') ||
    categorySlug.includes('tablet') ||
    categorySlug.includes('electronic') ||
    categorySlug.includes('computer') ||
    categorySlug.includes('laptop') ||
    categorySlug.includes('gadget') ||
    categorySlug.includes('tech') ||
    categorySlug.includes('device') ||
    categorySlug.includes('appliance')
  ) {
    return <ElectronicsDetail />;
  }

  // 5. Fashion & Beauty
  if (
    categorySlug.includes('fashion') ||
    categorySlug.includes('beauty') ||
    categorySlug.includes('clothing') ||
    categorySlug.includes('clothes') ||
    categorySlug.includes('shoes') ||
    categorySlug.includes('bags') ||
    categorySlug.includes('accessories') ||
    categorySlug.includes('jewelry') ||
    categorySlug.includes('watches')
  ) {
    return <FashionDetail />;
  }

  // 6. Services
  if (
    categorySlug.includes('service') ||
    categorySlug.includes('cleaning') ||
    categorySlug.includes('repair') ||
    categorySlug.includes('tutoring') ||
    categorySlug.includes('photography') ||
    categorySlug.includes('catering') ||
    categorySlug.includes('consulting')
  ) {
    return <ServicesDetail />;
  }

  // 7. Home & Furniture
  if (
    categorySlug.includes('furniture') ||
    categorySlug.includes('home') ||
    categorySlug.includes('decor') ||
    categorySlug.includes('office-furniture') ||
    categorySlug.includes('garden') ||
    categorySlug.includes('outdoor')
  ) {
    return <FurnitureDetail />;
  }

  // 8. Pets & Birds
  if (
    categorySlug.includes('pet') ||
    categorySlug.includes('dog') ||
    categorySlug.includes('cat') ||
    categorySlug.includes('bird') ||
    categorySlug.includes('fish') ||
    categorySlug.includes('animal') ||
    categorySlug.includes('ornamental')
  ) {
    return <PetsDetail />;
  }

  // 9. Kids & Babies
  if (
    categorySlug.includes('kid') ||
    categorySlug.includes('baby') ||
    categorySlug.includes('babies') ||
    categorySlug.includes('children') ||
    categorySlug.includes('infant') ||
    categorySlug.includes('toddler')
  ) {
    return <KidsDetail />;
  }

  // 10. Hobbies
  if (
    categorySlug.includes('hobbies') ||
    categorySlug.includes('hobby') ||
    categorySlug.includes('collectible') ||
    categorySlug.includes('antique') ||
    categorySlug.includes('bicycle') ||
    categorySlug.includes('music') ||
    categorySlug.includes('instrument') ||
    categorySlug.includes('sport') ||
    categorySlug.includes('book') ||
    categorySlug.includes('game') ||
    categorySlug.includes('art')
  ) {
    return <HobbiesDetail />;
  }

  // 11. Businesses & Industrial
  if (
    categorySlug.includes('business') ||
    categorySlug.includes('industrial') ||
    categorySlug.includes('agriculture') ||
    categorySlug.includes('construction') ||
    categorySlug.includes('equipment') ||
    categorySlug.includes('restaurant') ||
    categorySlug.includes('retail') ||
    categorySlug.includes('manufacturing')
  ) {
    return <BusinessDetail />;
  }

  // 12. Default to generic detail page for other categories
  return <ListingDetailPageNew />;
};

export default CategoryDetailRouter;
