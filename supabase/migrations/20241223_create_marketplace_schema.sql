-- Marketplace schema: categories, listings, images, favorites, chat

-- ===============================================
-- Categories
-- ===============================================
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- Listings
-- ===============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  condition TEXT NOT NULL DEFAULT 'used', -- new, used, other
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  country_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- draft, active, sold, expired
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  allow_chat BOOLEAN DEFAULT true,
  contact_email TEXT,
  contact_phone TEXT,
  views_count INT NOT NULL DEFAULT 0,
  favorites_count INT NOT NULL DEFAULT 0,
  payment_status TEXT, -- placeholder for future payment integration
  payment_provider TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION marketplace_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marketplace_listings_updated_at
BEFORE UPDATE ON marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION marketplace_set_updated_at();

-- Indexes for listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status_featured_created 
  ON marketplace_listings (status, is_featured, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category 
  ON marketplace_listings (category_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_country 
  ON marketplace_listings (country_id, status, created_at DESC);

-- ===============================================
-- Listing Images
-- ===============================================
CREATE TABLE IF NOT EXISTS marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_images_listing 
  ON marketplace_listing_images (listing_id, sort_order);

-- ===============================================
-- Favorites (Watchlist)
-- ===============================================
CREATE TABLE IF NOT EXISTS marketplace_favorites (
  user_id TEXT NOT NULL,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- ===============================================
-- Chat Threads & Messages
-- ===============================================
CREATE TABLE IF NOT EXISTS marketplace_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_user_id TEXT NOT NULL,
  seller_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_chat_threads_seller 
  ON marketplace_chat_threads (seller_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_chat_threads_buyer 
  ON marketplace_chat_threads (buyer_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS marketplace_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES marketplace_chat_threads(id) ON DELETE CASCADE,
  sender_user_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketplace_chat_messages_thread 
  ON marketplace_chat_messages (thread_id, created_at);

-- ===============================================
-- Row Level Security
-- ===============================================
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_chat_messages ENABLE ROW LEVEL SECURITY;

-- Listings: public can read active listings
CREATE POLICY "Public can read active marketplace listings"
ON marketplace_listings
FOR SELECT
TO public
USING (status = 'active');

-- Listings: owners can manage their listings
CREATE POLICY "Owners can manage their marketplace listings"
ON marketplace_listings
FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Listing images: anyone can read images of active listings
CREATE POLICY "Public can read marketplace listing images"
ON marketplace_listing_images
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings l
    WHERE l.id = listing_id
    AND l.status = 'active'
  )
);

-- Listing images: owners can manage images of their listings
CREATE POLICY "Owners can manage marketplace listing images"
ON marketplace_listing_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings l
    WHERE l.id = listing_id
    AND l.user_id = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_listings l
    WHERE l.id = listing_id
    AND l.user_id = auth.uid()::text
  )
);

-- Favorites: users manage their own favorites
CREATE POLICY "Users can manage their marketplace favorites"
ON marketplace_favorites
FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Chat threads: participants only
CREATE POLICY "Participants can read marketplace chat threads"
ON marketplace_chat_threads
FOR SELECT
TO authenticated
USING (
  buyer_user_id = auth.uid()::text OR seller_user_id = auth.uid()::text
);

CREATE POLICY "Participants can insert marketplace chat threads"
ON marketplace_chat_threads
FOR INSERT
TO authenticated
WITH CHECK (
  buyer_user_id = auth.uid()::text OR seller_user_id = auth.uid()::text
);

-- Chat messages: participants only
CREATE POLICY "Participants can read marketplace chat messages"
ON marketplace_chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM marketplace_chat_threads t
    WHERE t.id = thread_id
    AND (t.buyer_user_id = auth.uid()::text OR t.seller_user_id = auth.uid()::text)
  )
);

CREATE POLICY "Participants can insert marketplace chat messages"
ON marketplace_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_chat_threads t
    WHERE t.id = thread_id
    AND (t.buyer_user_id = auth.uid()::text OR t.seller_user_id = auth.uid()::text)
  )
);

-- ===============================================
-- Storage bucket for marketplace images
-- ===============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for marketplace images
CREATE POLICY "Public read access for marketplace images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marketplace-images');

-- Authenticated users can upload marketplace images
CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace-images');

-- Authenticated users can update marketplace images
CREATE POLICY "Authenticated users can update marketplace images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'marketplace-images');

-- Authenticated users can delete marketplace images
CREATE POLICY "Authenticated users can delete marketplace images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace-images');

-- ===============================================
-- Seed data for categories and sample listings
-- NOTE: user_id values are placeholders; real listings will use Clerk user IDs.
-- ===============================================

-- Basic high-level categories
INSERT INTO marketplace_categories (slug, name, sort_order) VALUES
  ('motors', 'Motors', 1),
  ('property', 'Property', 2),
  ('electronics', 'Electronics', 3),
  ('fashion', 'Fashion & Beauty', 4),
  ('services', 'Services', 5),
  ('jobs', 'Jobs', 6)
ON CONFLICT (slug) DO NOTHING;

-- Grab some category IDs for seeding (safe even if table already has data)
DO $$
DECLARE
  motors_id UUID;
  property_id UUID;
  electronics_id UUID;
  fashion_id UUID;
BEGIN
  SELECT id INTO motors_id FROM marketplace_categories WHERE slug = 'motors';
  SELECT id INTO property_id FROM marketplace_categories WHERE slug = 'property';
  SELECT id INTO electronics_id FROM marketplace_categories WHERE slug = 'electronics';
  SELECT id INTO fashion_id FROM marketplace_categories WHERE slug = 'fashion';

  -- Sample listings (placeholder user_id and countries)
  INSERT INTO marketplace_listings (
    user_id, title, description, category_id, price, currency_code, condition,
    country_name, status, is_featured, allow_chat, contact_email
  ) VALUES
  (
    'SAMPLE_USER_ID',
    'Toyota Corolla 2015 - Clean and Reliable',
    'Well-maintained Toyota Corolla 2015, automatic, full service history. Perfect for city driving.',
    motors_id,
    8500.00,
    'USD',
    'used',
    'United Arab Emirates',
    'active',
    true,
    true,
    'seller1@example.com'
  ),
  (
    'SAMPLE_USER_ID',
    '2 Bedroom Apartment in Kigali City Center',
    'Modern 2 bedroom apartment with great city views, close to shops and public transport.',
    property_id,
    650.00,
    'USD',
    'used',
    'Rwanda',
    'active',
    true,
    true,
    'seller2@example.com'
  ),
  (
    'SAMPLE_USER_ID',
    'iPhone 13 Pro 256GB - Graphite',
    'Lightly used iPhone 13 Pro, 256GB, no scratches, battery health 95%.',
    electronics_id,
    950.00,
    'USD',
    'used',
    'Nigeria',
    'active',
    false,
    true,
    'seller3@example.com'
  ),
  (
    'SAMPLE_USER_ID',
    'Designer Ankara Dress - Custom Made',
    'Beautiful Ankara dress, custom tailored, worn only once for a photoshoot.',
    fashion_id,
    120.00,
    'USD',
    'used',
    'Ghana',
    'active',
    false,
    true,
    'seller4@example.com'
  )
  ON CONFLICT DO NOTHING;
END $$;
