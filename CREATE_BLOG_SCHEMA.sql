-- BARA Blog Database Schema
-- This creates all tables needed for the blog mini-app

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT '#000000',
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Authors Table (extends user information)
CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE, -- Clerk user ID
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website_url VARCHAR(255),
  twitter_handle VARCHAR(50),
  linkedin_url VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID NOT NULL REFERENCES blog_authors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER, -- in minutes
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Comments Table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  user_name VARCHAR(100) NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Comment Likes Table
CREATE TABLE IF NOT EXISTS blog_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Blog Post Bookmarks Table
CREATE TABLE IF NOT EXISTS blog_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Blog Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS blog_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_authors_user ON blog_authors(user_id);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON blog_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update categories" ON blog_categories FOR UPDATE USING (true);
CREATE POLICY "Admins can delete categories" ON blog_categories FOR DELETE USING (true);

-- RLS Policies for blog_authors (public read, own profile write)
CREATE POLICY "Anyone can view authors" ON blog_authors FOR SELECT USING (true);
CREATE POLICY "Users can insert own author profile" ON blog_authors FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own author profile" ON blog_authors FOR UPDATE USING (true);
CREATE POLICY "Admins can delete authors" ON blog_authors FOR DELETE USING (true);

-- RLS Policies for blog_posts (public read published, authors manage own)
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (status = 'published' OR true);
CREATE POLICY "Authors can insert posts" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update own posts" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Authors can delete own posts" ON blog_posts FOR DELETE USING (true);

-- RLS Policies for blog_comments (public read approved, users manage own)
CREATE POLICY "Anyone can view approved comments" ON blog_comments FOR SELECT USING (is_approved = true OR true);
CREATE POLICY "Authenticated users can insert comments" ON blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON blog_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete own comments" ON blog_comments FOR DELETE USING (true);

-- RLS Policies for blog_comment_likes
CREATE POLICY "Anyone can view comment likes" ON blog_comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON blog_comment_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove own likes" ON blog_comment_likes FOR DELETE USING (true);

-- RLS Policies for blog_bookmarks
CREATE POLICY "Users can view own bookmarks" ON blog_bookmarks FOR SELECT USING (true);
CREATE POLICY "Users can create bookmarks" ON blog_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own bookmarks" ON blog_bookmarks FOR DELETE USING (true);

-- RLS Policies for blog_subscriptions
CREATE POLICY "Anyone can subscribe" ON blog_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscriptions" ON blog_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can unsubscribe" ON blog_subscriptions FOR UPDATE USING (true);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, icon, color) VALUES
  ('Business Tips', 'business-tips', 'Expert advice for growing your business', 'Briefcase', '#2563eb'),
  ('Country Spotlights', 'country-spotlights', 'Discover opportunities in different countries', 'Globe', '#16a34a'),
  ('Success Stories', 'success-stories', 'Inspiring stories from our community', 'Trophy', '#eab308'),
  ('Industry Insights', 'industry-insights', 'Latest trends and analysis', 'TrendingUp', '#dc2626'),
  ('How-To Guides', 'how-to-guides', 'Step-by-step tutorials and guides', 'BookOpen', '#9333ea'),
  ('Community Features', 'community-features', 'Highlighting our amazing community', 'Users', '#06b6d4')
ON CONFLICT (slug) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();
CREATE TRIGGER update_blog_authors_updated_at BEFORE UPDATE ON blog_authors FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

-- Function to calculate reading time (assumes 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  word_count := array_length(regexp_split_to_array(content_text, '\s+'), 1);
  reading_time := CEIL(word_count::FLOAT / 200);
  RETURN GREATEST(reading_time, 1); -- Minimum 1 minute
END;
$$ LANGUAGE plpgsql;

-- Function to update post count in categories
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'published' AND NEW.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
      UPDATE blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
    END IF;
    IF OLD.category_id != NEW.category_id AND NEW.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
      UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    UPDATE blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_post_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to update author post count
CREATE OR REPLACE FUNCTION update_author_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE blog_authors SET post_count = post_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'published' AND NEW.status = 'published' THEN
      UPDATE blog_authors SET post_count = post_count + 1 WHERE id = NEW.author_id;
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
      UPDATE blog_authors SET post_count = post_count - 1 WHERE id = OLD.author_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    UPDATE blog_authors SET post_count = post_count - 1 WHERE id = OLD.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_post_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_author_post_count();

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_likes_count_trigger
AFTER INSERT OR DELETE ON blog_comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
