import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { MessageCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Comment {
  id: string;
  listing_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  is_seller_response: boolean;
  created_at: string;
  replies?: Comment[];
}

interface QASectionProps {
  listingId: string;
  sellerId?: string;
}

export const QASection: React.FC<QASectionProps> = ({ listingId, sellerId }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('marketplace_listing_comments')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    const all = (data || []) as Comment[];

    // Build threaded structure: top-level questions + their replies
    const topLevel = all.filter((c) => !c.parent_id);
    const replies = all.filter((c) => c.parent_id);

    const threaded = topLevel.map((q) => ({
      ...q,
      replies: replies
        .filter((r) => r.parent_id === q.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));

    setComments(threaded);
    setLoading(false);
  }, [listingId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostQuestion = async () => {
    if (!user) {
      toast({ title: 'Please sign in to ask a question', variant: 'destructive' });
      return;
    }
    if (!question.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('marketplace_listing_comments').insert({
      listing_id: listingId,
      user_id: user.id,
      body: question.trim(),
      is_seller_response: user.id === sellerId,
    });

    if (error) {
      toast({ title: 'Failed to post question', variant: 'destructive' });
    } else {
      setQuestion('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const handlePostReply = async (parentId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to reply', variant: 'destructive' });
      return;
    }
    if (!replyText.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('marketplace_listing_comments').insert({
      listing_id: listingId,
      user_id: user.id,
      parent_id: parentId,
      body: replyText.trim(),
      is_seller_response: user.id === sellerId,
    });

    if (error) {
      toast({ title: 'Failed to post reply', variant: 'destructive' });
    } else {
      setReplyTo(null);
      setReplyText('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) return null;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 font-comfortaa">
        Questions & Answers
      </h2>

      {/* Ask question */}
      {user && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Ask a question about this item..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostQuestion();
              }
            }}
          />
          <Button onClick={handlePostQuestion} disabled={submitting || !question.trim()} size="sm">
            Ask
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-sm text-gray-500 mb-6">Sign in to ask a question.</p>
      )}

      {/* Q&A List */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No questions yet. Be the first to ask!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((q) => (
            <div key={q.id} className="space-y-2">
              {/* Question */}
              <div className="flex gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  Q
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{q.body}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{timeAgo(q.created_at)}</span>
                    {q.is_seller_response && (
                      <span className="flex items-center gap-1 text-indigo-600">
                        <Store className="w-3 h-3" /> Seller
                      </span>
                    )}
                    {user && (
                      <button
                        onClick={() => {
                          setReplyTo(replyTo === q.id ? null : q.id);
                          setReplyText('');
                        }}
                        className="hover:text-gray-700"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {q.replies && q.replies.length > 0 && (
                <div className="ml-8 space-y-2">
                  {q.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                          reply.is_seller_response
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{reply.body}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{timeAgo(reply.created_at)}</span>
                          {reply.is_seller_response && (
                            <span className="flex items-center gap-1 text-indigo-600">
                              <Store className="w-3 h-3" /> Seller
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyTo === q.id && (
                <div className="ml-8 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    maxLength={500}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostReply(q.id);
                      }
                    }}
                  />
                  <Button
                    onClick={() => handlePostReply(q.id)}
                    disabled={submitting || !replyText.trim()}
                    size="sm"
                    variant="outline"
                  >
                    Reply
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QASection;
