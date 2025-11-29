import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import { fetchActivePopups, getRandomPopup, shouldShowPopup, markPopupClosed, PopupAd } from '@/lib/popupService';

interface FrontendPopupProps {
  intervalSeconds?: number;
  firstDelaySeconds?: number;
  closeLabel?: string;
}

export default function FrontendPopup({
  intervalSeconds = 15,
  firstDelaySeconds = 3,
  closeLabel = "Close"
}: FrontendPopupProps) {
  const [popups, setPopups] = useState<PopupAd[]>([]);
  const [currentPopup, setCurrentPopup] = useState<PopupAd | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Load popups from database
  const loadPopups = async () => {
    try {
      console.log('🔄 Loading popups for frontend...');
      const activePopups = await fetchActivePopups();
      setPopups(activePopups);
      console.log('✅ Popups loaded:', activePopups.length);
    } catch (error) {
      console.error('❌ Error loading popups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if we should show a popup
  const checkAndShowPopup = () => {
    if (popups.length === 0) {
      console.log('ℹ️ No popups available');
      return;
    }

    // Get a random popup
    const randomPopup = getRandomPopup(popups);
    if (!randomPopup) {
      console.log('ℹ️ No popup selected');
      return;
    }

    // Check if this popup should be shown based on user preferences
    if (!shouldShowPopup(randomPopup.id, intervalSeconds)) {
      console.log(`ℹ️ Popup ${randomPopup.id} was recently closed, skipping`);
      return;
    }

    console.log('🎯 Showing popup:', randomPopup.name);
    setCurrentPopup(randomPopup);
    setOpen(true);
  };

  // Schedule popup display
  const schedulePopup = (delaySeconds: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      checkAndShowPopup();
      
      // Schedule next popup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setInterval(() => {
        checkAndShowPopup();
      }, intervalSeconds * 1000);
      
    }, delaySeconds * 1000);
  };

  // Handle popup close
  const handleClose = () => {
    if (currentPopup) {
      markPopupClosed(currentPopup.id);
      console.log(`✅ Popup ${currentPopup.id} closed by user`);
    }
    setOpen(false);
    setCurrentPopup(null);
  };

  // Handle popup click (if it has a link)
  const handlePopupClick = () => {
    if (currentPopup?.link_url) {
      window.open(currentPopup.link_url, '_blank', 'noopener,noreferrer');
      console.log(`🔗 Popup clicked, opening: ${currentPopup.link_url}`);
    }
    handleClose();
  };

  // Initialize popups and start scheduling
  useEffect(() => {
    loadPopups();
  }, []);

  // Start popup scheduling when popups are loaded
  useEffect(() => {
    if (!loading && popups.length > 0) {
      console.log(`🚀 Starting popup scheduler with ${intervalSeconds}s interval`);
      schedulePopup(firstDelaySeconds);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, popups.length, intervalSeconds, firstDelaySeconds]);

  // Don't render anything if loading or no popups
  if (loading || popups.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogContent className="max-w-[85vw] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Advertisement</DialogTitle>
        <div className="relative bg-white rounded-lg shadow-2xl max-h-[50vh] overflow-hidden">
          {/* Popup Image */}
          <div 
            className="relative cursor-pointer"
            onClick={handlePopupClick}
          >
            <img 
              src={currentPopup?.image_url} 
              alt={currentPopup?.name || "Advertisement"} 
              className="w-full h-auto block rounded-t-lg max-h-[50vh] object-contain"
              onError={(e) => {
                console.error('❌ Popup image failed to load:', currentPopup?.image_url);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Overlay with link indicator if popup has a link */}
            {currentPopup?.link_url && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-2">
                  <ExternalLink className="w-6 h-6 text-gray-800" />
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            onClick={handleClose}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full border-0"
            size="sm"
          >
            <X className="w-3 h-3 mr-1" />
            {closeLabel}
          </Button>

          {/* Popup Info (optional) */}
          {currentPopup?.name && (
            <div className="p-3 bg-gray-50 rounded-b-lg">
              <p className="text-sm text-gray-700 font-medium">{currentPopup.name}</p>
              {currentPopup.link_url && (
                <p className="text-xs text-blue-600 mt-1">Click to visit</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

