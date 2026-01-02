import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Check, 
  X, 
  Trash2, 
  Search,
  AlertCircle,
  Image as ImageIcon,
  Filter,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminMarketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'reports'>('listings');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch listings
      let listingsQuery = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name),
          countries(name),
          marketplace_listing_images(image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        listingsQuery = listingsQuery.eq('status', statusFilter);
      }

      const { data: listingsData } = await listingsQuery;

      // Fetch reports
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

      alert(`Listing ${newStatus === 'active' ? 'approved' : newStatus}!`);
      fetchData();
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing status');
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

      alert('Listing deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error deleting listing');
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      alert('Report status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report status');
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

  return (
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
                    <TableHead className="font-roboto">Price</TableHead>
                    <TableHead className="font-roboto">Status</TableHead>
                    <TableHead className="font-roboto">Posted</TableHead>
                    <TableHead className="font-roboto">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredListings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500 font-roboto">
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
                                onClick={() => window.open(`/marketplace/edit/${listing.id}`, '_blank')}
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
  );
};

export default AdminMarketplace;
