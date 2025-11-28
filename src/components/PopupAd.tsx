import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type PopupAdProps = {
  intervalSeconds?: number;       // how often to show again
  imageUrl: string;               // ad image
  linkUrl?: string;               // where to go on click (optional)
  frequencyKey?: string;          // localStorage key to cap frequency per page
  firstDelaySeconds?: number;     // delay before the first show
  closeLabel?: string;
};

export default function PopupAd({
  intervalSeconds = 30,
  imageUrl,
  linkUrl,
  frequencyKey = "popup_ad_default",
  firstDelaySeconds = 5,
  closeLabel = "Close",
}: PopupAdProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Frequency cap: avoid opening more often than intervalSeconds
  const canOpen = () => {
    try {
      const last = localStorage.getItem(frequencyKey);
      if (!last) return true;
      const elapsed = (Date.now() - parseInt(last, 10)) / 1000;
      return elapsed >= intervalSeconds;
    } catch {
      return true;
    }
  };

  const schedule = (delaySec: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (canOpen()) setOpen(true);
      // reschedule next popup
      schedule(intervalSeconds);
    }, delaySec * 1000);
  };

  useEffect(() => {
    schedule(firstDelaySeconds);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(frequencyKey, String(Date.now()));
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl p-0 overflow-hidden w-full">
        <DialogTitle className="sr-only">Advertisement</DialogTitle>
        <div className="relative w-full bg-white rounded-lg overflow-hidden">
          {linkUrl ? (
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
              <img 
                src={imageUrl} 
                alt="Advertisement" 
                className="w-full h-auto block max-h-[60vh] sm:max-h-[70vh] object-contain" 
              />
            </a>
          ) : (
            <img 
              src={imageUrl} 
              alt="Advertisement" 
              className="w-full h-auto block max-h-[60vh] sm:max-h-[70vh] object-contain" 
            />
          )}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white text-xs sm:text-sm px-3 py-1.5 rounded-md shadow-lg z-10 transition-colors"
          >
            {closeLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}