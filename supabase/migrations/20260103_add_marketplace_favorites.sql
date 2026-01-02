-- Create marketplace favorites table
CREATE TABLE IF NOT EXISTS marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON marketplace_favorites(user_id);
CREATE INDEX idx_favorites_listing ON marketplace_favorites(listing_id);
CREATE INDEX idx_favorites_created ON marketplace_favorites(created_at DESC);
