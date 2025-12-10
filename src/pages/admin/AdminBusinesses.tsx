import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2, 
  MapPin,
  Globe,
  Crown,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Upload,
  X,
  HelpCircle
} from "lucide-react";
import { getAdminDb } from "@/lib/supabase";
import { uploadImage, deleteImage } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Business {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  category_id: string;
  category_name?: string;
  city_id: string;
  city_name?: string;
  country_id: string;
  country_name?: string;
  hours_of_operation: any | null;
  services: any | null;
  images: string[] | null;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  order_online_url: string | null;
  website_visible: boolean;
  status: 'pending' | 'active' | 'suspended';
  is_premium: boolean;
  is_verified: boolean;
  has_coupons: boolean;
  accepts_orders_online: boolean;
  is_kid_friendly: boolean;
  is_sponsored_ad: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface City {
  id: string;
  name: string;
  country_id: string;
  country_name?: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

// Form validation schema
const businessFormSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  city_id: z.string().min(1, "City is required"),
  country_id: z.string().min(1, "Country is required"),
  hours_of_operation: z.any().optional(),
  services: z.any().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  order_online_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  website_visible: z.boolean().default(true),
  is_premium: z.boolean().default(false),
  is_verified: z.boolean().default(false),
  has_coupons: z.boolean().default(false),
  accepts_orders_online: z.boolean().default(false),
  is_kid_friendly: z.boolean().default(false),
  is_sponsored_ad: z.boolean().default(false),
  status: z.enum(['pending', 'active', 'suspended']).default('active')
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

export const AdminBusinesses = () => {
  const adminDb = getAdminDb();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [clickTotals, setClickTotals] = useState<Record<string, number>>({});
  const [monthlyClicks, setMonthlyClicks] = useState<Record<string, Array<{ month: string; clicks: number }>>>({});
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Image upload
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Form
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      whatsapp: "",
      category_id: "",
      city_id: "",
      country_id: "",
      latitude: null,
      longitude: null,
      order_online_url: "",
      website_visible: true,
      is_premium: false,
      is_verified: false,
      has_coupons: false,
      accepts_orders_online: false,
      is_kid_friendly: false,
      is_sponsored_ad: false,
      status: "active"
    }
  });

  useEffect(() => {
    fetchBusinesses();
    fetchCategories();
    fetchCities();
    fetchCountries();
    fetchClicksSummary();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBusinesses = async () => {
    try {
      // First, fetch businesses with basic info
      const { data: businessesData, error: businessesError } = await adminDb
        .businesses()
        .select('*')
        .order('created_at', { ascending: false });

      if (businessesError) throw businessesError;

      // Then fetch categories, cities, and countries separately
      const { data: categoriesData } = await adminDb.categories().select('id, name, slug');
      const { data: citiesData } = await adminDb.cities().select('id, name, country_id');
      const { data: countriesData } = await adminDb.countries().select('id, name');

      // Create lookup maps for better performance
      const categoriesMap = new Map(categoriesData?.map(cat => [cat.id, cat]) || []);
      const citiesMap = new Map(citiesData?.map(city => [city.id, city]) || []);
      const countriesMap = new Map(countriesData?.map(country => [country.id, country]) || []);

      // Combine the data
      const businessesWithDetails = businessesData?.map(business => ({
        ...business,
        category_name: business.category_id ? categoriesMap.get(business.category_id)?.name : null,
        city_name: business.city_id ? citiesMap.get(business.city_id)?.name : null,
        country_name: business.city_id ? 
          (citiesMap.get(business.city_id)?.country_id ? 
            countriesMap.get(citiesMap.get(business.city_id)?.country_id)?.name : null) : null
      })) || [];
      
      setBusinesses(businessesWithDetails);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await adminDb
        .categories()
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await adminDb
        .cities()
        .select(`
          *,
          countries!inner(name)
        `)
        .order('name');

      if (error) throw error;
      
      const citiesWithCountries = data?.map(city => ({
        ...city,
        country_name: city.countries?.name
      })) || [];
      
      setCities(citiesWithCountries);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await adminDb
        .countries()
        .select('*')
        .order('name');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchClicksSummary = async () => {
    try {
      // Totals per business
      const { data: totals } = await adminDb
        .business_clicks_totals()
        .select('*');

      const totalsMap: Record<string, number> = {};
      (totals || []).forEach((row: any) => {
        totalsMap[row.business_id] = row.total_clicks || 0;
      });

      // Monthly per business
      const { data: byMonth } = await adminDb
        .business_clicks_by_month()
        .select('*');

      const monthsMap: Record<string, Array<{ month: string; clicks: number }>> = {};
      (byMonth || []).forEach((row: any) => {
        const key = row.business_id;
        if (!monthsMap[key]) monthsMap[key] = [];
        monthsMap[key].push({ month: row.month, clicks: row.clicks });
      });

      setClickTotals(totalsMap);
      setMonthlyClicks(monthsMap);
    } catch (error) {
      console.error('Error fetching click summaries:', error);
    }
  };

  // Enhanced search filtering with better keyword matching
  const filteredBusinesses = businesses.filter(business => {
    if (!debouncedSearchTerm.trim()) {
      // If no search term, only apply status and category filters
      const matchesStatus = statusFilter === "all" || business.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || business.category_id === categoryFilter;
      return matchesStatus && matchesCategory;
    }

    // Enhanced search across multiple fields with better matching
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    
    // Search across multiple business fields
    const searchableFields = [
      business.name,
      business.description,
      business.address,
      business.phone,
      business.email,
      business.website,
      business.whatsapp,
      business.city_name,
      business.country_name,
      business.category_name
    ].filter(Boolean); // Remove null/undefined values
    
    // Check if ALL search words are found in ANY of the searchable fields
    const allWordsFound = searchWords.every(searchWord => 
      searchableFields.some(field => 
        field.toLowerCase().includes(searchWord)
      )
    );
    
    // Apply status and category filters
    const matchesStatus = statusFilter === "all" || business.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || business.category_id === categoryFilter;
    
    return allWordsFound && matchesStatus && matchesCategory;
  });

  // CSV Export
  const exportToCSV = () => {
    const data = filteredBusinesses;

    if (!data.length) {
      toast({
        title: "No data",
        description: "There are no businesses to export",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Category',
      'City',
      'Country',
      'Phone',
      'Email',
      'Website',
      'Status',
      'Premium',
      'Verified',
      'Created At'
    ];

    const rows = data.map((business) => [
      business.id,
      `"${(business.name || '').replace(/"/g, '""')}"`,
      `"${(business.category_name || '').replace(/"/g, '""')}"`,
      `"${(business.city_name || '').replace(/"/g, '""')}"`,
      `"${(business.country_name || '').replace(/"/g, '""')}"`,
      business.phone || '',
      business.email || '',
      business.website || '',
      business.status,
      business.is_premium ? 'Yes' : 'No',
      business.is_verified ? 'Yes' : 'No',
      new Date(business.created_at).toISOString()
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `businesses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  // CRUD Functions
  const handleAddBusiness = async (data: BusinessFormData) => {
    try {
      // Upload images to storage
      let uploadedImageUrls: string[] = [];
      let uploadedLogoUrl: string | null = null;

      // Upload business images
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => 
          uploadImage(file, 'business-images', 'businesses')
        );
        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      // Upload logo
      if (logoFile) {
        uploadedLogoUrl = await uploadImage(logoFile, 'business-logos', 'logos');
      }

      const businessData = {
        ...data,
        images: uploadedImageUrls,
        logo_url: uploadedLogoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newBusiness, error } = await adminDb
        .businesses()
        .insert(businessData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business added successfully",
        variant: "default"
      });

      setIsAddDialogOpen(false);
      form.reset();
      setUploadedImages([]);
      setImageFiles([]);
      setLogoFile(null);
      fetchBusinesses();
    } catch (error) {
      console.error('Error adding business:', error);
      toast({
        title: "Error",
        description: "Failed to add business",
        variant: "destructive"
      });
    }
  };

  const handleEditBusiness = async (data: BusinessFormData) => {
    if (!selectedBusiness) return;
    
    try {
      // Handle image uploads for editing
      // uploadedImages contains both existing URLs and new preview URLs
      // Filter to keep only existing database URLs (not blob: URLs)
      let finalImages = uploadedImages.filter(url => !url.startsWith('blob:'));
      let finalLogoUrl = selectedBusiness.logo_url;

      // Upload new images if any
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => 
          uploadImage(file, 'business-images', 'businesses')
        );
        const newImageUrls = await Promise.all(uploadPromises);
        
        // Combine existing images with new ones
        finalImages = [...finalImages, ...newImageUrls];
      }

      // Upload new logo if provided
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, 'business-logos', 'logos');
      }

      const businessData = {
        ...data,
        images: finalImages,
        logo_url: finalLogoUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await adminDb
        .businesses()
        .update(businessData)
        .eq('id', selectedBusiness.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business updated successfully",
        variant: "default"
      });

      setIsEditDialogOpen(false);
      setSelectedBusiness(null);
      form.reset();
      setUploadedImages([]);
      setImageFiles([]);
      setLogoFile(null);
      fetchBusinesses();
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Error",
        description: "Failed to update business",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return;
    
    try {
      const { error } = await adminDb
        .businesses()
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business deleted successfully",
        variant: "default"
      });

      fetchBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive"
      });
    }
  };

  const handleViewBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (business: Business) => {
    setSelectedBusiness(business);
    setUploadedImages(business.images || []);
    setImageFiles([]); // Reset file array for new uploads
    setLogoFile(null); // Reset logo file for new uploads
    form.reset({
      name: business.name,
      description: business.description || "",
      address: business.address || "",
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
      whatsapp: business.whatsapp || "",
      category_id: business.category_id,
      city_id: business.city_id,
      country_id: business.country_id,
      hours_of_operation: business.hours_of_operation,
      services: business.services,
      latitude: business.latitude,
      longitude: business.longitude,
      order_online_url: business.order_online_url || "",
      website_visible: business.website_visible ?? true,
      is_premium: business.is_premium,
      is_verified: business.is_verified,
      has_coupons: business.has_coupons,
      accepts_orders_online: business.accepts_orders_online,
      is_kid_friendly: business.is_kid_friendly,
      is_sponsored_ad: business.is_sponsored_ad,
      status: business.status
    });
    setIsEditDialogOpen(true);
  };

  const handleAddClick = () => {
    form.reset();
    setUploadedImages([]);
    setImageFiles([]);
    setLogoFile(null);
    setIsAddDialogOpen(true);
  };

  // PDF Export
  const exportToPDF = async () => {
    const element = document.getElementById('businesses-grid');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('businesses-list.pdf');
      toast({
        title: "Success",
        description: "PDF exported successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive"
      });
    }
  };

  // Image handling
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate files
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      for (const file of fileArray) {
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: "Please upload only JPEG, PNG, GIF, or WebP images.",
            variant: "destructive",
          });
          return;
        }
        
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: "Please upload images smaller than 5MB.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Create preview URLs for immediate display
      const newImages = fileArray.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
      setImageFiles(prev => [...prev, ...fileArray]);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only JPEG, PNG, GIF, or WebP images.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Function to highlight search terms in text
  const highlightSearchTerms = (text: string | null, searchTerm: string) => {
    if (!text || !searchTerm.trim()) return text;
    
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    let highlightedText = text;
    
    searchWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  

  if (loading) {
    return (
      <AdminLayout title="Businesses Management" subtitle="Manage business listings and verifications">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yp-blue"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Businesses Management" subtitle="Manage business listings and verifications">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-comfortaa font-bold text-yp-dark">Businesses</h2>
          <p className="text-gray-600 font-roboto">Manage and moderate business listings</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsHelpDialogOpen(true)}
            className="font-roboto"
            title="Admin Guide"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="font-roboto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToPDF}
            className="font-roboto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            className="bg-yellow-900 hover:bg-blue-600"
            onClick={handleAddClick}
          >
          <Plus className="w-4 h-4 mr-2 " />
          Add Business
        </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search businesses by name, description, address, phone, email, website, city, country, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 text-sm font-roboto text-gray-900 ${
                  searchTerm ? 'ring-2 ring-yp-blue/20 border-yp-blue' : ''
                }`}
              />

              {isSearching && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yp-blue"></div>
                </div>
              )}
              {searchTerm && !isSearching && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Search suggestions */}
              {searchTerm && searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2 text-xs text-gray-500 font-roboto border-b">
                    Search suggestions:
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-roboto text-gray-700 mb-1">
                      • Try searching for: <span className="text-yp-blue">{searchTerm}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Search across all business fields including contact information and location
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="font-roboto">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-roboto">All Statuses</SelectItem>
                <SelectItem value="active" className="font-roboto">Active</SelectItem>
                <SelectItem value="pending" className="font-roboto">Pending</SelectItem>
                <SelectItem value="suspended" className="font-roboto">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="font-roboto">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-roboto">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="font-roboto">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="self-center justify-center">
              {filteredBusinesses.length} businesses
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Summary */}
      {debouncedSearchTerm && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-yp-blue" />
                <span className="font-roboto text-gray-700">
                  Search results for "<span className="font-semibold text-yp-dark">{debouncedSearchTerm}</span>"
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="font-roboto">
                  Found <span className="font-semibold text-yp-blue">{filteredBusinesses.length}</span> businesses
                </span>
                <span className="font-roboto">
                  from <span className="font-semibold text-yp-blue">{businesses.length}</span> total
                </span>
              </div>
            </div>
            
            {/* Search Statistics */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-yp-blue">{filteredBusinesses.length}</div>
                  <div>Results</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yp-blue">
                    {Math.round((filteredBusinesses.length / businesses.length) * 100)}%
                  </div>
                  <div>Match Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yp-blue">
                    {debouncedSearchTerm.split(/\s+/).filter(word => word.length > 0).length}
                  </div>
                  <div>Search Terms</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yp-blue">300ms</div>
                  <div>Search Delay</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Businesses Grid */}
      <div id="businesses-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentBusinesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-yp-blue" />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-comfortaa line-clamp-2">
                      {debouncedSearchTerm ? (
                        <span dangerouslySetInnerHTML={{ 
                          __html: highlightSearchTerms(business.name, debouncedSearchTerm) || business.name 
                        }} />
                      ) : (
                        business.name
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-roboto text-gray-600">
                        {business.city_name}, {business.country_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => handleViewBusiness(business)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => handleEditClick(business)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteBusiness(business.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {business.description && (
                <p className="text-sm font-roboto text-gray-600 mb-3 line-clamp-2">
                  {debouncedSearchTerm ? (
                    <span dangerouslySetInnerHTML={{ 
                      __html: highlightSearchTerms(business.description, debouncedSearchTerm) || business.description 
                    }} />
                  ) : (
                    business.description
                  )}
                </p>
              )}
              
              {/* Business Features Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {business.is_premium && (
                  <Badge variant="secondary" className="text-xs bg-yellow-900 text-white">
                    Premium
                  </Badge>
                )}
                {business.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
                {business.has_coupons && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                    Coupons
                  </Badge>
                )}
                {business.accepts_orders_online && (
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                    Order Online
                  </Badge>
                )}
                {business.is_kid_friendly && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                    Family Friendly
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-roboto">{business.view_count || 0} views</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="font-roboto">{clickTotals[business.id] ?? business.click_count ?? 0} clicks</span>
                </div>
              </div>

              {/* Recent monthly clicks (last 3 months) */}
              {monthlyClicks[business.id] && monthlyClicks[business.id].length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {monthlyClicks[business.id]
                      .slice(-3)
                      .map((m) => (
                        <Badge key={String(m.month)} variant="outline" className="text-xs">
                          {new Date(m.month).toLocaleString(undefined, { month: 'short', year: '2-digit' })}: {m.clicks}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className="font-roboto"
                >
                  <span className="capitalize">{business.status}</span>
                </Badge>
                <span className="text-xs font-roboto text-gray-500">
                  {new Date(business.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-roboto text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredBusinesses.length)} of {filteredBusinesses.length} businesses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="font-roboto"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="font-roboto w-8 h-8 p-0"
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
                  className="font-roboto"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredBusinesses.length === 0 && debouncedSearchTerm && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-comfortaa font-semibold text-gray-900 mb-2">
              No businesses found for "{debouncedSearchTerm}"
            </h3>
            <p className="text-gray-600 font-roboto mb-4">
              Try adjusting your search terms or filters. You can search by:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500 font-roboto">
              <div>• Business name</div>
              <div>• Description</div>
              <div>• Address</div>
              <div>• Phone number</div>
              <div>• Email</div>
              <div>• Website</div>
              <div>• City</div>
              <div>• Country</div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="font-roboto"
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Business Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-comfortaa">Add New Business</DialogTitle>
            <DialogDescription className="font-roboto">
              Fill in the details to create a new business listing
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleAddBusiness)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-roboto">Business Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    className="font-roboto"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description" className="font-roboto">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    className="font-roboto"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="font-roboto">Address</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="font-roboto">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-roboto">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="font-roboto"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="website" className="font-roboto">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...form.register("website")}
                    className="font-roboto"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.website.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="whatsapp" className="font-roboto">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    {...form.register("whatsapp")}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="order_online_url" className="font-roboto">Order Online URL</Label>
                  <Input
                    id="order_online_url"
                    type="url"
                    placeholder="https://order.example.com"
                    {...form.register("order_online_url")}
                    className="font-roboto"
                  />
                  {form.formState.errors.order_online_url && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.order_online_url.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="font-roboto">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="-90 to 90"
                      onChange={(e) => form.setValue("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                      value={form.watch("latitude") ?? ""}
                      className="font-roboto"
                    />
                    <p className="text-xs text-gray-500 mt-1">For map view</p>
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="font-roboto">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-180 to 180"
                      onChange={(e) => form.setValue("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                      value={form.watch("longitude") ?? ""}
                      className="font-roboto"
                    />
                    <p className="text-xs text-gray-500 mt-1">For map view</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category_id" className="font-roboto">Category *</Label>
                  <Select value={form.watch("category_id")} onValueChange={(value) => form.setValue("category_id", value)}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="font-roboto">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category_id && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.category_id.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country_id" className="font-roboto">Country *</Label>
                  <Select value={form.watch("country_id")} onValueChange={(value) => form.setValue("country_id", value)}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id} className="font-roboto">
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.country_id && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.country_id.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city_id" className="font-roboto">City *</Label>
                  <Select value={form.watch("city_id")} onValueChange={(value) => form.setValue("city_id", value)}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities
                        .filter(city => !form.watch("country_id") || city.country_id === form.watch("country_id"))
                        .map((city) => (
                          <SelectItem key={city.id} value={city.id} className="font-roboto">
                            {city.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.city_id && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.city_id.message}</p>
                  )}
                </div>
              
                <div>
                  <Label htmlFor="status" className="font-roboto">Status</Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as 'pending' | 'active' | 'suspended')}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="font-roboto">Pending</SelectItem>
                      <SelectItem value="active" className="font-roboto">Active</SelectItem>
                      <SelectItem value="suspended" className="font-roboto">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_premium"
                      checked={form.watch("is_premium")}
                      onCheckedChange={(checked) => form.setValue("is_premium", checked)}
                      className={`${form.watch("is_premium") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="is_premium" className="font-roboto">
                      <span className={`${form.watch("is_premium") ? 'text-green-700' : 'text-red-700'}`}>
                        Premium Business
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_verified"
                      checked={form.watch("is_verified")}
                      onCheckedChange={(checked) => form.setValue("is_verified", checked)}
                      className={`${form.watch("is_verified") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="is_verified" className="font-roboto">
                      <span className={`${form.watch("is_verified") ? 'text-green-700' : 'text-red-700'}`}>
                        Verified Business
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="has_coupons"
                      checked={form.watch("has_coupons")}
                      onCheckedChange={(checked) => form.setValue("has_coupons", checked)}
                      className={`${form.watch("has_coupons") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="has_coupons" className="font-roboto">
                      <span className={`${form.watch("has_coupons") ? 'text-green-700' : 'text-red-700'}`}>
                        Has Coupons
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="accepts_orders_online"
                      checked={form.watch("accepts_orders_online")}
                      onCheckedChange={(checked) => form.setValue("accepts_orders_online", checked)}
                      className={`${form.watch("accepts_orders_online") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="accepts_orders_online" className="font-roboto">
                      <span className={`${form.watch("accepts_orders_online") ? 'text-green-700' : 'text-red-700'}`}>
                        Accepts Online Orders
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_kid_friendly"
                      checked={form.watch("is_kid_friendly")}
                      onCheckedChange={(checked) => form.setValue("is_kid_friendly", checked)}
                      className={`${form.watch("is_kid_friendly") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="is_kid_friendly" className="font-roboto">
                      <span className={`${form.watch("is_kid_friendly") ? 'text-green-700' : 'text-red-700'}`}>
                        Family Friendly
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_sponsored_ad"
                      checked={form.watch("is_sponsored_ad")}
                      onCheckedChange={(checked) => form.setValue("is_sponsored_ad", checked)}
                      className={`${form.watch("is_sponsored_ad") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="is_sponsored_ad" className="font-roboto">
                      <span className={`${form.watch("is_sponsored_ad") ? 'text-green-700' : 'text-red-700'}`}>
                        Sponsored Ad
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="website_visible"
                      checked={form.watch("website_visible") ?? true}
                      onCheckedChange={(checked) => form.setValue("website_visible", checked)}
                      className={`${form.watch("website_visible") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="website_visible" className="font-roboto">
                      <span className={`${form.watch("website_visible") ? 'text-green-700' : 'text-red-700'}`}>
                        Show Website Link
                      </span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              <div>
                <Label className="font-roboto">Business Logo</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="font-roboto"
                  />
                </div>
                {logoFile && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLogoFile(null)}
                      className="font-roboto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label className="font-roboto">Business Images</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="font-roboto"
                  />
                </div>
                {uploadedImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Business image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="font-roboto">
                Cancel
              </Button>
              <Button type="submit" className="bg-yellow-900 hover:bg-blue-600 font-roboto">
                Add Business
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Business Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-comfortaa">Edit Business</DialogTitle>
            <DialogDescription className="font-roboto">
              Update the business details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleEditBusiness)} className="space-y-6">
            {/* Same form fields as Add Business Dialog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="font-roboto">Business Name *</Label>
                  <Input
                    id="edit-name"
                    {...form.register("name")}
                    className="font-roboto"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-description" className="font-roboto">Description</Label>
                  <Textarea
                    id="edit-description"
                    {...form.register("description")}
                    className="font-roboto"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address" className="font-roboto">Address</Label>
                  <Input
                    id="edit-address"
                    {...form.register("address")}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone" className="font-roboto">Phone</Label>
                  <Input
                    id="edit-phone"
                    {...form.register("phone")}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email" className="font-roboto">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...form.register("email")}
                    className="font-roboto"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-website" className="font-roboto">Website</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    {...form.register("website")}
                    className="font-roboto"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.website.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-whatsapp" className="font-roboto">WhatsApp</Label>
                  <Input
                    id="edit-whatsapp"
                    {...form.register("whatsapp")}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-order_online_url" className="font-roboto">Order Online URL</Label>
                  <Input
                    id="edit-order_online_url"
                    type="url"
                    placeholder="https://order.example.com"
                    {...form.register("order_online_url")}
                    className="font-roboto"
                  />
                  {form.formState.errors.order_online_url && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.order_online_url.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-latitude" className="font-roboto">Latitude</Label>
                    <Input
                      id="edit-latitude"
                      type="number"
                      step="any"
                      placeholder="-90 to 90"
                      onChange={(e) => form.setValue("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                      value={form.watch("latitude") ?? ""}
                      className="font-roboto"
                    />
                    <p className="text-xs text-gray-500 mt-1">For map view</p>
                  </div>
                  <div>
                    <Label htmlFor="edit-longitude" className="font-roboto">Longitude</Label>
                    <Input
                      id="edit-longitude"
                      type="number"
                      step="any"
                      placeholder="-180 to 180"
                      onChange={(e) => form.setValue("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                      value={form.watch("longitude") ?? ""}
                      className="font-roboto"
                    />
                    <p className="text-xs text-gray-500 mt-1">For map view</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-category_id" className="font-roboto">Category *</Label>
                  <Select value={form.watch("category_id")} onValueChange={(value) => form.setValue("category_id", value)}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="font-roboto">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category_id && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.category_id.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-country_id" className="font-roboto">Country *</Label>
                  <Select value={form.watch("country_id")} onValueChange={(value) => form.setValue("country_id", value)}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id} className="font-roboto">
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.country_id && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.country_id.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-city_id" className="font-roboto">City *</Label>
                  <Select value={form.watch("city_id")} onValueChange={(value) => form.setValue("city_id", value)}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities
                        .filter(city => !form.watch("country_id") || city.country_id === form.watch("country_id"))
                        .map((city) => (
                          <SelectItem key={city.id} value={city.id} className="font-roboto">
                            {city.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.city_id && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.city_id.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="edit-status" className="font-roboto">Status</Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as 'pending' | 'active' | 'suspended')}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="font-roboto">Pending</SelectItem>
                      <SelectItem value="active" className="font-roboto">Active</SelectItem>
                      <SelectItem value="suspended" className="font-roboto">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-is_premium"
                      checked={form.watch("is_premium")}
                      onCheckedChange={(checked) => form.setValue("is_premium", checked)}
                      className={`${form.watch("is_premium") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-is_premium" className="font-roboto">
                      <span className={`${form.watch("is_premium") ? 'text-green-700' : 'text-red-700'}`}>
                        Premium Business
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-is_verified"
                      checked={form.watch("is_verified")}
                      onCheckedChange={(checked) => form.setValue("is_verified", checked)}
                      className={`${form.watch("is_verified") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-is_verified" className="font-roboto">
                      <span className={`${form.watch("is_verified") ? 'text-green-700' : 'text-red-700'}`}>
                        Verified Business
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-has_coupons"
                      checked={form.watch("has_coupons")}
                      onCheckedChange={(checked) => form.setValue("has_coupons", checked)}
                      className={`${form.watch("has_coupons") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-has_coupons" className="font-roboto">
                      <span className={`${form.watch("has_coupons") ? 'text-green-700' : 'text-red-700'}`}>
                        Has Coupons
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-accepts_orders_online"
                      checked={form.watch("accepts_orders_online")}
                      onCheckedChange={(checked) => form.setValue("accepts_orders_online", checked)}
                      className={`${form.watch("accepts_orders_online") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-accepts_orders_online" className="font-roboto">
                      <span className={`${form.watch("accepts_orders_online") ? 'text-green-700' : 'text-red-700'}`}>
                        Accepts Online Orders
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-is_kid_friendly"
                      checked={form.watch("is_kid_friendly")}
                      onCheckedChange={(checked) => form.setValue("is_kid_friendly", checked)}
                      className={`${form.watch("is_kid_friendly") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-is_kid_friendly" className="font-roboto">
                      <span className={`${form.watch("is_kid_friendly") ? 'text-green-700' : 'text-red-700'}`}>
                        Family Friendly
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-is_sponsored_ad"
                      checked={form.watch("is_sponsored_ad")}
                      onCheckedChange={(checked) => form.setValue("is_sponsored_ad", checked)}
                      className={`${form.watch("is_sponsored_ad") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-is_sponsored_ad" className="font-roboto">
                      <span className={`${form.watch("is_sponsored_ad") ? 'text-green-700' : 'text-red-700'}`}>
                        Sponsored Ad
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-website_visible"
                      checked={form.watch("website_visible") ?? true}
                      onCheckedChange={(checked) => form.setValue("website_visible", checked)}
                      className={`${form.watch("website_visible") ? 'bg-green-600' : 'bg-red-600'}`}
                    />
                    <Label htmlFor="edit-website_visible" className="font-roboto">
                      <span className={`${form.watch("website_visible") ? 'text-green-700' : 'text-red-700'}`}>
                        Show Website Link
                      </span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Upload Section for Edit */}
            <div className="space-y-4">
              <div>
                <Label className="font-roboto">Business Logo</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="font-roboto"
                  />
                </div>
                {(logoFile || selectedBusiness?.logo_url) && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : selectedBusiness?.logo_url}
                      alt="Logo preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLogoFile(null)}
                      className="font-roboto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label className="font-roboto">Business Images</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="font-roboto"
                  />
                </div>
                {uploadedImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Business image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-roboto">
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800 text-white font-roboto">
                Update Business
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Business Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-comfortaa">Business Details</DialogTitle>
            <DialogDescription className="font-roboto">
              View complete business information
            </DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Business Header */}
              <div className="flex items-start space-x-4">
                {selectedBusiness.logo_url && (
                  <img
                    src={selectedBusiness.logo_url}
                    alt="Business logo"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-comfortaa font-bold text-yp-dark">{selectedBusiness.name}</h3>
                  <p className="text-gray-600 font-roboto">{selectedBusiness.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-roboto text-gray-600">
                      {selectedBusiness.address}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="outline" className="capitalize">
                    {selectedBusiness.status}
                  </Badge>
                  {selectedBusiness.is_premium && (
                    <Badge variant="default" className="bg-yp-blue">
                      Premium
                    </Badge>
                  )}
                  {selectedBusiness.is_verified && (
                    <Badge variant="secondary">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Business Images */}
              {selectedBusiness.images && selectedBusiness.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-comfortaa font-semibold mb-3">Business Images</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {selectedBusiness.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Business image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-comfortaa font-semibold">Contact Information</h4>
                  <div className="space-y-3">
                    {selectedBusiness.phone && (
                      <div className="flex items-center space-x-2">
                        <span className="font-roboto font-medium">Phone:</span>
                        <span className="font-roboto">{selectedBusiness.phone}</span>
                      </div>
                    )}
                    {selectedBusiness.email && (
                      <div className="flex items-center space-x-2">
                        <span className="font-roboto font-medium">Email:</span>
                        <span className="font-roboto">{selectedBusiness.email}</span>
                      </div>
                    )}
                    {selectedBusiness.website && (
                      <div className="flex items-center space-x-2">
                        <span className="font-roboto font-medium">Website:</span>
                        <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="font-roboto text-yp-blue hover:underline">
                          {selectedBusiness.website}
                        </a>
                      </div>
                    )}
                    {selectedBusiness.whatsapp && (
                      <div className="flex items-center space-x-2">
                        <span className="font-roboto font-medium">WhatsApp:</span>
                        <span className="font-roboto">{selectedBusiness.whatsapp}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-comfortaa font-semibold">Location</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-roboto font-medium">City:</span>
                      <span className="font-roboto">{selectedBusiness.city_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-roboto font-medium">Country:</span>
                      <span className="font-roboto">{selectedBusiness.country_name}</span>
                    </div>
                  
                  </div>
                </div>
              </div>

              {/* Business Features */}
              <div>
                <h4 className="text-lg font-comfortaa font-semibold mb-3">Business Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBusiness.has_coupons && (
                    <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                      Coupons
                    </Badge>
                  )}
                  {selectedBusiness.accepts_orders_online && (
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      Order Online
                    </Badge>
                  )}
                  {selectedBusiness.is_kid_friendly && (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      Family Friendly
                    </Badge>
                  )}
                  {selectedBusiness.is_sponsored_ad && (
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      Sponsored Ad
                    </Badge>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-comfortaa font-bold text-yp-blue">{selectedBusiness.view_count}</div>
                  <div className="text-sm font-roboto text-gray-600">Total Views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-comfortaa font-bold text-yp-blue">{selectedBusiness.click_count}</div>
                  <div className="text-sm font-roboto text-gray-600">Total Clicks</div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm font-roboto text-gray-500">
                <div>Created: {new Date(selectedBusiness.created_at).toLocaleString()}</div>
                <div>Updated: {new Date(selectedBusiness.updated_at).toLocaleString()}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="font-roboto">
              Close
            </Button>
            {selectedBusiness && (
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditClick(selectedBusiness);
                }}
                className="bg-yp-blue hover:opacity-80 text-white px-4 py-2 rounded-lg font-roboto font-medium transition-opacity duration-300 flex items-center gap-2"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Business
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-comfortaa text-2xl">Business Management Guide</DialogTitle>
            <DialogDescription className="font-roboto">
              Quick reference guide for managing business listings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 font-roboto">
            {/* URLs Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📍 Listings URLs
              </h3>
              <p className="text-sm text-gray-700 mb-2">Businesses appear at:</p>
              <code className="block text-sm bg-gray-100 px-3 py-2 rounded border">
                https://www.baraafrika.com/listings/category/{'{category}'}
              </code>
              <p className="text-xs text-gray-600 mt-2">Example: /listings/category/restaurant</p>
            </div>

            {/* Map View Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🗺️ Map View Setup
              </h3>
              <p className="text-sm text-gray-700 mb-2">For businesses to appear on map:</p>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Add <strong>Latitude</strong> (range: -90 to 90)</li>
                <li>Add <strong>Longitude</strong> (range: -180 to 180)</li>
              </ul>
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">💡 How to get coordinates:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Find business on Google Maps</li>
                  <li>Right-click location → "What's here?"</li>
                  <li>Copy coordinates (e.g., -1.286389, 36.817223)</li>
                  <li>First number = Latitude, Second = Longitude</li>
                </ol>
              </div>
            </div>

            {/* Key Fields Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                ✨ Key Fields & Display
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-24">Phone:</span>
                  <span className="text-gray-700">Shows in <span className="text-green-600 font-semibold">GREEN</span>, prominently displayed on right side</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-24">Premium:</span>
                  <span className="text-gray-700">Featured in sidebar, blue badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-24">Sponsored:</span>
                  <span className="text-gray-700">Blue background + top placement + "Ad" badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-24">Status:</span>
                  <span className="text-gray-700">Must be <strong className="text-green-600">"Active"</strong> to show publicly</span>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🎯 Status Management
              </h3>
              <div className="space-y-2">
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-sm"><strong className="text-green-700">Active:</strong> Business is live and visible to users ✅</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm"><strong className="text-yellow-700">Pending:</strong> Awaiting review/approval ⏳</p>
                </div>
                <div className="p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-sm"><strong className="text-red-700">Suspended:</strong> Hidden from public view ❌</p>
                </div>
              </div>
            </div>

            {/* Image Guidelines */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📸 Image Guidelines
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li><strong>Logo:</strong> Square format, 500x500px minimum</li>
                <li><strong>Gallery:</strong> Landscape format, 1200x800px recommended</li>
                <li><strong>File size:</strong> Under 2MB per image</li>
                <li><strong>Format:</strong> JPG or PNG</li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🔧 Troubleshooting
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">Business not showing on website?</p>
                  <ul className="text-gray-600 mt-1 list-disc list-inside ml-4">
                    <li>Check status is "Active"</li>
                    <li>Verify category and country assigned</li>
                    <li>Clear browser cache</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Map view not working?</p>
                  <ul className="text-gray-600 mt-1 list-disc list-inside ml-4">
                    <li>Add latitude and longitude coordinates</li>
                    <li>Verify coordinates are in correct range</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsHelpDialogOpen(false)}
              className="font-roboto"
            >
              Close
            </Button>
            <Button 
              onClick={() => window.open('/ADMIN_GUIDE.md', '_blank')}
              className="bg-blue-600 hover:bg-blue-700 font-roboto"
            >
              View Full Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};