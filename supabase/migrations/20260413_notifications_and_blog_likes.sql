-- ============================================================
-- Phase 16.4.3: notifications table + RLS
-- Active Work #6: blog_post_likes table (replace localStorage)
-- April 13, 2026
-- ============================================================

-- ─── NOTIFICATIONS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role / edge functions can insert notifications for any user
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- ─── BLOG POST LIKES TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post_id ON public.blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user_id ON public.blog_post_likes(user_id);

-- Enable RLS
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes (for count display)
CREATE POLICY "Anyone can read blog post likes"
  ON public.blog_post_likes FOR SELECT
  USING (true);

-- Authenticated users can like posts
CREATE POLICY "Users can insert own blog post likes"
  ON public.blog_post_likes FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can unlike (delete) their own likes
CREATE POLICY "Users can delete own blog post likes"
  ON public.blog_post_likes FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Add likes_count column to blog_posts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Function to update likes_count on blog_posts when likes change
CREATE OR REPLACE FUNCTION public.update_blog_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update likes_count
DROP TRIGGER IF EXISTS trigger_update_blog_post_likes_count ON public.blog_post_likes;
CREATE TRIGGER trigger_update_blog_post_likes_count
  AFTER INSERT OR DELETE ON public.blog_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_post_likes_count();

-- RPC for atomic view-count increment (referenced by blogService.incrementViewCount)
CREATE OR REPLACE FUNCTION public.increment_blog_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_blog_post_views(UUID) TO anon, authenticated;
