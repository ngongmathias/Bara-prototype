-- blog_bookmarks: referenced by blogService.toggleBookmark / isBookmarked /
-- getUserBookmarks, but never defined by a prior migration. PostgREST was
-- returning 406 Not Acceptable on every read.

CREATE TABLE IF NOT EXISTS public.blog_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_post_id ON public.blog_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_user_id ON public.blog_bookmarks(user_id);

ALTER TABLE public.blog_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog bookmarks"
  ON public.blog_bookmarks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own blog bookmarks"
  ON public.blog_bookmarks FOR INSERT
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "Users can delete own blog bookmarks"
  ON public.blog_bookmarks FOR DELETE
  USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

GRANT SELECT, INSERT, DELETE ON public.blog_bookmarks TO anon, authenticated;
