import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { useUser } from '@clerk/clerk-react';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  Settings, 
  Shield, 
  Mail, 
  Phone, 
  Building, 
  Star,
  CheckCircle,
  AlertCircle,
  Image,
  ShoppingBag,
  Plus,
  Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const UserDashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const location = useLocation();

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/user/sign-in" replace />;
  }

  const isActive = (path: string) => {
    if (path === '/users/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TopBannerAd />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User'} 
                        className="h-12 w-12 rounded-full object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {user?.fullName || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Email Verified</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <nav className="space-y-2">
                  <Link to="/users/dashboard">
                    <Button 
                      variant={isActive('/users/dashboard') ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/users/dashboard/events">
                    <Button 
                      variant={isActive('/users/dashboard/events') ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                    >
                      <Calendar className="mr-3 h-4 w-4" />
                      My Events
                    </Button>
                  </Link>
                  
                  <Link to="/users/dashboard/listings">
                    <Button 
                      variant={isActive('/users/dashboard/listings') ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <Building className="mr-3 h-4 w-4" />
                      My Listings
                    </Button>
                  </Link>
                  
                  <Link to="/marketplace/my-listings">
                    <Button 
                      variant={isActive('/marketplace/my-listings') ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <ShoppingBag className="mr-3 h-4 w-4" />
                      My Marketplace Ads
                    </Button>
                  </Link>
                  
                  <Link to="/marketplace/post">
                    <Button 
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Plus className="mr-3 h-4 w-4" />
                      Post Marketplace Ad
                    </Button>
                  </Link>
                  
                  <Link to="/users/dashboard/banner-submissions">
                    <Button 
                      variant={isActive('/users/dashboard/banner-submissions') ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                    >
                      <Image className="mr-3 h-4 w-4" />
                      Banner Submissions
                    </Button>
                  </Link>
                  
                  <Link to="/users/dashboard/profile">
                    <Button 
                      variant={isActive('/users/dashboard/profile') ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                </nav>
              </CardContent>
            </Card>

            {/* Verification Status Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="mr-2 h-5 w-5 text-blue-600" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">User Credentials & Email</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Verified
                  </Badge>
                </div>
                
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Phone</span>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Business</span>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    Not Started
                  </Badge>
                </div> 
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Trusted Organizer</span>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    Not Started
                  </Badge>
                </div>
                
                */}

              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <Outlet />
          </div>
        </div>
      </div>
      <BottomBannerAd />
      <Footer />
    </div>
  );
};

// Dashboard Home Component
export const UserDashboardHome = () => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back, {user?.firstName || 'User'}!
          </CardTitle>
          <p className="text-gray-600">
            Manage your events and account settings from your dashboard.
          </p>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">0</h3>
                <p className="text-gray-600">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">0</h3>
                <p className="text-gray-600">Active Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">0</h3>
                <p className="text-gray-600">Event Attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/user/events">
              <Button className="w-full h-16 text-left justify-start">
                <Calendar className="mr-3 h-6 w-6" />
                <div>
                  <div className="font-medium">Create New Event</div>
                  <div className="text-sm opacity-75">Start organizing your event</div>
                </div>
              </Button>
            </Link>
            
            <Link to="/user/profile">
              <Button variant="outline" className="w-full h-16 text-left justify-start">
                <Settings className="mr-3 h-6 w-6" />
                <div>
                  <div className="font-medium">Update Profile</div>
                  <div className="text-sm opacity-75">Manage account settings</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <p className="text-gray-600">
            Complete these steps to maximize your event management experience.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-900">Email Verified</h4>
                <p className="text-sm text-green-700">Your email has been verified</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="font-medium text-gray-700">Verify Phone Number</h4>
                <p className="text-sm text-gray-600">Add your phone number for better account security</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Verify
              </Button>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="font-medium text-gray-700">Create Your First Event</h4>
                <p className="text-sm text-gray-600">Start by creating your first event to share with others</p>
              </div>
              <Link to="/user/events" className="ml-auto">
                <Button size="sm">Create Event</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};