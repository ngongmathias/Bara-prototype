-- Enable Row Level Security for Blog Tables (Clerk Auth Version)
-- Since we use Clerk (not Supabase Auth), we'll use simpler policies

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

-- Allow all authenticated operations (Clerk handles auth on frontend)
CREATE POLICY "Allow all operations on posts"
ON blog_posts FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Categories Policies
-- Allow everyone to read and write categories
CREATE POLICY "Public can access categories"
ON blog_categories FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Authors Policies
-- Allow everyone to read and write author profiles
CREATE POLICY "Public can access authors"
ON blog_authors FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Comments Policies
-- Allow everyone to read approved comments
CREATE POLICY "Public can view approved comments"
ON blog_comments FOR SELECT
USING (status = 'approved');

-- Allow all operations on comments (Clerk handles auth)
CREATE POLICY "Allow all operations on comments"
ON blog_comments FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Comment Likes Policies
-- Allow all operations
CREATE POLICY "Public can access comment likes"
ON blog_comment_likes FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Bookmarks Policies
-- Allow all operations
CREATE POLICY "Public can access bookmarks"
ON blog_bookmarks FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Subscriptions Policies
-- Allow all operations
CREATE POLICY "Public can access subscriptions"
ON blog_subscriptions FOR ALL
USING (true)
WITH CHECK (true);
