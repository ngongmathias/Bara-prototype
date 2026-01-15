import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, 
  Share2, 
  Flag,
  MapPin,
  Calendar,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  User,
  CheckCircle,
  X,
  Briefcase,
  DollarSign,
  Clock,
  GraduationCap,
  Building2,
  Users,
  Shield,
  FileText,
  Award,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

export const JobsDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount();
    }
  }, [listingId]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(id, name, slug),
          countries(id, name, code, flag_url),
          marketplace_listing_images(id, image_url, display_order, is_primary)
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;

      const transformedListing = {
        ...data,
        category: data.marketplace_categories,
        country: data.countries,
        images: (data.marketplace_listing_images || []).sort((a: any, b: any) => a.display_order - b.display_order),
      };

      setListing(transformedListing);
      
      if (data.category_id) {
        fetchRelatedListings(data.category_id, data.id);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedListings = async (categoryId: string, currentListingId: string) => {
    try {
      const { data } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name),
          countries(name)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .neq('id', currentListingId)
        .limit(6);

      if (data) {
        setRelatedListings(data.map(item => ({
          ...item,
          category: item.marketplace_categories,
          country: item.countries,
        })));
      }
    } catch (error) {
      console.error('Error fetching related listings:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_listing_views', { listing_id: listingId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleWhatsAppContact = () => {
    if (listing?.seller_whatsapp) {
      const message = encodeURIComponent(`Hi, I'm interested in the job position: ${listing.title}`);
      const whatsappUrl = `https://wa.me/${listing.seller_whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handlePhoneContact = () => {
    if (listing?.seller_phone) {
      window.location.href = `tel:${listing.seller_phone}`;
    }
  };

  const handleEmailContact = () => {
    if (listing?.seller_email) {
      const subject = encodeURIComponent(`Application for: ${listing.title}`);
      const body = encodeURIComponent(`Dear Hiring Manager,\n\nI am interested in applying for the ${listing.title} position.\n\nPlease find my resume attached.\n\nBest regards`);
      window.location.href = `mailto:${listing.seller_email}?subject=${subject}&body=${body}`;
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Job link copied to clipboard',
      });
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for reporting',
        variant: 'destructive',
      });
      return;
    }

    try {
      await supabase.from('marketplace_reports').insert({
        listing_id: listingId,
        reason: reportReason,
        status: 'pending',
      });

      toast({
        title: 'Report Submitted',
        description: 'Thank you for reporting. We will review this listing.',
      });
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBannerAd />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBannerAd />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Extract job-specific attributes
  const companyName = listing.attributes?.company_name || listing.seller_name;
  const jobType = listing.attributes?.job_type || 'Full-time';
  const experience = listing.attributes?.experience || 'N/A';
  const education = listing.attributes?.education || 'N/A';
  const industry = listing.attributes?.industry || 'N/A';
  const salary = listing.price ? `${listing.currency} ${parseFloat(listing.price).toLocaleString()}` : 'Negotiable';
  const salaryPeriod = listing.price_type === 'monthly' ? 'per month' : listing.price_type === 'yearly' ? 'per year' : '';
  const deadline = listing.attributes?.deadline;
  const requirements = listing.attributes?.requirements || [];
  const responsibilities = listing.attributes?.responsibilities || [];
  const benefits = listing.attributes?.benefits || [];
  const companyLogo = listing.images?.[0]?.image_url;

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <TopBannerAd />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => navigate('/marketplace')} className="hover:text-blue-600">
            Marketplace
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate(`/marketplace/search?category=${listing.category?.slug}`)} className="hover:text-blue-600">
            {listing.category?.name}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                {companyLogo && (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={companyLogo} alt={companyName} className="w-full h-full object-contain p-2" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 font-comfortaa">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-gray-700 mb-3">
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">{companyName}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-blue-100 text-blue-700">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {jobType}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location_details || listing.country?.name}
                    </Badge>
                    {listing.is_featured && (
                      <Badge className="bg-yellow-400 text-yellow-900 font-semibold">
                        FEATURED
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Salary</div>
                    <div className="font-semibold text-gray-900 text-sm">{salary}</div>
                    {salaryPeriod && <div className="text-xs text-gray-500">{salaryPeriod}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Experience</div>
                    <div className="font-semibold text-gray-900 text-sm">{experience}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Education</div>
                    <div className="font-semibold text-gray-900 text-sm">{education}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Industry</div>
                    <div className="font-semibold text-gray-900 text-sm capitalize">{industry}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Job Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {responsibilities.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {requirements.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Benefits & Perks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Apply Section */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2 font-comfortaa">
                  {salary}
                </div>
                {salaryPeriod && (
                  <div className="text-sm text-gray-600 capitalize">{salaryPeriod}</div>
                )}
              </div>

              {deadline && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Application Deadline:</span>
                  </div>
                  <div className="text-red-900 font-semibold mt-1">
                    {new Date(deadline).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Apply Buttons */}
              <div className="space-y-3 mb-6">
                {listing.seller_email && (
                  <Button
                    onClick={handleEmailContact}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Apply via Email
                  </Button>
                )}

                {listing.seller_whatsapp && (
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
                  >
                    <FaWhatsapp className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </Button>
                )}

                {listing.seller_phone && (
                  <Button
                    onClick={handlePhoneContact}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Employer
                  </Button>
                )}

                {listing.seller_website && (
                  <Button
                    onClick={() => window.open(listing.seller_website, '_blank')}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Company Website
                  </Button>
                )}
              </div>

              {/* Company Info */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">About the Employer</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{companyName}</div>
                    <div className="text-sm text-gray-600 capitalize">{listing.seller_type}</div>
                  </div>
                </div>
                {listing.is_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Verified Employer
                  </div>
                )}
              </div>

              {/* Job Meta */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {listing.country?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Posted {new Date(listing.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {listing.views_count || 0} views
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="flex-1"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            {/* Application Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Application Tips
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tailor your resume to the job</li>
                <li>• Write a compelling cover letter</li>
                <li>• Research the company</li>
                <li>• Follow application instructions</li>
                <li>• Follow up professionally</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-comfortaa">
              Similar Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((item) => {
                const itemCompany = item.attributes?.company_name || item.seller_name;
                const itemType = item.attributes?.job_type || 'Full-time';
                const itemSalary = item.price ? `${item.currency} ${parseFloat(item.price).toLocaleString()}` : 'Negotiable';
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/marketplace/listing/${item.id}`);
                    }}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                      {item.is_featured && (
                        <Badge className="bg-yellow-400 text-yellow-900 text-xs ml-2">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {itemCompany}
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {itemType}
                      </Badge>
                      <span className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.country?.name}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {itemSalary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Report Job Listing</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Please tell us why you're reporting this job listing
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
                placeholder="Describe the issue..."
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Submit Report
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default JobsDetail;
