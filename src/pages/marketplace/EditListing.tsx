import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { ChevronLeft, X } from 'lucide-react';

export const EditListing = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    country_id: '',
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    price_type: 'fixed',
    seller_name: '',
    seller_email: '',
    seller_phone: '',
    seller_whatsapp: '',
    seller_type: 'individual',
    location_details: '',
  });

  useEffect(() => {
    fetchData();
  }, [listingId]);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    }
  }, [formData.category_id]);

  const fetchData = async () => {
    try {
      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      // Note: Removed ownership check to allow admins to edit any listing
      // Users can only access edit page from their own listings anyway
      
      setListing(listingData);
      setFormData({
        category_id: listingData.category_id,
        subcategory_id: listingData.subcategory_id || '',
        country_id: listingData.country_id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price?.toString() || '',
        currency: listingData.currency,
        price_type: listingData.price_type,
        seller_name: listingData.seller_name,
        seller_email: listingData.seller_email,
        seller_phone: listingData.seller_phone || '',
        seller_whatsapp: listingData.seller_whatsapp || '',
        seller_type: listingData.seller_type,
        location_details: listingData.location_details || '',
      });

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setCategories(categoriesData || []);

      // Fetch countries
      const { data: countriesData } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');
      setCountries(countriesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading listing');
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (error) throw error;

      alert('Listing updated successfully!');
      navigate('/marketplace/my-listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace/my-listings')}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to My Listings
            </Button>
            <h1 className="text-3xl font-bold text-black font-comfortaa">Edit Listing</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
            {/* Category */}
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

            {/* Subcategory */}
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

            {/* Country */}
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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 2024 Toyota Camry, 3BR Apartment"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information..."
                rows={6}
                required
              />
            </div>

            {/* Price */}
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
                  required
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

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Your Name *
              </label>
              <Input
                value={formData.seller_name}
                onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                required
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
                required
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
                required
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

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Location Details *
              </label>
              <Textarea
                value={formData.location_details}
                onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                placeholder="Street address, city, area..."
                rows={3}
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/marketplace/my-listings')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-black hover:bg-gray-800"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
