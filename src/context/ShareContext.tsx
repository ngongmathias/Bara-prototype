import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { ShareDialog } from '@/components/ShareDialog';

export interface ShareItem {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface ShareContextValue {
  openShare: (item: ShareItem) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export const ShareProvider = ({ children }: { children: ReactNode }) => {
  const [item, setItem] = useState<ShareItem | null>(null);
  const [open, setOpen] = useState(false);

  const openShare = useCallback((i: ShareItem) => {
    setItem(i);
    setOpen(true);
  }, []);

  return (
    <ShareContext.Provider value={{ openShare }}>
      {children}
      {item && (
        <ShareDialog
          open={open}
          onClose={() => setOpen(false)}
          url={item.url}
          title={item.title}
          description={item.description}
          imageUrl={item.imageUrl}
        />
      )}
    </ShareContext.Provider>
  );
};

export const useShare = () => {
  const ctx = useContext(ShareContext);
  if (!ctx) {
    // Graceful fallback: caller may not be wrapped in provider yet
    return {
      openShare: (i: ShareItem) => {
        if (navigator.share) {
          navigator.share({ title: i.title, text: i.description, url: i.url }).catch(() => {});
        } else {
          navigator.clipboard.writeText(i.url).catch(() => {});
        }
      },
    };
  }
  return ctx;
};
