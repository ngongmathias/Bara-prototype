import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Check, 
  X, 
  Trash2, 
  Search,
  Image as ImageIcon,
  Edit,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const AdminMarketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'reports'>('listings');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchCountries();
  }, [statusFilter]);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      let listingsQuery = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name),
          countries(name, flag_url),
          marketplace_listing_images(image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        listingsQuery = listingsQuery.eq('status', statusFilter);
      }

      const { data: listingsData } = await listingsQuery;

      const { data: reportsData } = await supabase
        .from('marketplace_reports')
        .select(`
          *,
          marketplace_listings(title, id)
        `)
        .order('created_at', { ascending: false });

      setListings(listingsData || []);
      setReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Listing ${newStatus === 'active' ? 'approved' : newStatus}!`,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update listing status',
        variant: 'destructive',
      });
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = async (listing: any) => {
    setEditingListing(listing);
    
    // Fetch countries associated with this listing
    try {
      const { data } = await supabase
        .from('marketplace_listing_countries')
        .select('country_id')
        .eq('listing_id', listing.id);
      
      if (data && data.length > 0) {
        setSelectedCountries(data.map(c => c.country_id));
      } else {
        // Fallback to single country_id
        setSelectedCountries(listing.country_id ? [listing.country_id] : []);
      }
    } catch (error) {
      console.error('Error fetching listing countries:', error);
      setSelectedCountries(listing.country_id ? [listing.country_id] : []);
    }
    
    setShowEditDialog(true);
  };

  const saveListingEdit = async () => {
    if (!editingListing) return;

    try {
      // Update main listing
      const { error: updateError } = await supabase
        .from('marketplace_listings')
        .update({
          title: editingListing.title,
          description: editingListing.description,
          price: editingListing.price,
          currency: editingListing.currency,
          condition: editingListing.condition,
          status: editingListing.status,
          is_featured: editingListing.is_featured,
          category_id: editingListing.category_id,
          country_id: selectedCountries[0] || editingListing.country_id, // Primary country
        })
        .eq('id', editingListing.id);

      if (updateError) throw updateError;

      // Update country associations
      // First, delete existing associations
      await supabase
        .from('marketplace_listing_countries')
        .delete()
        .eq('listing_id', editingListing.id);

      // Then insert new associations
      if (selectedCountries.length > 0) {
        const countryInserts = selectedCountries.map(countryId => ({
          listing_id: editingListing.id,
          country_id: countryId,
        }));

        await supabase
          .from('marketplace_listing_countries')
          .insert(countryInserts);
      }

      toast({
        title: 'Success',
        description: 'Listing updated successfully',
      });
      
      setShowEditDialog(false);
      setEditingListing(null);
      setSelectedCountries([]);
      fetchData();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive',
      });
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report status updated',
      });
      fetchData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report status',
        variant: 'destructive',
      });
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      sold: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const toggleCountrySelection = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2 font-comfortaa">
              Marketplace Administration
            </h1>
            <p className="text-gray-600 font-roboto">
              Manage listings, review reports, and moderate content
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 font-roboto mb-1">Total Listings</div>
              <div className="text-3xl font-bold text-black font-comfortaa">
                {listings.length}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 font-roboto mb-1">Pending Approval</div>
              <div className="text-3xl font-bold text-yellow-600 font-comfortaa">
                {listings.filter(l => l.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 font-roboto mb-1">Active Listings</div>
              <div className="text-3xl font-bold text-green-600 font-comfortaa">
                {listings.filter(l => l.status === 'active').length}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 font-roboto mb-1">Open Reports</div>
              <div className="text-3xl font-bold text-red-600 font-comfortaa">
                {reports.filter(r => r.status === 'pending').length}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 font-roboto font-medium transition-colors ${
                activeTab === 'listings'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Listings Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 font-roboto font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Reports ({reports.filter(r => r.status === 'pending').length})
            </button>
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search listings..."
                        className="pl-10 font-roboto"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 font-roboto">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => navigate('/marketplace/post')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Listing
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-roboto">Image</TableHead>
                      <TableHead className="font-roboto">Title</TableHead>
                      <TableHead className="font-roboto">Category</TableHead>
                      <TableHead className="font-roboto">Country</TableHead>
                      <TableHead className="font-roboto">Price</TableHead>
                      <TableHead className="font-roboto">Status</TableHead>
                      <TableHead className="font-roboto">Posted</TableHead>
                      <TableHead className="font-roboto">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : filteredListings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500 font-roboto">
                          No listings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredListings.map((listing) => {
                        const primaryImage = listing.marketplace_listing_images?.find((img: any) => img.is_primary)?.image_url
                          || listing.marketplace_listing_images?.[0]?.image_url;

                        return (
                          <TableRow key={listing.id}>
                            <TableCell>
                              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                {primaryImage ? (
                                  <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium font-roboto max-w-xs truncate">
                              {listing.title}
                            </TableCell>
                            <TableCell className="font-roboto">
                              {listing.marketplace_categories?.name}
                            </TableCell>
                            <TableCell className="font-roboto">
                              <div className="flex items-center gap-2">
                                {listing.countries?.flag_url && (
                                  <img src={listing.countries.flag_url} alt="" className="w-5 h-4" />
                                )}
                                {listing.countries?.name}
                              </div>
                            </TableCell>
                            <TableCell className="font-roboto">
                              {listing.currency} {parseFloat(listing.price).toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(listing.status)}</TableCell>
                            <TableCell className="font-roboto text-sm text-gray-600">
                              {new Date(listing.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/marketplace/listing/${listing.id}`, '_blank')}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(listing)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {listing.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateListingStatus(listing.id, 'active')}
                                      className="text-green-600 hover:text-green-700"
                                      title="Approve"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateListingStatus(listing.id, 'rejected')}
                                      className="text-red-600 hover:text-red-700"
                                      title="Reject"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteListing(listing.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-roboto">Listing</TableHead>
                      <TableHead className="font-roboto">Reason</TableHead>
                      <TableHead className="font-roboto">Description</TableHead>
                      <TableHead className="font-roboto">Status</TableHead>
                      <TableHead className="font-roboto">Reported</TableHead>
                      <TableHead className="font-roboto">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-roboto">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium font-roboto">
                            {report.marketplace_listings?.title || 'Deleted Listing'}
                          </TableCell>
                          <TableCell className="font-roboto capitalize">
                            {report.reason.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className="font-roboto max-w-xs truncate">
                            {report.description || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="font-roboto text-sm text-gray-600">
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {report.marketplace_listings?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/marketplace/listing/${report.marketplace_listings.id}`, '_blank')}
                                  title="View Listing"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              {report.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateReportStatus(report.id, 'reviewed')}
                                    className="text-green-600 hover:text-green-700"
                                    title="Mark Reviewed"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateReportStatus(report.id, 'dismissed')}
                                    className="text-gray-600 hover:text-gray-700"
                                    title="Dismiss"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-comfortaa">Edit Listing</DialogTitle>
          </DialogHeader>

          {editingListing && (
            <div className="space-y-6 py-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={editingListing.title}
                  onChange={(e) => setEditingListing({...editingListing, title: e.target.value})}
                  className="font-roboto"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={editingListing.description}
                  onChange={(e) => setEditingListing({...editingListing, description: e.target.value})}
                  rows={4}
                  className="font-roboto"
                />
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <Input
                    type="number"
                    value={editingListing.price}
                    onChange={(e) => setEditingListing({...editingListing, price: e.target.value})}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <Input
                    value={editingListing.currency}
                    onChange={(e) => setEditingListing({...editingListing, currency: e.target.value})}
                    className="font-roboto"
                  />
                </div>
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select
                    value={editingListing.category_id}
                    onValueChange={(value) => setEditingListing({...editingListing, category_id: value})}
                  >
                    <SelectTrigger className="font-roboto">
                      <SelectValue />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <Select
                    value={editingListing.condition || ''}
                    onValueChange={(value) => setEditingListing({...editingListing, condition: value})}
                  >
                    <SelectTrigger className="font-roboto">
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

              {/* Target Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Countries (Select one or more)
                </label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
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
                          <button
                            type="button"
                            onClick={() => toggleCountrySelection(countryId)}
                            className="ml-1 text-blue-700 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Status and Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select
                    value={editingListing.status}
                    onValueChange={(value) => setEditingListing({...editingListing, status: value})}
                  >
                    <SelectTrigger className="font-roboto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                  <Select
                    value={editingListing.is_featured ? 'true' : 'false'}
                    onValueChange={(value) => setEditingListing({...editingListing, is_featured: value === 'true'})}
                  >
                    <SelectTrigger className="font-roboto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingListing(null);
                    setSelectedCountries([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveListingEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMarketplace;
