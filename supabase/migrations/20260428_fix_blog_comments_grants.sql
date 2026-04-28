-- Fix: blog_comments (and sibling blog tables) were created via CREATE_BLOG_SCHEMA.sql
-- at the repo root (not in supabase/migrations/), and the GRANT_BLOG_PERMISSIONS.sql
-- + FIX_BLOG_RLS_FINAL.sql files that made the tables writable were never wired
-- into the migration pipeline. Production therefore returns
--   "permission denied for table blog_comments" (42501)
-- to PostgREST when public users try to POST a comment, before RLS is even evaluated.
--
-- Symptom (reported by Marlon's friend, ~Apr 23, 2026):
--   "tried to leave a comment on a Blog but was not able to do so due to permissions"
--
-- Same root-cause pattern as 20260413_fix_blog_post_likes_grants.sql.
--
-- This migration is idempotent: it can be re-applied safely. It does two things:
--   (a) GRANT the missing table privileges to anon + authenticated roles
--   (b) Re-assert permissive RLS policies for blog_comments and the immediate
--       siblings the comment flow touches (blog_comment_likes for like buttons),
--       matching what FIX_BLOG_RLS_FINAL.sql intended.
--
-- Scope deliberately narrow: blog_comments + blog_comment_likes only. Other blog
-- tables (blog_posts, blog_authors, blog_categories, blog_bookmarks,
-- blog_subscriptions) are not modified here — if they need the same fix, do it
-- separately so each rollout is small and reviewable.
--
-- Follow-up (tracked in MASTER_PLAN.md / Phase 25): harden these policies to
-- require a valid Clerk JWT (auth.jwt() ->> 'sub' = user_id) instead of leaving
-- them wide-open. That requires switching blogService comment writes to a
-- Clerk-authenticated supabase client and is a non-trivial change. Not part of
-- this hotfix.

-- (a) Privileges -----------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments       TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comment_likes  TO anon, authenticated;

-- Sequences are not strictly needed (UUID PKs default to gen_random_uuid()),
-- but granting USAGE is harmless and matches the prior fix's style.
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- (b) RLS ------------------------------------------------------------------

ALTER TABLE public.blog_comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comment_likes ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies under the names we are about to (re)create,
-- plus the legacy names from FIX_BLOG_RLS_FINAL.sql / earlier files, so the
-- end state is unambiguous regardless of what was on the database before.
DROP POLICY IF EXISTS "blog_comments_public_access"        ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_select_approved"      ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_all_operations"       ON public.blog_comments;

DROP POLICY IF EXISTS "blog_comment_likes_public_access"   ON public.blog_comment_likes;
DROP POLICY IF EXISTS "blog_comment_likes_all"             ON public.blog_comment_likes;

CREATE POLICY "blog_comments_public_access"
  ON public.blog_comments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "blog_comment_likes_public_access"
  ON public.blog_comment_likes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
