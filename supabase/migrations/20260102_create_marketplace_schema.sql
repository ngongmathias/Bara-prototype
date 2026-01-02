-- BARA Marketplace Schema
-- Complete database structure for Dubizzle-style marketplace

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON marketplace_categories(slug);
CREATE INDEX idx_categories_active ON marketplace_categories(is_active);

-- ============================================
-- SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE marketplace_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

CREATE INDEX idx_subcategories_category ON marketplace_subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON marketplace_subcategories(slug);

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES marketplace_subcategories(id) ON DELETE SET NULL,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  price_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed', 'negotiable', 'yearly', 'monthly'
  
  -- Contact Info
  seller_name VARCHAR(100) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  seller_phone VARCHAR(50),
  seller_whatsapp VARCHAR(50),
  seller_type VARCHAR(20) DEFAULT 'individual', -- 'individual', 'dealer', 'agent', 'company'
  
  -- Location
  location_details TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status & Verification
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'sold', 'expired', 'rejected'
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  
  -- Metadata
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_listings_category ON marketplace_listings(category_id);
CREATE INDEX idx_listings_subcategory ON marketplace_listings(subcategory_id);
CREATE INDEX idx_listings_country ON marketplace_listings(country_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_created ON marketplace_listings(created_at DESC);
CREATE INDEX idx_listings_price ON marketplace_listings(price);
CREATE INDEX idx_listings_featured ON marketplace_listings(is_featured);

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
CREATE TABLE marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON marketplace_listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON marketplace_listing_images(is_primary);

-- ============================================
-- LISTING ATTRIBUTES TABLE (Category-specific fields)
-- ============================================
CREATE TABLE marketplace_listing_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  attribute_key VARCHAR(100) NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(listing_id, attribute_key)
);

CREATE INDEX idx_listing_attributes_listing ON marketplace_listing_attributes(listing_id);
CREATE INDEX idx_listing_attributes_key ON marketplace_listing_attributes(attribute_key);

-- ============================================
-- ADMIN ACTIONS TABLE (Audit log)
-- ============================================
CREATE TABLE marketplace_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'featured', 'expired', 'deleted'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_listing ON marketplace_admin_actions(listing_id);
CREATE INDEX idx_admin_actions_admin ON marketplace_admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_type ON marketplace_admin_actions(action_type);

-- ============================================
-- FEATURED PRICING TABLE
-- ============================================
CREATE TABLE marketplace_featured_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES marketplace_categories(id),
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_featured_pricing_category ON marketplace_featured_pricing(category_id);

-- ============================================
-- USER FAVORITES TABLE
-- ============================================
CREATE TABLE marketplace_user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_user_favorites_user ON marketplace_user_favorites(user_id);
CREATE INDEX idx_user_favorites_listing ON marketplace_user_favorites(listing_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_marketplace_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_listings
  SET views_count = views_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON marketplace_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON marketplace_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_user_favorites ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories
CREATE POLICY "Public can view active categories"
  ON marketplace_categories FOR SELECT
  USING (is_active = true);

-- Public read access for active subcategories
CREATE POLICY "Public can view active subcategories"
  ON marketplace_subcategories FOR SELECT
  USING (is_active = true);

-- Public read access for active listings
CREATE POLICY "Public can view active listings"
  ON marketplace_listings FOR SELECT
  USING (status = 'active');

-- Public read access for listing images
CREATE POLICY "Public can view listing images"
  ON marketplace_listing_images FOR SELECT
  USING (true);

-- Public read access for listing attributes
CREATE POLICY "Public can view listing attributes"
  ON marketplace_listing_attributes FOR SELECT
  USING (true);

-- Users can create their own listings
CREATE POLICY "Users can create listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON marketplace_listings FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON marketplace_listings FOR DELETE
  USING (auth.uid() = created_by);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites"
  ON marketplace_user_favorites FOR ALL
  USING (auth.uid() = user_id);
