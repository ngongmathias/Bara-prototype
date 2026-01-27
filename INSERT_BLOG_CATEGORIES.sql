-- Insert Blog Categories (Alphabetically Sorted)
-- This script adds all blog categories for the BARA Blog system

INSERT INTO blog_categories (name, slug, description, color, post_count)
VALUES 
  ('Agriculture & Livestock', 'agriculture-livestock', 'Articles about farming, agriculture, and livestock management', '#10B981', 0),
  ('Art', 'art', 'Creative arts, visual arts, and artistic expression', '#F59E0B', 0),
  ('Automotive', 'automotive', 'Cars, vehicles, and automotive industry news', '#EF4444', 0),
  ('Beauty', 'beauty', 'Beauty tips, cosmetics, and personal care', '#EC4899', 0),
  ('Business & Finance', 'business-finance', 'Business strategies, finance, and entrepreneurship', '#3B82F6', 0),
  ('Education', 'education', 'Learning, education, and academic topics', '#8B5CF6', 0),
  ('Events', 'events', 'Event coverage, announcements, and highlights', '#F97316', 0),
  ('Family', 'family', 'Family life, parenting, and relationships', '#06B6D4', 0),
  ('Fashion', 'fashion', 'Fashion trends, style, and clothing', '#DB2777', 0),
  ('Fitness', 'fitness', 'Exercise, fitness routines, and physical health', '#14B8A6', 0),
  ('Food & Drink', 'food-drink', 'Recipes, restaurants, and culinary experiences', '#F59E0B', 0),
  ('Gaming', 'gaming', 'Video games, gaming culture, and esports', '#8B5CF6', 0),
  ('Health', 'health', 'Health tips, medical information, and healthcare', '#EF4444', 0),
  ('Hotels & Hospitality', 'hotels-hospitality', 'Hotels, hospitality industry, and accommodation', '#06B6D4', 0),
  ('Leadership & Governance', 'leadership-governance', 'Leadership principles, governance, and management', '#6366F1', 0),
  ('Marketplace', 'marketplace', 'E-commerce, online marketplaces, and trading', '#10B981', 0),
  ('Mining & Minerals', 'mining-minerals', 'Mining industry, minerals, and natural resources', '#78716C', 0),
  ('Nature & Environment', 'nature-environment', 'Environmental issues, nature, and conservation', '#22C55E', 0),
  ('Opportunities & Jobs', 'opportunities-jobs', 'Job opportunities, career advice, and employment', '#3B82F6', 0),
  ('Performing Arts', 'performing-arts', 'Theater, dance, music, and live performances', '#A855F7', 0),
  ('Personal Finance & Investing', 'personal-finance-investing', 'Personal finance, investing, and wealth management', '#059669', 0),
  ('Pets', 'pets', 'Pet care, animal companions, and pet-related topics', '#F97316', 0),
  ('Property & Construction', 'property-construction', 'Real estate, construction, and property development', '#DC2626', 0),
  ('Relationships', 'relationships', 'Dating, relationships, and interpersonal connections', '#EC4899', 0),
  ('Self-Improvement', 'self-improvement', 'Personal development, growth, and self-help', '#8B5CF6', 0),
  ('Services', 'services', 'Service industries and professional services', '#0EA5E9', 0),
  ('Sounds', 'sounds', 'Music, audio, and sound-related content', '#F59E0B', 0),
  ('Sports', 'sports', 'Sports news, athletics, and sporting events', '#EF4444', 0),
  ('Technology & Innovation', 'technology-innovation', 'Tech news, innovation, and digital transformation', '#6366F1', 0),
  ('Tourism & Travel', 'tourism-travel', 'Travel destinations, tourism, and travel tips', '#14B8A6', 0),
  ('Wellness', 'wellness', 'Mental health, wellness, and holistic well-being', '#10B981', 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  updated_at = NOW();
