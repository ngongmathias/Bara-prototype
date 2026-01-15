-- Fix Blog RLS Policies for Clerk Authentication
-- Drop existing policies and create new simplified ones

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can insert posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations on posts" ON blog_posts;

DROP POLICY IF EXISTS "Anyone can view categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Public can access categories" ON blog_categories;

DROP POLICY IF EXISTS "Anyone can view authors" ON blog_authors;
DROP POLICY IF EXISTS "Users can create author profile" ON blog_authors;
DROP POLICY IF EXISTS "Users can update own author profile" ON blog_authors;
DROP POLICY IF EXISTS "Admins can delete authors" ON blog_authors;
DROP POLICY IF EXISTS "Public can access authors" ON blog_authors;

DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow all operations on comments" ON blog_comments;

DROP POLICY IF EXISTS "Public can access comment likes" ON blog_comment_likes;

DROP POLICY IF EXISTS "Public can access bookmarks" ON blog_bookmarks;

DROP POLICY IF EXISTS "Public can access subscriptions" ON blog_subscriptions;

-- Ensure RLS is enabled
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies for Clerk auth

-- Blog Posts: Public can read published, all operations allowed (Clerk handles auth)
CREATE POLICY "blog_posts_select_published"
ON blog_posts FOR SELECT
USING (status = 'published');

CREATE POLICY "blog_posts_all_operations"
ON blog_posts FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Categories: Allow all operations
CREATE POLICY "blog_categories_all"
ON blog_categories FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Authors: Allow all operations
CREATE POLICY "blog_authors_all"
ON blog_authors FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Comments: Public can read approved, all operations allowed
CREATE POLICY "blog_comments_select_approved"
ON blog_comments FOR SELECT
USING (is_approved = true);

CREATE POLICY "blog_comments_all_operations"
ON blog_comments FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Comment Likes: Allow all operations
CREATE POLICY "blog_comment_likes_all"
ON blog_comment_likes FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Bookmarks: Allow all operations
CREATE POLICY "blog_bookmarks_all"
ON blog_bookmarks FOR ALL
USING (true)
WITH CHECK (true);

-- Blog Subscriptions: Allow all operations
CREATE POLICY "blog_subscriptions_all"
ON blog_subscriptions FOR ALL
USING (true)
WITH CHECK (true);
