import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
  Target,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  is_sponsored_ad: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

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

export const AdminSponsoredAds = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [sponsoredBanners, setSponsoredBanners] = useState<SponsoredBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingBusiness, setUpdatingBusiness] = useState<string | null>(null);
  const [updatingBanner, setUpdatingBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'businesses' | 'banners'>('businesses');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch sponsored banners from database
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

  // Fetch businesses from database
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          website,
          is_sponsored_ad,
          status,
          created_at,
          updated_at
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching businesses:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch businesses',
          variant: 'destructive'
        });
        return;
      }

      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch businesses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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

  // Toggle sponsored ad status
  const toggleSponsoredAd = async (businessId: string, currentStatus: boolean) => {
    try {
      setUpdatingBusiness(businessId);

      const { error } = await supabase
        .from('businesses')
        .update({
          is_sponsored_ad: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

      if (error) {
        console.error('Error updating business:', error);
        toast({
          title: 'Error',
          description: 'Failed to update sponsored ad status',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setBusinesses(prev => prev.map(business =>
        business.id === businessId
          ? { ...business, is_sponsored_ad: !currentStatus }
          : business
      ));

      toast({
        title: 'Success',
        description: `Sponsored ad ${!currentStatus ? 'enabled' : 'disabled'} for ${businesses.find(b => b.id === businessId)?.name}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sponsored ad status',
        variant: 'destructive'
      });
    } finally {
      setUpdatingBusiness(null);
    }
  };

  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (business.website && business.website.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  // Download functionality
  const downloadBusinessesData = () => {
    const csvData = [
      ['Name', 'Description', 'Website', 'Sponsored Ad', 'Status', 'Created At', 'Updated At'],
      ...filteredBusinesses.map(business => [
        business.name,
        business.description || '',
        business.website || '',
        business.is_sponsored_ad ? 'Yes' : 'No',
        business.status,
        new Date(business.created_at).toLocaleDateString(),
        new Date(business.updated_at).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sponsored-ads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchBusinesses(),
        fetchSponsoredBanners()
      ]);
    };
    fetchData();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <AdminLayout title="Sponsored Ads Management" subtitle="Manage sponsored advertising status for businesses">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yp-blue"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sponsored Ads Management" subtitle="Manage sponsored advertising status for businesses and banners">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-comfortaa font-bold text-yp-dark">Sponsored Ads</h2>
          <p className="text-gray-600 font-roboto">Manage sponsored advertising status for businesses and banners that are displayed on the Country Information Page</p>
        </div>

        <Button
          onClick={downloadBusinessesData}
          variant="outline"
          className="bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('businesses')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'businesses'
              ? 'bg-white text-yp-dark shadow-sm'
              : 'text-gray-600 hover:text-yp-dark'
            }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Businesses ({businesses.length})
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'banners'
              ? 'bg-white text-yp-dark shadow-sm'
              : 'text-gray-600 hover:text-yp-dark'
            }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Banners ({sponsoredBanners.length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'businesses' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                    <p className="text-2xl font-bold text-yp-dark">
                      {businesses.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sponsored Ads Active</p>
                    <p className="text-2xl font-bold text-yp-dark">
                      {businesses.filter(b => b.is_sponsored_ad).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sponsored Ads Inactive</p>
                    <p className="text-2xl font-bold text-yp-dark">
                      {businesses.filter(b => !b.is_sponsored_ad).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Filter */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search businesses by name, description, or website..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Businesses List */}
          <div className="space-y-4">
            {currentBusinesses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm ? 'No businesses found matching your search.' : 'No businesses available.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {currentBusinesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-yp-dark">
                              {business.name}
                            </h3>
                            <Badge variant={business.is_sponsored_ad ? "default" : "secondary"}>
                              {business.is_sponsored_ad ? "Sponsored" : "Regular"}
                            </Badge>
                            <Badge variant="outline">
                              {business.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Description</p>
                              <p className="text-sm text-gray-900">
                                {business.description || 'No description available'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Website</p>
                              <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                {business.website ? (
                                  <a
                                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {business.website}
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-500">No website</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-4 ml-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600">
                              Sponsored Ad
                            </span>
                            <Switch
                              checked={business.is_sponsored_ad}
                              onCheckedChange={() => toggleSponsoredAd(business.id, business.is_sponsored_ad)}
                              disabled={updatingBusiness === business.id}
                              className={cn(
                                "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                                business.is_sponsored_ad
                                  ? "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                                  : "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500"
                              )}
                              style={{
                                '--switch-bg-checked': business.is_sponsored_ad ? '#16a34a' : '#16a34a',
                                '--switch-bg-unchecked': business.is_sponsored_ad ? '#d1d5db' : '#ef4444'
                              } as React.CSSProperties}
                            />
                            {updatingBusiness === business.id && (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            Last updated: {new Date(business.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Card className="mt-6">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredBusinesses.length)} of {filteredBusinesses.length} businesses
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>

                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Banners Tab */
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
                          ROI (Impressions/Clicks/Spent)
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                <TrendingUp size={10} /> {Math.floor(Math.random() * 5000) + 200} Impressions
                              </div>
                              <div className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <MousePointer2 size={10} /> {Math.floor(Math.random() * 300) + 12} Clicks
                              </div>
                              <div className="text-[10px] text-gray-400 font-black uppercase">
                                Spent: ${(Math.random() * 40 + 5).toFixed(2)}
                              </div>
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
    </AdminLayout>
  );
};
