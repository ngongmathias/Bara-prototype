import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useClerk } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  MapPin,
  Globe,
  Building2,
  MessageSquare,
  Users,
  Settings,
  Menu,
  X,
  BarChart3,
  FileText,
  Shield,
  LogOut,
  Megaphone,
  FolderOpen,
  Image,
  Mail,
  Info,
  Calendar,
  BookOpen,
  Music,
  Trophy,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const adminMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    description: "Overview and analytics"
  },
  {
    title: "Cities",
    icon: MapPin,
    path: "/admin/cities",
    description: "Manage cities"
  },
  {
    title: "Countries",
    icon: Globe,
    path: "/admin/countries",
    description: "Manage countries"
  },
  {
    title: "Country Info",
    icon: Info,
    path: "/admin/country-info",
    description: "Manage country information"
  },
  {
    title: "Categories",
    icon: FolderOpen,
    path: "/admin/categories",
    description: "Manage business categories"
  },
  {
    title: "Businesses",
    icon: Building2,
    path: "/admin/businesses",
    description: "Manage business listings"
  },
  {
    title: "Events",
    icon: Calendar,
    path: "/admin/events",
    description: "Manage events and event details"
  },
  {
    title: "Blog",
    icon: BookOpen,
    path: "/admin/blog",
    description: "Manage blog posts and content"
  },
  {
    title: "Sponsored Ads",
    icon: Megaphone,
    path: "/admin/sponsored-ads",
    description: "Manage advertising campaigns"
  },
  {
    title: "Reviews",
    icon: MessageSquare,
    path: "/admin/reviews",
    description: "View and moderate reviews"
  },
  {
    title: "Marketplace",
    icon: Building2,
    path: "/admin/marketplace",
    description: "Moderate marketplace listings"
  },
  {
    title: "Marketplace Categories",
    icon: FolderOpen,
    path: "/admin/marketplace-categories",
    description: "Manage marketplace categories"
  },
  {
    title: "Contact Messages",
    icon: Mail,
    path: "/admin/contact-messages",
    description: "Manage customer inquiries"
  },
  {
    title: "Sponsored Banners",
    icon: Megaphone,
    path: "/admin/sponsored-banners",
    description: "Manage country page banners"
  },
  {
    title: "Slideshow Images",
    icon: Image,
    path: "/admin/slideshow-images",
    description: "Manage homepage slideshow images"
  },
  {
    title: "Events Background",
    icon: Image,
    path: "/admin/events-slideshow",
    description: "Manage Events page background slideshow"
  },

  {
    title: "Popups",
    icon: Image,
    path: "/admin/popups",
    description: "Manage popup notifications and ads"
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
    description: "Manage user accounts"
  },
  {
    title: "Streams",
    icon: Music,
    path: "/admin/streams",
    description: "Manage music content & artists"
  },
  {
    title: "Sports",
    icon: Trophy,
    path: "/admin/sports",
    description: "Manage leagues & matches"
  },
  {
    title: "Sports News",
    icon: FileText,
    path: "/admin/sports/news",
    description: "Manage sports articles"
  },
  {
    title: "Sports Videos",
    icon: Video,
    path: "/admin/sports/videos",
    description: "Manage sports highlights"
  },
  {
    title: "Admin Management",
    icon: Shield,
    path: "/admin/admin-management",
    description: "Manage admin users (Super Admin only)"
  },
  {
    title: "RSS Feeds",
    icon: FileText,
    path: "/admin/rss-feeds",
    description: "Manage news sources and feeds"
  },
  {
    title: "Economy & Points",
    icon: BarChart3,
    path: "/admin/gamification",
    description: "Manage points, rewards, and economy"
  },
  {
    title: "Reports & Exports",
    icon: FileText,
    path: "/admin/reports",
    description: "Generate and export data reports"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
    description: "Account settings and preferences"
  }
];

export const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      // Sign out from Clerk (this will clear the session)
      await signOut();

      // Clear any local storage or session data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      sessionStorage.clear();

      // Clear any cookies if they exist
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to homepage
      navigate('/');

      // Force a page reload to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to sign out and redirect
      try {
        await signOut();
      } catch (signOutError) {
        console.error('Sign out error:', signOutError);
      }
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-black">
            <span className="text-xl font-comfortaa font-bold text-white tracking-tight">Admin<span className="text-yp-yellow">Panel</span></span>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                    isActive
                      ? "bg-yp-yellow text-black font-semibold shadow-md"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-black" : "text-gray-500 group-hover:text-white"
                  )} />
                  <span className="font-roboto">{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile / Logout Section */}
          <div className="p-4 border-t border-gray-800 bg-black">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center justify-start space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-roboto">Exit to App</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};