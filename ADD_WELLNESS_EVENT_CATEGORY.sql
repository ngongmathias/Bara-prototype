-- Add Wellness category to event_categories table
-- Run this in Supabase SQL Editor

INSERT INTO event_categories (name, slug, is_active)
VALUES (
  'Wellness',
  'wellness',
  true
)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;
