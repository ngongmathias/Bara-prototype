import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAdminDb } from '@/lib/supabase';
import { ClerkSupabaseBridge } from '@/lib/clerkSupabaseBridge';
import {
  Shield,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  User,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  permissions: string[];
  is_active: boolean;
  added_by: string | null;
  last_login: string | null;
  created_at: string;
}

export const AdminManagement = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentAdminInfo, setCurrentAdminInfo] = useState<any>(null);

  // Add admin form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminFirstName, setNewAdminFirstName] = useState('');
  const [newAdminLastName, setNewAdminLastName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<string>('admin');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    checkSuperAdminStatus();
    fetchAdmins();
  }, [user]);

  const checkSuperAdminStatus = async () => {
    if (!user) return;
    
    const userEmail = user.primaryEmailAddress?.emailAddress || '';
    const adminStatus = await ClerkSupabaseBridge.checkAdminStatus(user.id, userEmail);
    
    setCurrentAdminInfo(adminStatus.adminUser);
    setIsSuperAdmin(adminStatus.role === 'super_admin');
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const db = getAdminDb();
      const { data, error } = await db
        .admin_users()
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !user) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAddingAdmin(true);

      // Check if email already exists
      const existing = admins.find(a => a.email.toLowerCase() === newAdminEmail.toLowerCase());
      if (existing) {
        toast({
          title: 'Admin Already Exists',
          description: 'This email is already registered as an admin',
          variant: 'destructive'
        });
        return;
      }

      // Generate a temporary user_id (will be updated when they first sign in)
      const tempUserId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const db = getAdminDb();
      const { data, error } = await db
        .admin_users()
        .insert({
          user_id: tempUserId,
          email: newAdminEmail.toLowerCase(),
          first_name: newAdminFirstName || null,
          last_name: newAdminLastName || null,
          role: newAdminRole,
          permissions: newAdminRole === 'super_admin' 
            ? ['read', 'write', 'delete', 'admin']
            : newAdminRole === 'admin'
            ? ['read', 'write', 'delete']
            : ['read', 'write'],
          is_active: true,
          added_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await db.admin_activity_log().insert({
        admin_user_id: user.id,
        admin_email: user.primaryEmailAddress?.emailAddress || '',
        action: 'added_admin',
        target_user_id: tempUserId,
        target_email: newAdminEmail,
        details: {
          role: newAdminRole,
          first_name: newAdminFirstName,
          last_name: newAdminLastName
        }
      });

      toast({
        title: 'Admin Added Successfully',
        description: `${newAdminEmail} has been added as ${newAdminRole}. They can now sign in to access the admin panel.`,
      });

      // Reset form
      setNewAdminEmail('');
      setNewAdminFirstName('');
      setNewAdminLastName('');
      setNewAdminRole('admin');
      setShowAddForm(false);

      // Refresh list
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to add admin user',
        variant: 'destructive'
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleToggleActive = async (adminUser: AdminUser) => {
    if (!user) return;

    // Prevent deactivating yourself
    if (adminUser.user_id === user.id) {
      toast({
        title: 'Cannot Deactivate Yourself',
        description: 'You cannot deactivate your own admin account',
        variant: 'destructive'
      });
      return;
    }

    try {
      const db = getAdminDb();
      const { error } = await db
        .admin_users()
        .update({ is_active: !adminUser.is_active })
        .eq('id', adminUser.id);

      if (error) throw error;

      // Log the action
      await db.admin_activity_log().insert({
        admin_user_id: user.id,
        admin_email: user.primaryEmailAddress?.emailAddress || '',
        action: adminUser.is_active ? 'deactivated_admin' : 'activated_admin',
        target_user_id: adminUser.user_id,
        target_email: adminUser.email,
        details: { previous_status: adminUser.is_active }
      });

      toast({
        title: 'Status Updated',
        description: `${adminUser.email} has been ${adminUser.is_active ? 'deactivated' : 'activated'}`,
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAdmin = async (adminUser: AdminUser) => {
    if (!user) return;

    // Prevent deleting yourself
    if (adminUser.user_id === user.id) {
      toast({
        title: 'Cannot Delete Yourself',
        description: 'You cannot delete your own admin account',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete ${adminUser.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const db = getAdminDb();
      const { error } = await db
        .admin_users()
        .delete()
        .eq('id', adminUser.id);

      if (error) throw error;

      // Log the action
      await db.admin_activity_log().insert({
        admin_user_id: user.id,
        admin_email: user.primaryEmailAddress?.emailAddress || '',
        action: 'deleted_admin',
        target_user_id: adminUser.user_id,
        target_email: adminUser.email,
        details: { role: adminUser.role }
      });

      toast({
        title: 'Admin Deleted',
        description: `${adminUser.email} has been removed from admin users`,
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete admin user',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" />Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-green-100 text-green-800"><User className="w-3 h-3 mr-1" />Moderator</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout title="Admin Management" subtitle="Manage admin users and permissions">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-comfortaa font-semibold mb-2">Super Admin Access Required</h3>
            <p className="text-gray-600 font-roboto">
              Only super admins can manage admin users. Contact a super admin if you need assistance.
            </p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Management" subtitle="Manage admin users and permissions">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-comfortaa font-bold text-yp-dark">Admin Users</h2>
            <p className="text-gray-600 font-roboto">Manage who has access to the admin panel</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="font-comfortaa flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Add New Admin</span>
              </CardTitle>
              <CardDescription className="font-roboto">
                Add a new admin user. They will be able to sign in with their email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="font-roboto">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="font-roboto">Role *</Label>
                  <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4" />
                          <span>Super Admin (Full Access + Manage Admins)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>Admin (Full Access)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderator">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Moderator (Read + Approve Content)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="font-roboto">First Name (Optional)</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={newAdminFirstName}
                    onChange={(e) => setNewAdminFirstName(e.target.value)}
                    className="font-roboto"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="font-roboto">Last Name (Optional)</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={newAdminLastName}
                    onChange={(e) => setNewAdminLastName(e.target.value)}
                    className="font-roboto"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAddAdmin}
                  disabled={!newAdminEmail || addingAdmin}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addingAdmin ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" />Add Admin</>
                  )}
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 font-roboto">Loading admin users...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {admins.map((admin) => (
              <Card key={admin.id} className={cn(
                "hover:shadow-lg transition-shadow",
                !admin.is_active && "opacity-60 bg-gray-50"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-comfortaa font-semibold">
                          {admin.first_name || admin.last_name 
                            ? `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
                            : admin.email.split('@')[0]
                          }
                        </h3>
                        {getRoleBadge(admin.role)}
                        {admin.user_id === user?.id && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">You</Badge>
                        )}
                        {!admin.is_active && (
                          <Badge variant="outline" className="bg-red-50 text-red-800">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 font-roboto text-sm mb-1">{admin.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 font-roboto">
                        <span>Added: {new Date(admin.created_at).toLocaleDateString()}</span>
                        {admin.last_login && (
                          <span>Last login: {new Date(admin.last_login).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions (only if not yourself) */}
                    {admin.user_id !== user?.id && (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleToggleActive(admin)}
                          variant="outline"
                          size="sm"
                          title={admin.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {admin.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteAdmin(admin)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-comfortaa font-semibold text-blue-900 mb-2">About Admin Roles</h4>
                <ul className="space-y-1 text-sm text-blue-800 font-roboto">
                  <li><strong>Super Admin:</strong> Full access + can add/remove other admins</li>
                  <li><strong>Admin:</strong> Full access to all data and features</li>
                  <li><strong>Moderator:</strong> Can view and approve/reject content only</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
