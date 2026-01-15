import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  FileText, Download, Building2, Users, MessageSquare, 
  Calendar as CalendarIcon, DollarSign, Target, FileSpreadsheet, 
  FileJson, Filter, Eye, Loader2, ShoppingBag, BarChart3, Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAdminDb } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { format, subMonths } from 'date-fns';

type ReportType = 'businesses' | 'users' | 'reviews' | 'events' | 'financial' | 'ads' | 'products' | 'analytics';
type ExportFormat = 'csv' | 'excel' | 'json';

interface FieldConfig {
  id: string;
  label: string;
  selected: boolean;
}

export const AdminReports = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>('businesses');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Date filters
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Field configurations for each report type
  const [businessFields, setBusinessFields] = useState<FieldConfig[]>([
    { id: 'id', label: 'Business ID', selected: true },
    { id: 'name', label: 'Business Name', selected: true },
    { id: 'email', label: 'Email', selected: true },
    { id: 'phone', label: 'Phone', selected: true },
    { id: 'website', label: 'Website', selected: false },
    { id: 'address', label: 'Address', selected: true },
    { id: 'city', label: 'City', selected: true },
    { id: 'country', label: 'Country', selected: true },
    { id: 'category', label: 'Category', selected: true },
    { id: 'status', label: 'Status', selected: true },
    { id: 'is_verified', label: 'Verified', selected: false },
    { id: 'is_premium', label: 'Premium', selected: false },
    { id: 'view_count', label: 'View Count', selected: false },
    { id: 'created_at', label: 'Created Date', selected: true },
  ]);

  const [userFields, setUserFields] = useState<FieldConfig[]>([
    { id: 'id', label: 'User ID', selected: true },
    { id: 'email', label: 'Email', selected: true },
    { id: 'full_name', label: 'Full Name', selected: true },
    { id: 'role', label: 'Role', selected: true },
    { id: 'created_at', label: 'Registration Date', selected: true },
  ]);

  const [reviewFields, setReviewFields] = useState<FieldConfig[]>([
    { id: 'id', label: 'Review ID', selected: true },
    { id: 'title', label: 'Title', selected: true },
    { id: 'rating', label: 'Rating', selected: true },
    { id: 'status', label: 'Status', selected: true },
    { id: 'user_email', label: 'User Email', selected: true },
    { id: 'business_name', label: 'Business Name', selected: true },
    { id: 'created_at', label: 'Created Date', selected: true },
  ]);

  const [financialFields, setFinancialFields] = useState<FieldConfig[]>([
    { id: 'id', label: 'Payment ID', selected: true },
    { id: 'amount', label: 'Amount', selected: true },
    { id: 'status', label: 'Status', selected: true },
    { id: 'payment_method', label: 'Payment Method', selected: true },
    { id: 'user_email', label: 'User Email', selected: true },
    { id: 'created_at', label: 'Payment Date', selected: true },
  ]);

  const [eventFields, setEventFields] = useState<FieldConfig[]>([
    { id: 'id', label: 'Event ID', selected: true },
    { id: 'title', label: 'Event Title', selected: true },
    { id: 'description', label: 'Description', selected: false },
    { id: 'event_type', label: 'Event Type', selected: true },
    { id: 'start_date', label: 'Start Date', selected: true },
    { id: 'end_date', label: 'End Date', selected: true },
    { id: 'location', label: 'Location', selected: true },
    { id: 'city', label: 'City', selected: true },
    { id: 'country', label: 'Country', selected: true },
    { id: 'organizer_name', label: 'Organizer Name', selected: true },
    { id: 'organizer_email', label: 'Organizer Email', selected: true },
    { id: 'is_active', label: 'Active', selected: true },
    { id: 'is_featured', label: 'Featured', selected: false },
    { id: 'ticket_price', label: 'Ticket Price', selected: false },
    { id: 'created_at', label: 'Created Date', selected: true },
  ]);

  const [productFields, setProductFields] = useState<FieldConfig[]>([
    { id: 'id', label: 'Product ID', selected: true },
    { id: 'name', label: 'Product Name', selected: true },
    { id: 'description', label: 'Description', selected: false },
    { id: 'price', label: 'Price', selected: true },
    { id: 'category', label: 'Category', selected: true },
    { id: 'business_name', label: 'Business Name', selected: true },
    { id: 'stock_quantity', label: 'Stock Quantity', selected: true },
    { id: 'is_active', label: 'Active', selected: true },
    { id: 'is_featured', label: 'Featured', selected: false },
    { id: 'view_count', label: 'View Count', selected: false },
    { id: 'created_at', label: 'Created Date', selected: true },
  ]);

  const [analyticsFields, setAnalyticsFields] = useState<FieldConfig[]>([
    { id: 'business_name', label: 'Business Name', selected: true },
    { id: 'total_views', label: 'Total Views', selected: true },
    { id: 'total_clicks', label: 'Total Clicks', selected: true },
    { id: 'ctr', label: 'Click-Through Rate', selected: true },
    { id: 'review_count', label: 'Review Count', selected: true },
    { id: 'average_rating', label: 'Average Rating', selected: true },
    { id: 'city', label: 'City', selected: true },
    { id: 'country', label: 'Country', selected: true },
    { id: 'category', label: 'Category', selected: true },
  ]);

  const getCurrentFields = () => {
    switch (reportType) {
      case 'businesses': return businessFields;
      case 'users': return userFields;
      case 'reviews': return reviewFields;
      case 'financial': return financialFields;
      case 'events': return eventFields;
      case 'products': return productFields;
      case 'analytics': return analyticsFields;
      default: return businessFields;
    }
  };

  const setCurrentFields = (fields: FieldConfig[]) => {
    switch (reportType) {
      case 'businesses': setBusinessFields(fields); break;
      case 'users': setUserFields(fields); break;
      case 'reviews': setReviewFields(fields); break;
      case 'financial': setFinancialFields(fields); break;
      case 'events': setEventFields(fields); break;
      case 'products': setProductFields(fields); break;
      case 'analytics': setAnalyticsFields(fields); break;
    }
  };

  const toggleField = (fieldId: string) => {
    const currentFields = getCurrentFields();
    const updated = currentFields.map(f => 
      f.id === fieldId ? { ...f, selected: !f.selected } : f
    );
    setCurrentFields(updated);
  };

  const selectAllFields = () => {
    const currentFields = getCurrentFields();
    setCurrentFields(currentFields.map(f => ({ ...f, selected: true })));
  };

  const deselectAllFields = () => {
    const currentFields = getCurrentFields();
    setCurrentFields(currentFields.map(f => ({ ...f, selected: false })));
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const db = getAdminDb();
      const selectedFields = getCurrentFields().filter(f => f.selected);
      
      if (selectedFields.length === 0) {
        toast({
          title: 'No fields selected',
          description: 'Please select at least one field to export',
          variant: 'destructive'
        });
        return [];
      }

      let data: any[] = [];

      switch (reportType) {
        case 'businesses': {
          const { data: businesses, error } = await db
            .businesses()
            .select(`
              *,
              cities(name, countries(name)),
              categories(name)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          if (error) throw error;
          
          data = businesses?.map(b => ({
            id: b.id,
            name: b.name,
            email: b.email,
            phone: b.phone,
            website: b.website,
            address: b.address,
            city: b.cities?.name,
            country: b.cities?.countries?.name,
            category: b.categories?.name,
            status: b.status,
            is_verified: b.is_verified ? 'Yes' : 'No',
            is_premium: b.is_premium ? 'Yes' : 'No',
            view_count: b.view_count || 0,
            created_at: format(new Date(b.created_at), 'yyyy-MM-dd HH:mm:ss'),
          })) || [];
          break;
        }

        case 'users': {
          const { data: users, error } = await db
            .users()
            .select('*')
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          if (error) throw error;
          
          data = users?.map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name || 'N/A',
            role: u.role || 'user',
            created_at: format(new Date(u.created_at), 'yyyy-MM-dd HH:mm:ss'),
          })) || [];
          break;
        }

        case 'reviews': {
          const { data: reviews, error } = await db
            .reviews()
            .select(`
              *,
              users(email),
              businesses(name)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          if (error) throw error;
          
          data = reviews?.map(r => ({
            id: r.id,
            title: r.title,
            rating: r.rating,
            status: r.status,
            user_email: r.users?.email,
            business_name: r.businesses?.name,
            created_at: format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss'),
          })) || [];
          break;
        }

        case 'financial': {
          const { data: payments, error } = await db
            .payments()
            .select('*')
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          if (error) throw error;
          
          data = payments?.map(p => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            payment_method: p.payment_method || 'N/A',
            user_email: p.user_email || 'N/A',
            created_at: format(new Date(p.created_at), 'yyyy-MM-dd HH:mm:ss'),
          })) || [];
          break;
        }

        case 'events': {
          const { data: events, error } = await db
            .events()
            .select(`
              *,
              cities(name, countries(name))
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          if (error) throw error;
          
          data = events?.map(e => ({
            id: e.id,
            title: e.title,
            description: e.description || 'N/A',
            event_type: e.event_type || 'N/A',
            start_date: e.start_date ? format(new Date(e.start_date), 'yyyy-MM-dd') : 'N/A',
            end_date: e.end_date ? format(new Date(e.end_date), 'yyyy-MM-dd') : 'N/A',
            location: e.location || 'N/A',
            city: e.cities?.name || 'N/A',
            country: e.cities?.countries?.name || 'N/A',
            organizer_name: e.organizer_name || 'N/A',
            organizer_email: e.organizer_email || 'N/A',
            is_active: e.is_active ? 'Yes' : 'No',
            is_featured: e.is_featured ? 'Yes' : 'No',
            ticket_price: e.ticket_price || 0,
            created_at: format(new Date(e.created_at), 'yyyy-MM-dd HH:mm:ss'),
          })) || [];
          break;
        }

        case 'products': {
          const { data: products, error } = await db
            .products()
            .select(`
              *,
              businesses(name),
              categories(name)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          if (error) throw error;
          
          data = products?.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || 'N/A',
            price: p.price || 0,
            category: p.categories?.name || 'N/A',
            business_name: p.businesses?.name || 'N/A',
            stock_quantity: p.stock_quantity || 0,
            is_active: p.is_active ? 'Yes' : 'No',
            is_featured: p.is_featured ? 'Yes' : 'No',
            view_count: p.view_count || 0,
            created_at: format(new Date(p.created_at), 'yyyy-MM-dd HH:mm:ss'),
          })) || [];
          break;
        }

        case 'analytics': {
          // Fetch business analytics with aggregated data
          const { data: businesses, error } = await db
            .businesses()
            .select(`
              id,
              name,
              view_count,
              cities(name, countries(name)),
              categories(name)
            `);
          
          if (error) throw error;

          // Fetch click data
          const { data: clickData } = await db
            .business_clicks_totals()
            .select('business_id, total_clicks');

          // Fetch review stats
          const { data: reviewStats } = await db
            .business_review_stats()
            .select('business_id, review_count, average_rating');

          // Combine data
          data = businesses?.map((b: any) => {
            const clicks = clickData?.find((c: any) => c.business_id === b.id);
            const reviews = reviewStats?.find((r: any) => r.business_id === b.id);
            const totalClicks = clicks?.total_clicks || 0;
            const totalViews = b.view_count || 0;
            const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) + '%' : '0%';

            return {
              business_name: b.name,
              total_views: totalViews,
              total_clicks: totalClicks,
              ctr: ctr,
              review_count: reviews?.review_count || 0,
              average_rating: reviews?.average_rating ? Number(reviews.average_rating).toFixed(1) : '0.0',
              city: b.cities?.name || 'N/A',
              country: b.cities?.countries?.name || 'N/A',
              category: b.categories?.name || 'N/A',
            };
          }) || [];
          break;
        }
      }

      // Filter data to only include selected fields
      const filteredData = data.map(row => {
        const filtered: any = {};
        selectedFields.forEach(field => {
          filtered[field.label] = row[field.id];
        });
        return filtered;
      });

      return filteredData;
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    const data = await fetchReportData();
    setPreviewData(data.slice(0, 10)); // Show first 10 rows
    setShowPreview(true);
  };

  const handleExport = async () => {
    const data = await fetchReportData();
    
    if (data.length === 0) {
      toast({
        title: 'No data',
        description: 'No data available for the selected criteria',
        variant: 'destructive'
      });
      return;
    }

    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = `${reportType}-report-${timestamp}`;

    switch (exportFormat) {
      case 'csv': {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => 
            headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        break;
      }

      case 'excel': {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, reportType);
        XLSX.writeFile(wb, `${filename}.xlsx`);
        break;
      }

      case 'json': {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
        break;
      }
    }

    toast({
      title: 'Export successful',
      description: `${data.length} records exported as ${exportFormat.toUpperCase()}`,
    });
  };

  const reportTypes = [
    { value: 'businesses', label: 'Business Reports', icon: Building2, description: 'Export business listings data' },
    { value: 'users', label: 'User Reports', icon: Users, description: 'Export user accounts data' },
    { value: 'reviews', label: 'Review Reports', icon: MessageSquare, description: 'Export reviews and ratings' },
    { value: 'events', label: 'Event Reports', icon: CalendarIcon, description: 'Export event listings and details' },
    { value: 'products', label: 'Product Reports', icon: Package, description: 'Export marketplace products' },
    { value: 'financial', label: 'Financial Reports', icon: DollarSign, description: 'Export payment transactions' },
    { value: 'analytics', label: 'Analytics Reports', icon: BarChart3, description: 'Export performance metrics' },
  ];

  return (
    <AdminLayout title="Reports & Exports" subtitle="Generate and export comprehensive data reports">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-comfortaa font-bold text-yp-dark mb-2">Data Reports & Exports</h2>
          <p className="text-gray-600 font-roboto">
            Select report type, customize fields, and export data in your preferred format
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <Card
              key={type.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                reportType === type.value && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={() => setReportType(type.value as ReportType)}
            >
              <CardContent className="p-6">
                <type.icon className={cn(
                  "w-8 h-8 mb-3",
                  reportType === type.value ? "text-blue-600" : "text-gray-600"
                )} />
                <h3 className="font-comfortaa font-semibold text-lg mb-1">{type.label}</h3>
                <p className="text-sm text-gray-600 font-roboto">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Field Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-comfortaa flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Select Fields to Export</span>
              </CardTitle>
              <CardDescription className="font-roboto">
                Choose which fields to include in your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllFields}>
                  Deselect All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getCurrentFields().map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={field.selected}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-roboto cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="font-comfortaa flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div>
                <Label className="font-roboto mb-2 block">Date Range</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="font-roboto"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="font-roboto"
                  />
                </div>
              </div>

              {/* Export Format */}
              <div>
                <Label className="font-roboto mb-2 block">Export Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>CSV</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Excel (.xlsx)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center space-x-2">
                        <FileJson className="w-4 h-4" />
                        <span>JSON</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Preview Data
                </Button>
                
                <Button
                  onClick={handleExport}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && previewData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-comfortaa">Data Preview</CardTitle>
              <CardDescription className="font-roboto">
                Showing first 10 records (Total: {previewData.length} records will be exported)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-roboto font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value, vidx) => (
                          <td key={vidx} className="p-2 font-roboto">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};
