-- Migration: Add submission workflow fields to blog_posts
-- Run this in Supabase SQL Editor
-- Fixes: status CHECK constraint missing 'pending_review' and 'declined'
--        decline_reason column missing

-- Step 1: Drop the old status CHECK constraint
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;

-- Step 2: Re-add the constraint with all required statuses
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_status_check
  CHECK (status IN ('draft', 'published', 'scheduled', 'archived', 'pending_review', 'declined'));

-- Step 3: Add the decline_reason column (nullable — only set when admin declines)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS decline_reason TEXT;
