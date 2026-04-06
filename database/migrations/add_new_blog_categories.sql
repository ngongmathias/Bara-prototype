-- Add New Blog Categories
-- Requested by the team to expand the blog category options.
-- These 22 categories are net-new after deduplication against existing categories.
-- Uses INSERT ... ON CONFLICT (slug) DO UPDATE SET to be safely re-runnable.

INSERT INTO blog_categories (id, name, slug, description, color, post_count)
VALUES
  (gen_random_uuid(), 'Lifestyle', 'lifestyle', 'Everyday lifestyle tips, trends, and inspiration', '#F472B6', 0),
  (gen_random_uuid(), 'Personal Development', 'personal-development', 'Growth mindset, habits, and personal development strategies', '#818CF8', 0),
  (gen_random_uuid(), 'Health & Fitness', 'health-fitness', 'Holistic health and fitness advice, routines, and wellness tips', '#34D399', 0),
  (gen_random_uuid(), 'Parenting', 'parenting', 'Parenting advice, child development, and family well-being', '#FB923C', 0),
  (gen_random_uuid(), 'DIY & Crafts', 'diy-crafts', 'Do-it-yourself projects, crafts, and creative hands-on ideas', '#A78BFA', 0),
  (gen_random_uuid(), 'Development', 'development', 'Software development, coding, and programming topics', '#60A5FA', 0),
  (gen_random_uuid(), 'Professional', 'professional', 'Career growth, workplace skills, and professional life', '#475569', 0),
  (gen_random_uuid(), 'Digital Marketing', 'digital-marketing', 'Online marketing strategies, SEO, social media, and branding', '#38BDF8', 0),
  (gen_random_uuid(), 'Art & Design', 'art-design', 'Visual arts, graphic design, and creative design thinking', '#FBBF24', 0),
  (gen_random_uuid(), 'Home & Interior Design', 'home-interior-design', 'Home decor, interior design ideas, and living spaces', '#F87171', 0),
  (gen_random_uuid(), 'Sustainability / Eco-Living', 'sustainability-eco-living', 'Sustainable living, eco-friendly practices, and green initiatives', '#4ADE80', 0),
  (gen_random_uuid(), 'Education & Coaching', 'education-coaching', 'Educational strategies, coaching techniques, and mentorship', '#C084FC', 0),
  (gen_random_uuid(), 'Opinion', 'opinion', 'Opinion pieces, editorials, and thought-provoking commentary', '#94A3B8', 0),
  (gen_random_uuid(), 'News', 'news', 'Breaking news, current events, and timely updates', '#EF4444', 0),
  (gen_random_uuid(), 'Reviews & Comparisons', 'reviews-comparisons', 'Product reviews, service comparisons, and buying guides', '#F59E0B', 0),
  (gen_random_uuid(), 'Interviews & Profiles', 'interviews-profiles', 'Interviews, personality profiles, and spotlight features', '#8B5CF6', 0),
  (gen_random_uuid(), 'Case Studies', 'case-studies', 'In-depth case studies, success stories, and lessons learned', '#0EA5E9', 0),
  (gen_random_uuid(), 'Behind the Scenes', 'behind-the-scenes', 'Behind-the-scenes looks at projects, teams, and processes', '#6366F1', 0),
  (gen_random_uuid(), 'Spirituality', 'spirituality', 'Spiritual growth, mindfulness, and faith-based topics', '#D946EF', 0),
  (gen_random_uuid(), 'Love', 'love', 'Love stories, romantic advice, and matters of the heart', '#EC4899', 0),
  (gen_random_uuid(), 'Other', 'other', 'Miscellaneous topics that don''t fit other categories', '#9CA3AF', 0),
  (gen_random_uuid(), 'Creativity', 'creativity', 'Creative thinking, artistic expression, and imaginative ideas', '#FB7185', 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  updated_at = NOW();
