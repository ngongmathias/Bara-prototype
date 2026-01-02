import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  listingId: string;
  title: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ listingId, title }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/marketplace/listing/${listingId}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'Email',
      icon: '✉️',
      url: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20listing:%20${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-comfortaa">Share Listing</DialogTitle>
          <DialogDescription className="font-roboto">
            Share this listing with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
              Copy Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-roboto"
              />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
              Share via
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link.color} text-white px-4 py-3 rounded-md text-center font-roboto text-sm font-medium transition-colors`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
