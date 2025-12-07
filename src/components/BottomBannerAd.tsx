import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface BottomBannerAdProps {
  className?: string;
}

interface SponsoredBannerRow {
  id: string;
  banner_image_url: string;
  banner_alt_text: string | null;
  company_website: string | null;
  company_name?: string;
}

let bottomBannerAdInstanceCounter = 0;

export const BottomBannerAd: React.FC<BottomBannerAdProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<SponsoredBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const instanceIndexRef = useRef<number>(bottomBannerAdInstanceCounter++ % 2);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  
  const ensureProtocol = (url: string | null | undefined) => {
    if (!url || url.trim() === '') return null;
    
    // Clean the URL
    const cleanUrl = url.trim();
    
    try {
      // If URL constructor succeeds, protocol is present and other details are also present
      const u = new URL(cleanUrl);
      return u.toString();
    } catch {
      // Prepend https if missing protocol
      const urlWithProtocol = `https://${cleanUrl.replace(/^\/+/, '')}`;
      try {
        // Validate the constructed URL
        new URL(urlWithProtocol);
        return urlWithProtocol;
      } catch {
        console.warn('Invalid URL provided:', cleanUrl);
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchLatestActive = async () => {
      setLoading(true);
      try {
        // 1) Primary: only active banners with display_on_bottom = true
        let { data, error }: any = await supabase
          .from('sponsored_banners')
          .select('*')
          .eq('is_active', true)
          .eq('display_on_bottom', true)
          .order('created_at', { ascending: false })
          .limit(10); // Increased limit for slideshow

        // 2) If none or schema issues, try approved status
        if ((error && error.code === 'PGRST204') || !data || data.length === 0) {
          const res1 = await supabase
            .from('sponsored_banners')
            .select('*')
            .eq('status', 'approved')
            .eq('display_on_bottom', true)
            .order('created_at', { ascending: false })
            .limit(10);
          data = res1.data;
          error = res1.error;
        }

        // 3) If still none, try paid banners
        if ((!data || data.length === 0) && !error) {
          const res2 = await supabase
            .from('sponsored_banners')
            .select('*')
            .eq('payment_status', 'paid')
            .eq('display_on_bottom', true)
            .order('created_at', { ascending: false })
            .limit(10);
          data = res2.data;
          error = res2.error;
        }

        if (error) throw error;

        const rows: SponsoredBannerRow[] = (data || []).map((b: any) => ({
          id: b.id,
          banner_image_url: b.banner_image_url,
          banner_alt_text: b.banner_alt_text || null,
          company_website: b.company_website || null,
          company_name: b.company_name || null,
        }))
        .filter((b: SponsoredBannerRow) => !!b.banner_image_url);
        setBanners(rows);
      } catch (err) {
        console.error('Error fetching bottom banners for BottomBannerAd:', err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestActive();
  }, []);

  // Slideshow effect
  useEffect(() => {
    if (banners.length <= 1) return;

    const startSlideshow = () => {
      if (isPaused) return;
      
      setProgress(0);
      
      // Progress bar animation
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + (100 / 250); // 5 seconds = 5000ms, update every 20ms
        });
      }, 20);

      intervalRef.current = setInterval(() => {
        if (isPaused) return;
        
        setIsTransitioning(true);
        
        setTimeout(() => {
          setCurrentBannerIndex((prevIndex) => 
            (prevIndex + 1) % banners.length
          );
          setIsTransitioning(false);
          setProgress(0);
        }, 300); // Half of transition duration
      }, 5000); // Change every 5 seconds
    };

    startSlideshow();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    };
  }, [banners.length, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    };
  }, []);

  const bannerToShow = useMemo(() => {
    if (banners.length === 0) return null;
    if (banners.length === 1) return banners[0];
    return banners[currentBannerIndex];
  }, [banners, currentBannerIndex]);

  // Track banner click
  const handleBannerClick = (bannerId: string, event: React.MouseEvent) => {
    console.log('Bottom banner clicked:', bannerId);
    // Track click analytics
    trackBannerClick(bannerId);
  };

  const trackBannerClick = async (bannerId: string) => {
    try {
      await supabase
        .from('sponsored_banner_analytics')
        .insert({
          banner_id: bannerId,
          event_type: 'click',
          user_agent: navigator.userAgent,
        });
    } catch (error) {
      console.error('Error tracking bottom banner click:', error);
    }
  };

  const targetUrl = ensureProtocol(bannerToShow?.company_website || null);
  
  // Debug: Log the target URL to help troubleshoot
  useEffect(() => {
    if (bannerToShow && targetUrl) {
      console.log('Bottom Banner URL Debug:', {
        bannerId: bannerToShow.id,
        companyName: bannerToShow.company_name,
        originalUrl: bannerToShow.company_website,
        processedUrl: targetUrl
      });
    }
  }, [bannerToShow, targetUrl]);

  const sponsorHost = useMemo(() => {
    if (!targetUrl) return null;
    try {
      const u = new URL(targetUrl);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }, [targetUrl]);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!bannerToShow) {
    return null; // Don't render anything if no banner
  }

  return (
    <div 
      className={`w-full bg-gradient-to-r from-purple-50 to-pink-100 border-t border-gray-200 py-4 flex justify-center ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full max-w-[728px] px-4">
        {/* Centered banner image - 728x90 leaderboard */}
        <div className="w-full relative">
            {bannerToShow ? (
              targetUrl ? (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
                  aria-label={`Visit ${bannerToShow.company_name} - ${bannerToShow.banner_alt_text || t('bannerAd.placeholder.title')}`}
                  onClick={(e) => {
                    console.log('Bottom banner clicked, navigating to:', targetUrl);
                    bannerToShow?.id && handleBannerClick(bannerToShow.id, e);
                  }}
                >
                  <div 
                    className={`transition-all duration-600 ease-in-out ${
                      isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                  >
                    <img
                      src={bannerToShow.banner_image_url}
                      alt={bannerToShow.banner_alt_text || t('bannerAd.placeholder.title')}
                      className="w-full h-[90px] object-cover bg-gradient-to-r from-purple-50 to-pink-50"
                    />
                  </div>
                </a>
              ) : (
                <div className="overflow-hidden rounded-lg">
                  <div 
                    className={`transition-all duration-600 ease-in-out ${
                      isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                  >
                    <img
                      src={bannerToShow.banner_image_url}
                      alt={bannerToShow.banner_alt_text || t('bannerAd.placeholder.title')}
                      className="w-full h-[90px] object-cover bg-gradient-to-r from-purple-50 to-pink-50"
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-[120px] md:h-[150px] bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg flex items-center justify-center text-center px-4">
                <div>
                  <span className="text-gray-700 font-semibold text-lg">{t('bannerAd.placeholder.title')}</span>
                  <span className="block text-gray-600 text-sm mt-2">{t('bannerAd.placeholder.subtitle')}</span>
                </div>
              </div>
            )}
            
            {/* Slide indicators and progress bar */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                {/* Progress bar */}
                <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Slide indicators */}
                <div className="flex gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentBannerIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      onClick={() => {
                        setCurrentBannerIndex(index);
                        setIsTransitioning(true);
                        setProgress(0);
                        setTimeout(() => setIsTransitioning(false), 300);
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
