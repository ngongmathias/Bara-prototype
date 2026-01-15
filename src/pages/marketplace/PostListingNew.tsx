import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { uploadImage } from '@/lib/uploadImage';
import { useCountrySelection } from '@/context/CountrySelectionContext';

export const PostListingNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCountry } = useCountrySelection();
  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    checkAuth();
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to post a listing',
          variant: 'destructive',
        });
        navigate('/user/sign-in?redirect=/marketplace/post');
        return;
      }

      setUser(user);
      
      // Pre-fill user info if available
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          seller_name: profile.full_name || user.email?.split('@')[0] || '',
          seller_email: user.email || '',
          seller_phone: profile.phone || '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          seller_name: user.email?.split('@')[0] || '',
          seller_email: user.email || '',
        }));
      }
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
          created_by: user.id,
          views_count: 0,
          favorites_count: 0,
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
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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
              </div>
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
