-- Check RLS status and policies for blog tables

-- Check if RLS is enabled on blog tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN (
    'blog_posts',
    'blog_categories', 
    'blog_authors',
    'blog_comments',
    'blog_comment_likes',
    'blog_bookmarks',
    'blog_subscriptions'
)
ORDER BY tablename;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN (
    'blog_posts',
    'blog_categories',
    'blog_authors', 
    'blog_comments',
    'blog_comment_likes',
    'blog_bookmarks',
    'blog_subscriptions'
)
ORDER BY tablename, policyname;
