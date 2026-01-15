-- Add missing event categories to BARA Events
-- Run this in Supabase SQL Editor

-- Theatre & Performing Arts
INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Theatre',
  'theatre',
  'Theatre performances and stage shows',
  '🎭',
  '#9333EA',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Film Screening',
  'film-screening',
  'Film screenings and movie premieres',
  '🎬',
  '#DC2626',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Movie/Cinema',
  'movie-cinema',
  'Cinema releases and movie events',
  '🎥',
  '#EF4444',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Art Exhibition/Gallery',
  'art-exhibition',
  'Art exhibitions and gallery openings',
  '🎨',
  '#F59E0B',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Museum/Exhibition',
  'museum-exhibition',
  'Museum exhibitions and cultural displays',
  '🏛️',
  '#8B5CF6',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Ballet/Dance Performance',
  'ballet-dance',
  'Ballet and dance performances',
  '💃',
  '#EC4899',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Opera',
  'opera',
  'Opera performances and classical music',
  '🎼',
  '#7C3AED',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Book Signing/Reading',
  'book-signing',
  'Book signings and author readings',
  '📚',
  '#0891B2',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Cultural Festival',
  'cultural-festival',
  'Cultural festivals and heritage celebrations',
  '🎊',
  '#D97706',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

-- Entertainment
INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Comedy',
  'comedy',
  'Comedy shows and stand-up performances',
  '😂',
  '#F59E0B',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Gaming',
  'gaming',
  'Gaming events, eSports tournaments, and board game conventions',
  '🎮',
  '#8B5CF6',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Festival (Music)',
  'festival-music',
  'Music festivals and concert series',
  '🎵',
  '#EC4899',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Festival (Food)',
  'festival-food',
  'Food festivals and culinary events',
  '🍽️',
  '#F97316',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Festival (General)',
  'festival-general',
  'General festivals and community celebrations',
  '🎉',
  '#10B981',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Circus',
  'circus',
  'Circus performances and acrobatic shows',
  '🎪',
  '#DC2626',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Magic Show',
  'magic-show',
  'Magic shows and illusion performances',
  '🪄',
  '#6366F1',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

-- Outdoor & Sports
INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Outdoors',
  'outdoors',
  'Outdoor activities and nature events',
  '🏞️',
  '#059669',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Hiking',
  'hiking',
  'Hiking trips and mountain treks',
  '🥾',
  '#16A34A',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Marathon/Running Race',
  'marathon-running',
  'Marathons, running races, and athletic competitions',
  '🏃',
  '#DC2626',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Fitness Class',
  'fitness-class',
  'Fitness classes and workout sessions',
  '💪',
  '#EF4444',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Camping',
  'camping',
  'Camping trips and outdoor adventures',
  '⛺',
  '#15803D',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Water Sports',
  'water-sports',
  'Water sports and aquatic activities',
  '🏄',
  '#0EA5E9',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Sailing',
  'sailing',
  'Sailing events and regattas',
  '⛵',
  '#0284C7',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Equestrian',
  'equestrian',
  'Horse riding and equestrian events',
  '🐴',
  '#92400E',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

-- Professional & Formal Events
INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Conference',
  'conference',
  'Professional conferences and seminars',
  '🎤',
  '#1E40AF',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Trade Show',
  'trade-show',
  'Trade shows and industry exhibitions',
  '🏢',
  '#0F766E',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Gala/Formal Dinner',
  'gala-formal-dinner',
  'Gala events and formal dinners',
  '🍷',
  '#7C2D12',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;

INSERT INTO event_categories (name, slug, description, icon, color, is_active, sort_order)
VALUES (
  'Awards Show',
  'awards-show',
  'Awards ceremonies and recognition events',
  '🏆',
  '#CA8A04',
  true,
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_categories)
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, color = EXCLUDED.color, is_active = EXCLUDED.is_active;
