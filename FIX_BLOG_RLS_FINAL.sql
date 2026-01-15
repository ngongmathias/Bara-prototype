-- Final Fix: Allow anonymous public access to blog content
-- Drop all existing policies and create permissive ones

-- Drop all existing policies
DROP POLICY IF EXISTS "blog_posts_select_published" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_all_operations" ON blog_posts;
DROP POLICY IF EXISTS "blog_categories_all" ON blog_categories;
DROP POLICY IF EXISTS "blog_authors_all" ON blog_authors;
DROP POLICY IF EXISTS "blog_comments_select_approved" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_all_operations" ON blog_comments;
DROP POLICY IF EXISTS "blog_comment_likes_all" ON blog_comment_likes;
DROP POLICY IF EXISTS "blog_bookmarks_all" ON blog_bookmarks;
DROP POLICY IF EXISTS "blog_subscriptions_all" ON blog_subscriptions;

-- Create new permissive policies that allow anonymous access

-- Blog Posts: Allow everyone to read and write
CREATE POLICY "blog_posts_public_access"
ON blog_posts FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Blog Categories: Allow everyone to read and write
CREATE POLICY "blog_categories_public_access"
ON blog_categories FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Blog Authors: Allow everyone to read and write
CREATE POLICY "blog_authors_public_access"
ON blog_authors FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Blog Comments: Allow everyone to read and write
CREATE POLICY "blog_comments_public_access"
ON blog_comments FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Blog Comment Likes: Allow everyone to read and write
CREATE POLICY "blog_comment_likes_public_access"
ON blog_comment_likes FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Blog Bookmarks: Allow everyone to read and write
CREATE POLICY "blog_bookmarks_public_access"
ON blog_bookmarks FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Blog Subscriptions: Allow everyone to read and write
CREATE POLICY "blog_subscriptions_public_access"
ON blog_subscriptions FOR ALL
TO public
USING (true)
WITH CHECK (true);
