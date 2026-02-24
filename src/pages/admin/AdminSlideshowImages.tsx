import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Image,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Edit,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/supabase';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';


interface SlideshowImage {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_alt_text: string | null;
  is_active: boolean;
  sort_order: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const AdminSlideshowImages: React.FC = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<SlideshowImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<{ type: 'single' | 'all', id?: string, url?: string } | null>(null);

  // Add/Edit dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<SlideshowImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_alt_text: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('slideshow_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching slideshow images:', error);
      setError('Failed to fetch slideshow images');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `slideshow-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('slideshow-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('slideshow-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile && !editingImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingImage?.image_url;

      // Upload new image if not editing
      if (!editingImage && selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const imageData = {
        title: formData.title || null,
        description: formData.description || null,
        image_url: imageUrl!,
        image_alt_text: formData.image_alt_text || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order
      };

      if (editingImage) {
        // Update existing image
        const { error } = await supabase
          .from('slideshow_images')
          .update(imageData)
          .eq('id', editingImage.id);

        if (error) throw error;

        toast({
          title: "Image updated",
          description: "Slideshow image has been updated successfully.",
        });
      } else {
        // Create new image
        const { error } = await supabase
          .from('slideshow_images')
          .insert(imageData);

        if (error) throw error;

        toast({
          title: "Image uploaded",
          description: "New slideshow image has been uploaded successfully.",
        });
      }

      setShowDialog(false);
      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Error",
        description: "Failed to save image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const processDelete = async (imageId: string, imageUrl?: string) => {
    // Delete from database first
    const { error: dbError } = await supabase
      .from('slideshow_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    // If there's a storage URL, try to delete from storage as well
    if (imageUrl && imageUrl.includes('storage/v1/object/public/slideshow-images/')) {
      try {
        // Extract filename from URL
        const fileName = imageUrl.split('slideshow-images/')[1];
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('slideshow-images')
            .remove([fileName]);

          if (storageError) console.warn('Could not delete from storage:', storageError);
        }
      } catch (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfig) return;

    try {
      if (deleteConfig.type === 'all') {
        const deletePromises = images.map(img => processDelete(img.id, img.image_url));
        await Promise.all(deletePromises);
        toast({
          title: "Images deleted",
          description: "All slideshow images have been deleted successfully.",
        });
      } else if (deleteConfig.id) {
        await processDelete(deleteConfig.id, deleteConfig.url);
        toast({
          title: "Image deleted",
          description: "Slideshow image has been deleted successfully.",
        });
      }
      fetchImages();
    } catch (error) {
      console.error('Error deleting image(s):', error);
      toast({
        title: "Error",
        description: "Failed to delete image(s). Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfig(null);
    }
  };

  const handleToggleActive = async (image: SlideshowImage) => {
    try {
      const { error } = await supabase
        .from('slideshow_images')
        .update({ is_active: !image.is_active })
        .eq('id', image.id);

      if (error) throw error;

      toast({
        title: image.is_active ? 'Image hidden' : 'Image shown',
        description: `Image is now ${image.is_active ? 'hidden from' : 'visible in'} the slideshow.`,
      });

      fetchImages();
    } catch (error) {
      console.error('Error toggling image status:', error);
      toast({
        title: "Error",
        description: "Failed to update image status.",
        variant: "destructive",
      });
    }
  };

  const handleSortOrderChange = async (imageId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('slideshow_images')
        .update({ sort_order: newOrder })
        .eq('id', imageId);

      if (error) throw error;

      fetchImages();
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast({
        title: "Error",
        description: "Failed to update sort order.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_alt_text: '',
      is_active: true,
      sort_order: images.length
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingImage(null);
  };

  const openEditDialog = (image: SlideshowImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      image_alt_text: image.image_alt_text || '',
      is_active: image.is_active,
      sort_order: image.sort_order
    });
    setPreviewUrl(image.image_url);
    setShowDialog(true);
  };

  const openAddDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-64 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center"><h1 className="text-2xl font-bold text-gray-900">Slideshow Images</h1>
                    <AdminPageGuide 
                      title="Homepage Slideshow"
                      description="Curate the massive rotating banners seen by every visitor on the main homepage."
                      features={["Upload ultra-wide landscape images", "Set overlay text and Call-To-Action buttons", "Reorder slides (Drag & Drop)", "Toggle visibility per-slide"]}
                      workflow={["Upload a WebP/JPEG image optimized for wide screens.", "Add a punchy title and brief subtitle.", "Add a destination URL for the massive button.", "Verify the preview looks good before publishing."]}
                    />
                </div>
            <p className="text-gray-600">Manage homepage slideshow images</p>
          </div>
          <div className="flex gap-2">
            {images.length > 0 && (
              <Button
                onClick={() => setDeleteConfig({ type: 'all' })}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            )}
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </div>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Slideshow Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-600">Upload your first slideshow image to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {images.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell>
                          <div className="w-16 h-12 rounded-lg overflow-hidden">
                            <img
                              src={image.image_url}
                              alt={image.image_alt_text || image.title || 'Slideshow image'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">{image.title || 'Untitled'}</div>
                            {image.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {image.description}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={image.is_active}
                              onCheckedChange={() => handleToggleActive(image)}
                            />
                            <Badge className={image.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {image.is_active ? (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Hidden
                                </>
                              )}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSortOrderChange(image.id, Math.max(0, image.sort_order - 1))}
                              disabled={image.sort_order === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {image.sort_order}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSortOrderChange(image.id, image.sort_order + 1)}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(image.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(image)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteConfig({ type: 'single', id: image.id, url: image.image_url })}
                              className="hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Slideshow Image' : 'Add New Slideshow Image'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Image Upload/Preview */}
              <div>
                <label className="block text-sm font-medium mb-2">Image *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      {!editingImage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      >
                        Click to upload image
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, GIF, WebP up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Image title (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort Order</label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Image description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alt Text</label>
                <Input
                  value={formData.image_alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_alt_text: e.target.value }))}
                  placeholder="Alt text for accessibility (optional)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <label className="text-sm font-medium">
                  Show in slideshow
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || (!selectedFile && !editingImage)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? 'Saving...' : (editingImage ? 'Update Image' : 'Upload Image')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteConfig} onOpenChange={(open) => !open && setDeleteConfig(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfig?.type === 'all'
                  ? `Are you sure you want to delete ALL ${images.length} images? This action cannot be undone.`
                  : 'Are you sure you want to delete this image? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};
