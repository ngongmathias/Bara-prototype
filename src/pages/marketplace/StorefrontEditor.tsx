import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Store, ArrowLeft, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const StorefrontEditor = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    display_name: '',
    business_type: 'individual',
    description: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    website: '',
    city: '',
    country_id: '',
  });

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch countries
      const { data: countriesData } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');
      setCountries(countriesData || []);

      // Fetch partner profile
      const { data: partnerData } = await supabase
        .from('marketplace_partners')
        .select('*')
        .eq('owner_user_id', user!.id)
        .maybeSingle();

      if (partnerData) {
        setPartner(partnerData);
        setFormData({
          display_name: partnerData.display_name || '',
          business_type: partnerData.business_type || 'individual',
          description: partnerData.description || '',
          contact_email: partnerData.contact_email || '',
          contact_phone: partnerData.contact_phone || '',
          contact_whatsapp: partnerData.contact_whatsapp || '',
          website: partnerData.website || '',
          city: partnerData.city || '',
          country_id: partnerData.country_id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const slugBase = formData.display_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);

      const updateData: any = {
        owner_user_id: user.id,
        ...formData,
        slug: partner?.slug || `${slugBase}-${user.id.slice(-6)}`,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('marketplace_partners')
        .upsert(updateData, { onConflict: 'owner_user_id' })
        .select()
        .single();

      if (error) throw error;

      setPartner(data);
      toast({
        title: 'Success',
        description: 'Your storefront has been updated!',
      });
    } catch (error: any) {
      console.error('Error saving storefront:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save storefront',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'cover', file: File) => {
    if (!user || !file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const columnName = type === 'logo' ? 'logo_url' : 'cover_url';
      const { error: updateError } = await supabase
        .from('marketplace_partners')
        .update({ [columnName]: publicUrl })
        .eq('owner_user_id', user.id);

      if (updateError) throw updateError;

      setPartner((prev: any) => ({ ...prev, [columnName]: publicUrl }));
      toast({
        title: 'Success',
        description: `${type === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully!`,
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketplace/my-ads')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Ads
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-comfortaa flex items-center gap-2">
              <Store className="w-8 h-8" />
              Edit Storefront
            </h1>
            <p className="text-gray-600 mt-1">Manage your marketplace seller profile</p>
          </div>
          {partner?.slug && (
            <Button
              variant="outline"
              onClick={() => navigate(`/marketplace/store/${partner.slug}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Storefront Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <Label>Logo</Label>
                <div className="mt-2">
                  {partner?.logo_url ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={partner.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Square image recommended (500x500px)</p>
                </div>
              </div>

              {/* Cover */}
              <div>
                <Label>Cover Image</Label>
                <div className="mt-2">
                  {partner?.cover_url ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={partner.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('cover', e.target.files[0])}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Wide image recommended (1200x400px)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="display_name">Store / Brand Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Amara Fashion House"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the name customers will see on your storefront.
                  {formData.display_name && !partner && (
                    <span className="block mt-0.5 text-blue-600">
                      Your store URL will be: baraafrika.com/marketplace/store/{formData.display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                    </span>
                  )}
                  {partner?.slug && (
                    <span className="block mt-0.5 text-blue-600">
                      Your store URL: baraafrika.com/marketplace/store/{partner.slug}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => setFormData({ ...formData, business_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Seller</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">About Your Store</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell buyers about your business..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>

              <div>
                <Label htmlFor="contact_whatsapp">WhatsApp Number</Label>
                <Input
                  id="contact_whatsapp"
                  type="tel"
                  value={formData.contact_whatsapp}
                  onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country_id">Country</Label>
                <Select
                  value={formData.country_id}
                  onValueChange={(value) => setFormData({ ...formData, country_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
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

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City name"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/marketplace/my-ads')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default StorefrontEditor;
