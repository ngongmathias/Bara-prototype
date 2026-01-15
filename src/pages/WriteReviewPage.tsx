import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Search, 
  Store, 
  MessageSquare, 
  FileText, 
  Crown, 
  Phone, 
  Globe, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Camera,
  X,
  Edit,
  Save
} from "lucide-react";
import { db, auth } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  category_id: string | null;
  status: 'pending' | 'active' | 'suspended' | 'premium';
  is_premium: boolean;
  is_verified: boolean;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  city?: {
    name: string;
  };
}

interface ReviewForm {
  business_id: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
}

interface BusinessReview {
  id: string;
  business_id: string;
  user_id?: string | null;
  rating: number;
  title: string | null;
  content: string;
  images?: string[] | null;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  created_at: string;
}

export const WriteReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("Kigali, Rwanda");
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  const [currentStep, setCurrentStep] = useState<'search' | 'review'>('search');
  
  // Business editing state
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [editingBusinessData, setEditingBusinessData] = useState<Partial<Business>>({});
  
  // Review form state
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    business_id: '',
    rating: 0,
    title: '',
    content: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  // Load business if businessId is provided in URL
  useEffect(() => {
    if (businessId) {
      loadBusinessById(businessId);
    }
  }, [businessId]);

  // Load business by ID
  const loadBusinessById = async (id: string) => {
    setIsLoadingBusiness(true);
    try {
      const { data, error } = await db.businesses()
        .select(`
          *,
          category:categories(name, slug),
          city:cities(name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading business:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business information.',
          variant: "destructive"
        });
        // Redirect back to search if business not found
        navigate('/writeareview');
      } else if (data) {
        setSelectedBusiness(data);
        setReviewForm(prev => ({ ...prev, business_id: data.id }));
        setCurrentStep('review');
        // Initialize editing data
        setEditingBusinessData({
          name: data.name,
          description: data.description,
          phone: data.phone,
          website: data.website,
          address: data.address
        });
        // Load reviews and stats for this business
        await Promise.all([
          loadReviews(data.id),
          loadReviewStats(data.id)
        ]);
      } else {
        toast({
          title: 'Business Not Found',
          description: 'The requested business could not be found.',
          variant: "destructive"
        });
        navigate('/writeareview');
      }
    } catch (error) {
      console.error('Error loading business:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business information.',
        variant: "destructive"
      });
      navigate('/writeareview');
    } finally {
      setIsLoadingBusiness(false);
    }
  };

  // Load previous reviews for business (admin-first to include ALL statuses)
  const loadReviews = async (id: string) => {
    setLoadingReviews(true);
    console.log('Loading reviews for business:', id);
    
    try {
      // Strategy 1: Use admin client first to bypass RLS and include ALL statuses
      let data: any[] | null = null; let error: any = null;
      try {
        const { getAdminDb } = await import('@/lib/supabase');
        const adminDb = getAdminDb();
        const adminRes = await adminDb.reviews()
          .select('*')
          .eq('business_id', id)
          .order('created_at', { ascending: false });
        data = adminRes.data || null; error = adminRes.error || null;
        console.log('Strategy 1 (admin all statuses):', adminRes);
      } catch (adminErr) {
        console.error('Admin client error:', adminErr);
      }

      // Strategy 2: If admin fails, try public client with all statuses
      if ((!data || data.length === 0) && error) {
        console.log('Admin failed, trying public client...');
        const anyRes = await db.reviews()
          .select('*')
          .eq('business_id', id)
          .order('created_at', { ascending: false });
        data = anyRes.data || null; error = anyRes.error || null;
        console.log('Strategy 2 (public all statuses):', anyRes);
      }

      // Strategy 3: If still no data, try individual status queries
      if ((!data || data.length === 0) && !error) {
        console.log('Trying individual status queries...');
        
        // Try approved first
        const approvedRes = await db.reviews()
          .select('*')
          .eq('business_id', id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        console.log('Strategy 3a (approved):', approvedRes);
        
        if (approvedRes.data && approvedRes.data.length > 0) {
          data = approvedRes.data;
          error = approvedRes.error;
        } else {
          // Try pending
          const pendingRes = await db.reviews()
            .select('*')
            .eq('business_id', id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
          console.log('Strategy 3b (pending):', pendingRes);
          
          if (pendingRes.data && pendingRes.data.length > 0) {
            data = pendingRes.data;
            error = pendingRes.error;
          } else {
            // Try any other status
            const otherRes = await db.reviews()
              .select('*')
              .eq('business_id', id)
              .not('status', 'in', '(approved,pending)')
              .order('created_at', { ascending: false });
            console.log('Strategy 3c (other statuses):', otherRes);
            
            if (otherRes.data && otherRes.data.length > 0) {
              data = otherRes.data;
              error = otherRes.error;
            }
          }
        }
      }

      if (error) {
        console.error('Final error loading reviews:', error);
        setReviews([]);
      } else {
        console.log('Final reviews data:', data);
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load aggregated rating from business_review_stats with fallbacks
  const loadReviewStats = async (id: string) => {
    console.log('Loading review stats for business:', id);
    
    try {
      // Strategy 1: Try business_review_stats view
      let { data, error } = await db.business_review_stats()
        .select('total_avg_rating, total_count, approved_avg_rating, approved_count')
        .eq('business_id', id)
        .order('total_count', { ascending: false })
        .limit(1);

      console.log('Strategy 1 (business_review_stats):', { data, error });

      // Strategy 2: If no stats, try admin client
      if ((!data || data.length === 0) && !error) {
        try {
          const { getAdminDb } = await import('@/lib/supabase');
          const adminDb = getAdminDb();
          const { data: adminData, error: adminError } = await adminDb.business_review_stats()
            .select('total_avg_rating, total_count, approved_avg_rating, approved_count')
            .eq('business_id', id)
            .order('total_count', { ascending: false })
            .limit(1);
          
          console.log('Strategy 2 (admin business_review_stats):', { data: adminData, error: adminError });
          
          if (adminData && adminData.length > 0) {
            data = adminData;
            error = adminError;
          }
        } catch (adminErr) {
          console.error('Admin client error for stats:', adminErr);
        }
      }

      // Strategy 3: Calculate from reviews directly if stats not available
      if ((!data || data.length === 0) && !error) {
        console.log('Strategy 3: Calculating from reviews directly');
        // This will be calculated from the reviews we already loaded
        return;
      }

      if (error) {
        console.error('Error loading review stats:', error);
        setAvgRating(null);
      } else if (data && data.length > 0) {
        const stats = data[0];
        // Use approved rating if available, otherwise total rating
        const rating = stats.approved_avg_rating || stats.total_avg_rating;
        console.log('Review stats found:', { stats, rating });
        setAvgRating(rating);
      } else {
        console.log('No review stats found');
        setAvgRating(null);
      }
    } catch (err) {
      console.error('Error loading review stats:', err);
      setAvgRating(null);
    }
  };

  // Search businesses
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: t('reviews.searchError'),
        description: t('reviews.businessName') + " is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await db.businesses()
        .select(`
          *,
          category:categories(name, slug),
          city:cities(name)
        `)
        .ilike('name', `%${searchTerm}%`)
        .eq('status', 'active')
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        toast({
          title: t('reviews.searchError'),
          description: t('reviews.searchFailed'),
          variant: "destructive"
        });
      } else {
        setSearchResults(data || []);
        if (data && data.length === 0) {
          toast({
            title: t('reviews.noResults'),
            description: t('reviews.noResults'),
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: t('reviews.searchError'),
        description: t('reviews.searchFailed'),
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Select business for review
  const handleSelectBusiness = async (business: Business) => {
    setSelectedBusiness(business);
    setReviewForm(prev => ({ ...prev, business_id: business.id }));
    setCurrentStep('review');
    
    // Load reviews and stats for the selected business
    await Promise.all([
      loadReviews(business.id),
      loadReviewStats(business.id)
    ]);
  };

  // Handle rating selection
  const handleRatingSelect = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ReviewForm, value: string | number | string[]) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle business editing
  const handleEditBusiness = () => {
    setIsEditingBusiness(true);
  };

  // Handle business edit input changes
  const handleBusinessEditChange = (field: keyof Business, value: string) => {
    setEditingBusinessData(prev => ({ ...prev, [field]: value }));
  };

  // Save business edits
  const handleSaveBusinessEdits = async () => {
    if (!selectedBusiness) return;

    // Validate required fields
    if (!editingBusinessData.name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Business name is required.',
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await db.businesses()
        .update({
          name: editingBusinessData.name || selectedBusiness.name,
          description: editingBusinessData.description || selectedBusiness.description,
          phone: editingBusinessData.phone || selectedBusiness.phone,
          website: editingBusinessData.website || selectedBusiness.website,
          address: editingBusinessData.address || selectedBusiness.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBusiness.id);

      if (error) {
        console.error('Error updating business:', error);
        toast({
          title: 'Error',
          description: 'Failed to update business information.',
          variant: "destructive"
        });
      } else {
        // Update local state
        setSelectedBusiness(prev => prev ? {
          ...prev,
          ...editingBusinessData
        } : null);
        
        setIsEditingBusiness(false);
        toast({
          title: 'Success',
          description: 'Business information updated successfully.',
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business information.',
        variant: "destructive"
      });
    }
  };

  // Cancel business editing
  const handleCancelBusinessEdit = () => {
    setIsEditingBusiness(false);
    // Reset editing data to original values
    if (selectedBusiness) {
      setEditingBusinessData({
        name: selectedBusiness.name,
        description: selectedBusiness.description,
        phone: selectedBusiness.phone,
        website: selectedBusiness.website,
        address: selectedBusiness.address
      });
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    // Validation
    if (!reviewForm.business_id) {
      toast({
        title: t('common.error'),
        description: t('reviews.selectBusiness'),
        variant: "destructive"
      });
      return;
    }

    if (reviewForm.rating === 0) {
      toast({
        title: t('common.error'),
        description: t('reviews.ratingRequired'),
        variant: "destructive"
      });
      return;
    }



    if (!reviewForm.content.trim()) {
      toast({
        title: t('common.error'),
        description: t('reviews.contentRequired'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Try to get current user if available
      let userId = null;
      try {
        const { data: { user } } = await auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        // User not authenticated, continue with anonymous review
        console.log('User not authenticated, submitting anonymous review');
      }

      // Submit review (with or without user authentication)
      const { error } = await db.reviews().insert({
        business_id: reviewForm.business_id,
        user_id: userId, // Will be null for anonymous reviews
        rating: reviewForm.rating,
        title: reviewForm.title || null, // Allow null title
        content: reviewForm.content,
        images: reviewForm.images.length > 0 ? reviewForm.images : null,
        status: 'pending'
      });

      if (error) {
        console.error('Review submission error:', error);
        toast({
          title: t('reviews.submissionError'),
          description: t('reviews.submissionFailed'),
          variant: "destructive"
        });
      } else {
        toast({
          title: t('reviews.reviewSubmitted'),
          description: t('reviews.reviewPending'),
          variant: "default"
        });
        
        // Reset form and go back to search
        setReviewForm(prev => ({
          business_id: prev.business_id,
          rating: 0,
          title: '',
          content: '',
          images: []
        }));
        // Refresh reviews and stats
        if (selectedBusiness?.id) {
          await Promise.all([
            loadReviews(selectedBusiness.id),
            loadReviewStats(selectedBusiness.id)
          ]);
        }
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: t('reviews.submissionError'),
        description: t('reviews.submissionFailed'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to search
  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedBusiness(null);
            setReviewForm({
          business_id: '',
          rating: 0,
          title: '',
          content: '',
          images: []
        });
  };

  return (
    <div className="min-h-screen bg-background font-roboto">
      <Header />
      <TopBannerAd />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Illustration placeholder */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-80 h-48 bg-gradient-to-br from-yp-yellow/20 to-brand-blue/20 rounded-lg flex items-center justify-center">
                <div className="flex space-x-4">
                  <div className="bg-yp-yellow p-4 rounded-lg">
                    <Store className="w-8 h-8 text-yp-dark" />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <MessageSquare className="w-8 h-8 text-brand-blue" />
                  </div>
                  <div className="bg-yp-yellow p-4 rounded-lg">
                    <FileText className="w-8 h-8 text-yp-dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-yp-dark mb-4 font-comfortaa">
            <span className="text-brand-blue">{t('ReviewMessageOne')} </span>{t('reviewMessage')}</h1>
          <p className="text-xl text-gray-600 mb-2 font-roboto">
            {t('reviews.helpFinding')}
          </p>
          <p className="text-xl text-gray-600 mb-8 font-roboto">
            {t('reviews.writeShare')}
          </p>
          
          {/* Search Form */}
          {currentStep === 'search' && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 mb-4 font-roboto">
                {t('reviews.searchBusiness')}
            </p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                    placeholder={t('reviews.businessName')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-base font-roboto"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                    placeholder={t('reviews.location')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 text-base font-roboto"
                />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-yp-yellow text-yp-dark px-8 h-12 font-roboto font-semibold"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('common.find')
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {currentStep === 'search' && searchResults.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-yp-dark mb-6 font-comfortaa">
            {t('reviews.selectBusiness')}
          </h2>
          <div className="grid gap-4">
            {searchResults.map((business) => (
              <Card 
                key={business.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectBusiness(business)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yp-dark font-comfortaa mb-2">
                        {business.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 font-roboto mb-2">
                        {business.category && (
                          <Badge variant="secondary">{business.category.name}</Badge>
                        )}
                        {business.city && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {business.city.name}
                          </span>
                        )}
                      </div>
                      {business.address && (
                        <p className="text-sm text-gray-600 font-roboto mb-2">
                          {business.address}
                        </p>
                      )}
                      {business.phone && (
                        <p className="text-sm text-gray-600 font-roboto flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {business.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {business.is_premium && (
                        <Badge className="bg-yellow-500 text-white">Premium</Badge>
                      )}
                      {business.is_verified && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {currentStep === 'review' && selectedBusiness && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToSearch}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('reviews.backToSearch')}
            </Button>
            
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-comfortaa">
                    {t('reviews.reviewingBusiness')} {selectedBusiness.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditBusiness}
                    className="font-roboto"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Business
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingBusiness ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                        Business Name *
                      </label>
                      <Input
                        type="text"
                        value={editingBusinessData.name || ''}
                        onChange={(e) => handleBusinessEditChange('name', e.target.value)}
                        className="font-roboto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                        Description
                      </label>
                      <Textarea
                        value={editingBusinessData.description || ''}
                        onChange={(e) => handleBusinessEditChange('description', e.target.value)}
                        className="font-roboto"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                        Address
                      </label>
                      <Input
                        type="text"
                        value={editingBusinessData.address || ''}
                        onChange={(e) => handleBusinessEditChange('address', e.target.value)}
                        className="font-roboto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={editingBusinessData.phone || ''}
                        onChange={(e) => handleBusinessEditChange('phone', e.target.value)}
                        className="font-roboto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                        Website
                      </label>
                      <Input
                        type="url"
                        value={editingBusinessData.website || ''}
                        onChange={(e) => handleBusinessEditChange('website', e.target.value)}
                        className="font-roboto"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={handleSaveBusinessEdits}
                        className="bg-brand-blue text-white font-roboto"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelBusinessEdit}
                        className="font-roboto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 font-roboto">
                    {selectedBusiness.category && (
                      <div className="flex items-center">
                        <Store className="w-4 h-4 mr-2" />
                        {selectedBusiness.category.name}
                      </div>
                    )}
                    {selectedBusiness.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedBusiness.address}
                      </div>
                    )}
                    {selectedBusiness.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {selectedBusiness.phone}
                      </div>
                    )}
                    {selectedBusiness.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        {selectedBusiness.website}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-comfortaa">{t('reviews.writeReview')}</CardTitle>
              <p className="text-sm text-gray-600 font-roboto mt-2">
                Share your experience with this business. Reviews are submitted anonymously.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Most Recent Review */}
              {reviews.length > 0 && (
                <div className="border rounded-md p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-yp-dark font-comfortaa">Latest Review</h3>
                    <span className="text-sm text-gray-700 font-roboto">
                      Avg: {avgRating ? avgRating.toFixed(1) : (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} {t('reviews.outOf5')} ({reviews.length} reviews)
                    </span>
                  </div>
                  
                  {/* Most recent review */}
                  <div className="bg-white border rounded p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Crown key={i} className={`w-5 h-5 ${i < reviews[0].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {reviews[0].rating} {t('reviews.outOf5')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-roboto">
                        {new Date(reviews[0].created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {reviews[0].title && (
                      <div className="text-sm font-medium text-gray-900 mb-2">{reviews[0].title}</div>
                    )}
                    <div className="text-sm text-gray-700 leading-relaxed">{reviews[0].content}</div>
                  </div>
                </div>
              )}

              {/* All Reviews Summary */}
              {reviews.length > 1 && (
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-yp-dark font-comfortaa">All Reviews</h3>
                    <span className="text-sm text-gray-700 font-roboto">
                      {reviews.length} total reviews
                    </span>
                  </div>
                  {loadingReviews ? (
                    <div className="text-sm text-gray-500">Loading reviews...</div>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-auto pr-1">
                      {reviews.slice(1).map((rev) => (
                        <div key={rev.id} className="bg-white border rounded p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Crown key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 font-roboto">{new Date(rev.created_at).toLocaleDateString()}</span>
                          </div>
                          {rev.title && (
                            <div className="mt-1 text-sm font-medium text-gray-900">{rev.title}</div>
                          )}
                          <div className="mt-1 text-sm text-gray-700">{rev.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No reviews message */}
              {reviews.length === 0 && !loadingReviews && (
                <div className="border rounded-md p-4 bg-green-50 border-green-200 text-center">
                  <div className="text-sm text-green-700 font-roboto">
                    No reviews found for this business. Be the first to review!
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Your review will appear here after submission.
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 font-roboto">
                  {t('reviews.rating')} *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingSelect(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Crown
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || reviewForm.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600 font-roboto">
                    {reviewForm.rating > 0 && `${reviewForm.rating} ${t('reviews.outOf5')}`}
                  </span>
                </div>
              </div>



              {/* Review Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  {t('reviews.reviewContent')} *
                </label>
                <Textarea
                  placeholder={t('reviews.reviewContent')}
                  value={reviewForm.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="font-roboto min-h-[120px]"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1 font-roboto">
                  {reviewForm.content.length}/1000 {t('reviews.characterCount')}
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  {t('reviews.addPhotos')}
                </label>
                {/* <BusinessImageUpload
                  businessId={selectedBusiness.id}
                  onImagesChange={(imageUrls) => handleInputChange('images', imageUrls)}
                  maxImages={5}
                  className="mb-4"
                /> */}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleBackToSearch}
                  disabled={isSubmitting}
                >
                  {t('reviews.cancel')}
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || reviewForm.rating === 0 || !reviewForm.content.trim()}
                  className="bg-yellow-900 hg:bg-yp-blue text-white font-roboto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('reviews.submitting')}
                    </>
                  ) : (
                    t('reviews.submitReview')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
      )}
      
      {/* Steps Section */}
      {currentStep === 'search' && (
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-yp-dark mb-3 font-comfortaa">
                {t('findBusiness')}
              </h3>
              <p className="text-gray-600 font-roboto">
              {t('lookForBusinesses')}
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-yp-dark mb-3 font-comfortaa">
                {t('sentenceOne')}
              </h3>
              <p className="text-gray-600 font-roboto">
                {t('reviews.feedbackMessage')}
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-yp-dark mb-3 font-comfortaa">
                {t('sentenceTwo')}
              </h3>
              <p className="text-gray-600 font-roboto">
                {t('reviews.shareMessage')}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
      <BottomBannerAd />
      <Footer />
    </div>
  );
};