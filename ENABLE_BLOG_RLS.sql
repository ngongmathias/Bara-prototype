-- Enable Row Level Security for Blog Tables
-- This allows public read access to published blog content

-- Enable RLS on all blog tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscriptions ENABLE ROW LEVEL SECURITY;

-- Blog Posts Policies
-- Allow public to read published posts
CREATE POLICY "Public can view published posts"
ON blog_posts FOR SELECT
USING (status = 'published');

-- Allow authenticated users to view their own drafts
CREATE POLICY "Authors can view their own posts"
ON blog_posts FOR SELECT
USING (author_id = (auth.uid())::text);

-- Allow authors to insert their own posts
CREATE POLICY "Authors can create posts"
ON blog_posts FOR INSERT
WITH CHECK (author_id = (auth.uid())::text);

-- Allow authors to update their own posts
CREATE POLICY "Authors can update their own posts"
ON blog_posts FOR UPDATE
USING (author_id = (auth.uid())::text);

-- Allow authors to delete their own posts
CREATE POLICY "Authors can delete their own posts"
ON blog_posts FOR DELETE
USING (author_id = (auth.uid())::text);

-- Blog Categories Policies
-- Allow everyone to read categories
CREATE POLICY "Public can view categories"
ON blog_categories FOR SELECT
USING (true);

-- Blog Authors Policies
-- Allow everyone to read author profiles
CREATE POLICY "Public can view authors"
ON blog_authors FOR SELECT
USING (true);

-- Allow users to create their own author profile
CREATE POLICY "Users can create their author profile"
ON blog_authors FOR INSERT
WITH CHECK (user_id = (auth.uid())::text);

-- Allow users to update their own author profile
CREATE POLICY "Users can update their author profile"
ON blog_authors FOR UPDATE
USING (user_id = (auth.uid())::text);

-- Blog Comments Policies
-- Allow everyone to read approved comments
CREATE POLICY "Public can view approved comments"
ON blog_comments FOR SELECT
USING (status = 'approved');

-- Allow authenticated users to view their own comments (even if pending)
CREATE POLICY "Users can view their own comments"
ON blog_comments FOR SELECT
USING (user_id = (auth.uid())::text);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
ON blog_comments FOR INSERT
WITH CHECK (user_id = (auth.uid())::text);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON blog_comments FOR UPDATE
USING (user_id = (auth.uid())::text);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON blog_comments FOR DELETE
USING (user_id = (auth.uid())::text);

-- Blog Comment Likes Policies
-- Allow everyone to read comment likes
CREATE POLICY "Public can view comment likes"
ON blog_comment_likes FOR SELECT
USING (true);

-- Allow authenticated users to like comments
CREATE POLICY "Authenticated users can like comments"
ON blog_comment_likes FOR INSERT
WITH CHECK (user_id = (auth.uid())::text);

-- Allow users to unlike their own likes
CREATE POLICY "Users can remove their likes"
ON blog_comment_likes FOR DELETE
USING (user_id = (auth.uid())::text);

-- Blog Bookmarks Policies
-- Allow users to view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON blog_bookmarks FOR SELECT
USING (user_id = (auth.uid())::text);

-- Allow users to create bookmarks
CREATE POLICY "Users can create bookmarks"
ON blog_bookmarks FOR INSERT
WITH CHECK (user_id = (auth.uid())::text);

-- Allow users to delete their own bookmarks
CREATE POLICY "Users can delete their bookmarks"
ON blog_bookmarks FOR DELETE
USING (user_id = (auth.uid())::text);

-- Blog Subscriptions Policies
-- Allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON blog_subscriptions FOR SELECT
USING (user_id = (auth.uid())::text OR user_id IS NULL);

-- Allow anyone to subscribe (including anonymous via email)
CREATE POLICY "Anyone can subscribe"
ON blog_subscriptions FOR INSERT
WITH CHECK (true);

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update their subscriptions"
ON blog_subscriptions FOR UPDATE
USING (user_id = (auth.uid())::text OR user_id IS NULL);

-- Allow users to unsubscribe
CREATE POLICY "Users can unsubscribe"
ON blog_subscriptions FOR DELETE
USING (user_id = (auth.uid())::text OR user_id IS NULL);
