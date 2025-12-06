import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Calendar,
  Star,
  FileText,
  Save,
  X,
  Trash2,
  Upload,
  Image as ImageIcon,
  GraduationCap
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

interface GlobalAfrica {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
  display_order: number;
  is_active: boolean;
}

interface GlobalAfricaInfo {
  id: string;
  global_africa_id: string;
  description: string | null;
  location: string | null;
  population: number | null;
  area_sq_km: number | null;
  leader_name: string | null;
  organization_type: string | null;
  established_date: string | null;
  average_age: number | null;
  largest_city: string | null;
  largest_city_population: number | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  primary_language: string | null;
  cultural_heritage: string | null;
  notable_institutions: string | null;
  historical_significance: string | null;
  flag_url: string | null;
  emblem_url: string | null;
  leader_image_url: string | null;
  landmark_image_url: string | null;
  key_contributions: string | null;
  cultural_events: string | null;
  notable_figures: string | null;
  resources: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminGlobalAfrica: React.FC = () => {
  const [entries, setEntries] = useState<GlobalAfrica[]>([]);
  const [entriesInfo, setEntriesInfo] = useState<GlobalAfricaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<GlobalAfricaInfo | null>(null);
  const [formData, setFormData] = useState<Partial<GlobalAfricaInfo>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImageType, setUploadingImageType] = useState<'flag' | 'emblem' | 'leader' | 'landmark' | null>(null);

  useEffect(() => {
    fetchEntries();
    fetchEntriesInfo();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await db.from('global_africa')
        .select('id, name, code, flag_emoji, display_order, is_active')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching Global Africa entries:', error);
      toast.error('Failed to load Global Africa entries');
    }
  };

  const fetchEntriesInfo = async () => {
    try {
      const { data, error } = await db.from('global_africa_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntriesInfo(data || []);
    } catch (error) {
      console.error('Error fetching Global Africa info:', error);
      toast.error('Failed to load Global Africa information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingInfo(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (info: GlobalAfricaInfo) => {
    setEditingInfo(info);
    setFormData(info);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'flag' | 'emblem' | 'leader' | 'landmark') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadingImageType(imageType);
    try {
      const folderMap = {
        flag: 'global-africa-flags',
        emblem: 'global-africa-emblems',
        leader: 'global-africa-leaders',
        landmark: 'global-africa-landmarks'
      };
      
      const imageUrl = await uploadImage(file, folderMap[imageType], 'images');
      
      const fieldMap = {
        flag: 'flag_url',
        emblem: 'emblem_url',
        leader: 'leader_image_url',
        landmark: 'landmark_image_url'
      };
      
      setFormData({ ...formData, [fieldMap[imageType]]: imageUrl });
      toast.success(`${imageType} uploaded successfully`);
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
        const { error } = await db.from('global_africa_info')
          .update(formData)
          .eq('id', editingInfo.id);

        if (error) throw error;
        toast.success('Global Africa information updated successfully');
      } else {
        const { error } = await db.from('global_africa_info')
          .insert([formData]);

        if (error) throw error;
        toast.success('Global Africa information created successfully');
      }

      setIsDialogOpen(false);
      fetchEntriesInfo();
    } catch (error) {
      console.error('Error saving Global Africa info:', error);
      toast.error('Failed to save Global Africa information');
    }
  };

  const handleDelete = async (info: GlobalAfricaInfo) => {
    const entry = entries.find(e => e.id === info.global_africa_id);
    if (!confirm(`Are you sure you want to delete the information for ${entry?.name}?`)) {
      return;
    }

    try {
      const { error } = await db.from('global_africa_info')
        .delete()
        .eq('id', info.id);

      if (error) throw error;
      toast.success('Global Africa information deleted successfully');
      fetchEntriesInfo();
    } catch (error) {
      console.error('Error deleting Global Africa info:', error);
      toast.error('Failed to delete Global Africa information');
    }
  };

  const filteredInfo = entriesInfo.filter(info => {
    const entry = entries.find(e => e.id === info.global_africa_id);
    const matchesSearch = 
      entry?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.leader_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntry = !selectedEntry || selectedEntry === "all" || info.global_africa_id === selectedEntry;
    
    return matchesSearch && matchesEntry;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Africa Management</h1>
            <p className="text-gray-600 mt-1">Manage African diaspora communities and institutions</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Information
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, location, or leader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedEntry} onValueChange={setSelectedEntry}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by entry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  {entries.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.flag_emoji} {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">With Information</p>
                  <p className="text-2xl font-bold text-gray-900">{entriesInfo.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {entries.filter(e => e.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfo.map((info) => {
            const entry = entries.find(e => e.id === info.global_africa_id);
            if (!entry) return null;

            return (
              <Card key={info.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{entry.flag_emoji}</span>
                      <div>
                        <CardTitle className="text-lg">{entry.name}</CardTitle>
                        <p className="text-sm text-gray-600">{info.location || 'Location not set'}</p>
                      </div>
                    </div>
                    <Badge variant={info.is_active ? "default" : "secondary"}>
                      {info.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {info.population && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{info.population.toLocaleString()}</span>
                      </div>
                    )}
                    {info.organization_type && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{info.organization_type}</span>
                      </div>
                    )}
                  </div>

                  {info.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{info.description}</p>
                  )}

                  <div className="flex space-x-2">
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
                            <span className="text-2xl">{entry.flag_emoji}</span>
                            <span>{entry.name}</span>
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
                                <Label className="text-sm font-medium text-gray-700">Location</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.location || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Population</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.population?.toLocaleString() || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Primary Language</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.primary_language || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Organization & Leadership */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Organization & Leadership</h3>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Leader/Representative</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.leader_name || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Organization Type</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.organization_type || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Established</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.established_date || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Cultural Information */}
                          <div className="space-y-4 md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Cultural Information</h3>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Cultural Heritage</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.cultural_heritage || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Historical Significance</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.historical_significance || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Notable Institutions</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.notable_institutions || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Notable Figures</Label>
                                <p className="text-sm text-gray-600 mt-1">{info.notable_figures || 'Not provided'}</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No information found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedEntry 
                  ? 'Try adjusting your search criteria' 
                  : 'No Global Africa information has been added yet'
                }
              </p>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Information
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInfo ? 'Edit Global Africa Information' : 'Add Global Africa Information'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
                  <Label htmlFor="global_africa_id">Entry *</Label>
                  <Select 
                    value={formData.global_africa_id || undefined} 
                    onValueChange={(value) => setFormData({...formData, global_africa_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entry" />
                    </SelectTrigger>
                    <SelectContent>
                      {entries.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.flag_emoji} {entry.name}
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
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., United States, Brazil"
                  />
                </div>

                <div>
                  <Label htmlFor="primary_language">Primary Language</Label>
                  <Input
                    id="primary_language"
                    value={formData.primary_language || ''}
                    onChange={(e) => setFormData({...formData, primary_language: e.target.value})}
                    placeholder="Primary language"
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
              </div>

              {/* Organization & Leadership */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Organization & Leadership</h3>
                
                <div>
                  <Label htmlFor="leader_name">Leader/Representative</Label>
                  <Input
                    id="leader_name"
                    value={formData.leader_name || ''}
                    onChange={(e) => setFormData({...formData, leader_name: e.target.value})}
                    placeholder="Community leader or representative"
                  />
                </div>

                <div>
                  <Label htmlFor="organization_type">Organization Type</Label>
                  <Input
                    id="organization_type"
                    value={formData.organization_type || ''}
                    onChange={(e) => setFormData({...formData, organization_type: e.target.value})}
                    placeholder="e.g., Diaspora Community, Educational Network"
                  />
                </div>

                <div>
                  <Label htmlFor="established_date">Established Date</Label>
                  <Input
                    id="established_date"
                    value={formData.established_date || ''}
                    onChange={(e) => setFormData({...formData, established_date: e.target.value})}
                    placeholder="e.g., 1865, 17th Century"
                  />
                </div>

                <div>
                  <Label htmlFor="notable_institutions">Notable Institutions</Label>
                  <Textarea
                    id="notable_institutions"
                    value={formData.notable_institutions || ''}
                    onChange={(e) => setFormData({...formData, notable_institutions: e.target.value})}
                    placeholder="List of important institutions..."
                    rows={3}
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
                      const match = value.match(/([0-9.]+)°?\s*([NS]),?\s*([0-9.]+)°?\s*([EW])/i);
                      if (match) {
                        const lat = parseFloat(match[1]) * (match[2].toUpperCase() === 'S' ? -1 : 1);
                        const lon = parseFloat(match[3]) * (match[4].toUpperCase() === 'W' ? -1 : 1);
                        setFormData({...formData, latitude: lat, longitude: lon});
                      }
                    }}
                    placeholder="e.g., 38.9072° N, 77.0369° W"
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
                      placeholder="e.g., 38.9072"
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
                      placeholder="e.g., -77.0369"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone || ''}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    placeholder="e.g., EST, UTC-5"
                  />
                </div>

                <div>
                  <Label htmlFor="largest_city">Largest City</Label>
                  <Input
                    id="largest_city"
                    value={formData.largest_city || ''}
                    onChange={(e) => setFormData({...formData, largest_city: e.target.value})}
                    placeholder="Largest city"
                  />
                </div>

                <div>
                  <Label htmlFor="largest_city_population">Largest City Population</Label>
                  <Input
                    id="largest_city_population"
                    type="number"
                    value={formData.largest_city_population || ''}
                    onChange={(e) => setFormData({...formData, largest_city_population: parseInt(e.target.value) || null})}
                    placeholder="Population"
                  />
                </div>
              </div>

              {/* Cultural Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Cultural Information</h3>
                
                <div>
                  <Label htmlFor="cultural_heritage">Cultural Heritage</Label>
                  <Textarea
                    id="cultural_heritage"
                    value={formData.cultural_heritage || ''}
                    onChange={(e) => setFormData({...formData, cultural_heritage: e.target.value})}
                    placeholder="Cultural heritage description..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="historical_significance">Historical Significance</Label>
                  <Textarea
                    id="historical_significance"
                    value={formData.historical_significance || ''}
                    onChange={(e) => setFormData({...formData, historical_significance: e.target.value})}
                    placeholder="Historical significance..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="key_contributions">Key Contributions</Label>
                  <Textarea
                    id="key_contributions"
                    value={formData.key_contributions || ''}
                    onChange={(e) => setFormData({...formData, key_contributions: e.target.value})}
                    placeholder="Key contributions to society..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="notable_figures">Notable Figures</Label>
                  <Textarea
                    id="notable_figures"
                    value={formData.notable_figures || ''}
                    onChange={(e) => setFormData({...formData, notable_figures: e.target.value})}
                    placeholder="Notable historical figures..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="cultural_events">Cultural Events</Label>
                  <Textarea
                    id="cultural_events"
                    value={formData.cultural_events || ''}
                    onChange={(e) => setFormData({...formData, cultural_events: e.target.value})}
                    placeholder="Important cultural events..."
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

                  {/* Emblem */}
                  <div>
                    <Label htmlFor="emblem_image">Emblem/Symbol</Label>
                    <div className="space-y-2">
                      {formData.emblem_url && (
                        <div className="relative">
                          <img 
                            src={formData.emblem_url} 
                            alt="Emblem preview"
                            className="w-full h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({...formData, emblem_url: null})}
                            className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        id="emblem_image"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'emblem')}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="emblem_image"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                      >
                        {uploadingImage && uploadingImageType === 'emblem' ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Emblem</span>
                      </label>
                    </div>
                  </div>

                  {/* Leader Photo */}
                  <div>
                    <Label htmlFor="leader_image">Leader Photo</Label>
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

                  {/* Landmark Photo */}
                  <div>
                    <Label htmlFor="landmark_image">Landmark Photo</Label>
                    <div className="space-y-2">
                      {formData.landmark_image_url && (
                        <div className="relative">
                          <img 
                            src={formData.landmark_image_url} 
                            alt="Landmark preview"
                            className="w-full h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({...formData, landmark_image_url: null})}
                            className="absolute -top-2 -right-2 bg-white border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        id="landmark_image"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'landmark')}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="landmark_image"
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                      >
                        {uploadingImage && uploadingImageType === 'landmark' ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Landmark Photo</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB per image
                </p>
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
