import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Video,
  Check,
  X,
  Clock,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';


interface EventSlideMedia {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_alt_text: string | null;
  media_type: 'image' | 'video';
  video_url: string | null;
  video_thumbnail: string | null;
  video_duration: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface UserSubmission {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string | null;
  description: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  submission_status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export const AdminEventsSlideshow = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [media, setMedia] = useState<EventSlideMedia[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventSlideMedia | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_alt_text: '',
    media_type: 'image' as 'image' | 'video',
    video_duration: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchMedia();
    fetchSubmissions();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_slideshow_images')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load media', variant: 'destructive' });
    }
    setMedia(data || []);
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('user_slideshow_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load submissions', variant: 'destructive' });
    }
    setSubmissions(data || []);
  };

  const uploadToBucket = async (f: File, type: 'image' | 'video' | 'thumbnail'): Promise<string> => {
    const ext = f.name.split('.').pop();
    const prefix = type === 'video' ? 'event-slide-video' : type === 'thumbnail' ? 'event-slide-thumb' : 'event-slide-image';
    const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    const bucketName = type === 'video' ? 'event-slideshow-videos' : 'event-slideshow-images';
    const { error } = await supabase.storage.from(bucketName).upload(name, f);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(name);
    const normalized = publicUrl.includes('/object/public/')
      ? publicUrl
      : publicUrl.replace('/storage/v1/object/', '/storage/v1/object/public/');
    return normalized;
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setForm({ 
      title: '', 
      description: '', 
      image_alt_text: '', 
      media_type: 'image',
      video_duration: '',
      is_active: true, 
      sort_order: media.length 
    });
    setEditing(null);
    setFile(null);
    setThumbnailFile(null);
    setPreview(null);
    setThumbnailPreview(null);
  };

  const save = async () => {
    try {
      let imageUrl = editing?.image_url;
      let videoUrl = editing?.video_url;
      let thumbnailUrl = editing?.video_thumbnail;

      if (!editing && file) {
        if (form.media_type === 'video') {
          videoUrl = await uploadToBucket(file, 'video');
          if (thumbnailFile) {
            thumbnailUrl = await uploadToBucket(thumbnailFile, 'thumbnail');
          }
        } else {
          imageUrl = await uploadToBucket(file, 'image');
        }
      }

      if (!imageUrl && form.media_type === 'image') {
        toast({ title: 'Image required', description: 'Please upload an image', variant: 'destructive' });
        return;
      }
      if (!videoUrl && form.media_type === 'video') {
        toast({ title: 'Video required', description: 'Please upload a video', variant: 'destructive' });
        return;
      }

      const payload = {
        title: form.title || null,
        description: form.description || null,
        image_url: imageUrl || '',
        image_alt_text: form.image_alt_text || null,
        media_type: form.media_type,
        video_url: videoUrl || null,
        video_thumbnail: thumbnailUrl || null,
        video_duration: form.video_duration ? parseFloat(form.video_duration) : null,
        is_active: form.is_active,
        sort_order: form.sort_order,
      };

      if (editing) {
        const { error } = await supabase.from('event_slideshow_images').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('event_slideshow_images').insert(payload);
        if (error) throw error;
      }
      toast({ title: 'Saved', description: `Background ${form.media_type} saved` });
      setDialogOpen(false);
      reset();
      fetchMedia();
    } catch (e) {
      toast({ title: 'Error', description: `Failed to save ${form.media_type}`, variant: 'destructive' });
    }
  };

  const remove = async (img: EventSlideMedia) => {
    if (!confirm('Delete this media?')) return;
    const { error } = await supabase.from('event_slideshow_images').delete().eq('id', img.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted', description: 'Media removed' });
    fetchMedia();
  };

  const toggleActive = async (img: EventSlideMedia) => {
    const { error } = await supabase.from('event_slideshow_images').update({ is_active: !img.is_active }).eq('id', img.id);
    if (error) return toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    fetchMedia();
  };

  const changeOrder = async (img: EventSlideMedia, dir: -1 | 1) => {
    const { error } = await supabase.from('event_slideshow_images').update({ sort_order: img.sort_order + dir }).eq('id', img.id);
    if (error) return toast({ title: 'Error', description: 'Failed to reorder', variant: 'destructive' });
    fetchMedia();
  };

  const handleSubmissionAction = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        const { error } = await supabase.rpc('approve_user_slideshow_submission', {
          submission_id: submissionId,
          admin_user_id: user?.id || '',
          sort_order_value: null
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('reject_user_slideshow_submission', {
          submission_id: submissionId,
          admin_user_id: user?.id || '',
          rejection_reason: 'Rejected by admin'
        });
        if (error) throw error;
      }

      toast({
        title: status === 'approved' ? 'Approved' : 'Rejected',
        description: `Submission ${status} successfully`,
      });

      fetchSubmissions();
      if (status === 'approved') {
        fetchMedia(); // Refresh media list if approved
      }
    } catch (error) {
      console.error('Submission action error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${status} submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const onThumbnailFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  return (
    <AdminLayout>
        <div className="mb-4 w-full flex justify-end">
          <AdminPageGuide 
            title="Events Slideshow"
            description="Manage the rotating banner on the Events page."
            features={["Upload wide-format promotional images", "Link to featured events", "Set active status"]}
            workflow={["Upload 16:9 WebP image", "Add the URL of the event to feature", "Toggle Active to show to users"]}
          />
        </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events Page Background</h1>
            <p className="text-gray-600">Manage slideshow media for the Events page hero</p>
          </div>
          <Button onClick={() => { reset(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Media
          </Button>
        </div>

        {/* User Submissions Management */}
        <Tabs defaultValue="media" className="w-full">
          <TabsList>
            <TabsTrigger value="media">Current Media</TabsTrigger>
            <TabsTrigger value="submissions">User Submissions ({submissions.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media ({media.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">Loading...</div>
                ) : media.length === 0 ? (
                  <div className="text-center py-10">No media yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {media.map(img => (
                        <TableRow key={img.id}>
                          <TableCell>
                            <div className="w-20 h-12 overflow-hidden rounded relative">
                              <img src={img.video_thumbnail || img.image_url} alt={img.image_alt_text || 'slide'} className="w-full h-full object-cover" />
                              {img.media_type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={img.media_type === 'video' ? 'default' : 'secondary'}>
                              {img.media_type === 'video' ? (
                                <><Video className="w-3 h-3 mr-1" />Video</>
                              ) : (
                                <><ImageIcon className="w-3 h-3 mr-1" />Image</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{img.title || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={img.is_active} onCheckedChange={() => toggleActive(img)} />
                              <Badge>{img.is_active ? <span className="flex items-center"><Eye className="w-3 h-3 mr-1"/>Active</span> : <span className="flex items-center"><EyeOff className="w-3 h-3 mr-1"/>Hidden</span>}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" onClick={() => changeOrder(img, -1)}><ArrowUp className="w-3 h-3"/></Button>
                              <span className="px-2 text-sm">{img.sort_order}</span>
                              <Button variant="outline" size="icon" onClick={() => changeOrder(img, 1)}><ArrowDown className="w-3 h-3"/></Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => { 
                                setEditing(img); 
                                setForm({ 
                                  title: img.title || '', 
                                  description: img.description || '', 
                                  image_alt_text: img.image_alt_text || '', 
                                  media_type: img.media_type,
                                  video_duration: img.video_duration?.toString() || '',
                                  is_active: img.is_active, 
                                  sort_order: img.sort_order 
                                }); 
                                setPreview(img.video_thumbnail || img.image_url); 
                                setDialogOpen(true); 
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => remove(img)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>User Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-10">No user submissions yet</div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map(submission => (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-16 overflow-hidden rounded relative flex-shrink-0">
                            <img 
                              src={submission.thumbnail_url || submission.media_url} 
                              alt={submission.alt_text || 'submission'} 
                              className="w-full h-full object-cover" 
                            />
                            {submission.media_type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{submission.title || 'Untitled'}</h4>
                              <Badge variant={submission.media_type === 'video' ? 'default' : 'secondary'}>
                                {submission.media_type === 'video' ? (
                                  <><Video className="w-3 h-3 mr-1" />Video</>
                                ) : (
                                  <><ImageIcon className="w-3 h-3 mr-1" />Image</>
                                )}
                              </Badge>
                              <Badge 
                                variant={
                                  submission.submission_status === 'pending' ? 'outline' : 
                                  submission.submission_status === 'approved' ? 'default' : 'destructive'
                                }
                              >
                                {submission.submission_status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {submission.submission_status === 'approved' && <Check className="w-3 h-3 mr-1" />}
                                {submission.submission_status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                                {submission.submission_status.charAt(0).toUpperCase() + submission.submission_status.slice(1)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">By: {submission.user_name} ({submission.user_email})</p>
                            
                            {submission.description && (
                              <p className="text-sm text-gray-700 mb-2">{submission.description}</p>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {submission.submission_status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleSubmissionAction(submission.id, 'approved')}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSubmissionAction(submission.id, 'rejected')}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Background Media' : 'Add Background Media'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Media Type</Label>
                <Select value={form.media_type} onValueChange={(value: 'image' | 'video') => setForm(prev => ({ ...prev, media_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">
                      <span className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image
                      </span>
                    </SelectItem>
                    <SelectItem value="video">
                      <span className="flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-2 border-dashed rounded p-4 text-center">
                {preview ? (
                  <div className="space-y-2">
                    {form.media_type === 'video' ? (
                      <video src={preview} className="max-h-56 mx-auto rounded" controls />
                    ) : (
                      <img src={preview} alt="preview" className="max-h-56 mx-auto rounded" />
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload a {form.media_type === 'video' ? 'MP4, WebM, or AVI' : 'JPG, PNG, GIF, or WebP'}
                    </p>
                  </>
                )}
                {!editing && (
                  <>
                    <input 
                      id="bg-upload" 
                      type="file" 
                      accept={form.media_type === 'video' ? 'video/*' : 'image/*'} 
                      onChange={onFile} 
                      className="hidden" 
                    />
                    <label htmlFor="bg-upload" className="mt-2 inline-block text-blue-600 cursor-pointer">
                      Choose {form.media_type === 'video' ? 'Video' : 'Image'}
                    </label>
                  </>
                )}
              </div>

              {form.media_type === 'video' && (
                <div className="border-2 border-dashed rounded p-4 text-center">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="thumbnail preview" className="max-h-32 mx-auto rounded" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Upload video thumbnail (optional)</p>
                    </>
                  )}
                  <input 
                    id="thumbnail-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={onThumbnailFile} 
                    className="hidden" 
                  />
                  <label htmlFor="thumbnail-upload" className="mt-2 inline-block text-blue-600 cursor-pointer">
                    Choose Thumbnail
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <Input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Sort Order</label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              {form.media_type === 'video' && (
                <div>
                  <label className="block text-sm mb-1">Video Duration (seconds)</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={form.video_duration} 
                    onChange={(e) => setForm(prev => ({ ...prev, video_duration: e.target.value }))} 
                    placeholder="Optional - duration in seconds"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-1">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <label className="block text-sm mb-1">Alt Text</label>
                <Input value={form.image_alt_text} onChange={(e) => setForm(prev => ({ ...prev, image_alt_text: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm(prev => ({ ...prev, is_active: v }))} />
                <span className="text-sm">Show in slideshow</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={save}>{editing ? 'Update' : 'Save'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminEventsSlideshow;


