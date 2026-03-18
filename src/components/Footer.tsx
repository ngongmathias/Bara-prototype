import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/scrollToTop';
import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase';
import { slugFromName } from '@/lib/locationSlug';
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  code: string;
  slug?: string;
  flag_url: string | null;
  wikipedia_url: string | null;
  description: string | null;
  population: number | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
}

function countryToSlug(c: Country): string {
  return c.slug ?? slugFromName(c.name);
}

const Footer = () => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await db.countries()
          .select(`
            id,
            name,
            code,
            flag_url,
            wikipedia_url,
            description,
            population,
            capital,
            currency,
            language
          `)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching countries:', error);
          toast({
            title: 'Error',
            description: 'Failed to load countries. Please try again.',
            variant: "destructive"
          });
        } else if (data) {
          const withSlug = (data as Country[]).map(c => ({
            ...c,
            slug: c.slug ?? slugFromName(c.name),
          }));
          const { data: gaData } = await db.global_africa()
            .select('id, name, code')
            .eq('is_active', true)
            .order('display_order', { ascending: true });
          const communities: Country[] = (gaData || []).map((ga: { id: string; name: string; code: string | null }) => ({
            id: ga.id,
            name: ga.name,
            code: ga.code || 'GA',
            slug: slugFromName(ga.name),
            flag_url: null,
            wikipedia_url: null,
            description: null,
            population: null,
            capital: null,
            currency: null,
            language: null,
          }));
          setCountries([...withSlug, ...communities]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load countries. Please try again.',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [toast]);

  return (
    <footer className="relative z-10 bg-white text-gray-900 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Amazon-style organized grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 mb-8">

          {/* Column 1: About BARA */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-[#70905a] font-comfortaa uppercase tracking-wide">
              About BARA
            </h3>
            <ul className="space-y-2">
              <li><Link to="/advertise" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Advertise With Us</Link></li>
              <li><Link to="/about" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact-us" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.contactUs')}</Link></li>
              <li><Link to="/blog" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.corporateBlog')}</Link></li>
              <li><Link to="/faq" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.faq')}</Link></li>
              <li><Link to="/ask-question" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.askBara')}</Link></li>
              <li><Link to="/partners" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.partners')}</Link></li>
            </ul>
          </div>

          {/* Column 2: Mini-Apps */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-[#70905a] font-comfortaa uppercase tracking-wide">
              Mini-Apps
            </h3>
            <ul className="space-y-2">
              <li><Link to="/countries" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Global</Link></li>
              <li><Link to="/events" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Events</Link></li>
              <li><Link to="/streams" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Streams</Link></li>
              <li><Link to="/listings" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Listings</Link></li>
              <li><Link to="/marketplace" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Marketplace</Link></li>
              <li><Link to="/sports" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Sports</Link></li>
              <li><Link to="/blog" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Blog</Link></li>
              <li><Link to="/communities" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Communities</Link></li>
              <li><Link to="/tools" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">BARA Tools</Link></li>
            </ul>
          </div>

          {/* Column 3: Business & Advertising */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-[#70905a] font-comfortaa uppercase tracking-wide">
              Business
            </h3>
            <ul className="space-y-2">
              <li><Link to="/advertise" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Advertise With Us</Link></li>
              <li><Link to="/claim-listing" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.ClaimYourListing')}</Link></li>
              <li><Link to="/sponsor-country" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.sponsorCountryPage')}</Link></li>
              <li><Link to="/pricing" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.pricing')}</Link></li>
              <li><Link to="/store" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">{t('footer.coinStore')}</Link></li>
            </ul>
          </div>

          {/* Column 4: BARA Communities */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-[#70905a] font-comfortaa uppercase tracking-wide">
              Communities
            </h3>
            <ul className="space-y-2">
              <li><Link to="/communities/rwandaful-rwanda" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Rwandaful Rwanda</Link></li>
              <li><Link to="/communities/kensential-kenya" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">KenSayTioNal Kenya</Link></li>
              <li><Link to="/communities/nigeriayeah-nigeria" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">NiaJaYeah Nigeria</Link></li>
              <li><Link to="/communities/ghananion-ghana" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">GhaNation Ghana</Link></li>
              <li><Link to="/communities/south-african-south-africa" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">SaffaCan South Africa</Link></li>
              <li><Link to="/communities/ethutopia-ethiopia" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Ethutopia Ethiopia</Link></li>
              <li><Link to="/communities/tanzaniya-tanzania" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">TanzaCulAr Tanzania</Link></li>
              <li><Link to="/communities/ugandalous-uganda" onClick={scrollToTop} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">UgandaLous Uganda</Link></li>
            </ul>
          </div>

          {/* Column 5-6: BARA Global Countries */}
          <div className="col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-[#70905a] font-comfortaa uppercase tracking-wide">
              BARA Global
            </h3>
            {isLoading ? (
              <div className="text-gray-500 text-sm">{t('footer.loadingCountries')}</div>
            ) : countries.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">
                  {(showAllCountries ? countries : countries.slice(0, 16)).map((country) => (
                    <div key={country.id} className="truncate">
                      <Link
                        to={`/countries/${countryToSlug(country)}`}
                        onClick={scrollToTop}
                        className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                        title={country.name}
                      >
                        <span className="truncate">{country.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
                {countries.length > 16 && (
                  <button
                    onClick={() => setShowAllCountries(!showAllCountries)}
                    className="mt-3 text-sm font-medium text-[#70905a] hover:text-[#5a7a48] transition-colors flex items-center gap-1"
                  >
                    {showAllCountries ? (
                      <>
                        {t('footer.showLess')} <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        {t('footer.showAllLocations', { count: countries.length })} <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">{t('footer.noCountriesFound')}</div>
            )}
          </div>

        </div>

        {/* Bottom Bar — Legal Links & Copyright */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link to="/terms" onClick={scrollToTop} className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <span className="text-gray-300">|</span>
              <Link to="/privacy" onClick={scrollToTop} className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <span className="text-gray-300">|</span>
              <Link to="/advertise" onClick={scrollToTop} className="hover:text-gray-900 transition-colors">{t('footer.advertisingChoices')}</Link>
            </div>
            <div className="text-center sm:text-right text-xs text-gray-400 space-y-0.5">
              <p className="font-roboto">{t('footer.copyright')}</p>
              <p className="font-roboto">{t('footer.trademark')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
