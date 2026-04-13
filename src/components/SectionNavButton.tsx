import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, ShoppingBag } from 'lucide-react';

interface SectionNavButtonProps {
  section: 'events' | 'streams-music' | 'streams-movies' | 'streams-ebooks' | 'blog' | 'blog-liked' | 'marketplace';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const SectionNavButton: React.FC<SectionNavButtonProps> = ({ 
  section, 
  variant = 'outline',
  className = '' 
}) => {
  const navigate = useNavigate();

  const config = {
    'events': {
      label: 'My Liked Events',
      icon: Heart,
      path: '/users/dashboard/saved?tab=events',
    },
    'streams-music': {
      label: 'My Liked Songs',
      icon: Heart,
      path: '/users/dashboard/saved?tab=songs',
    },
    'streams-movies': {
      label: 'My Watchlist',
      icon: Heart,
      path: '/users/dashboard/saved?tab=movies',
    },
    'streams-ebooks': {
      label: 'My Library',
      icon: Bookmark,
      path: '/users/dashboard/saved?tab=ebooks',
    },
    'blog': {
      label: 'My Saved Articles',
      icon: Bookmark,
      path: '/users/dashboard/saved?tab=articles',
    },
    'blog-liked': {
      label: 'My Liked Articles',
      icon: Heart,
      path: '/users/dashboard/saved?tab=likedArticles',
    },
    'marketplace': {
      label: 'My Favorites',
      icon: Heart,
      path: '/marketplace/favorites',
    },
  };

  const { label, icon: Icon, path } = config[section];

  return (
    <Button
      variant={variant}
      onClick={() => navigate(path)}
      className={`gap-2 ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
};
