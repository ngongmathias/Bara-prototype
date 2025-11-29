import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MousePointer,
  Globe,
  Building2,
  Target
} from 'lucide-react';
import { supabase, getAdminDb } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import { cn } from '@/lib/utils';

type BannerAd = Database['public']['Tables']['banner_ads']['Row'];

// Create a type for the insert operation
type BannerAdInsert = Database['public']['Tables']['banner_ads']['Insert'];

// Create a type for the update operation
type BannerAdUpdate = Database['public']['Tables']['banner_ads']['Update'];

// Sponsored Banner interface
interface SponsoredBanner {
  id: string;
  country_id: string;
  company_name: string;
  company_website: string;
  banner_image_url: string;
  banner_alt_text: string | null;
  is_active: boolean;
  show_on_country_detail: boolean;
  payment_status: string;
  created_at: string;
  updated_at: string;
  countries?: {
    name: string;
    code: string;
  } | null;
}

export const AdminBannerAds = () => {
  const { toast } = useToast();
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [sponsoredBanners, setSponsoredBanners] = useState<SponsoredBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<BannerAd | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updatingBanner, setUpdatingBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'banner_ads' | 'sponsored_banners'>('banner_ads');

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    redirect_url: '',
    alt_text: '',
    is_active: false,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchBannerAds(),
        fetchSponsoredBanners()
      ]);
    };
    fetchData();
  }, []);

  const fetchBannerAds = async () => {
    try {
      console.log('Attempting to fetch banner ads...');
      
      const { data, error } = await supabase
        .from('banner_ads')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Banner ads query result:', { data, error });

      if (error) throw error;
      setBannerAds(data || []);
    } catch (error: any) {
      console.error('Error fetching banner ads:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch banner ads: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const fetchSponsoredBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsored_banners')
        .select(`
          id,
          country_id,
          company_name,
          company_website,
          banner_image_url,
          banner_alt_text,
          is_active,
          show_on_country_detail,
          payment_status,
          created_at,
          updated_at,
          countries(name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sponsored banners:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch sponsored banners',
          variant: 'destructive'
        });
        return;
      }

      const transformedBanners: SponsoredBanner[] = data?.map((banner: any) => ({
        ...banner,
        countries: banner.countries?.[0] || null
      })) || [];
      setSponsoredBanners(transformedBanners);
    } catch (error) {
      console.error('Error fetching sponsored banners:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch sponsored banners',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      // Validate image dimensions
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const aspectRatio = width / height;
          
          // Recommended: 1200x200 (6:1 ratio)
          // Accept 5:1 to 7:1 ratio, min width 800px
          if (width < 800) {
            reject(new Error(`Image width must be at least 800px. Your image is ${width}px wide.`));
            return;
          }
          
          if (aspectRatio < 5 || aspectRatio > 7) {
            reject(new Error(`Banner ads should have a 6:1 aspect ratio (width:height). Recommended: 1200x200px. Your image is ${width}x${height}px (${aspectRatio.toFixed(1)}:1 ratio).`));
            return;
          }
          
          resolve(true);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });
      
      URL.revokeObjectURL(imageUrl);

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `banner-ads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banner-ads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banner-ads')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setUploading(false);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast({
        title: 'Error',
        description: 'Please upload an image for the banner',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      console.log('Attempting to save banner ad:', formData);
      
      const adData: BannerAdInsert = {
        title: formData.title,
        image_url: formData.image_url,
        redirect_url: formData.redirect_url,
        alt_text: formData.alt_text || null,
        is_active: formData.is_active,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        total_views: 0,
        total_clicks: 0
      };

      console.log('Prepared ad data:', adData);

      let result;
      if (editingAd) {
        // For update
        const { data, error } = await supabase
          .from('banner_ads')
          .update(adData as BannerAdUpdate)
          .eq('id', editingAd.id)
          .select();
        
        result = { data, error };
      } else {
        // For insert
        const { data, error } = await supabase
          .from('banner_ads')
          .insert(adData as BannerAdInsert)
          .select();
        
        result = { data, error };
      }

      console.log('Save result:', result);

      if (result.error) throw result.error;

      toast({
        title: 'Success',
        description: `Banner ad ${editingAd ? 'updated' : 'created'} successfully`
      });

      setIsDialogOpen(false);
      setEditingAd(null);
      resetForm();
      fetchBannerAds();
    } catch (error: any) {
      console.error('Error saving banner ad:', error);
      toast({
        title: 'Error',
        description: `Failed to save banner ad: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banner_ads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting banner ad:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Banner ad deleted successfully'
      });

      fetchBannerAds();
    } catch (error: any) {
      console.error('Error deleting banner ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banner ad',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const adminDb = getAdminDb();
      const { error } = await adminDb.banner_ads()
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Banner ad ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchBannerAds();
    } catch (error: any) {
      console.error('Error toggling banner ad status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update banner ad status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      redirect_url: '',
      alt_text: '',
      is_active: false,
      start_date: '',
      end_date: ''
    });
    setEditingAd(null);
  };

  const openEditDialog = (ad: BannerAd) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      redirect_url: ad.redirect_url,
      alt_text: ad.alt_text || '',
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
      end_date: ad.end_date ? ad.end_date.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const calculateCTR = (views: number, clicks: number) => {
    if (views === 0) return '0%';
    return ((clicks / views) * 100).toFixed(2) + '%';
  };

  // Toggle country detail display for sponsored banner
  const toggleCountryDetailDisplay = async (bannerId: string, currentStatus: boolean) => {
    try {
      setUpdatingBanner(bannerId);
      
      const { error } = await supabase
        .from('sponsored_banners')
        .update({ 
          show_on_country_detail: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bannerId);

      if (error) {
        console.error('Error updating banner:', error);
        toast({
          title: 'Error',
          description: 'Failed to update country detail display status',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setSponsoredBanners(prev => prev.map(banner => 
        banner.id === bannerId 
          ? { ...banner, show_on_country_detail: !currentStatus }
          : banner
      ));
    
      toast({
        title: 'Success',
        description: `Country detail display ${!currentStatus ? 'enabled' : 'disabled'} for ${sponsoredBanners.find(b => b.id === bannerId)?.company_name}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update country detail display status',
        variant: 'destructive'
      });
    } finally {
      setUpdatingBanner(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Banner Ads Management</h1>
            <p className="text-gray-600">Manage banner advertisements and sponsored banners</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Banner Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? 'Edit Banner Ad' : 'Create New Banner Ad'}
                </DialogTitle>
                <DialogDescription>
                  {editingAd ? 'Update the banner ad details' : 'Add a new banner advertisement'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="image">Banner Image</Label>
                    <div className="space-y-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                        <p className="text-sm font-semibold text-blue-900 mb-1">📐 Required Dimensions:</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• <strong>Recommended:</strong> 1200 x 200 pixels (6:1 ratio)</li>
                          <li>• <strong>Minimum width:</strong> 800px</li>
                          <li>• <strong>Aspect ratio:</strong> 5:1 to 7:1 (width:height)</li>
                          <li>• <strong>File size:</strong> Less than 2MB</li>
                        </ul>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploading}
                      />
                      <div className="text-sm text-gray-500">Or enter image URL:</div>
                      <Input
                        type="url"
                        placeholder="https://example.com/banner.jpg"
                        value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      />
                      {formData.image_url && (
                        <div className="border rounded p-2">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="max-h-20 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="redirect_url">Redirect URL</Label>
                    <Input
                      id="redirect_url"
                      type="url"
                      value={formData.redirect_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="alt_text">Alt Text</Label>
                    <Input
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="start_date">Start Date (Optional)</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || !formData.image_url}>
                    {uploading ? 'Uploading...' : editingAd ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('banner_ads')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'banner_ads'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Banner Ads ({bannerAds.length})
          </button>
          <button
            onClick={() => setActiveTab('sponsored_banners')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sponsored_banners'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Sponsored Banners ({sponsoredBanners.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'banner_ads' ? (
          <>
            {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bannerAds.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bannerAds.filter(ad => ad.is_active).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bannerAds.reduce((sum, ad) => sum + ad.total_views, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bannerAds.reduce((sum, ad) => sum + ad.total_clicks, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banner Ads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Advertisements</CardTitle>
            <CardDescription>
              Manage your banner ads and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannerAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <img 
                        src={ad.image_url} 
                        alt={ad.alt_text || ad.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell>
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{ad.total_views}</TableCell>
                    <TableCell>{ad.total_clicks}</TableCell>
                    <TableCell>{calculateCTR(ad.total_views, ad.total_clicks)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(ad.id, ad.is_active)}
                        >
                          {ad.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(ad)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </>
        ) : (
          /* Sponsored Banners Tab */
          <div className="space-y-4">
            {sponsoredBanners.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sponsored banners found</h3>
                  <p className="text-gray-600">No sponsored banners have been created yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Banner Preview
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Show on Country Detail
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sponsoredBanners.map((banner) => (
                          <tr key={banner.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {banner.banner_image_url ? (
                                <img 
                                  src={banner.banner_image_url} 
                                  alt={banner.banner_alt_text || 'Banner preview'}
                                  className="w-16 h-10 object-cover rounded border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                  <Target className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {banner.company_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  <a 
                                    href={banner.company_website.startsWith('http') ? banner.company_website : `https://${banner.company_website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {banner.company_website}
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {banner.countries?.name || 'Unknown Country'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {banner.countries?.code || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <Badge variant={banner.is_active ? "default" : "secondary"} className="w-fit">
                                  {banner.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline" className="w-fit">
                                  {banner.payment_status}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <Switch
                                  checked={banner.show_on_country_detail}
                                  onCheckedChange={() => toggleCountryDetailDisplay(banner.id, banner.show_on_country_detail)}
                                  disabled={updatingBanner === banner.id}
                                  className={cn(
                                    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                                    banner.show_on_country_detail 
                                      ? "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300" 
                                      : "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500"
                                  )}
                                  style={{
                                    '--switch-bg-checked': banner.show_on_country_detail ? '#16a34a' : '#16a34a',
                                    '--switch-bg-unchecked': banner.show_on_country_detail ? '#d1d5db' : '#ef4444'
                                  } as React.CSSProperties}
                                />
                                {updatingBanner === banner.id && (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {banner.show_on_country_detail ? 'Visible on Country Detail' : 'Hidden from Country Detail'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="text-xs">
                                Created: {new Date(banner.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                Updated: {new Date(banner.updated_at).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
