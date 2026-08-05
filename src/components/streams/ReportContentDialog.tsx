import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { X, Flag, Loader2 } from 'lucide-react';

export type ReportEntityType = 'song' | 'album' | 'artist' | 'playlist';

interface Props {
  open: boolean;
  onClose: () => void;
  entityType: ReportEntityType;
  entityId: string;
  entityName: string;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Something else' },
];

/**
 * §F1 — the in-app "Report" action for songs/albums/artists/playlists.
 * Requires sign-in (reduces spam); anonymous copyright claims have their
 * own dedicated no-login DMCA form (§F2, /dmca) linked from here.
 */
export const ReportContentDialog = ({ open, onClose, entityType, entityId, entityName }: Props) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [category, setCategory] = useState('inappropriate');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const reset = () => {
    setCategory('inappropriate');
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  const submit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('content_report_submit', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_category: category,
        p_description: description.trim() || null,
        p_reporter_user_id: user.id,
        p_reporter_email: user.primaryEmailAddress?.emailAddress || null,
      });
      const result = data as { success: boolean; error?: string };
      if (error || !result?.success) throw new Error(result?.error || error?.message || 'Failed to submit report');
      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Couldn't submit report", description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={reset}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Flag size={18} /> Report
          </h2>
          <button onClick={reset} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X size={22} /></button>
        </div>

        <div className="p-5 space-y-4">
          {submitted ? (
            <p className="text-sm text-gray-700">
              Thanks — your report on "{entityName}" has been sent to our moderation team for review.
            </p>
          ) : !user?.id ? (
            <p className="text-sm text-gray-600">
              Sign in to report content. If this is a copyright issue, you can file a{' '}
              <Link to="/dmca" className="underline font-bold text-gray-900">DMCA claim</Link> without an account.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Reporting</label>
                <p className="text-sm text-gray-900 font-medium truncate">{entityName}</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Reason</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {category === 'copyright' && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    For a formal copyright takedown, use the <Link to="/dmca" className="underline">DMCA form</Link> instead — it goes to the same queue with the legal details we need.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Details (optional)</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 min-h-[80px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Anything that helps our team review this."
                />
              </div>
              <p className="text-[11px] text-gray-400">
                See our <Link to="/streams/guidelines" className="underline">content guidelines</Link> for what's allowed on Bara Streams.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={reset} className="px-4 py-2.5 rounded-md text-gray-700 font-bold hover:bg-gray-100">
            {submitted ? 'Close' : 'Cancel'}
          </button>
          {!submitted && user?.id && (
            <button
              onClick={submit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-md bg-gray-900 text-white font-black hover:bg-black disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
              Submit report
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
