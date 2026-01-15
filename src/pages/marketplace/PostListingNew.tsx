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
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { uploadImage } from '@/lib/storage';
import { useCountrySelection } from '@/context/CountrySelectionContext';

export const PostListingNew = () => {
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
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
  });

  // Category-specific attributes
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');

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
          description: 'Please sign in to post a listing',
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
      const { data } = await supabase
        .from('countries')
        .select('id, name, code, flag_url')
        .order('name');
      
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
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

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return false;
    }

    if (selectedCountries.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one country',
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

    if (selectedImages.length === 0) {
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
      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .insert({
          ...formData,
          price: parseFloat(formData.price),
          country_id: selectedCountries[0], // Primary country
          status: 'pending',
          created_by: userId,
          views_count: 0,
          favorites_count: 0,
          attributes: Object.keys(attributes).length > 0 ? attributes : null,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Insert images
      const imagesWithListingId = uploadedImages.map(img => ({
        ...img,
        listing_id: listing.id,
      }));

      const { error: imagesError } = await supabase
        .from('marketplace_listing_images')
        .insert(imagesWithListingId);

      if (imagesError) throw imagesError;

      // Insert country associations
      const countryInserts = selectedCountries.map(countryId => ({
        listing_id: listing.id,
        country_id: countryId,
      }));

      const { error: countriesError } = await supabase
        .from('marketplace_listing_countries')
        .insert(countryInserts);

      if (countriesError) throw countriesError;

      toast({
        title: 'Success!',
        description: 'Your listing has been submitted for review',
      });

      navigate(`/marketplace/listing/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
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
            Post Your Ad
          </h1>
          <p className="text-gray-600">
            Fill in the details below to create your listing
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
                <p className="text-sm text-gray-500 mt-1">
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
                      setFormData({ ...formData, category_id: value });
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

                {/* Only show condition for physical products, not services/jobs/pets */}
                {!['jobs', 'services', 'pets', 'businesses-industrial'].includes(selectedCategorySlug) && (
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
                        onValueChange={(value) => setAttributes({...attributes, make: value})}
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
                        onChange={(e) => setAttributes({...attributes, model: e.target.value})}
                        placeholder="e.g., Camry"
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Select value={attributes.year || ''} onValueChange={(value) => setAttributes({...attributes, year: value})}>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 10}, (_, i) => 2024 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Body Type</Label>
                      <Select value={attributes.body_type || ''} onValueChange={(value) => setAttributes({...attributes, body_type: value})}>
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
                      <Select value={attributes.fuel_type || ''} onValueChange={(value) => setAttributes({...attributes, fuel_type: value})}>
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
                      <Select value={attributes.transmission || ''} onValueChange={(value) => setAttributes({...attributes, transmission: value})}>
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
                        onChange={(e) => setAttributes({...attributes, mileage: e.target.value})}
                        placeholder="e.g., 35000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(selectedCategorySlug === 'property-sale' || selectedCategorySlug === 'property-rent') && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Property Type</Label>
                      <Select value={attributes.property_type || ''} onValueChange={(value) => setAttributes({...attributes, property_type: value})}>
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
                      <Select value={attributes.bedrooms?.toString() || ''} onValueChange={(value) => setAttributes({...attributes, bedrooms: parseInt(value)})}>
                        <SelectTrigger><SelectValue placeholder="Select bedrooms" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bathrooms</Label>
                      <Select value={attributes.bathrooms?.toString() || ''} onValueChange={(value) => setAttributes({...attributes, bathrooms: parseInt(value)})}>
                        <SelectTrigger><SelectValue placeholder="Select bathrooms" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(num => (
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
                        onChange={(e) => setAttributes({...attributes, area: e.target.value})}
                        placeholder="e.g., 120"
                      />
                    </div>
                    <div>
                      <Label>Furnished</Label>
                      <Select value={attributes.furnished || ''} onValueChange={(value) => setAttributes({...attributes, furnished: value})}>
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
                        onChange={(e) => setAttributes({...attributes, brand: e.target.value})}
                        placeholder="e.g., Apple, Samsung"
                      />
                    </div>
                    <div>
                      <Label>Warranty</Label>
                      <Select value={attributes.warranty || ''} onValueChange={(value) => setAttributes({...attributes, warranty: value})}>
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
                      <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({...attributes, gender: value})}>
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
                      <Select value={attributes.size || ''} onValueChange={(value) => setAttributes({...attributes, size: value})}>
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
                    <div>
                      <Label>Job Type</Label>
                      <Select value={attributes.job_type || ''} onValueChange={(value) => setAttributes({...attributes, job_type: value})}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Experience Level</Label>
                      <Select value={attributes.experience_level || ''} onValueChange={(value) => setAttributes({...attributes, experience_level: value})}>
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
                      <Select value={attributes.work_type || ''} onValueChange={(value) => setAttributes({...attributes, work_type: value})}>
                        <SelectTrigger><SelectValue placeholder="Select work type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {selectedCategorySlug === 'pets' && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Pet Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Pet Type</Label>
                      <Select value={attributes.pet_type || ''} onValueChange={(value) => setAttributes({...attributes, pet_type: value})}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dog">Dog</SelectItem>
                          <SelectItem value="Cat">Cat</SelectItem>
                          <SelectItem value="Bird">Bird</SelectItem>
                          <SelectItem value="Fish">Fish</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Select value={attributes.pet_age || ''} onValueChange={(value) => setAttributes({...attributes, pet_age: value})}>
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
                      <Select value={attributes.pet_gender || ''} onValueChange={(value) => setAttributes({...attributes, pet_gender: value})}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Label htmlFor="price_type">Price Type</Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value) => setFormData({ ...formData, price_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                    <SelectItem value="yearly">Per Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">
              Images * (Max 10)
            </h2>

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
              Location & Visibility
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
                <Label>Target Countries * (Select where your ad will appear)</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 mt-2">
                  {countries.map((country) => (
                    <label
                      key={country.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.id)}
                        onChange={() => toggleCountrySelection(country.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="flex items-center space-x-2">
                        {country.flag_url && (
                          <img src={country.flag_url} alt={country.name} className="w-5 h-4" />
                        )}
                        <span className="text-sm">{country.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedCountries.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCountries.map(countryId => {
                      const country = countries.find(c => c.id === countryId);
                      return country ? (
                        <div key={countryId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {country.flag_url && <img src={country.flag_url} alt={country.name} className="w-4 h-3" />}
                          <span>{country.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
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
                  <li>• Your listing will be reviewed before going live</li>
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
                  Submit Listing
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

export default PostListingNew;
