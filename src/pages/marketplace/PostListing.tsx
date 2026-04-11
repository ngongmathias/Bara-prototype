import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useUser } from '@clerk/clerk-react';

import { Header } from '@/components/Header';

import Footer from '@/components/Footer';

import { TopBannerAd } from '@/components/TopBannerAd';

import { BottomBannerAd } from '@/components/BottomBannerAd';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import { supabase } from '@/lib/supabase';

import { useToast } from '@/components/ui/use-toast';

import { GamificationService, XP_REWARDS } from '@/lib/gamificationService';

import {

  Upload,

  X,

  Image as ImageIcon,

  CheckCircle,

  Loader2,

  Zap,

  Star,

  ShieldCheck,

  AlertCircle

} from 'lucide-react';

import { FaWhatsapp } from 'react-icons/fa';

import { uploadImage } from '@/lib/storage';

import { useCountrySelection } from '@/context/CountrySelectionContext';
import { getCategoryConfig } from '@/config/categoryFieldConfigs';
import { VariantBuilder, type VariantRow } from '@/components/marketplace/listing-parts/VariantBuilder';



export const PostListing = () => {

  const navigate = useNavigate();

  const { toast } = useToast();

  const { selectedCountry } = useCountrySelection();

  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  const [userId, setUserId] = useState<string>('');

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [countries, setCountries] = useState<any[]>([]);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  const [formData, setFormData] = useState({

    title: '',

    description: '',

    category_id: '',

    subcategory_id: '',

    price: '',

    currency: 'USD',

    price_type: 'fixed',

    condition: '',

    seller_name: '',

    seller_email: '',

    seller_phone: '',

    seller_whatsapp: '',

    seller_website: '',

    seller_type: 'individual',

    location_details: '',

    is_premium: false,

  });



  // Category-specific attributes

  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');

  const [subcategories, setSubcategories] = useState<any[]>([]);



  useEffect(() => {

    if (isLoaded) {

      checkAuth();

    }

  }, [isLoaded, isSignedIn]);



  useEffect(() => {

    fetchCategories();

    fetchCountries();

  }, []);



  useEffect(() => {

    if (formData.category_id) {

      fetchSubcategories(formData.category_id);

    } else {

      setSubcategories([]);

    }

  }, [formData.category_id]);



  useEffect(() => {

    if (selectedCountry && selectedCountries.length === 0) {

      setSelectedCountries([selectedCountry.id]);

    }

  }, [selectedCountry]);



  const checkAuth = async () => {

    try {

      if (!isLoaded) {

        return;

      }



      if (!isSignedIn || !clerkUser) {

        toast({

          title: 'Authentication Required',

          description: 'Please sign in to post an ad',

          variant: 'destructive',

        });

        navigate('/user/sign-in?redirect=/marketplace/post');

        return;

      }



      setUserId(clerkUser.id);



      // Pre-fill user info from Clerk

      const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';

      const userName = clerkUser.fullName || clerkUser.firstName || userEmail.split('@')[0] || '';



      setFormData(prev => ({

        ...prev,

        seller_name: userName,

        seller_email: userEmail,

      }));

    } catch (error) {

      console.error('Auth check error:', error);

    } finally {

      setLoading(false);

    }

  };



  const fetchCategories = async () => {

    try {

      const { data } = await supabase

        .from('marketplace_categories')

        .select('*')

        .eq('is_active', true)

        .order('display_order');



      setCategories(data || []);

    } catch (error) {

      console.error('Error fetching categories:', error);

    }

  };



  const fetchCountries = async () => {

    try {

      const { data, error } = await supabase

        .from('countries')

        .select('*')

        .order('name');



      if (error) throw error;

      setCountries(data || []);

    } catch (error) {

      console.error('Error fetching countries:', error);

    }

  };



  const fetchSubcategories = async (categoryId: string) => {

    try {

      const { data, error } = await supabase

        .from('marketplace_subcategories')

        .select('*')

        .eq('category_id', categoryId)

        .eq('is_active', true)

        .order('display_order');



      if (error) throw error;

      setSubcategories(data || []);

    } catch (error) {

      console.error('Error fetching subcategories:', error);

      setSubcategories([]);

    }

  };



  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = Array.from(e.target.files || []);



    if (selectedImages.length + files.length > 10) {

      toast({

        title: 'Too Many Images',

        description: 'You can upload maximum 10 images',

        variant: 'destructive',

      });

      return;

    }



    setSelectedImages(prev => [...prev, ...files]);



    // Create previews

    files.forEach(file => {

      const reader = new FileReader();

      reader.onloadend = () => {

        setImagePreviews(prev => [...prev, reader.result as string]);

      };

      reader.readAsDataURL(file);

    });

  };



  const removeImage = (index: number) => {

    setSelectedImages(prev => prev.filter((_, i) => i !== index));

    setImagePreviews(prev => prev.filter((_, i) => i !== index));

  };



  const toggleCountrySelection = (countryId: string) => {

    setSelectedCountries(prev =>

      prev.includes(countryId)

        ? prev.filter(id => id !== countryId)

        : [...prev, countryId]

    );

  };



  const validateForm = () => {

    if (!formData.title.trim()) {

      toast({

        title: 'Validation Error',

        description: 'Please enter a title',

        variant: 'destructive',

      });

      return false;

    }



    if (!formData.description.trim()) {

      toast({

        title: 'Validation Error',

        description: 'Please enter a description',

        variant: 'destructive',

      });

      return false;

    }



    if (!formData.category_id) {

      toast({

        title: 'Validation Error',

        description: 'Please select a category',

        variant: 'destructive',

      });

      return false;

    }



    // Price validation — category-aware
    const catConfig = getCategoryConfig(selectedCategorySlug);
    const priceRequired = catConfig?.priceField ? catConfig.priceField.required : true;
    if (priceRequired && (!formData.price || parseFloat(formData.price) <= 0)) {

      toast({

        title: 'Validation Error',

        description: `Please enter a valid ${catConfig?.priceField?.label?.toLowerCase() || 'price'}`,

        variant: 'destructive',

      });

      return false;

    }



    if (selectedCountries.length === 0) {

      toast({

        title: 'Validation Error',

        description: 'Please select a country',

        variant: 'destructive',

      });

      return false;

    }



    if (!formData.seller_whatsapp && !formData.seller_phone && !formData.seller_email) {

      toast({

        title: 'Validation Error',

        description: 'Please provide at least one contact method (WhatsApp, Phone, or Email)',

        variant: 'destructive',

      });

      return false;

    }



    // Image validation — category-aware (optional for jobs, services, businesses)
    const imageRequired = catConfig?.imageRequired !== false;
    if (imageRequired && selectedImages.length === 0) {

      toast({

        title: 'Validation Error',

        description: 'Please upload at least one image',

        variant: 'destructive',

      });

      return false;

    }



    return true;

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();



    if (!validateForm()) return;



    setSubmitting(true);



    try {

      // Upload images

      const uploadedImages = await Promise.all(

        selectedImages.map(async (file, index) => {

          const imageUrl = await uploadImage(file, 'marketplace-listings', 'listings');

          return {

            image_url: imageUrl,

            display_order: index,

            is_primary: index === 0,

          };

        })

      );



      // Create listing

      const { data: listingData, error: listingError } = await supabase

        .from('marketplace_listings')

        .insert({

          title: formData.title,

          description: formData.description,

          category_id: formData.category_id,

          subcategory_id: formData.subcategory_id || null,

          country_id: selectedCountries[0],

          price: parseFloat(formData.price) || 0,

          currency: formData.currency,

          price_type: formData.price_type,

          condition: formData.condition || null,

          seller_name: formData.seller_name,

          seller_email: formData.seller_email,

          seller_phone: formData.seller_phone,

          seller_whatsapp: formData.seller_whatsapp,

          seller_type: formData.seller_type,

          location_details: formData.location_details,

          status: 'active',

          created_by: userId,

          attributes: attributes,

          is_premium: formData.is_premium,

        })

        .select()

        .single();



      if (listingError) throw listingError;



      // Insert images

      const imagesWithListingId = uploadedImages.map(img => ({

        ...img,

        listing_id: listingData.id,

      }));



      const { error: imagesError } = await supabase

        .from('marketplace_listing_images')

        .insert(imagesWithListingId);



      if (imagesError) throw imagesError;



      // Insert country associations

      const countryInserts = selectedCountries.map(countryId => ({

        listing_id: listingData.id,

        country_id: countryId,

      }));



      const { error: countriesError } = await supabase

        .from('marketplace_listing_countries')

        .insert(countryInserts);



      if (countriesError) throw countriesError;

      // Insert variants if enabled
      if (variantsEnabled && variantRows.length > 0) {
        const variantInserts = variantRows.map((v, idx) => ({
          listing_id: listingData.id,
          label: v.label,
          attributes: v.attributes,
          price_override: v.price_override ? parseFloat(v.price_override) : null,
          quantity: parseInt(v.quantity) || 1,
          quantity_sold: 0,
          image_url: v.image_url || null,
          is_available: true,
          sort_order: idx,
        }));
        const { error: variantError } = await supabase
          .from('marketplace_listing_variants')
          .insert(variantInserts);
        if (variantError) console.error('Variant insert error:', variantError);
      }

      // Upsert partner profile on first post (fire-and-forget; non-blocking)

      try {

        const slugBase = (formData.seller_name || clerkUser?.fullName || 'seller')

          .toLowerCase()

          .replace(/[^a-z0-9]+/g, '-')

          .replace(/^-|-$/g, '')

          .slice(0, 40);

        const partnerSlug = `${slugBase}-${userId.slice(-6)}`;

        await supabase.from('marketplace_partners').upsert({

          owner_user_id: userId,

          display_name: formData.seller_name || clerkUser?.fullName || 'Seller',

          slug: partnerSlug,

          contact_email: formData.seller_email,

          contact_phone: formData.seller_phone,

          contact_whatsapp: formData.seller_whatsapp,

          business_type: formData.seller_type,

          country_id: selectedCountries[0],

          verification_level: 'unverified',

        }, { onConflict: 'owner_user_id', ignoreDuplicates: false });

      } catch (partnerErr) {

        console.warn('Partner upsert failed (non-critical):', partnerErr);

      }



      // Frontend email fallback in case DB trigger is not applied yet

      try {

        await supabase.from('email_queue').insert({

          to_email: formData.seller_email,

          subject: '🛒 Ad Received: ' + formData.title,

          html_content: `<p>Hi ${formData.seller_name || 'Seller'},</p><p>Your marketplace ad <strong>${formData.title}</strong> has been received and is currently under review. We will notify you once it is published.</p><p>Ad ID: ${listingData.id}</p><p>— The Bara Afrika Team</p>`,

          metadata: { listing_id: listingData.id, type: 'marketplace_submission' }

        });

      } catch (emailErr) {

        // Email failure must never block listing creation

        console.warn('Email enqueue failed (non-critical):', emailErr);

      }



      // Gamification: Award XP and check for first listing achievement

      try {

        await GamificationService.addXP(userId, XP_REWARDS.LISTING_CREATE, `Posted listing: ${formData.title}`);

        await GamificationService.awardAchievement(userId, 'market_entry');



        // If premium, spend coins

        if (formData.is_premium) {

          await GamificationService.spendCoins(userId, 50, `Premium boost for: ${formData.title}`);

        }

      } catch (gamifyErr) {

        console.warn('Gamification update failed:', gamifyErr);

      }



      toast({

        title: 'Success!',

        description: 'Your ad has been submitted for review',

      });



      navigate(`/marketplace/ad/${listingData.id}`);

    } catch (error) {

      console.error('Error creating ad:', error);

      toast({

        title: 'Error',

        description: 'Failed to create ad. Please try again.',

        variant: 'destructive',

      });

    } finally {

      setSubmitting(false);

    }

  };



  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50">

        <TopBannerAd />

        <Header />

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">

          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />

          <p className="text-gray-600">Loading...</p>

        </div>

        <Footer />

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-50 font-roboto">

      <TopBannerAd />

      <Header />



      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-comfortaa">

            Sell Something

          </h1>

          <p className="text-gray-600">

            Fill in the details below to post your ad on the marketplace

          </p>

        </div>



        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Information */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Basic Information

            </h2>



            <div className="space-y-4">

              <div>

                <Label htmlFor="title">Title *</Label>

                <Input

                  id="title"

                  value={formData.title}

                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}

                  placeholder="e.g., iPhone 13 Pro Max 256GB"

                  maxLength={100}

                />



                {/* Elite Monetization: Boost Toggle */}

                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">

                  <div className="flex items-start justify-between">

                    <div className="flex gap-3">

                      <div className="mt-1 p-2 bg-yellow-400 rounded-full">

                        <Zap className="text-white w-4 h-4" />

                      </div>

                      <div>

                        <h4 className="font-bold text-gray-900 font-comfortaa">Elite Boost</h4>

                        <p className="text-xs text-gray-600 max-w-sm">Bring your ad to the very top of all search results for 7 days.</p>

                      </div>

                    </div>

                    <div className="flex flex-col items-end gap-2">

                      <div className="flex items-center space-x-2">

                        <input

                          type="checkbox"

                          id="is-premium"

                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"

                          checked={formData.is_premium}

                          onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}

                        />

                        <Label htmlFor="is-premium" className="font-bold text-sm">Boost for 50 Coins</Label>

                      </div>

                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bara Elite Model</p>

                      <a href="/store" className="text-[10px] text-yellow-600 hover:text-yellow-700 font-bold underline">

                        Not enough coins? Buy more →

                      </a>

                    </div>

                  </div>

                </div>



                <p className="text-sm text-gray-500 mt-2">

                  {formData.title.length}/100 characters

                </p>

              </div>



              <div>

                <Label htmlFor="description">Description *</Label>

                <Textarea

                  id="description"

                  value={formData.description}

                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}

                  placeholder="Describe your item in detail..."

                  rows={6}

                  maxLength={2000}

                />

                <p className="text-sm text-gray-500 mt-1">

                  {formData.description.length}/2000 characters

                </p>

              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <Label htmlFor="category">Category *</Label>

                  <Select

                    value={formData.category_id}

                    onValueChange={(value) => {

                      const category = categories.find(c => c.id === value);

                      setFormData({ ...formData, category_id: value, subcategory_id: '' });

                      setSelectedCategorySlug(category?.slug || '');

                      setAttributes({}); // Reset attributes when category changes

                    }}

                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select category" />

                    </SelectTrigger>

                    <SelectContent>

                      {categories.map((cat) => (

                        <SelectItem key={cat.id} value={cat.id}>

                          {cat.name}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                {/* Subcategory - show if category has subcategories */}

                {subcategories.length > 0 && (

                  <div>

                    <Label htmlFor="subcategory">Type</Label>

                    <Select

                      value={formData.subcategory_id}

                      onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}

                    >

                      <SelectTrigger>

                        <SelectValue placeholder="Select type" />

                      </SelectTrigger>

                      <SelectContent>

                        {subcategories.map((subcat) => (

                          <SelectItem key={subcat.id} value={subcat.id}>

                            {subcat.name}

                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                  </div>

                )}



                {/* Only show condition for physical products, not services/jobs/pets */}

                {!['jobs', 'services', 'pets', 'businesses'].includes(selectedCategorySlug) && !selectedCategorySlug.includes('property') && (

                  <div>

                    <Label htmlFor="condition">Condition</Label>

                    <Select

                      value={formData.condition}

                      onValueChange={(value) => setFormData({ ...formData, condition: value })}

                    >

                      <SelectTrigger>

                        <SelectValue placeholder="Select condition" />

                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="new">New</SelectItem>

                        <SelectItem value="used">Used</SelectItem>

                        <SelectItem value="like-new">Like New</SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                )}

              </div>



              {/* Category-Specific Fields */}

              {selectedCategorySlug === 'motors' && (

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Vehicle Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Brand/Make</Label>

                      <Select

                        value={attributes.make || ''}

                        onValueChange={(value) => setAttributes({ ...attributes, make: value })}

                      >

                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Toyota">Toyota</SelectItem>

                          <SelectItem value="Honda">Honda</SelectItem>

                          <SelectItem value="Nissan">Nissan</SelectItem>

                          <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>

                          <SelectItem value="BMW">BMW</SelectItem>

                          <SelectItem value="Audi">Audi</SelectItem>

                          <SelectItem value="Volkswagen">Volkswagen</SelectItem>

                          <SelectItem value="Ford">Ford</SelectItem>

                          <SelectItem value="Chevrolet">Chevrolet</SelectItem>

                          <SelectItem value="Hyundai">Hyundai</SelectItem>

                          <SelectItem value="Kia">Kia</SelectItem>

                          <SelectItem value="Mazda">Mazda</SelectItem>

                          <SelectItem value="Subaru">Subaru</SelectItem>

                          <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>

                          <SelectItem value="Suzuki">Suzuki</SelectItem>

                          <SelectItem value="Isuzu">Isuzu</SelectItem>

                          <SelectItem value="Land Rover">Land Rover</SelectItem>

                          <SelectItem value="Jeep">Jeep</SelectItem>

                          <SelectItem value="Peugeot">Peugeot</SelectItem>

                          <SelectItem value="Renault">Renault</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Model</Label>

                      <Input

                        value={attributes.model || ''}

                        onChange={(e) => setAttributes({ ...attributes, model: e.target.value })}

                        placeholder="e.g., Camry"

                      />

                    </div>

                    <div>

                      <Label>Year</Label>

                      <Select value={attributes.year || ''} onValueChange={(value) => setAttributes({ ...attributes, year: value })}>

                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>

                        <SelectContent>

                          {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (

                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Body Type</Label>

                      <Select value={attributes.body_type || ''} onValueChange={(value) => setAttributes({ ...attributes, body_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Sedan">Sedan</SelectItem>

                          <SelectItem value="SUV">SUV</SelectItem>

                          <SelectItem value="Hatchback">Hatchback</SelectItem>

                          <SelectItem value="Coupe">Coupe</SelectItem>

                          <SelectItem value="Pickup">Pickup Truck</SelectItem>

                          <SelectItem value="Van">Van</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Fuel Type</Label>

                      <Select value={attributes.fuel_type || ''} onValueChange={(value) => setAttributes({ ...attributes, fuel_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Petrol">Petrol</SelectItem>

                          <SelectItem value="Diesel">Diesel</SelectItem>

                          <SelectItem value="Electric">Electric</SelectItem>

                          <SelectItem value="Hybrid">Hybrid</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Transmission</Label>

                      <Select value={attributes.transmission || ''} onValueChange={(value) => setAttributes({ ...attributes, transmission: value })}>

                        <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Automatic">Automatic</SelectItem>

                          <SelectItem value="Manual">Manual</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Mileage (km)</Label>

                      <Input

                        type="number"

                        value={attributes.mileage || ''}

                        onChange={(e) => setAttributes({ ...attributes, mileage: e.target.value })}

                        placeholder="e.g., 35000"

                      />

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug.includes('property') && (

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Property Type</Label>

                      <Select value={attributes.property_type || ''} onValueChange={(value) => setAttributes({ ...attributes, property_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Apartment">Apartment</SelectItem>

                          <SelectItem value="Villa">Villa</SelectItem>

                          <SelectItem value="House">House</SelectItem>

                          <SelectItem value="Land">Land</SelectItem>

                          <SelectItem value="Commercial">Commercial</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Bedrooms</Label>

                      <Select value={attributes.bedrooms?.toString() || ''} onValueChange={(value) => setAttributes({ ...attributes, bedrooms: parseInt(value) })}>

                        <SelectTrigger><SelectValue placeholder="Select bedrooms" /></SelectTrigger>

                        <SelectContent>

                          {[1, 2, 3, 4, 5, 6].map(num => (

                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Bathrooms</Label>

                      <Select value={attributes.bathrooms?.toString() || ''} onValueChange={(value) => setAttributes({ ...attributes, bathrooms: parseInt(value) })}>

                        <SelectTrigger><SelectValue placeholder="Select bathrooms" /></SelectTrigger>

                        <SelectContent>

                          {[1, 2, 3, 4, 5].map(num => (

                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Area (sqm)</Label>

                      <Input

                        type="number"

                        value={attributes.area || ''}

                        onChange={(e) => setAttributes({ ...attributes, area: e.target.value })}

                        placeholder="e.g., 120"

                      />

                    </div>

                    <div>

                      <Label>Furnished</Label>

                      <Select value={attributes.furnished || ''} onValueChange={(value) => setAttributes({ ...attributes, furnished: value })}>

                        <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Furnished">Furnished</SelectItem>

                          <SelectItem value="Unfurnished">Unfurnished</SelectItem>

                          <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}



              {(selectedCategorySlug === 'electronics' || selectedCategorySlug === 'mobile-tablets') && (

                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Brand</Label>

                      <Input

                        value={attributes.brand || ''}

                        onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}

                        placeholder="e.g., Apple, Samsung"

                      />

                    </div>

                    <div>

                      <Label>Warranty</Label>

                      <Select value={attributes.warranty || ''} onValueChange={(value) => setAttributes({ ...attributes, warranty: value })}>

                        <SelectTrigger><SelectValue placeholder="Select warranty" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Yes">With Warranty</SelectItem>

                          <SelectItem value="No">No Warranty</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug === 'fashion' && (

                <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Fashion Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Gender</Label>

                      <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({ ...attributes, gender: value })}>

                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Men">Men</SelectItem>

                          <SelectItem value="Women">Women</SelectItem>

                          <SelectItem value="Unisex">Unisex</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Size</Label>

                      <Select value={attributes.size || ''} onValueChange={(value) => setAttributes({ ...attributes, size: value })}>

                        <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="XS">XS</SelectItem>

                          <SelectItem value="S">S</SelectItem>

                          <SelectItem value="M">M</SelectItem>

                          <SelectItem value="L">L</SelectItem>

                          <SelectItem value="XL">XL</SelectItem>

                          <SelectItem value="XXL">XXL</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug === 'jobs' && (

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2">

                      <Label>Company Name *</Label>

                      <Input
                        value={attributes.company_name || ''}
                        onChange={(e) => setAttributes({ ...attributes, company_name: e.target.value })}
                        placeholder="e.g., ABC Corporation"
                      />

                    </div>

                    <div>

                      <Label>Job Type *</Label>

                      <Select value={attributes.job_type || ''} onValueChange={(value) => setAttributes({ ...attributes, job_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Full-time">Full-time</SelectItem>

                          <SelectItem value="Part-time">Part-time</SelectItem>

                          <SelectItem value="Contract">Contract</SelectItem>

                          <SelectItem value="Freelance">Freelance</SelectItem>

                          <SelectItem value="Internship">Internship</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Experience Level</Label>

                      <Select value={attributes.experience_level || ''} onValueChange={(value) => setAttributes({ ...attributes, experience_level: value })}>

                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Entry Level">Entry Level</SelectItem>

                          <SelectItem value="Mid Level">Mid Level</SelectItem>

                          <SelectItem value="Senior Level">Senior Level</SelectItem>

                          <SelectItem value="Executive">Executive</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Work Type</Label>

                      <Select value={attributes.work_type || ''} onValueChange={(value) => setAttributes({ ...attributes, work_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select work type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Remote">Remote</SelectItem>

                          <SelectItem value="On-site">On-site</SelectItem>

                          <SelectItem value="Hybrid">Hybrid</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Application Deadline</Label>

                      <Input
                        type="date"
                        value={attributes.deadline || ''}
                        onChange={(e) => setAttributes({ ...attributes, deadline: e.target.value })}
                      />

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug === 'pets' && (

                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Pet Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Pet Type *</Label>

                      <Select value={attributes.pet_type || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Dog">Dog</SelectItem>

                          <SelectItem value="Cat">Cat</SelectItem>

                          <SelectItem value="Bird">Bird</SelectItem>

                          <SelectItem value="Fish">Fish</SelectItem>

                          <SelectItem value="Rabbit">Rabbit</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Breed</Label>

                      <Input
                        value={attributes.breed || ''}
                        onChange={(e) => setAttributes({ ...attributes, breed: e.target.value })}
                        placeholder="e.g., Labrador Retriever"
                      />

                    </div>

                    <div>

                      <Label>Age</Label>

                      <Select value={attributes.pet_age || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_age: value })}>

                        <SelectTrigger><SelectValue placeholder="Select age" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Puppy/Kitten">Puppy/Kitten</SelectItem>

                          <SelectItem value="Young">Young</SelectItem>

                          <SelectItem value="Adult">Adult</SelectItem>

                          <SelectItem value="Senior">Senior</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Gender</Label>

                      <Select value={attributes.pet_gender || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_gender: value })}>

                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Male">Male</SelectItem>

                          <SelectItem value="Female">Female</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Vaccinated</Label>

                      <Select value={attributes.vaccinated || ''} onValueChange={(value) => setAttributes({ ...attributes, vaccinated: value })}>

                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Yes">Yes</SelectItem>

                          <SelectItem value="No">No</SelectItem>

                          <SelectItem value="Partial">Partially</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'services' && (

                <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Service Type *</Label>

                      <Select value={attributes.service_type || ''} onValueChange={(value) => setAttributes({ ...attributes, service_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Cleaning">Cleaning</SelectItem>

                          <SelectItem value="Repair">Repair & Maintenance</SelectItem>

                          <SelectItem value="Tutoring">Tutoring & Education</SelectItem>

                          <SelectItem value="Photography">Photography</SelectItem>

                          <SelectItem value="Catering">Catering</SelectItem>

                          <SelectItem value="Consulting">Consulting</SelectItem>

                          <SelectItem value="IT">IT & Technology</SelectItem>

                          <SelectItem value="Legal">Legal</SelectItem>

                          <SelectItem value="Health">Health & Wellness</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Availability *</Label>

                      <Select value={attributes.availability || ''} onValueChange={(value) => setAttributes({ ...attributes, availability: value })}>

                        <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Weekdays">Weekdays</SelectItem>

                          <SelectItem value="Weekends">Weekends</SelectItem>

                          <SelectItem value="24/7">24/7</SelectItem>

                          <SelectItem value="By Appointment">By Appointment</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Years of Experience</Label>

                      <Input
                        type="number"
                        value={attributes.experience_years || ''}
                        onChange={(e) => setAttributes({ ...attributes, experience_years: e.target.value })}
                        placeholder="e.g., 5"
                        min="0"
                      />

                    </div>

                    <div>

                      <Label>Service Area</Label>

                      <Input
                        value={attributes.service_area || ''}
                        onChange={(e) => setAttributes({ ...attributes, service_area: e.target.value })}
                        placeholder="e.g., City-wide, Specific neighborhoods"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'home-furniture' && (

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Furniture Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Furniture Type</Label>

                      <Select value={attributes.furniture_type || ''} onValueChange={(value) => setAttributes({ ...attributes, furniture_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Sofa">Sofa</SelectItem>

                          <SelectItem value="Bed">Bed</SelectItem>

                          <SelectItem value="Table">Table</SelectItem>

                          <SelectItem value="Chair">Chair</SelectItem>

                          <SelectItem value="Cabinet">Cabinet</SelectItem>

                          <SelectItem value="Desk">Desk</SelectItem>

                          <SelectItem value="Appliance">Home Appliance</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Material</Label>

                      <Input
                        value={attributes.material || ''}
                        onChange={(e) => setAttributes({ ...attributes, material: e.target.value })}
                        placeholder="e.g., Wood, Metal, Fabric"
                      />

                    </div>

                    <div>

                      <Label>Dimensions</Label>

                      <Input
                        value={attributes.dimensions || ''}
                        onChange={(e) => setAttributes({ ...attributes, dimensions: e.target.value })}
                        placeholder="e.g., 200x100x80 cm"
                      />

                    </div>

                    <div>

                      <Label>Color</Label>

                      <Input
                        value={attributes.color || ''}
                        onChange={(e) => setAttributes({ ...attributes, color: e.target.value })}
                        placeholder="e.g., Brown"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'kids-babies' && (

                <div className="mt-6 p-4 bg-rose-50 rounded-lg border border-rose-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Kids & Babies Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Item Type</Label>

                      <Select value={attributes.item_type || ''} onValueChange={(value) => setAttributes({ ...attributes, item_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Clothing">Clothing</SelectItem>

                          <SelectItem value="Toys">Toys & Games</SelectItem>

                          <SelectItem value="Stroller">Stroller / Pram</SelectItem>

                          <SelectItem value="Car Seat">Car Seat</SelectItem>

                          <SelectItem value="Feeding">Feeding Supplies</SelectItem>

                          <SelectItem value="Furniture">Nursery Furniture</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Age Group</Label>

                      <Select value={attributes.age_group || ''} onValueChange={(value) => setAttributes({ ...attributes, age_group: value })}>

                        <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Newborn">Newborn (0-3 months)</SelectItem>

                          <SelectItem value="Baby">Baby (3-12 months)</SelectItem>

                          <SelectItem value="Toddler">Toddler (1-3 years)</SelectItem>

                          <SelectItem value="Preschool">Preschool (3-5 years)</SelectItem>

                          <SelectItem value="Kids">Kids (5-12 years)</SelectItem>

                          <SelectItem value="Teens">Teens (12+)</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Gender</Label>

                      <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({ ...attributes, gender: value })}>

                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Boy">Boy</SelectItem>

                          <SelectItem value="Girl">Girl</SelectItem>

                          <SelectItem value="Unisex">Unisex</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Brand</Label>

                      <Input
                        value={attributes.brand || ''}
                        onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}
                        placeholder="e.g., Graco, Fisher-Price"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'hobbies' && (

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Hobby Item Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Category</Label>

                      <Select value={attributes.hobby_type || ''} onValueChange={(value) => setAttributes({ ...attributes, hobby_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Sports">Sports Equipment</SelectItem>

                          <SelectItem value="Musical">Musical Instruments</SelectItem>

                          <SelectItem value="Books">Books & Media</SelectItem>

                          <SelectItem value="Games">Games & Puzzles</SelectItem>

                          <SelectItem value="Art">Art & Crafts</SelectItem>

                          <SelectItem value="Outdoor">Outdoor & Camping</SelectItem>

                          <SelectItem value="Collectibles">Collectibles</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Brand</Label>

                      <Input
                        value={attributes.brand || ''}
                        onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}
                        placeholder="e.g., Wilson, Yamaha"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'businesses' && (

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Business Type *</Label>

                      <Select value={attributes.business_type || ''} onValueChange={(value) => setAttributes({ ...attributes, business_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Restaurant">Restaurant / Food</SelectItem>

                          <SelectItem value="Retail">Retail Shop</SelectItem>

                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>

                          <SelectItem value="Service">Service Business</SelectItem>

                          <SelectItem value="Franchise">Franchise</SelectItem>

                          <SelectItem value="Online">Online Business</SelectItem>

                          <SelectItem value="Industrial">Industrial Equipment</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Years in Operation</Label>

                      <Input
                        type="number"
                        value={attributes.years_operating || ''}
                        onChange={(e) => setAttributes({ ...attributes, years_operating: e.target.value })}
                        placeholder="e.g., 5"
                        min="0"
                      />

                    </div>

                    <div>

                      <Label>Number of Employees</Label>

                      <Input
                        type="number"
                        value={attributes.employees || ''}
                        onChange={(e) => setAttributes({ ...attributes, employees: e.target.value })}
                        placeholder="e.g., 10"
                        min="0"
                      />

                    </div>

                    <div>

                      <Label>Revenue (Annual)</Label>

                      <Input
                        value={attributes.annual_revenue || ''}
                        onChange={(e) => setAttributes({ ...attributes, annual_revenue: e.target.value })}
                        placeholder="e.g., $50,000"
                      />

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>



          {/* Pricing — category-aware */}

          {(() => {
            const catConfig = getCategoryConfig(selectedCategorySlug);
            const pf = catConfig?.priceField;
            const isRange = pf?.isRange;
            const hasPeriod = pf?.periodOptions && pf.periodOptions.length > 0;
            const sectionTitle = pf?.label === 'Salary Range' ? 'Compensation' : pf?.label === 'Rate' ? 'Pricing / Rate' : 'Pricing';

            return (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">
                  {sectionTitle}
                </h2>

                {isRange ? (
                  /* --- Range mode (Jobs: salary min / max) --- */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>{pf?.label ? `${pf.label} (Min)` : 'Min'}</Label>
                        <Input
                          type="number"
                          value={attributes.salary_min || ''}
                          onChange={(e) => setAttributes({ ...attributes, salary_min: e.target.value })}
                          placeholder={pf?.placeholder || 'e.g., 50000'}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>{pf?.label ? `${pf.label} (Max)` : 'Max'}</Label>
                        <Input
                          type="number"
                          value={attributes.salary_max || ''}
                          onChange={(e) => setAttributes({ ...attributes, salary_max: e.target.value })}
                          placeholder={pf?.placeholderMax || 'e.g., 80000'}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="RWF">RWF (FRw)</SelectItem>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                            <SelectItem value="KES">KES (KSh)</SelectItem>
                            <SelectItem value="ZAR">ZAR (R)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {hasPeriod && (
                        <div>
                          <Label>Period</Label>
                          <Select value={attributes.salary_period || ''} onValueChange={(value) => setAttributes({ ...attributes, salary_period: value })}>
                            <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                            <SelectContent>
                              {pf!.periodOptions!.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Leave blank if you prefer not to disclose salary.</p>
                  </div>
                ) : hasPeriod ? (
                  /* --- Period mode (Services: rate, Property: price with period) --- */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">
                        {pf?.label || 'Price'}
                        {pf?.required !== false && ' *'}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder={pf?.placeholder || '0.00'}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="RWF">RWF (FRw)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="KES">KES (KSh)</SelectItem>
                          <SelectItem value="ZAR">ZAR (R)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Select value={formData.price_type} onValueChange={(value) => setFormData({ ...formData, price_type: value })}>
                        <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                        <SelectContent>
                          {pf!.periodOptions!.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {pf?.required === false && (
                      <p className="text-sm text-gray-500 col-span-full">Leave blank if pricing varies or is negotiable.</p>
                    )}
                  </div>
                ) : (
                  /* --- Standard mode (Motors, Electronics, Fashion, etc.) --- */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">
                        {pf?.label || 'Price'}
                        {pf?.required !== false && ' *'}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder={pf?.placeholder || '0.00'}
                        min="0"
                        step="0.01"
                        disabled={formData.price_type === 'free' || formData.price_type === 'contact'}
                      />
                      {formData.price_type === 'free' && (
                        <p className="text-sm text-green-600 mt-1">This item is listed for free.</p>
                      )}
                      {formData.price_type === 'contact' && (
                        <p className="text-sm text-gray-500 mt-1">Buyers will contact you for pricing.</p>
                      )}
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="RWF">RWF (FRw)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="KES">KES (KSh)</SelectItem>
                          <SelectItem value="ZAR">ZAR (R)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price Type</Label>
                      <Select value={formData.price_type} onValueChange={(value) => {
                        const updates: any = { ...formData, price_type: value };
                        if (value === 'free') updates.price = '0';
                        if (value === 'contact') updates.price = '0';
                        setFormData(updates);
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(pf?.priceTypeOptions || [
                            { value: 'fixed', label: 'Fixed' },
                            { value: 'negotiable', label: 'Negotiable' },
                          ]).map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Variants — only show for categories that support them */}
          {(() => {
            const catConfig = getCategoryConfig(selectedCategorySlug);
            const dims = catConfig?.variantDimensions;
            if (!dims || dims.length === 0) return null;
            return (
              <VariantBuilder
                dimensions={dims}
                variants={variantRows}
                onVariantsChange={setVariantRows}
                enabled={variantsEnabled}
                onEnabledChange={(on) => {
                  setVariantsEnabled(on);
                  if (!on) setVariantRows([]);
                }}
              />
            );
          })()}

          {/* Images */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Images {getCategoryConfig(selectedCategorySlug)?.imageRequired === false ? '(Optional — Max 10)' : '* (Max 10)'}

            </h2>
            {getCategoryConfig(selectedCategorySlug)?.imageGuidance && (
              <p className="text-sm text-gray-500 mb-3">{getCategoryConfig(selectedCategorySlug)?.imageGuidance}</p>
            )}



            <div className="space-y-4">

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">

                <input

                  type="file"

                  accept="image/*"

                  multiple

                  onChange={handleImageSelect}

                  className="hidden"

                  id="image-upload"

                  disabled={selectedImages.length >= 10}

                />

                <label

                  htmlFor="image-upload"

                  className={`cursor-pointer ${selectedImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}

                >

                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                  <p className="text-gray-600 mb-2">

                    Click to upload images

                  </p>

                  <p className="text-sm text-gray-500">

                    PNG, JPG up to 10MB each ({selectedImages.length}/10)

                  </p>

                </label>

              </div>



              {imagePreviews.length > 0 && (

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                  {imagePreviews.map((preview, index) => (

                    <div key={index} className="relative group">

                      <img

                        src={preview}

                        alt={`Preview ${index + 1}`}

                        className="w-full h-32 object-cover rounded-lg border border-gray-200"

                      />

                      <button

                        type="button"

                        onClick={() => removeImage(index)}

                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"

                      >

                        <X className="w-4 h-4" />

                      </button>

                      {index === 0 && (

                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">

                          Primary

                        </div>

                      )}

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>



          {/* Location & Countries */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Location

            </h2>



            <div className="space-y-4">

              <div>

                <Label htmlFor="location">Location Details</Label>

                <Input

                  id="location"

                  value={formData.location_details}

                  onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}

                  placeholder="e.g., Kigali, Kicukiro District"

                />

              </div>



              <div>

                <Label>Country *</Label>

                <Select
                  value={selectedCountries[0] || ''}
                  onValueChange={(value) => setSelectedCountries([value])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="flex items-center gap-2">
                          {country.flag_url && <img src={country.flag_url} alt={country.name} className="w-5 h-4 inline-block" />}
                          {country.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>

            </div>

          </div>



          {/* Contact Information */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Contact Information

            </h2>



            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <Label htmlFor="seller_name">Your Name *</Label>

                  <Input

                    id="seller_name"

                    value={formData.seller_name}

                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}

                    placeholder="John Doe"

                  />

                </div>



                <div>

                  <Label htmlFor="seller_type">Seller Type</Label>

                  <Select

                    value={formData.seller_type}

                    onValueChange={(value) => setFormData({ ...formData, seller_type: value })}

                  >

                    <SelectTrigger>

                      <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="individual">Individual</SelectItem>

                      <SelectItem value="dealer">Dealer</SelectItem>

                      <SelectItem value="agent">Agent</SelectItem>

                      <SelectItem value="company">Company</SelectItem>

                    </SelectContent>

                  </Select>

                </div>

              </div>



              <div>

                <Label htmlFor="seller_whatsapp" className="flex items-center gap-2">

                  <FaWhatsapp className="w-4 h-4 text-green-600" />

                  WhatsApp Number (Recommended)

                </Label>

                <Input

                  id="seller_whatsapp"

                  value={formData.seller_whatsapp}

                  onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}

                  placeholder="+250 XXX XXX XXX"

                />

                <p className="text-sm text-gray-500 mt-1">

                  Include country code (e.g., +250)

                </p>

              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <Label htmlFor="seller_phone">Phone Number</Label>

                  <Input

                    id="seller_phone"

                    value={formData.seller_phone}

                    onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}

                    placeholder="+250 XXX XXX XXX"

                  />

                </div>



                <div>

                  <Label htmlFor="seller_email">Email</Label>

                  <Input

                    id="seller_email"

                    type="email"

                    value={formData.seller_email}

                    onChange={(e) => setFormData({ ...formData, seller_email: e.target.value })}

                    placeholder="your@email.com"

                  />

                </div>

              </div>



              <div>

                <Label htmlFor="seller_website">Website (Optional)</Label>

                <Input

                  id="seller_website"

                  value={formData.seller_website}

                  onChange={(e) => setFormData({ ...formData, seller_website: e.target.value })}

                  placeholder="https://yourwebsite.com"

                />

              </div>

            </div>

          </div>



          {/* Important Notice */}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <div className="flex gap-3">

              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

              <div className="text-sm text-blue-900">

                <p className="font-semibold mb-1">Important Notice</p>

                <ul className="space-y-1">

                  <li>• Your ad will be reviewed before going live</li>

                  <li>• Make sure all information is accurate</li>

                  <li>• Upload clear, high-quality images</li>

                  <li>• Provide at least one contact method</li>

                </ul>

              </div>

            </div>

          </div>



          {/* Submit Button */}

          <div className="flex gap-4">

            <Button

              type="button"

              variant="outline"

              onClick={() => navigate('/marketplace')}

              className="flex-1"

              disabled={submitting}

            >

              Cancel

            </Button>

            <Button

              type="submit"

              className="flex-1 bg-blue-600 hover:bg-blue-700"

              disabled={submitting}

            >

              {submitting ? (

                <>

                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                  Submitting...

                </>

              ) : (

                <>

                  <CheckCircle className="w-4 h-4 mr-2" />

                  Submit Ad

                </>

              )}

            </Button>

          </div>

        </form>

      </main>



      <BottomBannerAd />

      <Footer />

    </div>

  );

};



export default PostListing;

