import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface ReportAdButtonProps {
  listingId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ReportAdButton = ({ listingId, className, variant = 'outline', size = 'sm' }: ReportAdButtonProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      navigate('/user/sign-in');
      return;
    }

    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please select a reason',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('marketplace_reports')
        .insert({
          listing_id: listingId,
          reported_by: user.id,
          reason,
          description,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping keep our marketplace safe. We will review this report shortly.',
      });

      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Flag className="w-4 h-4 mr-2" />
        Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report This Ad</DialogTitle>
            <DialogDescription>
              Help us maintain a safe marketplace by reporting suspicious or inappropriate ads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason" className="mt-1">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scam">Scam or Fraud</SelectItem>
                  <SelectItem value="fake">Fake or Misleading</SelectItem>
                  <SelectItem value="prohibited">Prohibited Item</SelectItem>
                  <SelectItem value="spam">Spam or Duplicate</SelectItem>
                  <SelectItem value="offensive">Offensive Content</SelectItem>
                  <SelectItem value="wrong_category">Wrong Category</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more information about why you're reporting this ad..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
