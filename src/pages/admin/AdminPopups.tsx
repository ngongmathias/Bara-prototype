import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit, Upload, RefreshCw, Eye, EyeOff, Calendar, Link, Image } from 'lucide-react';

export type Popup = {
  id: string;
  name: string;
  image_url: string;
  link_url?: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminPopups() {
  const { toast } = useToast();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Popup | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    link_url: '', 
    image_url: '', 
    sort_order: 0, 
    is_active: true,
    starts_at: '',
    ends_at: ''
  });

  // Helper function to safely get Supabase client
  const getSupabaseClient = () => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.');
    }
    return supabase;
  };

  const loadPopups = async () => {
    console.log('🔄 Loading popups...');
    setLoading(true);
    
    try {
      const client = getSupabaseClient();
      console.log('✅ Supabase client obtained');
      
      // Test connection first
      console.log('🔍 Testing Supabase connection...');
      const { data: testData, error: testError } = await client
        .from('popup_ads')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        throw new Error(`Connection test failed: ${testError.message}`);
      }
      
      console.log('✅ Supabase connection test passed');
      
      // Fetch all popups
      console.log('📡 Fetching popups from database...');
      const { data, error } = await client
        .from('popup_ads')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching popups:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      console.log('✅ Popups fetched successfully:', data);
      setPopups(data || []);
      
      if (data && data.length > 0) {
        toast({ 
          title: 'Success', 
          description: `Loaded ${data.length} popup(s)` 
        });
      } else {
        console.log('ℹ️ No popups found in database');
      }
      
    } catch (error) {
      console.error('❌ Load popups error:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to load popups: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: 'destructive' 
      });
      setPopups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const handleSubmit = async () => {
    console.log('💾 Submitting popup...');
    
    try {
      const client = getSupabaseClient();
      let imageUrl = form.image_url;
      
      // Handle image upload if a new file is selected
      if (file) {
        console.log('📤 Uploading new image...');
        
        // Validate image dimensions
        const img = document.createElement('img');
        const imageObjectUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            const aspectRatio = width / height;
            
            // Recommended: 1280x720 (16:9 ratio)
            // Accept 1:1 to 21:9 ratio, min 600px on shortest side
            const minDimension = Math.min(width, height);
            if (minDimension < 600) {
              reject(new Error(`Image is too small. Minimum dimension is 600px. Your image is ${width}x${height}px.`));
              return;
            }
            
            // Warn if not 16:9 but allow it
            if (aspectRatio < 0.5 || aspectRatio > 2.5) {
              console.warn(`⚠️ Image aspect ratio is ${aspectRatio.toFixed(2)}:1. Recommended: 16:9 (1280x720px)`);
            }
            
            resolve(true);
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageObjectUrl;
        });
        
        URL.revokeObjectURL(imageObjectUrl);
        
        const ext = file.name.split('.').pop();
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError } = await client.storage
          .from('popup-ads')
          .upload(name, file);
        
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = client.storage
          .from('popup-ads')
          .getPublicUrl(name);
        
        imageUrl = publicUrl.includes('/object/public/')
          ? publicUrl
          : publicUrl.replace('/storage/v1/object/', '/storage/v1/object/public/');
        
        console.log('✅ Image uploaded:', imageUrl);
      }
      
      const payload = { 
        ...form, 
        image_url: imageUrl,
        sort_order: parseInt(form.sort_order.toString(), 10) || 0,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null
      };
      
      console.log('📝 Submitting payload:', payload);
      
      if (editing) {
        console.log('✏️ Updating existing popup:', editing.id);
        const { data, error } = await client
          .from('popup_ads')
          .update(payload)
          .eq('id', editing.id)
          .select('*')
          .single();
        
        if (error) throw error;
        console.log('✅ Popup updated successfully:', data);
        toast({ title: 'Success', description: 'Popup updated successfully' });
      } else {
        console.log('➕ Creating new popup');
        const { data, error } = await client
          .from('popup_ads')
          .insert(payload)
          .select('*')
          .single();
        
        if (error) throw error;
        console.log('✅ Popup created successfully:', data);
        toast({ title: 'Success', description: 'Popup created successfully' });
      }
      
      // Reset form and reload data
      setOpen(false);
      setEditing(null);
      setFile(null);
      setForm({ name: '', link_url: '', image_url: '', sort_order: 0, is_active: true, starts_at: '', ends_at: '' });
      await loadPopups();
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to save popup: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup? This action cannot be undone.')) {
      return;
    }
    
    console.log('🗑️ Deleting popup:', id);
    
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('popup_ads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Popup deleted successfully');
      toast({ title: 'Success', description: 'Popup deleted successfully' });
      await loadPopups();
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to delete popup: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = (popup: Popup) => {
    console.log('✏️ Editing popup:', popup);
    setEditing(popup);
    setForm({
      name: popup.name,
      link_url: popup.link_url || '',
      image_url: popup.image_url,
      sort_order: popup.sort_order,
      is_active: popup.is_active,
      starts_at: popup.starts_at ? new Date(popup.starts_at).toISOString().slice(0, 16) : '',
      ends_at: popup.ends_at ? new Date(popup.ends_at).toISOString().slice(0, 16) : ''
    });
    setFile(null);
    setOpen(true);
  };

  const handleAddNew = () => {
    console.log('➕ Adding new popup');
    setEditing(null);
    setForm({ name: '', link_url: '', image_url: '', sort_order: popups.length, is_active: true, starts_at: '', ends_at: '' });
    setFile(null);
    setOpen(true);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('popup_ads')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: `Popup ${!currentStatus ? 'activated' : 'deactivated'}` 
      });
      await loadPopups();
      
    } catch (error) {
      console.error('❌ Toggle error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update popup status', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Popups Management</h1>
            <p className="text-gray-600 mt-1">Manage popup advertisements and notifications</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadPopups}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Popup
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Popups</p>
                  <p className="text-2xl font-bold">{popups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{popups.filter(p => p.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <EyeOff className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold">{popups.filter(p => !p.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Link className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Links</p>
                  <p className="text-2xl font-bold">{popups.filter(p => p.link_url).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Popups ({popups.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading popups...</p>
                </div>
              </div>
            ) : popups.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No popups found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first popup.</p>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Popup
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popups.map((popup) => (
                    <TableRow key={popup.id}>
                      <TableCell>
                        <img 
                          src={popup.image_url} 
                          className="h-12 w-16 object-cover rounded border" 
                          alt={popup.name}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{popup.name}</TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {popup.link_url ? (
                          <a 
                            href={popup.link_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Link className="w-3 h-3" />
                            {popup.link_url.length > 30 ? popup.link_url.substring(0, 30) + '...' : popup.link_url}
                          </a>
                        ) : (
                          <span className="text-gray-400">No link</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            popup.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {popup.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(popup.id, popup.is_active)}
                            title={popup.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {popup.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600">
                          {popup.starts_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(popup.starts_at).toLocaleDateString()}
                            </div>
                          )}
                          {popup.ends_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(popup.ends_at).toLocaleDateString()}
                            </div>
                          )}
                          {!popup.starts_at && !popup.ends_at && (
                            <span className="text-gray-400">No schedule</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{popup.sort_order}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(popup)}
                          title="Edit popup"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(popup.id)}
                          title="Delete popup"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Popup' : 'Add New Popup'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name"
                    value={form.name} 
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter popup name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input 
                    id="link_url"
                    value={form.link_url} 
                    onChange={(e) => setForm(prev => ({ ...prev, link_url: e.target.value }))} 
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image *</Label>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">📐 Required Dimensions:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>Recommended:</strong> 1280 x 720 pixels (16:9 ratio)</li>
                    <li>• <strong>Minimum:</strong> 600px on shortest side</li>
                    <li>• <strong>Aspect ratio:</strong> Any (1:1 square, 16:9 landscape, 9:16 portrait)</li>
                    <li>• <strong>File size:</strong> Less than 3MB</li>
                  </ul>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    id="image"
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      console.log('File selected:', selectedFile?.name);
                    }} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="image" 
                    className="inline-flex items-center gap-2 px-3 py-2 rounded border cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4"/> Select Image
                  </label>
                  {form.image_url && !file && (
                    <div className="flex items-center gap-2">
                      <img src={form.image_url} className="h-10 w-16 object-cover rounded border" alt="Current" />
                      <span className="text-sm text-gray-600">Current image</span>
                    </div>
                  )}
                  {file && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-600 font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">(New image selected)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input 
                    id="sort_order"
                    type="number" 
                    value={form.sort_order} 
                    onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value || '0', 10) }))} 
                  />
                </div>
                <div>
                  <Label htmlFor="starts_at">Start Date</Label>
                  <Input 
                    id="starts_at"
                    type="datetime-local" 
                    value={form.starts_at} 
                    onChange={(e) => setForm(prev => ({ ...prev, starts_at: e.target.value }))} 
                  />
                </div>
                <div>
                  <Label htmlFor="ends_at">End Date</Label>
                  <Input 
                    id="ends_at"
                    type="datetime-local" 
                    value={form.ends_at} 
                    onChange={(e) => setForm(prev => ({ ...prev, ends_at: e.target.value }))} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  checked={form.is_active} 
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))} 
                />
                <span>Active</span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editing ? 'Update Popup' : 'Create Popup'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
