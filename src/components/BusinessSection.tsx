import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MapPin, Link as LinkIcon, UserIcon, UserRound, User } from "lucide-react";
import { Link } from 'react-router-dom'
import { toast } from "sonner";

export const BusinessSection = () => {
  const { t } = useTranslation();

  const handleClaimListing = () => {
    // Navigate to the claim listing page
    window.location.href = '/claim-listing';
  };

  return (
    <section className="py-6 sm:py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative order-2 md:order-1">
            <div className="bg-white rounded-full w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto flex items-center justify-center overflow-hidden shadow-sm">
              <div className="w-32 h-32 sm:w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-[#4285F4] rounded-full flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-[#FBBC05] rounded-full mx-auto mb-2 sm:mb-3 md:mb-4 flex items-center justify-center relative">
                      <User className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#202124] absolute left-4" />
                      <UserRound className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#202124] absolute right-4" />
                    </div>
                    <p className="font-roboto text-[#202124] font-medium text-xs sm:text-sm md:text-base">{t('business.owners')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            {/* <div className="absolute top-2 sm:top-4 md:top-8 left-2 sm:left-4 md:left-8">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yp-blue" />
            </div> */}
            {/* <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 right-2 sm:right-4 md:right-8">
              <div className="w-3 h-3 sm:w-4 h-4 md:w-6 md:h-6 bg-yp-green rounded-full"></div>
            </div> */}
          </div>

          {/* Right Side - Content */}
          <div className="order-1 md:order-2 text-center md:text-left bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-comfortaa font-bold text-[#202124] mb-3 sm:mb-4 md:mb-6 leading-tight">
              {t('business.manageListing.title')}
            </h2>
            
            <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10">
              <p className="text-sm sm:text-base md:text-lg font-roboto text-[#202124] leading-relaxed">
                {t('business.manageListing.step1')}
              </p>
              <p className="text-sm sm:text-base md:text-lg font-roboto text-[#202124] leading-relaxed">
                {t('business.manageListing.step2')}
              </p>
              <p className="text-sm sm:text-base md:text-lg font-roboto text-[#202124] leading-relaxed">
                <span className="font-bold text-[#4285F4]">{t('business.manageListing.new')}</span> {t('business.manageListing.jobPosting')}
              </p>
              <p className="text-sm sm:text-base md:text-lg font-roboto text-[#202124] leading-relaxed">
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Button 
                onClick={handleClaimListing}
                className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium py-3 px-6 sm:py-3.5 sm:px-8 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {t('business.claimListing')}
              </Button>
              
              <p className="text-xs sm:text-sm md:text-sm font-roboto text-[#666]">
                {t('business.orCall')}{" "}
                <a 
                  href="tel:18667940889" 
                  className="text-[#4285F4] hover:underline font-medium"
                >
                  (+250) 791 568 519
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};