-- Fix: blog_post_likes was created with RLS policies but no table-level
-- GRANTs to anon/authenticated, causing PostgREST to reject all requests
-- with 401 / "permission denied for table blog_post_likes" (code 42501).

GRANT SELECT, INSERT, DELETE ON public.blog_post_likes TO anon, authenticated;
