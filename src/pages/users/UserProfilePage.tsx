import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  Building,
  Star,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Camera,
  Trophy
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { VerificationBadge, VerificationStatus } from '@/components/ui/verification-badge';
import { EventsService } from '@/lib/eventsService';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

export const UserProfilePage = () => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: false,
    phone: false,
    business: false,
    trusted_organizer: false
  });
  const [isLoadingVerification, setIsLoadingVerification] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load verification status
  useEffect(() => {
    const loadVerificationStatus = async () => {
      if (user?.id) {
        setIsLoadingVerification(true);
        try {
          const status = await EventsService.getUserVerificationStatus(user.id);
          setVerificationStatus(status);
        } catch (error) {
          console.error('Error loading verification status:', error);
        } finally {
          setIsLoadingVerification(false);
        }
      }
    };

    if (isLoaded && user) {
      loadVerificationStatus();
    }
  }, [user, isLoaded]);

  const handlePhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your phone number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await EventsService.createUserVerification(user!.id, 'phone', { phone: phoneNumber });
      setVerificationStatus(prev => ({ ...prev, phone: true }));
      toast({
        title: 'Phone verification submitted',
        description: 'Your phone number verification has been submitted for review.',
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Failed to submit phone verification. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBusinessVerification = async () => {
    if (!businessName.trim()) {
      toast({
        title: 'Business name required',
        description: 'Please enter your business name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await EventsService.createUserVerification(user!.id, 'business', {
        business_name: businessName,
        website: businessWebsite
      });
      setVerificationStatus(prev => ({ ...prev, business: true }));
      toast({
        title: 'Business verification submitted',
        description: 'Your business verification has been submitted for review.',
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Failed to submit business verification. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await user.delete();
      // Clerk handles redirect usually, but we can force it
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication required</h3>
        <p className="text-gray-600">Please sign in to access your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and verification status</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  className="h-20 w-20 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.fullName || 'User'}
              </h3>
              <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
              <div className="mt-2 flex items-center">
                {isLoadingVerification ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                ) : (
                  <VerificationBadge verification={verificationStatus} size="sm" />
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={user.firstName || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Managed through your account settings
              </p>
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={user.lastName || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Managed through your account settings
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={user.primaryEmailAddress?.emailAddress || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your email is automatically verified through our authentication system
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-orange-500" />
            Achievements & Badges
          </CardTitle>
          <p className="text-gray-600">
            Earn badges by interacting with the community, marketplace, and streams
          </p>
        </CardHeader>
        <CardContent>
          <BadgeGrid />
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Account Verification
          </CardTitle>
          <p className="text-gray-600">
            Increase your credibility by verifying your account information
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Verification */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-900">Email Verification</h4>
                <p className="text-sm text-green-700">Your email address has been verified</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✓ Verified
            </Badge>
          </div>

          {/* Phone Verification */}
          <div className={`p-4 border rounded-lg ${verificationStatus.phone ? 'bg-green-50' : 'bg-gray-50'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Phone className={`h-5 w-5 mr-3 ${verificationStatus.phone ? 'text-green-600' : 'text-gray-400'
                  }`} />
                <div>
                  <h4 className={`font-medium ${verificationStatus.phone ? 'text-green-900' : 'text-gray-900'
                    }`}>Phone Verification</h4>
                  <p className={`text-sm ${verificationStatus.phone ? 'text-green-700' : 'text-gray-600'
                    }`}>
                    {verificationStatus.phone
                      ? 'Your phone number has been verified'
                      : 'Verify your phone number for better security'
                    }
                  </p>
                </div>
              </div>
              {verificationStatus.phone ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Verified
                </Badge>
              )}
            </div>

            {!verificationStatus.phone && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Button onClick={handlePhoneVerification} size="sm">
                  Submit for Verification
                </Button>
              </div>
            )}
          </div>

          {/* Business Verification */}
          <div className={`p-4 border rounded-lg ${verificationStatus.business ? 'bg-green-50' : 'bg-gray-50'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building className={`h-5 w-5 mr-3 ${verificationStatus.business ? 'text-green-600' : 'text-gray-400'
                  }`} />
                <div>
                  <h4 className={`font-medium ${verificationStatus.business ? 'text-green-900' : 'text-gray-900'
                    }`}>Business Verification</h4>
                  <p className={`text-sm ${verificationStatus.business ? 'text-green-700' : 'text-gray-600'
                    }`}>
                    {verificationStatus.business
                      ? 'Your business has been verified'
                      : 'Verify your business for professional events'
                    }
                  </p>
                </div>
              </div>
              {verificationStatus.business ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Verified
                </Badge>
              )}
            </div>

            {!verificationStatus.business && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessWebsite">Business Website (Optional)</Label>
                  <Input
                    id="businessWebsite"
                    type="url"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    placeholder="https://your-business.com"
                  />
                </div>
                <Button onClick={handleBusinessVerification} size="sm">
                  Submit for Verification
                </Button>
              </div>
            )}
          </div>

          {/* Trusted Organizer */}
          <div className={`p-4 border rounded-lg ${verificationStatus.trusted_organizer ? 'bg-yellow-50' : 'bg-gray-50'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className={`h-5 w-5 mr-3 ${verificationStatus.trusted_organizer ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                <div>
                  <h4 className={`font-medium ${verificationStatus.trusted_organizer ? 'text-yellow-900' : 'text-gray-900'
                    }`}>Trusted Organizer</h4>
                  <p className={`text-sm ${verificationStatus.trusted_organizer ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                    {verificationStatus.trusted_organizer
                      ? 'You are a trusted event organizer'
                      : 'Earned after successfully organizing multiple events'
                    }
                  </p>
                </div>
              </div>
              {verificationStatus.trusted_organizer ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  ⭐ Trusted
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Earned
                </Badge>
              )}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Verification requests are reviewed by our team.
              Business and trusted organizer verifications may take 2-3 business days to process.
              You'll be notified via email once your verification is approved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline">
              Export My Data
            </Button>
            <Button variant="outline">
              Download Event Reports
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600 text-sm mb-4">
              If you have questions about verification or need assistance with your account,
              please contact our support team.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <Shield className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};