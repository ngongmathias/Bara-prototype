import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Clock,
  Check,
  X,
  AlertCircle,
  Play,
  Trash2
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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

export const UserBannerSubmission = () => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    alt_text: '',
    media_type: 'image' as 'image' | 'video',
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserSubmissions();
    }
  }, [isLoaded, user]);

  const fetchUserSubmissions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_slideshow_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your submissions',
        variant: 'destructive',
      });
    } else {
      setSubmissions(data || []);
    }
  };

  const uploadToBucket = async (f: File, type: 'image' | 'video' | 'thumbnail'): Promise<string> => {
    const ext = f.name.split('.').pop();
    const prefix = type === 'video' ? 'user-submission-video' : type === 'thumbnail' ? 'user-submission-thumb' : 'user-submission-image';
    const name = `${prefix}-${user?.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bucketName = type === 'video' ? 'event-slideshow-videos' : 'event-slideshow-images';
    const { error } = await supabase.storage.from(bucketName).upload(name, f);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(name);
    const normalized = publicUrl.includes('/object/public/')
      ? publicUrl
      : publicUrl.replace('/storage/v1/object/', '/storage/v1/object/public/');
    return normalized;
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'thumbnail') => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (type === 'main') {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setThumbnailFile(f);
      setThumbnailPreview(URL.createObjectURL(f));
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', alt_text: '', media_type: 'image' });
    setFile(null);
    setThumbnailFile(null);
    setPreview(null);
    setThumbnailPreview(null);
  };

  const submitBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to submit banner media.',
        variant: 'destructive',
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Media required',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload main media file
      let mediaUrl: string;
      if (form.media_type === 'video') {
        mediaUrl = await uploadToBucket(file, 'video');
      } else {
        mediaUrl = await uploadToBucket(file, 'image');
      }

      // Upload thumbnail for video
      let thumbnailUrl: string | null = null;
      if (form.media_type === 'video' && thumbnailFile) {
        thumbnailUrl = await uploadToBucket(thumbnailFile, 'thumbnail');
      }

      // Create submission record
      const submission = {
        user_id: user.id,
        user_email: user.primaryEmailAddress?.emailAddress || '',
        user_name: user.fullName || user.firstName || 'User',
        title: form.title || null,
        description: form.description || null,
        media_type: form.media_type,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        alt_text: form.alt_text || null,
        submission_status: 'pending' as const,
      };

      const { error } = await supabase
        .from('user_slideshow_submissions')
        .insert(submission);

      if (error) throw error;

      // Send confirmation email
      await supabase.functions.invoke('send-email', {
        body: {
          to: user.primaryEmailAddress?.emailAddress,
          subject: 'Banner Submission Received - Bara Afrika',
          type: 'banner_submission_confirmation', // Assuming a new email template type
          data: {
            userName: user.fullName || user.firstName || 'User',
            mediaType: form.media_type,
            title: form.title || 'N/A',
          },
        },
      });

      toast({
        title: "Success! 🎉",
        description: "Your banner submission has been received. We'll review it shortly.",
      });

      resetForm();
      fetchUserSubmissions();
    } catch (error) {
      console.error('Error submitting banner:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit banner. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    const { error } = await supabase
      .from('user_slideshow_submissions')
      .delete()
      .eq('id', submissionId)
      .eq('user_id', user?.id); // Ensure user can only delete their own submissions

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete submission.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Submission deleted successfully.',
      });
      fetchUserSubmissions();
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
        <p className="text-gray-600">Please sign in to submit banner media.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Banner Submissions</h1>
        <p className="text-gray-600">Submit images for the Events page background (pending admin approval)</p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> All submissions require admin approval before appearing on the Events page.
          You will be notified via email once your submission is reviewed.
        </AlertDescription>
      </Alert>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Banner Media</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitBanner} className="space-y-4">
            <div>
              <Label>Media Type</Label>
              <Select value={form.media_type} onValueChange={(value: 'image') => setForm(prev => ({ ...prev, media_type: value }))}>
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
                  {/* <SelectItem value="video">
                    <span className="flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </span>
                  </SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{form.media_type === 'video' ? 'Video File' : 'Image File'} *</Label>
              <Input
                type="file"
                accept={form.media_type === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => onFile(e, 'main')}
                required
              />
              {preview && (
                <div className="mt-2">
                  {form.media_type === 'video' ? (
                    <video src={preview} className="w-full h-48 object-cover rounded" controls />
                  ) : (
                    <img src={preview} className="w-full h-48 object-cover rounded" />
                  )}
                </div>
              )}
            </div>

            {form.media_type === 'video' && (
              <div>
                <Label>Video Thumbnail (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFile(e, 'thumbnail')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a custom thumbnail image for your video. If not provided, a frame from the video will be used.
                </p>
                {thumbnailPreview && (
                  <img src={thumbnailPreview} className="mt-2 w-32 h-20 object-cover rounded" />
                )}
              </div>
            )}

            <div>
              <Label>Title</Label>
              <Input
                placeholder="Banner title (optional)"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your banner submission (optional)"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label>Alt Text</Label>
              <Input
                placeholder="Alternative text for accessibility (optional)"
                value={form.alt_text}
                onChange={(e) => setForm(prev => ({ ...prev, alt_text: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={isSubmitting || !file}>
              <Upload className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600">Submit your first banner media using the form above.</p>
            </div>
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
                      </div>

                      <div className="mb-2">
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

                      {submission.description && (
                        <p className="text-sm text-gray-700 mb-2">{submission.description}</p>
                      )}

                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(submission.created_at).toLocaleDateString()}
                      </p>

                      {submission.admin_notes && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Admin feedback:</strong> {submission.admin_notes}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {submission.submission_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSubmission(submission.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};