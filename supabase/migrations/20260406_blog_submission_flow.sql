-- Blog submission/review flow
-- Adds pending_review + declined statuses and decline_reason column

-- 1. Drop old check constraint on blog_posts.status
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_status_check;

-- 2. Add new check constraint that includes the two new statuses
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_status_check
  CHECK (status IN ('draft', 'published', 'scheduled', 'archived', 'pending_review', 'declined'));

-- 3. Add decline_reason column (nullable — only populated when status = 'declined')
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS decline_reason TEXT;
