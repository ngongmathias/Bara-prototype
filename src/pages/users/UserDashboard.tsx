import React, { useEffect, useState } from 'react';

import { Header } from '@/components/Header';

import Footer from '@/components/Footer';

import { TopBannerAd } from '@/components/TopBannerAd';

import { BottomBannerAd } from '@/components/BottomBannerAd';

import { useUser, useClerk } from '@clerk/clerk-react';

import { Navigate, Link, Outlet, useLocation } from 'react-router-dom';

import { supabase } from '@/lib/supabase';

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

  Heart,

  Ticket,

  BarChart,

  Zap,

  Gift,

  Trophy,

  Palette

} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';

import { GamificationService, UserMission } from '@/lib/gamificationService';



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



                  <Link to="/users/dashboard/tickets">

                    <Button

                      variant={isActive('/users/dashboard/tickets') ? 'default' : 'ghost'}

                      className="w-full justify-start"

                    >

                      <Ticket className="mr-3 h-4 w-4" />

                      My Tickets

                    </Button>

                  </Link>



                  <Link to="/listings">

                    <Button

                      variant={isActive('/listings') ? 'default' : 'ghost'}

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



                  <Link to="/users/dashboard/analytics">

                    <Button

                      variant={isActive('/users/dashboard/analytics') ? 'default' : 'ghost'}

                      className="w-full justify-start"

                    >

                      <BarChart className="mr-3 h-4 w-4" />

                      View Analytics

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



                  <Link to="/users/dashboard/themes">

                    <Button

                      variant={isActive('/users/dashboard/themes') ? 'default' : 'ghost'}

                      className="w-full justify-start"

                    >

                      <Palette className="mr-3 h-4 w-4" />

                      Coin Shop

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



            {/* Premium Upsell Card */}

            <Card className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">

              <CardContent className="p-5">

                <div className="flex items-center gap-2 mb-2">

                  <Star className="h-5 w-5 text-yellow-600" />

                  <h3 className="font-bold text-gray-900 text-sm">Upgrade to Pro</h3>

                </div>

                <p className="text-xs text-gray-600 mb-3">

                  No ads, unlimited listings, analytics, and 100 bonus Bara Coins every month.

                </p>

                <Link to="/pricing">

                  <Button size="sm" className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold">

                    View Plans — from $5/mo

                  </Button>

                </Link>

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



export const UserDashboardHome = () => {

  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const [stats, setStats] = useState({ totalEvents: 0, activeEvents: 0, totalAttendees: 0 });

  const [statsLoading, setStatsLoading] = useState(true);

  const [missions, setMissions] = useState<UserMission[]>([]);

  const [missionsLoading, setMissionsLoading] = useState(true);



  useEffect(() => {

    const initMissions = async () => {

      if (!user?.id) return;

      try {

        // Trigger daily streak check + daily_login mission on dashboard visit
        await GamificationService.checkDailyStreak(user.id);

        const data = await GamificationService.getMissions(user.id);

        setMissions(data);

      } catch (error) {

        console.error('Error fetching missions:', error);

      } finally {

        setMissionsLoading(false);

      }

    };

    initMissions();

  }, [user]);



  useEffect(() => {

    const fetchStats = async () => {

      if (!user?.id) return;

      try {

        const email = user.primaryEmailAddress?.emailAddress || '';



        // Fetch user's events

        const { data: events } = await supabase

          .from('events')

          .select('id, start_date, end_date')

          .or(`organizer_email.eq.${email},clerk_user_id.eq.${user.id}`);



        const now = new Date();

        const total = events?.length || 0;

        const active = events?.filter(e => new Date(e.end_date || e.start_date) >= now).length || 0;



        // Fetch attendee count for user's events

        let attendees = 0;

        if (events && events.length > 0) {

          const eventIds = events.map(e => e.id);

          const { count } = await supabase

            .from('event_registrations')

            .select('*', { count: 'exact', head: true })

            .in('event_id', eventIds);

          attendees = count || 0;

        }



        setStats({ totalEvents: total, activeEvents: active, totalAttendees: attendees });

      } catch (error) {

        console.error('Error fetching dashboard stats:', error);

      } finally {

        setStatsLoading(false);

      }

    };

    fetchStats();

  }, [user]);



  const dailyMissions = missions.filter(m => m.type === 'daily');



  return (

    <div className="space-y-6">

      <Card>

        <CardHeader>

          <CardTitle className="text-2xl">Welcome back, {user?.firstName || 'User'}!</CardTitle>

          <p className="text-gray-600">Manage your events and account settings from your dashboard.</p>

        </CardHeader>

      </Card>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card>

          <CardContent className="p-6">

            <div className="flex items-center">

              <Calendar className="h-8 w-8 text-blue-600" />

              <div className="ml-4">

                <h3 className="text-lg font-semibold">{statsLoading ? '\u2014' : stats.totalEvents}</h3>

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

                <h3 className="text-lg font-semibold">{statsLoading ? '\u2014' : stats.activeEvents}</h3>

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

                <h3 className="text-lg font-semibold">{statsLoading ? '\u2014' : stats.totalAttendees}</h3>

                <p className="text-gray-600">Event Attendees</p>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>



      <Card>

        <CardHeader className="pb-3">

          <div className="flex items-center justify-between">

            <CardTitle className="flex items-center gap-2">

              <Zap className="h-5 w-5 text-yellow-500" />

              Daily Missions

            </CardTitle>

            {!missionsLoading && dailyMissions.length > 0 && (

              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">

                <Trophy className="w-3 h-3 mr-1" />

                {dailyMissions.filter(m => m.is_completed).length}/{dailyMissions.length}

              </Badge>

            )}

          </div>

        </CardHeader>

        <CardContent>

          {missionsLoading ? (

            <div className="space-y-3">

              {[1, 2, 3].map(i => (

                <div key={i} className="animate-pulse">

                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />

                  <div className="h-2 bg-gray-100 rounded w-full" />

                </div>

              ))}

            </div>

          ) : dailyMissions.length === 0 ? (

            <p className="text-sm text-gray-500 text-center py-4">No missions available today. Check back soon!</p>

          ) : (

            <div className="space-y-4">

              {dailyMissions.slice(0, 4).map((mission) => (

                <div key={mission.id} className="space-y-1.5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      {mission.is_completed ? (

                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />

                      ) : (

                        <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />

                      )}

                      <span className={`text-sm font-medium ${mission.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>

                        {mission.title}

                      </span>

                    </div>

                    <div className="flex items-center gap-1.5">

                      {mission.xp_reward > 0 && (

                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">+{mission.xp_reward} XP</span>

                      )}

                      {mission.coin_reward > 0 && (

                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">+{mission.coin_reward}</span>

                      )}

                    </div>

                  </div>

                  <Progress value={(mission.current_progress / mission.goal) * 100} className="h-1.5" />

                  <div className="flex justify-between">

                    <span className="text-[10px] text-gray-400">{mission.description}</span>

                    <span className="text-[10px] text-gray-400 font-medium">{mission.current_progress}/{mission.goal}</span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </CardContent>

      </Card>



      <Card>

        <CardHeader>

          <CardTitle>Quick Actions</CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Link to="/users/dashboard/events">

              <Button className="w-full h-16 text-left justify-start">

                <Calendar className="mr-3 h-6 w-6" />

                <div>

                  <div className="font-medium">Create New Event</div>

                  <div className="text-sm opacity-75">Start organizing your event</div>

                </div>

              </Button>

            </Link>

            <Link to="/users/dashboard/analytics">

              <Button variant="outline" className="w-full h-16 text-left justify-start">

                <BarChart className="mr-3 h-6 w-6" />

                <div>

                  <div className="font-medium">View Detailed Analytics</div>

                  <div className="text-sm opacity-75">Check content engagement metrics</div>

                </div>

              </Button>

            </Link>

          </div>

        </CardContent>

      </Card>



      <Card>

        <CardHeader>

          <CardTitle>Getting Started</CardTitle>

          <p className="text-gray-600">Complete these steps to maximize your event management experience.</p>

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

              <Button variant="outline" size="sm" className="ml-auto" onClick={() => openUserProfile()}>Verify</Button>

            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">

              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />

              <div>

                <h4 className="font-medium text-gray-700">Create Your First Event</h4>

                <p className="text-sm text-gray-600">Start by creating your first event to share with others</p>

              </div>

              <Link to="/users/dashboard/events" className="ml-auto">

                <Button size="sm">Create Event</Button>

              </Link>

            </div>

          </div>

        </CardContent>

      </Card>

    </div>

  );

};



export default UserDashboardHome;