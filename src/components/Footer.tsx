import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/scrollToTop';
import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  wikipedia_url: string | null;
  description: string | null;
  population: number | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
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
          setCountries(data);
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
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          
          {/* About Column - Full width on mobile, 2 columns on larger screens */}
          <div className="lg:col-span-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-[#70905a] font-comfortaa">
              {t('footer.about')}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/about" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact-us" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.contactUs')}
                </Link>
              </li>
              {/* <li>
                <Link to="/advertise" className="text-gray-700 hover:text-black transition-colors font-roboto">
                  {t('footer.advertiseWithUs')}
                </Link>
              </li> 
              <li>
                <Link to="/blog" className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.corporateBlog')}
                </Link>
              </li>*/}
              <li>
                <Link to="/advertise" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.advertisingChoices')}
                </Link>
              </li>
              <li>
                <Link to="/sponsor-country" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.sponsorCountryPage')}
                </Link>
              </li>
              <li>
                <Link to="/claim-listing" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.ClaimYourListing')}
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/ask-question" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  {t('footer.askBara')}
                </Link>
              </li>
              <li>
                <Link to="/tools" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  Bara Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* BARA Global Column - Collapsible for long list */}
          <div className="lg:col-span-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-[#70905a] font-comfortaa">
              BARA Global
            </h3>
            {isLoading ? (
              <div className="text-gray-500 text-sm">{t('footer.loadingCountries')}</div>
            ) : countries.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                  {(showAllCountries ? countries : countries.slice(0, 12)).map((country) => (
                    <div key={country.id} className="truncate">
                      <Link 
                        to={`/countries/${country.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={scrollToTop}
                        className="text-gray-700 hover:text-black transition-colors flex items-center font-roboto text-sm sm:text-base"
                        title={country.name}
                      >
                        <span className="truncate">{country.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
                {countries.length > 12 && (
                  <button
                    onClick={() => setShowAllCountries(!showAllCountries)}
                    className="mt-4 text-sm font-medium text-gray-700 hover:text-black transition-colors flex items-center gap-1"
                  >
                    {showAllCountries ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show All {countries.length} Locations <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">{t('footer.noCountriesFound')}</div>
            )}
          </div>

          {/* BARA Communities Column - Full width on mobile, 2 columns on larger screens */}
          <div className="lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-[#70905a] font-comfortaa">
              BARA Communities
            </h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div>
                <Link to="/communities/benincredible-benin" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  BeninCredible Benin
                </Link>
              </div>
              <div>
                <Link to="/communities/egyptional-egypt" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  EgypTional Egypt
                </Link>
              </div>
              <div>
                <Link to="/communities/ethutopia-ethiopia" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  Ethutopia Ethiopia
                </Link>
              </div>
              <div>
                <Link to="/communities/gambion-gambia" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  GambiOn Gambia
                </Link>
              </div>
              <div>
                <Link to="/communities/ghananion-ghana" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  GhaNation Ghana
                </Link>
              </div>
              <div>
                <Link to="/communities/kensential-kenya" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  KenSayTioNal Kenya
                </Link>
              </div>
              <div>
                <Link to="/communities/nigeriayeah-nigeria" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  NiaJaYeah Nigeria
                </Link>
              </div>
              <div>
                <Link to="/communities/rwandaful-rwanda" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  Rwandaful Rwanda
                </Link>
              </div>
              <div>
                <Link to="/communities/senegalastic-senegal" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  SenegalAstic Senegal
                </Link>
              </div>
              <div>
                <Link to="/communities/south-african-south-africa" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  SaffaCan South Africa
                </Link>
              </div>
              <div>
                <Link to="/communities/spotswana-botswana" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  Spotswana Botswana
                </Link>
              </div>
              <div>
                <Link to="/communities/tanzaniya-tanzania" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  TanzaCulAr Tanzania
                </Link>
              </div>
              <div>
                <Link to="/communities/ugandalous-uganda" onClick={scrollToTop} className="text-gray-700 hover:text-black transition-colors font-roboto text-sm sm:text-base">
                  UgandaLous Uganda
                </Link>
              </div>
            </div>
          </div>


        </div>

        {/* Copyright Information */}
        <div className="border-t border-gray-300 pt-3 sm:pt-4 md:pt-6">
          <div className="text-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-2">
            <p className="font-roboto">{t('footer.copyright')}</p>
            <p className="font-roboto">{t('footer.trademark')}</p>
            <p className="font-roboto">{t('footer.otherMarks')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;