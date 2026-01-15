-- Grant permissions to anon and authenticated roles for blog tables
-- This fixes the 401 Unauthorized errors

-- Grant SELECT, INSERT, UPDATE, DELETE to anon role (public access)
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_authors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comment_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_bookmarks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_subscriptions TO anon;

-- Grant SELECT, INSERT, UPDATE, DELETE to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_authors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comment_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_subscriptions TO authenticated;

-- Grant USAGE on sequences (for auto-incrementing IDs if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
