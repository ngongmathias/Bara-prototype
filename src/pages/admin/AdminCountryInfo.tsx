import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Globe, 
  MapPin, 
  Users, 
  Building, 
  DollarSign,
  Calendar,
  Phone,
  Star,
  Landmark,
  FileText,
  Save,
  X,
  Trash2,
  Upload,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  flag_emoji: string | null;
}

interface CountryInfo {
  id: string;
  country_id: string;
  description: string | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
  population: number | null;
  area_sq_km: number | null;
  president_name: string | null;
  government_type: string | null;
  formation_date: string | null;
  gdp_usd: number | null;
  gdp_per_capita: number | null;
  currency_code: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  calling_code: string | null;
  average_age: number | null;
  largest_city: string | null;
  largest_city_population: number | null;
  capital_population: number | null;
  hdi_score: number | null;
  literacy_rate: number | null;
  life_expectancy: number | null;
  ethnic_groups: any[] | null;
  religions: any[] | null;
  national_holidays: any[] | null;
  flag_url: string | null;
  coat_of_arms_url: string | null;
  leader_image_url: string | null;
  monument_image_url: string | null;
  national_anthem_url: string | null;
  climate: string | null;
  natural_resources: string | null;
  main_industries: string | null;
  tourism_attractions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Country Page Advertisement fields
  ad_image_url?: string | null;
  ad_company_name?: string | null;
  ad_company_website?: string | null;
  ad_tagline?: string | null;
  ad_is_active?: boolean;
  ad_click_count?: number;
  ad_view_count?: number;
}

export const AdminCountryInfo: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryInfo, setCountryInfo] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<CountryInfo | null>(null);
  const [formData, setFormData] = useState<Partial<CountryInfo>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImageType, setUploadingImageType] = useState<'coat_of_arms' | 'flag' | 'leader' | 'monument' | 'country_ad' | null>(null);

  useEffect(() => {
    fetchCountries();
    fetchCountryInfo();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await db.countries()
        .select('id, name, code, flag_url, flag_emoji')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to fetch countries');
    }
  };

  const fetchCountryInfo = async () => {
    try {
      const { data, error } = await db.country_info()
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCountryInfo(data || []);
    } catch (error) {
      console.error('Error fetching country info:', error);
      toast.error('Failed to fetch country information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingInfo(null);
    setFormData({});
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (info: CountryInfo) => {
    setEditingInfo(info);
    setFormData(info);
    setImagePreview(info.coat_of_arms_url || null);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'coat_of_arms' | 'flag' | 'leader' | 'monument' | 'country_ad') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadingImageType(imageType);
    try {
      const folderMap = {
        coat_of_arms: 'country-coat-of-arms',
        flag: 'country-flags',
        leader: 'country-leaders',
        monument: 'country-monuments',
        country_ad: 'country-page-ads'  // Dedicated bucket for country ads
      };
      
      const imageUrl = await uploadImage(file, folderMap[imageType], 'images');
      
      const fieldMap = {
        coat_of_arms: 'coat_of_arms_url',
        flag: 'flag_url',
        leader: 'leader_image_url',
        monument: 'monument_image_url',
        country_ad: 'ad_image_url'
      };
      
      setFormData({ ...formData, [fieldMap[imageType]]: imageUrl });
      toast.success(`${imageType.replace('_', ' ')} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      setUploadingImageType(null);
    }
  };

  const handleSave = async () => {
    try {
      if (editingInfo) {
        // Update existing
        const { error } = await db.country_info()
          .update(formData)
          .eq('id', editingInfo.id);

        if (error) throw error;
        toast.success('Country information updated successfully');
      } else {
        // Create new
        const { error } = await db.country_info()
          .insert([formData]);

        if (error) throw error;
        toast.success('Country information created successfully');
      }

      setIsDialogOpen(false);
      setImagePreview(null);
      fetchCountryInfo();
    } catch (error) {
      console.error('Error saving country info:', error);
      toast.error('Failed to save country information');
    }
  };

  const handleDelete = async (info: CountryInfo) => {
    const country = countries.find(c => c.id === info.country_id);
    if (!confirm(`Are you sure you want to delete the country information for ${country?.name}?`)) {
      return;
    }

    try {
      const { error } = await db.country_info()
        .delete()
        .eq('id', info.id);

      if (error) throw error;
      toast.success('Country information deleted successfully');
      fetchCountryInfo();
    } catch (error) {
      console.error('Error deleting country info:', error);
      toast.error('Failed to delete country information');
    }
  };

  const filteredInfo = countryInfo.filter(info => {
    const country = countries.find(c => c.id === info.country_id);
    const matchesSearch = 
      country?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.capital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.president_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !selectedCountry || selectedCountry === "all" || info.country_id === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return `${value.length} items`;
    return String(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Country Information</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Country Information</h1>
            <p className="text-gray-600">Manage detailed information for each country</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Country Info
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Filter by Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCountry('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Country Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfo.map((info) => {
            const country = countries.find(c => c.id === info.country_id);
            return (
            <Card key={info.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {country?.flag_url && (
                      <img 
                        src={country.flag_url} 
                        alt={`${country.name} flag`}
                        className="w-8 h-6 rounded shadow-sm"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">{country?.name}</CardTitle>
                      <p className="text-sm text-gray-600">{country?.code}</p>
                    </div>
                  </div>
                  <Badge variant={info.is_active ? "default" : "secondary"}>
                    {info.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Capital:</span>
                    <p className="font-medium">{formatValue(info.capital)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Population:</span>
                    <p className="font-medium">{formatValue(info.population)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">President:</span>
                    <p className="font-medium truncate">{formatValue(info.president_name)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">GDP:</span>
                    <p className="font-medium">{formatValue(info.gdp_usd)}</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Globe className="w-5 h-5" />
                          <span>{country?.name} - Detailed Information</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Description</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.description || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Capital</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.capital || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Currency</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.currency || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Language</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.language || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Population</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.population?.toLocaleString() || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Area (km²)</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.area_sq_km?.toLocaleString() || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Government & Leadership */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Government & Leadership</h3>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">President</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.president_name || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Government Type</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.government_type || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Formation Date</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.formation_date || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Economic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Economic Information</h3>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">GDP (USD)</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.gdp_usd?.toLocaleString() || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">GDP Per Capita</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.gdp_per_capita?.toLocaleString() || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Currency Code</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.currency_code || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Geographic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Geographic Information</h3>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Coordinates</Label>
                              <p className="text-sm text-gray-600 mt-1">
                                {info.latitude && info.longitude 
                                  ? `${info.latitude}, ${info.longitude}` 
                                  : 'Not provided'
                                }
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.timezone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Calling Code</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.calling_code || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Demographics */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Demographics</h3>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Average Age</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.average_age || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Largest City</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.largest_city || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Largest City Population</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.largest_city_population?.toLocaleString() || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Capital Population</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.capital_population?.toLocaleString() || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">HDI Score</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.hdi_score || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Life Expectancy</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.life_expectancy || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Climate</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.climate || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Natural Resources</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.natural_resources || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Main Industries</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.main_industries || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Tourism Attractions</Label>
                              <p className="text-sm text-gray-600 mt-1">{info.tourism_attractions || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(info)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(info)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {filteredInfo.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No country information found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCountry 
                  ? 'Try adjusting your search criteria' 
                  : 'No country information has been added yet'
                }
              </p>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Country Information
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInfo ? 'Edit Country Information' : 'Add Country Information'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
                  <Label htmlFor="country_id">Country *</Label>
                  <Select 
                    value={formData.country_id || undefined} 
                    onValueChange={(value) => setFormData({...formData, country_id: value})}
                  >
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Country description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="capital">Capital</Label>
                  <Input
                    id="capital"
                    value={formData.capital || ''}
                    onChange={(e) => setFormData({...formData, capital: e.target.value})}
                    placeholder="Capital city"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    placeholder="Currency name"
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language || ''}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    placeholder="Official language"
                  />
                </div>

                <div>
                  <Label htmlFor="population">Population</Label>
                  <Input
                    id="population"
                    type="number"
                    value={formData.population || ''}
                    onChange={(e) => setFormData({...formData, population: parseInt(e.target.value) || null})}
                    placeholder="Population"
                  />
                </div>

                <div>
                  <Label htmlFor="area_sq_km">Area (km²)</Label>
                  <Input
                    id="area_sq_km"
                    type="number"
                    value={formData.area_sq_km || ''}
                    onChange={(e) => setFormData({...formData, area_sq_km: parseFloat(e.target.value) || null})}
                    placeholder="Area in square kilometers"
                  />
                </div>
              </div>

              {/* Government & Leadership */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Government & Leadership</h3>
                
                <div>
                  <Label htmlFor="president_name">President/Leader</Label>
                  <Input
                    id="president_name"
                    value={formData.president_name || ''}
                    onChange={(e) => setFormData({...formData, president_name: e.target.value})}
                    placeholder="Current president or leader"
                  />
                </div>

                <div>
                  <Label htmlFor="government_type">Government Type</Label>
                  <Input
                    id="government_type"
                    value={formData.government_type || ''}
                    onChange={(e) => setFormData({...formData, government_type: e.target.value})}
                    placeholder="e.g., Republic, Monarchy"
                  />
                </div>

                <div>
                  <Label htmlFor="formation_date">Formation Date</Label>
                  <Input
                    id="formation_date"
                    type="date"
                    value={formData.formation_date || ''}
                    onChange={(e) => setFormData({...formData, formation_date: e.target.value})}
                  />
                </div>
              </div>

              {/* Economic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Economic Information</h3>
                
                <div>
                  <Label htmlFor="gdp_usd">GDP (USD)</Label>
                  <Input
                    id="gdp_usd"
                    type="number"
                    value={formData.gdp_usd || ''}
                    onChange={(e) => setFormData({...formData, gdp_usd: parseFloat(e.target.value) || null})}
                    placeholder="GDP in USD"
                  />
                </div>

                <div>
                  <Label htmlFor="gdp_per_capita">GDP Per Capita</Label>
                  <Input
                    id="gdp_per_capita"
                    type="number"
                    value={formData.gdp_per_capita || ''}
                    onChange={(e) => setFormData({...formData, gdp_per_capita: parseFloat(e.target.value) || null})}
                    placeholder="GDP per capita"
                  />
                </div>

                <div>
                  <Label htmlFor="currency_code">Currency Code</Label>
                  <Input
                    id="currency_code"
                    value={formData.currency_code || ''}
                    onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
                    placeholder="e.g., USD, EUR"
                  />
                </div>
              </div>

              {/* Geographic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Geographic Information</h3>
                
                <div>
                  <Label htmlFor="coordinates_combined">Coordinates (Combined Format)</Label>
                  <Input
                    id="coordinates_combined"
                    value={
                      formData.latitude && formData.longitude
                        ? `${Math.abs(formData.latitude)}° ${formData.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(formData.longitude)}° ${formData.longitude >= 0 ? 'E' : 'W'}`
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      // Parse format like "1.9403° S, 29.8739° E"
                      const match = value.match(/([0-9.]+)°?\s*([NS]),?\s*([0-9.]+)°?\s*([EW])/i);
                      if (match) {
                        const lat = parseFloat(match[1]) * (match[2].toUpperCase() === 'S' ? -1 : 1);
                        const lon = parseFloat(match[3]) * (match[4].toUpperCase() === 'W' ? -1 : 1);
                        setFormData({...formData, latitude: lat, longitude: lon});
                      }
                    }}
                    placeholder="e.g., 1.9403° S, 29.8739° E"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: [number]° N/S, [number]° E/W</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude (Decimal)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || null})}
                      placeholder="e.g., -1.9403"
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude">Longitude (Decimal)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || null})}
                      placeholder="e.g., 29.8739"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone || ''}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    placeholder="e.g., UTC+2"
                  />
                </div>

                <div>
                  <Label htmlFor="calling_code">Calling Code</Label>
                  <Input
                    id="calling_code"
                    value={formData.calling_code || ''}
                    onChange={(e) => setFormData({...formData, calling_code: e.target.value})}
                    placeholder="e.g., +20"
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Demographics</h3>
                
                <div>
                  <Label htmlFor="average_age">Average Age</Label>
                  <Input
                    id="average_age"
                    type="number"
                    step="any"
                    value={formData.average_age || ''}
                    onChange={(e) => setFormData({...formData, average_age: parseFloat(e.target.value) || null})}
                    placeholder="Average age"
                  />
                </div>

                <div>
                  <Label htmlFor="largest_city">Largest City</Label>
                  <Input
                    id="largest_city"
                    value={formData.largest_city || ''}
                    onChange={(e) => setFormData({...formData, largest_city: e.target.value})}
                    placeholder="Largest city by population"
                  />
                </div>

                <div>
                  <Label htmlFor="largest_city_population">Largest City Population</Label>
                  <Input
                    id="largest_city_population"
                    type="number"
                    value={formData.largest_city_population || ''}
                    onChange={(e) => setFormData({...formData, largest_city_population: parseInt(e.target.value) || null})}
                    placeholder="Population of largest city"
                  />
                </div>

                <div>
                  <Label htmlFor="capital_population">Capital Population</Label>
                  <Input
                    id="capital_population"
                    type="number"
                    value={formData.capital_population || ''}
                    onChange={(e) => setFormData({...formData, capital_population: parseInt(e.target.value) || null})}
                    placeholder="Population of capital city"
                  />
                </div>

                <div>
                  <Label htmlFor="hdi_score">HDI Score</Label>
                  <Input
                    id="hdi_score"
                    type="number"
                    step="any"
                    min="0"
                    max="1"
                    value={formData.hdi_score || ''}
                    onChange={(e) => setFormData({...formData, hdi_score: parseFloat(e.target.value) || null})}
                    placeholder="Human Development Index (0-1)"
                  />
                </div>

                <div>
                  <Label htmlFor="life_expectancy">Life Expectancy</Label>
                  <Input
                    id="life_expectancy"
                    type="number"
                    step="any"
                    value={formData.life_expectancy || ''}
                    onChange={(e) => setFormData({...formData, life_expectancy: parseFloat(e.target.value) || null})}
                    placeholder="Life expectancy in years"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                
                <div>
                  <Label htmlFor="climate">Climate</Label>
                  <Input
                    id="climate"
                    value={formData.climate || ''}
                    onChange={(e) => setFormData({...formData, climate: e.target.value})}
                    placeholder="Climate description"
                  />
                </div>

                <div>
                  <Label htmlFor="natural_resources">Natural Resources</Label>
                  <Textarea
                    id="natural_resources"
                    value={formData.natural_resources || ''}
                    onChange={(e) => setFormData({...formData, natural_resources: e.target.value})}
                    placeholder="Natural resources..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="main_industries">Main Industries</Label>
                  <Textarea
                    id="main_industries"
                    value={formData.main_industries || ''}
                    onChange={(e) => setFormData({...formData, main_industries: e.target.value})}
                    placeholder="Main industries..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="tourism_attractions">Tourism Attractions</Label>
                  <Textarea
                    id="tourism_attractions"
                    value={formData.tourism_attractions || ''}
                    onChange={(e) => setFormData({...formData, tourism_attractions: e.target.value})}
                    placeholder="Tourism attractions..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Visual Assets */}
              <div className="space-y-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Visual Assets</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Flag */}
                  <div>
                    <Label htmlFor="flag_image">Flag</Label>
                    <div className="space-y-2">
                      {formData.flag_url && (
                        <div className="relative">
                          <img 
                            src={formData.flag_url} 
                            alt="Flag preview"
                            className="w-full h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({...formData, flag_url: null})}
                            className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        id="flag_image"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'flag')}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="flag_image"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                      >
                        {uploadingImage && uploadingImageType === 'flag' ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Flag</span>
                      </label>
                    </div>
                  </div>

                  {/* Coat of Arms */}
                  <div>
                    <Label htmlFor="coat_of_arms">Coat of Arms</Label>
                    <div className="space-y-2">
                      {formData.coat_of_arms_url && (
                        <div className="relative">
                          <img 
                            src={formData.coat_of_arms_url} 
                            alt="Coat of arms preview"
                            className="w-full h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({...formData, coat_of_arms_url: null})}
                            className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        id="coat_of_arms"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'coat_of_arms')}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="coat_of_arms"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                      >
                        {uploadingImage && uploadingImageType === 'coat_of_arms' ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Coat of Arms</span>
                      </label>
                    </div>
                  </div>

                  {/* President/Leader Photo */}
                  <div>
                    <Label htmlFor="leader_image">President/Leader Photo</Label>
                    <div className="space-y-2">
                      {formData.leader_image_url && (
                        <div className="relative">
                          <img 
                            src={formData.leader_image_url} 
                            alt="Leader preview"
                            className="w-full h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({...formData, leader_image_url: null})}
                            className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        id="leader_image"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'leader')}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="leader_image"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                      >
                        {uploadingImage && uploadingImageType === 'leader' ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Leader Photo</span>
                      </label>
                    </div>
                  </div>

                  {/* Monument/Landmark Photo */}
                  <div>
                    <Label htmlFor="monument_image">Monument/Landmark Photo</Label>
                    <div className="space-y-2">
                      {formData.monument_image_url && (
                        <div className="relative">
                          <img 
                            src={formData.monument_image_url} 
                            alt="Monument preview"
                            className="w-full h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({...formData, monument_image_url: null})}
                            className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        id="monument_image"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'monument')}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="monument_image"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                      >
                        {uploadingImage && uploadingImageType === 'monument' ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Monument Photo</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB per image
                </p>
              </div>

              {/* Country Page Advertisement Section */}
              <div className="space-y-4 border-t pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Country Page Advertisement
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Active</span>
                    <input
                      type="checkbox"
                      checked={formData.ad_is_active || false}
                      onChange={(e) => setFormData({...formData, ad_is_active: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Country Page Ad:</strong> This ad will appear on the country detail page (e.g., /countries/rwanda). 
                    Recommended size: <strong>600x600px (square)</strong> for better visual impact. Great for tourism boards, 
                    investment opportunities, or national campaigns.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad_company_name">Company/Organization Name</Label>
                    <Input
                      id="ad_company_name"
                      value={formData.ad_company_name || ''}
                      onChange={(e) => setFormData({...formData, ad_company_name: e.target.value})}
                      placeholder="e.g., Rwanda Development Board"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ad_company_website">Website URL</Label>
                    <Input
                      id="ad_company_website"
                      type="url"
                      value={formData.ad_company_website || ''}
                      onChange={(e) => setFormData({...formData, ad_company_website: e.target.value})}
                      placeholder="https://visitrwanda.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ad_tagline">Tagline (Optional)</Label>
                  <Input
                    id="ad_tagline"
                    value={formData.ad_tagline || ''}
                    onChange={(e) => setFormData({...formData, ad_tagline: e.target.value})}
                    placeholder="e.g., Remarkable Rwanda - Land of a Thousand Hills"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
                </div>

                <div>
                  <Label htmlFor="ad_image">Advertisement Image</Label>
                  <div className="space-y-2">
                    {formData.ad_image_url && (
                      <div className="relative">
                        <img 
                          src={formData.ad_image_url} 
                          alt="Ad preview"
                          className="w-full max-w-md h-48 object-contain border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-2"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({...formData, ad_image_url: null})}
                          className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <input
                      type="file"
                      id="ad_image"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'country_ad')}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="ad_image"
                      className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                    >
                      {uploadingImage && uploadingImageType === 'country_ad' ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {formData.ad_image_url ? 'Change Advertisement Image' : 'Upload Advertisement Image (600x600px recommended)'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 600x600px square format. Max size: 5MB. Formats: JPG, PNG, WebP
                  </p>
                </div>

                {(formData.ad_click_count || formData.ad_view_count) && (
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{formData.ad_view_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{formData.ad_click_count || 0}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">Click-Through Rate (CTR)</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formData.ad_view_count && formData.ad_view_count > 0 
                          ? ((formData.ad_click_count || 0) / formData.ad_view_count * 100).toFixed(2) 
                          : '0.00'}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {editingInfo ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
