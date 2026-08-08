import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  User,
  LogOut,
  Settings,
  Search
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminCommandPalette } from "./AdminCommandPalette";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      // Sign out from Clerk (this will clear the session)
      await signOut();
      
      // Clear any local storage or session data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      sessionStorage.clear();
      
      // Clear any cookies if they exist
      document.cookie.split(";").forEach(function(c) { 
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

  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path === "/admin/cities") return "Cities Management";
    if (path === "/admin/countries") return "Countries Management";
    if (path === "/admin/country-info") return "Country Information";
    if (path === "/admin/country-gallery") return "Country Gallery";
    if (path === "/admin/country-key-listings") return "Country Key Listings";
    if (path === "/admin/global-africa") return "Global Africa Management";
    if (path === "/admin/categories") return "Categories Management";
    if (path === "/admin/businesses") return "Businesses Management";
    if (path === "/admin/events") return "Events Management";
    if (path === "/admin/blog") return "Blog Management";
    if (path.startsWith("/admin/blog/")) return "Blog Editor";
    if (path === "/admin/sponsored-ads") return "Sponsored Ads Management";
    if (path === "/admin/reviews") return "Reviews Management";
    if (path === "/admin/marketplace") return "Marketplace Administration";
    if (path === "/admin/contact-messages") return "Contact Messages";
    if (path === "/admin/users") return "Users Management";
    if (path === "/admin/settings") return "Account Settings";
    if (path === "/admin/analytics") return "Analytics";
    if (path === "/admin/reports") return "Reports";
    if (path === "/admin/security") return "Security";
    if (path === "/admin/email-log") return "Email Log";
    return "Admin Panel";
  };

  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    return "Manage your BARA application";
  };

  return (
    <div className="h-full bg-gray-50 flex w-full">
      {/* ⌘K from anywhere in the console. Mounted here rather than per-page so
          every admin route gets it. */}
      <AdminCommandPalette />

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="bg-white shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-comfortaa font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-600 font-roboto mt-1">
                {getPageSubtitle()}
              </p>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Discoverability for ⌘K — a shortcut nobody knows about isn't a
                  feature. Clickable too, so it works without the keyboard. */}
              <button
                onClick={() => document.dispatchEvent(
                  new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
                )}
                className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                aria-label="Search admin pages"
              >
                <Search className="w-4 h-4" />
                <span>Search pages</span>
                <kbd className="ml-1 text-[10px] font-sans font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>

              {/* User menu */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-yp-blue to-yp-green rounded-full flex items-center justify-center">
                    {user?.imageUrl ? (
                      <img 
                        loading="lazy" src={user.imageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="hidden md:block font-roboto text-gray-700">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Admin User'
                    }
                  </span>
                </Button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => navigate('/admin/settings')}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 font-roboto transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 font-roboto transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-gray-50">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 