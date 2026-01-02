import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';

interface FormData {
  category_id: string;
  subcategory_id: string;
  country_id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  price_type: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_whatsapp: string;
  seller_type: string;
  location_details: string;
  attributes: { [key: string]: string };
  images: File[];
}

export const PostListing = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    category_id: '',
    subcategory_id: '',
    country_id: '',
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    price_type: 'fixed',
    seller_name: user?.fullName || '',
    seller_email: user?.primaryEmailAddress?.emailAddress || '',
    seller_phone: '',
    seller_whatsapp: '',
    seller_type: 'individual',
    location_details: '',
    attributes: {},
    images: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
      const category = categories.find(c => c.id === formData.category_id);
      setSelectedCategory(category);
    }
  }, [formData.category_id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('marketplace_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    setCategories(data || []);
  };

  const fetchSubcategories = async (categoryId: string) => {
    const { data } = await supabase
      .from('marketplace_subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order');
    setSubcategories(data || []);
  };

  const fetchCountries = async () => {
    const { data } = await supabase
      .from('countries')
      .select('id, name, code')
      .order('name');
    setCountries(data || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 10)
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to post a listing');
      navigate('/sign-in');
      return;
    }

    setLoading(true);
    try {
      // Insert listing
      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .insert({
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || null,
          country_id: formData.country_id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          price_type: formData.price_type,
          seller_name: formData.seller_name,
          seller_email: formData.seller_email,
          seller_phone: formData.seller_phone,
          seller_whatsapp: formData.seller_whatsapp,
          seller_type: formData.seller_type,
          location_details: formData.location_details,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Insert attributes
      if (Object.keys(formData.attributes).length > 0) {
        const attributes = Object.entries(formData.attributes).map(([key, value]) => ({
          listing_id: listing.id,
          attribute_key: key,
          attribute_value: value,
        }));

        await supabase
          .from('marketplace_listing_attributes')
          .insert(attributes);
      }

      // Upload images (simplified - in production use Supabase Storage)
      // For now, we'll skip actual image upload and just show success

      alert('Listing submitted successfully! It will be reviewed by our team.');
      navigate('/marketplace/my-listings');
    } catch (error) {
      console.error('Error submitting listing:', error);
      alert('Error submitting listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.category_id && formData.country_id;
      case 2:
        return formData.title && formData.description && formData.price;
      case 3:
        return true; // Attributes are optional
      case 4:
        return formData.seller_name && formData.seller_email && (formData.seller_phone || formData.seller_whatsapp);
      case 5:
        return formData.location_details;
      case 6:
        return formData.images.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s === step
                      ? 'bg-black text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-black rounded-full transition-all"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            {/* Step 1: Category & Country */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black font-comfortaa">Select Category & Location</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Category *
                  </label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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

                {subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                      Subcategory (Optional)
                    </label>
                    <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subcategory" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Country *
                  </label>
                  <Select value={formData.country_id} onValueChange={(value) => setFormData({ ...formData, country_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black font-comfortaa">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., 2024 Toyota Camry, 3BR Apartment, Marketing Manager"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your listing..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                      Price *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                      Currency
                    </label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="RWF">RWF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Price Type
                  </label>
                  <Select value={formData.price_type} onValueChange={(value) => setFormData({ ...formData, price_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Category-Specific Attributes */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black font-comfortaa">Additional Details</h2>
                <p className="text-gray-600 font-roboto">Add specific details about your {selectedCategory?.name}</p>
                
                {/* Dynamic attributes based on category - simplified for now */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                      Condition
                    </label>
                    <Select 
                      value={formData.attributes.condition || ''} 
                      onValueChange={(value) => setFormData({ ...formData, attributes: { ...formData.attributes, condition: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-roboto">More category-specific fields can be added here</p>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black font-comfortaa">Contact Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Your Name *
                  </label>
                  <Input
                    value={formData.seller_name}
                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.seller_email}
                    onChange={(e) => setFormData({ ...formData, seller_email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Phone Number *
                  </label>
                  <Input
                    value={formData.seller_phone}
                    onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    WhatsApp Number (Optional)
                  </label>
                  <Input
                    value={formData.seller_whatsapp}
                    onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Seller Type
                  </label>
                  <Select value={formData.seller_type} onValueChange={(value) => setFormData({ ...formData, seller_type: value })}>
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
            )}

            {/* Step 5: Location */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black font-comfortaa">Location Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Full Address *
                  </label>
                  <Textarea
                    value={formData.location_details}
                    onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                    placeholder="Street address, city, area..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Images */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black font-comfortaa">Upload Photos</h2>
                <p className="text-gray-600 font-roboto">Add up to 10 photos (first photo will be the main image)</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-roboto">Click to upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2 font-roboto">PNG, JPG up to 5MB each</p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="font-roboto"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step < 6 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-black hover:bg-gray-800 font-roboto"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="bg-green-600 hover:bg-green-700 font-roboto"
                >
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostListing;
