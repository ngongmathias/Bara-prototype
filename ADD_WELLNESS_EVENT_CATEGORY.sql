-- Add Wellness category to event_categories table
-- Run this in Supabase SQL Editor

INSERT INTO event_categories (name, slug, description, icon, color, is_active, display_order)
VALUES (
  'Wellness',
  'wellness',
  'Wellness, yoga, meditation, and mindfulness events',
  '🧘',
  '#10B981',
  true,
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active;
