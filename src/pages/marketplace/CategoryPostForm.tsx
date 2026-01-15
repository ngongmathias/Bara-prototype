import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { categoryFieldConfigs, getCategoryConfig, type FieldConfig } from '@/config/categoryFieldConfigs';
import { uploadImage } from '@/utils/imageUpload';

export const CategoryPostForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [priceType, setPriceType] = useState('fixed');
  const [condition, setCondition] = useState('new');
  const [locationDetails, setLocationDetails] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sellerName, setSellerName] = useState('');
  const [sellerType, setSellerType] = useState('individual');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerWebsite, setSellerWebsite] = useState('');
  
  // Dynamic attributes based on category
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  
  // Images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchCountries();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to post a listing',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }
    setUser(user);
    setSellerEmail(user.email || '');
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast({
        title: 'Too Many Images',
        description: 'Maximum 10 images allowed',
        variant: 'destructive',
      });
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleAttributeChange = (fieldName: string, value: any) => {
    setAttributes(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleMultiselectChange = (fieldName: string, value: string, checked: boolean) => {
    setAttributes(prev => {
      const currentValues = prev[fieldName] || [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] };
      } else {
        return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== value) };
      }
    });
  };

  const handleTextareaToArray = (fieldName: string, value: string) => {
    const array = value.split('\n').filter(line => line.trim() !== '');
    setAttributes(prev => ({
      ...prev,
      [fieldName]: array
    }));
  };

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryId)) {
        return prev.filter(id => id !== countryId);
      } else {
        return [...prev, countryId];
      }
    });
  };

  const validateForm = (): boolean => {
    if (!selectedCategory) {
      toast({ title: 'Error', description: 'Please select a category', variant: 'destructive' });
      return false;
    }
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Please enter a title', variant: 'destructive' });
      return false;
    }
    if (!description.trim()) {
      toast({ title: 'Error', description: 'Please enter a description', variant: 'destructive' });
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid price', variant: 'destructive' });
      return false;
    }
    if (selectedCountries.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one country', variant: 'destructive' });
      return false;
    }
    if (!sellerName.trim()) {
      toast({ title: 'Error', description: 'Please enter your name', variant: 'destructive' });
      return false;
    }
    if (!sellerPhone.trim() && !sellerWhatsapp.trim() && !sellerEmail.trim()) {
      toast({ title: 'Error', description: 'Please provide at least one contact method', variant: 'destructive' });
      return false;
    }

    // Validate category-specific required fields
    const categoryConfig = getCategoryConfig(selectedCategory);
    if (categoryConfig) {
      for (const field of categoryConfig.fields) {
        if (field.required && !attributes[field.name]) {
          toast({ 
            title: 'Error', 
            description: `Please fill in: ${field.label}`, 
            variant: 'destructive' 
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const url = await uploadImage(image, 'marketplace');
        if (url) imageUrls.push(url);
      }

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          category_id: selectedCategory,
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          currency,
          price_type: priceType,
          condition,
          location_details: locationDetails.trim(),
          seller_name: sellerName.trim(),
          seller_type: sellerType,
          seller_phone: sellerPhone.trim() || null,
          seller_whatsapp: sellerWhatsapp.trim() || null,
          seller_email: sellerEmail.trim() || null,
          seller_website: sellerWebsite.trim() || null,
          attributes,
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Insert images
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          listing_id: listing.id,
          image_url: url,
          display_order: index,
          is_primary: index === primaryImageIndex
        }));

        const { error: imagesError } = await supabase
          .from('marketplace_listing_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      // Insert country associations
      const countryRecords = selectedCountries.map(countryId => ({
        listing_id: listing.id,
        country_id: countryId
      }));

      const { error: countriesError } = await supabase
        .from('marketplace_listing_countries')
        .insert(countryRecords);

      if (countriesError) throw countriesError;

      toast({
        title: 'Success!',
        description: 'Your listing has been posted successfully',
      });

      navigate(`/marketplace/listing/${listing.id}`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryConfig = getCategoryConfig(selectedCategory);

  const renderField = (field: FieldConfig) => {
    const value = attributes[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleAttributeChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              required={field.required}
            />
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleAttributeChange(field.name, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={Array.isArray(value) ? value.join('\n') : value}
              onChange={(e) => {
                if (field.helperText?.includes('one per line')) {
                  handleTextareaToArray(field.name, e.target.value);
                } else {
                  handleAttributeChange(field.name, e.target.value);
                }
              }}
              placeholder={field.placeholder}
              rows={4}
              required={field.required}
            />
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleAttributeChange(field.name, e.target.value)}
              required={field.required}
            />
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.name} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-3 border border-gray-200 rounded-lg p-4">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleMultiselectChange(field.name, option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`${field.name}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <TopBannerAd />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-comfortaa">
            Post a Listing
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to create your marketplace listing
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show category-specific guidance */}
            {categoryConfig?.imageGuidance && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Photo Guidelines</p>
                  <p className="text-sm text-blue-700">{categoryConfig.imageGuidance}</p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 font-comfortaa">
                Basic Information
              </h2>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 2020 Toyota Camry in excellent condition"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about your item..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="XAF">XAF</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="ZAR">ZAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type</Label>
                  <Select value={priceType} onValueChange={setPriceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category-Specific Fields */}
            {categoryConfig && categoryConfig.fields.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 font-comfortaa">
                  {categoryConfig.categoryName} Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryConfig.fields.map(field => renderField(field))}
                </div>
              </div>
            )}

            {/* Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 font-comfortaa">
                Images
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 10}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload images (Max 10)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {images.length}/10 images uploaded
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
                        className={`w-full h-32 object-cover rounded-lg ${
                          primaryImageIndex === index ? 'ring-4 ring-blue-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryImageIndex(index)}
                        className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${
                          primaryImageIndex === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700'
                        }`}
                      >
                        {primaryImageIndex === index ? 'Primary' : 'Set Primary'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 font-comfortaa">
                Location
              </h2>

              <div className="space-y-2">
                <Label htmlFor="location">Location Details</Label>
                <Input
                  id="location"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g., Downtown, Near City Mall"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Target Countries <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {countries.map(country => (
                    <div key={country.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.id}`}
                        checked={selectedCountries.includes(country.id)}
                        onCheckedChange={() => handleCountryToggle(country.id)}
                      />
                      <label
                        htmlFor={`country-${country.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {country.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 font-comfortaa">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerName">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sellerName"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerType">Seller Type</Label>
                  <Select value={sellerType} onValueChange={setSellerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerPhone">Phone Number</Label>
                  <Input
                    id="sellerPhone"
                    type="tel"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerWhatsapp">WhatsApp Number</Label>
                  <Input
                    id="sellerWhatsapp"
                    type="tel"
                    value={sellerWhatsapp}
                    onChange={(e) => setSellerWhatsapp(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerEmail">Email</Label>
                  <Input
                    id="sellerEmail"
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerWebsite">Website (Optional)</Label>
                  <Input
                    id="sellerWebsite"
                    type="url"
                    value={sellerWebsite}
                    onChange={(e) => setSellerWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/marketplace')}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Listing'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default CategoryPostForm;
