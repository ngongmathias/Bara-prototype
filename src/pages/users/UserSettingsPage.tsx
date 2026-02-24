import { useClerk, useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserLogService, UserLog } from '@/lib/userLogService';
import { useEffect, useRef, useState } from 'react';
import { Calendar, User, Shield, Printer, Edit, X, Key, LogOut, Save, Loader2, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const UserSettingsPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { signOut } = useClerk();
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: user?.phoneNumbers?.[0]?.phoneNumber || ''
  });
  const printRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: "Error", description: "Failed to save profile. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const data = await UserLogService.getUserLogs(user.id, 50);
          setLogs(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>User Settings Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>User Settings Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
              </div>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Unknown';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-yp-gray-light">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-[#e64600] to-[#4e3c28] text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full overflow-hidden flex items-center justify-center">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="w-20 h-20 object-cover rounded-full" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-comfortaa font-bold">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'}
                </h1>
                <p className="text-white/80">{user?.primaryEmailAddress?.emailAddress}</p>
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">Member</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-[#e64600]" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  {isEditing ? (
                    <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="mt-1" />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">{user?.firstName || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  {isEditing ? (
                    <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="mt-1" />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">{user?.lastName || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <p className="mt-1 text-gray-900 font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
                {isEditing && <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if you need to update it.</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                {isEditing ? (
                  <Input id="phone" type="tel" placeholder="+1 234 567 8900" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="mt-1" />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium">{user?.phoneNumbers?.[0]?.phoneNumber || 'Not provided'}</p>
                )}
              </div>
              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="bg-[#e64600] hover:bg-[#cc3d00] text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditing(false); setFormData({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.primaryEmailAddress?.emailAddress || '', phone: user?.phoneNumbers?.[0]?.phoneNumber || '' }); }}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#e64600]" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">User ID</Label>
                <p className="mt-1 text-gray-900 font-mono text-sm">{user?.id}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <p className="mt-1 text-gray-900 font-medium">Active</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                <p className="mt-1 text-gray-900 font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                <p className="mt-1 text-gray-900 font-medium">{user?.lastSignInAt ? formatDate(user.lastSignInAt) : 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <LogOut className="w-5 h-5" />
              <span>Danger Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Sign Out</h3>
                <p className="text-sm text-red-600">Sign out of your account</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-100"
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/';
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UserSettingsPage;


