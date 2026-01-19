import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Building, 
  Globe, 
  Image as ImageIcon, 
  MapPin, 
  Mail,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { useSponsoredBanners } from '@/hooks/useSponsoredBanners';
import { db } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url?: string;
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  companyName: string;
  countryName: string;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ 
  isOpen, 
  onClose, 
  amount, 
  companyName,
  countryName
}) => {
  const handleContactSales = () => {
    const subject = encodeURIComponent(`Country Sponsorship Inquiry - ${countryName}`);
    const body = encodeURIComponent(
      `Hi BARA Team,\n\nI'm interested in sponsoring the ${countryName} page.\n\nCompany: ${companyName}\nPackage: $${amount} USD\n\nPlease contact me with payment options and next steps.\n\nThank you!`
    );
    window.location.href = `mailto:sponsorship@baraafrika.com?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Country Sponsorship Inquiry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Setup Notice */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 font-semibold">Payment Processing Coming Soon</AlertTitle>
            <AlertDescription className="text-yellow-700">
              We're setting up secure payment processing. Contact us to sponsor now and get priority placement!
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Country:</strong> {countryName}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Package:</strong> ${amount} USD
            </p>
            <p className="text-sm text-blue-800">
              <strong>Company:</strong> {companyName}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContactSales}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SponsorCountryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createBanner } = useSponsoredBanners();
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_website: '',
    banner_alt_text: '',
    country_id: '',
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await db.countries()
        .select('id, name, code, flag_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: "Error",
        description: "Failed to load countries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, GIF, or WebP image.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setBannerImage(file);
      
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setBannerImageUrl(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bannerImage) {
      toast({
        title: "Image Required",
        description: "Please upload a banner image.",
        variant: "destructive",
      });
      return;
    }

    // Get selected country name
    const selectedCountry = countries.find(c => c.id === formData.country_id);
    setSelectedCountryName(selectedCountry?.name || 'Selected Country');
    setShowContactDialog(true);
  };

  const handleContactSuccess = async () => {
    setSubmitting(true);
    
    try {
      // Upload image to storage first
      if (!bannerImage) {
        throw new Error('No image to upload');
      }

      const uploadResult = await uploadImage(bannerImage, 'sponsored-banners', 'banners');
      
      if (uploadResult.error) {
        throw new Error(`Image upload failed: ${uploadResult.error}`);
      }

      // Create banner data with uploaded image URL
      const bannerData = {
        country_id: formData.country_id,
        company_name: formData.company_name,
        company_website: formData.company_website,
        banner_image_url: uploadResult.url,
        banner_alt_text: formData.banner_alt_text,
        payment_status: 'paid' as const,
        payment_id: `PAY_${Date.now()}`,
      };

      const result = await createBanner(bannerData);
      
      if (result) {
        toast({
          title: "Success!",
          description: "Your sponsored banner has been submitted and will be reviewed by our team.",
        });
        
        // Reset form
        setFormData({
          company_name: '',
          company_website: '',
          banner_alt_text: '',
          country_id: '',
        });
        setBannerImage(null);
        setBannerImageUrl('');
        
        navigate('/');
      }
    } catch (error) {
      console.error('Error submitting banner:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yp-gray-light">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yp-gray-light">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yp-dark mb-4">
            {t('sponsorCountry.title')}
          </h1>
          <p className="text-lg text-yp-gray-dark max-w-2xl mx-auto">
            {t('sponsorCountry.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  {t('sponsorCountry.benefits.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">{t('sponsorCountry.benefits.banner.title')}</h4>
                    <p className="text-sm text-gray-600">{t('sponsorCountry.benefits.banner.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">{t('sponsorCountry.benefits.visibility.title')}</h4>
                    <p className="text-sm text-gray-600">{t('sponsorCountry.benefits.visibility.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">{t('sponsorCountry.benefits.audience.title')}</h4>
                    <p className="text-sm text-gray-600">{t('sponsorCountry.benefits.audience.description')}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">{t('sponsorCountry.price.label')}</span>
                    <span className="text-2xl font-bold text-blue-900">{t('sponsorCountry.price.amount')}</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{t('sponsorCountry.price.note')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('sponsorCountry.form.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('sponsorCountry.form.companyInfo')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('sponsorCountry.form.companyName')} *
                        </label>
                        <Input
                          required
                          value={formData.company_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                          placeholder={t('sponsorCountry.form.companyNamePlaceholder')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('sponsorCountry.form.website')} *
                        </label>
                        <Input
                          required
                          type="url"
                          value={formData.company_website}
                          onChange={(e) => setFormData(prev => ({ ...prev, company_website: e.target.value }))}
                          placeholder={t('sponsorCountry.form.websitePlaceholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('sponsorCountry.form.bannerInfo')}</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('sponsorCountry.form.selectCountry')} *
                      </label>
                      <Select
                        value={formData.country_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, country_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('sponsorCountry.form.chooseCountry')} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              <div className="flex items-center space-x-2">
                                {country.flag_url && (
                                  <img 
                                    src={country.flag_url} 
                                    alt={country.name}
                                    className="w-4 h-3"
                                  />
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('sponsorCountry.form.bannerImage')} *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {bannerImageUrl ? (
                          <div className="space-y-4">
                            <img 
                              src={bannerImageUrl} 
                              alt="Banner preview"
                              className="max-h-32 mx-auto rounded"
                            />
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setBannerImage(null);
                                  setBannerImageUrl('');
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              {t('sponsorCountry.form.uploadHint')}
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="banner-upload"
                            />
                            <label
                              htmlFor="banner-upload"
                              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              {t('sponsorCountry.form.chooseImage')}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('sponsorCountry.form.altText')}
                      </label>
                      <Input
                        value={formData.banner_alt_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, banner_alt_text: e.target.value }))}
                        placeholder={t('sponsorCountry.form.altTextPlaceholder')}
                      />
                    </div>
                  </div>


                  {/* Terms and Submit */}
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t('sponsorCountry.form.terms')}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="flex-1"
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-brand-blue hover:bg-brand-blue-dark"
                        disabled={submitting}
                      >
                        {submitting ? t('common.loading') : t('sponsorCountry.form.submitCta')}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ContactDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        amount={25}
        companyName={formData.company_name}
        countryName={selectedCountryName}
      />
      
      <Footer />
    </div>
  );
};
