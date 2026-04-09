import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Check, Link as LinkIcon, Mail, Share2 } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaTelegram, FaLinkedinIn } from 'react-icons/fa6';
import { useToast } from '@/components/ui/use-toast';

export interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  url: string;              // absolute URL to share
  title: string;            // headline
  description?: string;     // short blurb
  imageUrl?: string;        // for preview (only used by OG tags on server)
}

/**
 * Universal share dialog. Works across Bara: marketplace ads, songs,
 * movies, ebooks, events, blog posts, business listings, etc.
 *
 * Link previews (WhatsApp/Facebook/X image cards) are generated
 * server-side by the Vercel Edge middleware (see middleware.ts).
 */
export const ShareDialog = ({ open, onClose, url, title, description, imageUrl }: ShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title}${description ? ` — ${description}` : ''}`);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: <FaWhatsapp className="w-5 h-5" />,
      color: 'bg-[#25D366] hover:bg-[#1EBE57] text-white',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <FaFacebookF className="w-5 h-5" />,
      color: 'bg-[#1877F2] hover:bg-[#0E65D9] text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'x',
      label: 'X',
      icon: <FaXTwitter className="w-5 h-5" />,
      color: 'bg-black hover:bg-gray-900 text-white',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: <FaTelegram className="w-5 h-5" />,
      color: 'bg-[#26A5E4] hover:bg-[#1E8BC3] text-white',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: <FaLinkedinIn className="w-5 h-5" />,
      color: 'bg-[#0A66C2] hover:bg-[#084E96] text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      key: 'email',
      label: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-gray-700 hover:bg-gray-800 text-white',
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Paste it anywhere to share.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually', variant: 'destructive' });
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: description, url });
    } catch { /* user cancelled */ }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!(navigator as any).share;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[300] p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Share</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview card */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-16 h-16 rounded object-cover flex-shrink-0 bg-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate text-sm">{title}</div>
                  {description && (
                    <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">{description}</div>
                  )}
                  <div className="text-[10px] text-gray-400 truncate mt-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    {url}
                  </div>
                </div>
              </div>
            </div>

            {/* Channel grid */}
            <div className="px-5 py-4">
              <div className="grid grid-cols-3 gap-3">
                {channels.map((c) => (
                  <a
                    key={c.key}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${c.color}`}>
                      {c.icon}
                    </div>
                    <span className="text-xs text-gray-700 font-medium">{c.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Copy link row */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                <div className="flex-1 text-xs text-gray-700 truncate px-2">{url}</div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-black text-white'}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Native share fallback (mobile) */}
            {canNativeShare && (
              <div className="px-5 pb-5">
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  More sharing options…
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareDialog;
