-- Temporarily disable RLS on blog tables to test if that's the issue
-- This will help us determine if the problem is RLS or API authentication

ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comment_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscriptions DISABLE ROW LEVEL SECURITY;
